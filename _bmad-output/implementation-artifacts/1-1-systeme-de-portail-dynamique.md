# Story 1.1: Système de Portail Dynamique

Status: done

## Story

En tant que Visiteur,
Je veux arriver sur un portail HUD pour choisir entre un "Starter Kit" ou l'"Atelier Libre",
Afin de commencer mon parcours de création selon le niveau de guidage souhaité.

## Acceptance Criteria (BDD)

1. **Étant donné** une configuration non initialisée,
   **Quand** l'application charge,
   **Alors** le composant `LandingPortal.vue` est affiché avec deux cartes "Notched" principales : "Starter Kits" et "Atelier Libre".

2. **Étant donné** que le portail est visible,
   **Quand** l'utilisateur choisit "Starter Kits",
   **Alors** une liste des packs disponibles est affichée, récupérée via `GET /catalog/packs` depuis le backend.

3. **Étant donné** que la liste de packs est affichée,
   **Quand** l'utilisateur sélectionne un pack,
   **Alors** les composants du pack (`shell_variant_id`, `screen_variant_id`, `lens_variant_id`) sont chargés dans le store Pinia et le configurateur s'ouvre en mode Simple.

4. **Étant donné** que le portail est visible,
   **Quand** l'utilisateur choisit "Atelier Libre",
   **Alors** le configurateur s'ouvre directement en mode Simple avec aucune sélection pré-remplie.

5. **Étant donné** que les composants d'un pack ont été appliqués au store,
   **Quand** le devis est calculé via `POST /quote`,
   **Alors** les prix proviennent exclusivement du catalogue backend (aucun prix hardcodé côté client).

## Tasks / Subtasks

### Backend (Rust/Axum)

