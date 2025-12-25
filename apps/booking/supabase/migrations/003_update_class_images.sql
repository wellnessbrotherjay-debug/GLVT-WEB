-- Update all class cover images to use the test image
-- Run this in Supabase SQL Editor to update existing records

UPDATE public.studio_classes 
SET cover_image_url = '/glvt-launch-hero.jpg';
