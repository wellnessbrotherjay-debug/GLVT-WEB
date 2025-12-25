-- Update class cover images to point to local public folder paths
-- This allows the user to simply replace the file in the public folder to update the image

UPDATE public.studio_classes SET cover_image_url = '/classes/core-foundation.png' WHERE slug = 'core-foundation';
UPDATE public.studio_classes SET cover_image_url = '/classes/intro-pilates.png' WHERE slug = 'intro-pilates';
UPDATE public.studio_classes SET cover_image_url = '/classes/glute-activation.png' WHERE slug = 'glute-activation';
UPDATE public.studio_classes SET cover_image_url = '/classes/dynamic-hiit.png' WHERE slug = 'dynamic-hiit';
UPDATE public.studio_classes SET cover_image_url = '/classes/metcon-burn.png' WHERE slug = 'metcon-burn';
UPDATE public.studio_classes SET cover_image_url = '/classes/mobility-flow.png' WHERE slug = 'mobility-flow';

-- Fallback for any others
UPDATE public.studio_classes 
SET cover_image_url = '/classes/default-class.png' 
WHERE cover_image_url LIKE 'http%' OR cover_image_url LIKE '/class-covers%';
