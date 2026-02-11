# 📚 Index de la documentation — GameBoy_Builder

> **Projet :** GameBoy_Builder (Rayboy)
> **Généré par :** document-project workflow (scan exhaustif)
> **Date :** 2026-02-10

---

## 📋 Documents générés par le scan

| # | Document | Description | Lien |
|---|---|---|---|
| 1 | **Vue d'ensemble** | Résumé exécutif, stack, features, périmètre futur | [project-overview.md](project-overview.md) |
| 2 | **Architecture Backend** | Modules Rust, pattern 3-tier, flux de données, dépendances | [architecture-backend.md](architecture-backend.md) |
| 3 | **Architecture Frontend** | Composants Vue.js, store Pinia, design system, tests | [architecture-frontend.md](architecture-frontend.md) |
| 4 | **Contrats d'API** | Tous les endpoints REST avec requêtes/réponses JSON | [api-contracts.md](api-contracts.md) |
| 5 | **Modèles de données** | Schéma PostgreSQL, tables, ENUMs, relations, migrations | [data-models.md](data-models.md) |
| 6 | **Arbre source** | Arbre annoté de tous les fichiers avec rôles | [source-tree-analysis.md](source-tree-analysis.md) |
| 7 | **Architecture d'intégration** | Communication Backend ↔ Frontend, CORS, contrat de données | [integration-architecture.md](integration-architecture.md) |
| 8 | **Guide de développement** | Installation, commandes, conventions, raccourcis | [development-guide.md](development-guide.md) |

---

## 📝 Documents existants (pré-scan)

| Document | Description | Lien |
|---|---|---|
| **PRD** | Product Requirements Document v6.0 | [PRD.md](../PRD.md) |
| **README** | Présentation du projet et instructions | [README.md](../README.md) |
| **Guide Backend** | Audit architecture & guide pédagogique Rust | [BACKEND_GUIDE.md](BACKEND_GUIDE.md) |
| **Guide Frontend** | Guide pédagogique Vue.js & 3D | [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) |
| **Guide Database** | Guide pédagogique PostgreSQL & SQLx | [DATABASE_GUIDE.md](DATABASE_GUIDE.md) |
| **Guide 3D** | Guide intégration TresJS/Three.js | [3D_GUIDE.md](3D_GUIDE.md) |

---

## 🏗️ Classification du projet

| Attribut | Valeur |
|---|---|
| **Type de repository** | Multi-part (Monorepo) |
| **Part 1** | `backend` (Rust/Axum, PostgreSQL) |
| **Part 2** | `web` (Vue.js 3, TresJS, Tailwind) |
| **Communication** | REST API (JSON via HTTP) |
| **Pattern** | 3-Tier Architecture |

---

## 🔍 Résumé du scan

- **Total fichiers sources backend (Rust) :** ~17 fichiers
- **Total fichiers sources frontend (Vue/JS) :** ~25+ fichiers
- **Total lignes backend (hors tests) :** ~650 LOC
- **Total tests backend :** 7 tests unitaires
- **Total tests frontend (Playwright) :** 7+ fichiers de test
- **Tables PostgreSQL :** 7 tables, 5 types ENUM
- **Endpoints API :** 5 routes (1 health, 3 catalog, 1 quote)
