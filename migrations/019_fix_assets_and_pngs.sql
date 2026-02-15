-- Migration: Fix PNG extensions for specific shells and retry asset path unification

-- 1. Fix PNG extensions for Atomic Purple and Kiwi shells
UPDATE shell_variants
SET image_url = REPLACE(image_url, '.jpg', '.png')
WHERE (image_url LIKE '%VAR_SHELL_GBC_OEM_ATOMIC_PURPLE%' OR image_url LIKE '%VAR_SHELL_GBC_OEM_KIWI%')
  AND image_url LIKE '%.jpg';

-- 2. Retry unification for screen_variants (some might have been missed or format unexpected)
-- Force update if it doesn't start with /assets
UPDATE screen_variants
SET image_url = '/assets' || image_url
WHERE image_url NOT LIKE '/assets%';

-- 3. Retry unification for lens_variants
UPDATE lens_variants
SET image_url = '/assets' || image_url
WHERE image_url NOT LIKE '/assets%';

-- 4. Retry unification for button_variants
UPDATE button_variants
SET image_url = '/assets' || image_url
WHERE image_url NOT LIKE '/assets%';

-- 5. Retry unification for shell_variants (just in case)
UPDATE shell_variants
SET image_url = '/assets' || image_url
WHERE image_url NOT LIKE '/assets%';
