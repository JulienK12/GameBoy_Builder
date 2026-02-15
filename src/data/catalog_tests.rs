
#[cfg(test)]
mod tests {
    use crate::data::Catalog;
    use crate::models::{Pack, PackOverrides};

    fn create_test_catalog() -> Catalog {
        Catalog {
            shells: vec![],
            shell_variants: vec![],
            screens: vec![],
            screen_variants: vec![],
            lenses: vec![],
            lens_variants: vec![],
            packs: vec![
                Pack {
                    id: "PACK_TEST".to_string(),
                    name: "Pack Test".to_string(),
                    description: "Desc".to_string(),
                    image_url: None,
                    shell_variant_id: "SHELL_A".to_string(),
                    screen_variant_id: "SCREEN_A".to_string(),
                    lens_variant_id: Some("LENS_A".to_string()),
                    sort_order: 1,
                }
            ],
            compatibility_matrix: std::collections::HashMap::new(),
            expert_mods: vec![],
            buttons: vec![],
            button_variants: vec![],
        }
    }

    #[test]
    fn test_resolve_pack_defaults() {
        let catalog = create_test_catalog();
        
        let (resolved, name) = catalog.resolve_pack("PACK_TEST", None).expect("Should resolve");
        
        assert_eq!(name, "Pack Test");
        assert_eq!(resolved.shell_variant_id, "SHELL_A");
        assert_eq!(resolved.screen_variant_id, Some("SCREEN_A".to_string()));
        assert_eq!(resolved.lens_variant_id, Some("LENS_A".to_string()));
    }

    #[test]
    fn test_resolve_pack_overrides() {
        let catalog = create_test_catalog();
        
        let overrides = PackOverrides {
            shell_variant_id: Some("SHELL_B".to_string()),
            screen_variant_id: None, // Should keep SCREEN_A? No, logic says "try override, if None use pack".
            // Wait, logic implementation:
            // overrides.and_then(|o| o.screen_variant_id.clone()).or_else(...)
            // If overrides.screen_variant_id is None, it falls back to pack.
            // So if I want to override with NOTHING (remove implicit component), can I?
            // The struct PackOverrides has Option<String>. None means "no override specified".
            // So I cannot force "None" if the pack has "Some".
            // But Pack always has components defined by String (shell, screen). Lens is Option.
            
            lens_variant_id: Some("LENS_B".to_string())
        };

        let (resolved, _) = catalog.resolve_pack("PACK_TEST", Some(&overrides)).expect("Should resolve");
        
        assert_eq!(resolved.shell_variant_id, "SHELL_B"); // Overridden
        assert_eq!(resolved.screen_variant_id, Some("SCREEN_A".to_string())); // Fallback to pack
        assert_eq!(resolved.lens_variant_id, Some("LENS_B".to_string())); // Overridden
    }

    #[test]
    fn test_resolve_pack_not_found() {
        let catalog = create_test_catalog();
        assert!(catalog.resolve_pack("UNKNOWN", None).is_err());
    }
}
