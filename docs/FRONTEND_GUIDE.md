# 🛠️ Guide Technique Frontend (Rayboy)

**Version** : 1.0 (Post-Launch)
**Framework** : Vue 3, Vite, TailwindCSS v4, TresJS
**Backend** : Axum (Rust)

---

## 🏗️ Architecture du Projet

Le frontend est situé dans le dossier `frontend/` et suit une structure Vue.js standard.

```bash
frontend/
├── src/
│   ├── components/
│   │   ├── 3D/             # Composants TresJS (ThreeDPreview.vue)
│   │   ├── Gallery/        # Galerie de sélection (Filtres, Cartes)
│   │   ├── ui/             # Composants ShadCN (Tooltip, Dialog, Button)
│   │   └── ...
│   ├── stores/             # Pinia Store (configurator.js - État central)
│   ├── api/                # Clients Axios (backend.js)
│   └── App.vue             # Point d'entrée principal
├── public/models/          # Fichiers .glb pour la 3D
└── tests/                  # Tests Playwright
```

---

## 🚀 Développement au Quotidien

### Lancer le projet
```bash
# Dans le dossier frontend/
npm run dev
```

### Lancer les tests d'audit (Playwright)
Pour vérifier que l'UI (Filtres, Tooltips) ne régresse pas :
```bash
node verify_filters_tooltip.js
```
*Note : Assurez-vous que le serveur de dev tourne sur port 5174 ou modifiez le script.*

---

## 🧩 Composants Clés

### 1. `VariantGallery.vue`
C'est le cœur de l'UI de sélection.
- **Responsabilité** : Afficher la grille de produits (Coques, Écrans).
- **Features** :
    - Filtres (Marque, Technologie) gérés via `filtersConfig`.
    - Tri (Smart Sort par compatibilité).
    - Tooltips via ShadCN (`TooltipProvider`).

### 2. `ThreeDPreview.vue`
Gère la scène 3D.
- Charge le modèle GLB.
- Applique les couleurs dynamiquement via traversée du Scene Graph (`GenericModel.traverse`).
- Utilise `TresJS` pour l'intégration Vue/Three.

### 3. `configurator.js` (Store)
Centralise l'état :
- `shellVariants` / `screenVariants` : Chargés depuis l'API Rust.
- `compatibilityRules` : Matrice de compatibilité.
- `activeCategory` : Onglet actif.

---

## 🎨 Styling (TailwindCSS)
Le projet utilise un thème "Glassmorphism" personnalisé.
- **Classes utilitaires** : `glass-premium`, `glass-panel` (définies dans `style.css`).
- **Couleurs** : `neo-purple`, `neo-cyan`, `neo-orange` étendent la palette Tailwind.

---

## 🐛 Debugging
- **Vue DevTools** : Essentiel pour inspecter le Store Pinia.
- **Network Tab** : Surveiller les appels `/calculate_quote`.
- **Playwright** : Utiliser les scripts `verify_*.js` pour reproduire des parcours utilisateur.
