# 🚀 Guide de développement — GameBoy_Builder

---

## 1. Prérequis

| Outil | Version min. | Usage |
|---|---|---|
| **Rust** | 1.70+ | Backend (cargo build/run) |
| **Node.js** | 20+ | Frontend (npm) |
| **PostgreSQL** | 14+ | Base de données |
| **Git** | 2.x | Gestion de version |

---

## 2. Installation

### 2.1 Cloner le projet
```bash
git clone <repo-url> gameboy_builder
cd gameboy_builder
```

### 2.2 Configurer l'environnement
```bash
cp .env.template .env
# Éditer .env avec votre connexion PostgreSQL :
# DATABASE_URL=postgres://postgres:MOT_DE_PASSE@localhost:5432/gameboy_configurator
```

### 2.3 Initialiser la base de données
```bash
# Créer la base de données
createdb gameboy_configurator

# Appliquer les migrations (dans l'ordre)
psql -d gameboy_configurator -f migrations/001_initial_schema.sql
psql -d gameboy_configurator -f migrations/002_seed_data.sql
psql -d gameboy_configurator -f migrations/003_harmonize_schema.sql
psql -d gameboy_configurator -f migrations/004_packs.sql
psql -d gameboy_configurator -f migrations/005_seed_packs.sql
psql -d gameboy_configurator -f migrations/006_fix_pack_names.sql
psql -d gameboy_configurator -f migrations/007_expert_mods.sql
psql -d gameboy_configurator -f migrations/008_seed_expert_mods.sql
```

### 2.4 Lancer le Backend
```bash
cargo run
# Le serveur démarre sur http://localhost:3000
# Vérifier : curl http://localhost:3000/health
```

### 2.5 Lancer le Frontend
```bash
cd frontend
npm install
npm run dev
# L'app démarre sur http://localhost:5173
```

---

## 3. Structure des commandes

| Commande | Répertoire | Description |
|---|---|---|
| `cargo run` | racine | Lance le backend Rust |
| `cargo test` | racine | Exécute les tests unitaires backend |
| `cargo build --release` | racine | Build de production backend |
| `npm run dev` | frontend/ | Lance le dev server frontend |
| `npm run build` | frontend/ | Build de production frontend |
| `npm run preview` | frontend/ | Prévisualise le build de production |
| `npx playwright test` | frontend/ | Lance les tests E2E |

---

## 4. Ports utilisés

| Service | Port | URL |
|---|---|---|
| Backend Axum | 3000 | `http://localhost:3000` |
| Frontend Vite | 5173 | `http://localhost:5173` |
| PostgreSQL | 5432 | — |

---

## 5. Architecture des tests

### Backend (Rust)

**Localisation :** `src/logic/calculator.rs` (tests intégrés avec `#[cfg(test)]`)

**Commande :** `cargo test`

**Stratégie :**
- Tests unitaires sur la logique métier (`calculate_quote`)
- Utilise les CSV comme source de données (pas de BDD dans les tests)
- Couverture : succès, erreurs, cas limites, expert mods (dépendances, prix)

### Frontend (Playwright)

**Localisation :** `frontend/tests/`

**Commande générale :** `npx playwright test` (depuis `frontend/`)

**Fichiers de test :**
- Smoke tests, sélection de variantes, responsive mobile
- Audits UI et modèle de données
- **Mode Expert (Epic 2)** : `expert-mode.spec.js`, `expert-optimistic-validation.spec.js` (mocks intégrés)
- **Deck Manager (Story 3.1)** : `deck-manager.spec.js` (mocks intégrés)
- **API** : `api-integration.spec.js` (ex. `GET /catalog/expert-mods`)

**Prérequis selon les tests :**
- **Tests E2E avec mocks (sans backend)** : `expert-mode.spec.js`, `expert-optimistic-validation.spec.js`, `deck-manager.spec.js` interceptent catalogue/quote. Le frontend seul suffit ; en CI, pas besoin de lancer le backend pour ces specs.
- **Tests API** : `api-integration.spec.js` (notamment `GET /catalog/expert-mods`) **nécessite le backend Rust sur le port 3000**. En CI : démarrer le backend avant ces tests, ou exécuter uniquement les specs qui n'en dépendent pas.

**Lancer les tests Epic 2 (Mode Expert) :**
```bash
cd frontend
npx playwright test expert-mode.spec.js expert-optimistic-validation.spec.js --project=chromium
npx playwright test api-integration.spec.js -g "expert-mods" --project=chromium  # backend requis
```

**Lancer les tests Deck Manager (Story 3.1) :**
```bash
cd frontend
npx playwright test deck-manager.spec.js --project=chromium
# Pas de backend requis (mocks catalogue + quote dans le spec)
```

---

## 6. Conventions du projet

### Nommage des IDs
```
Produits :   {TYPE}_{CONSOLE}_{BRAND}              → SHELL_GBC_OEM
Variantes :  VAR_{TYPE}_{CONSOLE}_{BRAND}_{COLOR}  → VAR_SHELL_GBC_OEM_GRAPE
```

### Structure des modules Rust
- Chaque module a un `mod.rs` avec des ré-exports publics
- Pattern `pub use module::*` pour simplifier les imports

### Commentaires
- Français dans tout le code backend et frontend
- Headers avec emojis pour les sections : 🐚, 📺, 🔍, 💰
- Documentation JSDoc pour le frontend

---

## 7. Variables d'environnement

| Variable | Exemple | Fichier | Requis |
|---|---|---|---|
| `DATABASE_URL` | `postgres://postgres:pass@localhost:5432/gameboy_configurator` | `.env` | ✅ |
| `API_URL` | `http://127.0.0.1:3000` | Hardcodé dans `backend.js` | ⚠️ |

---

## 8. Raccourcis développeur

| Raccourci | Contexte | Action |
|---|---|---|
| `Shift+M` | Frontend (navigateur) | Active/désactive le ModelMapper 3D |
