# 📜 PRD v7.0 : Game Boy Evolution (Codename: Rayboy Next)

---

## 1. Contexte & Objectif

Évolution du configurateur Rayboy vers une expérience multi-console simplifiée et esthétiquement radicale.

**Objectifs de la V2.0 :**
- **Démystification** : Passer d'un sélecteur technique à des "Starter Kits" (Packs) émotionnels.
- **Persistance** : Introduction du système de "Deck" pour gérer plusieurs consoles simultanément.
- **Immersion** : Esthétique Cyberpunk haute-lisibilité avec micro-interactions "plaisir".

---

## 2. 🎯 Nouvelles Fonctionnalités (V2.0 Core)

### 📦 Le Système de "Packs" (Simplified Mode)
- **Concept** : Proposer 3 profils types pour un démarrage instantané.
    - **Budget Pack** : Coque OEM + Écran rétroéclairé classique (Priorité prix).
    - **Performance Pack** : Écran IPS v3 + Coque personnalisée + Batterie Li-Po (Priorité technique).
    - **Purist Pack** : Restauration fidèle, composants premium (Priorité authenticité).
- **UX** : Divulgation progressive.
- **Switch Mode** : Un **Toggle "Expert Mode"** est accessible à tout moment. Son activation affiche la galerie complète et les filtres avancés (V1.0 style) pour une personnalisation totale, sans perdre la configuration du pack sélectionné.

### 🃏 Le Système de "Deck" (Multi-Console)
- **Gestionnaire de Panier** : Visualisation sous forme de cartes (une carte = une console configurée).
- **Persistance** : Panier sauvegardé via `localStorage` (invité) et synchronisé PostgreSQL (login).

### ⚡ UI/UX "Cyberpunk-Accessible"
- **Palette** : Fond noir/bleu nuit profond, accents Néon (Orange, Violet, Émeraude).
- **Lisibilité** : Ratio de contraste WCAG AA impératif.
- **Fidélité 3D** : Utilisation de modèles compressés Draco pour une fluidité totale sur mobile.

---

## 3. Architecture Évoluée

- **Frontend** : Vue 3 + Pinia + TresJS + Vite.
- **Backend** : Rust (Axum) + SQLx (PostgreSQL).
- **Patterns** : 
    - **Single Source of Truth** : Le backend recalcule systématiquement les prix et valide les compatibilités.
    - **Optimistic Updates** : UI fluide avec rollback automatique en cas d'erreur API.
    - **Draco Compression** : 3D haute performance.

---

## 4. Roadmap d'Implémentation

### Sprint 1 : Fondations & Persistance
- Mise en place du schéma DB pour le mode "Deck".
- API de synchronisation du panier (Guest vs Auth).
- Refonte du moteur de prix côté Rust.

### Sprint 2 : Le "Deck" UI
- Création du layout "Card-based" pour le multi-console.
- Intégration de `pinia-plugin-persistedstate`.

### Sprint 3 : Starter Kits & UX
- Implémentation de la logique de "Packs".
- Refonte UI Cyberpunk (Contrasts & Glow).

### Sprint 4 : QA & Performance
- Tests de régression visuelle (Playwright).
- Optimisation CDN et compression Draco.

---

## 5. Changelog

| Version | Date | Modifications |
|:--------|:-----|:--------------|
| v6.0 | 08 Fév 2026 | Lancement V1.0 - UI Complète, Filtres, 3D. |
| **v7.0** | **11 Fév 2026** | **Evolution V2.0 : Packs, Deck System, Architecture Cyberpunk.** |

---

**🦀 Rayboy PRD v7.0 — NEXT GEN PLANNING**
