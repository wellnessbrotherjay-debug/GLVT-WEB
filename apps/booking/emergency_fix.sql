-- EMERGENCY FIX
-- Run this in Supabase SQL Editor to unblock "Create Account" and "Guest Login"

-- 1. DROP THE BLOCKING TRIGGER
-- The trigger is causing "Database error updating user". We don't need it because
-- the App handles profile creation in the Onboarding screen.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. ENSURE RLS ALLOWS INSERT
-- Since the trigger is gone, the App must be allowed to INSERT the profile row.
ALTER TABLE public.gym_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.gym_profiles;
CREATE POLICY "Users can insert their own profile" ON public.gym_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.gym_profiles;
CREATE POLICY "Users can update their own profile" ON public.gym_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.gym_profiles;
CREATE POLICY "Users can view their own profile" ON public.gym_profiles
    FOR SELECT USING (auth.uid() = id);
