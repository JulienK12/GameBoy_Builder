// src/api/quote_submit.rs
// ========================================
// 📤 POST /quote/submit — Validation finale & Ready for Build (Story 4.2)
// ========================================

use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde::Serialize;
use std::sync::Arc;

use crate::api::{auth::AuthUser, AppState};
use crate::models::QuoteRequest;
use crate::data::quote_submit_repo;
use crate::logic::calculate_quote;
use crate::models::ExpertOptions;

#[derive(Debug, Serialize)]
pub struct SubmitQuoteResponse {
    pub success: bool,
    pub submission_id: Option<String>,
}

/// POST /quote/submit — Config valide + auth requise → persistance "Ready for Build".
pub async fn submit_handler(
    State(state): State<Arc<AppState>>,
    AuthUser { user_id, .. }: AuthUser,
    Json(body): Json<QuoteRequest>,
) -> Result<(StatusCode, Json<SubmitQuoteResponse>), (StatusCode, Json<serde_json::Value>)> {
    let shell_variant_id = body
        .shell_variant_id
        .as_ref()
        .ok_or((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "shell_variant_id requis" })),
        ))?;

    let expert_options = body.expert_options.as_ref().map(ExpertOptions::from);

    let quote = calculate_quote(
        &state.catalog,
        shell_variant_id,
        body.screen_variant_id.as_deref(),
        body.lens_variant_id.as_deref(),
        body.button_variant_id.as_deref(),
        expert_options.as_ref(),
        body.selected_buttons.as_ref(),
    )
    .map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": e })),
        )
    })?;

    let expert_options_json = body.expert_options.as_ref().map(serde_json::to_value).transpose().map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "expert_options invalide" })),
        )
    })?;

    let params = quote_submit_repo::InsertSubmissionParams {
        user_id: user_id.clone(),
        shell_variant_id: shell_variant_id.clone(),
        screen_variant_id: body.screen_variant_id.clone(),
        lens_variant_id: body.lens_variant_id.clone(),
        expert_options: expert_options_json,
        total_price: quote.total_price,
    };

    let submission_id = quote_submit_repo::insert_submission(&state.pool, &params)
        .await
        .map_err(|e| {
            eprintln!("POST /quote/submit insert error: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erreur lors de l'enregistrement" })),
            )
        })?;

    Ok((
        StatusCode::CREATED,
        Json(SubmitQuoteResponse {
            success: true,
            submission_id: Some(submission_id),
        }),
    ))
}
