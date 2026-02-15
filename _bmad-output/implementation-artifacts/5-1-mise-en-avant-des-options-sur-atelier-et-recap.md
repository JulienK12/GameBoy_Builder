# Story 5.1: Mise en avant des options sur atelier et récap

Status: done

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant qu'utilisateur,
je vois clairement les options que j'ai choisies (mods, pack, etc.) sur la page atelier / récap,
plutôt qu'un modèle 3D,
afin que la configuration soit l'élément mis en avant tant que le 3D n'est pas disponible.

## Acceptance Criteria (BDD)

1. **Étant donné** une configuration en cours (pack ou atelier libre)
   **Quand** je consulte l'atelier ou le récapitulatif
   **Alors** les options choisies (coque, écran, mods, pack) sont mises en avant visuellement
   **Et** la configuration (texte + aperçus produits) est l'élément principal affiché

2. **Étant donné** l'atelier actif
   **Quand** je bascule entre 3D_VIEW et RECAP_VIEW
   **Alors** le récapitulatif (RECAP_VIEW) reste la vue par défaut au chargement (`show3D = false`)
   **Et** le rendu 3D est présenté comme secondaire (ex. label "Aperçu 3D", ou surface réduite) tant qu'il n'est pas prêt en production

3. **Étant donné** une sélection (coque, écran, vitre, pack, mods expert)
   **Quand** la vue récap est affichée
   **Alors** le pack actif (si présent), les cartes de variantes et les mods expert sont mis en avant (taille, contraste, hiérarchie visuelle)
   **Et** le design system Airy Cyberpunk (gap-8, glass-premium, font-retro) est respecté

## Dépendances

> ✅ **Epic 1** — Portail, devis, SelectionRecap
> ✅ **Epic 2** — Mode Expert, ExpertSidebar, mods
> ✅ **Epic 3** — Deck, Auth
> ✅ **Epic 4** — SignatureShowcase, QuoteDisplay, Finaliser
> 📌 **Story 5.1** — Focus options : vue par défaut RECAP, options comme élément principal

## Tasks / Subtasks

### Frontend — Vue par défaut et hiérarchie

