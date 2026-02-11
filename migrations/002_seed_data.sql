-- ========================================
-- 🐚 SEED DATA - SHELLS
-- ========================================

INSERT INTO shells (id, handled_model, brand, name, price, mold) VALUES
('SHELL_GBC_OEM', 'Gameboy Color', 'OEM', 'Original Shell (Used)', 20.0, 'OemStandard'),
('SHELL_GBC_FP', 'Gameboy Color', 'FunnyPlaying', 'FunnyPlaying RetroPixel Laminated', 20.0, 'LaminatedReady'),
('SHELL_GBC_HI_L', 'Gameboy Color', 'Hispeedido', 'Hispeedido Aftermarket Laminated', 10.0, 'LaminatedReady'),
('SHELL_GBC_CGS_L', 'Gameboy Color', 'CloudGameStore', 'CGS High Quality Shell Laminated', 20.0, 'LaminatedReady'),
('SHELL_GBC_CGS', 'Gameboy Color', 'CloudGameStore', 'CGS High Quality Shell', 20.0, 'IpsReady'),
('SHELL_GBC_EXR', 'Gameboy Color', 'ExtremeRate', 'eXtremeRate Premium Shell', 35.0, 'IpsReady'),
('SHELL_GBC_HI', 'Gameboy Color', 'Hispeedido', 'Hispeedido Aftermarket', 10.0, 'IpsReady')
ON CONFLICT (id) DO NOTHING;

