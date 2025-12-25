-- Create booking system tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- COACHES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    bio TEXT NOT NULL,
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDIO CLASSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.studio_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    intensity TEXT NOT NULL CHECK (intensity IN ('Low', 'Medium', 'High')),
    max_spots INTEGER NOT NULL DEFAULT 12,
    cover_image_url TEXT NOT NULL,
    focus_area TEXT NOT NULL CHECK (focus_area IN ('Core', 'Glutes', 'Full Body')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CLASS SCHEDULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.studio_classes(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    available_spots INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CLASS BOOKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.class_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES public.class_schedules(id) ON DELETE CASCADE,
    booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent double booking
    UNIQUE(user_id, schedule_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_class_schedules_time ON public.class_schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_class_schedules_status ON public.class_schedules(status);
CREATE INDEX IF NOT EXISTS idx_class_bookings_user ON public.class_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_schedule ON public.class_bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_status ON public.class_bookings(booking_status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;

-- Coaches: Public read
CREATE POLICY "Coaches are viewable by everyone" ON public.coaches
    FOR SELECT USING (true);

-- Studio Classes: Public read
CREATE POLICY "Classes are viewable by everyone" ON public.studio_classes
    FOR SELECT USING (true);

-- Class Schedules: Public read
CREATE POLICY "Schedules are viewable by everyone" ON public.class_schedules
    FOR SELECT USING (true);

-- Class Bookings: Users can view their own bookings
CREATE POLICY "Users can view their own bookings" ON public.class_bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Class Bookings: Users can create their own bookings
CREATE POLICY "Users can create their own bookings" ON public.class_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Class Bookings: Users can update their own bookings
CREATE POLICY "Users can update their own bookings" ON public.class_bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studio_classes_updated_at BEFORE UPDATE ON public.studio_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_schedules_updated_at BEFORE UPDATE ON public.class_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_bookings_updated_at BEFORE UPDATE ON public.class_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
