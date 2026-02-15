// ========================================
// 🎮 GAMEBOY COLOR CONFIGURATOR - API
// ========================================

mod models;
mod data;
mod logic;
mod api;

use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_http::services::ServeDir;
use axum::http::{header, Method};

#[tokio::main]
async fn main() {
    println!("╔══════════════════════════════════════════════════════════╗");
    println!("║       🎮 GAMEBOY COLOR CONFIGURATOR API 🎮              ║");
    println!("╚══════════════════════════════════════════════════════════╝\n");

    dotenvy::dotenv().ok();

    // 1. Connexion à PostgreSQL
    let pool = data::create_pool().await
        .expect("❌ Impossible de se connecter à PostgreSQL");

    // 2. Appliquer les migrations
    println!("📂 Application des migrations...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("❌ Échec des migrations");

    // 3. Charger le catalogue depuis la DB
    println!("📦 Chargement du catalogue depuis PostgreSQL...");
    let catalog = match data::load_catalog_from_db(&pool).await {
        Ok(c) => Arc::new(c),
        Err(e) => {
            eprintln!("❌ Erreur au chargement du catalogue : {}", e);
            return;
        }
    };

    let state = Arc::new(api::AppState { catalog, pool });

    // 4. CORS : credentials pour cookies, origines autorisées (5173 + 5174 car Vite peut basculer si port occupé)
    let cors_origins = std::env::var("CORS_ORIGIN")
        .map(|s| s.split(',').map(|o| o.trim().to_string()).collect::<Vec<_>>())
        .unwrap_or_else(|_| vec![
            "http://127.0.0.1:5173".to_string(),
            "http://127.0.0.1:5174".to_string(),
            "http://localhost:5173".to_string(),
            "http://localhost:5174".to_string(),
        ]);
    let origins: Vec<_> = cors_origins
        .iter()
        .map(|o| o.parse::<axum::http::HeaderValue>().expect("CORS_ORIGIN invalide"))
        .collect();
    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(origins))
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION, header::ACCEPT])
        .allow_credentials(true);

    // 5. Créer le routeur
    let app = api::create_router(state)
        .nest_service("/assets", ServeDir::new("assets"))
        .layer(cors);

    // 6. Démarrer le serveur
    let addr = "0.0.0.0:3000";
    println!("\n🚀 Serveur démarré sur http://{}", addr);
    println!("   📍 GET  /health          → Vérifier que ça tourne");
    println!("   📍 POST /quote           → Calculer un devis");
    println!("   📍 GET  /catalog/shells  → Liste des coques");
    println!("   📍 GET  /catalog/screens → Liste des écrans");
    println!("   📍 GET  /catalog/lenses  → Liste des vitres");
    println!("   📍 GET  /catalog/buttons → Liste des boutons (tous)");
    println!("   📍 GET  /catalog/packs   → Liste des packs");
    println!("   📍 POST /auth/register   → Inscription");
    println!("   📍 POST /auth/login      → Connexion");
    println!("   📍 POST /auth/logout     → Déconnexion");
    println!("   📍 GET  /auth/me         → Utilisateur connecté");
    println!("\n⏳ En attente de requêtes... (Ctrl+C pour arrêter)\n");

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
