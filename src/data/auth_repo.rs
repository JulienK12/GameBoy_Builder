// src/data/auth_repo.rs
// ========================================
// 🔐 Dépôt Auth — users (Story 3.0)
// ========================================

use sqlx::PgPool;
use crate::models::User;

/// Crée un utilisateur (email + hash mot de passe). Génère un id unique (uuid).
pub async fn create_user(
    pool: &PgPool,
    email: &str,
    password_hash: &str,
) -> Result<User, sqlx::Error> {
    let id = uuid::Uuid::new_v4().to_string();
    let row = sqlx::query_as::<_, (String, String, String, chrono::NaiveDateTime, Option<chrono::NaiveDateTime>)>(
        r#"
        INSERT INTO users (id, email, password_hash, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, email, password_hash, created_at, last_login_at
        "#,
    )
    .bind(&id)
    .bind(email)
    .bind(password_hash)
    .fetch_one(pool)
    .await?;

    Ok(User {
        id: row.0,
        email: row.1,
        password_hash: row.2,
        created_at: row.3,
        last_login_at: row.4,
    })
}

/// Trouve un utilisateur par email.
pub async fn find_user_by_email(pool: &PgPool, email: &str) -> Result<Option<User>, sqlx::Error> {
    let row = sqlx::query_as::<_, (String, String, String, chrono::NaiveDateTime, Option<chrono::NaiveDateTime>)>(
        "SELECT id, email, password_hash, created_at, last_login_at FROM users WHERE email = $1",
    )
    .bind(email)
    .fetch_optional(pool)
    .await?;

    Ok(row.map(|r| User {
        id: r.0,
        email: r.1,
        password_hash: r.2,
        created_at: r.3,
        last_login_at: r.4,
    }))
}

/// Met à jour last_login_at pour l'utilisateur.
pub async fn update_last_login(pool: &PgPool, user_id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE users SET last_login_at = NOW() WHERE id = $1")
        .bind(user_id)
        .execute(pool)
        .await?;
    Ok(())
}
