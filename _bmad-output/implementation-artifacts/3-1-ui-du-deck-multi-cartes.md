# Story 3.1: L'UI du "Deck" (Multi-Cartes)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que Créateur,
Je veux voir toutes mes configurations en cours sous forme de cartes dans un gestionnaire dédié,
Afin de pouvoir comparer différents projets avant de commander.

## Acceptance Criteria (BDD)

1. **Étant donné** plusieurs configurations dans le store,
   **Quand** je consulte le "Deck Manager",
   **Alors** chaque configuration est affichée sous forme de carte avec une image d'aperçu, un nom et un prix total.

2. **Étant donné** que l'utilisateur souhaite ajouter une configuration au deck,
   **Quand** le deck contient déjà 3 configurations,
   **Alors** le système empêche d'ajouter une nouvelle configuration (bouton désactivé ou message explicite, limite de 3).

3. **Étant donné** une ou plusieurs configurations dans le deck,
   **Quand** l'utilisateur choisit de supprimer une configuration,
   **Alors** cette configuration est retirée du deck et un emplacement est libéré (l'utilisateur peut en ajouter une nouvelle jusqu'à la limite de 3).

## Dépendances

> ✅ **Story 3.0** — Auth backend (JWT, AppState, migrations) en place. Pas d’appel API deck en 3.1 (réservé à la Story 3.3).
> 📌 **Story 3.2** — Persistance locale (pinia-plugin-persistedstate) viendra après ; en 3.1 le deck peut être en mémoire uniquement.
> 📌 **Story 3.3** — Synchronisation cloud (endpoints `/deck/*`, limite 3 côté backend) viendra après.

## Tasks / Subtasks

### Frontend — Store Deck (Pinia)

