-- Kayıt hemen ardından RETURNING ile okunabilsin.
-- Fonksiyonlar aynı komut içindeki yeni satırı göremediği için
-- oluşturan ve yönetici kolonları doğrudan kontrol edilir.

drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects
for select to authenticated
using (
  public.is_admin()
  or created_by = public.current_profile_id()
  or manager_id = public.current_profile_id()
  or public.is_project_member(id, public.current_profile_id())
);

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
for select to authenticated
using (
  public.is_admin()
  or created_by = public.current_profile_id()
  or owner_id = public.current_profile_id()
  or exists (
    select 1 from public.customer_projects cp
    where cp.customer_id = id
      and public.is_project_member(cp.project_id, public.current_profile_id())
  )
);

drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
for select to authenticated
using (
  public.is_admin()
  or created_by = public.current_profile_id()
  or exists (
    select 1 from public.task_assignees ta
    where ta.task_id = id and ta.profile_id = public.current_profile_id()
  )
  or (
    public.current_role() <> 'freelancer'
    and project_id is not null
    and public.is_project_member(project_id, public.current_profile_id())
  )
);
