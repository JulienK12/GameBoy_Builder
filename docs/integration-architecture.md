# 🔌 Architecture d'intégration — Backend ↔ Frontend

> **Type :** REST API (JSON over HTTP)
> **Backend :** `http://localhost:3000`
> **Frontend :** `http://localhost:5173`

---

## 1. Vue d'ensemble

```
┌─────────────────────┐            ┌─────────────────────┐
│     FRONTEND        │            │      BACKEND        │
│   Vue.js 3 (Vite)   │            │   Rust (Axum)       │
│   localhost:5173     │  HTTP/JSON │   localhost:3000     │
│                     │◄──────────►│                     │
│  ┌───────────────┐  │            │  ┌───────────────┐  │
│  │ Pinia Store   │  │   REST     │  │ Axum Handlers │  │
│  │ configurator  │──┼──────────► │  │ api/handlers  │  │
│  └───────────────┘  │            │  └───────┬───────┘  │
│        │            │            │          │          │
│  ┌─────▼─────────┐  │            │  ┌───────▼───────┐  │
│  │ api/backend.js│  │            │  │ logic/calc.   │  │
│  │ (Axios)       │  │            │  │ data/catalog  │  │
│  └───────────────┘  │            │  └───────┬───────┘  │
│                     │            │          │          │
│                     │            │  ┌───────▼───────┐  │
│                     │            │  │  PostgreSQL   │  │
│                     │            │  │  (SQLx)       │  │
│                     │            │  └───────────────┘  │
└─────────────────────┘            └─────────────────────┘
```

---

## 2. Points d'intégration

### 2.1 Chargement du catalogue (au montage de l'app)

```
Frontend                                 Backend
────────                                 ───────
App.vue → onMounted()
  └─► store.fetchCatalog()
        ├─► fetchShells()  ──GET──►  /catalog/shells  → { shells, variants, compatibility }
        ├─► fetchScreens() ──GET──►  /catalog/screens → { screens, variants }
        └─► fetchLenses()  ──GET──►  /catalog/lenses  → { lenses, variants }
```

**Transformation des données côté frontend :**
- Injection des images via `formatImageUrl()`
- Ajout du champ `shellId` (snake_case → camelCase) sur les variantes
- Stockage dans les refs Pinia : `shellVariants`, `screenVariants`, `lensVariants`, `compatibility`

### 2.2 Calcul du devis (à chaque sélection)

```
Frontend                                 Backend
────────                                 ───────
store.selectShell() / selectScreen() / selectLens()
  └─► store.fetchQuoteData()
        └─► calculateQuote({           POST /quote
              shellVariantId,            { shell_variant_id,
              screenVariantId,             screen_variant_id,
              lensVariantId                lens_variant_id }
            })
              │                              │
              │                              ▼
              │                         calculate_quote()
              │                         → Resolve parts
              │                         → Check compatibility
              │                         → Add services
              │                         → Calculate total
              │                              │
              ◄──────────────────────────────┘
              │
              ▼
        store.quoteData = response.quote
```

### 2.3 Images produit (double source)

```
Images servies par le Backend (Axum static files) :
  GET /assets/images/shells/{id}.jpg
  GET /assets/images/screens/{id}.jpg
  GET /assets/images/lenses/{id}.jpg

Images servies par le Frontend (Vite public/) :
  /images/shells/{id}.jpg     (via image_url dans la BDD)
  /models/*.glb               (modèles 3D)
```

> ⚠️ **Attention :** Les images sont actuellement servies depuis deux endroits différents. Les `image_url` en BDD pointent vers `/images/...` (Vite public), tandis que les fonctions helper (`getShellImageUrl()`) pointent vers le backend. Cela pourrait créer de la confusion.

---

## 3. CORS

Le backend est configuré avec CORS ouvert pour le développement :
```rust
CorsLayer::new()
    .allow_origin(Any)
    .allow_methods(Any)
    .allow_headers(Any)
```

> ⚠️ À restreindre en production : autoriser uniquement l'origine du frontend déployé.

---

## 4. Contrat de données

### Transformation snake_case → camelCase

| Backend (Rust) | Frontend (JS) | Transformation |
|---|---|---|
| `shell_variant_id` | `shellVariantId` | Axios ne transforme pas automatiquement |
| `screen_variant_id` | `screenVariantId` | Mappé manuellement dans le store |
| `total_price` | `total_price` | Conservé tel quel dans `quoteData` |
| `item_type` | `item_type` | Conservé tel quel |

### Gestion des erreurs

| Code HTTP | Signification | Gestion frontend |
|---|---|---|
| 200 | Succès | `store.quoteData = response.quote` |
| 400 | Erreur métier (incompatibilité, etc.) | `store.quoteError = response.error` |
| 5xx | Erreur serveur | Catch Axios → message générique |

---

## 5. Dépendances partagées

| Ressource | Localisation | Utilisée par |
|---|---|---|
| Catalogue produits | PostgreSQL → `Catalog` in memory | Backend (logic) |
| Images produit | `assets/images/` + `frontend/public/images/` | Frontend (affichage), Backend (serving) |
| Modèles 3D GLB | `frontend/public/models/` | Frontend (TresJS) |
| Données CSV | `data/` | Backend (tests uniquement) |
| Migrations SQL | `migrations/` | PostgreSQL (schéma + seed) |
