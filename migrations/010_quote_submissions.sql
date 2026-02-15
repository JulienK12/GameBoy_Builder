-- ========================================
-- 📤 QUOTE SUBMISSIONS (Story 4.2)
-- Soumissions "Ready for Build" — validation finale Mode Signature
-- ========================================

CREATE TABLE IF NOT EXISTS quote_submissions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shell_variant_id VARCHAR(100) NOT NULL,
    screen_variant_id VARCHAR(100),
    lens_variant_id VARCHAR(100),
    expert_options JSONB,
    total_price DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ready_for_build',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_user_id ON quote_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_submissions_created_at ON quote_submissions(created_at DESC);
