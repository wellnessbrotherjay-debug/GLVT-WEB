-- FIX RLS POLICIES FOR GYM_PROFILES
-- Run this in the Supabase SQL Editor to resolve "Database updated error"

-- 1. Reset Policies for clean slate
DROP POLICY IF EXISTS "Users can view their own profile" ON public.gym_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.gym_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.gym_profiles;

-- 2. Create Permissive Policies
-- Allow SELECT for own profile
CREATE POLICY "Users can view their own profile" ON public.gym_profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow UPDATE for own profile
CREATE POLICY "Users can update their own profile" ON public.gym_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow INSERT for own profile (Critical for upsert if row missing)
CREATE POLICY "Users can insert their own profile" ON public.gym_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Verify function security
-- Ensure the trigger function is SECURITY DEFINER to bypass RLS during trigger execution
ALTER FUNCTION public.handle_new_user SECURITY DEFINER;
