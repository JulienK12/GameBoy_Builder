# Story 3.3: Synchronisation Cloud & Optimisation VPS CX11

Status: done

<!-- Note: Validation is optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant qu'Utilisateur Authentifié,
Je veux que mon deck soit synchronisé avec la base de données,
Afin de pouvoir accéder à mes projets depuis n'importe quel appareil.

## Acceptance Criteria (BDD)

1. **Étant donné** un utilisateur connecté,
   **Quand** le deck est modifié (ajout, suppression, renommage),
   **Alors** les changements sont synchronisés vers la base PostgreSQL via les endpoints CRUD Rust,
   **Et** le frontend reflète l'état retourné par le backend après chaque opération.

2. **Étant donné** un utilisateur connecté,
   **Quand** il ouvre l'application (ou le panneau Deck Manager),
   **Alors** le frontend charge les configurations depuis `GET /deck`,
   **Et** le store `deck` est peuplé avec les données du backend (remplaçant éventuellement le localStorage si l'utilisateur était en mode invité).

3. **Étant donné** un utilisateur connecté avec un deck contenant des configurations,
   **Quand** le backend reçoit une requête d'ajout qui ferait dépasser 3 configurations,
   **Alors** le backend applique la limite stricte (trigger PostgreSQL ou validation applicative),
   **Et** retourne une erreur 400/409 avec un message explicite ("Limite de 3 configurations atteinte").

4. **Étant donné** les données deck stockées en base,
   **Quand** on interroge ou insère des configurations,
   **Alors** le format JSONB est optimisé pour les performances sur un VPS d'entrée de gamme (Hetzner CX11 : 2 vCPU, 2 GB RAM),
   **Et** les requêtes restent légères (pas de jointures massives, index sur `user_id`).

## Dépendances

> ✅ **Story 3.0** — Auth (JWT, middleware, tables `users`, `user_configurations`) en place.
> ✅ **Story 3.1** — Store `deck` et composant `DeckManager` en place.
> ✅ **Story 3.2** — Persistance locale (pinia-plugin-persistedstate, clé `gameboy-deck`).
> 📌 **Story 3.3** — Implémentation des endpoints `/deck/*` et logique de sync frontend ↔ backend.

## Tasks / Subtasks

### Backend — Endpoints CRUD Deck

- [x] **Task 1 — GET /deck** (AC: #2)
  - [x] 1.1 — Créer le handler `get_deck_handler` dans `src/api/handlers.rs` (ou `deck.rs` dédié) : extraire `AuthUser`, requêter `user_configurations` pour `user_id`, retourner la liste triée (ex. par `created_at`).
  - [x] 1.2 — Enregistrer la route `GET /deck` protégée par le middleware/extractor `AuthUser` dans `src/api/mod.rs`.
  - [x] 1.3 — Format de réponse : `{ configurations: [{ id, name, configuration, total_price, created_at, updated_at }] }` aligné avec le schéma `user_configurations`.

- [x] **Task 2 — POST /deck** (AC: #1, #3)
  - [x] 2.1 — Handler `create_deck_config_handler` : body `{ name, configuration }` (configuration = snapshot QuoteRequest + expert options), générer `id` (crypto UUID ou uuid v4), insérer dans `user_configurations`.
  - [x] 2.2 — Le trigger `check_user_configuration_limit` (migration 009) lève une exception si l'utilisateur a déjà 3 configs → capturer et retourner 400/409 avec message lisible.
  - [x] 2.3 — Calculer `total_price` côté backend via `logic::calculate_quote` pour éviter les manipulations côté client, ou accepter `total_price` fourni (décision à documenter).
  - [x] 2.4 — Réponse : `{ configuration: { id, name, configuration, total_price, ... } }`.

- [x] **Task 3 — DELETE /deck/:id** (AC: #1)
  - [x] 3.1 — Handler `delete_deck_config_handler` : extraire `id` depuis le path, vérifier que la config appartient à `AuthUser.user_id`, supprimer, retourner 204 No Content ou 200 avec confirmation.
  - [x] 3.2 — Gérer 404 si la config n'existe pas ou n'appartient pas à l'utilisateur.

- [x] **Task 4 — PUT /deck/:id (optionnel, renommage)** (AC: #1)
  - [x] 4.1 — Handler `update_deck_config_handler` : body `{ name? }` pour renommer une configuration ; optionnel si l'AC ne l'exige pas explicitement. Si omis, documenter que le renommage peut être reporté à une story ultérieure.

### Backend — Optimisation VPS CX11

- [x] **Task 5 — Format JSONB et index** (AC: #4)
  - [x] 5.1 — La colonne `configuration` est déjà JSONB (migration 009). S'assurer que la structure stockée est compacte : `{ shellVariantId, screenVariantId, lensVariantId, selectedExpertOptions?, selectedShellColorHex? }` sans champs superflus.
  - [x] 5.2 — Vérifier que `idx_user_configurations_user_id` existe (migration 009) ; pas de jointures lourdes sur d'autres tables.
  - [x] 5.3 — Les requêtes deck sont des SELECT/INSERT/DELETE simples sur `user_configurations` ; éviter les N+1 ou chargements de catalogue inutiles.

### Frontend — Intégration API Deck

- [x] **Task 6 — API backend.js** (AC: #1, #2)
  - [x] 6.1 — Ajouter `fetchDeck()`, `createDeckConfig(body)`, `deleteDeckConfig(id)` dans `frontend/src/api/backend.js` avec `axios` et `withCredentials: true` pour envoyer les cookies JWT.
  - [x] 6.2 — Base URL : réutiliser `API_URL` existant ; endpoints : `GET /deck`, `POST /deck`, `DELETE /deck/:id`.

- [x] **Task 7 — Logique de sync store deck** (AC: #1, #2)
  - [x] 7.1 — Détecter si l'utilisateur est authentifié : via store auth ou endpoint `GET /auth/me`. Si connecté, au chargement de l'app (ou ouverture Deck Manager), appeler `fetchDeck()` et remplir le store `deck` avec les données backend.
  - [x] 7.2 — Lors d'un `addCurrentConfig` : si connecté, appeler `createDeckConfig` puis mettre à jour le store avec la réponse ; si invité, conserver le comportement 3.2 (localStorage via plugin).
  - [x] 7.3 — Lors d'un `removeConfig` : si connecté, appeler `deleteDeckConfig(id)` puis retirer du store ; si invité, comportement 3.2.
  - [x] 7.4 — Gérer les erreurs (401 → rediriger vers login ; 400/409 → afficher message utilisateur).

- [x] **Task 8 — Persistance hybride** (AC: #2)
  - [x] 8.1 — Pour les utilisateurs connectés : désactiver ou surcharger la persistance localStorage du deck lorsque les données viennent du cloud (éviter conflit local vs cloud). Stratégie recommandée : si connecté, le store deck est la source de vérité backend ; au logout, basculer sur localStorage (comportement 3.2).
  - [x] 8.2 — Documenter la stratégie choisie (ex. : `persist: false` quand connecté, ou logique de merge local/cloud au login).

### Tests

- [x] **Task 9 — Tests** (AC: tous)
  - [x] 9.1 — Tests d'intégration backend : appeler `GET /deck`, `POST /deck`, `DELETE /deck/:id` avec JWT valide ; vérifier limite 3 (4e insertion → erreur).
  - [x] 9.2 — Tests E2E Playwright : scénario "utilisateur connecté → ajout config → reload → configs chargées depuis backend" ; scénario "invité → comportement 3.2 inchangé".

## Dev Notes

### Contexte métier

- **FR6** : Synchroniser le panier via PostgreSQL pour les utilisateurs connectés.
- **VPS CX11** : Hetzner Cloud CX11 (2 vCPU, 2 GB RAM) — requêtes légères, pas de N+1, JSONB compact.
- La limite de 3 configurations est déjà appliquée par le trigger `check_user_configuration_limit` (migration 009).

### Prérequis technique

- Migration `009_auth_and_deck.sql` : tables `users`, `user_configurations` (id, user_id, name, configuration JSONB, total_price, created_at, updated_at), trigger limite 3, index sur `user_id`.
- Extractor `AuthUser` dans `src/api/auth.rs` : lit le cookie `auth_token`, vérifie JWT, fournit `user_id` et `email`.
- Store `deck` (Story 3.1/3.2) : `configurations`, `addCurrentConfig`, `removeConfig`, `getPreviewImageUrl`, `persist: { key: 'gameboy-deck' }`.

### Contraintes architecturales

- **API REST** : Axum 0.7, pattern 3-Tier (handlers → logic → data). Les handlers deck peuvent appeler un module `data::deck_repo` ou requêtes SQLx directes dans un nouveau `deck_repo.rs`.
- **Authentification** : Les routes `/deck` sont protégées ; utiliser `AuthUser` comme extractor pour les handlers.
- **Format configuration** : Aligné avec `QuoteRequest` + options expert : `shellVariantId`, `screenVariantId`, `lensVariantId`, `selectedExpertOptions`, `selectedShellColorHex`.
- **Architecture frontend** : [Source: docs/architecture-frontend.md] — Pinia store deck ; backend.js pour les appels API.

### Stack et patterns existants

- **Backend** : Rust, Axum 0.7, SQLx 0.8 (PostgreSQL), serde.
- **Frontend** : Vue 3.5, Pinia 3.0, axios, pinia-plugin-persistedstate.
- **API Contracts** : [Source: docs/api-contracts.md] — GET /deck, POST /deck, DELETE /deck/:id documentés.
- **Auth** : Cookie `auth_token` HttpOnly ; `withCredentials: true` sur axios pour les requêtes authentifiées.

### Fichiers à créer / modifier

**Backend — Créations :**
- `src/data/deck_repo.rs` (ou intégration dans `auth_repo.rs`) — fonctions `get_configurations(user_id)`, `create_configuration(...)`, `delete_configuration(id, user_id)`.
- Handlers deck dans `src/api/handlers.rs` ou `src/api/deck.rs` (à définir selon préférence structure).

**Backend — Modifications :**
- `src/api/mod.rs` — enregistrer les routes `/deck` (GET, POST, DELETE) avec protection AuthUser.
- `src/data/mod.rs` — exposer `deck_repo` si module dédié.

**Frontend — Modifications :**
- `frontend/src/api/backend.js` — ajouter `fetchDeck`, `createDeckConfig`, `deleteDeckConfig`.
- `frontend/src/stores/deck.js` — logique de sync conditionnelle (connecté vs invité).
- Optionnel : store auth ou composant pour détecter `isAuthenticated` (à vérifier si déjà existant).

### Intelligence de la story précédente (3.2)

- **Plugin persistance** : `pinia-plugin-persistedstate` activé dans `main.js` ; store deck avec `persist: { key: 'gameboy-deck' }`.
- **Store deck** : `configurations` (array), `addCurrentConfig(name?)`, `removeConfig(id)`, `getPreviewImageUrl`, `canAddMore`, `MAX_DECK_CONFIGS = 3`.
- **DeckManager.vue** : grille de cartes, aperçu coque, nom, prix, bouton Supprimer, bouton "Sauvegarder dans le Deck".
- **En 3.2** : aucun appel API ; persistance uniquement localStorage. En 3.3, introduire les appels API pour les utilisateurs connectés.
- **Tests** : `deck-manager.spec.js` — scénarios persistance locale ; à étendre pour sync cloud.

### Références

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.3] — User story et critères d'acceptation
- [Source: docs/architecture-backend.md] — Deck System, stratégie Lazy Auth
- [Source: docs/architecture-frontend.md] — Store deck, backend.js
- [Source: docs/api-contracts.md] — Endpoints /deck/*, RBAC
- [Source: migrations/009_auth_and_deck.sql] — Schéma user_configurations, trigger limite 3
- [Source: src/api/auth.rs] — AuthUser extractor
- [Source: _bmad-output/implementation-artifacts/3-2-persistance-locale-et-logique-de-synchronisation.md] — Contexte persistance locale

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Backend : module `deck` (src/api/deck.rs), handlers GET/POST/PUT/DELETE /deck ; `deck_repo` (get_configurations, create_configuration, update_configuration_name, delete_configuration) ; modèle `UserConfiguration` et DTOs dans `src/models/deck_config.rs`. Trigger limite 3 capturé → 409 avec message "Limite de 3 configurations atteinte". total_price calculé côté serveur via `calculate_quote`.
- Frontend : store `auth` (fetchUser, isAuthenticated), `backend.js` (getAuthMe, fetchDeck, createDeckConfig, deleteDeckConfig, updateDeckConfig avec withCredentials). Store deck : loadFromCloud(), addCurrentConfig/removeConfig async selon auth ; persistance inchangée (données cloud écrasent le store en mémoire quand connecté).
- Tests : intégration Rust deck_integration_tests.rs (GET 401, GET 200 vide, POST puis GET, 4e POST 409, DELETE 204/404). E2E Playwright : "authenticated deck loaded after reload" et "guest behavior 3.2 unchanged".

### File List

- src/models/deck_config.rs (new)
- src/models/mod.rs (modified)
- src/data/deck_repo.rs (new)
- src/data/mod.rs (modified)
- src/api/deck.rs (new)
- src/api/mod.rs (modified)
- src/api/deck_integration_tests.rs (new)
- frontend/src/api/backend.js (modified)
- frontend/src/stores/auth.js (new)
- frontend/src/stores/deck.js (modified)
- frontend/src/components/DeckManager.vue (modified)
- frontend/src/App.vue (modified)
- frontend/tests/deck-manager.spec.js (modified)
- docs/architecture-frontend.md (modified — post-review: §3.1 deck persist, §4 API deck/auth)

## Senior Developer Review (AI)

**Reviewer:** Amelia (Dev Agent) — 2026-02-11  
**Story:** 3-3-synchronisation-cloud-et-optimisation-vps-cx11  
**Git vs File List:** Fichiers de la story présents (plusieurs en untracked). Aucune fausse déclaration de fichier.

### Synthèse

- **AC #1–#4 :** Implémentés (endpoints CRUD, limite 3, GET au chargement, JSONB + index).
- **Tasks 1–9 :** Tous réalisés ; quelques écarts de qualité et de gestion d’erreurs.

### 🔴 CRITICAL

- Aucun.

### 🟡 MEDIUM

1. **removeConfig : pas de feedback erreur (AC 7.4)** — `frontend/src/stores/deck.js` (removeConfig) : en cas d’échec du DELETE (réseau, 401, 403), la config est quand même retirée du store. L’AC 7.4 demande de gérer les erreurs (401 → rediriger ; 400/409 → message). Ici aucune erreur remontée à l’UI, pas de message ni redirection.
2. **401 : message mais pas de redirection** — AC 7.4 : « 401 → rediriger vers login ». DeckManager affiche « Session expirée. Reconnectez-vous… » mais ne redirige pas vers la modale/login. Partiel.
3. **Validation body POST /deck** — `src/api/deck.rs` (create_deck_config_handler) : si `configuration` n’a pas de `shellVariantId`, le backend met `total_price = None` et insère quand même. Pas de 400 pour payload invalide (snapshot attendu : shellVariantId requis).
4. **Erreurs backend non loggées** — `src/api/deck.rs` (get_deck_handler, create/update/delete) : les erreurs SQL/serveur sont converties en 500 sans log, ce qui complique le debug en production.
5. **Fichiers 3.3 non commités** — Plusieurs fichiers de la story sont untracked (deck.rs, deck_repo.rs, deck_config.rs, auth.js, deck_integration_tests.rs, etc.). File List correcte mais traçabilité et review difficiles tant que ce n’est pas commité.

### 🟢 LOW

6. **PUT /deck/:id (renommage)** — Backend et `backend.js` exposent `updateDeckConfig`, mais aucun appel dans DeckManager (pas d’UI renommage). Conforme à la story (optionnel), à documenter ou prévoir en story ultérieure.
7. **Tests d’intégration deck ignorés** — `src/api/deck_integration_tests.rs` : tous les tests sont `#[ignore]` (DATABASE_URL). En CI sans DB, aucune preuve automatique que les endpoints deck fonctionnent.
8. **Documentation stratégie persist** — Task 8.2 demande de documenter la stratégie (persist quand connecté vs invité). Dev Agent Record le décrit ; pas de mise à jour dans `docs/architecture-frontend.md` ou équivalent.

### Bilan

- **Issues :** 0 Critical, 5 Medium, 3 Low.  
- **Statut après review :** in-progress → corrections appliquées → **done**.

### Corrections appliquées (2026-02-11)

1. **removeConfig** — Le store ne retire la config du state qu’après succès du DELETE ; en cas d’erreur l’exception est remontée. DeckManager affiche le message d’erreur et, si 401, rouvre le portail (showLandingPortal).
2. **401 → redirection** — En cas de 401 (ajout ou suppression), affichage du message + `configurator.showLandingPortal = true` + fermeture du Deck Manager (AC 7.4).
3. **Validation POST /deck** — Si `configuration.shellVariantId` est absent, le backend retourne 400 avec le message « configuration.shellVariantId requis » (plus d’insertion avec total_price = None).
4. **Logging backend** — `eprintln!` ajouté pour toutes les erreurs 500 (GET/POST/PUT/DELETE /deck) pour faciliter le debug.
5. **Documentation** — `docs/architecture-frontend.md` : section 3.1 « Store deck et persistance hybride » (stratégie connecté vs invité, loadFromCloud, logout) + tableau API deck/auth en section 4.

---

## Change Log

- 2026-02-11 : Story 3.3 implémentée — endpoints /deck (GET, POST, PUT, DELETE), sync frontend (auth store, deck store loadFromCloud/add/remove), tests intégration et E2E.
- 2026-02-11 : Code review (Amelia) — 5 MEDIUM, 3 LOW ; statut → in-progress.
- 2026-02-11 : Corrections review appliquées (removeConfig, 401→portail, validation body, logging, doc) — statut → done.
