// src/models/pack.rs
// ========================================
// 📦 Pack - Configuration pré-définie
// ========================================

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Pack {
    pub id: String,
    pub name: String,
    pub description: String,
    pub image_url: Option<String>,
    pub shell_variant_id: String,
    pub screen_variant_id: String,
    pub lens_variant_id: Option<String>,
    pub sort_order: i32,
}

/// Surcharges optionnelles lors de la résolution d'un pack
#[derive(Debug, Clone, Deserialize)]
pub struct PackOverrides {
    pub shell_variant_id: Option<String>,
    pub screen_variant_id: Option<String>,
    pub lens_variant_id: Option<String>,
}

#[derive(Debug, PartialEq)]
pub struct ResolvedComponents {
    pub shell_variant_id: String,
    pub screen_variant_id: Option<String>,
    pub lens_variant_id: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct PackWithPrice {
    #[serde(flatten)]
    pub pack: Pack,
    pub price: f64,
}

