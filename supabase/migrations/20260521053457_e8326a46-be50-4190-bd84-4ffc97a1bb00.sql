
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Profiles updatable by owner" on public.profiles for update using (auth.uid() = id);
create policy "Profiles insert by owner" on public.profiles for insert with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique(user_id, role)
);
alter table public.user_roles enable row level security;
create policy "Users can view own roles" on public.user_roles for select using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- Sources
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.sources enable row level security;
create policy "Sources public read" on public.sources for select using (true);
create policy "Sources admin manage" on public.sources for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Jobs / Notifications
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  source_id uuid references public.sources(id) on delete set null,
  category text not null,
  eligibility text,
  description text,
  apply_url text not null,
  last_date date,
  posted_date date not null default current_date,
  final_year_eligible boolean not null default false,
  trending boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.jobs enable row level security;
create policy "Jobs public read" on public.jobs for select using (true);
create policy "Jobs admin manage" on public.jobs for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create index on public.jobs (posted_date desc);
create index on public.jobs (category);

-- Bookmarks
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, job_id)
);
alter table public.bookmarks enable row level security;
create policy "Bookmarks owner select" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Bookmarks owner insert" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Bookmarks owner delete" on public.bookmarks for delete using (auth.uid() = user_id);

-- Email subscriptions
create table public.email_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  categories text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.email_subscriptions enable row level security;
create policy "Email subs public insert" on public.email_subscriptions for insert with check (true);
create policy "Email subs owner select" on public.email_subscriptions for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Email subs owner update" on public.email_subscriptions for update using (auth.uid() = user_id);

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
