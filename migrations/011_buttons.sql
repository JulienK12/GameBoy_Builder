-- ========================================
-- 🎮 BUTTONS (Boutons)
-- ========================================
-- Tables pour gérer les boutons Gameboy Color (D-pad, A, B, ON/OFF switch, cache infrarouge)

CREATE TABLE IF NOT EXISTS buttons (
    id VARCHAR(50) PRIMARY KEY,
    handled_model VARCHAR(50) NOT NULL,
    brand brand NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    description TEXT
);

CREATE TABLE IF NOT EXISTS button_variants (
    id VARCHAR(50) PRIMARY KEY,
    button_id VARCHAR(50) NOT NULL REFERENCES buttons(id),
    name VARCHAR(100) NOT NULL,
    supplement DOUBLE PRECISION NOT NULL DEFAULT 0,
    color_hex VARCHAR(7),
    image_url TEXT NOT NULL,
    is_transparent BOOLEAN NOT NULL DEFAULT FALSE,
    is_glow_in_dark BOOLEAN NOT NULL DEFAULT FALSE
);
