# Story 6.2: Data - Catalogue des Boutons par Modèle

Status: done
- [x] Task 1 — Synchronisation de la Base de Données
  - [x] 1.1 — Appliquer la migration `migrations/011_buttons.sql` pour créer les tables.
  - [x] 1.2 — Créer et appliquer `migrations/013_refine_buttons_granularity.sql` pour injecter les boutons individuels (D-pad, A, B, etc.) pour GBC, DMG, GBA et SP.
  - [x] 1.3 — Vérifier que les nouvelles tables sont accessibles via le `Catalog` Rust.

- [x] Task 2 — API Endpoint
  - [x] 2.1 — Créer le handler `get_buttons` dans `src/api/handlers.rs` acceptant un `Path<String>` pour le console_id.
  - [x] 2.2 — Exposer les boutons filtrés via `/catalog/buttons/{console_id}`.
  - [x] 2.3 — Tester la robustesse avec des IDs invalides.

## Story

En tant que Moddeur,
Je veux que le catalogue propose des options de boutons spécifiques à chaque modèle de console,
Afin d'éviter des configurations techniquement impossibles.

## Acceptance Criteria (BDD)

1. **Étant donné** une requête `GET /catalog/buttons/{console_id}`,
   **Quand** l'API répond,
   **Alors** elle retourne la liste exacte des boutons personnalisables pour ce modèle :
     - **GBC** : D-pad, Bouton A, Bouton B, Interrupteur ON/OFF, Cache IR.
     - **Pocket/DMG** : D-pad, Bouton A, Bouton B, Interrupteur ON/OFF.
     - **GBA** : D-pad, Bouton A, Bouton B, Interrupteur ON/OFF, L, R, Bordure Gauche, Bordure Droite.
     - **GBA SP** : D-pad, Bouton A, Bouton B, Interrupteur ON/OFF, Volume, L, R, Start, Select, Rétroéclairage.

2. **Étant donné** un bouton spécifique,
   **Quand** on consulte ses variantes,
   **Alors** les options incluent "OEM" (par défaut) et les variantes custom (ex: CGS Blue, CGS Red).

3. **Étant donné** le fichier `catalog.json` ou la DB,
   **Alors** les relations entre les boutons et les modèles de console sont strictement définies.

4. **Étant donné** une requête pour un modèle spécifique par son ID court (ex: `gbc`),
   **Alors** l'API renvoie les données pour "Gameboy Color".

## Tasks / Subtasks

### Data & Backend

- [x] **Task 1 — Synchronisation de la Base de Données**
  - [x] 1.1 — Appliquer la migration `migrations/011_buttons.sql` pour créer les tables.
  - [x] 1.2 — Créer et appliquer `migrations/013_refine_buttons_granularity.sql` pour injecter les boutons individuels (D-pad, A, B, etc.) pour GBC, DMG, GBA et SP.
  - [x] 1.3 — Vérifier que les nouvelles tables sont accessibles via le `Catalog` Rust.

- [x] **Task 2 — API Endpoint**
  - [x] 2.1 — Créer le handler `get_buttons` dans `src/api/handlers.rs` acceptant un `Path<String>` pour le console_id.
  - [x] 2.2 — Exposer les boutons filtrés via `/catalog/buttons/{console_id}`.
  - [x] 2.3 — Tester la robustesse avec des IDs invalides.

## Dev Agent Record

### File List
- `migrations/011_buttons.sql`
- `migrations/012_seed_buttons.sql`
- `migrations/013_refine_buttons_granularity.sql`
- `src/api/handlers.rs`
- `src/api/mod.rs`
- `src/api/catalog_integration_tests.rs`
- `src/data/pg_loader.rs`
- `src/data/catalog.rs`

### Change Log
- Création des tables `buttons` et `button_variants`.
- Injection des données granulaires pour GBC, DMG, GBA et SP.
- Implémentation du filtrage par console dans le handler `get_buttons`.
- Ajout de la gestion d'erreur 404 pour les consoles inconnues.
- Couverture de test étendue à tous les modèles et vérification des variants.

## Dev Notes

- Attention à bien mapper les noms techniques (`d_pad`, `button_a`) pour qu'ils soient constants entre le Backend et le Frontend.
- Les variantes de boutons personnalisés (CGS) doivent avoir un identifiant unique (ex: `VAR_BUT_GBC_CGS_RED`).
