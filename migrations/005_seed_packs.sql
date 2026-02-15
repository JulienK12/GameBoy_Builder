-- ========================================
-- 📦 SEED DATA - PACKS
-- ========================================
-- Chaque pack référence des variant IDs existants dans 002_seed_data.sql.
-- Budget  : Hispeedido (coque pas chère) + écran drop-in standard + vitre standard
-- Performance : FunnyPlaying Laminated (meilleur écran) + coque FP assortie + vitre large
-- Purist  : Coque OEM originale + écran OEM + pas de vitre (déjà incluse)

INSERT INTO packs (id, name, description, image_url, shell_variant_id, screen_variant_id, lens_variant_id, sort_order) VALUES
(
    'PACK_BUDGET',
    'Budget Gamer',
    'Une configuration économique avec un écran IPS drop-in et une coque Hispeedido. Idéal pour découvrir le modding sans se ruiner.',
    NULL,
    'VAR_SHELL_GBC_HI_L_SAPPHIRE_BLUE',
    'VAR_SCR_GBC_HI_245L_BLACK',
    'VAR_LENS_GBC_STD_BLACK',
    1
),
(
    'PACK_PERFORMANCE',
    'Performance Build',
    'Le meilleur écran laminé FunnyPlaying Retro Pixel 2.0 avec une coque FunnyPlaying assortie. L''expérience visuelle ultime.',
    NULL,
    'VAR_SHELL_GBC_FP_ATOMIC_PURPLE',
    'VAR_SCR_GBC_FP_RP20_BLACK',
    NULL,
    2
),
(
    'PACK_PURIST',
    'Purist Build',
    'Pour les puristes : coque OEM d''origine avec un écran IPS standard drop-in. Le charme rétro avec un écran moderne.',
    NULL,
    'VAR_SHELL_GBC_OEM_ATOMIC_PURPLE',
    'VAR_SCR_GBC_HI_245L_BLACK',
    'VAR_LENS_GBC_STD_BLACK',
    3
)
ON CONFLICT (id) DO NOTHING;
