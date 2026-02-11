# Rapport QA — Epic 2 : Le Mode Expert

**Date :** 2026-02-11  
**Epic :** Epic 2 — Le Mode Expert (Personnalisation Avancée & Immersion)  
**FR couverts :** FR2, FR3, FR8  
**Stories :** 2.1 (done), 2.2 (done), 2.3 (done)  
**QA Engineer :** Quinn

---

## Résumé exécutif

- **Tests exécutés :** 14 (13 E2E + 1 API)
- **Résultat :** ✅ Tous les tests passent (vérification QA 2026-02-11)
- **Correctifs appliqués pendant la QA :** 3 (voir section Corrections)

---

## Tests exécutés

### 1. E2E — Toggle et Sidebar (Story 2.1)

**Fichier :** `frontend/tests/expert-mode.spec.js`

| Test | Statut | AC / Story |
|------|--------|------------|
| should preserve pack selections when activating Expert Mode | ✅ | 2.1 AC #1, #3 |
| should preserve selections when toggling Expert Mode on and off | ✅ | 2.1 AC #1, #2 |
| should display Expert toggle button in HUD | ✅ | 2.1 AC #5 |
| should animate Expert Sidebar reveal and hide | ✅ | 2.1 AC #1, #2 |
| should adjust SelectionRecap layout when Expert Sidebar is visible | ✅ | 2.1 (layout) |
| should display three expert mod categories (CPU, Audio, Alimentation) | ✅ | 2.2 AC #1 |
| should display Configuration de Base section with base selections | ✅ | 2.2 AC #6 |
| should show mod selection state and expert mods in sidebar | ✅ | 2.2 Task 9.2 |

### 2. E2E — Optimistic updates & validation (Story 2.3)

**Fichier :** `frontend/tests/expert-optimistic-validation.spec.js`

| Test | Statut | AC / Story |
|------|--------|------------|
| 14.1 - Selecting CleanAmp Pro updates UI immediately | ✅ | 2.3 AC #1 |
| 14.2 - Quote request includes expert_options and price reflects mods | ✅ | 2.3 AC #2 |
| 14.3 - Multiple mods (CleanAmp + Battery) reflected in quote | ✅ | 2.3 AC #2 |
| 14.4 - Error response triggers glitch and rollback | ✅ | 2.3 AC #3, #5 |
| 14.5 - All categories (CPU, Audio, Power) in quote when selected | ✅ | 2.3 AC #2 |
| 14.6 - No expert_options in quote when none selected | ✅ | 2.3 AC (edge) |

### 3. API — Catalogue expert mods (Story 2.2)

**Fichier :** `frontend/tests/api-integration.spec.js`

| Test | Statut | Story |
|------|--------|--------|
| GET /catalog/expert-mods — should return expert mods grouped by category | ✅ | 2.2 Task 2.4 |

---

## Couverture des critères d’acceptation

### Story 2.1 — Toggle Mode Expert (état & UI)

| AC | Description | Couvert | Fichier(s) |
|----|-------------|--------|------------|
| AC #1 | Toggle → `isExpertMode` à jour, ExpertSidebar révélée, sélections préservées | ✅ | expert-mode.spec.js |
| AC #2 | Désactivation → sidebar masquée, sélections préservées | ✅ | expert-mode.spec.js |
| AC #3 | Sélections actuelles affichées dans les filtres avancés | ✅ | expert-mode.spec.js |
| AC #5 | Toggle visible dans le HUD, styles appropriés | ✅ | expert-mode.spec.js |

### Story 2.2 — Sidebar technique HUD

| AC | Description | Couvert | Fichier(s) |
|----|-------------|--------|------------|
| AC #1 | Mods (CPU, Audio, Alimentation) avec paramètres techniques | ✅ | expert-mode.spec.js, api-integration.spec.js |
| AC #6 | Configuration de base (sélections pack/composants) visible | ✅ | expert-mode.spec.js |
| Data-tooltip / impact moddeur | Optionnel | ⚠️ | Non automatisé (manuel) |

