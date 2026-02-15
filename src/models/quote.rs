// src/models/quote.rs
// ========================================
// 📋 STRUCTS - Devis
// ========================================

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::PackOverrides;

#[derive(Debug, Clone, Serialize)]
pub struct LineItem {
    pub label: String,
    pub detail: Option<String>,
    pub price: f64,
    pub item_type: String,
}

#[derive(Debug, Serialize)]
pub struct Quote {
    pub items: Vec<LineItem>,
    pub total_price: f64,
    pub warnings: Vec<String>,
}

// ========================================
// 📋 Expert Options Request
// ========================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpertOptionsRequest {
    pub cpu: Option<String>,
    pub audio: Option<String>,
    pub power: Option<String>,
}

// Internal representation for logic layer
#[derive(Debug, Clone)]
pub struct ExpertOptions {
    pub cpu: Option<String>,
    pub audio: Option<String>,
    pub power: Option<String>,
}

impl From<&ExpertOptionsRequest> for ExpertOptions {
    fn from(req: &ExpertOptionsRequest) -> Self {
        ExpertOptions {
            cpu: req.cpu.clone(),
            audio: req.audio.clone(),
            power: req.power.clone(),
        }
    }
}

// ========================================
// 📥 Requêtes entrantes
// ========================================

#[derive(Debug, Deserialize)]
pub struct QuoteRequest {
    // Mode 1 : Sélection manuelle
    pub shell_variant_id: Option<String>,
    pub screen_variant_id: Option<String>,
    pub lens_variant_id: Option<String>,
    pub button_variant_id: Option<String>,
    // Mode 2 : Résolution de pack
    pub pack_id: Option<String>,
    pub overrides: Option<PackOverrides>,
    // Mode 3 : Expert Options (indépendant de pack_id/overrides, peut être combiné avec les deux modes)
    pub expert_options: Option<ExpertOptionsRequest>,
    // Nouveau : Sélection granulaire des boutons (Kit-Centric)
    pub selected_buttons: Option<HashMap<String, String>>,
}
