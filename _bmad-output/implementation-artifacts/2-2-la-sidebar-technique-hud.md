# Story 2.2: La Sidebar Technique HUD

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant qu'Utilisateur Expert,
Je veux une barre latérale technique regroupant les mods avancés (CPU, Audio, Alimentation),
Afin de spécifier exactement quels composants internes je souhaite que le moddeur installe.

## Acceptance Criteria (BDD)

1. **Étant donné** que le Mode Expert est actif (`isExpertMode === true`),
   **Quand** je consulte la sidebar Expert,
   **Alors** l'UI affiche trois catégories principales de mods : "CPU", "Audio", "Alimentation",
   **Et** chaque catégorie est organisée dans une section distincte avec un header stylisé Cyberpunk,
   **Et** le style "Airy Cyberpunk" est appliqué (`p-8`, `gap-8`, marges généreuses).

2. **Étant donné** que je parcours une catégorie de mods (ex: "Audio"),
   **Quand** je consulte les options disponibles,
   **Alors** chaque option affiche :
   - Son nom technique (ex: "CleanAmp Pro")
   - Son prix (si applicable)
   - Ses paramètres techniques (ex: "Amplification 2x", "Réduction bruit")
   - Les exigences d'alimentation (ex: "Nécessite batterie 1700mAh")
   - Un indicateur visuel de compatibilité avec la configuration actuelle

3. **Étant donné** qu'une option de mod est affichée dans la sidebar,
   **Quand** je survole ou interagis avec cette option,
   **Alors** un tooltip (Radix Vue) apparaît avec :
   - Une explication détaillée de l'impact sur les performances finales
   - Les détails du processus d'installation pour le moddeur
   - Les dépendances techniques (ex: "Nécessite batterie 1700mAh pour fonctionner")
   - Les avantages/inconvénients de cette option

4. **Étant donné** que je sélectionne une option de mod (ex: "CleanAmp Pro"),
   **Quand** je clique sur l'option,
   **Alors** la sélection est enregistrée dans le store Pinia (`selectedExpertOptions`),
   **Et** l'option affiche un état visuel "sélectionné" (glow néon orange, bordure active),
   **Et** le récapitulatif principal (`SelectionRecap.vue`) se met à jour pour inclure cette option.

5. **Étant donné** qu'une option de mod nécessite une dépendance (ex: batterie 1700mAh),
   **Quand** cette dépendance n'est pas satisfaite dans la configuration actuelle,
   **Alors** l'option affiche un indicateur d'avertissement (icône warning, couleur orange),
   **Et** le tooltip explique clairement la dépendance manquante,
   **Et** l'utilisateur peut toujours sélectionner l'option (la validation backend se fera dans Story 2.3).

6. **Étant donné** que la sidebar Expert est affichée,
   **Quand** je consulte les sélections actuelles de base (coque, écran, vitre),
   **Alors** ces sélections sont visibles en haut de la sidebar dans une section "Configuration de Base",
   **Et** elles sont affichées en lecture seule avec un style distinct (pour différencier des mods).

## Dépendances

> ✅ **Dépend de Story 2.1** — Le composant `ExpertSidebar.vue` doit exister avec la structure de base (toggle, révélation/masquage).
> ⚠️ **Story 2.3 est bloquante pour la validation backend** — La validation des dépendances et le feedback technique seront implémentés dans Story 2.3. Story 2.2 se concentre sur l'UI et la structure de données.

## Tasks / Subtasks

### Backend (Rust/Axum) — Structure de données pour les mods

