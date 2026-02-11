# Story 3.2: Persistance Locale & Logique de Synchronisation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant qu'Utilisateur,
Je veux que mon deck soit sauvegardé même si je ferme mon navigateur,
Afin de ne pas perdre ma progression créative.

## Acceptance Criteria (BDD)

1. **Étant donné** un deck contenant 1 à 3 configurations,
   **Quand** le navigateur est fermé et rouvert (ou l'onglet rechargé),
   **Alors** le plugin `pinia-plugin-persistedstate` récupère les données depuis le `localStorage`,
   **Et** l'UI restaure précisément l'état de chaque carte dans le deck (noms, configurations, prix, aperçus).

2. **Étant donné** que l'utilisateur modifie le deck (ajout, suppression, renommage),
   **Quand** les données du store `deck` changent,
   **Alors** le plugin persiste automatiquement le nouvel état dans le `localStorage`,
   **Et** aucun appel API backend n'est effectué (persistance locale uniquement en 3.2).

## Dépendances

> ✅ **Story 3.0** — Auth en place (optionnel pour 3.2).
> ✅ **Story 3.1** — Store `deck` et composant `DeckManager` en place ; état en mémoire uniquement.
> 📌 **Story 3.3** — Synchronisation cloud (endpoints `/deck/*`) viendra après ; en 3.2 pas d'API deck.

## Tasks / Subtasks

### Frontend — Activation du plugin de persistance

- [x] **Task 1 — Enregistrer le plugin Pinia** (AC: #1, #2)
  - [x] 1.1 — Dans `frontend/src/main.js` : importer le plugin (export par défaut : `import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'`).
  - [x] 1.2 — Appliquer le plugin à l'instance Pinia avant `app.use(pinia)` : `pinia.use(piniaPluginPersistedstate)` (pas d'argument requis ; chaque store active la persistance via son option `persist`).
  - [x] 1.3 — Vérifier que l'app démarre sans erreur et que les autres stores (ex. `configurator`) ne sont pas persistés sauf si souhaité (seul le store `deck` doit avoir `persist: true` ; ne pas persister `configurator`).

### Frontend — Persistance du store deck

- [x] **Task 2 — Activer la persistance sur le store deck** (AC: #1, #2)
  - [x] 2.1 — Dans `frontend/src/stores/deck.js` : ajouter un **troisième argument** à `defineStore` : `defineStore('deck', () => { ... }, { persist: true })` ou `{ persist: { key: 'gameboy-deck' } }`.
  - [x] 2.2 — Clé explicite recommandée : `key: 'gameboy-deck'` dans l'objet `persist` pour éviter les collisions et faciliter le debug (Application > Local Storage).
  - [x] 2.3 — La structure actuelle du state est déjà sérialisable en JSON ; le plugin gère la sérialisation/désérialisation. Aucun changement de structure requis.

### Frontend — Vérifications et edge cases

- [x] **Task 3 — Restauration et cohérence UI** (AC: #1)
  - [x] 3.1 — Après rechargement de la page : vérifier que les cartes du deck s'affichent avec les bons noms, prix et images d'aperçu (les URLs d'images sont recalculées via `getShellImageUrl(entry.configuration.shellVariantId)` ; les IDs doivent être restaurés).
  - [x] 3.2 — Gérer le cas où le catalogue n'est pas encore chargé au premier rendu après restauration (éviter erreurs si `shellVariantId` référence une variante pas encore en cache) ; afficher un placeholder ou attendre le chargement du catalogue si nécessaire.
  - [x] 3.3 — Conserver la limite de 3 configurations côté store ; la persistance ne doit pas permettre de dépasser 3 entrées (données existantes déjà conformes si logique 3.1 inchangée).

### Tests

- [x] **Task 4 — Tests manuels / E2E** (AC: #1, #2)
  - [x] 4.1 — Scénario : ajouter 1 à 3 configurations au deck, recharger la page (F5 ou re-open) ; vérifier que toutes les cartes réapparaissent avec le même contenu.
  - [x] 4.2 — Scénario : modifier le deck (supprimer une carte, en ajouter une autre), recharger ; vérifier que l'état reflète les dernières modifications.
  - [x] 4.3 — Optionnel : test unitaire (Vitest) pour le store deck avec mock du plugin ou test d'intégration vérifiant que les données écrites en localStorage sont bien rechargées par le store.

## Dev Notes

### Contexte métier

- **FR5** : Sauvegarder le panier via localStorage pour les invités. En 3.2 on persiste le **deck** (jusqu'à 3 configurations) en localStorage ; pas encore de sync cloud (Story 3.3).
- La persistance doit être transparente : l'utilisateur n'a pas d'action spécifique à faire pour “sauvegarder” ; la fermeture du navigateur ou le rechargement suffit à conserver le deck.

### Prérequis technique

- Dépendance **`pinia-plugin-persistedstate`** déjà installée dans le projet (`frontend/package.json`, version ^4.7.1). Ne pas réinstaller ; uniquement l'activer dans `main.js` et sur le store `deck`.

### Contraintes architecturales

- **Store deck inchangé dans sa structure** : Les champs `configurations`, `addCurrentConfig`, `removeConfig`, `getPreviewImageUrl` restent tels qu'implémentés en 3.1. Seule l'activation de la persistance (plugin + option persist sur le store) est ajoutée.
- **Aucun appel API** : En 3.2, aucun appel à `/deck/*` ou autre endpoint backend ; toute la logique est locale (localStorage + Pinia).
- **Architecture frontend** : [Source: docs/architecture-frontend.md] — Pinia Store (deck) pour multi-configs persistence ; le plugin étend Pinia sans changer le contrat du store.

### Stack et patterns existants

- **Vue 3.5**, **Pinia 3.0**, **pinia-plugin-persistedstate 4.x**.
- Référence d'API du plugin : [pinia-plugin-persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate) — import par défaut : `import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'` puis `pinia.use(piniaPluginPersistedstate)` ; par store : option `persist: true` ou `persist: { key: 'gameboy-deck' }` dans le 3ᵉ argument de `defineStore`.
- Le store `deck` expose déjà un state sérialisable (tableau d'objets avec `id`, `name`, `configuration`, `totalPrice`) ; compatible avec la sérialisation JSON du plugin.

### Fichiers à créer / modifier

**Modifications :**
- `frontend/src/main.js` — Importer et enregistrer `pinia-plugin-persistedstate` ; optionnellement limiter la persistance au store `deck` uniquement.
- `frontend/src/stores/deck.js` — Activer la persistance (option `persist` ou équivalent) et définir la clé de stockage (ex. `gameboy-deck`).

**Créations (optionnel) :**
- Tests E2E ou unitaires pour “reload page → deck restauré” (ex. dans `frontend/tests/deck-manager.spec.js` ou nouveau spec dédié persistance).

### Intelligence de la story précédente (3.1)

- **Store deck** : `frontend/src/stores/deck.js` — state `configurations` (array, max 3), actions `addCurrentConfig(name?)`, `removeConfig(id)`, getter `canAddMore`, helper `getPreviewImageUrl(entry)`. Snapshot = `shellVariantId`, `screenVariantId`, `lensVariantId`, `selectedExpertOptions`, `selectedShellColorHex`. Pas de persistance en 3.1.
- **DeckManager.vue** : grille de cartes, aperçu coque ou placeholder, nom, prix formaté, bouton Supprimer, bouton “Sauvegarder dans le Deck” désactivé si 3 configs.
- **App.vue** : bouton MON_DECK, panneau Deck Manager (Teleport/overlay). Aucun changement structurel requis pour 3.2.
- **Tests** : `frontend/tests/deck-manager.spec.js`, `frontend/tests/unit/deck.spec.js` — peuvent être étendus pour couvrir la persistance (reload + assertion sur le nombre de cartes et le contenu).

### Change Log

- 2026-02-11 : Implémentation complète — plugin Pinia persistedstate activé, store deck persisté (clé `gameboy-deck`), fallback image aperçu dans DeckManager, tests E2E persistance ajoutés.
- 2026-02-11 : Code review (AI) — 1 écart Git/File List, 4 points LOW ; aucun HIGH/CRITICAL. AC #1 et #2 validés. Voir section Senior Developer Review.

### Références

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2] — User story et critères d'acceptation
- [Source: PRD.md — §2 Système de "Deck"] — Panier sauvegardé via localStorage (invité)
- [Source: docs/architecture-frontend.md#1] — Schéma Pinia Store (deck)
- [Source: docs/architecture-frontend.md#4] — API backend (pas d'appel deck en 3.2)
- [Source: frontend/package.json] — pinia-plugin-persistedstate ^4.7.1 déjà présent
- [Source: _bmad-output/implementation-artifacts/3-1-ui-du-deck-multi-cartes.md] — Contexte store deck et DeckManager

## Senior Developer Review (AI)

**Date :** 2026-02-11  
**Story :** 3-2-persistance-locale-et-logique-de-synchronisation  
**Écarts Git vs File List :** 1  
**Problèmes :** 0 High, 1 Medium, 4 Low

### Validation AC

- **AC #1** (restauration après reload) : **IMPLÉMENTÉ** — plugin dans `main.js`, `persist: { key: 'gameboy-deck' }` dans `deck.js`, fallback image dans `DeckManager.vue` (l.37–43, @error + showPlaceholder). E2E `deck-manager.spec.js` (Story 3.2) : "AC #1: deck is restored after page reload".
- **AC #2** (persistance auto, pas d’API) : **IMPLÉMENTÉ** — aucun appel `/deck` dans le frontend ; persistance uniquement via le plugin. E2E "AC #2: deck state reflects last modifications after reload".

### Audit des tâches

- Toutes les tâches marquées [x] sont réalisées (plugin, option persist, clé `gameboy-deck`, restauration UI, fallback image, limite 3, tests E2E persistance).

### Découvertes

1. **MEDIUM — Git vs File List**  
   `deck.js`, `DeckManager.vue`, `deck-manager.spec.js` sont en **untracked** (??) dans `git status` alors que la File List les indique comme "modifié". À clarifier : créations (3.1) ou modifications (3.2) non commitées ; mettre à jour la File List ou committer pour traçabilité.

2. **LOW — DeckManager.vue**  
   `imageError` (ref clé par `entryId`) n’est jamais nettoyé quand une carte est supprimée → accumulation de clés (fuite mineure). [DeckManager.vue ~38–43]

3. **LOW — deck.js**  
   Limite 3 en dur (`length < 3`, `length >= 3`). Recommandation : constante `MAX_DECK_CONFIGS = 3` pour maintenabilité. [deck.js 16, 46]

4. **LOW — Tests unitaires**  
   Aucun test Vitest sur la persistance (localStorage / plugin). Story : optionnel — acceptable.

5. **LOW — Robustesse**  
   Données corrompues dans `localStorage` pour `gameboy-deck` peuvent faire lever le plugin au chargement. Comportement par défaut du plugin ; pas de try/catch côté app (acceptable, peut être documenté).

### Verdict

- **Conformité :** AC et tâches conformes au code.
- **Statut proposé après review :** `done` (aucun HIGH/CRITICAL ; écarts et LOW à traiter en suivi optionnel ou dans une story dédiée).

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Task 1 : Plugin `pinia-plugin-persistedstate` importé et enregistré dans `main.js` ; seul le store `deck` a l’option `persist` (configurator non persisté).
- Task 2 : Store `deck` avec `defineStore(..., { persist: { key: 'gameboy-deck' } })` ; état sérialisable inchangé.
- Task 3 : Restauration UI assurée par le plugin ; fallback `@error` sur les images d’aperçu dans `DeckManager.vue` pour afficher un placeholder si l’image ne charge pas (catalogue indisponible ou variante invalide).
- Task 4 : Deux tests E2E ajoutés dans `deck-manager.spec.js` (Story 3.2) : restauration après reload (AC #1) et état reflétant les modifications après reload (AC #2). Tests unitaires deck existants (Vitest) passent sans modification.

### File List

- frontend/src/main.js (modifié)
- frontend/src/stores/deck.js (modifié)
- frontend/src/components/DeckManager.vue (modifié)
- frontend/tests/deck-manager.spec.js (modifié)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modifié)
