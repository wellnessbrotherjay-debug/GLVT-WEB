-- ENABLE WEBHOOK FOR EDGE FUNCTION
-- Run this in Supabase SQL Editor AFTER deploying the function

-- 1. Create the Database Webhook
-- Replace [YOUR_FUNCTION_URL] with the actual URL from `supabase functions deploy` output
-- Usually: https://[project-ref].supabase.co/functions/v1/process_new_signups

create trigger "on_auth_user_created"
  after insert on auth.users
  for each row
  execute function supabase_functions.http_request(
    'https://bwndbccgzjdgtcyornwn.supabase.co/functions/v1/process_new_signups',
    'POST',
    '{"Content-Type":"application/json", "Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bmRiY2NnempkZ3RjeW9ybnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzk2MDYsImV4cCI6MjA3NTk1NTYwNn0.KBhWWrstu0_NTOJ38sQQNTqhhIno5iEQC-kFXd34ao4"}'
  );
