-- Create gym_profiles table and security policies
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.gym_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    gender TEXT,
    date_of_birth DATE,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    waiver_signed BOOLEAN DEFAULT FALSE,
    waiver_signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.gym_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create access policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.gym_profiles;
CREATE POLICY "Users can view their own profile" ON public.gym_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.gym_profiles;
CREATE POLICY "Users can update their own profile" ON public.gym_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.gym_profiles;
CREATE POLICY "Users can insert their own profile" ON public.gym_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create a function to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.gym_profiles (id)
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
