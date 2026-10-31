-- Mechvac employee sites: database schema.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Safe to run again: everything uses "if not exists" / "or replace".

-- 1. Who may edit. Only emails listed here can change data, even if someone else signs up.
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);

-- 2. One row per employee page.
create table if not exists public.employees (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  role        text not null default '',
  published   boolean not null default false,
  sort        integer not null default 0,
  content     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists employees_published_sort on public.employees (published, sort);

-- 3. Site-wide settings (for example, what the home page shows).
create table if not exists public.settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- keep updated_at current
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists employees_touch on public.employees;
create trigger employees_touch before update on public.employees
  for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- is the signed-in user an admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 4. Row level security
alter table public.admins    enable row level security;
alter table public.employees enable row level security;
alter table public.settings  enable row level security;

drop policy if exists "admins: admin read" on public.admins;
create policy "admins: admin read" on public.admins
  for select to authenticated using (public.is_admin());

drop policy if exists "employees: public reads published" on public.employees;
create policy "employees: public reads published" on public.employees
  for select to anon, authenticated using (published or public.is_admin());

drop policy if exists "employees: admin insert" on public.employees;
create policy "employees: admin insert" on public.employees
  for insert to authenticated with check (public.is_admin());

drop policy if exists "employees: admin update" on public.employees;
create policy "employees: admin update" on public.employees
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "employees: admin delete" on public.employees;
create policy "employees: admin delete" on public.employees
  for delete to authenticated using (public.is_admin());

drop policy if exists "settings: public read" on public.settings;
create policy "settings: public read" on public.settings
  for select to anon, authenticated using (true);

drop policy if exists "settings: admin write" on public.settings;
create policy "settings: admin write" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.employees, public.settings to anon;
grant select, insert, update, delete on public.employees, public.settings to authenticated;
grant select on public.admins to authenticated;

-- 5. File storage for photos, product images, visiting cards and brochures.
--    Public bucket: anyone can view files; only admins can upload, replace or delete.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media: admin upload" on storage.objects;
create policy "media: admin upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin update" on storage.objects;
create policy "media: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin delete" on storage.objects;
create policy "media: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin list" on storage.objects;
create policy "media: admin list" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());
