# 🏗️ Architecture — Backend (Rust/Axum)

> **Type :** API REST
> **Langage :** Rust (Edition 2021)
> **Framework :** Axum 0.7
> **Base de données :** PostgreSQL (SQLx 0.8)

---

## 1. Pattern architectural : 3-Tier

```
┌──────────────────┐
│   API Layer      │ ← src/api/     (Handlers HTTP, routage Axum)
│   (Présentation) │
├──────────────────┤
│   Logic Layer    │ ← src/logic/   (Calcul de devis, règles métier)
│   (Métier)       │
├──────────────────┤
│   Data Layer     │ ← src/data/    (PostgreSQL, CSV, Catalog)
│   (Persistance)  │
├──────────────────┤
│   Models Layer   │ ← src/models/  (Structs, Enums, Constantes)
│   (Domaine)      │
└──────────────────┘
```

---

## 2. Modules détaillés

### 2.1 `src/main.rs` — Point d'entrée

Orchestre le démarrage :
1. Connexion au pool PostgreSQL (`data::create_pool()`)
2. Chargement du catalogue complet en mémoire (`Arc<Catalog>`)
3. Configuration CORS (ouvert pour dev)
4. Création du routeur Axum + service de fichiers statiques
5. Lancement du serveur sur `0.0.0.0:3000`

### 2.2 `src/api/` — Couche API

| Fichier | Rôle |
|---|---|
| `mod.rs` | Définit le routeur Axum avec tous les endpoints |
| `handlers.rs` | Implémente les handlers (Quote, Auth, Deck) |
| `auth.rs` | Middleware d'authentification et gestion JWT |

**Structs de requête/réponse :**
- `QuoteRequest` : `{ shell_variant_id, screen_variant_id?, lens_variant_id? }`
- `QuoteResponse` : `{ success, quote?, error? }`
- `DeckRequest` : `{ name, configuration }`
- `AuthRequest` : `{ email, password }`
- `HealthResponse` : `{ status, version }`

### 2.3 `src/logic/` — Couche métier

| Fichier | Rôle |
|---|---|
| `mod.rs` | Expose `calculate_quote` |
| `calculator.rs` | **Cœur du système** : calcul du devis (370 LOC) |

**Algorithme `calculate_quote()` :**
1. **Résoudre la coque** → Trouver ShellVariant → Shell parent → ajouter au devis
2. **Résoudre l'écran** → Variante fournie OU écran OEM par défaut
3. **Vérifier compatibilité** → Matrice coque/écran → `Yes` / `Cut` (ajoute service découpe) / `No` (erreur)
4. **Gérer la vitre** → `Component` = vitre obligatoire, `Laminated` = optionnelle (warning si fournie)
5. **Services automatiques** → Installation écran si non-OEM (20€)
6. **Calcul du total** → Somme de tous les `LineItem`

**Tests unitaires inclus (7 tests) :**
- FP Shell + FP Laminated = 110€
- OEM Shell + OEM Screen + Lens = 25€
- FP Shell + OEM Screen = Incompatible (erreur)
- OEM Shell + HI Q5 Laminated = 115€ (avec découpe)
- Laminated + Lens = erreur
- Component sans vitre = erreur
- Variantes inexistantes = erreur

### 2.4 `src/data/` — Couche données

| Fichier | Rôle |
|---|---|
| `mod.rs` | Expose `Catalog`, `create_pool`, `load_catalog_from_db` |
| `database.rs` | Crée le pool PostgreSQL (5 connexions max) via `dotenvy` |
| `pg_loader.rs` | Charge le catalogue complet depuis PostgreSQL |
| `loader.rs` | Charge le catalogue depuis les fichiers CSV (fallback/tests) |
| `catalog.rs` | Méthodes de recherche sur le `Catalog` (find, get_variants, get_compatibility) |
| `parser.rs` | Fonctions de parsing String → Enum (Brand, MoldType, etc.) |
| `records.rs` | Structs Serde pour la désérialisation CSV |

