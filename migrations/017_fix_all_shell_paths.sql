-- Fix all shell image paths to include /assets prefix
-- This ensures they are correctly served by the backend static file handler
-- which is mounted at /assets

UPDATE shell_variants 
SET image_url = '/assets' || image_url 
WHERE image_url LIKE '/images/shells/%' 
AND image_url NOT LIKE '/assets%';
