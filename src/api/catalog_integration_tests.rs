//! Tests d'intégration pour le catalogue (Story 6.2).
//!
//! Nécessitent PostgreSQL (DATABASE_URL). Sans DB, les tests sont marqués
//! `#[ignore]`.

#![cfg(test)]

use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use tower::util::ServiceExt;
use std::sync::Arc;

use crate::api::{self, AppState};
use crate::data;

async fn setup_app() -> Option<axum::Router> {
    dotenvy::dotenv().ok();
    if std::env::var("DATABASE_URL_TEST").is_err() && std::env::var("DATABASE_URL").is_err() {
        return None;
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
async fn test_get_buttons_gbc_returns_correct_list() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };

    let req = Request::builder()
        .method("GET")
        .uri("/catalog/buttons/gbc")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();

    let buttons = json["buttons"].as_array().expect("Doit être un tableau");
    
    // GBC doit avoir D-pad, A, B, Power, IR
    let expected_names = vec!["D-Pad GBC", "Bouton A GBC", "Bouton B GBC", "Interrupteur ON/OFF GBC", "Cache Infrarouge GBC"];
    
    for name in expected_names {
        assert!(
            buttons.iter().any(|b| b["name"] == name),
            "Doit contenir le bouton : {}", name
        );
    }
    
    // Vérification des variants (AC 2)
    let variants = json["variants"].as_array().expect("Doit être un tableau de variants");
    assert!(!variants.is_empty(), "Doit retourner des variantes pour la GBC");
    assert!(variants.iter().any(|v| v["name"].as_str().unwrap().contains("OEM")), "Doit avoir des variants OEM");
    assert!(variants.iter().any(|v| v["name"].as_str().unwrap().contains("CGS")), "Doit avoir des variants CGS");

    // Vérifier qu'on n'a pas de boutons GBA
    assert!(
        !buttons.iter().any(|b| b["name"].as_str().unwrap().contains("GBA")),
        "Ne doit pas contenir de boutons GBA"
    );
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_get_buttons_dmg_returns_correct_list() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };

    let req = Request::builder()
        .method("GET")
        .uri("/catalog/buttons/dmg")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();

    let buttons = json["buttons"].as_array().expect("Doit être un tableau");
    
    // DMG doit avoir D-pad, A, B, Power
    let expected_names = vec!["D-Pad DMG", "Bouton A DMG", "Bouton B DMG", "Interrupteur ON/OFF DMG"];
    
    for name in expected_names {
        assert!(
            buttons.iter().any(|b| b["name"] == name),
            "Doit contenir le bouton : {}", name
        );
    }

    let variants = json["variants"].as_array().expect("Doit être un tableau de variants");
    assert!(!variants.is_empty(), "Doit retourner des variantes pour la DMG");
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_get_buttons_gba_returns_correct_list() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };

    let req = Request::builder()
        .method("GET")
        .uri("/catalog/buttons/gba")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    let buttons = json["buttons"].as_array().expect("Doit être un tableau");
    
    // GBA doit avoir D-pad, A, B, Power, L, R, Border L, Border R
    assert!(buttons.iter().any(|b| b["name"] == "Bouton L GBA"));
    assert!(buttons.iter().any(|b| b["name"] == "Bordure Gauche GBA"));
    
    let variants = json["variants"].as_array().expect("Doit retourner des variantes pour la GBA");
    assert!(!variants.is_empty(), "Doit retourner des variantes pour la GBA");
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_get_buttons_gbasp_returns_correct_list() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };

    // Test avec ID court "sp"
    let req = Request::builder()
        .method("GET")
        .uri("/catalog/buttons/sp")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    let buttons = json["buttons"].as_array().expect("Doit être un tableau");
    
    // SP doit avoir Volume, Luminosité, Start, Select
    let expected_names = vec!["Glissière Volume SP", "Bouton Luminosité SP", "Bouton Start SP", "Bouton Select SP"];
    for name in expected_names {
        assert!(
            buttons.iter().any(|b| b["name"] == name),
            "Doit contenir le bouton : {}", name
        );
    }
    
    let variants = json["variants"].as_array().expect("Doit être un tableau de variants");
    assert!(!variants.is_empty(), "Doit retourner des variantes pour la SP");
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_get_buttons_short_ids_mapping() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };

    let cases = vec![
        ("gbc", "D-Pad GBC"),
        ("dmg", "D-Pad DMG"),
        ("pocket", "D-Pad DMG"),
        ("gba", "D-Pad GBA"),
        ("sp", "D-Pad SP"),
        ("gbasp", "D-Pad SP"),
    ];

    for (id, expected_btn) in cases {
        let req = Request::builder()
            .method("GET")
            .uri(&format!("/catalog/buttons/{}", id))
            .body(Body::empty())
            .unwrap();

        let res = app.clone().oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::OK, "Échec pour l'ID : {}", id);

        let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        let buttons = json["buttons"].as_array().unwrap();
        
        assert!(
            buttons.iter().any(|b| b["name"] == expected_btn),
            "L'ID '{}' devrait retourner le bouton '{}'", id, expected_btn
        );
    }
}

#[tokio::test]
#[ignore = "requiert DATABASE_URL (PostgreSQL)"]
async fn test_get_buttons_invalid_id_returns_404() {
    let app = match setup_app().await {
        Some(a) => a,
        None => return,
    };

    let req = Request::builder()
        .method("GET")
        .uri("/catalog/buttons/super_nintendo")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);

    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["success"], false);
    assert!(json["error"].as_str().unwrap().contains("not found"));
}
