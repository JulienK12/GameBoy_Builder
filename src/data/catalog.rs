// src/data/catalog.rs
// ========================================
// 🔍 Méthodes de recherche du Catalogue
// ========================================

use crate::models::{
    CompatibilityStatus,
    Shell, ShellVariant, Screen, ScreenVariant, Lens, LensVariant,
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

    pub fn get_compatibility(&self, screen_id: &str, shell_id: &str) -> CompatibilityStatus {
        self.compatibility_matrix
            .get(&(screen_id.to_string(), shell_id.to_string()))
            .cloned()
            .unwrap_or(CompatibilityStatus::No)
    }

    pub fn get_variants_for_shell(&self, shell_id: &str) -> Vec<&ShellVariant> {
        self.shell_variants.iter().filter(|v| v.shell_id == shell_id).collect()
    }

    pub fn get_variants_for_screen(&self, screen_id: &str) -> Vec<&ScreenVariant> {
        self.screen_variants.iter().filter(|v| v.screen_id == screen_id).collect()
    }

    pub fn get_variants_for_lens(&self, lens_id: &str) -> Vec<&LensVariant> {
        self.lens_variants.iter().filter(|v| v.lens_id == lens_id).collect()
    }
}
