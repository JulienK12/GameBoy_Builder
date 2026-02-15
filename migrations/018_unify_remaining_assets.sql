-- Migration: Unify remaining assets (Screens, Lenses) to use /assets prefix
-- This ensures all static assets are served uniformly by the backend.

-- 1. Update screen_variants
-- Prepend /assets if not already present
UPDATE screen_variants
SET image_url = '/assets' || image_url
WHERE image_url NOT LIKE '/assets%';

-- 2. Update lens_variants
-- Prepend /assets if not already present
UPDATE lens_variants
SET image_url = '/assets' || image_url
WHERE image_url NOT LIKE '/assets%';

-- 3. Safety check for button_variants
-- Ensure no buttons were missed in previous migrations
UPDATE button_variants
SET image_url = '/assets' || image_url
WHERE image_url NOT LIKE '/assets%';
