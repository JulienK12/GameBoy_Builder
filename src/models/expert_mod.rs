// src/models/expert_mod.rs
// ========================================
// 🔧 Expert Mod - Mods avancés CPU, Audio, Alimentation
// ========================================

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use super::ExpertModCategory;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ExpertMod {
    pub id: String,
    pub name: String,
    pub category: ExpertModCategory,
    pub price: f64,
    pub technical_specs: JsonValue,
    pub power_requirements: Option<String>,
    pub description: String,
    pub tooltip_content: String,
    pub dependencies: Vec<String>,
}
