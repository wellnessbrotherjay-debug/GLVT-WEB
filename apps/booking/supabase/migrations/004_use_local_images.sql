-- Update class cover images to point to local public folder paths
-- This allows the user to simply replace the file in the public folder to update the image

UPDATE public.studio_classes SET cover_image_url = '/class-covers/core-foundation.png' WHERE slug = 'core-foundation';
UPDATE public.studio_classes SET cover_image_url = '/class-covers/pilates-core.png' WHERE slug = 'pilates-core'; -- Note: slug was misleading in 004, assuming standard slugs
-- Wait, 004 had 'intro-pilates' but seed says 'pilates-core'. I must use SEED slugs.
-- Seed slugs: glute-activation, core-foundation, pilates-core, glute-sculpt, abs-blast, lower-body-power

UPDATE public.studio_classes SET cover_image_url = '/class-covers/glute-activation.png' WHERE slug = 'glute-activation';
UPDATE public.studio_classes SET cover_image_url = '/class-covers/core-foundation.png' WHERE slug = 'core-foundation';
UPDATE public.studio_classes SET cover_image_url = '/class-covers/pilates-core.png' WHERE slug = 'pilates-core';
UPDATE public.studio_classes SET cover_image_url = '/class-covers/glute-sculpt.png' WHERE slug = 'glute-sculpt';
UPDATE public.studio_classes SET cover_image_url = '/class-covers/abs-blast.png' WHERE slug = 'abs-blast';
UPDATE public.studio_classes SET cover_image_url = '/class-covers/lower-body-power.png' WHERE slug = 'lower-body-power';

-- Fallback for any others
UPDATE public.studio_classes 
SET cover_image_url = '/class-covers/glute-activation.png' 
WHERE cover_image_url LIKE 'http%' OR cover_image_url LIKE '/class-covers%' AND slug NOT IN ('glute-activation', 'core-foundation', 'pilates-core', 'glute-sculpt', 'abs-blast', 'lower-body-power');
