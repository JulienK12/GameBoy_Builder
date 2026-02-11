# Story 3.0: Authentification Simple (Email/Password)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que Visiteur,
Je veux pouvoir créer un compte et me connecter avec un email et un mot de passe,
Afin de pouvoir retrouver mes configurations sur plusieurs appareils.

## Acceptance Criteria (BDD)

1. **Étant donné** un visiteur non authentifié,
   **Quand** il accède au formulaire d'inscription,
   **Alors** il peut créer un compte avec email + mot de passe (hashé Argon2 côté Rust),
   **Et** l'email doit être valide et unique,
   **Et** le mot de passe respecte une politique minimale (ex: 8 caractères).

2. **Étant donné** un utilisateur inscrit,
   **Quand** il se connecte avec email + mot de passe valides,
   **Alors** il reçoit un JWT stocké dans un cookie HttpOnly/Secure,
   **Et** le cookie est configuré avec SameSite=Lax et Path=/,
   **Et** la date `last_login_at` est mise à jour dans la table `users`.

3. **Étant donné** un utilisateur connecté,
   **Quand** il appelle un endpoint protégé,
   **Alors** le middleware Axum extrait et valide le JWT depuis le cookie,
   **Et** les claims (user_id, email) sont disponibles dans les handlers protégés,
   **Et** si le JWT est invalide ou absent, la requête retourne 401 Unauthorized.

4. **Étant donné** un visiteur non authentifié ou un JWT expiré,
   **Quand** il accède au formulaire de connexion ou tente un endpoint protégé,
   **Alors** les endpoints publics (catalog, quote, register, login) restent accessibles,
   **Et** les endpoints protégés (futurs: deck CRUD) retournent 401.

5. **Étant donné** les tables `users` et `user_configurations` définies dans `migrations/009_auth_and_deck.sql`,
   **Quand** l'application démarre,
   **Alors** la migration est appliquée (ou déjà appliquée),
   **Et** le schéma supporte l'ID utilisateur (VARCHAR 50), email unique, password_hash (TEXT), created_at, last_login_at.

## Dépendances

> ✅ **Migration 009** — Les tables `users` et `user_configurations` existent dans `migrations/009_auth_and_deck.sql`.
> ⚠️ **Prérequis** — PostgreSQL doit être configuré et les migrations exécutées avant le dev.
> 📌 **Stories suivantes** — Story 3.1 (UI Deck) et 3.3 (Sync cloud) utiliseront l'auth pour les endpoints protégés.

## Tasks / Subtasks

### Backend (Rust/Axum) — Module Auth

