-- ========================================
-- 🎮 REFINEMENT - GRANULAR BUTTONS
-- ========================================

-- Insertion des boutons granulaires par modèle

-- Gameboy Color (GBC)
INSERT INTO buttons (id, handled_model, brand, name, price, description) VALUES
('BTN_GBC_DPAD', 'Gameboy Color', 'OEM', 'D-Pad GBC', 0, 'Croix directionnelle pour Gameboy Color'),
('BTN_GBC_A', 'Gameboy Color', 'OEM', 'Bouton A GBC', 0, 'Bouton d''action A pour Gameboy Color'),
('BTN_GBC_B', 'Gameboy Color', 'OEM', 'Bouton B GBC', 0, 'Bouton d''action B pour Gameboy Color'),
('BTN_GBC_POWER', 'Gameboy Color', 'OEM', 'Interrupteur ON/OFF GBC', 0, 'Glissière d''alimentation pour Gameboy Color'),
('BTN_GBC_IR', 'Gameboy Color', 'OEM', 'Cache Infrarouge GBC', 0, 'Cache de protection pour port IR GBC')
ON CONFLICT (id) DO NOTHING;

-- Gameboy DMG / Pocket (DMG/MGB)
-- Note: Le story mentionne "Pocket/DMG" ensemble.
INSERT INTO buttons (id, handled_model, brand, name, price, description) VALUES
('BTN_DMG_DPAD', 'Gameboy DMG/Pocket', 'OEM', 'D-Pad DMG', 0, 'Croix directionnelle pour Gameboy Original'),
('BTN_DMG_A', 'Gameboy DMG/Pocket', 'OEM', 'Bouton A DMG', 0, 'Bouton d''action A pour Gameboy Original'),
('BTN_DMG_B', 'Gameboy DMG/Pocket', 'OEM', 'Bouton B DMG', 0, 'Bouton d''action B pour Gameboy Original'),
('BTN_DMG_POWER', 'Gameboy DMG/Pocket', 'OEM', 'Interrupteur ON/OFF DMG', 0, 'Glissière d''alimentation pour Gameboy Original')
ON CONFLICT (id) DO NOTHING;

-- Gameboy Advance (GBA)
INSERT INTO buttons (id, handled_model, brand, name, price, description) VALUES
('BTN_GBA_DPAD', 'Gameboy Advance', 'OEM', 'D-Pad GBA', 0, 'Croix directionnelle pour Gameboy Advance'),
('BTN_GBA_A', 'Gameboy Advance', 'OEM', 'Bouton A GBA', 0, 'Bouton d''action A pour Gameboy Advance'),
('BTN_GBA_B', 'Gameboy Advance', 'OEM', 'Bouton B GBA', 0, 'Bouton d''action B pour Gameboy Advance'),
('BTN_GBA_POWER', 'Gameboy Advance', 'OEM', 'Interrupteur ON/OFF GBA', 0, 'Glissière d''alimentation pour Gameboy Advance'),
('BTN_GBA_L', 'Gameboy Advance', 'OEM', 'Bouton L GBA', 0, 'Gâchette gauche pour Gameboy Advance'),
('BTN_GBA_R', 'Gameboy Advance', 'OEM', 'Bouton R GBA', 0, 'Gâchette droite pour Gameboy Advance'),
('BTN_GBA_BORDER_L', 'Gameboy Advance', 'OEM', 'Bordure Gauche GBA', 0, 'Bordure latérale gauche pour Gameboy Advance'),
('BTN_GBA_BORDER_R', 'Gameboy Advance', 'OEM', 'Bordure Droite GBA', 0, 'Bordure latérale droite pour Gameboy Advance')
ON CONFLICT (id) DO NOTHING;

-- Gameboy Advance SP (GBASP)
INSERT INTO buttons (id, handled_model, brand, name, price, description) VALUES
('BTN_GBASP_DPAD', 'Gameboy Advance SP', 'OEM', 'D-Pad SP', 0, 'Croix directionnelle pour Gameboy Advance SP'),
('BTN_GBASP_A', 'Gameboy Advance SP', 'OEM', 'Bouton A SP', 0, 'Bouton d''action A pour Gameboy Advance SP'),
('BTN_GBASP_B', 'Gameboy Advance SP', 'OEM', 'Bouton B SP', 0, 'Bouton d''action B pour Gameboy Advance SP'),
('BTN_GBASP_POWER', 'Gameboy Advance SP', 'OEM', 'Interrupteur ON/OFF SP', 0, 'Glissière d''alimentation pour Gameboy Advance SP'),
('BTN_GBASP_VOL', 'Gameboy Advance SP', 'OEM', 'Glissière Volume SP', 0, 'Contrôle du volume pour Gameboy Advance SP'),
('BTN_GBASP_L', 'Gameboy Advance SP', 'OEM', 'Bouton L SP', 0, 'Gâchette gauche pour Gameboy Advance SP'),
('BTN_GBASP_R', 'Gameboy Advance SP', 'OEM', 'Bouton R SP', 0, 'Gâchette droite pour Gameboy Advance SP'),
('BTN_GBASP_START', 'Gameboy Advance SP', 'OEM', 'Bouton Start SP', 0, 'Bouton Start pour Gameboy Advance SP'),
('BTN_GBASP_SELECT', 'Gameboy Advance SP', 'OEM', 'Bouton Select SP', 0, 'Bouton Select pour Gameboy Advance SP'),
('BTN_GBASP_BRIGHTNESS', 'Gameboy Advance SP', 'OEM', 'Bouton Luminosité SP', 0, 'Bouton de réglage rétroéclairage pour Gameboy Advance SP')
ON CONFLICT (id) DO NOTHING;

