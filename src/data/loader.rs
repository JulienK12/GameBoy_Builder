// src/data/loader.rs
// ========================================
// 📥 FONCTIONS DE CHARGEMENT CSV
// ========================================

use std::collections::HashMap;
use std::error::Error;
use std::fs::File;
use csv::ReaderBuilder;

use crate::models::{
    Shell, ShellVariant, Screen, ScreenVariant, 
    Lens, LensVariant, CompatibilityStatus, Pack,
    Button, ButtonVariant,
};
use super::records::*;
use super::parser::*;

// ========================================
// 📦 CATALOGUE COMPLET
// ========================================

#[derive(Debug)]
pub struct Catalog {
    pub shells: Vec<Shell>,
    pub shell_variants: Vec<ShellVariant>,
    pub screens: Vec<Screen>,
    pub screen_variants: Vec<ScreenVariant>,
    pub lenses: Vec<Lens>,
    pub lens_variants: Vec<LensVariant>,
    pub compatibility_matrix: HashMap<(String, String), CompatibilityStatus>,
    pub packs: Vec<Pack>,
    pub expert_mods: Vec<crate::models::ExpertMod>,
    pub buttons: Vec<Button>,
    pub button_variants: Vec<ButtonVariant>,
}

// ========================================
// 📥 FONCTIONS DE CHARGEMENT
// ========================================

pub fn load_shells(path: &str) -> Result<Vec<Shell>, Box<dyn Error>> {
    let file = File::open(path)?;
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(file);

    let mut shells = Vec::new();

    for result in rdr.deserialize() {
        let record: ShellRecord = result?;
        let shell = Shell {
            id: record.id,
            handled_model: record.handled_model,
            brand: parse_brand(&record.brand)?,
            name: record.model_designation,
            price: record.price,
            mold: parse_mold_type(&record.mold)?,
        };
        shells.push(shell);
    }

    Ok(shells)
}

pub fn load_shell_variants(path: &str) -> Result<Vec<ShellVariant>, Box<dyn Error>> {
    let file = File::open(path)?;
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(file);

    let mut variants = Vec::new();

    for result in rdr.deserialize() {
        let record: ShellVariantRecord = result?;
        let variant = ShellVariant {
            id: record.variant_id,
            shell_id: record.shell_id,
            name: record.name.clone(),
            supplement: record.supplement,
            color_hex: record.color_hex,
            image_url: record.image_url,
            is_transparent: record.name.to_lowercase().contains("clear") || 
                            record.name.to_lowercase().contains("atomic") || 
                            record.name.to_lowercase().contains("transparent"),
        };
        variants.push(variant);
    }

    Ok(variants)
}

pub fn load_screens(path: &str) -> Result<Vec<Screen>, Box<dyn Error>> {
    let file = File::open(path)?;
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(file);

    let mut screens = Vec::new();

    for result in rdr.deserialize() {
        let record: ScreenRecord = result?;
        let screen = Screen {
            id: record.id,
            handled_model: record.handled_model,
            brand: parse_brand(&record.brand)?,
            name: record.model_designation,
            price: record.price,
            size: parse_screen_size(&record.size)?,
            assembly: parse_screen_assembly(&record.assembly)?,
};
        screens.push(screen);
    }

    Ok(screens)
}

pub fn load_screen_variants(path: &str) -> Result<Vec<ScreenVariant>, Box<dyn Error>> {
    let file = File::open(path)?;
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(file);

    let mut variants = Vec::new();

    for result in rdr.deserialize() {
        let record: ScreenVariantRecord = result?;
        let variant = ScreenVariant {
            id: record.variant_id,
            screen_id: record.screen_id,
            name: record.name,
            supplement: record.supplement,
            image_url: record.image_url,
        };
        variants.push(variant);
    }

    Ok(variants)
}

pub fn load_lenses(path: &str) -> Result<Vec<Lens>, Box<dyn Error>> {
    let file = File::open(path)?;
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(file);

    let mut lenses = Vec::new();

    for result in rdr.deserialize() {
        let record: LensRecord = result?;
        let lens = Lens {
            id: record.id,
            name: record.name,
            price: record.price,
            size: parse_screen_size(&record.size)?,
        };
        lenses.push(lens);
    }

    Ok(lenses)
}

pub fn load_lens_variants(path: &str) -> Result<Vec<LensVariant>, Box<dyn Error>> {
    let file = File::open(path)?;
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(file);

    let mut variants = Vec::new();

    for result in rdr.deserialize() {
        let record: LensVariantRecord = result?;
        let variant = LensVariant {
            id: record.variant_id,
            lens_id: record.lens_id,
            name: record.name,
            supplement: record.supplement,
            image_url: record.image_url,
        };
        variants.push(variant);
    }

    Ok(variants)
}

pub fn load_compatibility_matrix(path: &str) -> Result<HashMap<(String, String), CompatibilityStatus>, Box<dyn Error>> {
    let file = File::open(path)?;
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(file);

    let headers = rdr.headers()?.clone();
    let shell_ids: Vec<String> = headers.iter().skip(1).map(|s| s.to_string()).collect();

    let mut matrix = HashMap::new();

    for result in rdr.records() {
        let record = result?;
        let screen_id = record.get(0).unwrap_or("").to_string();

        for (i, shell_id) in shell_ids.iter().enumerate() {
            let status_str = record.get(i + 1).unwrap_or("No");
            let status = parse_compatibility_status(status_str)?;
            matrix.insert((screen_id.clone(), shell_id.clone()), status);
        }
    }

    Ok(matrix)
}

// ========================================
// 📦 CHARGEMENT COMPLET
// ========================================

pub fn load_catalog() -> Result<Catalog, Box<dyn Error>> {
    println!("📂 Chargement du catalogue...");

    let shells = load_shells("data/Shell_List.csv")?;
    println!("   ✅ {} coques chargées", shells.len());

    let shell_variants = load_shell_variants("data/Shell_Variants.csv")?;
    println!("   ✅ {} variantes de coques chargées", shell_variants.len());

    let screens = load_screens("data/Screen_List.csv")?;
    println!("   ✅ {} écrans chargés", screens.len());

    let screen_variants = load_screen_variants("data/Screen_Variants.csv")?;
    println!("   ✅ {} variantes d'écrans chargées", screen_variants.len());

    let lenses = load_lenses("data/Lens_List.csv")?;
    println!("   ✅ {} vitres chargées", lenses.len());

    let lens_variants = load_lens_variants("data/Lens_Variants.csv")?;
    println!("   ✅ {} variantes de vitres chargées", lens_variants.len());

    let compatibility_matrix = load_compatibility_matrix("data/Shell_Screen_Matrix.csv")?;
    println!("   ✅ {} règles de compatibilité chargées", compatibility_matrix.len());

    Ok(Catalog {
        shells,
        shell_variants,
        screens,
        screen_variants,
        lenses,
        lens_variants,
        compatibility_matrix,
        packs: Vec::new(), // Les packs ne sont chargés que depuis PostgreSQL
        expert_mods: Vec::new(), // Les mods expert sont chargés depuis PostgreSQL
        buttons: Vec::new(), // Les boutons sont chargés depuis PostgreSQL
        button_variants: Vec::new(), // Les variantes de boutons sont chargées depuis PostgreSQL
    })
}
