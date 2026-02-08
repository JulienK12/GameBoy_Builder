-- Fix missing transparency flag
ALTER TABLE shell_variants ADD COLUMN IF NOT EXISTS is_transparent BOOLEAN NOT NULL DEFAULT FALSE;

-- Add preliminary columns for Phase 4: The Oracle (Catalog Sync)
ALTER TABLE shell_variants ADD COLUMN IF NOT EXISTS source_url TEXT; 
ALTER TABLE shell_variants ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
ALTER TABLE shell_variants ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP;
