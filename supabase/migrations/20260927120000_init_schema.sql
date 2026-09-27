-- Ekip paneli: temel şema

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Yardımcılar
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiller
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'member' check (role in ('admin', 'member', 'freelancer')),
  job_title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Projeler
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text,
  color text not null default '#3b5bfd',
  status text not null default 'planning' check (
    status in ('planning', 'active', 'development', 'testing', 'on_hold', 'completed', 'archived')
  ),
  start_date date,
  manager_id uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create index project_members_profile_idx on public.project_members (profile_id);

-- ---------------------------------------------------------------------------
-- Müşteriler ve etiketler
-- ---------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  website text,
  owner_id uuid references public.profiles (id) on delete set null,
  status text not null default 'active' check (status in ('lead', 'active', 'inactive')),
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create table public.customer_projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, project_id)
);

create index customer_projects_project_idx on public.customer_projects (project_id);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#71717a',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.customer_tags (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  unique (customer_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Görevler
-- ---------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  start_date date,
  due_date date,
  project_id uuid references public.projects (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  position bigint not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_status_idx on public.tasks (status);
create index tasks_due_idx on public.tasks (due_date);
create index tasks_project_idx on public.tasks (project_id);
create index tasks_customer_idx on public.tasks (customer_id);

create trigger tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create table public.task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (task_id, profile_id)
);

create index task_assignees_profile_idx on public.task_assignees (profile_id);

create table public.task_tags (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  unique (task_id, tag_id)
);

create table public.task_checklists (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger task_comments_updated_at
before update on public.task_comments
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Notlar, abonelikler, hedefler
-- ---------------------------------------------------------------------------

create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  package_name text not null,
  monthly_fee numeric(12, 2) not null default 0 check (monthly_fee >= 0),
  currency text not null default 'TRY',
  start_date date,
  next_renewal_date date,
  status text not null default 'active' check (
    status in ('trial', 'active', 'payment_pending', 'paused', 'cancelled')
  ),
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_customer_idx on public.subscriptions (customer_id);
create index subscriptions_status_idx on public.subscriptions (status);

create trigger subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  target_value numeric(14, 2) not null default 0 check (target_value >= 0),
  current_value numeric(14, 2) not null default 0 check (current_value >= 0),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'cancelled')),
  project_id uuid references public.projects (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger goals_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Dosyalar ve aktiviteler
-- ---------------------------------------------------------------------------

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null unique,
  mime_type text,
  size bigint not null default 0,
  uploaded_by uuid references public.profiles (id) on delete set null,
  entity_type text not null check (entity_type in ('task', 'project', 'customer')),
  entity_id uuid not null,
  created_at timestamptz not null default now()
);

create index attachments_entity_idx on public.attachments (entity_type, entity_id);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activities_created_idx on public.activities (created_at desc);
