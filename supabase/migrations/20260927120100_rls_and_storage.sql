-- Yetki fonksiyonları, RLS ve storage

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid() and role = 'admin' and is_active = true
  )
$$;

create or replace function public.is_project_member(target_project uuid, target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_project is not null
    and target_profile is not null
    and (
      exists (
        select 1 from public.project_members pm
        where pm.project_id = target_project and pm.profile_id = target_profile
      )
      or exists (
        select 1 from public.projects pr
        where pr.id = target_project and pr.manager_id = target_profile
      )
    )
$$;

create or replace function public.can_access_project(target_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or public.is_project_member(target_project, public.current_profile_id())
$$;

create or replace function public.can_access_task(target_task uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  pid uuid := public.current_profile_id();
  role text := public.current_role();
  proj uuid;
  creator uuid;
begin
  if pid is null or target_task is null then
    return false;
  end if;
  if role = 'admin' then
    return true;
  end if;

  select t.project_id, t.created_by into proj, creator
  from public.tasks t
  where t.id = target_task;

  if not found then
    return false;
  end if;

  if role = 'freelancer' then
    return exists (
      select 1 from public.task_assignees ta
      where ta.task_id = target_task and ta.profile_id = pid
    )
    and (proj is null or public.is_project_member(proj, pid));
  end if;

  if proj is null then
    return creator = pid or exists (
      select 1 from public.task_assignees ta
      where ta.task_id = target_task and ta.profile_id = pid
    );
  end if;

  return public.is_project_member(proj, pid);
end;
$$;

create or replace function public.can_access_customer(target_customer uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  pid uuid := public.current_profile_id();
begin
  if pid is null or target_customer is null then
    return false;
  end if;
  if public.is_admin() then
    return true;
  end if;

  return exists (
    select 1 from public.customers c
    where c.id = target_customer and (c.owner_id = pid or c.created_by = pid)
  )
  or exists (
    select 1 from public.customer_projects cp
    where cp.customer_id = target_customer
      and public.is_project_member(cp.project_id, pid)
  );
end;
$$;

create or replace function public.can_access_entity(entity_type text, entity_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return true;
  end if;
  if entity_type = 'project' then
    return public.can_access_project(entity_id);
  elsif entity_type = 'task' then
    return public.can_access_task(entity_id);
  elsif entity_type = 'customer' then
    return public.can_access_customer(entity_id);
  end if;
  return false;
end;
$$;

create or replace function public.can_write_ops()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('admin', 'member')
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  requested_role text;
begin
  uname := split_part(coalesce(new.email, ''), '@', 1);
  requested_role := coalesce(new.raw_user_meta_data->>'role', 'member');
  if requested_role not in ('admin', 'member', 'freelancer') then
    requested_role := 'member';
  end if;

  insert into public.profiles (auth_user_id, username, full_name, role)
  values (
    new.id,
    uname,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), uname),
    requested_role
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.auth_user_id := old.auth_user_id;
    new.username := old.username;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
before update on public.profiles
for each row execute function public.protect_profile();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.customers enable row level security;
alter table public.customer_projects enable row level security;
alter table public.tags enable row level security;
alter table public.customer_tags enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_tags enable row level security;
alter table public.task_checklists enable row level security;
alter table public.task_comments enable row level security;
alter table public.customer_notes enable row level security;
alter table public.project_notes enable row level security;
alter table public.subscriptions enable row level security;
alter table public.goals enable row level security;
alter table public.attachments enable row level security;
alter table public.activities enable row level security;

create policy profiles_select on public.profiles
for select to authenticated
using (true);

create policy profiles_update on public.profiles
for update to authenticated
using (auth_user_id = auth.uid() or public.is_admin())
with check (auth_user_id = auth.uid() or public.is_admin());

create policy projects_select on public.projects
for select to authenticated
using (public.can_access_project(id));

create policy projects_insert on public.projects
for insert to authenticated
with check (public.can_write_ops() and created_by = public.current_profile_id());

create policy projects_update on public.projects
for update to authenticated
using (public.is_admin() or (public.can_write_ops() and public.can_access_project(id)))
with check (public.is_admin() or (public.can_write_ops() and public.can_access_project(id)));

create policy projects_delete on public.projects
for delete to authenticated
using (public.is_admin() or manager_id = public.current_profile_id());

create policy project_members_select on public.project_members
for select to authenticated
using (public.can_access_project(project_id));

create policy project_members_write on public.project_members
for insert to authenticated
with check (
  public.is_admin()
  or (
    public.can_write_ops()
    and (
      public.is_project_member(project_id, public.current_profile_id())
      or exists (
        select 1 from public.projects pr
        where pr.id = project_id and pr.created_by = public.current_profile_id()
      )
    )
  )
);

create policy project_members_delete on public.project_members
for delete to authenticated
using (
  public.is_admin()
  or (
    public.can_write_ops()
    and public.is_project_member(project_id, public.current_profile_id())
  )
);

create policy customers_select on public.customers
for select to authenticated
using (public.can_access_customer(id));

create policy customers_insert on public.customers
for insert to authenticated
with check (public.can_write_ops() and created_by = public.current_profile_id());

create policy customers_update on public.customers
for update to authenticated
using (public.can_write_ops() and public.can_access_customer(id))
with check (public.can_write_ops() and public.can_access_customer(id));

create policy customers_delete on public.customers
for delete to authenticated
using (public.is_admin() or created_by = public.current_profile_id());

create policy customer_projects_select on public.customer_projects
for select to authenticated
using (public.can_access_customer(customer_id) or public.can_access_project(project_id));

create policy customer_projects_write on public.customer_projects
for insert to authenticated
with check (
  public.can_write_ops()
  and public.can_access_customer(customer_id)
  and public.can_access_project(project_id)
);

create policy customer_projects_delete on public.customer_projects
for delete to authenticated
using (
  public.can_write_ops()
  and public.can_access_customer(customer_id)
  and public.can_access_project(project_id)
);

create policy tags_select on public.tags
for select to authenticated
using (true);

create policy tags_write on public.tags
for insert to authenticated
with check (public.can_write_ops());

create policy tags_update on public.tags
for update to authenticated
using (public.can_write_ops())
with check (public.can_write_ops());

create policy tags_delete on public.tags
for delete to authenticated
using (public.is_admin());

create policy customer_tags_select on public.customer_tags
for select to authenticated
using (public.can_access_customer(customer_id));

create policy customer_tags_write on public.customer_tags
for insert to authenticated
with check (public.can_write_ops() and public.can_access_customer(customer_id));

create policy customer_tags_delete on public.customer_tags
for delete to authenticated
using (public.can_write_ops() and public.can_access_customer(customer_id));

create policy tasks_select on public.tasks
for select to authenticated
using (public.can_access_task(id));

create policy tasks_insert on public.tasks
for insert to authenticated
with check (
  created_by = public.current_profile_id()
  and (
    public.is_admin()
    or (
      public.current_role() = 'member'
      and (project_id is null or public.can_access_project(project_id))
    )
  )
);

create policy tasks_update on public.tasks
for update to authenticated
using (public.can_access_task(id))
with check (public.can_access_task(id));

create policy tasks_delete on public.tasks
for delete to authenticated
using (
  public.is_admin()
  or (public.can_write_ops() and created_by = public.current_profile_id())
);

create policy task_assignees_select on public.task_assignees
for select to authenticated
using (public.can_access_task(task_id));

create policy task_assignees_write on public.task_assignees
for insert to authenticated
with check (public.can_write_ops() and public.can_access_task(task_id));

create policy task_assignees_delete on public.task_assignees
for delete to authenticated
using (public.can_write_ops() and public.can_access_task(task_id));

create policy task_tags_select on public.task_tags
for select to authenticated
using (public.can_access_task(task_id));

create policy task_tags_write on public.task_tags
for insert to authenticated
with check (public.can_write_ops() and public.can_access_task(task_id));

create policy task_tags_delete on public.task_tags
for delete to authenticated
using (public.can_write_ops() and public.can_access_task(task_id));

create policy task_checklists_select on public.task_checklists
for select to authenticated
using (public.can_access_task(task_id));

create policy task_checklists_write on public.task_checklists
for all to authenticated
using (public.can_access_task(task_id))
with check (public.can_access_task(task_id));

create policy task_comments_select on public.task_comments
for select to authenticated
using (public.can_access_task(task_id));

create policy task_comments_insert on public.task_comments
for insert to authenticated
with check (
  public.can_access_task(task_id)
  and profile_id = public.current_profile_id()
);

create policy task_comments_update on public.task_comments
for update to authenticated
using (profile_id = public.current_profile_id() or public.is_admin())
with check (profile_id = public.current_profile_id() or public.is_admin());

create policy task_comments_delete on public.task_comments
for delete to authenticated
using (profile_id = public.current_profile_id() or public.is_admin());

create policy customer_notes_select on public.customer_notes
for select to authenticated
using (public.can_access_customer(customer_id));

create policy customer_notes_insert on public.customer_notes
for insert to authenticated
with check (
  public.can_access_customer(customer_id)
  and profile_id = public.current_profile_id()
  and public.can_write_ops()
);

create policy customer_notes_delete on public.customer_notes
for delete to authenticated
using (profile_id = public.current_profile_id() or public.is_admin());

create policy project_notes_select on public.project_notes
for select to authenticated
using (public.can_access_project(project_id));

create policy project_notes_insert on public.project_notes
for insert to authenticated
with check (
  public.can_access_project(project_id)
  and profile_id = public.current_profile_id()
  and public.can_write_ops()
);

create policy project_notes_delete on public.project_notes
for delete to authenticated
using (profile_id = public.current_profile_id() or public.is_admin());

create policy subscriptions_select on public.subscriptions
for select to authenticated
using (
  public.is_admin()
  or public.can_access_customer(customer_id)
  or (project_id is not null and public.can_access_project(project_id))
);

create policy subscriptions_insert on public.subscriptions
for insert to authenticated
with check (
  public.can_write_ops()
  and created_by = public.current_profile_id()
  and public.can_access_customer(customer_id)
);

create policy subscriptions_update on public.subscriptions
for update to authenticated
using (public.can_write_ops() and (public.is_admin() or public.can_access_customer(customer_id)))
with check (public.can_write_ops() and (public.is_admin() or public.can_access_customer(customer_id)));

create policy subscriptions_delete on public.subscriptions
for delete to authenticated
using (public.is_admin() or created_by = public.current_profile_id());

create policy goals_select on public.goals
for select to authenticated
using (true);

create policy goals_insert on public.goals
for insert to authenticated
with check (public.can_write_ops() and created_by = public.current_profile_id());

create policy goals_update on public.goals
for update to authenticated
using (public.can_write_ops())
with check (public.can_write_ops());

create policy goals_delete on public.goals
for delete to authenticated
using (public.can_write_ops());

create policy attachments_select on public.attachments
for select to authenticated
using (public.can_access_entity(entity_type, entity_id));

create policy attachments_insert on public.attachments
for insert to authenticated
with check (
  uploaded_by = public.current_profile_id()
  and public.can_access_entity(entity_type, entity_id)
  and (
    public.can_write_ops()
    or (entity_type = 'task' and public.can_access_task(entity_id))
  )
);

create policy attachments_delete on public.attachments
for delete to authenticated
using (public.is_admin() or uploaded_by = public.current_profile_id());

create policy activities_select on public.activities
for select to authenticated
using (true);

create policy activities_insert on public.activities
for insert to authenticated
with check (profile_id = public.current_profile_id());

grant usage on schema public to authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy avatars_public_read on storage.objects
for select to public
using (bucket_id = 'avatars');

create policy avatars_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_profile_id()::text
  )
);

create policy avatars_update on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_profile_id()::text
  )
);

create policy avatars_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_profile_id()::text
  )
);

create policy attachments_storage_select on storage.objects
for select to authenticated
using (
  bucket_id = 'attachments'
  and public.can_access_entity(
    (storage.foldername(name))[1],
    ((storage.foldername(name))[2])::uuid
  )
);

create policy attachments_storage_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'attachments'
  and public.can_access_entity(
    (storage.foldername(name))[1],
    ((storage.foldername(name))[2])::uuid
  )
);

create policy attachments_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'attachments'
  and (
    public.is_admin()
    or public.can_access_entity(
      (storage.foldername(name))[1],
      ((storage.foldername(name))[2])::uuid
    )
  )
);
