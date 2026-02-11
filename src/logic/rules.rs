// src/logic/rules.rs
// ========================================
// 🔍 VALIDATION DES DÉPENDANCES EXPERT MODS
// ========================================

use crate::models::ExpertOptions;
use crate::data::Catalog;

const CLEANAMP_MIN_MAH: i32 = 1700;

/// Valide les dépendances des mods expert sélectionnés
///
/// Règles de validation :
/// - CleanAmp Pro nécessite une batterie d'au moins 1700mAh
/// - Autres dépendances à définir selon les mods
pub fn validate_expert_dependencies(
    expert_options: &ExpertOptions,
    catalog: &Catalog,
) -> Result<(), String> {
    if let Some(audio_mod_id) = &expert_options.audio {
        if audio_mod_id == "MOD_AUDIO_CLEANAMP_PRO" {
            match &expert_options.power {
                None => {
                    return Err("CleanAmp Pro nécessite une batterie d'au moins 1700mAh. Aucune batterie sélectionnée.".to_string());
                }
                Some(s) if s.is_empty() => {
                    return Err("CleanAmp Pro nécessite une batterie d'au moins 1700mAh. Aucune batterie sélectionnée.".to_string());
                }
                Some(power_mod_id) => {
                    let power_mod = catalog
                        .find_expert_mod(power_mod_id)
                        .ok_or_else(|| format!("Batterie « {} » introuvable dans le catalogue.", power_mod_id))?;
                    let capacite_mah: i32 = power_mod
                        .technical_specs
                        .get("capacite")
                        .and_then(|v| v.as_str())
                        .map(|s| s.replace("mAh", "").trim().parse().unwrap_or(0))
                        .unwrap_or(0);
                    if capacite_mah < CLEANAMP_MIN_MAH {
                        return Err(format!(
                            "CleanAmp Pro nécessite une batterie d'au moins 1700mAh. La batterie sélectionnée ({}mAh) a une capacité insuffisante.",
                            capacite_mah
                        ));
                    }
                }
            }
        }
    }

    Ok(())
}

// ========================================
// 🧪 TESTS UNITAIRES
// ========================================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::data::load_catalog;
    use crate::models::{ExpertMod, ExpertModCategory};
    use serde_json::json;

    fn get_catalog() -> Catalog {
        load_catalog().expect("Le catalogue doit se charger pour les tests")
    }

    fn catalog_with_expert_mods() -> Catalog {
        let mut catalog = get_catalog();
        catalog.expert_mods.push(ExpertMod {
            id: "MOD_POWER_BATTERY_1700MAH".to_string(),
            name: "Batterie 1700mAh".to_string(),
            category: ExpertModCategory::Power,
            price: 18.0,
            technical_specs: json!({ "capacite": "1700mAh" }),
            power_requirements: None,
            description: String::new(),
            tooltip_content: String::new(),
            dependencies: vec![],
        });
        catalog.expert_mods.push(ExpertMod {
            id: "MOD_POWER_BATTERY_1000MAH".to_string(),
            name: "Batterie 1000mAh".to_string(),
            category: ExpertModCategory::Power,
            price: 12.0,
            technical_specs: json!({ "capacite": "1000mAh" }),
            power_requirements: None,
            description: String::new(),
            tooltip_content: String::new(),
            dependencies: vec![],
        });
        catalog
    }

    /// Test : CleanAmp Pro sans batterie → erreur de dépendance
    #[test]
    fn test_cleanamp_pro_without_battery_fails() {
        let catalog = get_catalog();
        let expert_options = ExpertOptions {
            cpu: None,
            audio: Some("MOD_AUDIO_CLEANAMP_PRO".to_string()),
            power: None,
        };

        let result = validate_expert_dependencies(&expert_options, &catalog);
        assert!(result.is_err(), "La validation devrait échouer sans batterie");
        assert!(
            result.unwrap_err().contains("CleanAmp Pro nécessite une batterie"),
            "L'erreur doit mentionner la dépendance manquante"
        );
    }

    /// Test : CleanAmp Pro avec batterie 1700mAh → succès
    #[test]
    fn test_cleanamp_pro_with_battery_succeeds() {
        let catalog = catalog_with_expert_mods();
        let expert_options = ExpertOptions {
            cpu: None,
            audio: Some("MOD_AUDIO_CLEANAMP_PRO".to_string()),
            power: Some("MOD_POWER_BATTERY_1700MAH".to_string()),
        };

        let result = validate_expert_dependencies(&expert_options, &catalog);
        assert!(result.is_ok(), "La validation devrait réussir avec une batterie 1700mAh");
    }

    /// Test : CleanAmp Pro avec batterie < 1700mAh → erreur
    #[test]
    fn test_cleanamp_pro_with_battery_under_1700_fails() {
        let catalog = catalog_with_expert_mods();
        let expert_options = ExpertOptions {
            cpu: None,
            audio: Some("MOD_AUDIO_CLEANAMP_PRO".to_string()),
            power: Some("MOD_POWER_BATTERY_1000MAH".to_string()),
        };

        let result = validate_expert_dependencies(&expert_options, &catalog);
        assert!(result.is_err(), "La validation devrait échouer avec une batterie < 1700mAh");
        let err = result.unwrap_err();
        assert!(err.contains("1700mAh"), "L'erreur doit mentionner 1700mAh");
        assert!(err.contains("1000"), "L'erreur doit mentionner la capacité insuffisante");
    }

    /// Test : Pas d'expert options → succès
    #[test]
    fn test_no_expert_options_succeeds() {
        let catalog = get_catalog();
        let expert_options = ExpertOptions {
            cpu: None,
            audio: None,
            power: None,
        };

        let result = validate_expert_dependencies(&expert_options, &catalog);
        assert!(result.is_ok(), "La validation devrait réussir sans expert options");
    }

    /// Test : Autre mod audio sans dépendance → succès
    #[test]
    fn test_other_audio_mod_without_dependency_succeeds() {
        let catalog = get_catalog();
        let expert_options = ExpertOptions {
            cpu: None,
            audio: Some("MOD_AUDIO_OTHER".to_string()),
            power: None,
        };

        let result = validate_expert_dependencies(&expert_options, &catalog);
        assert!(result.is_ok(), "La validation devrait réussir pour un mod sans dépendance");
    }
}
