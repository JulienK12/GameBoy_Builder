# Story 1.2: Logique de "Bundle" Backend & Tarification

Status: done

## Story

En tant que Développeur Backend,
Je veux un endpoint d'API capable de résoudre un ID de Pack et de calculer son prix dynamique,
Afin que le frontend ne contienne aucune donnée produit codée en dur.

## Acceptance Criteria (BDD)

1. **Étant donné** une `QuoteRequest` avec un `pack_id` valide,
   **Quand** j'appelle l'endpoint `POST /quote`,
   **Alors** le système résout le pack en ses IDs de composants individuels (`shell_variant_id`, `screen_variant_id`, `lens_variant_id`),
   **Et** le moteur de prix `calculate_quote()` calcule le total avec les prix actuels du catalogue,
   **Et** la réponse inclut la liste complète des `LineItem` et les éventuels `warnings`.

2. **Étant donné** une `QuoteRequest` avec un `pack_id` valide **et** des `overrides`,
   **Quand** j'appelle `POST /quote`,
   **Alors** les composants overridés remplacent ceux du pack (ex: remplacer la coque du pack par une autre),
   **Et** le calcul utilise les composants finaux (pack + overrides),
   **Et** la compatibilité est revérifiée avec les overrides.

3. **Étant donné** une `QuoteRequest` avec un `pack_id` invalide,
   **Quand** j'appelle `POST /quote`,
   **Alors** le système retourne une erreur 400 avec un message explicite.

4. **Étant donné** une `QuoteRequest` classique (sans `pack_id`, avec `shell_variant_id` direct),
   **Quand** j'appelle `POST /quote`,
   **Alors** le comportement existant est **strictement identique** — zéro régression.

5. **Étant donné** un pack dont un composant référencé n'existe plus en catalogue,
   **Quand** `calculate_quote()` tente de résoudre le pack,
   **Alors** une erreur explicite est retournée (le pack est invalidé).

## Dépendances

> ⚠️ **Cette story dépend de Story 1.1** — Les structs `Pack`, la table DB `packs`, et la méthode de chargement dans `Catalog` doivent exister.

## Tasks / Subtasks

### Backend (Rust — modification uniquement)