- [x] **Task 1 — Modèle de données Expert Mods** (AC: #1, #2)
  - [x] 1.1 — Créer le struct `ExpertMod` dans `src/models/expert_mod.rs` avec champs :
    - `id: String` (ex: "MOD_AUDIO_CLEANAMP_PRO")
    - `name: String` (ex: "CleanAmp Pro")
    - `category: ExpertModCategory` (enum: CPU, Audio, Power)
    - `price: f64` (prix du mod)
    - `technical_specs: serde_json::Value` (paramètres techniques en JSONB - flexible pour specs variées par catégorie)
    - `power_requirements: Option<String>` (ex: "1700mAh")
    - `description: String` (description détaillée)
    - `tooltip_content: String` (contenu du tooltip)
    - `dependencies: Vec<String>` (IDs des mods ou composants requis)
  - [x] 1.2 — Créer l'enum `ExpertModCategory` dans `src/models/enums.rs` : `Cpu`, `Audio`, `Power`
  - [x] 1.3 — Étendre `Catalog` dans `src/data/mod.rs` pour inclure `expert_mods: Vec<ExpertMod>`
  - [x] 1.4 — Créer la migration SQL `007_expert_mods.sql` avec table `expert_mods` (note: `006_fix_pack_names.sql` existe déjà)
  - [x] 1.5 — Ajouter le chargement des mods dans `src/data/pg_loader.rs` (ou `loader.rs` pour tests)

- [x] **Task 2 — Endpoint GET /catalog/expert-mods** (AC: #1, #2)
  - [x] 2.1 — Créer le handler `get_expert_mods` dans `src/api/handlers.rs`
  - [x] 2.2 — Ajouter la route `.route("/catalog/expert-mods", get(handlers::get_expert_mods))` dans `src/api/mod.rs`
  - [x] 2.3 — Retourner la liste des mods groupés par catégorie dans la réponse JSON : `{ mods: { cpu: [...], audio: [...], power: [...] } }` (format optimisé pour le frontend)
  - [x] 2.4 — Écrire un test d'intégration pour l'endpoint

- [x] **Task 3 — Seed data des mods** (AC: #2, #5)
  - [x] 3.1 — Créer `008_seed_expert_mods.sql` avec au moins :
    - **CPU** : Overclock mods (ex: "CPU Overclock 2x")
    - **Audio** : CleanAmp Pro, Audio enhancements
    - **Power** : Batteries Li-Po (1700mAh, 2000mAh), Chargeurs USB-C
  - [x] 3.2 — S'assurer que les dépendances sont correctement référencées (ex: CleanAmp Pro → batterie 1700mAh)

### Frontend (Vue.js 3 / Pinia)

- [x] **Task 4 — Extension du Store Pinia pour Expert Mods** (AC: #4)
  - [x] 4.1 — Ajouter `expertMods: ref([])` au state du store `configurator.js`
  - [x] 4.2 — Ajouter `selectedExpertOptions: ref({})` au state (objet avec clés par catégorie : `{ cpu: null, audio: null, power: null }`)
  - [x] 4.3 — Créer l'action `fetchExpertMods()` qui appelle `GET /catalog/expert-mods` (lazy loading : appelé automatiquement quand `isExpertMode` devient `true` pour la première fois, avec cache pour éviter les appels multiples)
  - [x] 4.4 — Créer l'action `selectExpertMod(category, modId)` qui met à jour `selectedExpertOptions`
  - [x] 4.5 — Exposer `expertMods`, `selectedExpertOptions`, `fetchExpertMods`, `selectExpertMod` dans le return du store

- [x] **Task 5 — Couche API `fetchExpertMods()`** (AC: #1, #2)
  - [x] 5.1 — Ajouter `fetchExpertMods()` dans `frontend/src/api/backend.js`
  - [x] 5.2 — Retourner les mods groupés par catégorie depuis l'API
  - [x] 5.3 — Ajouter l'export dans le default export

- [x] **Task 6 — Composant ExpertSidebar.vue (Contenu technique)** (AC: #1, #2, #3, #4, #5, #6)
  - [x] 6.1 — Remplacer le placeholder par la structure réelle avec trois sections : "Configuration de Base", "CPU", "Audio", "Alimentation"
  - [x] 6.2 — Section "Configuration de Base" : Afficher les sélections actuelles (coque, écran, vitre) en lecture seule avec style distinct
  - [x] 6.3 — Section "CPU" : Liste des mods CPU avec cartes stylisées Cyberpunk
  - [x] 6.4 — Section "Audio" : Liste des mods audio avec cartes stylisées Cyberpunk
  - [x] 6.5 — Section "Alimentation" : Liste des mods d'alimentation avec cartes stylisées Cyberpunk
  - [x] 6.6 — Chaque carte de mod affiche : nom, prix, specs techniques, indicateur de compatibilité
  - [x] 6.7 — Ajouter des tooltips Radix Vue sur chaque carte avec `tooltip_content` du backend
  - [x] 6.8 — Gérer l'état sélectionné/non-sélectionné avec glow néon orange et bordure active
  - [x] 6.9 — Afficher les indicateurs d'avertissement pour les dépendances non satisfaites (AC: #5)
  - [x] 6.10 — Appliquer le style "Airy Cyberpunk" : `p-8`, `gap-8`, `glass-premium`, bordures notched
  - [x] 6.11 — Responsive : adapter le layout pour mobile (scroll vertical, cartes empilées)

- [x] **Task 7 — Composant ExpertModCard.vue (Réutilisable)** (AC: #2, #3, #4, #5)
  - [x] 7.1 — Créer `frontend/src/components/ExpertModCard.vue` pour afficher une carte de mod individuelle
  - [x] 7.2 — Props : `mod`, `isSelected`, `hasDependencyWarning`
  - [x] 7.3 — Afficher le nom, prix, specs techniques, indicateur de compatibilité
  - [x] 7.4 — Intégrer le tooltip Radix Vue avec le contenu du backend
  - [x] 7.5 — Gérer le style sélectionné (glow néon orange) et l'avertissement (icône warning)
  - [x] 7.6 — Émettre l'événement `@select` quand l'utilisateur clique sur la carte

- [x] **Task 8 — Intégration avec SelectionRecap** (AC: #4)
  - [x] 8.1 — Modifier `SelectionRecap.vue` pour afficher les mods sélectionnés dans `selectedExpertOptions`
  - [x] 8.2 — Ajouter une section "Mods Expert" dans le récapitulatif avec les mods sélectionnés
  - [x] 8.3 — Afficher chaque mod avec son nom, catégorie, et prix

- [x] **Task 9 — Tests Playwright** (AC: #1, #2, #3, #4, #5, #6)
  - [x] 9.1 — Test : Activer Expert Mode → vérifier que les trois catégories (CPU, Audio, Power) sont affichées
  - [x] 9.2 — Test : Sélectionner un mod → vérifier qu'il apparaît dans `selectedExpertOptions` et dans le Recap
  - [x] 9.3 — Test : Survoler un mod → vérifier que le tooltip s'affiche avec le contenu technique
  - [x] 9.4 — Test : Sélectionner un mod avec dépendance non satisfaite → vérifier l'indicateur d'avertissement
  - [x] 9.5 — Test : Vérifier que la section "Configuration de Base" affiche les sélections actuelles

## Dev Notes

### Contraintes Architecturales

- **Backend — 3-Tier Pattern** : Respecter la séparation `api/` → `logic/` → `data/` existante.
  - Les handlers dans `api/handlers.rs` ne contiennent AUCUNE logique métier.
  - Le `Catalog` est chargé en `Arc<Catalog>` au démarrage et partagé entre tous les handlers.
- **Frontend — Store Pinia Unique** : Utiliser le store `configurator` existant. Ne PAS créer un store séparé pour Expert Mods.
- **Structure de données Expert Mods** : Les mods sont des entités séparées des composants de base (shell, screen, lens). Ils sont optionnels et peuvent être ajoutés à n'importe quelle configuration.

### Stack Technique

| Composant | Techno | Version |
|---|---|---|
| Backend | Rust + Axum | 0.7 |
| DB | PostgreSQL + SQLx | 0.8 |
| Frontend | Vue.js 3 (Composition API) | 3.5 |
| State | Pinia | 3.0 |
| CSS | Tailwind CSS | v4 |
| UI Components | Radix Vue | Latest |
| Build | Vite | 7.2 |

### Patterns Existants à Suivre

**Handler Rust — Pattern identique à `get_shells` mais avec groupement par catégorie :**
```rust
// Dans src/api/handlers.rs
pub async fn get_expert_mods(
    State(catalog): State<Arc<Catalog>>,
) -> Json<serde_json::Value> {
    // Grouper les mods par catégorie pour optimiser le frontend
    let mut mods_by_category: std::collections::HashMap<String, Vec<&ExpertMod>> = std::collections::HashMap::new();
    for mod_item in &catalog.expert_mods {
        let category_key = format!("{:?}", mod_item.category).to_lowercase();
        mods_by_category.entry(category_key).or_insert_with(Vec::new).push(mod_item);
    }
    
    Json(serde_json::json!({
        "mods": {
            "cpu": mods_by_category.get("cpu").unwrap_or(&Vec::new()),
            "audio": mods_by_category.get("audio").unwrap_or(&Vec::new()),
            "power": mods_by_category.get("power").unwrap_or(&Vec::new()),
        }
    }))
}
```

**Store Pinia — Pattern identique à `fetchCatalog()` avec lazy loading et cache :**
```javascript
// Dans stores/configurator.js
const expertMods = ref({ cpu: [], audio: [], power: [] }); // Groupé par catégorie depuis l'API
const selectedExpertOptions = ref({
    cpu: null,
    audio: null,
    power: null,
});
const expertModsLoaded = ref(false); // Cache pour éviter les appels multiples

async function fetchExpertMods() {
    if (expertModsLoaded.value) return; // Déjà chargé
    
    const data = await fetchExpertModsFromAPI();
    expertMods.value = data.mods || { cpu: [], audio: [], power: [] };
    expertModsLoaded.value = true;
}

// Watcher pour charger automatiquement quand Expert Mode est activé
watch(isExpertMode, (newVal) => {
    if (newVal && !expertModsLoaded.value) {
        fetchExpertMods();
    }
});

function selectExpertMod(category, modId) {
    selectedExpertOptions.value[category] = modId;
    // Optionnel : recalculer le devis si nécessaire
}
```

**Composant Card — Pattern similaire à `VariantCard.vue` :**
- Utiliser les mêmes classes Tailwind pour la cohérence visuelle
- Intégrer les tooltips Radix Vue comme dans les autres composants
- Gérer les états sélectionné/non-sélectionné avec les mêmes patterns

### Fichiers à Modifier/Créer

**Backend — Modifications :**
- `src/models/enums.rs` — Ajouter `ExpertModCategory`
- `src/models/mod.rs` — Exposer le nouveau module `expert_mod`
- `src/data/mod.rs` — Étendre `Catalog` avec `expert_mods: Vec<ExpertMod>`
- `src/data/pg_loader.rs` — Ajouter le chargement des mods depuis PostgreSQL
- `src/api/handlers.rs` — Ajouter `get_expert_mods`
- `src/api/mod.rs` — Ajouter la route `/catalog/expert-mods`

**Backend — Créations :**
- `src/models/expert_mod.rs` — Nouveau struct `ExpertMod` avec `technical_specs: serde_json::Value` (JSONB)
- `migrations/007_expert_mods.sql` — Migration pour créer la table `expert_mods` avec colonne `technical_specs JSONB`
- `migrations/008_seed_expert_mods.sql` — Seed data avec les mods initiaux

**Frontend — Modifications :**
- `frontend/src/stores/configurator.js` — Ajouter `expertMods`, `selectedExpertOptions`, `fetchExpertMods()`, `selectExpertMod()`
- `frontend/src/api/backend.js` — Ajouter `fetchExpertMods()`
- `frontend/src/components/ExpertSidebar.vue` — Remplacer le placeholder par le contenu technique réel
- `frontend/src/components/SelectionRecap.vue` — Ajouter l'affichage des mods sélectionnés

**Frontend — Créations :**
- `frontend/src/components/ExpertModCard.vue` — Nouveau composant pour afficher une carte de mod

### Design System

**Couleurs & Styles :**
- Carte mod sélectionnée : `bg-neo-orange/20`, `border-neo-orange`, `shadow-neo-glow-orange`
- Carte mod non-sélectionnée : `glass-premium`, bordure subtile
- Indicateur d'avertissement : `text-orange-400`, icône warning
- Section "Configuration de Base" : Style distinct avec `opacity-60` pour indiquer lecture seule

**Structure de la Sidebar :**
```
ExpertSidebar
├── Header ("EXPERT MODE")
├── Section "Configuration de Base" (lecture seule)
│   ├── Coque sélectionnée
│   ├── Écran sélectionné
│   └── Vitre sélectionnée
├── Section "CPU"
│   └── Liste de ExpertModCard (CPU mods)
├── Section "Audio"
│   └── Liste de ExpertModCard (Audio mods)
└── Section "Alimentation"
    └── Liste de ExpertModCard (Power mods)
```

**Tooltips :**
- Utiliser Radix Vue Tooltip avec contenu riche (markdown ou HTML simple)
- Afficher : description, impact performances, processus installation, dépendances

### Exemples de Mods à Implémenter

**CPU Mods :**
- "CPU Overclock 2x" — Double la vitesse du processeur
- "CPU Cooling Mod" — Améliore la dissipation thermique

**Audio Mods :**
- "CleanAmp Pro" — Amplification audio 2x, réduction bruit (nécessite batterie 1700mAh)
- "Audio Enhancement Kit" — Amélioration qualité sonore

**Power Mods :**
- "Batterie Li-Po 1700mAh" — Batterie rechargeable haute capacité
- "Batterie Li-Po 2000mAh" — Batterie rechargeable très haute capacité
- "Chargeur USB-C" — Chargeur moderne USB-C

### Références

- [Source: docs/architecture-backend.md#3-Tier Pattern] — Structure backend et patterns de handlers
- [Source: docs/architecture-frontend.md#Store Pinia] — Structure du store Pinia et patterns existants
- [Source: docs/architecture-frontend.md#Design System] — Tokens de couleur et classes Tailwind
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Expert Mode] — UX Pattern "Airy Cyberpunk" et aération requise
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 2] — Contexte Epic 2 et dépendances avec Story 2.3
- [Source: _bmad-output/implementation-artifacts/2-1-le-toggle-mode-expert-etat-et-ui.md] — Infrastructure Expert Mode créée dans Story 2.1
- [Source: frontend/src/components/VariantCard.vue] — Pattern de carte existant à réutiliser pour ExpertModCard

### Project Structure Notes

- **Alignment** : Respecte la structure existante `src/models/`, `src/data/`, `src/api/` pour le backend
- **Alignment** : Respecte la structure existante `frontend/src/components/` et `frontend/src/stores/` pour le frontend
- **Naming** : `ExpertModCard.vue` suit la convention PascalCase des composants Vue
- **Database** : La table `expert_mods` suit les conventions de nommage existantes (snake_case)
- **Migration numbering** : Utiliser `007_expert_mods.sql` et `008_seed_expert_mods.sql` (car `006_fix_pack_names.sql` existe déjà)
- **JSONB technical_specs** : Utiliser `JSONB` dans PostgreSQL et `serde_json::Value` dans Rust pour flexibilité (pattern identique à `user_configurations.configuration`)
- **Lazy loading** : Charger les mods uniquement quand `isExpertMode` devient `true` pour la première fois, avec cache pour éviter les appels multiples

## Dev Agent Record

### Agent Model Used

Code review 2.2 + correctifs appliqués (Amelia / Cursor).

### Debug Log References

—

### Completion Notes List

- Backend : modèle ExpertMod, enum ExpertModCategory, Catalog.expert_mods, GET /catalog/expert-mods, migrations 007/008, pg_loader.
- Frontend : store expertMods/selectedExpertOptions/fetchExpertModsAction/selectExpertMod avec cache expertModsLoaded, ExpertSidebar (Configuration de Base, CPU/Audio/Alimentation), ExpertModCard (tooltip Radix, specs, power_requirements, hasDependencyWarning), SelectionRecap section Mods expert via quote.items.
- Code review : corrections AC #2, #3, #5, #6 (tooltips, specs, warning dépendance, libellé Configuration de Base), cache lazy load, tests intégration GET expert-mods et Playwright 2.2.

### File List

**Backend**
- src/models/expert_mod.rs
- src/models/enums.rs
- src/models/mod.rs
- src/data/loader.rs
- src/data/mod.rs
- src/data/catalog.rs
- src/data/pg_loader.rs
- src/api/handlers.rs
- src/api/mod.rs
- migrations/007_expert_mods.sql
- migrations/008_seed_expert_mods.sql

**Frontend**
- frontend/src/stores/configurator.js
- frontend/src/api/backend.js
- frontend/src/components/ExpertSidebar.vue
- frontend/src/components/ExpertModCard.vue
- frontend/src/components/SelectionRecap.vue

**Tests**
- frontend/tests/api-integration.spec.js (GET /catalog/expert-mods)
- frontend/tests/expert-mode.spec.js (mock expert-mods, tests Story 2.2)
