-- ScopeCheck.ai — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

-- Waitlist (Phase 0)
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('investor', 'founder')),
  created_at timestamptz default now()
);

-- Investors
create table if not exists investors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  handle text not null unique,
  name text not null,
  email text not null,
  firm text,
  location text,
  bio text,
  ticket_min integer,
  ticket_max integer,
  stages text[] default '{}',
  sectors text[] default '{}',
  geographies text[] default '{}',
  wont_invest_in text,
  how_we_work text,
  rejection_template text default 'Thank you for applying. After reviewing your application, we don''t think it''s the right fit for us at this stage. We wish you the best with your raise.',
  custom_fields jsonb default '[]',
  status text default 'active' check (status in ('active', 'paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Founders
create table if not exists founders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  handle text not null unique,
  name text not null,
  email text not null,
  company_name text not null,
  one_liner text,
  stage text,
  sector text,
  geography text,
  round_size integer,
  committed integer default 0,
  available integer,
  traction_summary text,
  deck_url text,
  data_room_url text,
  intro_video_url text,
  what_we_want text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  founder_id uuid references founders(id),
  status text default 'new' check (status in ('new', 'considering', 'passed', 'closed')),
  custom_answers jsonb default '{}',
  investor_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table waitlist enable row level security;
alter table investors enable row level security;
alter table founders enable row level security;
alter table applications enable row level security;

-- Policies: investors can read all investor profiles (public)
create policy "Investor profiles are public"
  on investors for select using (true);

-- Policies: founders can read all founder profiles (public)
create policy "Founder profiles are public"
  on founders for select using (true);

-- Policies: users can update their own profile
create policy "Users can update own investor profile"
  on investors for update using (auth.uid() = user_id);

create policy "Users can update own founder profile"
  on founders for update using (auth.uid() = user_id);

-- Policies: investors can see applications to them
create policy "Investors can view their applications"
  on applications for select
  using (investor_id in (select id from investors where user_id = auth.uid()));

-- Policies: anyone can insert an application (founders apply)
create policy "Anyone can submit an application"
  on applications for insert with check (true);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger investors_updated_at before update on investors
  for each row execute function update_updated_at();

create trigger founders_updated_at before update on founders
  for each row execute function update_updated_at();

create trigger applications_updated_at before update on applications
  for each row execute function update_updated_at();

-- INSERT policies (required for onboarding forms to save data)
create policy "Users can insert their own investor profile"
  on investors for insert with check (auth.uid() = user_id);

create policy "Users can insert their own founder profile"
  on founders for insert with check (auth.uid() = user_id);

create policy "Anyone can insert to waitlist"
  on waitlist for insert with check (true);
