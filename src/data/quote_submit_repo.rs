// src/data/quote_submit_repo.rs
// ========================================
// 📤 Quote submissions — persistance "Ready for Build" (Story 4.2)
// ========================================

use sqlx::PgPool;
use serde_json::Value as JsonValue;

/// Paramètres d'insertion d'une soumission de devis.
pub struct InsertSubmissionParams {
    pub user_id: String,
    pub shell_variant_id: String,
    pub screen_variant_id: Option<String>,
    pub lens_variant_id: Option<String>,
    pub expert_options: Option<JsonValue>,
    pub total_price: f64,
}

/// Insère une soumission "Ready for Build" et retourne l'id.
pub async fn insert_submission(
    pool: &PgPool,
    params: &InsertSubmissionParams,
) -> Result<String, sqlx::Error> {
    let id = uuid::Uuid::new_v4().to_string();
    let status = "ready_for_build";

    sqlx::query(
        r#"
        INSERT INTO quote_submissions (id, user_id, shell_variant_id, screen_variant_id, lens_variant_id, expert_options, total_price, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        "#,
    )
    .bind(&id)
    .bind(&params.user_id)
    .bind(&params.shell_variant_id)
    .bind(&params.screen_variant_id)
    .bind(&params.lens_variant_id)
    .bind(params.expert_options.as_ref())
    .bind(params.total_price)
    .bind(status)
    .execute(pool)
    .await?;

    Ok(id)
}
