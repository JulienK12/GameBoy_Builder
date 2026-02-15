# QA Epic 1 — Résumé des tests

**Epic :** 1 — L'Atelier de Base (Starter Kits & Moteur de Prix)  
**Date QA :** 2026-02-13 (refaite)  
**Agent :** Quinn (QA Engineer)

---

## Objectif

Vérifier que les tests couvrant l'Epic 1 (Stories 1.1, 1.2, 1.3) sont en place, passent, et couvrent les critères d'acceptation.

---

## Tests exécutés

### Backend — Rust (Story 1.2)

**Fichiers :** `src/logic/calculator.rs`, `src/data/catalog_tests.rs`  
**Commande :** `cargo test`

| # | Type | Scénario | Résultat |
|---|------|----------|----------|
| 1 | Unit | Moteur de prix — 8 tests existants (compatibilité, prix, erreurs) | ✅ |
| 2 | Unit | `test_quote_pack_with_expert_options` — pack_id + expert_options | ✅ |
| 3 | Unit | `test_resolve_pack_defaults` — résolution pack sans overrides | ✅ |
| 4 | Unit | `test_resolve_pack_overrides` — résolution pack avec overrides | ✅ |
| 5 | Unit | `test_resolve_pack_not_found` — pack invalide → erreur | ✅ |

**Résultat Backend :** ✅ **22/22 tests unitaires passés** (12 ignored — auth/deck/quote_submit nécessitent PostgreSQL).

---

### E2E Playwright — selection-recap.spec.js (Story 1.3)

**Fichier :** `frontend/tests/selection-recap.spec.js`  
**Commande :** `npx playwright test selection-recap.spec.js --project=chromium`  
**Prérequis :** API mockée via `page.route()` — pas de backend requis.

| # | Scénario | AC | Résultat |
|---|----------|-----|----------|
| 1 | Pack sélectionné → 3 items dans Recap + badge Pack visible | AC #2, #4 | ✅ |
| 2 | Modification manuelle (Atelier Libre) → Recap mis à jour, suppression via X | AC #3 | ✅ |
| 3 | Vérification gap-8 (32px) et padding (p-8/p-10) via getComputedStyle | AC #1 | ✅ |

**Résultat selection-recap :** ✅ **3/3 passés**.

---

### E2E Playwright — landing-portal.spec.js (Story 1.1)

**Fichier :** `frontend/tests/landing-portal.spec.js`  
**Commande :** `npx playwright test landing-portal.spec.js --project=chromium`  
**Prérequis :** Backend (`cargo run`) et PostgreSQL actifs — les tests appellent `GET /catalog/packs` et `POST /quote`.

| # | Scénario | AC | Résultat |
|---|----------|-----|----------|
| 1 | Landing Portal affiché au chargement avec "STARTER KITS" et "ATELIER LIBRE" | AC #1 | ✅ |
| 2 | Clic Starter Kits → packs chargés via API (Budget Gamer, prix 105.00 €) | AC #2, #5 | ❌ Backend non lancé |
| 3 | Sélection pack → portail fermé, composants dans Recap (Sapphire Blue) | AC #3 | ❌ Dépend #2 |
| 4 | Clic Atelier Libre → configurateur vide, pas de badge pack | AC #4 | ❌ Timeout (catalogue non chargé) |

**Résultat landing-portal :** ⚠️ **1/4 passé** — Tests 2, 3, 4 nécessitent le backend pour charger les packs et le catalogue. Sans backend : "Impossible de charger le catalogue" → les tests timeout.

**Exécution complète landing-portal :**

```bash
# Terminal 1 : Backend + PostgreSQL
cargo run

# Terminal 2 : Tests
cd frontend
npx playwright test landing-portal.spec.js --project=chromium
```

---

## Couverture par critères d'acceptation

### Story 1.1 — Système de Portail Dynamique

