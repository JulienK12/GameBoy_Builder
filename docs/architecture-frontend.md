# 🎨 Architecture — Frontend (Vue.js 3)

> **Type :** SPA (Single Page Application)
> **Framework :** Vue.js 3.5 (Composition API)
> **State :** Pinia 3.0
> **3D :** TresJS 5.3 (Three.js 0.182)
> **Dernière mise à jour :** 2026-02-15 (Post-Epic 6)

---

## 1. Structure de l'application (HUD "Airy Cyberpunk")

L'interface est conçue comme un HUD (Head-Up Display) immersif avec des marges généreuses et des espacements `gap-8` (Standard Airy).

### Composants Racines :
- **App.vue** : Orchestrateur central gérant l'état visuel (Portal, Atelier, Signature).
- **LandingPortal.vue** : Entrée dynamique avec choix Starter Kits vs Atelier.
- **ExpertSidebar.vue** : Panneau technique pour les mods avancés.
- **ButtonGranularSelector.vue** : Interface de sélection bouton par bouton (Epic 6).
- **SignatureShowcase.vue** : Mode célébration final avant soumission.

---

## 2. Gestion d'état (Pinia Stores)

### `configurator.js` (Cœur métier)
- **State** : Selections (shell, screen, lens, buttons), expert mode toggle, catalog data.
- **Nouveauté Epic 6** : `selectedButtons` objet stockant la couleur pour chaque ID de bouton.
- **Actions** : Synchronisation avec le backend pour le calcul de devis optimiste.

### `deck.js` (Persistence)
- **Local** : `pinia-plugin-persistedstate` pour le stockage invité.
- **Cloud** : Synchronisation avec `GET/POST /deck` lorsque l'utilisateur est authentifié.
- **Limitation** : Max 3 configurations gérées visuellement.

### `auth.js`
- Gère l'état de connexion, le profil utilisateur et les transitions Login/Register.

---

## 3. UI System & Design Tokens

Utilise **Tailwind CSS v4** avec des composants **Radix Vue** pour l'accessibilité.

- **Filtres Néon** : Effets de Glow sur les éléments actifs (`shadow-neo-orange`).
- **Micro-interactions** : Glitch effects (via `GlitchEffect.vue`) lors des erreurs de compatibilité et transitions fluides entre catégories.
- **Responsive** : Design "Touch-First" optimisé pour mobile (résolution des overlaps dans Epic 6).

---

## 4. Tests & Qualité

**Playwright** est utilisé pour valider les flux critiques :
- `granular-buttons.spec.js` : Test complet de la personnalisation bouton par bouton.
- `smoke_test.js` : Validation flash du chargement global.
- `deck_persistence_test.js` : Vérification du localStorage et sync Cloud.

---

## 5. Points d'attention actualisés
1. **SSO ready** : L'architecture est prête pour une extension vers d'autres méthodes d'auth.
2. **Mode Offline** : Le configurateur fonctionne sans backend (catalogue en cache) mais sans calcul de prix exact.
3. **Optimistic UI** : Les changements de prix sont immédiats dans le store, avec rollback en cas d'échec API.
