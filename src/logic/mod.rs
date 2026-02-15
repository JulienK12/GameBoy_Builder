// src/logic/mod.rs
// ========================================
// ⚙️ Module Logic - Logique métier
// ========================================

pub mod calculator;
pub mod rules;
pub mod auth;

// Ré-export pour simplifier
pub use calculator::calculate_quote;
pub use rules::validate_expert_dependencies;
pub use auth::{hash_password, verify_password, generate_jwt, verify_jwt};


