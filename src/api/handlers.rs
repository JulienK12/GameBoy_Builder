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

use crate::api::AppState;
use crate::data::Catalog;
use crate::logic::calculate_quote;
use crate::models::{Quote, PackOverrides, ExpertOptionsRequest, ExpertOptions, ExpertMod, ExpertModCategory};
use std::collections::HashMap;

// ========================================
// 📥 Requêtes entrantes
// ========================================

#[derive(Debug, Deserialize)]
pub struct QuoteRequest {
    // Mode 1 : Sélection manuelle
    pub shell_variant_id: Option<String>,
    pub screen_variant_id: Option<String>,
    pub lens_variant_id: Option<String>,
    // Mode 2 : Résolution de pack
    pub pack_id: Option<String>,
    pub overrides: Option<PackOverrides>,
    // Mode 3 : Expert Options (indépendant de pack_id/overrides, peut être combiné avec les deux modes)
    pub expert_options: Option<ExpertOptionsRequest>,
}

// ========================================
// 📤 Réponses sortantes
// ========================================

#[derive(Debug, Serialize)]
pub struct QuoteResponse {
    pub success: bool,
    pub quote: Option<Quote>,
    pub error: Option<String>,
    pub source: Option<String>,
    pub pack_name: Option<String>,
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

/// POST /quote - Calcule un devis (mode manuel ou pack)
pub async fn calculate_quote_handler(
    State(state): State<Arc<AppState>>,
    Json(request): Json<QuoteRequest>,
) -> (StatusCode, Json<QuoteResponse>) {
    let catalog = &state.catalog;

    // Convert expert_options request to internal representation
    let expert_options = request.expert_options.as_ref().map(|eo| ExpertOptions::from(eo));

    // Routage : pack_id présent → résolution de pack, sinon → mode manuel
    let result = if let Some(ref pack_id) = request.pack_id {
        // --- NOUVEAU FLUX : Résolution via Catalog puis Calcul ---
        match catalog.resolve_pack(pack_id, request.overrides.as_ref()) {
            Ok((resolved, pack_name)) => {
                calculate_quote(
                    &catalog,
                    &resolved.shell_variant_id,
                    resolved.screen_variant_id.as_deref(),
                    resolved.lens_variant_id.as_deref(),
                    expert_options.as_ref(),
                )
                .map(|quote| (quote, "pack".to_string(), Some(pack_name)))
            },
            Err(e) => Err(e),
        }
    } else if let Some(ref shell_variant_id) = request.shell_variant_id {
        calculate_quote(
            &catalog,
            shell_variant_id,
            request.screen_variant_id.as_deref(),
            request.lens_variant_id.as_deref(),
            expert_options.as_ref(),
        )
        .map(|quote| (quote, "manual".to_string(), None))
    } else {
        Err("❌ Requête invalide : fournir soit un pack_id, soit un shell_variant_id".to_string())
    };

    match result {
        Ok((quote, source, pack_name)) => (
            StatusCode::OK,
            Json(QuoteResponse {
                success: true,
                quote: Some(quote),
                error: None,
                source: Some(source),
                pack_name,
            }),
        ),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(QuoteResponse {
                success: false,
                quote: None,
                error: Some(e),
                source: None,
                pack_name: None,
            }),
        ),
    }
}

/// GET /catalog/shells - Liste toutes les coques
pub async fn get_shells(
    State(state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    let catalog = &state.catalog;
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
    State(state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    let catalog = &state.catalog;
    Json(serde_json::json!({
        "screens": catalog.screens,
        "variants": catalog.screen_variants,
    }))
}

/// GET /catalog/lenses - Liste toutes les vitres
pub async fn get_lenses(
    State(state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    let catalog = &state.catalog;
    Json(serde_json::json!({
        "lenses": catalog.lenses,
        "variants": catalog.lens_variants,
    }))
}

/// GET /catalog/expert-mods - Liste les mods expert groupés par catégorie
pub async fn get_expert_mods(
    State(state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    let catalog = &state.catalog;
    let mut mods_by_category: HashMap<String, Vec<&ExpertMod>> = HashMap::new();

    for mod_item in &catalog.expert_mods {
        let category_key = match mod_item.category {
            ExpertModCategory::Cpu => "cpu",
            ExpertModCategory::Audio => "audio",
            ExpertModCategory::Power => "power",
        }
        .to_string();
        mods_by_category
            .entry(category_key)
            .or_default()
            .push(mod_item);
    }

    Json(serde_json::json!({
        "mods": {
            "cpu": mods_by_category.get("cpu").unwrap_or(&vec![]),
            "audio": mods_by_category.get("audio").unwrap_or(&vec![]),
            "power": mods_by_category.get("power").unwrap_or(&vec![]),
        }
    }))
}

/// GET /catalog/packs - Liste tous les packs pré-configurés avec prix
pub async fn get_packs(
    State(state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    let catalog = &state.catalog;
    let packs_with_price: Vec<crate::models::PackWithPrice> = catalog.packs.iter()
        .map(|pack| {
            // Calculer le prix en utilisant la logique centralisée
            let price = catalog.resolve_pack(&pack.id, None)
                .and_then(|(resolved, _)| {
                    calculate_quote(
                        &catalog, 
                        &resolved.shell_variant_id, 
                        resolved.screen_variant_id.as_deref(), 
                        resolved.lens_variant_id.as_deref(),
                        None // No expert options when calculating pack prices
                    )
                })
                .map(|quote| quote.total_price)
                .unwrap_or(0.0);

            crate::models::PackWithPrice {
                pack: pack.clone(),
                price,
            }
        })
        .collect();

    Json(serde_json::json!({
        "packs": packs_with_price,
    }))
}