- [x] **Task 1 — Store Pinia `deck`** (AC: #1, #2, #3)
  - [x] 1.1 — Créer `frontend/src/stores/deck.js` (Pinia) : state `configurations` (array, max 3), chaque élément : `{ id, name, configuration, totalPrice?, previewImageUrl? }`
  - [x] 1.2 — Action `addCurrentConfig(name?)` : prendre l’état actuel du store `configurator` (sélections + quote), générer un id via `crypto.randomUUID()` (natif, pas de dépendance), ajouter au deck ; refuser si `configurations.length >= 3`
  - [x] 1.3 — Action `removeConfig(id)` : retirer la configuration d’id donné du tableau
  - [x] 1.4 — Getter `canAddMore` : `configurations.length < 3`
  - [x] 1.5 — Exposer le store dans `main.js` (Pinia déjà initialisé, pas de changement nécessaire si auto-import des stores)

### Frontend — Composant Deck Manager

- [x] **Task 2 — Composant Deck Manager** (AC: #1)
  - [x] 2.1 — Créer `frontend/src/components/DeckManager.vue` (ou `Deck/DeckManager.vue`) : liste de cartes (grid ou flex), style Cyberpunk (glass, neon) cohérent avec `VariantCard.vue` / `SelectionRecap.vue`
  - [x] 2.2 — Chaque carte affiche : image d’aperçu (voir note ci-dessous), nom de la config, prix total (formaté)
  - [x] 2.3 — Bouton ou lien "Supprimer" par carte (AC #3) : appelle `deck.removeConfig(id)`
  - [x] 2.4 — Bouton "Ajouter la configuration actuelle" (ou "Sauvegarder dans le Deck") : appelle `deck.addCurrentConfig(name)` ; désactivé si `!deck.canAddMore` (AC #2) avec tooltip ou message "Limite de 3 configurations atteinte"

- [x] **Task 3 — Aperçu image des cartes** (AC: #1)
  - [x] 3.1 — Utiliser l’image de la coque sélectionnée : `getShellImageUrl(configuration.shellVariantId)` (déjà dans `backend.js`). Si pas de coque (config vide), afficher un placeholder générique.
  - [x] 3.2 — Stocker dans chaque entrée au minimum `configuration.shellVariantId` ; dans la carte, calculer l’URL avec `getShellImageUrl(entry.configuration.shellVariantId)`.

### Frontend — Intégration dans l’app

- [x] **Task 4 — Accès au Deck Manager** (AC: #1)
  - [x] 4.1 — Ajouter un bouton "Mon Deck" dans le HUD (ex. même zone que le toggle Expert dans `App.vue` : `top-6 left-6` ou à côté de 3D_VIEW / RECAP_VIEW) ; clic = Deck Manager en panneau/modal (pattern comme `showLandingPortal` ou ExpertSidebar).
  - [x] 4.2 — Intégrer `DeckManager` dans `App.vue` (conditionnellement affiché, comme pour `LandingPortal` ou `ExpertSidebar`) sans casser le flux existant (Portail → Configurateur → Recap).

### Cohérence et UX

- [x] **Task 5 — Nom de configuration** (AC: #1)
  - [x] 5.1 — Lors de l’ajout au deck : permettre à l’utilisateur de saisir un nom (optionnel) ; par défaut utiliser "Configuration 1", "Configuration 2", etc. ou un libellé dérivé (ex. coque + écran).

### Tests

- [x] **Task 6 — Tests manuels / E2E** (AC: tous)
  - [x] 6.1 — Scénario : ajouter 3 configurations au deck, vérifier que le bouton "Ajouter" est désactivé et qu’un message explicite s’affiche.
  - [x] 6.2 — Scénario : supprimer une configuration, vérifier qu’une nouvelle peut être ajoutée.
  - [x] 6.3 — Vérifier que chaque carte affiche bien image (ou placeholder), nom et prix total.

## Dev Notes

### Contexte métier

- **Deck** = ensemble de jusqu’à 3 configurations sauvegardées, pour comparaison avant commande (FR4). En 3.1 on ne persiste pas encore (pas de localStorage ni API) ; l’UI et le store en mémoire suffisent.
- La limite de 3 est imposée côté backend en 3.3 (trigger PostgreSQL) ; en 3.1 l’appliquer uniquement côté frontend pour cohérence.

### Contraintes architecturales

- **Store séparé** : Créer un store Pinia dédié `deck` (comme indiqué dans `docs/architecture-frontend.md` §1 : "Pinia Store (deck) — State: multi-configs persistence"). Ne pas surcharger le store `configurator` avec la liste des configs du deck.
- **Données d’une entrée deck** : Snapshot de la configuration courante = les mêmes champs que `QuoteRequest` + options expert si besoin : `shell_variant_id`, `screen_variant_id`, `lens_variant_id`, `selectedExpertOptions`, `selectedShellColorHex`, etc. Plus `name`, `total_price` (depuis `quote.total_price`), et éventuellement une URL d’aperçu ou les IDs pour la construire.
- **Pas d’API en 3.1** : Les endpoints `/deck/*` (CRUD) seront implémentés en Story 3.3. Ne pas appeler le backend pour le deck dans cette story.

### Stack et patterns existants

- **Vue 3.5**, **Pinia 3.0**, **Tailwind v4**, **Radix Vue** pour modales/dialogs si besoin.
- Réutiliser le style des cartes (glass, neon, bordures) de `VariantCard.vue` et `SelectionRecap.vue` pour garder la cohérence visuelle.
- API `formatImageUrl`, `getShellImageUrl` (etc.) dans `backend.js` pour les images des variantes.

### Fichiers à créer / modifier

**Créations :**
- `frontend/src/stores/deck.js` — Store Pinia deck (configurations, addCurrentConfig, removeConfig, canAddMore)
- `frontend/src/components/DeckManager.vue` — Liste de cartes deck, boutons ajouter/supprimer

**Modifications :**
- `frontend/src/App.vue` — Intégrer l’accès au Deck Manager (bouton + affichage conditionnel du composant)

### Intelligence de la story précédente (3.0)

- **Backend** : Auth (register, login, logout, me), JWT en cookie HttpOnly, AppState avec `catalog` + `pool`, migrations 009 appliquées. Tables `users` et `user_configurations` existent ; pas d’endpoints deck encore.
- **Frontend** : Store auth et modale Login/Register optionnels en 3.0 ; utiles pour 3.3 (sauvegarde cloud). Pour 3.1, pas d’obligation d’afficher la modale.
- **Fichiers modifiés récemment** : `src/api/mod.rs`, `src/main.rs`, `handlers.rs`, `auth.rs` ; côté frontend peu de changements. S’appuyer sur `configurator.js` pour lire l’état actuel (sélections + `quote`) lors de l’ajout au deck.

### Références

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1] — User story et critères d’acceptation
- [Source: docs/architecture-frontend.md#1] — Schéma avec store (deck) et store (configurator)
- [Source: docs/architecture-frontend.md#2.4] — Composants principaux (Deck Manager à créer)
- [Source: docs/architecture-backend.md#2.2] — DeckRequest, user_configurations (pour 3.3 ; structure JSONB à anticiper)
- [Source: migrations/009_auth_and_deck.sql] — Limite 3 configs par user (trigger) ; structure `user_configurations` (id, user_id, name, configuration JSONB, total_price, created_at, updated_at)
- [Source: _bmad-output/implementation-artifacts/3-0-authentification-simple-email-password.md] — Contexte auth et fichiers touchés

## Dev Agent Record

### Agent Model Used

À compléter par l'agent dev lors de l'implémentation.

### Debug Log References

### Completion Notes List

- Store Pinia `deck` créé : state `configurations` (max 3), actions `addCurrentConfig(name?)`, `removeConfig(id)`, getter `canAddMore`, helper `getPreviewImageUrl(entry)` via `getShellImageUrl` (backend.js). Snapshot configurator = shell/screen/lens/expert/color.
- Composant `DeckManager.vue` : grille de cartes (glass/neon), aperçu coque ou placeholder, nom, prix formaté, bouton Supprimer par carte, bouton « Sauvegarder dans le Deck » désactivé si 3 configs avec tooltip explicite.
- Intégration dans `App.vue` : bouton MON_DECK (top-6 left-6), panneau droit en Teleport avec overlay et transition slide.
- Nom optionnel : champ « Nom (optionnel) » dans le Deck Manager, défaut « Configuration 1 », « Configuration 2 », etc.
- Tests E2E : `frontend/tests/deck-manager.spec.js` (ouverture, état vide, AC #1 #2 #3). Exécution complète nécessite backend pour catalogue. Tests unitaires : `frontend/tests/unit/deck.spec.js` (Vitest).

### File List

- frontend/src/stores/deck.js (créé)
- frontend/src/components/DeckManager.vue (créé)
- frontend/src/App.vue (modifié)
- frontend/tests/deck-manager.spec.js (créé)
- frontend/tests/unit/deck.spec.js (créé, code review)
- frontend/package.json (modifié, scripts test + vitest/jsdom)
- frontend/vite.config.js (modifié, config test Vitest)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modifié)

### Senior Developer Review (AI)

- **Date :** 2026-02-11
- **Findings :** 1 critique (syntaxe App.vue), 2 haute (tâches non cochées, tooltip limite 3), 3 moyenne, 2 basse. Tous corrigés : syntaxe supprimée, message « Limite de 3 » toujours visible, `formatPrice` gère NaN, bouton Supprimer visible sur mobile, tâches 1–3 cochées, tests unitaires store ajoutés (Vitest), dépendance backend documentée dans deck-manager.spec.js.
- **Statut :** Approuvé après corrections. Story passée en **done**.

### Change Log

- 2026-02-11 : Implémentation Story 3.1 — Store deck, DeckManager, intégration App.vue, tests E2E deck-manager. Statut → review.
- 2026-02-11 : Code review (AI) — Corrections : App.vue syntaxe, message limite 3 visible, formatPrice NaN, bouton Supprimer visible mobile, tâches 1–3 cochées, tests unitaires store deck (Vitest), doc dépendance backend E2E. Statut → done.
