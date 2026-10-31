-- Seed data: who is the admin. Run this AFTER schema.sql, in the Supabase SQL editor.
-- CHANGE the email below to the admin email you created in Supabase Authentication.
insert into public.admins (email) values ('het.patel@mechvactech.com')
  on conflict (email) do nothing;

-- Het Patel's page itself is created from the admin page: sign in, then press
-- "Create Het Patel's page from the built-in content".