-- Insertion des Variantes par défaut (OEM)
-- GBC
INSERT INTO button_variants (id, button_id, name, supplement, color_hex, image_url, is_transparent, is_glow_in_dark) VALUES
('VAR_BTN_GBC_OEM_DPAD', 'BTN_GBC_DPAD', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBC_OEM_A', 'BTN_GBC_A', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBC_OEM_B', 'BTN_GBC_B', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBC_OEM_POWER', 'BTN_GBC_POWER', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBC_OEM_IR', 'BTN_GBC_IR', 'OEM Black', 0, '#000000', '/assets/images/buttons/oem_black.png', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- DMG
INSERT INTO button_variants (id, button_id, name, supplement, color_hex, image_url, is_transparent, is_glow_in_dark) VALUES
('VAR_BTN_DMG_OEM_DPAD', 'BTN_DMG_DPAD', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_DMG_OEM_A', 'BTN_DMG_A', 'OEM Maroon', 0, '#8B0000', '/assets/images/buttons/oem_maroon.png', FALSE, FALSE),
('VAR_BTN_DMG_OEM_B', 'BTN_DMG_B', 'OEM Maroon', 0, '#8B0000', '/assets/images/buttons/oem_maroon.png', FALSE, FALSE),
('VAR_BTN_DMG_OEM_POWER', 'BTN_DMG_POWER', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- GBA
INSERT INTO button_variants (id, button_id, name, supplement, color_hex, image_url, is_transparent, is_glow_in_dark) VALUES
('VAR_BTN_GBA_OEM_DPAD', 'BTN_GBA_DPAD', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBA_OEM_A', 'BTN_GBA_A', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBA_OEM_B', 'BTN_GBA_B', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBA_OEM_POWER', 'BTN_GBA_POWER', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBA_OEM_L', 'BTN_GBA_L', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBA_OEM_R', 'BTN_GBA_R', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBA_OEM_BORDER_L', 'BTN_GBA_BORDER_L', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBA_OEM_BORDER_R', 'BTN_GBA_BORDER_R', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- GBASP
INSERT INTO button_variants (id, button_id, name, supplement, color_hex, image_url, is_transparent, is_glow_in_dark) VALUES
('VAR_BTN_GBASP_OEM_DPAD', 'BTN_GBASP_DPAD', 'OEM Black', 0, '#000000', '/assets/images/buttons/oem_black.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_A', 'BTN_GBASP_A', 'OEM Black', 0, '#000000', '/assets/images/buttons/oem_black.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_B', 'BTN_GBASP_B', 'OEM Black', 0, '#000000', '/assets/images/buttons/oem_black.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_POWER', 'BTN_GBASP_POWER', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_VOL', 'BTN_GBASP_VOL', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_L', 'BTN_GBASP_L', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_R', 'BTN_GBASP_R', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_START', 'BTN_GBASP_START', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_SELECT', 'BTN_GBASP_SELECT', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE),
('VAR_BTN_GBASP_OEM_BRIGHTNESS', 'BTN_GBASP_BRIGHTNESS', 'OEM Grey', 0, '#4A4A4A', '/assets/images/buttons/oem_grey.png', FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Exemple de Variantes Custom (CGS pour GBC)
INSERT INTO button_variants (id, button_id, name, supplement, color_hex, image_url, is_transparent, is_glow_in_dark) VALUES
('VAR_BUT_GBC_CGS_RED_DPAD', 'BTN_GBC_DPAD', 'CGS Red', 0, '#DC143C', '/assets/images/buttons/cgs_red.png', FALSE, FALSE),
('VAR_BUT_GBC_CGS_RED_A', 'BTN_GBC_A', 'CGS Red', 0, '#DC143C', '/assets/images/buttons/cgs_red.png', FALSE, FALSE),
('VAR_BUT_GBC_CGS_RED_B', 'BTN_GBC_B', 'CGS Red', 0, '#DC143C', '/assets/images/buttons/cgs_red.png', FALSE, FALSE),
('VAR_BUT_GBC_CGS_BLUE_DPAD', 'BTN_GBC_DPAD', 'CGS Blue', 0, '#4169E1', '/assets/images/buttons/cgs_blue.png', FALSE, FALSE),
('VAR_BUT_GBC_CGS_BLUE_A', 'BTN_GBC_A', 'CGS Blue', 0, '#4169E1', '/assets/images/buttons/cgs_blue.png', FALSE, FALSE),
('VAR_BUT_GBC_CGS_BLUE_B', 'BTN_GBC_B', 'CGS Blue', 0, '#4169E1', '/assets/images/buttons/cgs_blue.png', FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
