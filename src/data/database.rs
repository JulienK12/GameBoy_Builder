// src/data/database.rs
// ========================================
// 🐘 CONNEXION POSTGRESQL
// ========================================

use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;

/// Crée un pool de connexions PostgreSQL
pub async fn create_pool() -> Result<PgPool, sqlx::Error> {
    // Charger les variables d'environnement (.env)
    dotenvy::dotenv().ok();
    
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL doit être défini dans .env");
    
    // Créer un pool avec 5 connexions max
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
    
    println!("✅ Connecté à PostgreSQL");
    Ok(pool)
}
