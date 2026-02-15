// src/api/deck.rs
// ========================================
// 🃏 Deck — handlers CRUD (Story 3.3)
// ========================================

use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;

use crate::api::{auth::AuthUser, AppState};
use crate::data::deck_repo;
use crate::logic::calculate_quote;
use crate::models::{
    CreateDeckConfigRequest, DeckConfigItem, DeckResponse, ExpertOptions, UpdateDeckConfigRequest,
};

/// GET /deck — Liste les configurations de l'utilisateur connecté (tri par created_at).
pub async fn get_deck_handler(
    State(state): State<Arc<AppState>>,
    AuthUser { user_id, .. }: AuthUser,
) -> Result<Json<DeckResponse>, (StatusCode, Json<serde_json::Value>)> {
    let configs = deck_repo::get_configurations(&state.pool, &user_id)
        .await
        .map_err(|e| {
            eprintln!("GET /deck error: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erreur lors du chargement du deck" })),
            )
        })?;
    let configurations: Vec<DeckConfigItem> = configs.into_iter().map(Into::into).collect();
    Ok(Json(DeckResponse { configurations }))
}

/// Extrait les paramètres pour calculate_quote depuis le JSON configuration (camelCase frontend).
fn config_to_quote_params(
    config: &serde_json::Value,
) -> Result<(String, Option<String>, Option<String>, Option<ExpertOptions>), String> {
    let shell = config
        .get("shellVariantId")
        .and_then(|v| v.as_str())
        .ok_or("configuration.shellVariantId requis")?
        .to_string();
    let screen = config.get("screenVariantId").and_then(|v| v.as_str()).map(String::from);
    let lens = config.get("lensVariantId").and_then(|v| v.as_str()).map(String::from);
    let expert_opts = config.get("selectedExpertOptions").and_then(|o| {
        let obj = o.as_object()?;
        Some(ExpertOptions {
            cpu: obj.get("cpu").and_then(|v| v.as_str()).map(String::from),
            audio: obj.get("audio").and_then(|v| v.as_str()).map(String::from),
            power: obj.get("power").and_then(|v| v.as_str()).map(String::from),
        })
    });
    Ok((shell, screen, lens, expert_opts))
}

/// POST /deck — Crée une configuration. Limite 3 gérée par le trigger PostgreSQL.
pub async fn create_deck_config_handler(
    State(state): State<Arc<AppState>>,
    AuthUser { user_id, .. }: AuthUser,
    Json(body): Json<CreateDeckConfigRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    if body.name.trim().is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Le nom est requis" })),
        ));
    }

    let total_price = match config_to_quote_params(&body.configuration) {
        Ok((shell, screen, lens, expert_opts)) => {
            match calculate_quote(
                &state.catalog,
                &shell,
                screen.as_deref(),
                lens.as_deref(),
                None, // No button variant
                expert_opts.as_ref(),
                None, // No selected buttons
            ) {
                Ok(quote) => Some(quote.total_price),
                Err(_) => None, // stocker sans prix si config invalide (ex. variante supprimée)
            }
        }
        Err(msg) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(serde_json::json!({ "error": msg })),
            ));
        }
    };

    match deck_repo::create_configuration(&state.pool, &user_id, &body, total_price).await {
        Ok(created) => Ok((
            StatusCode::CREATED,
            Json(serde_json::json!({
                "configuration": {
                    "id": created.id,
                    "name": created.name,
                    "configuration": created.configuration,
                    "total_price": created.total_price,
                    "created_at": created.created_at,
                    "updated_at": created.updated_at
                }
            })),
        )),
        Err(e) => {
            if let Some(db_err) = e.as_database_error() {
                let code = db_err.code().map(|c| c.to_string());
                if code.as_deref() == Some("P0001")
                    || code.as_deref() == Some("23514")
                    || code.as_deref() == Some("check_violation")
                {
                    let msg = db_err.message();
                    if msg.contains("3 configurations") {
                        return Err((
                            StatusCode::CONFLICT,
                            Json(serde_json::json!({
                                "error": "Limite de 3 configurations atteinte"
                            })),
                        ));
                    }
                }
            }
            eprintln!("POST /deck error: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erreur lors de la création" })),
            ))
        }
    }
}

/// PUT /deck/:id — Renomme une configuration (body { name }).
pub async fn update_deck_config_handler(
    State(state): State<Arc<AppState>>,
    AuthUser { user_id, .. }: AuthUser,
    Path(id): Path<String>,
    Json(body): Json<UpdateDeckConfigRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let name = body
        .name
        .filter(|s| !s.trim().is_empty())
        .ok_or((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Le nom est requis pour le renommage" })),
        ))?;
    match deck_repo::update_configuration_name(&state.pool, &id, &user_id, &name).await {
        Ok(Some(updated)) => Ok(Json(serde_json::json!({
            "configuration": {
                "id": updated.id,
                "name": updated.name,
                "configuration": updated.configuration,
                "total_price": updated.total_price,
                "created_at": updated.created_at,
                "updated_at": updated.updated_at
            }
        }))),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Configuration introuvable ou non autorisée" })),
        )),
        Err(e) => {
            eprintln!("PUT /deck/:id error: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erreur lors de la mise à jour" })),
            ))
        }
    }
}

/// DELETE /deck/:id — Supprime une configuration si elle appartient à l'utilisateur.
pub async fn delete_deck_config_handler(
    State(state): State<Arc<AppState>>,
    AuthUser { user_id, .. }: AuthUser,
    Path(id): Path<String>,
) -> Result<StatusCode, (StatusCode, Json<serde_json::Value>)> {
    match deck_repo::delete_configuration(&state.pool, &id, &user_id).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) => Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Configuration introuvable ou non autorisée" })),
        )),
        Err(e) => {
            eprintln!("DELETE /deck/:id error: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erreur lors de la suppression" })),
            ))
        }
    }
}
