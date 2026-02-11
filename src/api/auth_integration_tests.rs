//! Tests d'intégration auth (Story 3.0).
//!
//! Nécessitent PostgreSQL (DATABASE_URL) et JWT_SECRET. Sans DB, les tests sont marqués
//! `#[ignore]` pour éviter des faux positifs en CI. Exécuter avec :
//! `cargo test -- --ignored` lorsque la base est disponible.

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

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_register_returns_201_then_login_returns_200_and_cookie() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let email = format!("test-{}@example.com", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());
    let body = json!({ "email": email, "password": "password123" });

    let req = Request::builder()
        .method("POST")
        .uri("/auth/register")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::CREATED, "register doit retourner 201");

    let req = Request::builder()
        .method("POST")
        .uri("/auth/login")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK, "login doit retourner 200");
    assert!(res.headers().get("set-cookie").is_some(), "login doit renvoyer un cookie");
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_login_wrong_password_returns_401() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let body = json!({ "email": "nonexistent@example.com", "password": "wrongpassword" });
    let req = Request::builder()
        .method("POST")
        .uri("/auth/login")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_me_without_cookie_returns_401() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let req = Request::builder()
        .method("GET")
        .uri("/auth/me")
        .body(Body::empty())
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_me_with_valid_cookie_returns_200() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let email = format!("me-test-{}@example.com", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());
    let body = json!({ "email": email.clone(), "password": "password123" });

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
    let cookie = res
        .headers()
        .get("set-cookie")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    let req = Request::builder()
        .method("GET")
        .uri("/auth/me")
        .header("cookie", cookie)
        .body(Body::empty())
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_register_duplicate_email_returns_400() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };
    let email = format!("dup-{}@example.com", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());
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
        .uri("/auth/register")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
}
