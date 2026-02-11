// src/models/quote.rs
// ========================================
// 📋 STRUCTS - Devis
// ========================================

use serde::{Deserialize, Serialize};

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

#[derive(Debug, Clone, Deserialize)]
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
