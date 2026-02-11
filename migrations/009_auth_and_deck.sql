-- ========================================
-- 🔐 AUTH & DECK (Epic 3)
-- Tables users et user_configurations
-- Limite stricte : 3 configurations par utilisateur
-- ========================================

-- Utilisateurs (Story 3.0)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Deck — configurations sauvegardées (Story 3.3)
CREATE TABLE user_configurations (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL,
    total_price DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_configurations_user_id ON user_configurations(user_id);

-- Trigger : limite stricte de 3 configurations par utilisateur (VPS CX11)
CREATE OR REPLACE FUNCTION check_user_configuration_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM user_configurations WHERE user_id = NEW.user_id) >= 3 THEN
        RAISE EXCEPTION 'Limite de 3 configurations par utilisateur atteinte'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_configuration_limit
    BEFORE INSERT ON user_configurations
    FOR EACH ROW
    EXECUTE PROCEDURE check_user_configuration_limit();
