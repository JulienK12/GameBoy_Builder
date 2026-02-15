// ========================================
// 🌐 API - Module principal
// ========================================

pub mod handlers;
pub mod auth;
pub mod deck;
pub mod quote_submit;

#[cfg(test)]
mod auth_integration_tests;
#[cfg(test)]
mod deck_integration_tests;
#[cfg(test)]
mod quote_submit_integration_tests;
#[cfg(test)]
mod catalog_integration_tests;

use axum::{
    routing::{get, post, put},
    Router,
};
use std::sync::Arc;
use sqlx::PgPool;

use crate::data::Catalog;

/// État partagé de l'application (catalogue + pool DB pour l'auth).
pub struct AppState {
    pub catalog: Arc<Catalog>,
    pub pool: PgPool,
}

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(handlers::health_check))
        .route("/quote", post(handlers::calculate_quote_handler))
        .route("/quote/submit", post(quote_submit::submit_handler))
        .route("/catalog/shells", get(handlers::get_shells))
        .route("/catalog/screens", get(handlers::get_screens))
        .route("/catalog/lenses", get(handlers::get_lenses))
        .route("/catalog/buttons", get(handlers::get_all_buttons))
        .route("/catalog/buttons/:console_id", get(handlers::get_buttons))
        .route("/catalog/expert-mods", get(handlers::get_expert_mods))
        .route("/catalog/packs", get(handlers::get_packs))
        .route("/auth/register", post(auth::register))
        .route("/auth/login", post(auth::login))
        .route("/auth/logout", post(auth::logout))
        .route("/auth/me", get(auth::me))
        .route("/deck", get(deck::get_deck_handler).post(deck::create_deck_config_handler))
        .route(
            "/deck/:id",
            put(deck::update_deck_config_handler).delete(deck::delete_deck_config_handler),
        )
        .with_state(state)
}
