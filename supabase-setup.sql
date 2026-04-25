-- DXSure CRM Supabase setup
-- Run this script in the Supabase SQL editor on a fresh project or as a reconciliation script.

create extension if not exists "uuid-ossp";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text not null,
  phone text,
  department text,
  role text default 'employee' check (role in ('admin', 'employee')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  company text,
  status text default 'active',
  source text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  contact_name text not null,
  contact_email text,
  contact_phone text,
  company text,
  status text default 'new',
  priority text default 'medium',
  source text,
  value numeric,
  expected_close_date date,
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tickets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  priority text default 'medium',
  status text default 'pending',
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date date,
  client_id uuid references public.clients(id) on delete cascade,
  user_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ticket_comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.tickets(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  status text default 'scheduled',
  scheduled_at timestamptz not null,
  notes text,
  client_id uuid references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.finance_entries (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  amount numeric not null,
  entry_date date not null,
  payment_method text,
  description text,
  category text,
  client_id uuid references public.clients(id) on delete set null,
  reference text,
  created_by uuid references public.profiles(id) on delete set null,
  receipt_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.day_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  plan_date date not null,
  tasks jsonb not null default '[]',
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text,
  created_at timestamptz default now()
);

alter table public.tickets
  add column if not exists updated_at timestamptz default now();

alter table public.tickets
  alter column status set default 'pending';

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'employee' end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(excluded.name, public.profiles.name),
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

drop trigger if exists set_tickets_updated_at on public.tickets;
create trigger set_tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

drop trigger if exists set_day_plans_updated_at on public.day_plans;
create trigger set_day_plans_updated_at
  before update on public.day_plans
  for each row execute function public.set_updated_at();

drop trigger if exists set_finance_entries_updated_at on public.finance_entries;
create trigger set_finance_entries_updated_at
  before update on public.finance_entries
  for each row execute function public.set_updated_at();

drop trigger if exists set_vendors_updated_at on public.vendors;
create trigger set_vendors_updated_at
  before update on public.vendors
  for each row execute function public.set_updated_at();

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_department on public.profiles(department);
create index if not exists idx_clients_status on public.clients(status);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_assigned_to on public.leads(assigned_to);
create index if not exists idx_tickets_status on public.tickets(status);
create index if not exists idx_tickets_assigned_to on public.tickets(assigned_to);
create index if not exists idx_follow_ups_status on public.follow_ups(status);
create index if not exists idx_follow_ups_user_id on public.follow_ups(user_id);
create index if not exists idx_follow_ups_scheduled_at on public.follow_ups(scheduled_at);
create index if not exists idx_finance_entries_type on public.finance_entries(type);
create index if not exists idx_finance_entries_created_by on public.finance_entries(created_by);
create index if not exists idx_finance_entries_entry_date on public.finance_entries(entry_date);
create index if not exists idx_day_plans_user_id on public.day_plans(user_id);
create index if not exists idx_day_plans_plan_date on public.day_plans(plan_date);
create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at);

-- Frontend-only development setup.
-- Replace this with proper RLS policies before production deployment.
alter table public.profiles disable row level security;
alter table public.clients disable row level security;
alter table public.leads disable row level security;
alter table public.tickets disable row level security;
alter table public.ticket_comments disable row level security;
alter table public.follow_ups disable row level security;
alter table public.finance_entries disable row level security;
alter table public.day_plans disable row level security;
alter table public.vendors disable row level security;
alter table public.activity_logs disable row level security;
