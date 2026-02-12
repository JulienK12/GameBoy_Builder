# Story 4.1: Le Moment "Signature" (Focus Reveal)

Status: done

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant qu'Utilisateur,
Je veux une révélation visuelle spectaculaire de ma configuration finale avant validation,
Afin de ressentir la satisfaction d'avoir créé un objet unique.

## Acceptance Criteria (BDD)

1. **Étant donné** une configuration complète et validée (coque + écran + vitre sélectionnés, devis calculé)
   **Quand** je clique sur "Finaliser" (ou équivalent depuis QuoteDisplay / SelectionRecap)
   **Alors** l'UI passe en mode "Signature Showcase" (plein écran)
   **Et** le reste de l'interface (galerie, recap, quote sidebar) est masqué

2. **Étant donné** que le Signature Showcase est affiché
   **Quand** la scène se charge
   **Alors** la console est présentée avec un éclairage dramatique (style Photo Statutaire)
   **Et** des effets visuels légers (particules, glow, scan) renforcent l'ambiance Cyberpunk sans surcharger

3. **Étant donné** que le Signature Showcase est affiché
   **Quand** l'utilisateur regarde la fiche technique
   **Alors** une "SignatureCard" résume la création avec :
   - Un numéro de série (généré ou dérivé, ex. format RB-XXXX)
   - Les caractéristiques clés : coque, écran, vitre, prix total
   - Un CTA "Confirmer la Création" (comportement = Story 4.2 ; pour 4.1, le bouton peut être présent mais désactivé ou afficher un placeholder)

## Dépendances

> ✅ **Epic 1** — Portail, devis, recap en place
> ✅ **Epic 2** — Mode Expert, GlitchEffect, Feedback optimiste
> ✅ **Epic 3** — Deck, Auth, persistance
> 📌 **Story 4.1** — Création du composant SignatureShowcase et transition "Finaliser" → plein écran
> 📌 **Story 4.2** — Logique "Confirmer la Création" (auth, POST /quote/submit, redirection panier)

## Tasks / Subtasks

### Frontend — Composant SignatureShowcase

