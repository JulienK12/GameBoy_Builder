# Story 1.3: Mise en page HUD "Airy" & Récapitulatif de Sélection

Status: done

## Story

En tant que Créateur,
Je veux un résumé clair et aéré de ma sélection actuelle,
Afin de pouvoir valider ma configuration sans surcharge cognitive.

## Acceptance Criteria (BDD)

1. [x] **Étant donné** une configuration en cours (au moins un composant sélectionné),
   **Quand** je consulte le panneau "Selection Recap",
   **Alors** la mise en page suit les directives "Airy Cyberpunk" (`gap-8`, marges généreuses `p-8`).

2. [x] **Étant donné** une configuration avec coque + écran + vitre sélectionnés,
   **Quand** le Recap est affiché,
   **Alors** chaque article est affiché avec son image, son nom, et son prix.

3. [x] **Étant donné** que l'utilisateur modifie sa configuration (ajout, suppression, changement),
   **Quand** le store Pinia est mis à jour,
   **Alors** le Recap se rafraîchit avec une animation fluide (transition Vue.js).

4. [x] **Étant donné** que l'utilisateur a sélectionné un Pack (Story 1.1),
   **Quand** le Recap est affiché,
   **Alors** les composants pré-sélectionnés du pack sont visibles dans le récapitulatif,
   **Et** un badge "Pack" indique l'origine de la sélection.

5. [x] **Étant donné** l'affichage du prix total via `QuoteDisplay.vue`,
   **Quand** la configuration change,
   **Alors** le devis est recalculé via `POST /quote` et le prix total est mis à jour en temps réel.

## Dépendances

> ⚠️ **Dépend de Story 1.1** — Le store Pinia doit supporter les packs et le flag `selectedPackId`.
> Story 1.2 n'est **pas bloquante** (le Recap affiche les composants, pas le processus de résolution du prix).

## Tasks / Subtasks

### Frontend (Vue.js — composant existant à refactorer)

- [x] **Task 1 — Audit et refactoring du `SelectionRecap.vue` existant** (AC: #1)
  - [x] 1.1 — Revoir le composant existant (~153 LOC) et identifier les écarts avec le design "Airy Cyberpunk"
  - [x] 1.2 — Augmenter les marges : remplacer les `gap-4` par `gap-8`, `p-6` par `p-8`
  - [x] 1.3 — Vérifier que la grille utilise des flex/grid responsives (desktop: 2 colonnes, mobile: stack vertical)
  - [x] 1.4 — S'assurer que les classes `glass-premium`, `font-retro`, et les accents néon sont appliqués

- [x] **Task 2 — Intégration du badge Pack** (AC: #4)
  - [x] 2.1 — Ajouter un indicateur visuel "Pack" quand `store.selectedPackId` est non-null
  - [x] 2.2 — Afficher le nom du pack en haut du récapitulatif (ex: "Budget Gamer 🎁")

- [x] **Task 3 — Animations de transition** (AC: #3)
  - [x] 3.1 — Ajouter `<TransitionGroup>` autour de la liste des items pour des entrées/sorties fluides
  - [x] 3.2 — Utiliser un timing CSS compatible avec le thème cyberpunk (300-500ms, ease-out)
  - [x] 3.3 — Implémenter un léger "fade + slide-up" à l'ajout, "fade + slide-down" à la suppression

- [x] **Task 4 — Synchronisation prix temps réel** (AC: #5)
  - [x] 4.1 — Vérifier que `fetchQuoteData()` est appelée dans le `watch` du store à chaque changement de sélection
  - [x] 4.2 — S'assurer que `QuoteDisplay.vue` réagit aux mises à jour de `store.quoteData`
  - [x] 4.3 — Ajouter un état de loading (`isQuoteLoading`) visible pendant le recalcul

- [x] **Task 5 — Tests Playwright** (AC: #1, #2, #3)
  - [x] 5.1 — Test : Sélectionner un pack → vérifier que les 3 composants apparaissent dans le Recap
  - [x] 5.2 — Test : Changer un composant → vérifier que le Recap se met à jour
  - [x] 5.3 — Test : Vérifier les espacements (gap) via `getComputedStyle`

## Dev Notes

### Composant Existant

Le fichier `frontend/src/components/SelectionRecap.vue` a été refactoré pour utiliser une grille adaptive (2 colonnes sur desktop) et des transitions fluides.

### Ce qui change vs. l'existant

| Aspect | Avant | Après |
|---|---|---|
| Espacement | `gap-4 lg:gap-8` | `gap-8` systématique (Grid) |
| Padding | `p-6 lg:p-10` | `p-8 lg:p-10` |
| Transitions | Aucune animation | `<TransitionGroup>` + `.recap-card-move` |
| Badge Pack | Absent | Badge "Pack" avec animation |
| Accessibilité | Basique | Labels ARIA complets |

## Dev Agent Record

### Agent Model Used

Antigravity (M18)

### File List

- `frontend/src/components/SelectionRecap.vue`
- `frontend/src/stores/configurator.js`
- `frontend/tests/selection-recap.spec.js`

### Change Log

| Date | Changement | Auteur |
|---|---|---|
| 2026-02-11 | Story créée — ready-for-dev | Bob (SM) |
| 2026-02-11 | Implémentation initiale et correction Code Review | Antigravity |

