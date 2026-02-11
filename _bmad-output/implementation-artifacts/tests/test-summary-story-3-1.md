# Rapport QA — Story 3.1 : L'UI du Deck (Multi-Cartes)

**Date :** 2026-02-11  
**Story :** 3.1 — L'UI du Deck (Multi-Cartes)  
**Epic :** 3 — Le Gestionnaire de Deck (FR4, FR5, FR6)  
**QA Engineer :** Quinn

---

## Résumé exécutif

- **Tests exécutés :** 13 (5 E2E + 8 unitaires)
- **Résultat :** ✅ Tous les tests passent
- **Correctifs appliqués pendant la QA :** 0 (aucune modification nécessaire)

---

## Tests exécutés

### 1. E2E — Deck Manager (Story 3.1)

**Fichier :** `frontend/tests/deck-manager.spec.js`

| Test | Statut | AC / Story |
|------|--------|------------|
| should open Deck Manager when clicking MON_DECK | ✅ | Task 4 — Accès Deck |
| should show empty state when deck has no configurations | ✅ | AC #1 (état vide) |
| AC #2: should disable add button and show message when deck has 3 configurations | ✅ | AC #2 |
| AC #3: should allow adding again after removing a configuration | ✅ | AC #3 |
| AC #1: each card should display image or placeholder, name and total price | ✅ | AC #1 |

### 2. Unitaires — Store deck (Story 3.1)

**Fichier :** `frontend/tests/unit/deck.spec.js`

| Test | Statut | AC / Story |
|------|--------|------------|
| canAddMore est true quand le deck est vide | ✅ | Getter canAddMore |
| addCurrentConfig ajoute une entrée avec nom par défaut "Configuration 1" | ✅ | Task 1.2, AC #1 |
| addCurrentConfig utilise le nom fourni quand il est renseigné | ✅ | Task 5.1 |
| canAddMore reste true avec 1 puis 2 configurations | ✅ | AC #2 (limite) |
| refuse d'ajouter au-delà de 3 configurations (AC #2) | ✅ | AC #2 |
| removeConfig retire l'entrée par id et libère un emplacement (AC #3) | ✅ | AC #3 |
| getPreviewImageUrl retourne une URL quand shellVariantId est présent | ✅ | Task 3.1 / 3.2 |
| getPreviewImageUrl retourne une chaîne vide sans shellVariantId (placeholder) | ✅ | Task 3.1 |

---

## Couverture des critères d'acceptation

| AC | Description | Couvert | Fichier(s) |
|----|-------------|--------|------------|
| AC #1 | Chaque configuration affichée sous forme de carte (aperçu, nom, prix) | ✅ | deck-manager.spec.js, deck.spec.js |
| AC #2 | Limite 3 configurations — bouton désactivé + message explicite | ✅ | deck-manager.spec.js, deck.spec.js |
| AC #3 | Suppression libère un emplacement, nouvelle config ajoutable | ✅ | deck-manager.spec.js, deck.spec.js |

---

## Environnement et commandes

- **E2E :** Playwright 1.58.x, projet `chromium`
- **Unitaires :** Vitest 4.x, `npm run test:run`
- **Prérequis E2E :** Backend optionnel pour catalogue/quote ; les tests qui sélectionnent coque/écran peuvent être plus lents ou instables si le backend n’est pas lancé (voir en-tête de `deck-manager.spec.js`).

**Lancer les tests Story 3.1 :**

```bash
cd frontend
npm run test:run
npx playwright test deck-manager.spec.js --project=chromium --workers=1
```

---

## Recommandations

1. **CI :** Les mocks catalogue/quote ont été ajoutés dans `deck-manager.spec.js` (comme pour expert-mode). En CI, aucun backend n'est requis pour ces tests ; le workflow est documenté dans `docs/development-guide.md` § 5 (Architecture des tests).
2. **Pas de correctif nécessaire** : Aucun correctif n’a été appliqué lors de cette QA ; les tests existants couvrent correctement les AC.

---

**Généré par :** Quinn — QA Engineer  
**Workflow :** QA Automate / QA Story 3.1  
**Date :** 2026-02-11
