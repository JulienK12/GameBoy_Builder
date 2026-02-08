// src/models/mod.rs
// ========================================
// 📦 Module Models - Tous les types de données
// ========================================

pub mod enums;
pub mod product;
pub mod quote;
pub mod constants;

// Ré-export pour simplifier les imports
pub use enums::*;
pub use product::*;
pub use quote::*;
pub use constants::*;
