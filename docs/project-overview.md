# 🎮 GameBoy_Builder — Vue d'ensemble du projet

> **Dernière mise à jour :** 2026-02-15
> **Version :** v6.0 (Launch Ready - Epic 6 Complete)

---

## Résumé exécutif

GameBoy_Builder (nom de marque : **Rayboy**) est un **configurateur web "Airy Cyberpunk" de consoles GameBoy modifiées**. Il s'adresse tant aux néophytes (via des packs de démarrage) qu'aux passionnés (via un Mode Expert granulaire).

L'application permet une personnalisation totale : coque, écran, vitre, mods techniques et même chaque bouton individuellement, avec un moteur de prix intelligent et une validation en temps réel.

---

## Stack technique résumée

| Couche | Technologie | Version | Justification |
|---|---|---|---|
| **Backend - Langage** | Rust | 2021 edition | Performance, sécurité mémoire |
| **Backend - Framework** | Axum | 0.7 | Framework HTTP async robuste |
| **Backend - Persistance** | SQLx / PostgreSQL | 0.8 / 16 | Requêtes typées, migrations SQL |
| **Frontend - Framework** | Vue.js 3 | 3.5 | Composition API, réactivité |
| **Frontend - State** | Pinia | 3.0 | Store centralisé (configurator, deck, auth) |
| **Frontend - 3D** | TresJS / Three.js | 5.3 / 0.182 | Rendu 3D intégré à Vue |
| **Frontend - Styles** | Tailwind CSS | v4 | Design "Airy Cyberpunk" utilitaire |
| **Frontend - Build** | Vite | 7.2 | Rapidité de développement (HMR) |

---

## Architecture du système

- **Type :** Monorepo Multi-part.
- **Backend (Axum) :** Source unique de vérité (SSOT) pour les prix, les règles de compatibilité et l'auth.
- **Frontend (SPA) :** Interface immersive avec mises à jour optimistes et feedback visuel "Neon".
- **Persistance hybride :** `localStorage` pour les invités (Deck) et PostgreSQL pour les utilisateurs connectés.
- **Sécurité :** JWT via cookies HttpOnly/Secure, hashage Argon2.

---

## Fonctionnalités Clés (Finalisées)

### 🚀 Parcours Utilisateur
- **Landing Portal HUD** : Choix immédiat entre "Starter Kits" et "Atelier Libre".
- **Starter Kits (Epic 1)** : Packs thématiques (Budget, Performance, Purist) pilotés par les données.
- **Signature Showcase (Epic 4)** : Révélation spectaculaire de la console finale en plein écran.

### 🛠️ Personnalisation Avancée
- **Expert Mode (Epic 2)** : Sidebar technique pour les mods avancés (CPU, Audio, Power).
- **L'Art du Détail (Epic 6)** : Sélecteur granulaire de boutons (D-pad, A, B, etc.) pour GBC, DMG, GBA et GBA SP.
- **Prix Kit-Centric** : Logique de prix intelligente (+5€ par kit de couleur unique pour les boutons).

### 💾 Gestion & Persistance
- **Deck Manager (Epic 3)** : Visualisation de multiples configurations sous forme de cartes.
- **Multi-Console** : Support complet du catalogue pour GBC, DMG, GBA, GBA SP.
- **Cloud Sync** : Authentification et synchronisation du deck entre navigateurs.

---

## Guide de Navigation de la Documentation

- [🔍 Master Index](./index.md) : Portail central de la documentation.
- [🏗️ Architecture Backend](./architecture-backend.md) : Détails du moteur Rust et du calculateur.
- [🎨 Architecture Frontend](./architecture-frontend.md) : Structure des composants "Airy" et des stores Pinia.
- [🔗 API Contracts](./api-contracts.md) : Spécifications exactes des endpoints REST.
- [📊 Modèles de Données](./data-models.md) : Schéma PostgreSQL et migrations.
- [🚀 Guide de Développement](./development-guide.md) : Installation et commandes utiles.
