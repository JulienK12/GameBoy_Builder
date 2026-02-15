-- ========================================
-- 🎮 SEED DATA - BUTTONS (Cloud GameStore)
-- ========================================
-- Boutons Gameboy Color Cloud GameStore avec variantes de couleurs
-- Composants inclus : D-pad, A Button, B Button, ON/OFF Switch, Infrared Cover

INSERT INTO buttons (id, handled_model, brand, name, price, description) VALUES
('BTN_GBC_CGS', 'Gameboy Color', 'CloudGameStore', 'High-quality Button Set (D-pad, A, B, ON/OFF, IR Cover)', 0.85, 'Set complet de boutons de remplacement pour Gameboy Color incluant D-pad, boutons A et B, interrupteur ON/OFF et cache infrarouge.')
ON CONFLICT (id) DO NOTHING;

-- Variantes de couleurs (basées sur les options disponibles sur AliExpress)
INSERT INTO button_variants (id, button_id, name, supplement, color_hex, image_url, is_transparent, is_glow_in_dark) VALUES
-- Couleurs solides
('VAR_BTN_GBC_CGS_RED', 'BTN_GBC_CGS', 'Rouge', 0.0, '#DC143C', '/assets/images/buttons/VAR_BTN_GBC_CGS_RED.jpg', FALSE, FALSE),
('VAR_BTN_GBC_CGS_BLUE', 'BTN_GBC_CGS', 'Bleu', 0.0, '#4169E1', '/assets/images/buttons/VAR_BTN_GBC_CGS_BLUE.jpg', FALSE, FALSE),
('VAR_BTN_GBC_CGS_PURPLE', 'BTN_GBC_CGS', 'Violet', 0.0, '#9370DB', '/assets/images/buttons/VAR_BTN_GBC_CGS_PURPLE.jpg', FALSE, FALSE),
('VAR_BTN_GBC_CGS_PINK', 'BTN_GBC_CGS', 'Rose', 0.0, '#FF69B4', '/assets/images/buttons/VAR_BTN_GBC_CGS_PINK.jpg', FALSE, FALSE),
('VAR_BTN_GBC_CGS_BLACK', 'BTN_GBC_CGS', 'Noir', 0.0, '#000000', '/assets/images/buttons/VAR_BTN_GBC_CGS_BLACK.jpg', FALSE, FALSE),
('VAR_BTN_GBC_CGS_GREEN', 'BTN_GBC_CGS', 'Vert', 0.0, '#32CD32', '/assets/images/buttons/VAR_BTN_GBC_CGS_GREEN.jpg', FALSE, FALSE),
('VAR_BTN_GBC_CGS_WHITE', 'BTN_GBC_CGS', 'Blanc', 0.0, '#FFFFFF', '/assets/images/buttons/VAR_BTN_GBC_CGS_WHITE.jpg', FALSE, FALSE),
('VAR_BTN_GBC_CGS_YELLOW', 'BTN_GBC_CGS', 'Jaune', 0.0, '#FFD700', '/assets/images/buttons/VAR_BTN_GBC_CGS_YELLOW.jpg', FALSE, FALSE),
-- Couleurs translucides/transparentes
('VAR_BTN_GBC_CGS_CLEAR_RED', 'BTN_GBC_CGS', 'Rouge Transparent', 0.0, '#DC143C', '/assets/images/buttons/VAR_BTN_GBC_CGS_CLEAR_RED.jpg', TRUE, FALSE),
('VAR_BTN_GBC_CGS_CLEAR_YELLOW', 'BTN_GBC_CGS', 'Jaune Transparent', 0.0, '#FFD700', '/assets/images/buttons/VAR_BTN_GBC_CGS_CLEAR_YELLOW.jpg', TRUE, FALSE),
('VAR_BTN_GBC_CGS_CLEAR_GREEN', 'BTN_GBC_CGS', 'Vert Transparent', 0.0, '#32CD32', '/assets/images/buttons/VAR_BTN_GBC_CGS_CLEAR_GREEN.jpg', TRUE, FALSE),
('VAR_BTN_GBC_CGS_CLEAR_BLUE', 'BTN_GBC_CGS', 'Bleu Transparent', 0.0, '#4169E1', '/assets/images/buttons/VAR_BTN_GBC_CGS_CLEAR_BLUE.jpg', TRUE, FALSE),
('VAR_BTN_GBC_CGS_CLEAR_LIGHT_BLUE', 'BTN_GBC_CGS', 'Bleu Clair Transparent', 0.0, '#87CEEB', '/assets/images/buttons/VAR_BTN_GBC_CGS_CLEAR_LIGHT.jpg', TRUE, FALSE),
('VAR_BTN_GBC_CGS_CLEAR_PURPLE', 'BTN_GBC_CGS', 'Violet Transparent', 0.0, '#9370DB', '/assets/images/buttons/VAR_BTN_GBC_CGS_CLEAR_PURPLE.jpg', TRUE, FALSE),
-- Phosphorescent (glow-in-the-dark)
('VAR_BTN_GBC_CGS_GLOW_GREEN', 'BTN_GBC_CGS', 'Vert Phosphorescent', 0.0, '#90EE90', '/assets/images/buttons/VAR_BTN_GBC_CGS_GLOW_GREEN.jpg', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;
