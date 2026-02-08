-- ========================================
-- 🐚 SHELLS (Coques)
-- ========================================

CREATE TYPE mold_type AS ENUM ('OemStandard', 'IpsReady', 'LaminatedReady');
CREATE TYPE brand AS ENUM ('OEM', 'FunnyPlaying', 'Hispeedido', 'CloudGameStore', 'ExtremeRate');
CREATE TYPE screen_size AS ENUM ('Standard', 'Large');
CREATE TYPE screen_assembly AS ENUM ('Component', 'Laminated');
CREATE TYPE compatibility_status AS ENUM ('Yes', 'Cut', 'No');

CREATE TABLE shells (
    id VARCHAR(50) PRIMARY KEY,
    handled_model VARCHAR(50) NOT NULL,
    brand brand NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    mold mold_type NOT NULL
);

CREATE TABLE shell_variants (
    id VARCHAR(50) PRIMARY KEY,
    shell_id VARCHAR(50) NOT NULL REFERENCES shells(id),
    name VARCHAR(100) NOT NULL,
    supplement DOUBLE PRECISION NOT NULL DEFAULT 0,
    color_hex VARCHAR(7) NOT NULL,
    image_url TEXT NOT NULL,
    is_transparent BOOLEAN NOT NULL DEFAULT FALSE
);

-- ========================================
-- 📺 SCREENS (Écrans)
-- ========================================

CREATE TABLE screens (
    id VARCHAR(50) PRIMARY KEY,
    handled_model VARCHAR(50) NOT NULL,
    brand brand NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    size screen_size NOT NULL,
    assembly screen_assembly NOT NULL
);

CREATE TABLE screen_variants (
    id VARCHAR(50) PRIMARY KEY,
    screen_id VARCHAR(50) NOT NULL REFERENCES screens(id),
    name VARCHAR(100) NOT NULL,
    supplement DOUBLE PRECISION NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL
);

-- ========================================
-- 🔍 LENSES (Vitres)
-- ========================================

CREATE TABLE lenses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    size screen_size NOT NULL
);

CREATE TABLE lens_variants (
    id VARCHAR(50) PRIMARY KEY,
    lens_id VARCHAR(50) NOT NULL REFERENCES lenses(id),
    name VARCHAR(100) NOT NULL,
    supplement DOUBLE PRECISION NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL
);

-- ========================================
-- 🔀 COMPATIBILITY MATRIX
-- ========================================

CREATE TABLE shell_screen_compatibility (
    screen_id VARCHAR(50) NOT NULL REFERENCES screens(id),
    shell_id VARCHAR(50) NOT NULL REFERENCES shells(id),
    status compatibility_status NOT NULL,
    PRIMARY KEY (screen_id, shell_id)
);
