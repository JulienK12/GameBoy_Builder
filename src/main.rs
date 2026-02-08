// ========================================
// 🎮 GAMEBOY COLOR CONFIGURATOR - API
// ========================================

mod models;
mod data;
mod logic;
mod api;

use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{CorsLayer, Any};
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    println!("╔══════════════════════════════════════════════════════════╗");
    println!("║       🎮 GAMEBOY COLOR CONFIGURATOR API 🎮              ║");
    println!("╚══════════════════════════════════════════════════════════╝\n");

    // 1. Connexion à PostgreSQL
    let pool = data::create_pool().await
        .expect("❌ Impossible de se connecter à PostgreSQL");

    // 2. Charger le catalogue depuis la DB
    println!("📦 Chargement du catalogue depuis PostgreSQL...");
    let catalog = match data::load_catalog_from_db(&pool).await {
        Ok(c) => {
            Arc::new(c)
        }
        Err(e) => {
            eprintln!("❌ Erreur au chargement du catalogue : {}", e);
            return;
        }
    };

    // 2. Configurer CORS (pour le frontend)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // 3. Créer le routeur
    let app = api::create_router(catalog)
        .nest_service("/assets", ServeDir::new("assets"))
        .layer(cors);

    // 4. Démarrer le serveur
    let addr = "0.0.0.0:3000";
    println!("\n🚀 Serveur démarré sur http://{}", addr);
    println!("   📍 GET  /health          → Vérifier que ça tourne");
    println!("   📍 POST /quote           → Calculer un devis");
    println!("   📍 GET  /catalog/shells  → Liste des coques");
    println!("   📍 GET  /catalog/screens → Liste des écrans");
    println!("   📍 GET  /catalog/lenses  → Liste des vitres");
    println!("\n⏳ En attente de requêtes... (Ctrl+C pour arrêter)\n");

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
