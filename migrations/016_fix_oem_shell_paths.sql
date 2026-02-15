-- ========================================
-- 🐛 FIX - OEM SHELL IMAGE PATHS
-- ========================================

-- Update image_url for OEM shell variants to include /assets prefix
UPDATE shell_variants 
SET image_url = '/assets' || image_url 
WHERE id LIKE 'VAR_SHELL_GBC_OEM_%' 
AND image_url LIKE '/images/shells/%';
