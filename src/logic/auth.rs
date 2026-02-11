// src/logic/auth.rs
// ========================================
// 🔐 Logique Auth — hash, JWT (Story 3.0)
// ========================================

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::env;

/// Claims JWT : sub = user_id, email, exp (7j), iat
#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,
    pub email: String,
    pub exp: i64,
    pub iat: i64,
}

/// Hash un mot de passe avec Argon2id (params par défaut).
pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
}

/// Vérifie un mot de passe contre un hash Argon2. Retourne Ok(true) si valide, Ok(false) si invalide, Err en cas d'erreur de parsing du hash.
pub fn verify_password(password: &str, hash: &str) -> Result<bool, argon2::password_hash::Error> {
    let parsed = PasswordHash::new(hash)?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}

fn get_jwt_secret() -> Result<Vec<u8>, String> {
    env::var("JWT_SECRET").map(|s| s.into_bytes()).map_err(|_| {
        "JWT_SECRET doit être défini dans .env (variable d'environnement obligatoire en prod)".to_string()
    })
}

/// Génère un JWT (expiration 7 jours, claims: sub, email, exp, iat).
pub fn generate_jwt(user_id: &str, email: &str) -> Result<String, String> {
    let secret = get_jwt_secret()?;
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs() as i64;
    let exp = now + 7 * 24 * 3600; // 7 jours

    let claims = JwtClaims {
        sub: user_id.to_string(),
        email: email.to_string(),
        exp,
        iat: now,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(&secret),
    )
    .map_err(|e| e.to_string())
}

/// Vérifie un JWT et retourne les claims (user_id, email).
pub fn verify_jwt(token: &str) -> Result<JwtClaims, String> {
    let secret = get_jwt_secret()?;
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let token_data = decode::<JwtClaims>(
        token,
        &DecodingKey::from_secret(&secret),
        &validation,
    )
    .map_err(|e| e.to_string())?;

    Ok(token_data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_password_et_verify_password_round_trip() {
        let password = "mon-mot-de-passe-secret";
        let hash = hash_password(password).expect("hash doit réussir");
        assert!(verify_password(password, &hash).unwrap());
        assert!(!verify_password("mauvais", &hash).unwrap());
    }

    #[test]
    fn generate_jwt_et_verify_jwt_round_trip() {
        std::env::set_var("JWT_SECRET", "test-secret-pour-jwt-min-32-caracteres!!");
        let token = generate_jwt("user-123", "test@example.com").expect("generate doit réussir");
        let claims = verify_jwt(&token).expect("verify doit réussir");
        assert_eq!(claims.sub, "user-123");
        assert_eq!(claims.email, "test@example.com");
    }

    #[test]
    fn verify_jwt_rejette_token_expire() {
        use jsonwebtoken::{encode, EncodingKey, Header};
        // Même secret que le test round_trip pour éviter conflits en exécution parallèle
        std::env::set_var("JWT_SECRET", "test-secret-pour-jwt-min-32-caracteres!!");
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let claims = JwtClaims {
            sub: "user-1".to_string(),
            email: "a@b.co".to_string(),
            exp: now - 3600, // expiré il y a 1 h
            iat: now - 7200,
        };
        let secret = std::env::var("JWT_SECRET").unwrap();
        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
        .unwrap();
        assert!(verify_jwt(&token).is_err(), "un JWT expiré doit être rejeté");
    }
}
