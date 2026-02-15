// src/data/database.rs
// ========================================
// 🐘 CONNEXION POSTGRESQL
// ========================================

use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;

/// Crée un pool de connexions PostgreSQL (app / dev / prod).
pub async fn create_pool() -> Result<PgPool, sqlx::Error> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL doit être défini dans .env");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
    println!("✅ Connecté à PostgreSQL");
    Ok(pool)
}

/// Crée un pool pour les tests d'intégration.
/// Utilise `DATABASE_URL_TEST` si défini (recommandé : base dédiée), sinon `DATABASE_URL`.
pub async fn create_pool_for_tests() -> Result<PgPool, sqlx::Error> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL_TEST")
        .or_else(|_| env::var("DATABASE_URL"))
        .expect("DATABASE_URL ou DATABASE_URL_TEST doit être défini pour les tests");
    PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await
}
