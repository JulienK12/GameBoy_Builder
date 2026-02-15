# Story 6.3: Frontend - Sélecteur granulaire "Airy Cyberpunk"

Status: in-progress

## Story

En tant que Créateur,
Je veux choisir la couleur de chaque bouton individuellement avec un feedback immédiat sur le prix,
Afin de créer une console qui me ressemble vraiment.

## Acceptance Criteria (BDD)

1. **Étant donné** le Mode Expert actif,
   **Quand** l'utilisateur accède à la section "Boutons" de l'ExpertSidebar,
   **Alors** un sélecteur granulaire s'affiche avec la liste des boutons correspondant au modèle de console actif (GBC, GBA, etc.).

2. **Étant donné** le sélecteur,
   **Quand** l'utilisateur clique sur un emplacement de bouton (ex: "Bouton A"),
   **Alors** une liste de couleurs disponibles (OEM + Custom) est présentée.

3. **Étant donné** un changement de couleur vers une variante custom,
   **Quand** la sélection est faite,
   **Alors** le store Pinia est mis à jour (`selectedButtons`) et un appel `POST /quote` est déclenché.

4. **Étant donné** le calcul de prix kit-centric (Story 6.1),
   **Alors** l'UI affiche clairement le supplément calculé (+5€ par kit de couleur custom unique).

5. **Étant donné** le HUD Cyberpunk,
   **Alors** le sélecteur utilise les patterns "Airy Cyberpunk" (glassmorphism, glow néon, marges p-8/gap-8).

## Developer Context (Bob's Ultimate Context Engine)

### 🏗️ Architecture & Store Compliance
- **Store Path**: `frontend/src/stores/configurator.js`
- **State Update**:
  - Ajouter `selectedButtons: {}` (Map de `button_id` -> `variant_id`).
  - **IMPORTANT**: Garder `selectedButtonVariantId` (alias pour le "Master Kit" si un pack est sélectionné) mais la logique granulaire dans `selectedButtons` doit primer ou être fusionnée lors de l'appel `/quote`.
- **API Call**: Mettre à jour `fetchQuoteData` pour envoyer `selected_buttons: store.selectedButtons` dans le corps du POST.

### 📊 Data Intelligence (from Story 6.2)
- **Endpoint**: `GET /catalog/buttons/{console_id}`
- **IDs Techniques à gérer**:
  - GBC: `d_pad`, `button_a`, `button_b`, `power_switch`, `ir_cover`.
  - GBA: `d_pad`, `a`, `b`, `on_off`, `l`, `r`, `bezel_l`, `bezel_r`.
- **Variantes**: Les variants ID commencent par `VAR_BUT_`. La variante `OEM` doit être gérée comme la valeur par défaut (no supplement).

### 🎨 UX/UI Guidelines
- **Composant**: Créer `frontend/src/components/ButtonGranularSelector.vue`.
- **Intégration**: L'insérer dans `ExpertSidebar.vue` (remplacer ou compléter la simple liste de sélections).
- **Animations**: Utiliser `<TransitionGroup>` pour l'apparition des options de couleur.
- **Feedback**: Utiliser un "Neon Glow" orange/émeraude sur le bouton actif.

## Tasks / Subtasks

### Phase 1 — Store & API
- [ ] **Task 1.1 — State Evolution**
  - [ ] Ajouter `selectedButtons: {}` dans `configurator.js`.
  - [ ] Créer l'action `updateButtonSelection(buttonId, variantId)`.
- [ ] **Task 1.2 — Backend Sync**
  - [ ] Modifier `fetchQuoteData` pour inclure `selected_buttons` dans la `QuoteRequest`.
  - [ ] S'assurer que si `selectedButtons` est vide, on envoie optionnellement `null` ou `{}`.

### Phase 2 — Composants UI
- [ ] **Task 2.1 — Nouveau Composant `ButtonGranularSelector.vue`**
  - [ ] Fetch des boutons via `fetchButtons(consoleId)` (à ajouter dans `api/backend.js` si manquant ou utiliser l'existant).
  - [ ] Grille de boutons avec icônes (si disponibles) ou labels retro.
  - [ ] Sélecteur de variantes (couleurs) avec preview.
- [ ] **Task 2.2 — Intégration ExpertSidebar**
  - [ ] Remplacer l'affichage "BOUTONS" statique par le nouveau sélecteur.
  - [ ] Gérer l'état de chargement (`isLoading`).

### Phase 3 — Polissage & Feedback
- [ ] **Task 3.1 — Feedback Prix**
  - [ ] Afficher un badge spécifique "Kit(s) de boutons : +X€" s'il y a des suppléments.
- [ ] **Task 3.2 — Micro-animations**
  - [ ] Effet de glitch léger lors de la sélection (cohérence avec `GlitchEffect.vue`).

## Dev Notes
- S'appuyer sur `VariantGallery.vue` pour la logique de sélection de couleurs.
- Attention : `selected_buttons` côté backend attend une map `id -> id`.
