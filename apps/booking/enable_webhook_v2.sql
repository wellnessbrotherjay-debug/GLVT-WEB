-- ENABLE WEBHOOK V2 (Using pg_net)
-- Run this in Supabase SQL Editor

-- 1. Enable the required extension
create extension if not exists pg_net with schema extensions;

-- 2. Create the Trigger Function
create or replace function public.trigger_signup_edge_function()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://bwndbccgzjdgtcyornwn.supabase.co/functions/v1/process_new_signups',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bmRiY2NnempkZ3RjeW9ybnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzk2MDYsImV4cCI6MjA3NTk1NTYwNn0.KBhWWrstu0_NTOJ38sQQNTqhhIno5iEQC-kFXd34ao4"}'::jsonb,
    body := jsonb_build_object('record', new)
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3. Create the Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.trigger_signup_edge_function();