### Story 2.3 — Logique optimiste & feedback technique

| AC | Description | Couvert | Fichier(s) |
|----|-------------|--------|------------|
| AC #1 | Sélection appliquée immédiatement au store (optimistic) | ✅ | expert-optimistic-validation.spec.js |
| AC #2 | Backend valide compatibilité de façon asynchrone | ✅ | expert-optimistic-validation.spec.js |
| AC #3 | En cas d’erreur : glitch + retour à la dernière config valide | ✅ | expert-optimistic-validation.spec.js |

---

## Couverture des FR

| FR | Exigence | Epic 2 Stories | Couvert par les tests |
|----|----------|----------------|------------------------|
| FR2 | Toggle Expert Mode | 2.1 | ✅ expert-mode.spec.js |
| FR3 | Persistance état lors du switch mode | 2.1 | ✅ expert-mode.spec.js (préservation sélections) |
| FR8 | Optimistic updates + rollback | 2.3 | ✅ expert-optimistic-validation.spec.js |

---

## Corrections appliquées pendant la QA

1. **expert-mode.spec.js — « should preserve pack selections when activating Expert Mode »**
   - **Problème :** Le locator `expertSidebar.locator('..').locator('text=/atomic purple/i')` ciblait le parent du titre (header uniquement), pas la section « Configuration de Base ».
   - **Correction :** Utilisation de `page.locator('aside:has-text("EXPERT_MODE")')` pour la sidebar, puis `expertSidebar.locator('text=/atomic purple/i')` pour les sélections à l’intérieur de l’aside.

2. **expert-mode.spec.js — même test, assertion « BUDGET GAMER »**
   - **Problème :** Strict mode violation — le texte « Budget Gamer » apparaît à deux endroits (récap + sidebar).
   - **Correction :** `page.getByText(/budget gamer/i).first()` pour accepter les deux emplacements.

3. **QA re-run 2026-02-11**
   - **expert-mode.spec.js :** Locator pack — `text=BUDGET GAMER` remplacé par `getByText(/budget gamer/i)` avec timeout 10s pour l’affichage async des packs ; attente de fermeture du portail via `button:has-text("EXPERT_OFF")` au lieu de `text=STARTER_KITS`.
   - **expert-optimistic-validation.spec.js :** Attente de la fermeture du portail dans `goToAtelierAndSelectBase` avant les clics (évite interception du clic sur le toggle Expert par l’overlay).

---

## Environnement et commandes

- **Framework :** Playwright 1.58.x
- **Config :** `frontend/playwright.config.js`
- **Projet exécuté :** Chromium (Desktop)
- **Backend :** Requis pour `api-integration.spec.js` (GET /catalog/expert-mods) — port 3000

**Lancer les tests Epic 2 :**

```bash
cd frontend
npx playwright test expert-mode.spec.js expert-optimistic-validation.spec.js --project=chromium
npx playwright test api-integration.spec.js -g "expert-mods" --project=chromium
```

---

## Recommandations

1. **Story 2.2 (ready-for-dev) :** Les tests E2E couvrent déjà l’affichage des catégories et de la « Configuration de Base ». Après implémentation complète, ajouter si besoin des tests pour data-tooltip / accessibilité.
2. **Backend :** Pour une exécution complète en CI, s’assurer que le backend (Rust) tourne sur le port 3000 avant les tests API, ou marquer le describe `GET /catalog/expert-mods` comme conditionnel.
3. **Vue warn (Tooltip) :** Un avertissement Vue sur les attributs non-props (id, role) sur le Tooltip reste présent ; à traiter en amont (refactor composant) pour des logs plus propres.

---

**Généré par :** Quinn — QA Engineer  
**Workflow :** QA Automate / QA Epic 2  
**Date :** 2026-02-11
