# 🗄️ Modèles de données — PostgreSQL

> **Base de données :** `gameboy_configurator`
> **ORM :** SQLx 0.8 (Rust)
> **Migrations :** 3 fichiers dans `migrations/`

---

## 1. Schéma de la base de données

### Types PostgreSQL custom (ENUMs)

```sql
CREATE TYPE mold_type AS ENUM ('OemStandard', 'IpsReady', 'LaminatedReady');
CREATE TYPE brand AS ENUM ('OEM', 'FunnyPlaying', 'Hispeedido', 'CloudGameStore', 'ExtremeRate');
CREATE TYPE screen_size AS ENUM ('Standard', 'Large');
CREATE TYPE screen_assembly AS ENUM ('Component', 'Laminated');
CREATE TYPE compatibility_status AS ENUM ('Yes', 'Cut', 'No');
```

---

### Tables

#### `shells` — Coques

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PK | ID unique (ex: `SHELL_GBC_OEM`) |
| `handled_model` | VARCHAR(50) | NOT NULL | Modèle de console (ex: `GBC`) |
| `brand` | brand (ENUM) | NOT NULL | Marque du fabricant |
| `name` | VARCHAR(100) | NOT NULL | Nom commercial |
| `price` | DOUBLE PRECISION | NOT NULL | Prix de base (€) |
| `mold` | mold_type (ENUM) | NOT NULL | Type de moulage |

#### `shell_variants` — Variantes de coques

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PK | ID unique (ex: `VAR_SHELL_GBC_OEM_GRAPE`) |
| `shell_id` | VARCHAR(50) | FK → shells(id) | Référence à la coque parente |
| `name` | VARCHAR(100) | NOT NULL | Nom de la couleur/variante |
| `supplement` | DOUBLE PRECISION | DEFAULT 0 | Supplément de prix (€) |
| `color_hex` | VARCHAR(7) | NOT NULL | Code couleur hexadécimal |
| `image_url` | TEXT | NOT NULL | Chemin vers l'image |
| `is_transparent` | BOOLEAN | DEFAULT FALSE | Coque transparente ? |
| `source_url` | TEXT | — | URL source pour sync (Phase 4) |
| `is_available` | BOOLEAN | DEFAULT TRUE | Disponible à la vente ? |
| `last_sync_at` | TIMESTAMP | — | Dernière synchronisation |

#### `screens` — Écrans

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PK | ID unique (ex: `SCR_GBC_FP_RP20`) |
| `handled_model` | VARCHAR(50) | NOT NULL | Modèle de console |
| `brand` | brand (ENUM) | NOT NULL | Marque |
| `name` | VARCHAR(100) | NOT NULL | Nom commercial |
| `price` | DOUBLE PRECISION | NOT NULL | Prix (€) |
| `size` | screen_size (ENUM) | NOT NULL | Taille (Standard/Large) |
| `assembly` | screen_assembly (ENUM) | NOT NULL | Type d'assemblage |

#### `screen_variants` — Variantes d'écrans

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PK | ID unique |
| `screen_id` | VARCHAR(50) | FK → screens(id) | Écran parent |
| `name` | VARCHAR(100) | NOT NULL | Nom de la variante |
| `supplement` | DOUBLE PRECISION | DEFAULT 0 | Supplément (€) |
| `image_url` | TEXT | NOT NULL | Image |

