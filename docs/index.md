# 📚 Index de la documentation — GameBoy_Builder

> **Projet :** GameBoy_Builder (Rayboy)
> **Statut :** v6.0 Ready — Epic 6 "L'Art du Détail" complétée
> **Date de consolidation :** 2026-02-15

---

## 📋 Documents Principaux

| Document | Description | Lien |
|---|---|---|
| **Vue d'ensemble** | Guide de haut niveau, stack technique et résumé des fonctionnalités. | [project-overview.md](project-overview.md) |
| **Architecture Backend** | Détails sur le moteur Rust/Axum, le calculateur Kit-Centric et SQLx. | [architecture-backend.md](architecture-backend.md) |
| **Architecture Frontend** | SPA Vue.js 3, stores Pinia et design system Airy Cyberpunk. | [architecture-frontend.md](architecture-frontend.md) |
| **Contrats d'API** | Spécifications des endpoints (Packs, Quote, Auth, Deck, Buttons). | [api-contracts.md](api-contracts.md) |
| **Modèle de Données** | Schéma PostgreSQL, relations et historique complet des migrations. | [data-models.md](data-models.md) |
| **Analyse de l'Arbre Source** | Structure du projet et rôles des différents répertoires. | [source-tree-analysis.md](source-tree-analysis.md) |
| **Guide de Développement** | Montage de l'environnement, commandes et conventions de code. | [development-guide.md](development-guide.md) |

---

## 🛠️ État du Projet (Fin de Sprint 6)

- **Modèles Supportés** : GBC, DMG, GBA, GBA SP.
- **Backend** : 14 migrations SQL, moteur de prix Kit-Centric, Auth JWT.
- **Frontend** : UX immersive "Airy Cyberpunk", store Pinia haute-performance.
- **Tests** : Couverture E2E Playwright sur les flux critiques (Buttons, Deck, Auth).

---

## 📝 Guides Pédagogiques
- [Guide Backend (Rust/Axum)](BACKEND_GUIDE.md)
- [Guide Frontend (Vue/TresJS)](FRONTEND_GUIDE.md)
- [Guide Database (PostgreSQL)](DATABASE_GUIDE.md)
- [Guide Rendu 3D](3D_GUIDE.md)

---

## 🏗️ Classification Technique

- **Repository** : Multi-part (Monorepo).
- **Backend Type** : `backend` (Rust).
- **Frontend Type** : `web` (Vue.js).
- **Pattern** : 3-Tier (Logic-driven calculated quotes).
