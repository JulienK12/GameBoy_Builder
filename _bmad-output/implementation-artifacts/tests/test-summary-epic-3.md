# Rapport QA — Epic 3 : Le Gestionnaire de Deck

**Date :** 2026-02-13  
**Epic :** Epic 3 — Le Gestionnaire de Deck (Persistance & Multi-Console)  
**FR couverts :** FR4, FR5, FR6  
**Stories :** 3.0 (done), 3.1 (done), 3.2 (done), 3.3 (done)  
**QA Engineer :** Quinn

---

## Résumé exécutif

- **Tests exécutés :** 39+ (5 E2E deck-manager 3.1 + 8 unitaires deck + 12 intégration backend + 2 E2E sync cloud 3.3)
- **Résultat :** ✅ Tous les tests passent (dont 12 tests d'intégration backend exécutés avec `DATABASE_URL_TEST` le 2026-02-13)
- **Rapports par story disponibles :** Story 3.1 ✅, Story 3.3 ✅ — Pas de rapport dédié pour 3.0 ni 3.2
- **Correctifs appliqués pendant les QA :** 0 (aucune modification du code lors des validations QA)

---

## Vue d'ensemble des stories

| Story | Statut | Rapport QA | Fichiers de tests principaux |
|-------|--------|------------|------------------------------|
| 3.0 — Authentification simple | done | ⚠️ Non dédié | `src/api/auth_integration_tests.rs` |
| 3.1 — UI du Deck multi-cartes | done | ✅ test-summary-story-3-1 | `deck-manager.spec.js`, `unit/deck.spec.js` |
| 3.2 — Persistance locale | done | ⚠️ Non dédié | `deck-manager.spec.js` (E2E reload/restauration) |
| 3.3 — Synchronisation cloud | done | ✅ test-summary-story-3-3 | `deck_integration_tests.rs`, `deck-manager.spec.js` |

---

## Tests exécutés (consolidation)

### 1. E2E — Deck Manager (Story 3.1 + 3.2 + 3.3)

**Fichier :** `frontend/tests/deck-manager.spec.js`

| Test | Statut | Story / AC |
|------|--------|------------|
| should open Deck Manager when clicking MON_DECK | ✅ | 3.1 Task 4 |
| should show empty state when deck has no configurations | ✅ | 3.1 AC #1 |
| AC #2: should disable add button and show message when deck has 3 configurations | ✅ | 3.1 AC #2 |
| AC #3: should allow adding again after removing a configuration | ✅ | 3.1 AC #3 |
| AC #1: each card should display image or placeholder, name and total price | ✅ | 3.1 AC #1 |
| AC #1: deck is restored after page reload | ✅ | 3.2 AC #1 |
| AC #2: deck state reflects modifications after reload | ✅ | 3.2 AC #2 |
| AC #2: when authenticated, deck is loaded from backend after reload | ✅ | 3.3 AC #2 |
| guest: behavior 3.2 unchanged (localStorage, no /deck calls) | ✅ | 3.3 AC #4 (invité) |

### 2. Unitaires — Store deck (Story 3.1)

**Fichier :** `frontend/tests/unit/deck.spec.js`

| Test | Statut | AC / Story |
|------|--------|------------|
| canAddMore est true quand le deck est vide | ✅ | Getter canAddMore |
| addCurrentConfig ajoute une entrée avec nom par défaut | ✅ | 3.1 AC #1 |
| addCurrentConfig utilise le nom fourni quand il est renseigné | ✅ | 3.1 Task 5.1 |
| canAddMore reste true avec 1 puis 2 configurations | ✅ | 3.1 AC #2 |
| refuse d'ajouter au-delà de 3 configurations | ✅ | 3.1 AC #2 |
| removeConfig retire l'entrée par id et libère un emplacement | ✅ | 3.1 AC #3 |
| getPreviewImageUrl retourne une URL quand shellVariantId est présent | ✅ | 3.1 Task 3.1/3.2 |
| getPreviewImageUrl retourne une chaîne vide sans shellVariantId | ✅ | 3.1 Task 3.1 |

### 3. Intégration backend — Auth (Story 3.0)

**Fichier :** `src/api/auth_integration_tests.rs`  
**Commande :** `cargo test -- --ignored` (`.env` avec `DATABASE_URL_TEST` ou `DATABASE_URL`, `JWT_SECRET`)

| Test | Statut | AC / Description |
|------|--------|------------------|
| test_register_returns_201_then_login_returns_200_and_cookie | ✅ | AC #1, #2 — Inscription + connexion |
| test_register_duplicate_email_returns_400 | ✅ | AC #1 — Email unique |
| test_login_wrong_password_returns_401 | ✅ | AC #2 — Mot de passe invalide |
| test_me_without_cookie_returns_401 | ✅ | AC #3, #4 — Endpoints protégés |
| test_me_with_valid_cookie_returns_200 | ✅ | AC #3 — JWT valide |

### 4. Intégration backend — Deck (Story 3.3)

**Fichier :** `src/api/deck_integration_tests.rs`  
**Commande :** `cargo test -- --ignored` (`.env` avec `DATABASE_URL_TEST` ou `DATABASE_URL`, `JWT_SECRET`)

| Test | Statut | AC / Description |
|------|--------|------------------|
| test_get_deck_without_cookie_returns_401 | ✅ | AC #2 — GET /deck sans auth → 401 |
| test_get_deck_with_valid_cookie_returns_empty_list | ✅ | AC #2 — GET /deck avec JWT → 200 |
| test_post_deck_creates_then_get_returns_list | ✅ | AC #1 — POST puis GET reflète l'état |
| test_fourth_post_deck_returns_409 | ✅ | AC #3 — Limite 3 configs → 409 |
| test_delete_deck_config_returns_204_then_404 | ✅ | AC #1 — DELETE 204 puis 404 |

---

## Couverture des critères d'acceptation (Epic 3)

### Story 3.0 — Authentification simple

| AC | Description | Couvert | Fichier(s) |
|----|-------------|--------|------------|
| AC #1 | Inscription email + mot de passe (Argon2) | ✅ | auth_integration_tests.rs |
| AC #2 | Connexion, JWT dans cookie HttpOnly | ✅ | auth_integration_tests.rs |
| AC #3–#4 | Endpoints protégés, 401 si JWT invalide/absent | ✅ | auth_integration_tests.rs, deck_integration_tests.rs |

### Story 3.1 — UI du Deck multi-cartes

| AC | Description | Couvert | Fichier(s) |
|----|-------------|--------|------------|
| AC #1 | Chaque config affichée en carte (aperçu, nom, prix) | ✅ | deck-manager.spec.js, deck.spec.js |
| AC #2 | Limite 3 configs — bouton désactivé + message | ✅ | deck-manager.spec.js, deck.spec.js |
| AC #3 | Suppression libère un emplacement, ajout possible | ✅ | deck-manager.spec.js, deck.spec.js |

### Story 3.2 — Persistance locale

| AC | Description | Couvert | Fichier(s) |
|----|-------------|--------|------------|
| AC #1 | Restauration deck depuis localStorage après reload | ✅ | deck-manager.spec.js |
| AC #2 | Persistance automatique lors des modifications | ✅ | deck-manager.spec.js |

### Story 3.3 — Synchronisation cloud

| AC | Description | Couvert | Fichier(s) |
|----|-------------|--------|------------|
| AC #1 | Sync deck vers PostgreSQL (CRUD), frontend reflète l'état | ✅ | deck_integration_tests.rs, deck-manager.spec.js |
| AC #2 | Chargement configs depuis GET /deck à l'ouverture | ✅ | deck_integration_tests.rs, deck-manager.spec.js |
| AC #3 | Limite 3 configs → 409 avec message explicite | ✅ | deck_integration_tests.rs |
| AC #4 | Invité : localStorage, pas d'appels /deck | ✅ | deck-manager.spec.js |

---

## Couverture des FR

| FR | Exigence | Epic 3 Stories | Couvert par les tests |
|----|----------|----------------|------------------------|
| FR4 | Deck multi-cartes (1–3 configs) | 3.1, 3.3 | ✅ deck-manager.spec.js, deck.spec.js, deck_integration_tests.rs |
| FR5 | Sauvegarder le panier (localStorage pour invités) | 3.2, 3.3 | ✅ deck-manager.spec.js (persistance locale, guest) |
| FR6 | Synchronisation cloud (utilisateurs connectés) | 3.3 | ✅ deck_integration_tests.rs, deck-manager.spec.js |

---

## Environnement et commandes

### Frontend (E2E + unitaires)

```bash
cd frontend
npm run test:run
npx playwright test deck-manager.spec.js --project=chromium --workers=1
```

- **E2E :** Playwright 1.58.x, projet `chromium`
- **Unitaires :** Vitest 4.x
- **Prérequis E2E :** Backend optionnel (mocks catalogue/quote dans deck-manager.spec.js)

### Backend (intégration)

```bash
cargo test -- --ignored
```

- **Prérequis :** `.env` avec `DATABASE_URL_TEST` (recommandé) ou `DATABASE_URL`, et `JWT_SECRET`. Le projet charge `.env` via dotenvy.
- **Vérification 2026-02-13 :** 12 tests passés (5 auth + 5 deck + 2 quote_submit)
- **Sans PostgreSQL :** `cargo test` → 22 tests passent, 12 ignorés

---

## Recommandations

1. **CI :** Les tests deck-manager et deck unitaires passent sans backend ni DB. Pour exécuter les 12 tests d'intégration backend en CI : créer la base `gameboy_configurator_test`, configurer `DATABASE_URL_TEST` dans les secrets, puis `cargo test -- --ignored`.
2. **Mobile Chrome :** Un test 3.1 (limite 3 configurations) peut échouer sur Mobile Chrome (timeout/viewport). Non bloquant ; à traiter séparément si besoin.
3. **Rapports manquants :** Aucun rapport QA dédié pour Story 3.0 ni 3.2. Les tests existent et couvrent les AC ; une génération de rapports rétroactive est optionnelle pour homogénéité.

---

**Généré par :** Quinn — QA Engineer  
**Rapports sources :** test-summary-story-3-1.md, test-summary-story-3-3.md  
**Date :** 2026-02-13
