// src/data/pg_loader.rs
// ========================================
// 🐘 CHARGEMENT DEPUIS POSTGRESQL
// ========================================

use sqlx::PgPool;
use std::collections::HashMap;
use crate::models::{
    Shell, ShellVariant, Screen, ScreenVariant,
    Lens, LensVariant, CompatibilityStatus, Pack, ExpertMod,
    Button, ButtonVariant,
};
use super::Catalog;

pub async fn load_catalog_from_db(pool: &PgPool) -> Result<Catalog, sqlx::Error> {
    println!("📂 Chargement du catalogue depuis PostgreSQL...");

    // Charger les shells
    let shells: Vec<Shell> = sqlx::query_as("SELECT * FROM shells")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} coques chargées", shells.len());

    // Charger les variantes de shells
    let shell_variants: Vec<ShellVariant> = sqlx::query_as("SELECT * FROM shell_variants")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} variantes de coques chargées", shell_variants.len());

    // Charger les screens
    let screens: Vec<Screen> = sqlx::query_as("SELECT * FROM screens")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} écrans chargés", screens.len());

    // Charger les variantes de screens
    let screen_variants: Vec<ScreenVariant> = sqlx::query_as("SELECT * FROM screen_variants")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} variantes d'écrans chargées", screen_variants.len());

    // Charger les lenses
    let lenses: Vec<Lens> = sqlx::query_as("SELECT * FROM lenses")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} vitres chargées", lenses.len());

    // Charger les variantes de lenses
    let lens_variants: Vec<LensVariant> = sqlx::query_as("SELECT * FROM lens_variants")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} variantes de vitres chargées", lens_variants.len());

    // Charger la matrice de compatibilité
    let compat_rows: Vec<(String, String, CompatibilityStatus)> = 
        sqlx::query_as("SELECT screen_id, shell_id, status FROM shell_screen_compatibility")
            .fetch_all(pool)
            .await?;
    
    let mut compatibility_matrix = HashMap::new();
    for (screen_id, shell_id, status) in compat_rows {
        compatibility_matrix.insert((screen_id, shell_id), status);
    }
    println!("   ✅ {} règles de compatibilité chargées", compatibility_matrix.len());

    // Charger les packs
    let packs: Vec<Pack> = sqlx::query_as("SELECT * FROM packs ORDER BY sort_order")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} packs chargés", packs.len());

    // Charger les mods expert
    let expert_mods: Vec<ExpertMod> = sqlx::query_as("SELECT * FROM expert_mods ORDER BY category, id")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} mods expert chargés", expert_mods.len());

    // Charger les boutons
    let buttons: Vec<Button> = sqlx::query_as("SELECT * FROM buttons")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} boutons chargés", buttons.len());

    // Charger les variantes de boutons
    let button_variants: Vec<ButtonVariant> = sqlx::query_as("SELECT * FROM button_variants")
        .fetch_all(pool)
        .await?;
    println!("   ✅ {} variantes de boutons chargées", button_variants.len());

    Ok(Catalog {
        shells,
        shell_variants,
        screens,
        screen_variants,
        lenses,
        lens_variants,
        compatibility_matrix,
        packs,
        expert_mods,
        buttons,
        button_variants,
    })
}
