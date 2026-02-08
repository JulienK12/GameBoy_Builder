# 📜 PRD v6.0 : Game Boy Color Configurator

---

## 1. Contexte & Objectif

Développement d'un configurateur de Game Boy Color personnalisée (Rayboy).

**Objectifs :**
- **Pédagogique :** Maîtriser Rust (Backend) et l'intégration 3D Web (Frontend).
- **Fonctionnel :** Générer un devis en temps réel basé sur les choix utilisateur.
- **Production :** Interface 3D "Wow" avec back-office solide (PostgreSQL).

**✅ Backend TERMINÉ | ✅ Frontend TERMINÉ (V1.0 Launch)**

---

## 2. 🚀 GUIDE DE DÉMARRAGE

### 2.1 Pré-requis
- **Rust** (Dernière version stable)
- **Node.js** (v18+) & **npm**
- **PostgreSQL** (Service actif sur port 5432)

### 2.2 Démarrer le Projet
1.  **Backend** :
    ```powershell
    cargo run
    ```
2.  **Frontend** :
    ```powershell
    cd frontend
    npm run dev
    ```
    *Application : `http://localhost:5173` | API : `http://localhost:3000`*

---

## 3. Architecture Globale

```
┌─────────────────┐       HTTP REST       ┌─────────────────┐       ┌──────────────┐
│   FRONTEND      │◄─────────────────────►│   BACKEND       │◄─────►│  PostgreSQL  │
│   Vue.js 3      │   JSON (Axum)         │   Rust (Axum)   │       │   Database   │
│   + TresJS      │                       │   + SQLx        │       │              │
├─────────────────┤                       ├─────────────────┤       ├──────────────┤
│ • Affiche 3D    │                       │ • Calcule prix  │       │ • 74 Coques  │
│ • Retro-Premium │                       │ • Valide règles │       │ • 16 Écrans  │
│ • UI/UX Glass   │   /assets/images/     │ • Sert images   │       │ • 27 Vitres  │
│ • Filtres Avancés│◄─────────────────────►│   statiques     │       │ • 70 Règles  │
└─────────────────┘                       └─────────────────┘       └──────────────┘
```

---

## 4. Fonctionnalités Implémentées (V1.0)

### 🎨 Interface Utilisateur (Frontend)
- **Design System** : Style "Glassmorphism" retro-futuriste (TailwindCSS v4).
- **Navigation** : Sidebar latérale avec catégories (Coque, Écran, Boutons, Vitre).
- **Galerie Filtrable** :
    - Filtres par Marque (FunnyPlaying, Hispeedido, etc.).
    - Filtres par Type (Laminé, OEM, IPS Ready).
    - Info-bulles riches au survol (Détails, Prix).
- **Visualisation 3D** :
    - Rendu temps réel via **TresJS** (Three.js pour Vue).
    - Chargement de modèles GLB optimisés.
- **Devis Temps Réel** :
    - Calcul immédiat du prix total.
    - Gestion des conflits (Incompatibilité Coque/Écran).

### ⚙️ Backend & Data
- **API Robuste** : Rust (Axum) avec gestion d'erreurs typée.
- **Catalogue Dynamique** : Données chargées depuis PostgreSQL.
- **Compatibilité** : Moteur de règles vérifiant les combinaisons interdites (ex: Écran Laminé sur Coque OEM).

---

## 5. État d'Avancement

| Phase | Objectif | Status | Détails |
|:------|:---------|:-------|:--------|
| **Backend**| API & DB | ✅ Terminé | Axum, PostgreSQL, Logic de calcul 100% opérationnels. |
| **Frontend**| Structure | ✅ Terminé | Vite, Vue 3, Tailwind, TresJS. |
| **Frontend**| Composants | ✅ Terminé | Sélecteurs riches, Galerie, Tooltips, Modales. |
| **Frontend**| 3D | ✅ Terminé | Intégration GLB, mappage textures/couleurs. |
| **Integration**| API connect | ✅ Terminé | Catalogue dynamique synchronisé. |
| **Polish**| UX/UI | ✅ Terminé | Filtres, Animations, Responsive Design. |
| **QA**| Tests | ✅ Terminé | Tests Playwright (Audit UI) en place. |

---

## 6. Changelog

| Version | Date | Modifications |
|:--------|:-----|:--------------|
| v4.0 | 31 Jan 2026 | Backend PRODUCTION Ready (Axum + PostgreSQL). |
| v5.0 | 31 Jan 2026 | Init Phase E : Plan Frontend intégré. |
| v5.3 | 03 Fév 2026 | Restauration catalogue, debug CSS. |
| **v6.0** | **08 Fév 2026** | **Lancement V1.0 - UI Complète, Filtres, 3D, Tests Playwright.** |

---

**🦀 Rayboy PRD v6.0 — LAUNCH READY**