-- ========================================
-- 📦 PACKS (Configurations pré-définies)
-- ========================================

CREATE TABLE IF NOT EXISTS packs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    shell_variant_id VARCHAR(50) NOT NULL REFERENCES shell_variants(id),
    screen_variant_id VARCHAR(50) NOT NULL REFERENCES screen_variants(id),
    lens_variant_id VARCHAR(50) REFERENCES lens_variants(id),
    sort_order INTEGER DEFAULT 0
);
