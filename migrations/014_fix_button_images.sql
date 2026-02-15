-- ========================================
-- 🐛 FIX - BUTTON IMAGE PATHS
-- ========================================

-- Correction des chemins d'images (extension .png -> .jpg et noms corrects)

-- CGS RED
UPDATE button_variants SET image_url = '/assets/images/buttons/VAR_BTN_GBC_CGS_RED.jpg' WHERE id LIKE 'VAR_BUT_GBC_CGS_RED_%';

-- CGS BLUE
UPDATE button_variants SET image_url = '/assets/images/buttons/VAR_BTN_GBC_CGS_BLUE.jpg' WHERE id LIKE 'VAR_BUT_GBC_CGS_BLUE_%';

-- CGS OTHERS (Adding new variants if needed, but for now fixing existing ones)
-- Based on file list, we have many more variants in assets than in DB (e.g. CLEAR_GREEN, YELLOW, etc.)
-- But the user asked to fix displayed images.
-- Let's also fix the IDs if they were wrong, but IDs are used in code.
-- The issue was specifically "Les images des boutons ne s'affiche pas".

-- Ensure we update the ones we know are broken.
