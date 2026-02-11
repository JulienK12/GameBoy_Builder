// src/models/user.rs
// ========================================
// 👤 Modèle User (Story 3.0)
// ========================================

use serde::{Deserialize, Serialize};

/// Utilisateur persisté (table `users`)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub created_at: chrono::NaiveDateTime,
    pub last_login_at: Option<chrono::NaiveDateTime>,
}

/// Payload pour création d'un utilisateur (email + mot de passe en clair, hashé côté service)
#[derive(Debug, Clone, Deserialize)]
pub struct UserCreate {
    pub email: String,
    pub password: String,
}