| AC | Description | Couvert par | Statut |
|----|-------------|-------------|--------|
| AC#1 | Landing Portal avec 2 cartes Starter Kits / Atelier Libre | landing-portal.spec.js | ✅ |
| AC#2 | Liste packs via GET /catalog/packs | landing-portal.spec.js | ⚠️ Backend requis |
| AC#3 | Sélection pack → store Pinia, configurateur mode Simple | landing-portal.spec.js | ⚠️ Backend requis |
| AC#4 | Atelier Libre → configurateur vide | landing-portal.spec.js | ⚠️ Backend requis |
| AC#5 | Prix exclusivement du backend (pas de hardcode) | landing-portal.spec.js | ⚠️ Backend requis |

### Story 1.2 — Logique de Bundle Backend & Tarification

| AC | Description | Couvert par | Statut |
|----|-------------|-------------|--------|
| AC#1 | pack_id valide → résolution, calcul, LineItems | catalog_tests + calculator tests | ✅ |
| AC#2 | pack_id + overrides → override appliqué | test_resolve_pack_overrides | ✅ |
| AC#3 | pack_id invalide → 400 | test_resolve_pack_not_found | ✅ |
| AC#4 | Quote classique (sans pack_id) → zéro régression | 8 tests calculator existants | ✅ |
| AC#5 | Composant pack inexistant → erreur | calculate_quote valide via find_* | ✅ |

### Story 1.3 — Mise en page HUD Airy & Récapitulatif

| AC | Description | Couvert par | Statut |
|----|-------------|-------------|--------|
| AC#1 | Airy Cyberpunk (gap-8, p-8) | selection-recap.spec.js (getComputedStyle) | ✅ |
| AC#2 | Image, nom, prix par article | selection-recap.spec.js (mock) | ✅ |
| AC#3 | Rafraîchissement + transition fluide | selection-recap.spec.js (modification manuelle) | ✅ |
| AC#4 | Badge Pack visible | selection-recap.spec.js | ✅ |
| AC#5 | Prix temps réel via POST /quote | selection-recap.spec.js (mock quote) | ✅ |

---

## Checklist QA Epic 1

- [x] AC Story 1.1 #1 — Test E2E passé (portail affiché)
- [ ] AC Story 1.1 #2–#5 — Tests E2E à exécuter avec backend lancé
- [x] AC Story 1.2 #1 à #5 — Tous couverts et passent (tests unitaires Rust)
- [x] AC Story 1.3 #1 à #5 — Tous couverts et passent (selection-recap.spec.js)
- [x] Tests unitaires Rust — 22/22 passés
- [x] Tests E2E selection-recap — 3/3 passés
- [ ] Tests E2E landing-portal — 1/4 passé (3/4 nécessitent backend)
- [x] Zéro régression — Moteur de prix inchangé
- [x] Architecture — resolve_pack dans `data/`, calculate_quote inchangé dans `logic/`

---

## Problèmes et recommandations

1. **landing-portal.spec.js et backend :** Les tests qui cliquent sur "Starter Kits" et attendent les packs nécessitent le backend sur `http://localhost:3000`. Prévoir l’exécution du backend (ou un mock global) avant ces tests, ou documenter clairement la procédure.

2. **Option : mock des appels API dans landing-portal :** Comme pour selection-recap, on pourrait mocker `GET /catalog/packs` dans landing-portal.spec.js pour permettre une exécution sans backend. Cela couvrirait la logique UI sans valider l’intégration backend.

---

## Synthèse

| Story | Backend Rust | E2E Playwright | Statut |
|-------|--------------|----------------|--------|
| 1.1 | N/A | landing-portal : 1/4 passé (3/4 nécessitent backend) | ⚠️ Partiel |
| 1.2 | 14+ tests passés | N/A | ✅ OK |
| 1.3 | N/A | selection-recap : 3/3 passés | ✅ OK |

**Statut QA Epic 1 :** ✅ **Validé pour le périmètre testable sans backend** — Tests Rust et selection-recap passent. Les tests landing-portal restants nécessitent un backend actif. Pour une validation complète : lancer `cargo run`, puis `npx playwright test landing-portal.spec.js`.

---

*Généré par : Quinn (QA Engineer) — Document : test-summary-epic-1.md*
