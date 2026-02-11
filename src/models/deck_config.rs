// src/models/deck_config.rs
// ========================================
// 📋 Deck — user_configurations (Story 3.3)
// ========================================

use serde::{Deserialize, Serialize};

/// Une configuration sauvegardée (ligne `user_configurations`).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserConfiguration {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub configuration: serde_json::Value,
    pub total_price: Option<f64>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

/// Body PUT /deck/:id — renommage (optionnel Story 3.3).
#[derive(Debug, Clone, Deserialize)]
pub struct UpdateDeckConfigRequest {
    pub name: Option<String>,
}

/// Body POST /deck — création d'une configuration.
#[derive(Debug, Clone, Deserialize)]
pub struct CreateDeckConfigRequest {
    pub name: String,
    /// Snapshot QuoteRequest + options expert : shellVariantId, screenVariantId, lensVariantId, selectedExpertOptions?, selectedShellColorHex?
    pub configuration: serde_json::Value,
}

/// Réponse GET /deck.
#[derive(Debug, Serialize)]
pub struct DeckResponse {
    pub configurations: Vec<DeckConfigItem>,
}

/// Élément de liste (exposé API, sans user_id).
#[derive(Debug, Serialize)]
pub struct DeckConfigItem {
    pub id: String,
    pub name: String,
    pub configuration: serde_json::Value,
    pub total_price: Option<f64>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

impl From<UserConfiguration> for DeckConfigItem {
    fn from(c: UserConfiguration) -> Self {
        DeckConfigItem {
            id: c.id,
            name: c.name,
            configuration: c.configuration,
            total_price: c.total_price,
            created_at: c.created_at,
            updated_at: c.updated_at,
        }
    }
}
