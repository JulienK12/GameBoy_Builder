# 🌳 Analyse de l'arbre source — GameBoy_Builder

> **Scan :** Exhaustif
> **Date :** 2026-02-10

---

## Arbre annoté

```
gameboy_builder/
├── 📄 Cargo.toml              # Manifeste Rust : dépendances backend
├── 📄 Cargo.lock              # Versions exactes des dépendances
├── 📄 PRD.md                  # Product Requirements Document v6.0
├── 📄 README.md               # Documentation principale du projet
├── 📄 .env.template           # Template pour DATABASE_URL
├── 📄 .gitignore
│
├── 🦀 src/                    # ── BACKEND RUST ──
│   ├── main.rs                # 🚀 Point d'entrée : démarrage serveur Axum
│   ├── api/                   # Couche API (Présentation)
│   │   ├── mod.rs             #   Routeur : 5 routes (health, quote, catalog×3)
│   │   └── handlers.rs        #   Handlers HTTP (QuoteRequest, QuoteResponse)
│   ├── logic/                 # Couche métier
│   │   ├── mod.rs             #   Expose calculate_quote
│   │   └── calculator.rs      #   💰 Moteur de devis (370 LOC, 7 tests)
│   ├── data/                  # Couche données
│   │   ├── mod.rs             #   Expose Catalog, create_pool, load_catalog_from_db
│   │   ├── database.rs        #   Pool PostgreSQL (5 connexions max)
│   │   ├── pg_loader.rs       #   Chargement catalogue depuis PostgreSQL
│   │   ├── loader.rs          #   Chargement catalogue depuis CSV (tests)
│   │   ├── catalog.rs         #   Méthodes de recherche sur Catalog
│   │   ├── parser.rs          #   Parsing String → Enum
│   │   └── records.rs         #   Structs de désérialisation CSV
│   └── models/                # Domaine
│       ├── mod.rs             #   Ré-exports
│       ├── enums.rs           #   MoldType, ScreenSize, Brand, etc.
│       ├── product.rs         #   Shell, Screen, Lens + variantes
│       ├── quote.rs           #   LineItem, Quote
│       └── constants.rs       #   SCR_OEM_ID, prix services
│
├── 🎨 frontend/               # ── FRONTEND VUE.JS ──
│   ├── package.json           # Dépendances : Vue 3, Pinia, TresJS, Tailwind
│   ├── index.html             # Point d'entrée HTML
│   ├── vite.config.js         # Configuration Vite
│   ├── tailwind.config.js     # Configuration Tailwind CSS v4
│   ├── tsconfig.json          # Configuration TypeScript
│   ├── playwright.config.js   # Configuration tests E2E
│   ├── src/
│   │   ├── main.js            # 🚀 Crée l'app Vue + Pinia
│   │   ├── App.vue            # Layout principal (310 LOC)
│   │   ├── style.css          # 🎨 Design system complet (~10K)
│   │   ├── constants.js       # Catégories (shell, screen, lens, buttons)
│   │   ├── api/
│   │   │   └── backend.js     # 🔌 Client Axios → API REST
│   │   ├── stores/
│   │   │   └── configurator.js # 🧠 Store Pinia (360 LOC, état centralisé)
│   │   ├── components/
│   │   │   ├── 3D/
│   │   │   │   ├── ThreeDPreview.vue    # Rendu 3D principal
│   │   │   │   ├── SceneNode.vue        # Nœud de scène mesh
│   │   │   │   └── ModelMapper.vue      # Outil dev mappage 3D
│   │   │   ├── Gallery/
│   │   │   │   ├── GalleryHeader.vue    # En-tête galerie
│   │   │   │   ├── GalleryFilters.vue   # Filtres (marque, techno)
│   │   │   │   ├── VariantCard.vue      # Carte variante
│   │   │   │   └── VariantDetailsDialog.vue # Modale détails
│   │   │   ├── VariantGallery.vue       # Galerie filtrable complète
│   │   │   ├── SelectionRecap.vue       # Vue récap des sélections
│   │   │   ├── QuoteDisplay.vue         # Affichage devis (sidebar)
│   │   │   ├── DebugOverlay.vue         # Overlay debug
│   │   │   └── ui/                      # Composants Radix Vue
│   │   │       ├── button/
│   │   │       ├── card/
│   │   │       ├── dialog/
│   │   │       └── tooltip/
│   │   ├── lib/
│   │   │   └── utils.js                 # Utilitaires (cn, clsx)
│   │   └── assets/
│   │       └── icons/                   # Icônes de catégories
│   ├── public/
│   │   ├── models/                      # Modèles 3D GLB
│   │   └── images/                      # Images produit (frontend)
│   └── tests/                           # Tests Playwright
│
├── 🗄️ migrations/              # ── SQL MIGRATIONS ──
│   ├── 001_initial_schema.sql  # Création types ENUM + tables
│   ├── 002_seed_data.sql       # Données de seed (catalogue complet)
│   └── 003_harmonize_schema.sql # Ajout colonnes sync Phase 4
│
├── 📊 data/                    # ── FICHIERS CSV SOURCE ──
│   ├── Shell_List.csv          # Liste des coques
│   ├── Shell_Variants.csv      # Variantes de coques (74 entrées)
│   ├── Screen_List.csv         # Liste des écrans
│   ├── Screen_Variants.csv     # Variantes d'écrans
│   ├── Lens_List.csv           # Liste des vitres
│   ├── Lens_Variants.csv       # Variantes de vitres
│   ├── Shell_Screen_Matrix.csv # Matrice de compatibilité
│   └── Component_List.xlsx     # Référentiel composants (Excel)
│
├── 🖼️ assets/images/           # Images servies par le backend (Axum static)
│
├── 📝 docs/                    # Documentation technique
│   ├── BACKEND_GUIDE.md        # Audit & guide backend
│   ├── FRONTEND_GUIDE.md       # Guide frontend
│   ├── DATABASE_GUIDE.md       # Guide base de données
│   └── 3D_GUIDE.md             # Guide intégration 3D
│
├── 📜 scripts/                 # Scripts utilitaires
│
└── 📦 examples/                # Exemples
```

---

## Répertoires critiques

| Répertoire | Rôle | Part |
|---|---|---|
| `src/logic/` | **Cœur métier** : calcul de devis, règles de compatibilité | Backend |
| `src/api/` | Interface HTTP, routage des requêtes | Backend |
| `src/data/` | Accès base de données, chargement catalogue | Backend |
| `src/models/` | Types de domaine partagés | Backend |
| `frontend/src/stores/` | État applicatif centralisé (Pinia) | Frontend |
| `frontend/src/components/` | Composants UI et 3D | Frontend |
| `frontend/src/api/` | Client HTTP vers le backend | Frontend |
| `migrations/` | Schéma et données SQL | Shared |
| `data/` | Fichiers CSV source pour le catalogue | Shared |
