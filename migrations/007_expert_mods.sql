-- ========================================
-- 🔧 EXPERT MODS - Table des mods avancés
-- ========================================

CREATE TYPE expert_mod_category AS ENUM ('Cpu', 'Audio', 'Power');

CREATE TABLE expert_mods (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category expert_mod_category NOT NULL,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    technical_specs JSONB NOT NULL DEFAULT '{}',
    power_requirements VARCHAR(100),
    description TEXT NOT NULL DEFAULT '',
    tooltip_content TEXT NOT NULL DEFAULT '',
    dependencies TEXT[] NOT NULL DEFAULT '{}'
);
