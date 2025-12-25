-- Seed booking system with initial data
-- Run this AFTER running 001_create_booking_tables.sql

-- ============================================================================
-- SEED COACHES
-- ============================================================================
INSERT INTO public.coaches (name, specialty, bio, certifications, image_url) VALUES
('Coach Mike Chen', 'Glute Activation & Power', '10+ years specializing in lower body biomechanics and glute development. Former Olympic weightlifting coach.', 
 '["NASM-CPT", "CSCS", "Olympic Lifting L2"]'::jsonb, '/coaches/mike-chen.png'),

('Sarah Liu', 'Core Stability & Pilates', 'Pilates master instructor with expertise in core rehabilitation and functional movement patterns.',
 '["Pilates Master", "Physical Therapy", "Yoga RYT-500"]'::jsonb, '/coaches/sarah-liu.png'),

('Coach Alex Wong', 'Functional Core Training', 'Sports performance specialist focusing on core strength for athletic performance and injury prevention.',
 '["CSCS", "FMS", "TRX Master"]'::jsonb, '/coaches/alex-wong.png'),

('Emma Park', 'Glute Sculpting', 'Body composition expert specializing in glute hypertrophy and aesthetic development.',
 '["NASM-CPT", "Nutrition Coach", "Bodybuilding Specialist"]'::jsonb, '/coaches/emma-park.png'),

('Coach Danny Kim', 'High-Intensity Core', 'Former MMA fighter bringing explosive core training techniques to maximize power and endurance.',
 '["CrossFit L2", "Kettlebell Master", "MMA Conditioning"]'::jsonb, '/coaches/danny-kim.png'),

('Jessica Tan', 'Lower Body Power', 'Powerlifting champion with focus on glute and hamstring strength development.',
 '["USAPL Coach", "Starting Strength", "Biomechanics Specialist"]'::jsonb, '/coaches/jessica-tan.png');


-- ============================================================================
-- SEED STUDIO CLASSES
-- ============================================================================
INSERT INTO public.studio_classes (slug, name, description, duration_minutes, intensity, max_spots, cover_image_url, focus_area) VALUES
('glute-activation', 'Glute Activation', 'Wake up dormant glutes with targeted activation exercises. Perfect for building mind-muscle connection and preparing for heavier lifts.', 
 60, 'Medium', 12, 'https://i.ibb.co.com/jPttMqX2/glvt-class-1.png', 'Glutes'),

('core-foundation', 'Core Foundation', 'Build a rock-solid core foundation with controlled movements. Focus on stability, breathing, and proper engagement.',
 75, 'Low', 15, 'https://i.ibb.co.com/jPttMqX2/glvt-class-1.png', 'Core'),

('pilates-core', 'Pilates Core', 'Classical pilates movements targeting deep core muscles. Improve posture, stability, and body awareness.',
 60, 'Medium', 12, 'https://i.ibb.co.com/jPttMqX2/glvt-class-1.png', 'Core'),

('glute-sculpt', 'Glute Sculpt', 'Hypertrophy-focused glute training with progressive overload. Build rounder, stronger glutes.',
 50, 'High', 10, 'https://i.ibb.co.com/jPttMqX2/glvt-class-1.png', 'Glutes'),

('abs-blast', 'Abs Blast', 'High-intensity core workout combining static holds and dynamic movements. Get shredded abs.',
 45, 'High', 15, 'https://i.ibb.co.com/jPttMqX2/glvt-class-1.png', 'Core'),

('lower-body-power', 'Lower Body Power', 'Build explosive glute and hamstring power with compound lifts. Deadlifts, hip thrusts, and more.',
 60, 'High', 10, 'https://i.ibb.co.com/jPttMqX2/glvt-class-1.png', 'Glutes');

-- ============================================================================
-- SEED CLASS SCHEDULES (7 days starting from today)
-- ============================================================================

-- Helper function to generate schedules
DO $$
DECLARE
    coach_mike UUID;
    coach_sarah UUID;
    coach_alex UUID;
    coach_emma UUID;
    coach_danny UUID;
    coach_jessica UUID;
    
    class_glute_activation UUID;
    class_core_foundation UUID;
    class_pilates UUID;
    class_glute_sculpt UUID;
    class_abs_blast UUID;
    class_lower_body UUID;
    
    day_offset INTEGER;
    schedule_date DATE;
BEGIN
    -- Get coach IDs
    SELECT id INTO coach_mike FROM public.coaches WHERE name = 'Coach Mike Chen';
    SELECT id INTO coach_sarah FROM public.coaches WHERE name = 'Sarah Liu';
    SELECT id INTO coach_alex FROM public.coaches WHERE name = 'Coach Alex Wong';
    SELECT id INTO coach_emma FROM public.coaches WHERE name = 'Emma Park';
    SELECT id INTO coach_danny FROM public.coaches WHERE name = 'Coach Danny Kim';
    SELECT id INTO coach_jessica FROM public.coaches WHERE name = 'Jessica Tan';
    
    -- Get class IDs
    SELECT id INTO class_glute_activation FROM public.studio_classes WHERE slug = 'glute-activation';
    SELECT id INTO class_core_foundation FROM public.studio_classes WHERE slug = 'core-foundation';
    SELECT id INTO class_pilates FROM public.studio_classes WHERE slug = 'pilates-core';
    SELECT id INTO class_glute_sculpt FROM public.studio_classes WHERE slug = 'glute-sculpt';
    SELECT id INTO class_abs_blast FROM public.studio_classes WHERE slug = 'abs-blast';
    SELECT id INTO class_lower_body FROM public.studio_classes WHERE slug = 'lower-body-power';
    
    -- Generate 7 days of schedules
    FOR day_offset IN 0..6 LOOP
        schedule_date := CURRENT_DATE + day_offset;
        
        -- Morning classes (6am, 8am, 10am)
        INSERT INTO public.class_schedules (class_id, coach_id, scheduled_time, location, available_spots) VALUES
        (class_core_foundation, coach_sarah, schedule_date + TIME '06:00:00', 'Studio B', 15),
        (class_glute_activation, coach_mike, schedule_date + TIME '08:00:00', 'Studio A', 12),
        (class_pilates, coach_sarah, schedule_date + TIME '10:00:00', 'Studio A', 12);
        
        -- Evening classes (5pm, 6:30pm, 8pm)
        INSERT INTO public.class_schedules (class_id, coach_id, scheduled_time, location, available_spots) VALUES
        (class_lower_body, coach_jessica, schedule_date + TIME '17:00:00', 'Studio A', 10),
        (class_abs_blast, coach_danny, schedule_date + TIME '18:30:00', 'Studio B', 15),
        (class_glute_sculpt, coach_emma, schedule_date + TIME '20:00:00', 'Studio A', 10);
    END LOOP;
END $$;
