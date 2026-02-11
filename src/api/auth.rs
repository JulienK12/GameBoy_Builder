// src/api/auth.rs
// ========================================
// 🔐 Auth — extractor AuthUser + handlers (Story 3.0)
// ========================================

use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use axum::http::request::Parts;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use validator::ValidateEmail;

use crate::data::auth_repo;
use crate::logic::{generate_jwt, hash_password, verify_jwt, verify_password};

use super::AppState;

// ========== Extractor ==========

/// Utilisateur authentifié (injecté quand le JWT du cookie est valide).
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: String,
    pub email: String,
}

impl AuthUser {
    pub fn user_id(&self) -> &str {
        &self.user_id
    }
    pub fn email(&self) -> &str {
        &self.email
    }
}

/// Lit le cookie `auth_token`, vérifie le JWT, retourne AuthUser ou 401.
#[async_trait]
impl<S> axum::extract::FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts<'a, 'b>(parts: &'a mut Parts, _state: &'b S) -> Result<Self, Self::Rejection> {
        let jar = CookieJar::from_headers(&parts.headers);
        let token = jar
            .get("auth_token")
            .map(|c| c.value().to_string())
            .ok_or((StatusCode::UNAUTHORIZED, "Cookie auth_token absent"))?;

        let claims = verify_jwt(&token).map_err(|_| (StatusCode::UNAUTHORIZED, "JWT invalide ou expiré"))?;

        Ok(AuthUser {
            user_id: claims.sub,
            email: claims.email,
        })
    }
}

// ========== Requêtes / Réponses ==========

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub user: UserInfo,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: String,
    pub email: String,
}

// ========== Handlers ==========

/// POST /auth/register — Créer un compte (email valide, mot de passe ≥ 8 car., hash Argon2).
pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(body): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<UserResponse>), (StatusCode, Json<serde_json::Value>)> {
    if body.password.len() < 8 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Le mot de passe doit contenir au moins 8 caractères" })),
        ));
    }
    if !body.email.validate_email() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Email invalide" })),
        ));
    }

    let hash = hash_password(&body.password).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erreur interne" })),
        )
    })?;

    match auth_repo::create_user(&state.pool, &body.email, &hash).await {
        Ok(user) => Ok((
            StatusCode::CREATED,
            Json(UserResponse {
                user: UserInfo {
                    id: user.id,
                    email: user.email,
                },
            }),
        )),
        Err(e) => {
            if let Some(db_err) = e.as_database_error() {
                if db_err.code().as_deref() == Some("23505") {
                    return Err((
                        StatusCode::BAD_REQUEST,
                        Json(serde_json::json!({ "error": "Cet email est déjà utilisé" })),
                    ));
                }
            }
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erreur lors de la création du compte" })),
            ))
        }
    }
}

/// POST /auth/login — Connexion : vérification mot de passe, JWT en cookie, update last_login_at.
pub async fn login(
    State(state): State<Arc<AppState>>,
    jar: CookieJar,
    Json(body): Json<LoginRequest>,
) -> Result<(CookieJar, (StatusCode, Json<UserResponse>)), (StatusCode, Json<serde_json::Value>)> {
    let user = auth_repo::find_user_by_email(&state.pool, &body.email)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erreur serveur" })),
            )
        })?
        .ok_or((
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "Email ou mot de passe incorrect" })),
        ))?;

    let ok = verify_password(&body.password, &user.password_hash).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erreur serveur" })),
        )
    })?;
    if !ok {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "Email ou mot de passe incorrect" })),
        ));
    }

    let token = generate_jwt(&user.id, &user.email).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erreur serveur" })),
        )
    })?;

    auth_repo::update_last_login(&state.pool, &user.id)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erreur serveur" })),
            )
        })?;

    let mut cookie = Cookie::new("auth_token", token);
    cookie.set_path("/");
    cookie.set_http_only(true);
    // Secure=true si JWT_SECRET défini (prod) ; en dev sans JWT_SECRET le cookie est envoyé sur http://localhost
    cookie.set_secure(std::env::var("JWT_SECRET").is_ok());
    cookie.set_same_site(axum_extra::extract::cookie::SameSite::Lax);

    Ok((
        jar.add(cookie),
        (
            StatusCode::OK,
            Json(UserResponse {
                user: UserInfo {
                    id: user.id,
                    email: user.email,
                },
            }),
        ),
    ))
}

/// POST /auth/logout — Efface le cookie auth_token (Path=/, Max-Age=0 pour conformité AC).
pub async fn logout(jar: CookieJar) -> (CookieJar, StatusCode) {
    let mut removal = Cookie::build(("auth_token", "")).path("/").build();
    removal.make_removal();
    (jar.remove(removal), StatusCode::NO_CONTENT)
}

/// GET /auth/me — Protégé : retourne l'utilisateur connecté (JWT depuis le cookie).
pub async fn me(AuthUser { user_id, email }: AuthUser) -> Json<UserResponse> {
    Json(UserResponse {
        user: UserInfo { id: user_id, email },
    })
}
