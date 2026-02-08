// src/models/enums.rs
// ========================================
// 🏷️ ENUMS - Types métier
// ========================================

use serde::{Serialize, Deserialize};
use sqlx::Type;

/// Type de moulage de la coque
#[derive(Debug, PartialEq, Clone, Serialize, Type)]
#[sqlx(type_name = "mold_type", rename_all = "PascalCase")]
pub enum MoldType {
    OemStandard,
    IpsReady,
    LaminatedReady,
}

/// Taille de l'écran
#[derive(Debug, PartialEq, Clone, Serialize, Type)]
#[sqlx(type_name = "screen_size", rename_all = "PascalCase")]
pub enum ScreenSize {
    Standard,  // 2.45"
    Large,     // 2.6" - 2.78"
}

/// Type d'assemblage de l'écran
#[derive(Debug, PartialEq, Clone, Serialize, Type)]
#[sqlx(type_name = "screen_assembly", rename_all = "PascalCase")]
pub enum ScreenAssembly {
    Component,  // Écran seul (nécessite vitre)
    Laminated,  // Écran + vitre collés
}

/// Marque du produit
#[derive(Debug, PartialEq, Clone, Serialize, Type)]
#[sqlx(type_name = "brand")]
pub enum Brand {
    OEM,
    FunnyPlaying,
    Hispeedido,
    CloudGameStore,
    ExtremeRate,
}

/// Statut de compatibilité coque/écran
#[derive(Debug, PartialEq, Clone, Serialize, Type)]
#[sqlx(type_name = "compatibility_status", rename_all = "PascalCase")]
pub enum CompatibilityStatus {
    Yes,  // Compatible directement
    Cut,  // Compatible avec découpe
    No,   // Incompatible
}

impl std::fmt::Display for CompatibilityStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            CompatibilityStatus::Yes => write!(f, "Yes"),
            CompatibilityStatus::Cut => write!(f, "Cut"),
            CompatibilityStatus::No => write!(f, "No"),
        }
    }
}
