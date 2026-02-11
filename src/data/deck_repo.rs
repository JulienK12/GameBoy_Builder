// src/data/deck_repo.rs
// ========================================
// 📦 Deck — user_configurations (Story 3.3)
// ========================================

use sqlx::PgPool;
use crate::models::{UserConfiguration, CreateDeckConfigRequest};

/// Liste les configurations d'un utilisateur, triées par created_at.
pub async fn get_configurations(
    pool: &PgPool,
    user_id: &str,
) -> Result<Vec<UserConfiguration>, sqlx::Error> {
    let rows = sqlx::query_as::<_, (
        String,
        String,
        String,
        serde_json::Value,
        Option<f64>,
        chrono::NaiveDateTime,
        chrono::NaiveDateTime,
    )>(
        r#"
        SELECT id, user_id, name, configuration, total_price, created_at, updated_at
        FROM user_configurations
        WHERE user_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    Ok(rows
        .into_iter()
        .map(
            |(id, user_id, name, configuration, total_price, created_at, updated_at)| {
                UserConfiguration {
                    id,
                    user_id,
                    name,
                    configuration,
                    total_price,
                    created_at,
                    updated_at,
                }
            },
        )
        .collect())
}

/// Insère une configuration. Le trigger `check_user_configuration_limit` lève une exception
/// si l'utilisateur a déjà 3 configs (erreur SQL à capturer côté handler).
pub async fn create_configuration(
    pool: &PgPool,
    user_id: &str,
    req: &CreateDeckConfigRequest,
    total_price: Option<f64>,
) -> Result<UserConfiguration, sqlx::Error> {
    let id = uuid::Uuid::new_v4().to_string();
    let row = sqlx::query_as::<_, (
        String,
        String,
        String,
        serde_json::Value,
        Option<f64>,
        chrono::NaiveDateTime,
        chrono::NaiveDateTime,
    )>(
        r#"
        INSERT INTO user_configurations (id, user_id, name, configuration, total_price, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, user_id, name, configuration, total_price, created_at, updated_at
        "#,
    )
    .bind(&id)
    .bind(user_id)
    .bind(&req.name)
    .bind(&req.configuration)
    .bind(total_price)
    .fetch_one(pool)
    .await?;

    Ok(UserConfiguration {
        id: row.0,
        user_id: row.1,
        name: row.2,
        configuration: row.3,
        total_price: row.4,
        created_at: row.5,
        updated_at: row.6,
    })
}

/// Met à jour le nom d'une configuration si elle appartient à l'utilisateur (PUT /deck/:id).
pub async fn update_configuration_name(
    pool: &PgPool,
    config_id: &str,
    user_id: &str,
    name: &str,
) -> Result<Option<UserConfiguration>, sqlx::Error> {
    let row = sqlx::query_as::<_, (
        String,
        String,
        String,
        serde_json::Value,
        Option<f64>,
        chrono::NaiveDateTime,
        chrono::NaiveDateTime,
    )>(
        r#"
        UPDATE user_configurations SET name = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING id, user_id, name, configuration, total_price, created_at, updated_at
        "#,
    )
    .bind(name)
    .bind(config_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    Ok(row.map(
        |(id, user_id, name, configuration, total_price, created_at, updated_at)| {
            UserConfiguration {
                id,
                user_id,
                name,
                configuration,
                total_price,
                created_at,
                updated_at,
            }
        },
    ))
}

/// Supprime une configuration si elle appartient à l'utilisateur. Retourne true si une ligne a été supprimée.
pub async fn delete_configuration(
    pool: &PgPool,
    config_id: &str,
    user_id: &str,
) -> Result<bool, sqlx::Error> {
    let result = sqlx::query(
        "DELETE FROM user_configurations WHERE id = $1 AND user_id = $2",
    )
    .bind(config_id)
    .bind(user_id)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() > 0)
}
