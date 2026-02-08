// src/models/quote.rs
// ========================================
// 📋 STRUCTS - Devis
// ========================================

use serde::{Serialize, Deserialize};

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