- [x] **Task 1 — Confirmer RECAP comme vue par défaut** (AC: #2)
  - [x] 1.1 — Vérifier que `show3D` dans `configurator.js` initialise à `false` (déjà le cas)
  - [x] 1.2 — S'assurer qu'au premier affichage de l'atelier, l'utilisateur voit le récap (options) et non le 3D

### Frontend — Rendu 3D secondaire

- [x] **Task 2 — Marquer le rendu 3D comme secondaire** (AC: #2)
  - [x] 2.1 — Quand 3D_VIEW est affiché : ajouter un label ou badge discret (ex. "APERÇU_3D" ou "PREVIEW") pour indiquer que c'est une vue secondaire ; ajouter `data-testid="3d-preview-badge"` pour les tests E2E
  - [ ] 2.2 — Optionnel : réduire légèrement la surface du 3D (ex. cadrage ou overlay) pour renforcer la primauté des options ; ne pas casser l'existant (non implémenté - optionnel)

### Frontend — Mise en avant des options (SelectionRecap)

- [x] **Task 3 — Renforcer la hiérarchie visuelle des options** (AC: #1, #3)
  - [x] 3.1 — SelectionRecap : s'assurer que le pack badge, les cartes coque/écran/vitre et les mods expert ont une hiérarchie claire (taille, contraste, espacement)
  - [x] 3.2 — Augmenter si besoin la présence visuelle des options (marges, glass-premium, ombres néon) pour qu'elles soient le "héros" de la page
  - [x] 3.3 — Respecter le design system (gap-8, p-8, font-retro, NFR2 contraste WCAG AA)

### Tests

- [x] **Task 4 — Tests E2E** (AC: tous)
  - [x] 4.1 — Créer `frontend/tests/focus-options.spec.js` : charger l'atelier (API mockée ou backend) → vérifier que RECAP_VIEW est affiché par défaut (pas 3D) via `getByRole('button', { name: 'RECAP_VIEW' })` actif/highlighted
  - [x] 4.2 — Vérifier que les options (pack, coque, écran, vitre) sont visibles et mises en avant dans le récap (après sélection ou pack)
  - [x] 4.3 — Basculement 3D_VIEW / RECAP_VIEW : vérifier que le toggle fonctionne ; si Task 2.1 implémentée, vérifier la présence de `data-testid="3d-preview-badge"` en mode 3D

## Dev Notes

### Contexte métier

- **Epic 5** : "Focus Options" — Le modèle 3D n'est pas encore prêt en production. L'objectif est de mettre en avant les options choisies (mods, pack, coque, écran, vitre) plutôt que le rendu 3D.
- **Vue actuelle** : L'atelier alterne entre 3D_VIEW (ThreeDPreview) et RECAP_VIEW (SelectionRecap) via un toggle. `show3D` est déjà à `false` par défaut dans le store.

### Contraintes architecturales

- **Architecture frontend** : [Source: docs/architecture-frontend.md] — Vue 3.5, Pinia 3.0, Tailwind v4.
- **Design system** : Airy Cyberpunk — gap-8, p-8, glass-premium, font-retro, neo-orange, neon-cyan. NFR1, NFR2 (contraste WCAG AA).
- **Composants existants** : SelectionRecap.vue (~10K), App.vue (toggle 3D/Recap, main area), configurator store (show3D, selectedPackId, currentSelection, quote).

### Stack et patterns existants

- **SelectionRecap.vue** : Affiche pack badge, recapItems (shell, screen, lens), expertModItems. Utilise TransitionGroup, glass-premium, aspect-ratio.
- **App.vue** : Toggle 3D_VIEW / RECAP_VIEW en haut au centre ; Transition entre ThreeDPreview et SelectionRecap.
- **configurator.js** : `show3D = ref(false)`, `toggleExpertMode`, `currentSelection`, `selectedPackId`, `quote`.

### Fichiers à modifier

**Modifications :**
- `frontend/src/App.vue` — Ajouter label/badge "APERÇU_3D" ou équivalent quand 3D_VIEW est affiché (optionnel : ajuster layout)
- `frontend/src/components/SelectionRecap.vue` — Renforcer hiérarchie visuelle si besoin (marges, ombres, taille des cartes)
- `frontend/src/stores/configurator.js` — Aucune modification pour 5.1 (show3D déjà false). *Note : modifié par story bouton-retour (resetConfig, retourPortail) — dépendance croisée.*

**Tests :**
- `frontend/tests/focus-options.spec.js` (nouveau) — spec dédié pour AC 5.1 ; réutiliser les patterns de mock de `selection-recap.spec.js` et `signature-showcase.spec.js`

### Intelligence des stories précédentes (Epic 4)

- **SignatureShowcase** : z-[100], plein écran — ne pas impacter.
- **SelectionRecap** : Utilise `store.currentSelection`, `store.selectedPackId`, `store.quote` pour les mods. Les cartes ont des `removeAction` pour retirer une sélection.
- **Code review 4.1** : Focus trap, a11y, data-testid recommandés pour les tests E2E.

### Références

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 5, Story 5.1]
- [Source: docs/architecture-frontend.md — SelectionRecap, Design system]
- [Source: docs/api-contracts.md] — Pas d'appel API spécifique à 5.1

### Project Structure Notes

- Composants dans `frontend/src/components/`. Tests Playwright dans `frontend/tests/`.
- Réutiliser les classes Tailwind existantes (glass-premium, font-retro, neo-orange, etc.).

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (via Cursor)

### Debug Log References

### Completion Notes List

**2026-02-13 — Implémentation complète Story 5.1**

✅ **Task 1 — RECAP comme vue par défaut**
- Confirmé que `show3D` est déjà initialisé à `false` dans `configurator.js` (ligne 16)
- La vue RECAP s'affiche par défaut au chargement de l'atelier

✅ **Task 2 — Rendu 3D secondaire**
- Ajouté badge "APERÇU_3D" dans `App.vue` quand la vue 3D est affichée
- Badge positionné en haut au centre avec `data-testid="3d-preview-badge"` pour les tests E2E
- Style discret avec glass-premium et texte blanc/60 pour indiquer le caractère secondaire

✅ **Task 3 — Hiérarchie visuelle renforcée**
- Pack badge : bordure renforcée (border-2), ombre néon augmentée, taille de police augmentée
- Cartes récap : bordure renforcée (border-2), ombre hover améliorée avec néon orange, transition translate-y-2
- Mods expert : espacement gap-3, bordures border-2, padding augmenté, texte plus grand
- Design system respecté : gap-8, p-8, font-retro maintenus

✅ **Task 4 — Tests E2E**
- Créé `frontend/tests/focus-options.spec.js` avec 4 tests (Pack + Atelier Libre, AC #1-#3)
- Tests utilisent aria-pressed (robustes) au lieu de classes Tailwind
- Toggle déplacé top-16 sur mobile pour éviter conflit avec bouton RETOUR (code review fix)

### File List

**Modifications :**
- `frontend/src/App.vue` — Badge "APERÇU_3D", toggle top-16 sur mobile (éviter conflit RETOUR), aria-pressed, contraste WCAG
- `frontend/src/components/SelectionRecap.vue` — Hiérarchie visuelle, état vide opacity-70, data-testid="recap-empty-state"
- `frontend/src/components/SignatureShowcase.vue` — Ajout récapitulatif visuel (pack badge, cartes avec images, mods expert) dans la vue signature (Story 5.1)
- `frontend/src/stores/configurator.js` — Non modifié pour 5.1 (show3D déjà false). Modifié par story bouton-retour.

**Nouveaux fichiers :**
- `frontend/tests/focus-options.spec.js` — Tests E2E pour Story 5.1 (4 tests : Pack + Atelier Libre)

## Change Log

**2026-02-13 — Ajout récapitulatif visuel dans SignatureShowcase**
- Intégration du récapitulatif visuel (pack badge, cartes avec images, mods expert) dans SignatureShowcase
- Version desktop : panneau gauche centré verticalement
- Version mobile : panneau compact au-dessus de la SignatureCard
- Les options sont maintenant visibles visuellement dans la vue signature, pas seulement en texte

**2026-02-13 — Code review : corrections appliquées**
- Test chemin Atelier Libre (AC #1)
- Renommage tests 4.x → 5.1 AC#1/2/3
- Toggle 3D/Recap : top-16 mobile (conflit RETOUR), aria-pressed, data-testid
- Badge APERÇU_3D : contraste text-white/90 (WCAG AA)
- Tests : assertions aria-pressed au lieu de classes
- État vide SelectionRecap : opacity-70, data-testid="recap-empty-state"
- Story : documentation configurator.js (dépendance bouton-retour)

**2026-02-13 — Story 5.1 implémentée et prête pour review**
- Ajout badge "APERÇU_3D" pour marquer la vue 3D comme secondaire
- Renforcement de la hiérarchie visuelle dans SelectionRecap (pack badge, cartes, mods expert)
- Création tests E2E couvrant tous les critères d'acceptation
- Story marquée comme "review" dans sprint-status.yaml
