# 🎨 Architecture — Frontend (Vue.js 3)

> **Type :** SPA (Single Page Application)
> **Framework :** Vue.js 3.5 (Composition API)
> **State :** Pinia 3.0
> **3D :** TresJS 5.3 (Three.js 0.182)
> **CSS :** Tailwind CSS v4
> **Build :** Vite 7.2

---

## 1. Pattern architectural : Component-Based SPA

```
┌───────────────────────────────────────────────┐
│                    App.vue                     │ ← Orchestrateur + Layout HUD
│  ┌─────────────┐ ┌──────────┐ ┌────────────┐ │
│  │   Portal    │ │ Config   │ │ Signature  │ │
│  │ (Home/Packs)│ │ (Atelier)│ │ (Showcase) │ │
│  └─────────────┘ └──────────┘ └────────────┘ │
├───────────────────────────────────────────────┤
│            Pinia Store (configurator)          │ ← State: selections + Expert Mode
├───────────────────────────────────────────────┤
│            Pinia Store (deck)                  │ ← State: multi-configs persistence
├───────────────────────────────────────────────┤
│              API Layer (backend.js)            │
└───────────────────────────────────────────────┘
```

---

## 2. Composants détaillés

### 2.1 Point d'entrée

| Fichier | Rôle |
|---|---|
| `main.js` | Crée l'app Vue, initialise Pinia, monte `#app` |
| `App.vue` | Layout principal (310 LOC) : orchestration des panneaux, responsive, raccourcis clavier |
| `constants.js` | Définition des catégories : Shell, Screen, Lens, Buttons (disabled) |
| `style.css` | Design system complet (~10K) : glassmorphism, neon, retro-futuriste |

### 2.2 Composants 3D (`components/3D/`)

| Composant | LOC | Rôle |
|---|---|---|
| `ThreeDPreview.vue` | ~12K | Scène 3D principale : chargement GLB, rendu, animations, mappage couleurs |
| `SceneNode.vue` | ~2K | Nœud de scène individuel pour les meshes |
| `ModelMapper.vue` | ~6K | Outil de développement pour mapper les parties du modèle 3D (Shift+M) |

### 2.3 Composants Galerie (`components/Gallery/`)

| Composant | LOC | Rôle |
|---|---|---|
| `GalleryHeader.vue` | ~8K | En-tête avec titre et informations contextuelles |
| `GalleryFilters.vue` | ~3K | Système de filtres (marque, technologie, moulage) |
| `VariantCard.vue` | ~9K | Carte individuelle d'une variante avec image, prix, compatibilité |
| `VariantDetailsDialog.vue` | ~5K | Modale de détails au clic sur une variante |

### 2.4 Composants principaux (`components/`)

| Composant | LOC | Rôle |
|---|---|---|
| `VariantGallery.vue` | ~15K | Galerie complète : liste des variantes, filtrage, sélection |
| `SelectionRecap.vue` | ~10K | Vue récapitulative "Airy" : liste illustrée simplifiée |
| `ExpertSidebar.vue` | [NEW] | Contrôles techniques denses pour les réglages avancés |
| `SignatureShowcase.vue` | [NEW] | Mise en scène statutaire plein écran (finalisation) |
| `LandingPortal.vue` | [NEW] | Page de garde : choix Packs vs Libre |
| `QuoteDisplay.vue` | ~8K | Affichage du devis HUD (sidebar droite) |
| `DebugOverlay.vue` | ~1K | Overlay de debug (désactivé en prod) |

### 2.5 Composants UI (`components/ui/`)

Bibliothèque de composants réutilisables basée sur **Radix Vue** :

| Composant | Rôle |
|---|---|
| `button/` | Boutons avec variantes (CVA) |
| `card/` | Cartes container |
| `dialog/` | Modales accessibles (Radix) |
| `tooltip/` | Info-bulles au survol (Radix) |

Utilise `class-variance-authority` (CVA) pour les variantes de style et `tailwind-merge` pour la fusion de classes.

---

## 3. Store Pinia (`stores/configurator.js`)

**State principal :**
```javascript
// Sélections
selectedShellVariantId    // Coque sélectionnée
selectedScreenVariantId   // Écran sélectionné
selectedLensVariantId     // Vitre sélectionnée
selectedExpertOptions     // Options avancées (CPU, Audio, etc.)
activeCategory            // Catégorie active
isExpertMode              // Toggle Expert (Boolean)
show3D                    // Toggle 3D Overlay

// Catalogue (chargé depuis l'API)
shellVariants, screenVariants, lensVariants
compatibility             // Matrice de compatibilité

// Devis
quoteData                 // Résultat du calcul de devis
isQuoteLoading            // Indicateur de chargement
```

