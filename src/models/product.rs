// src/models/product.rs
// ========================================
// 🧱 STRUCTS - Produits du catalogue
// ========================================

use super::enums::{Brand, MoldType, ScreenSize, ScreenAssembly};
use serde::Serialize;
use sqlx::FromRow;

// === COQUES ===

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Shell {
    pub id: String,
    pub handled_model: String,
    pub brand: Brand,
    pub name: String,
    pub price: f64,
    pub mold: MoldType,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct ShellVariant {
    pub id: String,
    pub shell_id: String,
    pub name: String,
    pub supplement: f64,
    pub color_hex: String,
    pub image_url: String,
    pub is_transparent: bool,
}

// === ÉCRANS ===

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Screen {
    pub id: String,
    pub handled_model: String,
    pub brand: Brand,
    pub name: String,
    pub price: f64,
    pub size: ScreenSize,
    pub assembly: ScreenAssembly,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct ScreenVariant {
    pub id: String,
    pub screen_id: String,
    pub name: String,
    pub supplement: f64,
    pub image_url: String,
}

// === VITRES ===

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Lens {
    pub id: String,
    pub name: String,
    pub price: f64,
    pub size: ScreenSize,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct LensVariant {
    pub id: String,
    pub lens_id: String,
    pub name: String,
    pub supplement: f64,
    pub image_url: String,
}
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct ShellScreenCompatibility {
    pub shell_id: String,
    pub screen_id: String,
    pub status: String,
}
