use crate::models::{
    CompatibilityStatus,
    Shell, ShellVariant, Screen, ScreenVariant, Lens, LensVariant, Pack, PackOverrides, ResolvedComponents,
    ExpertMod,
};
use super::Catalog;

impl Catalog {
    pub fn find_shell(&self, id: &str) -> Option<&Shell> {
        self.shells.iter().find(|s| s.id == id)
    }

    pub fn find_shell_variant(&self, id: &str) -> Option<&ShellVariant> {
        self.shell_variants.iter().find(|v| v.id == id)
    }

    pub fn find_screen(&self, id: &str) -> Option<&Screen> {
        self.screens.iter().find(|s| s.id == id)
    }

    pub fn find_screen_variant(&self, id: &str) -> Option<&ScreenVariant> {
        self.screen_variants.iter().find(|v| v.id == id)
    }

    pub fn find_lens(&self, id: &str) -> Option<&Lens> {
        self.lenses.iter().find(|l| l.id == id)
    }

    pub fn find_lens_variant(&self, id: &str) -> Option<&LensVariant> {
        self.lens_variants.iter().find(|v| v.id == id)
    }

    pub fn find_pack(&self, id: &str) -> Option<&Pack> {
        self.packs.iter().find(|p| p.id == id)
    }

    pub fn get_compatibility(&self, screen_id: &str, shell_id: &str) -> CompatibilityStatus {
        self.compatibility_matrix
            .get(&(screen_id.to_string(), shell_id.to_string()))
            .cloned()
            .unwrap_or(CompatibilityStatus::No)
    }

    #[allow(dead_code)]
    pub fn get_variants_for_shell(&self, shell_id: &str) -> Vec<&ShellVariant> {
        self.shell_variants.iter().filter(|v| v.shell_id == shell_id).collect()
    }

    #[allow(dead_code)]
    pub fn get_variants_for_screen(&self, screen_id: &str) -> Vec<&ScreenVariant> {
        self.screen_variants.iter().filter(|v| v.screen_id == screen_id).collect()
    }

    #[allow(dead_code)]
    pub fn get_variants_for_lens(&self, lens_id: &str) -> Vec<&LensVariant> {
        self.lens_variants.iter().filter(|v| v.lens_id == lens_id).collect()
    }

    /// Retourne un mod expert par son id (pour calcul de devis)
    pub fn find_expert_mod(&self, id: &str) -> Option<&ExpertMod> {
        self.expert_mods.iter().find(|m| m.id == id)
    }

    /// Résout un pack en ses composants individuels, en appliquant les overrides éventuels
    pub fn resolve_pack(
        &self,
        pack_id: &str,
        overrides: Option<&PackOverrides>,
    ) -> Result<(ResolvedComponents, String), String> {
        // 1. Trouver le pack
        let pack = self.find_pack(pack_id)
            .ok_or_else(|| format!("❌ Pack introuvable: {}", pack_id))?;

        // 2. Appliquer les overrides (si présents) ou defaults
        // Note: Pack variants are String, Overrides are Option<String>.
        // Logic: Try override -> if None, take pack value.
        
        let shell_variant_id = overrides
            .and_then(|o| o.shell_variant_id.clone())
            .unwrap_or_else(|| pack.shell_variant_id.clone());

        // Screen is mandatory in Pack but overridable to None (maybe? No, pack has String)
        // Wait, Pack has `screen_variant_id: String`. Overrides has `Option<String>`.
        // If override has Some("xxx"), use it. If override is None, use Pack.
        // Wait, standard Option logic.
        let screen_variant_id = overrides
            .and_then(|o| o.screen_variant_id.clone())
            .or_else(|| Some(pack.screen_variant_id.clone()));

        let lens_variant_id = overrides
            .and_then(|o| o.lens_variant_id.clone())
            .or_else(|| pack.lens_variant_id.clone());

        Ok((
            ResolvedComponents {
                shell_variant_id,
                screen_variant_id,
                lens_variant_id,
            },
            pack.name.clone()
        ))
    }
}

#[cfg(test)]
#[path = "catalog_tests.rs"]
mod catalog_tests;
