// src/data/parser.rs
// ========================================
// 🔄 FONCTIONS DE PARSING - String → Enum
// ========================================

use crate::models::{Brand, MoldType, ScreenSize, ScreenAssembly, CompatibilityStatus};

pub fn parse_brand(brand: &str) -> Result<Brand, String> {
    match brand {
        "OEM" => Ok(Brand::OEM),
        "FunnyPlaying" => Ok(Brand::FunnyPlaying),
        "Hispeedido" => Ok(Brand::Hispeedido),
        "Cloud Game Store" => Ok(Brand::CloudGameStore),
        "ExtremeRate" => Ok(Brand::ExtremeRate),
        _ => Err(format!("Marque inconnue: {}", brand)),
    }
}

pub fn parse_mold_type(mold: &str) -> Result<MoldType, String> {
    match mold {
        "OEMstandard" => Ok(MoldType::OemStandard),
        "IPSready" => Ok(MoldType::IpsReady),
        "LaminateReady" => Ok(MoldType::LaminatedReady),
        _ => Err(format!("Type de moulage inconnu: {}", mold)),
    }
}

pub fn parse_screen_size(size: &str) -> Result<ScreenSize, String> {
    match size {
        "Standard" => Ok(ScreenSize::Standard),
        "Large" => Ok(ScreenSize::Large),
        _ => Err(format!("Taille d'écran inconnue: {}", size)),
    }
}

pub fn parse_screen_assembly(assembly: &str) -> Result<ScreenAssembly, String> {
    match assembly {
        "Component" => Ok(ScreenAssembly::Component),
        "Laminated" => Ok(ScreenAssembly::Laminated),
        _ => Err(format!("Type d'assemblage inconnu: {}", assembly)),
    }
}

pub fn parse_compatibility_status(status: &str) -> Result<CompatibilityStatus, String> {
    match status {
        "Yes" => Ok(CompatibilityStatus::Yes),
        "Cut" => Ok(CompatibilityStatus::Cut),
        "No" => Ok(CompatibilityStatus::No),
        _ => Err(format!("Status de compatibilité inconnu: {}", status)),
    }
}