- [x] **Task 1 — Dépendances Cargo** (AC: #1, #2, #3)
  - [x] 1.1 — Ajouter `argon2` (RustCrypto, version 0.5.x) pour le hashage des mots de passe
  - [x] 1.2 — Ajouter `jsonwebtoken` (version 9.x) pour la génération et validation des JWT
  - [x] 1.3 — Ajouter `axum-extra` (features: `cookie`) pour la gestion des cookies
  - [x] 1.4 — Ajouter `validator` (feature `derive`) pour la validation d'email au format RFC
  - [x] 1.5 — Définir `JWT_SECRET` dans `.env` (variable d'environnement obligatoire en prod)

- [x] **Task 2 — Modèle User et couche data** (AC: #5)
  - [x] 2.1 — Créer `src/models/user.rs` avec struct `User` (id, email, password_hash, created_at, last_login_at) et `UserCreate` (email, password)
  - [x] 2.2 — Créer `src/data/auth_repo.rs` (ou étendre pg_loader) avec : `create_user(email, password_hash) -> Result<User>`, `find_user_by_email(email) -> Option<User>`, `update_last_login(user_id)`
  - [x] 2.3 — Utiliser SQLx pour les requêtes (INSERT, SELECT, UPDATE sur table `users`)
  - [x] 2.4 — Générer un `id` unique (ex: `uuid` crate ou nanoid) pour chaque nouvel utilisateur

- [x] **Task 3 — Logique auth : hashage et JWT** (AC: #1, #2)
  - [x] 3.1 — Créer `src/logic/auth.rs` avec `hash_password(password: &str) -> Result<String>` (Argon2id, params par défaut)
  - [x] 3.2 — Créer `verify_password(password: &str, hash: &str) -> Result<bool>`
  - [x] 3.3 — Créer `generate_jwt(user_id: &str, email: &str) -> Result<String>` (claims: sub=user_id, email, exp=7j, iat)
  - [x] 3.4 — Créer `verify_jwt(token: &str) -> Result<JwtClaims>` pour extraire user_id et email

- [x] **Task 4 — Handlers et routes auth** (AC: #1, #2, #4)
  - [x] 4.1 — Créer `POST /auth/register` : body `{ email, password }`, valider email via crate `validator` (ou regex basique), longueur mot de passe ≥ 8 caractères, hash Argon2, insert user, retourner 201 ou 400 (email déjà pris)
  - [x] 4.2 — Créer `POST /auth/login` : body `{ email, password }`, find user, verify_password, générer JWT (expiration 7 jours), set cookie `auth_token` HttpOnly/Secure/SameSite=Lax/Path=/, update last_login_at, retourner 200 { user: { id, email } } ou 401
  - [x] 4.3 — Créer `POST /auth/logout` : clear cookie `auth_token` (SameSite, Path=/, Max-Age=0), retourner 204
  - [x] 4.4 — Créer `GET /auth/me` (protégé) : extraire JWT du cookie, retourner { user: { id, email } } ou 401

- [x] **Task 5 — Middleware JWT Axum** (AC: #3, #4)
  - [x] 5.1 — Créer `src/api/auth.rs` avec extractor `AuthUser` implémentant `FromRequestParts` : lit le cookie nommé `auth_token`, appelle `verify_jwt`, injecte `AuthUser { user_id, email }` ou retourne 401
  - [x] 5.2 — CookieJar (axum-extra) pour lire/écrire les cookies de `axum-extra` sur le routeur pour que les handlers puissent lire/écrire les cookies
  - [x] 5.3 — Monter les routes `/auth/*` sans protection ; préparer l’usage de `AuthUser` pour les futures routes protégées (ex: `/deck/*`)

- [x] **Task 6 — Intégration main.rs et état partagé** (AC: #5)
  - [x] 6.1 — Créer struct `AppState { catalog: Arc<Catalog>, pool: PgPool }` et l'utiliser comme `State` unique pour tout le routeur (remplace l'actuel `Arc<Catalog>` seul)
  - [x] 6.2 — Modifier `api::create_router(state: Arc<AppState>)` pour accepter cet état combiné ; les handlers auth extraient `pool` via `State<AppState>`
  - [x] 6.3 — Appliquer les migrations au démarrage : `sqlx::migrate!("./migrations").run(&pool).await` (ou chemin équivalent selon la racine du projet)
  - [x] 6.4 — Configurer CORS pour l'auth par cookies : `allow_credentials(true)` et `allow_origin` explicite (CORS_ORIGIN dans `.env`, défaut `http://127.0.0.1:5173`)
  - [x] 6.5 — Brancher le module auth dans `src/api/mod.rs` : routes `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`

- [x] **Task 7 — Tests unitaires et intégration** (AC: tous)
  - [x] 7.1 — Test unitaire : `hash_password` et `verify_password` (round-trip)
  - [x] 7.2 — Test unitaire : `generate_jwt` et `verify_jwt` (round-trip, expiration)
  - [x] 7.3 — Test intégration : `POST /auth/register` → 201, puis `POST /auth/login` → 200 + cookie
  - [x] 7.4 — Test intégration : `POST /auth/login` avec mauvais mot de passe → 401
  - [x] 7.5 — Test intégration : `GET /auth/me` sans cookie → 401 ; avec cookie valide → 200
  - [x] 7.6 — Test intégration : `POST /auth/register` avec email déjà existant → 400

### Frontend (Vue.js 3) — Formulaire Auth (optionnel pour Story 3.0)

> **Note :** Les stories 3.1 et 4.2 prévoient l’affichage de la modale Login/Register. La Story 3.0 peut se limiter au backend si le SM le décide. Sinon, tâches minimales :

- [ ] **Task 8 — API backend.js et store auth** (AC: #2, #4)
  - [ ] 8.1 — Ajouter dans `frontend/src/api/backend.js` : `register(email, password)`, `login(email, password)`, `logout()`, `getCurrentUser()` — avec `credentials: 'include'` pour envoyer les cookies
  - [ ] 8.2 — Créer `frontend/src/stores/auth.js` (Pinia) : state `user`, `isAuthenticated`, actions `login`, `logout`, `fetchCurrentUser`, `register`
  - [ ] 8.3 — Stocker l’utilisateur connecté dans le store ; appeler `fetchCurrentUser()` au chargement de l’app (optionnel)

- [ ] **Task 9 — Composants Login/Register** (optionnel, peut être décalé en 3.1 ou 4.2)
  - [ ] 9.1 — Créer `AuthModal.vue` ou `LoginRegisterForm.vue` : onglets Login / Register, champs email/password, style Cyberpunk (glass, neon)
  - [ ] 9.2 — Intégrer dans une modale (Radix Dialog) ; appeler `register` ou `login` selon l’onglet, gérer erreurs (401, 400)

## Dev Notes

### Contraintes Architecturales

- **Backend — 3-Tier** : `api/` (handlers, auth extractor) → `logic/auth.rs` (hash, JWT) → `data/` (auth_repo, users).
- **AppState** : `create_router` utilise actuellement `Arc<Catalog>` seul. Étendre à `AppState { catalog, pool }` pour exposer `PgPool` aux handlers auth.
- **CORS et cookies** : Pour envoyer/recevoir des cookies avec `credentials: 'include'`, le backend doit répondre `Access-Control-Allow-Credentials: true` et une origine explicite (jamais `*`). Utiliser `CORS_ORIGIN` en `.env` pour dev/prod.
- **Sécurité** : Ne jamais logger les mots de passe. JWT expiration 7 jours. Cookie `auth_token` HttpOnly + Secure en production.
- **Lazy Auth** (architecture-backend.md §7) : Le configurateur reste ouvert aux invités. L’auth n’est requise que pour sauvegarder dans le Deck ou valider la commande. Les endpoints `/catalog/*` et `/quote` restent publics.
- **Pas de `auth.rs` actuellement** : Le fichier `src/api/auth.rs` est à créer (extractor + éventuellement helpers cookies).

### Stack Technique

| Composant | Techno | Version |
|---|---|---|
| Password hashing | argon2 (RustCrypto) | 0.5.x |
| JWT | jsonwebtoken | 9.x |
| Cookies | axum-extra (cookie, json) | Compatible Axum 0.7 |
| Email validation | validator | avec feature `derive` |
| Backend | Rust + Axum | 0.7 |
| DB | PostgreSQL + SQLx | 0.8 |
| Frontend | Vue.js 3 + Pinia | 3.5 / 3.0 |

### Fichiers à Créer/Modifier

**Backend — Créations :**
- `src/models/user.rs` — User, UserCreate
- `src/data/auth_repo.rs` — create_user, find_user_by_email, update_last_login
- `src/logic/auth.rs` — hash_password, verify_password, generate_jwt, verify_jwt
- `src/api/auth.rs` — AuthUser extractor, CookieManagerLayer

**Backend — Modifications :**
- `Cargo.toml` — argon2, jsonwebtoken, axum-extra, validator, uuid
- `src/api/mod.rs` — routes /auth/*, signature `create_router(AppState)`
- `src/api/handlers.rs` — handlers register, login, logout, me (ou nouveau fichier handlers/auth.rs)
- `src/main.rs` — AppState (catalog + pool), migrations au démarrage, CORS avec allow_credentials + origine explicite

**Frontend — Si inclus dans Story 3.0 :**
- `frontend/src/api/backend.js` — register, login, logout, getCurrentUser
- `frontend/src/stores/auth.js` — store Pinia auth
- `frontend/src/components/AuthModal.vue` — formulaire Login/Register (optionnel)

### Références

- [Source: migrations/009_auth_and_deck.sql] — Schéma users et user_configurations
- [Source: docs/architecture-backend.md#7 Stratégie d'Authentification] — Lazy Auth, Login-on-Save
- [Source: docs/architecture-backend.md#2.2] — Structs AuthRequest, patterns handlers
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3 Story 3.0] — Critères d’acceptation

## Dev Agent Record

### Agent Model Used

Cursor (code review + corrections appliquées)

### Debug Log References

- async-trait et lifetimes pour FromRequestParts ; verify_password Ok(false) si invalide ; CORS allow_credentials + CORS_ORIGIN ; tests intégration oneshot (ignorés si pas DATABASE_URL).

### Completion Notes List

- Backend auth : register, login, logout, me ; JWT cookie HttpOnly/SameSite=Lax ; AppState + migrations ; 26 tests (21 unitaires + 5 intégration).
- Code review (2026-02-11) : correction logout cookie (Path=/, Max-Age=0), File List complétée, tests intégration #[ignore], test JWT expiré, doc Cookie Secure.

### File List

- Cargo.toml, .env.template, migrations/009_auth_and_deck.sql, src/models/user.rs, src/models/mod.rs, src/data/auth_repo.rs, src/data/mod.rs, src/logic/auth.rs, src/logic/mod.rs, src/api/auth.rs, src/api/auth_integration_tests.rs, src/api/mod.rs, src/api/handlers.rs, src/main.rs, _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-02-11 — Story 3.0 : auth email/password, JWT cookie, AppState, migrations, CORS, tests.
- 2026-02-11 — Code review : logout cookie Path+Max-Age=0, File List, tests intégration ignorés sans DB, test expiration JWT.
