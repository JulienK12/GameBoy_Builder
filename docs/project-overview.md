# 🎮 GameBoy_Builder — Vue d'ensemble du projet

> **Dernière mise à jour :** 2026-02-10
> **Version :** v6.0 (V1.0 Launch Ready)

---

## Résumé exécutif

GameBoy_Builder (nom de marque : **Rayboy**) est un **configurateur web de consoles GameBoy modifiées** permettant aux utilisateurs de personnaliser leur console en choisissant parmi un catalogue de coques, écrans et vitres.

L'application génère un **devis en temps réel** basé sur les choix utilisateur, avec un **moteur de compatibilité** vérifiant les combinaisons de pièces, et propose une **prévisualisation 3D** des options sélectionnées.

---

## Stack technique résumée

| Couche | Technologie | Version | Justification |
|---|---|---|---|
| **Backend - Langage** | Rust | 2021 edition | Performance, sécurité mémoire |
| **Backend - Framework** | Axum | 0.7 | Framework HTTP async léger |
| **Backend - ORM** | SQLx | 0.8 | Requêtes SQL compilées, async |
| **Base de données** | PostgreSQL | — | Robustesse, types custom (enums) |
| **Frontend - Framework** | Vue.js 3 | 3.5 | Composition API, réactivité |
| **Frontend - State** | Pinia | 3.0 | Gestion d'état moderne pour Vue |
| **Frontend - 3D** | TresJS / Three.js | 5.3 / 0.182 | Rendu 3D dans Vue.js |
| **Frontend - CSS** | Tailwind CSS | v4 | Design system utilitaire |
| **Frontend - Build** | Vite | 7.2 | Build rapide, HMR |
| **Frontend - Tests** | Playwright | 1.58 | Tests E2E automatisés |
| **Frontend - HTTP** | Axios | 1.13 | Client HTTP pour l'API REST |

---

## Architecture type

- **Type de repository :** Multi-part (Monorepo)
- **Backend :** API REST (Rust/Axum) → project_type: `backend`
- **Frontend :** SPA Vue.js 3 → project_type: `web`
- **Communication :** HTTP REST (JSON) entre Frontend et Backend
- **Pattern architectural :** 3-Tier (Présentation → Logic métier → Persistance)

---

## Fonctionnalités principales (V1.0)

### 🎨 Interface utilisateur
- Design **Glassmorphism** retro-futuriste (cyber/neon)
- Galerie filtrable par marque, technologie, type de moulage
- Info-bulles riches au survol avec détails et prix
- Vue récap des sélections
- Responsive mobile

### ⚙️ Moteur de configuration
- Catalogue dynamique chargé depuis PostgreSQL (74 coques, 16 écrans, 27 vitres)
- 70 règles de compatibilité coque/écran
- Calcul de devis en temps réel
- Détection automatique des services requis (découpe, installation)

### 🎮 Visualisation 3D
- Rendu temps réel via TresJS (Three.js pour Vue)
- Chargement de modèles GLB
- Mappage des couleurs/textures en temps réel

---

## Périmètre futur

- **Multi-consoles :** GameBoy DMG, Pocket, Advance, Advance SP
- **Prix consoles de base :** Service à ajouter en BDD (DMG: 40€, Pocket: 35€, Color: 45€, Advance: 45€, SP: 65€)
- **Modèle 3D avancé :** Travail Blender sur le mappage des options
- **Mode simplifié :** Configurations pré-déterminées pour les non-experts
