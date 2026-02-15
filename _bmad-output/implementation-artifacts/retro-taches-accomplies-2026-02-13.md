# Rétrospective Consolidée — Tâches Accomplies (Backlog → Done)

**Date :** 2026-02-13  
**Facilitateur :** Bob (Scrum Master)  
**Participant :** Julien  
**Périmètre :** Synthèse de l’ensemble du travail accompli sur le projet GameBoy Builder (5 epics, 12 stories)

---

## 1. Vue d’ensemble

Toutes les tâches planifiées dans le sprint-status ont été **accomplies**.  
Le backlog actuel (`backlog.md`) contient **aucune idée en attente** — les items « Mettre en avant les options » (Epic 5) et « Bouton retour » ont été réalisés.

Le **bouton retour** et la **mise en avant des options** (Epic 5.1) ont été accomplis (implémentés + code review + correctifs appliqués).  

La présente rétrospective porte sur **tout ce qui est DONE**.

---

## 2. Inventaire des tâches accomplies

### Epic 1 — L’Atelier de Base (FR1, FR7, FR9) ✅

| Story | Description | Statut |
|-------|-------------|--------|
| 1.1 | Système de portail dynamique (packs, LandingPortal, catalog API) | done |
| 1.2 | Logique de bundle backend & tarification (resolve_pack, overrides) | done |
| 1.3 | Mise en page HUD Airy & récapitulatif de sélection | done |

**Rétro Epic 1 :** epic-1-retro-2026-02-13.md

---

### Epic 2 — Le Mode Expert (FR2, FR3, FR8) ✅

| Story | Description | Statut |
|-------|-------------|--------|
| 2.1 | Le toggle mode expert (état et UI) | done |
| 2.2 | La sidebar technique HUD | done |
| 2.3 | Logique optimiste et feedback technique | done |

**Rétro Epic 2 :** epic-2-retro-2026-02-11.md

---

### Epic 3 — Le Gestionnaire de Deck (FR4, FR5, FR6) ✅

| Story | Description | Statut |
|-------|-------------|--------|
| 3.0 | Authentification simple (email/password, JWT, Argon2) | done |
| 3.1 | UI du deck multi-cartes (DeckManager, limite 3) | done |
| 3.2 | Persistance locale & logique de synchronisation | done |
| 3.3 | Synchronisation cloud & optimisation VPS CX11 | done |

**Rétro Epic 3 :** epic-3-retro-2026-02-13.md

---

### Epic 4 — L’Expérience Signature (FR10) ✅

| Story | Description | Statut |
|-------|-------------|--------|
| 4.1 | Le moment signature (focus reveal, SignatureShowcase, RB-XXXX) | done |
| 4.2 | Validation et transition panier (auth, POST /quote/submit, AuthModal) | done |

**Rétro Epic 4 :** epic-4-retro-2026-02-13.md

---

### Epic 5 — Focus Options (sans 3D) ✅

| Story | Description | Statut |
|-------|-------------|--------|
| 5.1 | Mise en avant des options sur atelier et récap (RECAP_VIEW par défaut, badge APERÇU_3D, hiérarchie visuelle) | done |

**Rétro Epic 5 :** epic-5-retro-2026-02-13.md

---

### Tâche hors sprint (backlog) ✅

| Tâche | Description | Statut | Référence |
|-------|-------------|--------|-----------|
| Bouton retour | Retour au portail (expert/starter pack) depuis l’atelier ; réinitialisation du pack | done | code-review-bouton-retour.md, bouton-retour.spec.js |

---

## 3. Synthèse globale — Ce qui a bien fonctionné

| Thème | Détail |
|-------|--------|
| **Ordre des stories** | Enchaînement logique : portail → tarification → HUD → Expert → Auth → Deck → Signature → Focus Options ; peu de rework. |
| **Architecture** | Backend Rust 3-tier (api → logic → data), frontend Vue 3 + Pinia ; séparation claire. |
| **Qualité** | Code review systématique, tests unitaires (Rust) + E2E (Playwright) ; zéro correctif pendant la QA. |
| **Dev Notes** | Stories avec contraintes architecturales et Dev Notes détaillées ; faciles à suivre par le Dev. |
| **Rapports QA** | Quinn produit des rapports par story ou par epic ; couverture AC et FR documentée. |

---

## 4. Défis récurrents et axes d’amélioration

| Défi | Impact | Recommandation |
|------|--------|----------------|
| **Tests backend en CI** | Les tests d’intégration (auth, deck, quote_submit) nécessitent PostgreSQL ; actuellement `#[ignore]`. | Documenter `DATABASE_URL_TEST` + `cargo test -- --ignored` ; intégrer en CI si possible. |
| **E2E sans backend** | Certains specs (landing-portal) échouent sans backend. | Mocker les appels API ou documenter la procédure (Terminal 1: cargo run, Terminal 2: playwright). |
| **Mobile Chrome** | Un test deck (limite 3 configs) peut être fragile. | À investiguer si la cible mobile est prioritaire. |
| **Action items ouverts** | Tooltip warning, data-testid/ARIA, documentation README partielle. | Poursuivre en parallèle des prochaines features. |

---

## 5. Backlog restant (à prioriser)

Tous les items du backlog recensés dans `backlog.md` ont été accomplis :

- **Mettre en avant les options plutôt que le 3D** — ✅ Réalisé (Epic 5.1, focus-options.spec.js)
- **Bouton retour** — ✅ Réalisé (code-review-bouton-retour.md, bouton-retour.spec.js)

Pour transformer une nouvelle idée en story prête pour le dev : utiliser **[CS] Context Story** et s'appuyer sur la formulation dans le backlog.

---

## 6. Action items consolidés (toutes rétros confondues)

| # | Action | Priorité |
|---|--------|----------|
| 1 | Documenter en README la procédure complète : E2E (backend requis) + tests d’intégration backend (`cargo test -- --ignored`) | Haute |
| 2 | Intégrer en CI : Playwright (signature-showcase, deck-manager, focus-options) et tests backend avec `DATABASE_URL_TEST` | Moyenne |
| 3 | Poursuivre : Tooltip warning, data-testid/ARIA sur composants clés | Basse |
| 4 | Conserver Dev Notes + contraintes architecturales dans les prochaines stories | Continu |

---

## 7. Clôture

**Bilan :** 5 epics, 12 stories + tâche bouton retour (backlog), toutes livrées et couvertes par les tests. Le périmètre planifié est **complété**.  
**Prochaine étape :** Traiter les action items de consolidation (README, CI) ou définir les prochaines features dans le backlog.

---

*Généré par : Bob (Scrum Master) — Rétrospective consolidée des tâches accomplies*  
*Document : retro-taches-accomplies-2026-02-13.md*
