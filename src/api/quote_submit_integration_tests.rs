//! Tests d'intégration POST /quote/submit (Story 4.2).
//!
//! Nécessitent PostgreSQL (DATABASE_URL) et JWT_SECRET. Exécuter avec :
//! `cargo test quote_submit -- --ignored` lorsque la base est disponible.

#![cfg(test)]

use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use serde_json::json;
use tower::util::ServiceExt;

use crate::api::{self, AppState};
use crate::data;
use std::sync::Arc;

async fn setup_app() -> Option<axum::Router> {
    dotenvy::dotenv().ok();
    if std::env::var("DATABASE_URL_TEST").is_err() && std::env::var("DATABASE_URL").is_err() {
        return None;
    }
    if std::env::var("JWT_SECRET").is_err() {
        std::env::set_var("JWT_SECRET", "test-secret-pour-integration-min-32-caracteres!!");
    }
    let pool = data::create_pool_for_tests().await.ok()?;
    let _ = sqlx::migrate!("./migrations").run(&pool).await.ok()?;
    let catalog = data::load_catalog_from_db(&pool).await.ok()?;
    let state = Arc::new(AppState {
        catalog: Arc::new(catalog),
        pool,
    });
    Some(api::create_router(state))
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_quote_submit_without_cookie_returns_401() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let body = json!({
        "shell_variant_id": "VAR_SHELL_GBC_OEM_GRAPE",
        "screen_variant_id": null,
        "lens_variant_id": null
    });
    let req = Request::builder()
        .method("POST")
        .uri("/quote/submit")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED, "sans cookie → 401");
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_quote_submit_with_valid_cookie_returns_201_and_persists() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let email = format!(
        "submit-{}@example.com",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    );
    let auth_body = json!({ "email": email, "password": "password123" });

    let req = Request::builder()
        .method("POST")
        .uri("/auth/register")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&auth_body).unwrap()))
        .unwrap();
    let _ = app.clone().oneshot(req).await.unwrap();

    let req = Request::builder()
        .method("POST")
        .uri("/auth/login")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&auth_body).unwrap()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let cookie = res
        .headers()
        .get("set-cookie")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    let submit_body = json!({
        "shell_variant_id": "VAR_SHELL_GBC_OEM_GRAPE",
        "screen_variant_id": null,
        "lens_variant_id": "VAR_LENS_GBC_STD_BLACK"
    });
    let req = Request::builder()
        .method("POST")
        .uri("/quote/submit")
        .header("content-type", "application/json")
        .header("cookie", cookie)
        .body(Body::from(serde_json::to_vec(&submit_body).unwrap()))
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::CREATED, "avec cookie + config valide → 201");

    let bytes = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(json.get("success").and_then(|v| v.as_bool()), Some(true));
    let submission_id = json
        .get("submission_id")
        .and_then(|v| v.as_str())
        .expect("submission_id dans la réponse");
    assert!(!submission_id.is_empty(), "submission_id non vide");

    // Vérifier la persistance en base (Task 6.1 — persistance conforme)
    let pool = data::create_pool_for_tests().await.expect("pool pour vérification persistance");
    let row: (String, String, f64, String) = sqlx::query_as(
        "SELECT id, shell_variant_id, total_price, status FROM quote_submissions WHERE id = $1",
    )
    .bind(submission_id)
    .fetch_one(&pool)
    .await
    .expect("une ligne quote_submissions doit exister après 201");
    assert_eq!(row.0, submission_id);
    assert_eq!(row.1, "VAR_SHELL_GBC_OEM_GRAPE");
    assert!(row.2 >= 0.0);
    assert_eq!(row.3, "ready_for_build");
}
