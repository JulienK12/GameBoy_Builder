# 🌳 Analyse de l'arbre source — GameBoy_Builder

> **Dernière mise à jour :** 2026-02-15 (Post-Epic 6)
> **Statut :** Complet (Multi-console, Auth, Deck, Buttons)

---

## Arbre annoté (Vue simplifiée)

```
gameboy_builder/
├── 🦀 src/                    # ── BACKEND RUST (Axum) ──
│   ├── main.rs                # 🚀 Orchestrateur : démarrage serveur & Arc<Catalog>
│   ├── api/                   # Couche Présentation (REST)
│   │   ├── auth.rs            #   Gestion JWT & Middleware authentification
│   │   ├── deck.rs            #   Endpoints CRUD pour le Deck Manager
│   │   ├── quote_submit.rs    #   Validation finale & soumission devis
│   │   └── handlers.rs        #   Handlers catalogue et calcul de devis
│   ├── logic/                 # Cœur Métier
│   │   ├── calculator.rs      #   💰 Moteur de prix (Kit-Centric, Packs, Expert)
│   │   ├── rules.rs           #   Règles de compatibilité complexes
│   │   └── auth.rs            #   Hashing Argon2 & logique tokens
│   ├── data/                  # Persistance
│   │   └── pg_loader.rs       #   Chargement SQLx -> Catalog (In-memory)
│   └── models/                # Domaine
│       ├── deck_config.rs     #   Structs pour le Deck Manager
│       └── product.rs         #   Modèles Shell, Screen, Lens, Button
│
├── 🎨 frontend/               # ── FRONTEND VUE.JS 3 ──
│   ├── src/
│   │   ├── App.vue            # Orchestrateur HUD (Portal/Atelier/Signature)
│   │   ├── stores/            # Gestion d'état Pinia
│   │   │   ├── configurator.js#   Config en cours, prix optimiste
│   │   │   ├── deck.js        #   Persistence (LocalStorage + Cloud)
│   │   │   └── auth.js        #   Session utilisateur
│   │   ├── components/        # Composants Immersifs
│   │   │   ├── 3D/            #   Scène TresJS & Model Mapper
│   │   │   ├── LandingPortal.vue# Entrée Starter Kits vs Atelier
│   │   │   ├── ExpertSidebar.vue# Mods techniques avancés
│   │   │   ├── ButtonGranularSelector.vue# Sélecteur granulaire (Epic 6)
│   │   │   └── SignatureShowcase.vue# Révélation finale plein écran
│   │   └── api/backend.js     # Client Axios universel
│   └── tests/                 # Playwright E2E (granular-buttons, persistence)
│
├── 🗄️ migrations/              # ── SQL MIGRATIONS (001 à 014) ──
│   ├── 009_auth_and_deck.sql  # Users & Configurations
│   ├── 010_quote_submissions.sql # Historique commandes
│   └── 013_refine_buttons...  # Seed boutons (GBC, DMG, GBA, SP)
```

---

## Répertoires Critiques & Rôles

| Répertoire | Rôle | Part |
|---|---|---|
| `src/logic/` | **SSOT** (Single Source of Truth) pour prix et compatibilité. | Backend |
| `src/api/` | Exposition des services REST et protection des routes (Auth). | Backend |
| `frontend/src/stores/` | Cerveau de l'interface : réactivité et persistance. | Frontend |
| `frontend/src/components/`| Vue utilisateur : design Airy Cyberpunk et 3D. | Frontend |
| `migrations/` | Définition structurée du catalogue et des données utilisateurs. | DB |
