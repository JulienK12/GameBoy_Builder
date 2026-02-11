//! Tests d'intégration deck (Story 3.3).
//!
//! Nécessitent PostgreSQL (DATABASE_URL) et JWT_SECRET. Exécuter avec :
//! `cargo test deck_integration -- --ignored`

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
    if std::env::var("DATABASE_URL").is_err() {
        return None;
    }
    if std::env::var("JWT_SECRET").is_err() {
        std::env::set_var("JWT_SECRET", "test-secret-pour-integration-min-32-caracteres!!");
    }
    let pool = data::create_pool().await.ok()?;
    let _ = sqlx::migrate!("./migrations").run(&pool).await.ok()?;
    let catalog = data::load_catalog_from_db(&pool).await.ok()?;
    let state = Arc::new(AppState {
        catalog: Arc::new(catalog),
        pool,
    });
    Some(api::create_router(state))
}

async fn register_and_login(app: &axum::Router, email: &str) -> String {
    let body = json!({ "email": email, "password": "password123" });
    let req = Request::builder()
        .method("POST")
        .uri("/auth/register")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let _ = app.clone().oneshot(req).await.unwrap();

    let req = Request::builder()
        .method("POST")
        .uri("/auth/login")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    res.headers()
        .get("set-cookie")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string()
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_get_deck_without_cookie_returns_401() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let req = Request::builder()
        .method("GET")
        .uri("/deck")
        .body(Body::empty())
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_get_deck_with_valid_cookie_returns_empty_list() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let email = format!(
        "deck-get-{}@example.com",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    );
    let cookie = register_and_login(&app, &email).await;
    let req = Request::builder()
        .method("GET")
        .uri("/deck")
        .header("cookie", cookie)
        .body(Body::empty())
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert!(json.get("configurations").and_then(|c| c.as_array()).map_or(false, |a| a.is_empty()));
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_post_deck_creates_then_get_returns_list() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let email = format!(
        "deck-post-{}@example.com",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    );
    let cookie = register_and_login(&app, &email).await;

    let body = json!({
        "name": "Ma config",
        "configuration": {
            "shellVariantId": "VAR_SHELL_GBC_FP_ATOMIC_PURPLE",
            "screenVariantId": null,
            "lensVariantId": null
        }
    });
    let req = Request::builder()
        .method("POST")
        .uri("/deck")
        .header("cookie", cookie.clone())
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);

    let req = Request::builder()
        .method("GET")
        .uri("/deck")
        .header("cookie", cookie)
        .body(Body::empty())
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    let configs = json.get("configurations").and_then(|c| c.as_array()).unwrap();
    assert_eq!(configs.len(), 1);
    assert_eq!(configs[0].get("name").and_then(|v| v.as_str()), Some("Ma config"));
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_fourth_post_deck_returns_409() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let email = format!(
        "deck-limit-{}@example.com",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    );
    let cookie = register_and_login(&app, &email).await;

    let body = json!({
        "name": "Config",
        "configuration": { "shellVariantId": "VAR_SHELL_GBC_FP_ATOMIC_PURPLE", "screenVariantId": null, "lensVariantId": null }
    });
    for _ in 0..3 {
        let req = Request::builder()
            .method("POST")
            .uri("/deck")
            .header("cookie", cookie.clone())
            .header("content-type", "application/json")
            .body(Body::from(serde_json::to_vec(&body).unwrap()))
            .unwrap();
        let res = app.clone().oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::CREATED, "les 3 premiers POST doivent réussir");
    }

    let req = Request::builder()
        .method("POST")
        .uri("/deck")
        .header("cookie", cookie)
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::CONFLICT, "4e POST doit retourner 409");
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_delete_deck_config_returns_204_then_404() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let email = format!(
        "deck-del-{}@example.com",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    );
    let cookie = register_and_login(&app, &email).await;

    let body = json!({
        "name": "To delete",
        "configuration": { "shellVariantId": "VAR_SHELL_GBC_FP_ATOMIC_PURPLE", "screenVariantId": null, "lensVariantId": null }
    });
    let req = Request::builder()
        .method("POST")
        .uri("/deck")
        .header("cookie", cookie.clone())
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);
    let res_body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let created: serde_json::Value = serde_json::from_slice(&res_body).unwrap();
    let id = created
        .get("configuration")
        .and_then(|c| c.get("id"))
        .and_then(|v| v.as_str())
        .unwrap();

    let req = Request::builder()
        .method("DELETE")
        .uri(format!("/deck/{}", id))
        .header("cookie", cookie.clone())
        .body(Body::empty())
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::NO_CONTENT);

    let req = Request::builder()
        .method("DELETE")
        .uri(format!("/deck/{}", id))
        .header("cookie", cookie)
        .body(Body::empty())
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}
