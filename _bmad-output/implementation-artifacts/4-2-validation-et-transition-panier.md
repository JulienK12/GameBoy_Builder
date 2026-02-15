# Story 4.2: Validation & Transition Panier

Status: done

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant qu'Utilisateur,
Je veux confirmer ma création pour la préparation de l'assemblage,
Afin de passer à l'étape finale de la commande.

## Acceptance Criteria (BDD)

1. **Étant donné** que le Signature Showcase est actif (Story 4.1)
   **Quand** l'utilisateur clique sur "Confirmer la Création"
   **Alors** le système vérifie si l'utilisateur est authentifié (store auth `isAuthenticated` ou `GET /auth/me`)

2. **Étant donné** que l'utilisateur n'est pas authentifié
   **Quand** il clique sur "Confirmer la Création"
   **Alors** une modale d'authentification (Login / Register) s'affiche
   **Et** après connexion ou inscription réussie, le flux reprend (vérification auth puis envoi)

3. **Étant donné** que l'utilisateur est authentifié
   **Quand** il confirme la création
   **Alors** le statut de la configuration passe à "Ready for Build"
   **Et** une demande de devis officielle est créée via `POST /quote/submit` (backend)
   **Et** l'utilisateur est redirigé vers le récapitulatif final du panier

4. **Étant donné** un échec réseau ou une erreur 4xx/5xx sur `POST /quote/submit`
   **Alors** un feedback utilisateur clair est affiché (message d'erreur, pas de redirection)
   **Et** l'utilisateur peut réessayer ou revenir en arrière

## Dépendances

- **Story 4.1** — SignatureShowcase.vue existe ; le bouton "Confirmer la Création" appelle actuellement `onConfirmPlaceholder()`. À remplacer par la logique 4.2.
- **Epic 3** — Auth (store auth, GET /auth/me, POST /auth/login, POST /auth/register), Deck (POST /deck pour synchro optionnelle).
- **Backend** — `POST /quote/submit` est documenté dans api-contracts.md mais **n'est pas encore implémenté** ; à créer dans cette story.

## Tasks / Subtasks

### Backend — Endpoint POST /quote/submit

- [x] **Task 1 — Créer POST /quote/submit** (AC: #3)
  - [x] 1.1 — Ajouter route protégée `POST /quote/submit` dans `src/api/mod.rs` (extracteur `AuthUser` requis).
  - [x] 1.2 — Définir le body : configuration courante (même schéma que `POST /quote` : `shell_variant_id`, `screen_variant_id`, `lens_variant_id`, `expert_options` optionnel). Optionnel : nom de la config, numéro de série client.
  - [x] 1.3 — Handler : valider la config (réutiliser `calculate_quote` pour cohérence prix), puis persister "Ready for Build". Choix possible : (A) insérer dans une table `quote_submissions` ou `orders`, (B) créer une entrée deck dédiée "en attente build". Documenter le choix dans api-contracts.md.
  - [x] 1.4 — Réponse 201 : `{ success: true, submission_id?: string }` ou équivalent. Erreurs : 400 (config invalide), 401 (non authentifié).

### Frontend — API et store

- [x] **Task 2 — API backend.js : login, register, logout, submitQuote** (AC: #2, #3)
  - [x] 2.1 — Ajouter `login(email, password)`, `register(email, password)`, `logout()` avec `withCredentials: true` (POST /auth/login, POST /auth/register, POST /auth/logout). Retourner les données utilisateur ou lever en cas d'erreur.
  - [x] 2.2 — Ajouter `submitQuote(config)` : POST /quote/submit avec la configuration courante (même format que pour calculateQuote si besoin), `withCredentials: true`. Retourner la réponse ou throw.
  - [x] 2.3 — Étendre le store auth : actions `login`, `register` (appellent backend puis mettent à jour `user`), et optionnellement `logout()` qui appelle POST /auth/logout puis efface `user`.

### Frontend — Modale Login/Register

- [x] **Task 3 — Modale d'authentification** (AC: #2)
  - [x] 3.1 — Créer un composant (ex. `AuthModal.vue` ou `LoginRegisterModal.vue`) avec onglets Login / Register (Radix Vue Dialog, cohérent avec DeckManager et design Cyberpunk).
  - [x] 3.2 — Champs : email, mot de passe (Register : répétition mot de passe optionnelle). Boutons : Se connecter / Créer un compte. Gérer erreurs (401, 400 email déjà pris) et les afficher dans la modale.
  - [x] 3.3 — Exposer une prop ou un slot pour "on success" : après login/register réussi, fermer la modale et appeler un callback (ex. poursuivre le flux "Confirmer la Création").

### Frontend — SignatureShowcase : flux "Confirmer la Création"

- [x] **Task 4 — Brancher la logique dans SignatureShowcase.vue** (AC: #1, #3, #4)
  - [x] 4.1 — Au clic sur "Confirmer la Création" : appeler `authStore.fetchUser()` si besoin, puis si `!authStore.isAuthenticated` ouvrir la modale Login/Register (avec callback "retry confirm" après succès).
  - [x] 4.2 — Si authentifié : construire le payload config depuis le store configurator (shell, screen, lens, expert_options), appeler `submitQuote(payload)`. En cas de succès : passer le statut à "Ready for Build" (store ou état local), rediriger vers le récapitulatif panier.
  - [x] 4.3 — Définir "récapitulatif final du panier" : option minimale recommandée — fermer le showcase et afficher un message de succès ("Commande enregistrée" / "Ready for Build") dans l'atelier ou ouvrir le Deck Manager ; éviter une nouvelle route/vue lourde si non nécessaire. Sinon vue dédiée (CartRecap) ou page simple. Documenter le choix dans les Dev Notes.
  - [x] 4.4 — Gestion d'erreur : afficher un message (GlitchEffect ou toast/message dans la SignatureCard), ne pas fermer le showcase ; permettre réessai ou Retour.

### Frontend — Redirection et état "Ready for Build"

- [x] **Task 5 — Récapitulatif panier et état** (AC: #3)
  - [x] 5.1 — Après succès POST /quote/submit : fermer le Signature Showcase (`showSignatureShowcase = false`), naviguer ou afficher le récapitulatif (voir 4.3). Optionnel : ajouter la config au deck via `addCurrentConfig` ou garder une liste "commandes en cours" selon le choix backend (Task 1.3).
  - [x] 5.2 — Afficher un état clair pour l'utilisateur : "Commande enregistrée", "Ready for Build", ou équivalent (libellé selon produit).

### Tests

- [x] **Task 6 — Tests** (AC: tous)
  - [x] 6.1 — Backend : test d'intégration `POST /quote/submit` sans cookie → 401 ; avec cookie valide + config valide → 201 et persistance conforme.
  - [x] 6.2 — E2E Playwright : ouvrir Signature Showcase → cliquer "Confirmer la Création" sans être connecté → modale Login s'ouvre ; après login → soumission et redirection (ou message succès).
  - [x] 6.3 — E2E : utilisateur déjà connecté → "Confirmer la Création" → soumission directe et redirection.
  - [x] 6.4 — E2E ou unitaire : erreur réseau ou 500 → message affiché, pas de redirection.

## Dev Notes

### Contexte métier

- **FR10** : Présentation Signature + validation finale. Cette story couvre la **validation** et la **transition vers le panier** (récap commande).
- **Epic 4** : "L'Expérience Signature" — après le moment visuel (4.1), l'utilisateur confirme et passe en phase "préparation assemblage".

### Contraintes architecturales

- **Backend** : [Source: docs/architecture-backend.md] — Axum 0.7, AuthUser extractor, JWT en cookie `auth_token`, CORS `allow_credentials(true)`.
- **Frontend** : [Source: docs/architecture-frontend.md] — Vue 3.5, Pinia 3.0, Radix Vue pour modales, design Cyberpunk (glass-premium, neo-orange, etc.).
- **API** : [Source: docs/api-contracts.md] — `POST /quote/submit` décrit comme "Envoyer pour assemblage", auth requise. Pas encore implémenté côté backend.

### Stack et patterns existants

- **Auth** : `src/api/auth.rs` (register, login, logout, me), extractor `AuthUser`. Body backend : `{ email, password }` (RegisterRequest/LoginRequest). Réponse 200/201 : `{ user: { id, email } }` (UserResponse). Frontend : `stores/auth.js` (`fetchUser`, `isAuthenticated`), `getAuthMe()` dans backend.js. Pas de modale Login/Register côté frontend actuellement — à créer. Après login/register réussi, le store peut mettre à jour `user` depuis la réponse sans rappeler GET /auth/me.
- **Quote** : `POST /quote` (handlers.rs) utilise `QuoteRequest` (snake_case : shell_variant_id, screen_variant_id, lens_variant_id, expert_options). Réutiliser le même format pour POST /quote/submit ; le frontend envoie déjà en snake_case dans `backend.js` (calculateQuote).
- **Deck** : `POST /deck` pour sauvegarder une config ; possible lien avec "Ready for Build" (sauvegarder une config soumise avec un flag ou une table dédiée).
- **SignatureShowcase** : bouton "Confirmer la Création" actuellement `onConfirmPlaceholder()` ; à remplacer par le flux auth + submit + redirection. Rendu de la modale Auth : dans SignatureShowcase.vue (ou Teleport vers body avec z-[110]) pour rester au-dessus du showcase (z-[100]).

### Fichiers à créer / modifier

**Backend :**
- `src/api/mod.rs` — Ajouter route `POST /quote/submit` (protégée AuthUser).
- `src/api/handlers.rs` ou nouveau fichier `src/api/quote_submit.rs` — Handler submit (validation config, persistance, réponse 201).
- Optionnel : migration ou table pour les soumissions de devis (quote_submissions / orders).
- `docs/api-contracts.md` — Documenter le body et la réponse de `POST /quote/submit`.

**Frontend :**
- `frontend/src/api/backend.js` — `login`, `register`, `logout`, `submitQuote`.
- `frontend/src/stores/auth.js` — Actions `login`, `register` (et `logout` appelant l’API si pas déjà fait).
- `frontend/src/components/AuthModal.vue` (ou LoginRegisterModal.vue) — Nouvelle modale Login/Register.
- `frontend/src/components/SignatureShowcase.vue` — Remplacer placeholder par le flux auth + submitQuote + redirection.

**Tests :**
- Backend : `src/api/quote_submit_integration_tests.rs` ou étendre les tests existants.
- Frontend : `frontend/tests/signature-showcase.spec.js` ou nouveau spec pour le flux 4.2 (confirmer avec/sans auth, modale, redirection).

### Intelligence de la story précédente (4.1)

- **SignatureShowcase.vue** : CTA "Confirmer la Création" déjà présent ; `onConfirmPlaceholder()` à remplacer. Focus trap et aria-modal déjà en place (a11y).
- **Store configurator** : `selectedShellVariantId`, `selectedScreenVariantId`, `selectedLensVariantId`, `quote`, `selectedExpertOptions` — utiliser pour construire le payload submit.
- **Numéro de série** : généré en 4.1 (RB-XXXX) ; peut être envoyé en option dans POST /quote/submit pour traçabilité.
- **DeckManager** : z-45 ; SignatureShowcase z-[100]. La modale Login doit être au-dessus du showcase (ex. z-[110]) ou rendue dans SignatureShowcase pour éviter conflits de couches.
- **Tests E2E** : `signature-showcase.spec.js` existe ; ajouter scénarios "Confirmer la Création" avec/sans auth et modale.

### Références

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.2] — User story et critères d'acceptation
- [Source: docs/api-contracts.md] — POST /quote/submit (à implémenter et documenter)
- [Source: docs/architecture-frontend.md] — Composants, store auth, design system
- [Source: docs/architecture-backend.md] — AuthUser, routes, CORS
- [Source: _bmad-output/implementation-artifacts/4-1-le-moment-signature-focus-reveal.md] — Contexte 4.1, CTA placeholder, structure SignatureShowcase

### Project Structure Notes

- Backend : routes dans `src/api/mod.rs`, handlers dans `api/` ou `handlers.rs` selon convention existante (quote dans handlers.rs).
- Frontend : modale auth dans `frontend/src/components/` (ou `components/ui/` si considérée comme composant réutilisable). Alignement avec DeckManager pour le style des modales (Radix Dialog, glass-premium).

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Backend : POST /quote/submit (route protégée AuthUser), table quote_submissions, handler dans api/quote_submit.rs, repo data/quote_submit_repo.rs. Réponse 201 avec submission_id.
- Frontend : backend.js (login, register, logout, submitQuote), store auth (login, register, logout), AuthModal.vue (onglets Login/Register, callback on success), SignatureShowcase (flux confirm → auth check → modale si non connecté → submitQuote → fermeture + message "Commande enregistrée — Ready for Build" dans l'atelier). Gestion erreur : message dans SignatureCard, pas de redirection.
- Tests : quote_submit_integration_tests.rs (401 sans cookie, 201 avec cookie + persistance), E2E signature-showcase.spec.js (6.2 modale + login + succès, 6.3 soumission directe, 6.4 erreur 500).
- **Code review (AI) :** Corrections appliquées — (1) test intégration : SELECT sur quote_submissions après 201 pour prouver la persistance ; (2) File List : ajout src/models/quote.rs ; (3) SignatureShowcase.vue : await doSubmit() dans onAuthSuccess ; (4) api-contracts.md : doublon "## Endpoints" supprimé.

### File List

- migrations/010_quote_submissions.sql (nouveau)
- src/data/quote_submit_repo.rs (nouveau)
- src/data/mod.rs (modifié)
- src/api/quote_submit.rs (nouveau)
- src/api/mod.rs (modifié)
- src/api/quote_submit_integration_tests.rs (nouveau)
- src/models/quote.rs (modifié)
- docs/api-contracts.md (modifié)
- frontend/src/api/backend.js (modifié)
- frontend/src/stores/auth.js (modifié)
- frontend/src/stores/configurator.js (modifié)
- frontend/src/components/AuthModal.vue (nouveau)
- frontend/src/components/SignatureShowcase.vue (modifié)
- frontend/src/App.vue (modifié)
- frontend/tests/signature-showcase.spec.js (modifié)

---

## Senior Developer Review (AI)

**Reviewer:** Amelia (Dev Agent) — {{date}}  
**Story:** 4-2-validation-et-transition-panier  
**Git vs File List:** 1 fichier source modifié non listé  
**Problèmes relevés:** 1 High, 2 Medium, 2 Low

### 🔴 HIGH

1. **Task 6.1 — "Persistance conforme" non prouvée par le test**  
   Le test d’intégration `test_quote_submit_with_valid_cookie_returns_201_and_persists` vérifie le statut 201 et la présence de `submission_id` dans la réponse, mais **ne vérifie pas en base** que la ligne a bien été insérée dans `quote_submissions`. La task exige "201 et persistance conforme".  
   **Fichier:** `src/api/quote_submit_integration_tests.rs` (lignes 59–115).  
   **Action recommandée:** Après le 201, exécuter un `SELECT` sur `quote_submissions` (par `submission_id` ou `user_id`) et affirmer qu’une ligne existe avec les bonnes valeurs (ex. `shell_variant_id`, `total_price`).

### 🟡 MEDIUM

2. **File List incomplète**  
   `src/models/quote.rs` est modifié (utilisé par `QuoteRequest` / `ExpertOptionsRequest` pour le flux submit) mais n’apparaît pas dans la Dev Agent Record → File List.  
   **Action:** Ajouter `src/models/quote.rs (modifié)` à la File List.

3. **`onAuthSuccess` sans `await` sur `doSubmit()`**  
   Dans `SignatureShowcase.vue`, après login/register réussi, `onAuthSuccess()` ferme la modale et appelle `doSubmit()` sans `await`. En cas d’échec, l’erreur est bien affichée dans la SignatureCard, mais le flux serait plus lisible et moins sujet à race avec `await doSubmit()`.  
   **Fichier:** `frontend/src/components/SignatureShowcase.vue` (lignes 119–123).

### 🟢 LOW

4. **Doublon "## Endpoints" dans api-contracts.md**  
   La section "## Endpoints" apparaît deux fois (lignes 9 et 11).  
   **Fichier:** `docs/api-contracts.md`.

5. **Clarté du flux async après auth**  
   Même point que Medium #3 : ajouter `await doSubmit()` dans `onAuthSuccess` améliore la lisibilité et aligne le comportement avec l’intention "après succès auth → soumettre puis fermer".

### Corrections appliquées (suite à choix utilisateur « tout corriger »)

- **HIGH #1** : Dans `quote_submit_integration_tests.rs`, après le 201, ajout d'un `SELECT` sur `quote_submissions` (id, shell_variant_id, total_price, status) et assertions pour prouver la persistance.
- **MEDIUM #2** : `src/models/quote.rs` ajouté à la File List.
- **MEDIUM #3 + LOW #5** : `onAuthSuccess()` est désormais `async` et appelle `await doSubmit()`.
- **LOW #4** : Doublon "## Endpoints" supprimé dans `docs/api-contracts.md`.

### ✅ Vérifications effectuées

- **AC #1–#4** : Implémentés (auth check, modale si non connecté, POST /quote/submit, gestion erreur avec message, pas de redirection).
- **Tasks 1–6** : Toutes marquées [x] et implémentées (routes, handler, repo, migration, backend.js, auth store, AuthModal, SignatureShowcase, App.vue banner, E2E 6.2–6.4).
- **Sécurité** : Route protégée par `AuthUser`, validation config via `calculate_quote`, requêtes SQL paramétrées.
- **E2E** : `submission-success-banner` présent dans `App.vue` (data-testid), mocks auth/me, login, quote/submit cohérents.