- [x] **Task 1 — Créer SignatureShowcase.vue** (AC: #1, #2, #3)
  - [x] 1.1 — Créer `frontend/src/components/SignatureShowcase.vue` : conteneur plein écran (`fixed inset-0 z-[100]` ou équivalent), fond sombre (grey-ultra-dark)
  - [x] 1.2 — Intégrer la vue 3D existante (ThreeDPreview ou scène dédiée) avec éclairage dramatique : lumière principale focalisée sur la console, ambiance "Photo Statutaire"
  - [x] 1.3 — Ajouter effets visuels légers : particules subtiles (CSS ou Three.js), glow néon, éventuel effet scan — respecter NFR2 (contraste WCAG AA) et performance mobile (NFR3)
  - [x] 1.4 — Créer la SignatureCard : fiche technique Cyberpunk (glass-premium, bordures notched) affichant numéro de série, coque, écran, vitre, prix total
  - [x] 1.5 — Bouton "Confirmer la Création" : visible mais sans logique métier complète (Story 4.2) ; pour 4.1, afficher ou émettre un événement placeholder
  - [x] 1.6 — Bouton "Retour" ou "Modifier" pour quitter le mode Signature et revenir à l'atelier

### Frontend — Intégration App.vue

- [x] **Task 2 — Transition "Finaliser" → Signature Showcase** (AC: #1)
  - [x] 2.1 — Ajouter un state global `showSignatureShowcase` (configurator store ou App.vue) pour afficher/masquer le composant
  - [x] 2.2 — Depuis QuoteDisplay (recommandé : contexte devis/validation) : bouton "Finaliser" qui met `showSignatureShowcase = true` et masque le reste du layout
  - [x] 2.3 — Condition d'affichage : configuration complète (shellVariantId + screenVariantId + lensVariantId) et devis valide (`store.quote?.success`) ; sinon désactiver le bouton ou afficher un message
  - [x] 2.4 — Importer et rendre SignatureShowcase dans App.vue avec `v-if="showSignatureShowcase"`

### Frontend — Données & Props

- [x] **Task 3 — Passer la configuration au SignatureShowcase** (AC: #3)
  - [x] 3.1 — Props ou store : passer la sélection actuelle (coque, écran, vitre, couleur, prix) au composant
  - [x] 3.2 — Numéro de série : générer un identifiant court (ex. RB- + 4 caractères aléatoires) ou dériver de timestamp ; documenter le format pour cohérence future
  - [x] 3.3 — Afficher les libellés des variantes (nom coque, écran, vitre) depuis le store configurator / catalogue

### Tests

- [x] **Task 4 — Tests E2E** (AC: tous)
  - [x] 4.1 — Playwright : sélectionner une config complète → cliquer "Finaliser" → vérifier affichage plein écran Signature Showcase, présence SignatureCard, bouton Retour
  - [x] 4.2 — Vérifier que le bouton Retour ramène à l'atelier sans perte d'état
  - [x] 4.3 — Mobile : vérifier que le mode Signature est utilisable (responsive, touch)

## Dev Notes

### Contexte métier

- **FR10** : Présentation "Signature" (Photo Statutaire) pour la validation finale — transformer l'acte de validation en moment de célébration visuelle.
- **Epic 4** : "L'Expérience Signature" — Showcase & Validation Finale.
- **Story 4.2** : Gère l'authentification, POST /quote/submit, redirection panier. En 4.1, on se concentre uniquement sur la mise en scène visuelle et la transition "Finaliser".

### Contraintes architecturales

- **Architecture frontend** : [Source: docs/architecture-frontend.md] — Vue 3.5, Pinia 3.0, TresJS 5.3, Tailwind v4.
- **Composant SignatureShowcase** : mentionné dans architecture-frontend.md comme [NEW] ; à créer dans `frontend/src/components/`.
- **Design system** : Thème Cyberpunk (neo-orange, glass-premium, shadow-neo-hard-orange, font-retro). NFR1 (esthétique haute-lisibilité), NFR2 (contraste WCAG AA), NFR3 (3D Draco pour fluidité mobile).
- **ThreeDPreview.vue** : composant 3D existant (~12K LOC) — réutiliser ou créer une vue simplifiée pour le showcase (éclairage dramatique, pas besoin des contrôles d'atelier).

### Stack et patterns existants

- **Composants** : LandingPortal.vue, ExpertSidebar.vue, SelectionRecap.vue, QuoteDisplay.vue, GlitchEffect.vue, DeckManager.vue.
- **Store configurator** : `selectedShellVariantId`, `selectedScreenVariantId`, `selectedLensVariantId`, `quote`, `totalPrice`, `selectedShellColorHex`, `selectedExpertOptions`.
- **Store deck** : `addCurrentConfig`, utilisé en 4.2 pour la persistance après validation.
- **API** : Aucun appel requis en 4.1 (POST /quote/submit = Story 4.2).

### Fichiers à créer / modifier

**Créations :**
- `frontend/src/components/SignatureShowcase.vue` — Composant principal du mode Signature

**Modifications :**
- `frontend/src/App.vue` — Import SignatureShowcase, state `showSignatureShowcase`, bouton ou trigger "Finaliser"
- `frontend/src/components/QuoteDisplay.vue` — Bouton "Finaliser" déclenchant l'affichage (contexte devis/validation)
- `frontend/src/stores/configurator.js` — Optionnel : ajouter `showSignatureShowcase` si préféré au state local App

**Tests :**
- `frontend/tests/signature-showcase.spec.js` (nouveau) — spec dédié aligné avec `deck-manager.spec.js`, `selection-recap.spec.js`

### Intelligence de la story précédente (3.3)

- **Store auth** : `isAuthenticated`, `fetchUser` — utilisé en 4.2 pour la modale Login si non connecté.
- **Store deck** : `loadFromCloud`, `addCurrentConfig` — sync cloud pour utilisateurs connectés.
- **GlitchEffect** : utilisé pour les erreurs de validation (Story 2.3) — ne pas réutiliser pour le Signature (ambiance positive).
- **DeckManager** : z-50, modales — SignatureShowcase doit être au-dessus (z-[100] ou z-[60]) pour couvrir tout l'écran.
- **Architecture** : Lazy Auth — l'authentification n'est requise qu'à la validation finale (4.2) ; en 4.1, l'utilisateur peut voir le showcase sans être connecté.

### Références

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.1] — User story et critères d'acceptation
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Emotional journey "Validation (Panier) : Satisfaction et Accomplissement", Design system Cyberpunk
- [Source: docs/architecture-frontend.md] — SignatureShowcase.vue, Design system, composants 3D
- [Source: docs/api-contracts.md] — POST /quote/submit (Story 4.2, non utilisé en 4.1)

### Project Structure Notes

- Alignement avec `frontend/src/components/` pour les composants Vue.
- Réutilisation de `ThreeDPreview.vue` ou scène 3D existante : vérifier si un mode "showcase" peut être activé via props (éclairage, caméra) pour éviter duplication.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **Task 1** : SignatureShowcase.vue créé — conteneur plein écran z-[100], ThreeDPreview réutilisé, overlay glow/scan CSS, SignatureCard (glass-premium, notched), CTA "Confirmer la Création" désactivé (placeholder Story 4.2), bouton RETOUR.
- **Task 2** : State `showSignatureShowcase` dans le store configurator ; bouton FINALISER dans le panneau devis (desktop) et barre mobile (canFinalize) ; atelier masqué via `v-if="!store.showSignatureShowcase"` ; SignatureShowcase rendu dans App.vue.
- **Task 3** : Données depuis le store (shell/screen/lens labels, totalPrice) ; numéro de série RB-XXXX généré (Date.now().toString(36)) ; documenté en commentaire pour Story 4.2.
- **Task 4** : Tests E2E `frontend/tests/signature-showcase.spec.js` — 4.1 (fullscreen, SignatureCard, Retour), 4.2 (Retour sans perte d'état), 4.3 (mobile responsive). 9/9 passent (chromium, Mobile Chrome, Mobile Safari).
- **Code review (AI) :** Corrections appliquées — focus + focus trap (a11y), console.log en DEV uniquement, serial RB-XXXX (timestamp + aléatoire), resetConfig ferme le showcase, File List + playwright.config.js.

### File List

- frontend/src/components/SignatureShowcase.vue (nouveau)
- frontend/src/App.vue (modifié)
- frontend/src/stores/configurator.js (modifié)
- frontend/tests/signature-showcase.spec.js (nouveau)
- frontend/playwright.config.js (modifié — projects Mobile Chrome / Mobile Safari pour tests 4.3)

## Senior Developer Review (AI)

**Reviewer :** Julien (code-review workflow)  
**Date :** 2026-02-12

**Résumé :** Revue adversariale Story 4.1. 1 High, 3 Medium, 5 Low identifiés. Tous les points High et Medium ont été corrigés automatiquement.

**Corrections appliquées :**
- **HIGH — Accessibilité :** Focus déplacé sur le bouton RETOUR à l’ouverture du dialogue ; piège à focus (Tab) pour rester dans le modal (WCAG 2.1).
- **MEDIUM — File List :** `frontend/playwright.config.js` ajouté à la File List.
- **MEDIUM — Console :** `console.log` dans `onConfirmPlaceholder` conditionné à `import.meta.env.DEV`.
- **MEDIUM — Numéro de série :** Génération RB-XXXX avec partie timestamp + partie aléatoire pour éviter collision à la même milliseconde.
- **LOW (bonus) :** `resetConfig()` dans le store remet `showSignatureShowcase` à `false`.

**Points restants (LOW, non bloquants) :** contraste "Disponible prochainement", alignement spec/store.quote?.success, test E2E "bouton Finaliser désactivé si config incomplète" en option.

## Change Log

- 2026-02-12 : Implémentation Story 4.1 — Signature Showcase, transition Finaliser, tests E2E.
- 2026-02-12 : Code review (AI) — corrections appliquées : focus/accessibilité, console.log, serial number, resetConfig, File List.