**Structure `Catalog` :**
```rust
pub struct Catalog {
    pub shells: Vec<Shell>,
    pub shell_variants: Vec<ShellVariant>,
    pub screens: Vec<Screen>,
    pub screen_variants: Vec<ScreenVariant>,
    pub lenses: Vec<Lens>,
    pub lens_variants: Vec<LensVariant>,
    pub compatibility_matrix: HashMap<(String, String), CompatibilityStatus>,
}
```

**Stratégie de chargement :**
- **Production** : `pg_loader::load_catalog_from_db()` → PostgreSQL
- **Tests** : `loader::load_catalog()` → Fichiers CSV dans `data/`

### 2.5 `src/models/` — Domaine

| Fichier | Rôle |
|---|---|
| `enums.rs` | Types métier : `MoldType`, `ScreenSize`, `ScreenAssembly`, `Brand`, `CompatibilityStatus` |
| `product.rs` | Structs produit : `Shell`, `ShellVariant`, `Screen`, `ScreenVariant`, `Lens`, `LensVariant`, `ShellScreenCompatibility` |
| `quote.rs` | Structs devis : `LineItem`, `Quote` |
| `constants.rs` | Constantes : `SCR_OEM_ID`, `SCREEN_INSTALLATION_PRICE` (20€), `SHELL_CUT_PRICE` (5€) |

---

## 3. Flux de données principal

```
[Client HTTP]
     │
     ▼
POST /quote { shell_variant_id, screen_variant_id?, lens_variant_id? }
     │
     ▼
[handlers::calculate_quote_handler]
     │ State(Arc<Catalog>)
     ▼
[logic::calculate_quote(&catalog, ...)]
     │ 1. find_shell_variant → find_shell
     │ 2. find_screen_variant → find_screen (ou OEM)
     │ 3. get_compatibility(screen, shell) → Yes/Cut/No
     │ 4. Résoudre vitre (Component/Laminated)
     │ 5. Ajouter services automatiques
     │ 6. Calculer total
     ▼
QuoteResponse { success: true, quote: { items, total_price, warnings } }
```

---

## 4. Dépendances clés

| Crate | Version | Usage |
|---|---|---|
| `axum` | 0.7 | Framework HTTP async |
| `tokio` | 1.0 (full) | Runtime async |
| `sqlx` | 0.8 (postgres, macros, tls-rustls) | ORM PostgreSQL async |
| `serde` / `serde_json` | 1.0 | Sérialisation JSON |
| `csv` | 1.3 | Parsing CSV (fallback/tests) |
| `dotenvy` | 0.15 | Variables d'environnement |
| `tower-http` | 0.5 (cors, fs) | Middleware CORS + fichiers statiques |

---

## 5. Points d'attention architecturaux

6. **Deck System** : Persistance des configurations via PostgreSQL (`user_configurations`). Un trigger DB assure la limite de 3 slots par utilisateur.

## 7. Stratégie d'Authentification (Lazy Auth)

Pour maximiser la conversion et l'expérience utilisateur, l'accès au configurateur est **ouvert à tous (invités)**. L'authentification n'est requise que pour les actions de persistance ou de validation finale.

| Action | Authentification | Persistence |
|---|---|---|
| Consulter le catalogue | Non requise | N/A |
| Configurer / Devis temps réel | Non requise | `localStorage` (Frontend) |
| Sauvegarder dans le "Deck" | **Requise** | PostgreSQL (`user_configurations`) |
| Envoyer demande de devis | **Requise** | PostgreSQL (`quote_requests`) |

### Flux Login-on-Save :
1. L'utilisateur crée sa configuration en tant qu'invité.
2. Lorsqu'il clique sur "Sauvegarder" ou "Valider", le frontend vérifie l'état d'authentification.
3. Si non connecté : Affichage d'une modale Login/Register.
4. Après connexion réussie : La configuration en cours est immédiatement synchronisée avec le compte utilisateur.