**Actions principales :**
| Action | Rôle |
|---|---|
| `fetchCatalog()` | Charge shells, screens, lenses depuis l'API backend |
| `selectShell(variantId, colorHex)` | Sélectionne une coque et met à jour la couleur 3D |
| `selectScreen(variantId)` | Sélectionne un écran, vérifie compatibilité |
| `selectLens(variantId)` | Sélectionne une vitre |
| `fetchQuoteData()` | Appelle `POST /quote` pour calculer le devis |
| `checkCompatibility(shellId, screenId)` | Vérifie la compatibilité coque/écran |
| `getCompatibility(variant)` | Détermine l'état de compatibilité d'une variante |
| `resetConfig()` | Réinitialise toute la configuration |

### 3.1 Store deck et persistance hybride (Story 3.2 / 3.3)

**Persistance :**
- **Clé localStorage :** `gameboy-deck` (via `pinia-plugin-persistedstate`).
- **Utilisateur connecté :** le store deck est la source de vérité backend ; au chargement (ou à l’ouverture du Deck Manager), `loadFromCloud()` appelle `GET /deck` et remplace le contenu du store par les données serveur. La persistance locale reste active mais les données cloud écrasent le store en mémoire tant que l’utilisateur est connecté.
- **Invité :** pas d’appel API deck ; la source de vérité est le localStorage (comportement 3.2).
- **Au logout :** l’état auth est effacé ; les prochaines actions deck utilisent à nouveau le localStorage (invité).

**Actions deck :** `loadFromCloud()`, `addCurrentConfig(name?)`, `removeConfig(id)`, `getPreviewImageUrl(entry)`.

---

## 4. Couche API (`api/backend.js`)

**Base URL :** `http://127.0.0.1:3000`

| Fonction | Endpoint | Méthode | Retour |
|---|---|---|---|
| `fetchShells()` | `/catalog/shells` | GET | `{ shells, variants, compatibility }` |
| `fetchScreens()` | `/catalog/screens` | GET | `{ screens, variants }` |
| `fetchLenses()` | `/catalog/lenses` | GET | `{ lenses, variants }` |
| `calculateQuote(config)` | `/quote` | POST | `Quote { items, total_price, warnings }` |
| `formatImageUrl(url)` | — | local | URL formatée pour les images |
| `getShellImageUrl(id)` | — | local | URL image coque |
| `getScreenImageUrl(id)` | — | local | URL image écran |
| `getLensImageUrl(id)` | — | local | URL image vitre |
| `getAuthMe()` | `/auth/me` | GET | `{ user: { id, email } }` (cookies) |
| `fetchDeck()` | `/deck` | GET | `{ configurations: […] }` |
| `createDeckConfig(body)` | `/deck` | POST | `{ configuration }` |
| `deleteDeckConfig(id)` | `/deck/:id` | DELETE | 204 |
| `updateDeckConfig(id, body)` | `/deck/:id` | PUT | `{ configuration }` (renommage, optionnel) |

---

## 5. Design System

**Thème :** Retro-futuriste / Glassmorphism / Cyber-neon

| Token | Valeur | Usage |
|---|---|---|
| `neo-orange` | `#FF6B35` | Couleur primaire, accents |
| `neo-purple` | — | Accents secondaires |
| `neon-cyan` | — | Accents 3D, corners |
| `grey-ultra-dark` | — | Background principal |
| `.glass-premium` | Backdrop-blur + bordures subtiles | Conteneurs flottants |
| `.shadow-neo-hard-orange` | Glow orange | Ombres des panneaux actifs |
| `font-retro` | — | Labels techniques (8px) |
| `font-title` | — | Titres et branding |

---

## 6. Tests automatisés

**Framework :** Playwright

| Fichier | Type | Cible |
|---|---|---|
| `smoke_test.js` | Smoke | Vérifie le chargement de l'app |
| `selection_test.js` | Fonctionnel | Sélection de variantes |
| `mobile_test.js` | Responsive | Layout mobile |
| `audit_model.js` | Audit | Vérification du modèle de données |
| `audit_ui.js` | Audit | Vérification de l'interface |
| `verify_ui.js` | UI | Validation visuelle |
| `verify_filters_tooltip.js` | UI | Filtres et tooltips |

---

## 7. Points d'attention

1. **API_URL hardcodée** : `http://127.0.0.1:3000` dans `backend.js` — devrait être une variable d'environnement.
2. **Images servies depuis deux sources** : Backend (`/assets/images/`) et Frontend (`/public/images/`).
3. **Catégorie Buttons désactivée** : `disabled: true` dans constants.js — fonctionnalité future.
4. **ModelMapper** : Outil dev activable via `Shift+M` — à retirer avant production.