INSERT INTO shell_variants (id, shell_id, name, supplement, color_hex, image_url, is_transparent) VALUES
-- OEM Shells (no images)
('VAR_SHELL_GBC_OEM_GRAPE', 'SHELL_GBC_OEM', 'Grape (Violet)', 0.0, '#6B4C8A', '', FALSE),
('VAR_SHELL_GBC_OEM_TEAL', 'SHELL_GBC_OEM', 'Teal (Turquoise)', 0.0, '#00A89D', '', FALSE),
('VAR_SHELL_GBC_OEM_BERRY', 'SHELL_GBC_OEM', 'Berry (Rose/Rouge)', 0.0, '#C8385A', '', FALSE),
('VAR_SHELL_GBC_OEM_DANDELION', 'SHELL_GBC_OEM', 'Dandelion (Jaune)', 0.0, '#F5D800', '', FALSE),
('VAR_SHELL_GBC_OEM_KIWI', 'SHELL_GBC_OEM', 'Kiwi (Vert)', 0.0, '#8EC740', '', FALSE),
('VAR_SHELL_GBC_OEM_ATOMIC_PURPLE', 'SHELL_GBC_OEM', 'Atomic Purple', 0.0, '#7B68A6', '', TRUE),
('VAR_SHELL_GBC_OEM_CLEAR', 'SHELL_GBC_OEM', 'Clear', 0.0, '#FFFFFF', '', TRUE),
-- FunnyPlaying Shells
('VAR_SHELL_GBC_FP_CLEAR_GREEN', 'SHELL_GBC_FP', 'Clear Green', 0.0, '#7CB342', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_GREEN.jpg', TRUE),
('VAR_SHELL_GBC_FP_ATOMIC_PURPLE', 'SHELL_GBC_FP', 'Atomic Purple', 0.0, '#7B68A6', '/images/shells/VAR_SHELL_GBC_FP_ATOMIC_PURPLE.jpg', TRUE),
('VAR_SHELL_GBC_FP_CLEAR_DEEP_RED', 'SHELL_GBC_FP', 'Clear Deep Red', 0.0, '#8B0000', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_DEEP_RED.jpg', TRUE),
('VAR_SHELL_GBC_FP_CLEAR_YELLOW', 'SHELL_GBC_FP', 'Clear Yellow', 0.0, '#FFD700', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_YELLOW.jpg', TRUE),
('VAR_SHELL_GBC_FP_CLEAR', 'SHELL_GBC_FP', 'Clear', 0.0, '#FFFFFF', '/images/shells/VAR_SHELL_GBC_FP_CLEAR.jpg', TRUE),
('VAR_SHELL_GBC_FP_ORANGE', 'SHELL_GBC_FP', 'Orange', 0.0, '#FF6600', '/images/shells/VAR_SHELL_GBC_FP_ORANGE.jpg', FALSE),
('VAR_SHELL_GBC_FP_CLEAR_ROYAL_BLUE', 'SHELL_GBC_FP', 'Clear Royal Blue', 0.0, '#4169E1', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_ROYAL_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_FP_CLEAR_ORANGE', 'SHELL_GBC_FP', 'Clear Orange', 0.0, '#FF8C00', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_ORANGE.jpg', TRUE),
('VAR_SHELL_GBC_FP_GB_GREY', 'SHELL_GBC_FP', 'GB Grey', 0.0, '#A0A0A0', '/images/shells/VAR_SHELL_GBC_FP_GB_GREY.jpg', FALSE),
('VAR_SHELL_GBC_FP_CLEAR_PURPLE', 'SHELL_GBC_FP', 'Clear Purple', 0.0, '#9370DB', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_PURPLE.jpg', TRUE),
('VAR_SHELL_GBC_FP_CLEAR_LUMINOUS_BLUE', 'SHELL_GBC_FP', 'Clear Luminous Blue', 0.0, '#00BFFF', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_LUMINOUS_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_FP_PURE_WHITE', 'SHELL_GBC_FP', 'Pure White', 0.0, '#FFFFFF', '/images/shells/VAR_SHELL_GBC_FP_PURE_WHITE.jpg', FALSE),
('VAR_SHELL_GBC_FP_CLEAR_BLACK', 'SHELL_GBC_FP', 'Clear Black', 0.0, '#2F2F2F', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_BLACK.jpg', TRUE),
('VAR_SHELL_GBC_FP_BLACK', 'SHELL_GBC_FP', 'Black', 0.0, '#000000', '/images/shells/VAR_SHELL_GBC_FP_BLACK.jpg', FALSE),
('VAR_SHELL_GBC_FP_PINK', 'SHELL_GBC_FP', 'Pink', 0.0, '#FF69B4', '/images/shells/VAR_SHELL_GBC_FP_PINK.jpg', FALSE),
('VAR_SHELL_GBC_FP_FLUORESCENT_YELLOW', 'SHELL_GBC_FP', 'Fluorescent Yellow', 0.0, '#CCFF00', '/images/shells/VAR_SHELL_GBC_FP_FLUORESCENT_YELLOW.jpg', FALSE),
('VAR_SHELL_GBC_FP_EARTHY_YELLOW', 'SHELL_GBC_FP', 'Earthy Yellow', 0.0, '#D4A574', '/images/shells/VAR_SHELL_GBC_FP_EARTHY_YELLOW.jpg', FALSE),
('VAR_SHELL_GBC_FP_MINT_GREEN', 'SHELL_GBC_FP', 'Mint Green', 0.0, '#98FF98', '/images/shells/VAR_SHELL_GBC_FP_MINT_GREEN.jpg', FALSE),
('VAR_SHELL_GBC_FP_BABY_GREEN', 'SHELL_GBC_FP', 'Baby Green', 0.0, '#90EE90', '/images/shells/VAR_SHELL_GBC_FP_BABY_GREEN.jpg', FALSE),
('VAR_SHELL_GBC_FP_CLEAR_LIGHT_BLUE', 'SHELL_GBC_FP', 'Clear Light Blue', 0.0, '#ADD8E6', '/images/shells/VAR_SHELL_GBC_FP_CLEAR_LIGHT_BLUE.jpg', TRUE),
-- CGS Laminated Shells
('VAR_SHELL_GBC_CGS_L_FLUORESCENT', 'SHELL_GBC_CGS_L', 'Fluorescent', 0.0, '#CCFF00', '/images/shells/VAR_SHELL_GBC_CGS_L_FLUORESCENT.jpg', FALSE),
('VAR_SHELL_GBC_CGS_L_CRYSTAL', 'SHELL_GBC_CGS_L', 'Crystal', 0.0, '#E0E0E0', '/images/shells/VAR_SHELL_GBC_CGS_L_CRYSTAL.jpg', TRUE),
('VAR_SHELL_GBC_CGS_L_SHINING', 'SHELL_GBC_CGS_L', 'Shining', 0.0, '#C0C0C0', '/images/shells/VAR_SHELL_GBC_CGS_L_SHINING.jpg', FALSE),
('VAR_SHELL_GBC_CGS_L_WOOD', 'SHELL_GBC_CGS_L', 'Wood', 0.0, '#8B4513', '/images/shells/VAR_SHELL_GBC_CGS_L_WOOD.jpg', FALSE),
('VAR_SHELL_GBC_CGS_L_AURORA', 'SHELL_GBC_CGS_L', 'Aurora', 0.0, '#FF69B4', '/images/shells/VAR_SHELL_GBC_CGS_L_AURORA.jpg', FALSE),
('VAR_SHELL_GBC_CGS_L_CLEAR_BLUE', 'SHELL_GBC_CGS_L', 'Clear Blue', 0.0, '#87CEEB', '/images/shells/VAR_SHELL_GBC_CGS_L_CLEAR_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_CGS_L_CLEAR_MATTE_BLACK', 'SHELL_GBC_CGS_L', 'Clear Matte Black', 0.0, '#2F2F2F', '/images/shells/VAR_SHELL_GBC_CGS_L_CLEAR_MATTE_BLACK.jpg', TRUE),
('VAR_SHELL_GBC_CGS_L_FROSTED_CLEAR', 'SHELL_GBC_CGS_L', 'Frosted Clear', 0.0, '#F5F5F5', '/images/shells/VAR_SHELL_GBC_CGS_L_FROSTED_CLEAR.jpg', TRUE),
-- CGS IPS Ready Shells
('VAR_SHELL_GBC_CGS_AURORA', 'SHELL_GBC_CGS', 'Aurora', 5.0, '#FF69B4', '/images/shells/VAR_SHELL_GBC_CGS_AURORA.jpg', FALSE),
('VAR_SHELL_GBC_CGS_PURE_BLACK', 'SHELL_GBC_CGS', 'Pure Black', 0.0, '#000000', '/images/shells/VAR_SHELL_GBC_CGS_PURE_BLACK.jpg', FALSE),
('VAR_SHELL_GBC_CGS_BLUE_GREEN', 'SHELL_GBC_CGS', 'Blue Green', 0.0, '#0D98BA', '/images/shells/VAR_SHELL_GBC_CGS_BLUE_GREEN.jpg', FALSE),
('VAR_SHELL_GBC_CGS_FROSTED_WHITE', 'SHELL_GBC_CGS', 'Frosted White', 0.0, '#F8F8FF', '/images/shells/VAR_SHELL_GBC_CGS_FROSTED_WHITE.jpg', TRUE),
('VAR_SHELL_GBC_CGS_WOOD', 'SHELL_GBC_CGS', 'Wood', 0.0, '#8B4513', '/images/shells/VAR_SHELL_GBC_CGS_WOOD.jpg', FALSE),
('VAR_SHELL_GBC_CGS_ICE_BLUE', 'SHELL_GBC_CGS', 'Ice Blue', 0.0, '#B0E0E6', '/images/shells/VAR_SHELL_GBC_CGS_ICE_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_CGS_GOLD', 'SHELL_GBC_CGS', 'Gold', 0.0, '#FFD700', '/images/shells/VAR_SHELL_GBC_CGS_GOLD.jpg', FALSE),
('VAR_SHELL_GBC_CGS_SILVER', 'SHELL_GBC_CGS', 'Silver', 0.0, '#C0C0C0', '/images/shells/VAR_SHELL_GBC_CGS_SILVER.jpg', FALSE),
('VAR_SHELL_GBC_CGS_CLEAR_BLUE', 'SHELL_GBC_CGS', 'Clear Blue', 0.0, '#87CEEB', '/images/shells/VAR_SHELL_GBC_CGS_CLEAR_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_CGS_CLEAR', 'SHELL_GBC_CGS', 'Clear', 0.0, '#FFFFFF', '/images/shells/VAR_SHELL_GBC_CGS_CLEAR.jpg', TRUE),
('VAR_SHELL_GBC_CGS_CRYSTAL', 'SHELL_GBC_CGS', 'Crystal', 0.0, '#E0E0E0', '/images/shells/VAR_SHELL_GBC_CGS_CRYSTAL.jpg', TRUE),
('VAR_SHELL_GBC_CGS_FLUORESCENT', 'SHELL_GBC_CGS', 'Fluorescent', 0.0, '#CCFF00', '/images/shells/VAR_SHELL_GBC_CGS_FLUORESCENT.jpg', FALSE),
('VAR_SHELL_GBC_CGS_CLEAR_MATTE_BLACK', 'SHELL_GBC_CGS', 'Clear Matte Black', 0.0, '#2F2F2F', '/images/shells/VAR_SHELL_GBC_CGS_CLEAR_MATTE_BLACK.jpg', TRUE),
('VAR_SHELL_GBC_CGS_CLEAR_PURPLE', 'SHELL_GBC_CGS', 'Clear Purple', 0.0, '#9370DB', '/images/shells/VAR_SHELL_GBC_CGS_CLEAR_PURPLE.jpg', TRUE),
('VAR_SHELL_GBC_CGS_POKEMON_3RD', 'SHELL_GBC_CGS', 'Pokemon Center 3rd Anniversary', 5.0, '#FF6600', '/images/shells/VAR_SHELL_GBC_CGS_POKEMON_3RD.jpg', FALSE),
-- eXtremeRate Shells
('VAR_SHELL_GBC_EXR_CLEAR', 'SHELL_GBC_EXR', 'Transparent Clear', 0.0, '#FFFFFF', '/images/shells/VAR_SHELL_GBC_EXR_CLEAR.jpg', TRUE),
('VAR_SHELL_GBC_EXR_CLEAR_RED', 'SHELL_GBC_EXR', 'Transparent Clear Red', 0.0, '#FF0000', '/images/shells/VAR_SHELL_GBC_EXR_CLEAR_RED.jpg', TRUE),
('VAR_SHELL_GBC_EXR_CLEAR_BLUE', 'SHELL_GBC_EXR', 'Transparent Clear Blue', 0.0, '#0000FF', '/images/shells/VAR_SHELL_GBC_EXR_CLEAR_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_EXR_CLEAR_PURPLE', 'SHELL_GBC_EXR', 'Transparent Clear Purple', 0.0, '#800080', '/images/shells/VAR_SHELL_GBC_EXR_CLEAR_PURPLE.jpg', TRUE),
('VAR_SHELL_GBC_EXR_CLEAR_GREEN', 'SHELL_GBC_EXR', 'Transparent Clear Green', 0.0, '#008000', '/images/shells/VAR_SHELL_GBC_EXR_CLEAR_GREEN.jpg', TRUE),
('VAR_SHELL_GBC_EXR_GLACIER_BLUE', 'SHELL_GBC_EXR', 'Glacier Blue', 0.0, '#ADD8E6', '/images/shells/VAR_SHELL_GBC_EXR_GLACIER_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_EXR_BLACK', 'SHELL_GBC_EXR', 'Black', 0.0, '#000000', '/images/shells/VAR_SHELL_GBC_EXR_BLACK.jpg', FALSE),
('VAR_SHELL_GBC_EXR_WHITE', 'SHELL_GBC_EXR', 'White', 0.0, '#FFFFFF', '/images/shells/VAR_SHELL_GBC_EXR_WHITE.jpg', FALSE),
('VAR_SHELL_GBC_EXR_CLASSIC_GRAY', 'SHELL_GBC_EXR', 'Classic Gray', 0.0, '#A0A0A0', '/images/shells/VAR_SHELL_GBC_EXR_CLASSIC_GRAY.jpg', FALSE),
('VAR_SHELL_GBC_EXR_SCARLET_RED', 'SHELL_GBC_EXR', 'Scarlet Red', 0.0, '#FF2400', '/images/shells/VAR_SHELL_GBC_EXR_SCARLET_RED.jpg', FALSE),
('VAR_SHELL_GBC_EXR_CHERRY_PINK', 'SHELL_GBC_EXR', 'Cherry Blossoms Pink', 0.0, '#FFB7C5', '/images/shells/VAR_SHELL_GBC_EXR_CHERRY_PINK.jpg', FALSE),
('VAR_SHELL_GBC_EXR_CHAMELEON_PURPLE_BLUE', 'SHELL_GBC_EXR', 'Chameleon Purple Blue', 0.0, '#6A5ACD', '/images/shells/VAR_SHELL_GBC_EXR_CHAMELEON_PURPLE_BLUE.jpg', FALSE),
('VAR_SHELL_GBC_EXR_GLOW_GREEN', 'SHELL_GBC_EXR', 'Glow in Dark Green', 0.0, '#ADFF2F', '/images/shells/VAR_SHELL_GBC_EXR_GLOW_GREEN.jpg', FALSE),
('VAR_SHELL_GBC_EXR_GLOW_BLUE', 'SHELL_GBC_EXR', 'Glow in Dark Blue', 0.0, '#00BFFF', '/images/shells/VAR_SHELL_GBC_EXR_GLOW_BLUE.jpg', FALSE),
('VAR_SHELL_GBC_EXR_GREAT_WAVE', 'SHELL_GBC_EXR', 'The Great Wave', 0.0, '#FFFFFF', '/images/shells/VAR_SHELL_GBC_EXR_GREAT_WAVE.jpg', FALSE),
('VAR_SHELL_GBC_EXR_NES_CLASSIC', 'SHELL_GBC_EXR', 'Classics NES Style', 0.0, '#D3D3D3', '/images/shells/VAR_SHELL_GBC_EXR_NES_CLASSIC.jpg', FALSE),
('VAR_SHELL_GBC_EXR_WOOD_GRAIN', 'SHELL_GBC_EXR', 'Wood Grain', 0.0, '#8B4513', '/images/shells/VAR_SHELL_GBC_EXR_WOOD_GRAIN.jpg', FALSE),
-- Hispeedido Shells
('VAR_SHELL_GBC_HI_SAPPHIRE_BLUE', 'SHELL_GBC_HI', 'Sapphire Blue', 0.0, '#0F52BA', '/images/shells/VAR_SHELL_GBC_HI_SAPPHIRE_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_HI_DARK_GREEN', 'SHELL_GBC_HI', 'Dark Green', 0.0, '#013220', '/images/shells/VAR_SHELL_GBC_HI_DARK_GREEN.jpg', FALSE),
('VAR_SHELL_GBC_HI_GREEN', 'SHELL_GBC_HI', 'Green', 0.0, '#228B22', '/images/shells/VAR_SHELL_GBC_HI_GREEN.jpg', FALSE),
('VAR_SHELL_GBC_HI_L_SAPPHIRE_BLUE', 'SHELL_GBC_HI_L', 'Sapphire Blue', 0.0, '#0F52BA', '/images/shells/VAR_SHELL_GBC_HI_L_SAPPHIRE_BLUE.jpg', TRUE),
('VAR_SHELL_GBC_HI_L_DARK_GREEN', 'SHELL_GBC_HI_L', 'Dark Green', 0.0, '#013220', '/images/shells/VAR_SHELL_GBC_HI_L_DARK_GREEN.jpg', FALSE),
('VAR_SHELL_GBC_HI_L_DARK_BLUE', 'SHELL_GBC_HI_L', 'Dark Blue', 0.0, '#00008B', '/images/shells/VAR_SHELL_GBC_HI_L_DARK_BLUE.jpg', FALSE),
('VAR_SHELL_GBC_HI_L_GREEN', 'SHELL_GBC_HI_L', 'Green', 0.0, '#228B22', '/images/shells/VAR_SHELL_GBC_HI_L_GREEN.jpg', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 📺 SEED DATA - SCREENS
-- ========================================

INSERT INTO screens (id, handled_model, brand, name, price, size, assembly) VALUES
('SCR_GBC_OEM', 'Gameboy Color', 'OEM', 'Original LCD Screen', 0.0, 'Standard', 'Component'),
('SCR_GBC_FP_RP20', 'Gameboy Color', 'FunnyPlaying', 'FunnyPlaying Retro Pixel 2.0 IPS Laminated', 70.0, 'Large', 'Laminated'),
('SCR_GBC_HI_Q5L', 'Gameboy Color', 'Hispeedido', 'Hispeedido Q5 IPS Laminated', 70.0, 'Large', 'Laminated'),
('SCR_GBC_HI_OLED', 'Gameboy Color', 'Hispeedido', 'Hispeedido Q5 OLED Laminated', 70.0, 'Large', 'Laminated'),
('SCR_GBC_CGS_278', 'Gameboy Color', 'CloudGameStore', 'CGS 2.78 LCD Half Reflection Half Transmission Screen', 70.0, 'Large', 'Laminated'),
('SCR_GBC_HI_245L', 'Gameboy Color', 'Hispeedido', 'Hispeedido IPS 2.45 Drop-in Laminated', 70.0, 'Standard', 'Laminated'),
('SCR_GBC_HI_Q5', 'Gameboy Color', 'Hispeedido', 'Hispeedido Q5 IPS', 70.0, 'Large', 'Component'),
('SCR_GBC_HI_245', 'Gameboy Color', 'Hispeedido', 'Hispeedido IPS 2.45 Drop-in', 65.0, 'Standard', 'Component'),
('SCR_GBC_CGS_26_IPS', 'Gameboy Color', 'CloudGameStore', 'CGS 2.6 IPS', 65.0, 'Large', 'Component'),
('SCR_GBC_CGS_245_TFT', 'Gameboy Color', 'CloudGameStore', 'CGS 2.45 TFT', 60.0, 'Standard', 'Component')
ON CONFLICT (id) DO NOTHING;

INSERT INTO screen_variants (id, screen_id, name, supplement, image_url) VALUES
('VAR_SCR_GBC_FP_RP20_BLACK', 'SCR_GBC_FP_RP20', 'Black', 0.0, '/images/screens/VAR_SCR_GBC_FP_RP20_BLACK.jpg'),
('VAR_SCR_GBC_FP_RP20_WHITE', 'SCR_GBC_FP_RP20', 'White', 0.0, '/images/screens/VAR_SCR_GBC_FP_RP20_WHITE.jpg'),
('VAR_SCR_GBC_FP_RP20_GREY', 'SCR_GBC_FP_RP20', 'Grey', 0.0, '/images/screens/VAR_SCR_GBC_FP_RP20_GREY.jpg'),
('VAR_SCR_GBC_FP_RP20_PURPLE', 'SCR_GBC_FP_RP20', 'Laminated Purple', 0.0, '/images/screens/VAR_SCR_GBC_FP_RP20_PURPLE.jpg'),
('VAR_SCR_GBC_FP_RP20_BLUE', 'SCR_GBC_FP_RP20', 'Laminated Blue', 0.0, '/images/screens/VAR_SCR_GBC_FP_RP20_BLUE.jpg'),
('VAR_SCR_GBC_FP_RP20_YELLOW', 'SCR_GBC_FP_RP20', 'Laminated Yellow', 0.0, '/images/screens/VAR_SCR_GBC_FP_RP20_YELLOW.jpg'),
('VAR_SCR_GBC_FP_RP20_GREEN', 'SCR_GBC_FP_RP20', 'Laminated Green', 0.0, '/images/screens/VAR_SCR_GBC_FP_RP20_GREEN.jpg'),
('VAR_SCR_GBC_FP_RP20_RED', 'SCR_GBC_FP_RP20', 'Laminated Red', 0.0, '/images/screens/VAR_SCR_GBC_FP_RP20_RED.jpg'),
('VAR_SCR_GBC_HI_Q5L_BLACK', 'SCR_GBC_HI_Q5L', 'Black', 0.0, '/images/screens/VAR_SCR_GBC_HI_Q5L_BLACK.jpg'),
('VAR_SCR_GBC_HI_Q5L_WHITE', 'SCR_GBC_HI_Q5L', 'White', 0.0, '/images/screens/VAR_SCR_GBC_HI_Q5L_WHITE.jpg'),
('VAR_SCR_GBC_HI_245L_BLACK', 'SCR_GBC_HI_245L', 'Black', 0.0, '/images/screens/VAR_SCR_GBC_HI_245L_BLACK.jpg'),
('VAR_SCR_GBC_CGS_278_DARK_GRAY', 'SCR_GBC_CGS_278', 'Dark Gray', 0.0, '/images/screens/VAR_SCR_GBC_CGS_278_DARK_GRAY.jpg'),
('VAR_SCR_GBC_CGS_278_WHITE', 'SCR_GBC_CGS_278', 'White', 0.0, '/images/screens/VAR_SCR_GBC_CGS_278_WHITE.jpg'),
('VAR_SCR_GBC_CGS_278_BLACK_NOLOGO', 'SCR_GBC_CGS_278', 'Black (No Logo)', 0.0, '/images/screens/VAR_SCR_GBC_CGS_278_BLACK_NOLOGO.jpg'),
('VAR_SCR_GBC_OEM_DEFAULT', 'SCR_GBC_OEM', 'Écran OEM Original', 0.0, '/images/screens/VAR_SCR_GBC_OEM_DEFAULT.jpg')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 🔍 SEED DATA - LENSES
-- ========================================

INSERT INTO lenses (id, name, price, size) VALUES
('LENS_GBC_STD_GLASS', 'Vitre Verre Standard 2.45"', 5.0, 'Standard'),
('LENS_GBC_LRG_GLASS', 'Vitre Verre Large 2.6"', 5.0, 'Large')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lens_variants (id, lens_id, name, supplement, image_url) VALUES
-- Standard Lenses
('VAR_LENS_GBC_STD_BLACK_NOLOGO', 'LENS_GBC_STD_GLASS', 'Black (No Logo)', 0.0, '/images/lenses/VAR_LENS_GBC_STD_BLACK_NOLOGO.jpg'),
('VAR_LENS_GBC_STD_BLACK', 'LENS_GBC_STD_GLASS', 'Black', 0.0, '/images/lenses/VAR_LENS_GBC_STD_BLACK.jpg'),
('VAR_LENS_GBC_STD_WHITE', 'LENS_GBC_STD_GLASS', 'White', 0.0, '/images/lenses/VAR_LENS_GBC_STD_WHITE.jpg'),
('VAR_LENS_GBC_STD_SAKURA', 'LENS_GBC_STD_GLASS', 'Sakura', 0.0, '/images/lenses/VAR_LENS_GBC_STD_SAKURA.jpg'),
('VAR_LENS_GBC_STD_SHINY', 'LENS_GBC_STD_GLASS', 'Shiny', 0.0, '/images/lenses/VAR_LENS_GBC_STD_SHINY.jpg'),
('VAR_LENS_GBC_STD_SILVER', 'LENS_GBC_STD_GLASS', 'Silver', 0.0, '/images/lenses/VAR_LENS_GBC_STD_SILVER.jpg'),
('VAR_LENS_GBC_STD_GREY', 'LENS_GBC_STD_GLASS', 'Grey', 0.0, '/images/lenses/VAR_LENS_GBC_STD_GREY.jpg'),
('VAR_LENS_GBC_STD_PINK', 'LENS_GBC_STD_GLASS', 'Pink', 0.0, '/images/lenses/VAR_LENS_GBC_STD_PINK.jpg'),
('VAR_LENS_GBC_STD_MARIO_LUIGI', 'LENS_GBC_STD_GLASS', 'Mario Luigi', 0.0, '/images/lenses/VAR_LENS_GBC_STD_MARIO_LUIGI.jpg'),
('VAR_LENS_GBC_STD_PIKA', 'LENS_GBC_STD_GLASS', 'Pikachu', 0.0, '/images/lenses/VAR_LENS_GBC_STD_PIKA.jpg'),
('VAR_LENS_GBC_STD_BLACK_PMG', 'LENS_GBC_STD_GLASS', 'Gen1 Black (Pokemon)', 0.0, '/images/lenses/VAR_LENS_GBC_STD_BLACK_PMG.jpg'),
('VAR_LENS_GBC_STD_WHITE_PMG', 'LENS_GBC_STD_GLASS', 'Gen1 White (Pokemon)', 0.0, '/images/lenses/VAR_LENS_GBC_STD_WHITE_PMG.webp'),
('VAR_LENS_GBC_STD_BLACK_3RD', 'LENS_GBC_STD_GLASS', 'Gen2 Black (Pokemon)', 0.0, '/images/lenses/VAR_LENS_GBC_STD_BLACK_3RD.jpg'),
('VAR_LENS_GBC_STD_WHITE_3RD', 'LENS_GBC_STD_GLASS', 'Gen2 White (Pokemon)', 0.0, '/images/lenses/VAR_LENS_GBC_STD_WHITE_3RD.jpg'),
('VAR_LENS_GBC_STD_HORROR', 'LENS_GBC_STD_GLASS', 'Horror', 0.0, '/images/lenses/VAR_LENS_GBC_STD_HORROR.png'),
-- Large Lenses
('VAR_LENS_GBC_LRG_BLACK', 'LENS_GBC_LRG_GLASS', 'Black', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_BLACK.jpg'),
('VAR_LENS_GBC_LRG_BLACK_NOLOGO', 'LENS_GBC_LRG_GLASS', 'Black (No Logo)', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_BLACK_NOLOGO.jpg'),
('VAR_LENS_GBC_LRG_BLUE', 'LENS_GBC_LRG_GLASS', 'Blue', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_BLUE.jpg'),
('VAR_LENS_GBC_LRG_CLARET', 'LENS_GBC_LRG_GLASS', 'Claret', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_CLARET.jpg'),
('VAR_LENS_GBC_LRG_GOLD', 'LENS_GBC_LRG_GLASS', 'Gold', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_GOLD.jpg'),
('VAR_LENS_GBC_LRG_SILVER', 'LENS_GBC_LRG_GLASS', 'Silver', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_SILVER.jpg'),
('VAR_LENS_GBC_LRG_WHITE', 'LENS_GBC_LRG_GLASS', 'White', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_WHITE.jpg'),
('VAR_LENS_GBC_LRG_GREEN', 'LENS_GBC_LRG_GLASS', 'Green', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_GREEN.jpg'),
('VAR_LENS_GBC_LRG_HORROR', 'LENS_GBC_LRG_GLASS', 'Horror', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_HORROR.jpg'),
('VAR_LENS_GBC_LRG_PINK', 'LENS_GBC_LRG_GLASS', 'Pink', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_PINK.jpg'),
('VAR_LENS_GBC_LRG_SHINY', 'LENS_GBC_LRG_GLASS', 'Shiny', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_SHINY.jpg'),
('VAR_LENS_GBC_LRG_GREY', 'LENS_GBC_LRG_GLASS', 'Grey', 0.0, '/images/lenses/VAR_LENS_GBC_LRG_GREY.jpg')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 🔀 SEED DATA - COMPATIBILITY
-- ========================================

INSERT INTO shell_screen_compatibility (screen_id, shell_id, status) VALUES
('SCR_GBC_OEM', 'SHELL_GBC_OEM', 'Yes'),
('SCR_GBC_OEM', 'SHELL_GBC_FP', 'No'),
('SCR_GBC_OEM', 'SHELL_GBC_HI_L', 'No'),
('SCR_GBC_OEM', 'SHELL_GBC_CGS_L', 'No'),
('SCR_GBC_OEM', 'SHELL_GBC_CGS', 'Yes'),
('SCR_GBC_OEM', 'SHELL_GBC_EXR', 'Yes'),
('SCR_GBC_OEM', 'SHELL_GBC_HI', 'Yes'),
('SCR_GBC_FP_RP20', 'SHELL_GBC_OEM', 'Cut'),
('SCR_GBC_FP_RP20', 'SHELL_GBC_FP', 'Yes'),
('SCR_GBC_FP_RP20', 'SHELL_GBC_HI_L', 'Yes'),
('SCR_GBC_FP_RP20', 'SHELL_GBC_CGS_L', 'Yes'),
('SCR_GBC_FP_RP20', 'SHELL_GBC_CGS', 'Cut'),
('SCR_GBC_FP_RP20', 'SHELL_GBC_EXR', 'Cut'),
('SCR_GBC_FP_RP20', 'SHELL_GBC_HI', 'No'),
('SCR_GBC_HI_Q5L', 'SHELL_GBC_OEM', 'Cut'),
('SCR_GBC_HI_Q5L', 'SHELL_GBC_FP', 'Yes'),
('SCR_GBC_HI_Q5L', 'SHELL_GBC_HI_L', 'Yes'),
('SCR_GBC_HI_Q5L', 'SHELL_GBC_CGS_L', 'Yes'),
('SCR_GBC_HI_Q5L', 'SHELL_GBC_CGS', 'Cut'),
('SCR_GBC_HI_Q5L', 'SHELL_GBC_EXR', 'Cut'),
('SCR_GBC_HI_Q5L', 'SHELL_GBC_HI', 'No'),
('SCR_GBC_HI_OLED', 'SHELL_GBC_OEM', 'Cut'),
('SCR_GBC_HI_OLED', 'SHELL_GBC_FP', 'Yes'),
('SCR_GBC_HI_OLED', 'SHELL_GBC_HI_L', 'Yes'),
('SCR_GBC_HI_OLED', 'SHELL_GBC_CGS_L', 'Yes'),
('SCR_GBC_HI_OLED', 'SHELL_GBC_CGS', 'Cut'),
('SCR_GBC_HI_OLED', 'SHELL_GBC_EXR', 'Cut'),
('SCR_GBC_HI_OLED', 'SHELL_GBC_HI', 'No'),
('SCR_GBC_CGS_278', 'SHELL_GBC_OEM', 'Cut'),
('SCR_GBC_CGS_278', 'SHELL_GBC_FP', 'Yes'),
('SCR_GBC_CGS_278', 'SHELL_GBC_HI_L', 'Yes'),
('SCR_GBC_CGS_278', 'SHELL_GBC_CGS_L', 'Yes'),
('SCR_GBC_CGS_278', 'SHELL_GBC_CGS', 'No'),
('SCR_GBC_CGS_278', 'SHELL_GBC_EXR', 'Cut'),
('SCR_GBC_CGS_278', 'SHELL_GBC_HI', 'No'),
('SCR_GBC_HI_245L', 'SHELL_GBC_OEM', 'Cut'),
('SCR_GBC_HI_245L', 'SHELL_GBC_FP', 'Yes'),
('SCR_GBC_HI_245L', 'SHELL_GBC_HI_L', 'Yes'),
('SCR_GBC_HI_245L', 'SHELL_GBC_CGS_L', 'Yes'),
('SCR_GBC_HI_245L', 'SHELL_GBC_CGS', 'Yes'),
('SCR_GBC_HI_245L', 'SHELL_GBC_EXR', 'Cut'),
('SCR_GBC_HI_245L', 'SHELL_GBC_HI', 'No'),
('SCR_GBC_HI_Q5', 'SHELL_GBC_OEM', 'Cut'),
('SCR_GBC_HI_Q5', 'SHELL_GBC_FP', 'No'),
('SCR_GBC_HI_Q5', 'SHELL_GBC_HI_L', 'No'),
('SCR_GBC_HI_Q5', 'SHELL_GBC_CGS_L', 'No'),
('SCR_GBC_HI_Q5', 'SHELL_GBC_CGS', 'Cut'),
('SCR_GBC_HI_Q5', 'SHELL_GBC_EXR', 'Cut'),
('SCR_GBC_HI_Q5', 'SHELL_GBC_HI', 'Cut'),
('SCR_GBC_HI_245', 'SHELL_GBC_OEM', 'Yes'),
('SCR_GBC_HI_245', 'SHELL_GBC_FP', 'No'),
('SCR_GBC_HI_245', 'SHELL_GBC_HI_L', 'No'),
('SCR_GBC_HI_245', 'SHELL_GBC_CGS_L', 'No'),
('SCR_GBC_HI_245', 'SHELL_GBC_CGS', 'Yes'),
('SCR_GBC_HI_245', 'SHELL_GBC_EXR', 'Yes'),
('SCR_GBC_HI_245', 'SHELL_GBC_HI', 'Yes'),
('SCR_GBC_CGS_26_IPS', 'SHELL_GBC_OEM', 'Cut'),
('SCR_GBC_CGS_26_IPS', 'SHELL_GBC_FP', 'No'),
('SCR_GBC_CGS_26_IPS', 'SHELL_GBC_HI_L', 'No'),
('SCR_GBC_CGS_26_IPS', 'SHELL_GBC_CGS_L', 'Yes'),
('SCR_GBC_CGS_26_IPS', 'SHELL_GBC_CGS', 'No'),
('SCR_GBC_CGS_26_IPS', 'SHELL_GBC_EXR', 'Cut'),
('SCR_GBC_CGS_26_IPS', 'SHELL_GBC_HI', 'No'),
('SCR_GBC_CGS_245_TFT', 'SHELL_GBC_OEM', 'Yes'),
('SCR_GBC_CGS_245_TFT', 'SHELL_GBC_FP', 'No'),
('SCR_GBC_CGS_245_TFT', 'SHELL_GBC_HI_L', 'No'),
('SCR_GBC_CGS_245_TFT', 'SHELL_GBC_CGS_L', 'No'),
('SCR_GBC_CGS_245_TFT', 'SHELL_GBC_CGS', 'Yes'),
('SCR_GBC_CGS_245_TFT', 'SHELL_GBC_EXR', 'Yes'),
('SCR_GBC_CGS_245_TFT', 'SHELL_GBC_HI', 'Yes')
ON CONFLICT (screen_id, shell_id) DO NOTHING;
