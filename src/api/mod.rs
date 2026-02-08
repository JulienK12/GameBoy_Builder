// ========================================
// 🌐 API - Module principal
// ========================================

pub mod handlers;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::data::Catalog;

pub fn create_router(catalog: Arc<Catalog>) -> Router {
    Router::new()
        .route("/health", get(handlers::health_check))
        .route("/quote", post(handlers::calculate_quote_handler))
        .route("/catalog/shells", get(handlers::get_shells))
        .route("/catalog/screens", get(handlers::get_screens))
        .route("/catalog/lenses", get(handlers::get_lenses))
        .with_state(catalog)
}