#### `lenses` — Vitres

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PK | ID unique |
| `name` | VARCHAR(100) | NOT NULL | Nom |
| `price` | DOUBLE PRECISION | NOT NULL | Prix (€) |
| `size` | screen_size (ENUM) | NOT NULL | Taille (doit matcher l'écran) |

#### `lens_variants` — Variantes de vitres

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PK | ID unique |
| `lens_id` | VARCHAR(50) | FK → lenses(id) | Vitre parente |
| `name` | VARCHAR(100) | NOT NULL | Nom |
| `supplement` | DOUBLE PRECISION | DEFAULT 0 | Supplément (€) |
| `image_url` | TEXT | NOT NULL | Image |

#### `shell_screen_compatibility` — Matrice de compatibilité

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `screen_id` | VARCHAR(50) | PK, FK → screens(id) | Écran |
| `shell_id` | VARCHAR(50) | PK, FK → shells(id) | Coque |
| `status` | compatibility_status (ENUM) | NOT NULL | `Yes` / `Cut` / `No` |

---

#### `users` — Utilisateurs

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PK | ID unique (préfixe `usr_`) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Adresse email |
| `password_hash` | TEXT | NOT NULL | Hash du mot de passe (Argon2) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date d'inscription |
| `last_login_at` | TIMESTAMP | — | Dernier login |

#### `user_configurations` — Deck (Sauvegardes)

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PK | ID unique (préfixe `cfg_`) |
| `user_id` | VARCHAR(50) | FK → users(id) | Propriétaire de la config |
| `name` | VARCHAR(100) | NOT NULL | Nom donné par l'utilisateur |
| `configuration` | JSONB | NOT NULL | Données techniques (IDs variantes) |
| `total_price` | DOUBLE PRECISION | — | Prix au moment de la sauvegarde |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Date de mise à jour |

> [!IMPORTANT]
> Une contrainte (Trigger) limite à **3** le nombre de configurations par utilisateur pour respecter les ressources du VPS CX11.

---

## 2. Diagramme de relations

```
shells ──1:N──► shell_variants
  │
  └──────────► shell_screen_compatibility ◄── screens
                                                │
                                                └──1:N──► screen_variants

lenses ──1:N──► lens_variants

users ──1:N──► user_configurations
```

**Relations clés :**
- Un `Shell` possède N `ShellVariant` (couleurs)
- Un `Screen` possède N `ScreenVariant` (options)
- Un `Lens` possède N `LensVariant` (options)
- La matrice `shell_screen_compatibility` est un **produit cartésien** Screen × Shell

---

## 3. Historique des migrations

| Migration | Description |
|---|---|
| `001_initial_schema.sql` | Création des types ENUM, tables principales, matrice de compatibilité |
| `002_seed_data.sql` | Insertion des données catalogue (coques, écrans, vitres, variantes, compatibilités) |
| `003_harmonize_schema.sql` | Ajout `is_transparent`, colonnes de sync Phase 4 (`source_url`, `is_available`, `last_sync_at`) |
| `004_packs.sql` | Table `packs` (configurations pré-définies) |
| `005_seed_packs.sql` | Données des packs |
| `006_fix_pack_names.sql` | Correction des noms de packs |
| `007_expert_mods.sql` | Table des mods expert |
| `008_seed_expert_mods.sql` | Données des mods expert |
| `009_auth_and_deck.sql` | Tables `users` et `user_configurations` avec trigger limite 3 configs et index |

---

## 4. Volumes de données actuels

| Table | Nombre d'entrées |
|---|---|
| Coques (shells) | ~10 |
| Variantes de coques | ~74 |
| Écrans (screens) | ~6 |
| Variantes d'écrans | ~16 |
| Vitres (lenses) | ~4 |
| Variantes de vitres | ~27 |
| Règles compatibilité | ~70 |

---

## 5. Convention de nommage des IDs

```
Produits :   {TYPE}_{CONSOLE}_{BRAND}           → SHELL_GBC_OEM
Variantes :  VAR_{TYPE}_{CONSOLE}_{BRAND}_{COLOR} → VAR_SHELL_GBC_OEM_GRAPE
Écrans :     SCR_{CONSOLE}_{BRAND}_{MODEL}      → SCR_GBC_FP_RP20
```

**Consoles supportées :** `GBC` (GameBoy Color) — À étendre : `DMG`, `GBP`, `GBA`, `GBASP`
