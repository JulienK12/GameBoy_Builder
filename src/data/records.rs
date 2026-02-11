// src/data/records.rs
// ========================================
// 📋 Structs pour la lecture CSV (Serde)
// ========================================

use serde::Deserialize;

// ========================================
// 🐚 SHELL RECORDS
// ========================================

#[derive(Debug, Deserialize)]
pub struct ShellRecord {
    #[serde(rename = "ID")]
    pub id: String,
    #[serde(rename = "Handled Model")]
    pub handled_model: String,
    #[serde(rename = "Brand")]
    pub brand: String,
    #[serde(rename = "Model Designation")]
    pub model_designation: String,
    #[serde(rename = "Price")]
    pub price: f64,
    #[serde(rename = "Mold")]
    pub mold: String,
}


#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct ShellVariantRecord {
    #[serde(rename = "Variant_ID")]
    pub variant_id: String,
    #[serde(rename = "Console")]
    pub console: String,
    #[serde(rename = "Shell_ID")]
    pub shell_id: String,
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Supplement")]
    pub supplement: f64,
    #[serde(rename = "Color_Hex")]
    pub color_hex: String,
    #[serde(rename = "Lens_Included")]
    pub lens_included: bool,
    #[serde(rename = "Image_URL")]
    pub image_url: String,
}
// ========================================
// 📺 SCREEN RECORDS
// ========================================

#[derive(Debug, Deserialize)]
pub struct ScreenRecord {
    #[serde(rename = "ID")]
    pub id: String,
    #[serde(rename = "Handled Model")]            // ← ESPACE
    pub handled_model: String,
    #[serde(rename = "Brand")]
    pub brand: String,
    #[serde(rename = "Model Designation")]        // ← ESPACE
    pub model_designation: String,
    #[serde(rename = "Price")]
    pub price: f64,
    #[serde(rename = "Screen Size Category")]     // ← NOUVEAU NOM !
    pub size: String,
    #[serde(rename = "Assembly")]
    pub assembly: String,
}


#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct ScreenVariantRecord {
    #[serde(rename = "Variant_ID")]
    pub variant_id: String,
    #[serde(rename = "Console")]
    pub console: String,
    #[serde(rename = "Screen_ID")]
    pub screen_id: String,
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Supplement")]
    pub supplement: f64,
    #[serde(rename = "Image_URL")]
    pub image_url: String,
}

// ========================================
// 🔍 LENS RECORDS
// ========================================

#[derive(Debug, Deserialize)]
pub struct LensRecord {
    #[serde(rename = "ID")]
    pub id: String,
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Price")]
    pub price: f64,
    #[serde(rename = "Size")]
    pub size: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct LensVariantRecord {
    #[serde(rename = "Variant_ID")]
    pub variant_id: String,
    #[serde(rename = "Console")]
    pub console: String,
    #[serde(rename = "Lens_ID")]
    pub lens_id: String,
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Supplement")]
    pub supplement: f64,
    #[serde(rename = "Image_URL")]
    pub image_url: String,
}

// ========================================
// 🔀 COMPATIBILITY MATRIX RECORD
// ========================================

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct CompatibilityRecord {
    #[serde(rename = "Screen_ID")]
    pub screen_id: String,
    #[serde(rename = "Shell_ID")]
    pub shell_id: String,
    #[serde(rename = "Status")]
    pub status: String,
}
