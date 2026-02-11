// src/data/mod.rs
// ========================================
// 📦 Module Data - Chargement des données
// ========================================

pub mod records;
pub mod parser;
pub mod loader;
pub mod catalog;
pub mod database;
pub mod pg_loader;
pub mod auth_repo;
pub mod deck_repo;

// Ré-export pour simplifier
pub use loader::{Catalog, load_catalog};
pub use database::create_pool;
pub use pg_loader::load_catalog_from_db;
