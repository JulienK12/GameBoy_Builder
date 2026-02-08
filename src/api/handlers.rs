// ========================================
// 🎯 API - Handlers (les fonctions de réponse)
// ========================================

use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::data::Catalog;
use crate::logic::calculate_quote;
use crate::models::Quote;

// ========================================
// 📥 Requêtes entrantes
// ========================================

#[derive(Debug, Deserialize)]
pub struct QuoteRequest {
    pub shell_variant_id: String,
    pub screen_variant_id: Option<String>,
    pub lens_variant_id: Option<String>,
}

// ========================================
// 📤 Réponses sortantes
// ========================================

#[derive(Debug, Serialize)]
pub struct QuoteResponse {
    pub success: bool,
    pub quote: Option<Quote>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
}

// ========================================
// 🎯 Handlers
// ========================================

/// GET /health - Vérifie que le serveur tourne
pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: "0.1.0".to_string(),
    })
}

/// POST /quote - Calcule un devis
pub async fn calculate_quote_handler(
    State(catalog): State<Arc<Catalog>>,
    Json(request): Json<QuoteRequest>,
) -> (StatusCode, Json<QuoteResponse>) {
    
    let result = calculate_quote(
        &catalog,
        &request.shell_variant_id,
        request.screen_variant_id.as_deref(),
        request.lens_variant_id.as_deref(),
    );

    match result {
        Ok(quote) => (
            StatusCode::OK,
            Json(QuoteResponse {
                success: true,
                quote: Some(quote),
                error: None,
            }),
        ),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(QuoteResponse {
                success: false,
                quote: None,
                error: Some(e),
            }),
        ),
    }
}

/// GET /catalog/shells - Liste toutes les coques
pub async fn get_shells(
    State(catalog): State<Arc<Catalog>>,
) -> Json<serde_json::Value> {
    // Convert matrix to list
    let compatibility_list: Vec<crate::models::ShellScreenCompatibility> = catalog.compatibility_matrix.iter()
        .map(|((screen_id, shell_id), status)| crate::models::ShellScreenCompatibility {
            shell_id: shell_id.clone(),
            screen_id: screen_id.clone(),
            status: status.to_string(), // Convert enum to string
        })
        .collect();

    Json(serde_json::json!({
        "shells": catalog.shells,
        "variants": catalog.shell_variants,
        "compatibility": compatibility_list,
    }))
}

/// GET /catalog/screens - Liste tous les écrans
pub async fn get_screens(
    State(catalog): State<Arc<Catalog>>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "screens": catalog.screens,
        "variants": catalog.screen_variants,
    }))
}

/// GET /catalog/lenses - Liste toutes les vitres
pub async fn get_lenses(
    State(catalog): State<Arc<Catalog>>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "lenses": catalog.lenses,
        "variants": catalog.lens_variants,
    }))
}