- [x] **Task 1 — Extension de `QuoteRequest`** (AC: #1, #2, #4)
  - [x] 1.1 — Modifier `QuoteRequest` dans `src/api/handlers.rs` :
    - `shell_variant_id` : `String` → `Option<String>`
    - Ajouter : `pack_id: Option<String>`
    - Ajouter : `overrides: Option<PackOverrides>`
  - [x] 1.2 — Créer le struct `PackOverrides` dans `src/models/pack.rs` :
    ```rust
    #[derive(Debug, Deserialize)]
    pub struct PackOverrides {
        pub shell_variant_id: Option<String>,
        pub screen_variant_id: Option<String>,
        pub lens_variant_id: Option<String>,
    }
    ```

- [x] **Task 2 — Logique de résolution Pack → Composants** (AC: #1, #2, #3, #5)
  - [x] 2.1 — Ajouter `resolve_pack()` dans `src/data/catalog.rs` :
    ```rust
    pub fn resolve_pack(
        &self,
        pack_id: &str,
        overrides: Option<&PackOverrides>,
    ) -> Result<ResolvedComponents, String>
    ```
  - [x] 2.2 — Créer `ResolvedComponents` dans `src/models/pack.rs` :
    ```rust
    pub struct ResolvedComponents {
        pub shell_variant_id: String,
        pub screen_variant_id: Option<String>,
        pub lens_variant_id: Option<String>,
    }
    ```
  - [x] 2.3 — La méthode doit :
    1. Trouver le pack dans `self.packs` → erreur si introuvable
    2. Appliquer les overrides le cas échéant
    3. Retourner les IDs résolus (la **validation** d'existence est faite par `calculate_quote`)

- [x] **Task 3 — Adaptation du handler `calculate_quote_handler`** (AC: #1, #4)
  - [x] 3.1 — Modifier `calculate_quote_handler` dans `src/api/handlers.rs` :
    1. Si `pack_id` est fourni → appeler `catalog.resolve_pack()`
    2. Si `shell_variant_id` est fourni → utiliser le flow classique
    3. Si aucun des deux → erreur 400
  - [x] 3.2 — Dans tous les cas, appeler `calculate_quote()` avec les IDs résolus
  - [x] 3.3 — La signature de `calculate_quote()` dans `logic/calculator.rs` **NE CHANGE PAS**

- [x] **Task 4 — Tests unitaires** (AC: #1, #2, #3, #4, #5)
  - [x] 4.1 — Test : quote avec `pack_id` valide → résolution correcte, prix correct
  - [x] 4.2 — Test : quote avec `pack_id` + override coque → override appliqué
  - [x] 4.3 — Test : quote avec `pack_id` invalide → erreur 400
  - [x] 4.4 — Test : quote classique (sans `pack_id`) → comportement inchangé (tests existants)
  - [x] 4.5 — Test : `resolve_pack()` avec overrides partiels

### Frontend (Vue.js — adaptation mineure)

- [x] **Task 5 — Mise à jour de `calculateQuote()` dans `backend.js`** (AC: #1)
  - [x] 5.1 — Adapter `calculateQuote(config)` pour supporter optionnellement `pack_id` et `overrides`
  - [x] 5.2 — **Backward compatible** : si `config.shellVariantId` est fourni, l'ancien format est envoyé

## Dev Notes

### Contrainte Critique : Zéro Régression

La fonction `calculate_quote()` dans `logic/calculator.rs` est le **cœur du moteur**. Elle a 8 tests unitaires existants qui DOIVENT tous passer après cette story. La stratégie est de ne **pas modifier** la signature de cette fonction :

```rust
// CETTE SIGNATURE NE CHANGE PAS
pub fn calculate_quote(
    catalog: &Catalog,
    shell_variant_id: &str,
    screen_variant_id: Option<&str>,
    lens_variant_id: Option<&str>,
) -> Result<Quote, String>
```

La résolution du pack se fait **en amont** dans le handler — `calculate_quote()` reçoit toujours des IDs de composants individuels.

### Architecture de la Résolution

```
QuoteRequest
    │
    ├── pack_id fourni ?
    │   ├── OUI → catalog.resolve_pack(pack_id, overrides)
    │   │         → Retourne ResolvedComponents
    │   │         → Passe les IDs à calculate_quote()
    │   │
    │   └── NON → shell_variant_id fourni ?
    │             ├── OUI → Passe directement à calculate_quote()
    │             └── NON → Erreur 400
    │
    └── calculate_quote(catalog, shell_id, screen_id, lens_id)
        → Result<Quote, String>
```

### Contrat API — POST /quote (Pack Mode)

[Source: `docs/api-contracts.md#POST /quote`]

```json
// Requête Pack
{
  "pack_id": "PACK_BUDGET_01",
  "overrides": {
    "shell_variant_id": "VAR_SHELL_GBC_FP_ATOMIC_PURPLE"
  }
}

// Réponse (identique au format actuel)
{
  "success": true,
  "quote": {
    "items": [...],
    "total_price": 89.0,
    "warnings": []
  },
  "error": null
}
```

> ⚠️ **Le format de réponse actuel (`QuoteResponse`) ne change pas.** Le contrat V2 mentionne un format `quotes[]` avec `grand_total`, mais ce changement sera introduit dans l'Epic 3 (multi-config Deck). Pour cette story, on garde le format existant.

### Patterns Existants à Suivre

**Validation par les méthodes `find_*()` existantes** :
```rust
// Ce pattern dans calculate_quote() valide automatiquement
// que les IDs existent dans le catalogue :
let shell_variant = catalog
    .find_shell_variant(shell_variant_id)
    .ok_or_else(|| format!("❌ Variante introuvable: {}", shell_variant_id))?;
```

Le pack passe par le même pipeline → si un composant du pack n'existe plus, `calculate_quote()` retourne une erreur. **Pas besoin de double validation.**

### Project Structure Notes

**Fichiers à modifier :**
- `src/api/handlers.rs` — Modifier `QuoteRequest`, adapter `calculate_quote_handler`
- `src/models/pack.rs` — Ajouter `PackOverrides`, `ResolvedComponents`
- `src/data/catalog.rs` — Ajouter `resolve_pack()`
- `frontend/src/api/backend.js` — Adapter `calculateQuote()` pour le mode pack

**Fichiers NON modifiés :**
- `src/logic/calculator.rs` — ❌ NE PAS TOUCHER (sauf ajout de tests)
- `src/models/quote.rs` — ❌ Structure `Quote`/`LineItem` inchangée
- `src/main.rs` — ❌ Aucun changement
- `src/api/mod.rs` — ❌ Aucune nouvelle route (on réutilise `/quote`)

### Tests Existants à Préserver

Les 8 tests suivants dans `logic/calculator.rs` DOIVENT passer sans modification :

| Test | Vérifie |
|---|---|
| `test_fp_shell_with_fp_laminated_screen` | FP Shell + FP RP 2.0 Laminé = 110€ |
| `test_oem_shell_with_oem_screen_and_lens` | OEM Shell + OEM Screen + Vitre = 25€ |
| `test_oem_shell_with_laminated_screen_requires_cut` | OEM + HI Q5 Laminé = 115€ (avec découpe) |
| `test_fp_shell_with_oem_screen_incompatible` | FP + OEM = Incompatible |
| `test_laminated_screen_with_lens_should_fail` | Laminé + Vitre = Erreur |
| `test_component_screen_without_lens_should_fail` | Component sans vitre = Erreur |
| `test_invalid_shell_variant_returns_error` | Variant inexistant = Erreur |
| `test_invalid_screen_variant_returns_error` | Variant inexistant = Erreur |

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.2`] — Acceptance Criteria
- [Source: `docs/api-contracts.md#POST /quote`] — Contrat API Pack Mode
- [Source: `src/logic/calculator.rs#calculate_quote`] — Moteur de prix existant
- [Source: `src/api/handlers.rs#QuoteRequest`] — Struct de requête actuelle
- [Source: `src/data/catalog.rs#Catalog`] — Méthodes de recherche catalogue

## Dev Agent Record

### Agent Model Used

Antigravity (Google DeepMind)

### Debug Log References

- Fixed imports in `catalog_tests.rs`.
- Removed `resolve_pack_and_calculate_quote` from `calculator.rs` to respect architecture.
- Implemented `resolve_pack` in `catalog.rs`.

### Completion Notes List

- Architecture respectée : `src/data/catalog.rs` contient désormais la logique de résolution.
- Tests ajoutés dans `src/data/catalog_tests.rs`.
- Frontend mis à jour pour envoyer `pack_id` et `overrides`.
- Zéro régression confirmée sur `calculate_quote`.

### Change Log

| Date | Changement | Auteur |
|---|---|---|
| 2026-02-11 | Story créée — ready-for-dev | Bob (SM) |