- [x] **Task 1 — Modèle de données Pack** (AC: #2, #5)
  - [x] 1.1 — Créer la migration `004_packs.sql` avec la table `packs`
  - [x] 1.2 — Créer le struct `Pack` dans `src/models/pack.rs`
  - [x] 1.3 — Ajouter le chargement des packs dans `src/data/pg_loader.rs`
  - [x] 1.4 — Étendre `Catalog` dans `src/data/mod.rs` pour inclure `packs: Vec<Pack>`
  - [x] 1.5 — Écrire les tests unitaires de chargement

- [x] **Task 2 — Endpoint GET /catalog/packs** (AC: #2)
  - [x] 2.1 — Créer le handler `get_packs` dans `src/api/handlers.rs`
  - [x] 2.2 — Ajouter la route `.route("/catalog/packs", get(handlers::get_packs))` dans `src/api/mod.rs`
  - [x] 2.3 — Écrire un test d'intégration pour l'endpoint

- [x] **Task 3 — Seed data des packs** (AC: #2, #5)
  - [x] 3.1 — Ajouter les données seed dans `005_seed_packs.sql` (3 packs : Budget, Performance, Purist)
  - [x] 3.2 — Vérifier que chaque `shell_variant_id`, `screen_variant_id`, `lens_variant_id` référence des entrées existantes dans la DB

### Frontend (Vue.js 3 / Pinia)

- [x] **Task 4 — Couche API `fetchPacks()`** (AC: #2)
  - [x] 4.1 — Ajouter `fetchPacks()` dans `frontend/src/api/backend.js`
  - [x] 4.2 — Ajouter l'export dans le default export

- [x] **Task 5 — Extension du Store Pinia** (AC: #3, #4)
  - [x] 5.1 — Ajouter `packs: []`, `selectedPackId: null` au state
  - [x] 5.2 — Ajouter l'action `fetchPacks()` qui appelle `backend.fetchPacks()`
  - [x] 5.3 — Ajouter l'action `selectPack(packId)` qui résout les composants et appelle les `selectShell()`, `selectScreen()`, `selectLens()` existants
  - [x] 5.4 — Ajouter un flag `showLandingPortal` (Boolean, default: `true`, devient `false` dès qu'on choisit)

- [x] **Task 6 — Composant `LandingPortal.vue`** (AC: #1, #2, #3, #4)
  - [x] 6.1 — Créer `frontend/src/components/LandingPortal.vue`
  - [x] 6.2 — Implémenter les deux cartes "Notched" (Starter Kits / Atelier Libre) avec style Cyberpunk Airy
  - [x] 6.3 — Au clic "Starter Kits" → afficher les cards de packs récupérés via le store
  - [x] 6.4 — Au clic sur un pack → appeler `store.selectPack(packId)` puis `store.showLandingPortal = false`
  - [x] 6.5 — Au clic "Atelier Libre" → `store.showLandingPortal = false` (pas de pré-sélection)

- [x] **Task 7 — Intégration dans App.vue** (AC: #1)
  - [x] 7.1 — Ajouter `<LandingPortal v-if="store.showLandingPortal" />` dans `App.vue`
  - [x] 7.2 — S'assurer que le configurateur existant est masqué tant que `showLandingPortal === true`

## Dev Notes

### Contraintes Architecturales

- **Rust Backend — 3-Tier Pattern** : Respecter la séparation `api/` → `logic/` → `data/` existante.
  - Les handlers dans `api/handlers.rs` ne contiennent AUCUNE logique métier.
  - Le `Catalog` est chargé en `Arc<Catalog>` au démarrage et partagé entre tous les handlers.
- **Pack = Référence pure** : Un pack ne contient que des `variant_id` pointant vers des entrées existantes dans la DB. Le backend valide l'existence de chaque composant au chargement du catalogue. Aucun prix n'est stocké dans le pack lui-même.
- **Frontend — Store unique** : Utiliser le store `configurator` existant (`stores/configurator.js`). Ne PAS créer un store séparé pour les packs.

### Stack Technique

| Composant | Techno | Version |
|---|---|---|
| Backend | Rust + Axum | 0.7 |
| DB | PostgreSQL + SQLx | 0.8 |
| Frontend | Vue.js 3 (Composition API) | 3.5 |
| State | Pinia | 3.0 |
| CSS | Tailwind CSS | v4 |
| Build | Vite | 7.2 |

### Patterns Existants à Suivre

**Handler Rust** — Pattern identique à `get_shells` :
```rust
// Suivre exactement ce pattern pour get_packs :
pub async fn get_packs(
    State(catalog): State<Arc<Catalog>>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "packs": catalog.packs,
    }))
}
```

**API Frontend** — Pattern identique à `fetchShells()` :
```javascript
export async function fetchPacks() {
    const response = await axios.get(`${API_URL}/catalog/packs`);
    return response.data;
}
```

**Store Action** — Pattern identique à `fetchCatalog()` pour le chargement.

### Schéma DB — Table `packs`

```sql
CREATE TABLE packs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    shell_variant_id VARCHAR(50) NOT NULL REFERENCES shell_variants(id),
    screen_variant_id VARCHAR(50) NOT NULL REFERENCES screen_variants(id),
    lens_variant_id VARCHAR(50) REFERENCES lens_variants(id),
    sort_order INTEGER DEFAULT 0
);
```

> ⚠️ **Les FOREIGN KEYS sont obligatoires** — un pack ne peut référencer que des composants qui existent réellement en DB. Ceci garantit la cohérence totale exigée par Julien.

### Struct Rust — `Pack`

```rust
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Pack {
    pub id: String,
    pub name: String,
    pub description: String,
    pub image_url: Option<String>,
    pub shell_variant_id: String,
    pub screen_variant_id: String,
    pub lens_variant_id: Option<String>,
    pub sort_order: i32,
}
```

### UX — Double-Portail HUD

[Source: `_bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows`]

- **Pattern** : Double-portail HUD avec prévisualisation thématique.
- **Style** : "Airy Cyberpunk" — `gap-8`, marges généreuses, glassmorphism.
- **Composant bouton** : RayBoy HUD Button — biseauté (clip-path notched) avec bordure animée et effet de glow.
- **Design System** : Fond noir/bleu nuit, accents Néon Orange (`#FF6B35`), classes `.glass-premium`, `font-retro`.

### Project Structure Notes

**Fichiers à créer :**
- `migrations/004_packs.sql`
- `migrations/005_seed_packs.sql`
- `src/models/pack.rs`
- `frontend/src/components/LandingPortal.vue`

**Fichiers à modifier :**
- `src/models/mod.rs` — ajouter `pub mod pack;`
- `src/data/mod.rs` — ajouter `packs: Vec<Pack>` à `Catalog`
- `src/data/pg_loader.rs` — ajouter le chargement SQL des packs
- `src/api/handlers.rs` — ajouter `get_packs`
- `src/api/mod.rs` — ajouter la route `/catalog/packs`
- `frontend/src/api/backend.js` — ajouter `fetchPacks()`
- `frontend/src/stores/configurator.js` — ajouter state/actions packs
- `frontend/src/App.vue` — intégrer `LandingPortal.vue`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.1`] — Acceptance Criteria BDD
- [Source: `docs/api-contracts.md#GET /catalog/packs`] — Contrat API des packs
- [Source: `docs/architecture-backend.md`] — Architecture 3-Tier Rust
- [Source: `docs/architecture-frontend.md`] — Architecture Vue.js 3
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows`] — Double-portail HUD

## Dev Agent Record

### Agent Model Used

_(À remplir par le Dev agent)_

### Debug Log References

### Completion Notes List

### Change Log

| Date | Changement | Auteur |
|---|---|---|
| 2026-02-11 | Story créée — ready-for-dev | Bob (SM) |
| 2026-02-11 | Implementation complète + Tests | Dev Agent |
| 2026-02-11 | Code Review & Fixes (Corrected Seed Data, Cleanup) | Dev Agent |

### File List

- `migrations/004_packs.sql`
- `migrations/005_seed_packs.sql`
- `src/models/pack.rs`
- `src/models/mod.rs`
- `src/data/pg_loader.rs`
- `src/data/mod.rs`
- `src/api/handlers.rs`
- `src/api/mod.rs`
- `frontend/src/api/backend.js`
- `frontend/src/stores/configurator.js`
- `frontend/src/components/LandingPortal.vue`
- `frontend/src/App.vue`
- `frontend/tests/landing-portal.spec.js`
