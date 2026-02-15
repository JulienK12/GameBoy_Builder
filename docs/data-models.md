# 🗄️ Modèles de données — PostgreSQL

> **Base de données :** `gameboy_configurator`
> **ORM :** SQLx 0.8 (Rust)
> **Dernière mise à jour :** 2026-02-15

---

## 1. Schéma de la base de données

### Tables de Configuration de Base
- `shells` / `shell_variants` : Coques et leurs couleurs.
- `screens` / `screen_variants` : Écrans et kits IPS.
- `lenses` / `lens_variants` : Vitres de protection.
- `shell_screen_compatibility` : Matrice de compatibilité (Yes/Cut/No).
- `packs` : Configurations "Starter Kit" pré-définies.
- `expert_mods` : Modifications techniques avancées (CPU, Audio, Power).

### Tables de Personnalisation (Epic 6)
#### `buttons` — Catégories de boutons par console
Identifie quels boutons sont personnalisables pour chaque modèle (D-Pad, A/B, SELECT, etc.).

#### `button_variants` — Couleurs de boutons
Contient les options de couleurs (OEM, CGS Blue, etc.) avec leur `supplement` de prix (généralement 0€ car le prix est calculé par "kit" dans le backend).

### Tables Utilisateur & Persistance (Epic 3 & 4)
#### `users`
Stockage des comptes (Email, Argon2 Password Hash).

#### `user_configurations` — Le "Deck"
Configurations sauvegardées (JSONB) avec une limite stricte de 3 par utilisateur.

#### `quote_submissions`
Historique des configurations envoyées pour assemblage (statut `ready_for_build`).

---

## 2. Historique des migrations

| Migration | Description |
|---|---|
| `001` - `003` | Schéma initial, seed GBC et harmonisation (is_transparent). |
| `004` - `006` | Système de Packs (Starter Kits) et seed. |
| `007` - `008` | Système Expert Mods et données. |
| `009` | **Auth & Deck** : Tables `users` et `user_configurations`. |
| `010` | **Quote Submissions** : Table pour la validation finale. |
| `011` - `012` | **Buttons Base** : Tables et données initiales pour GBC. |
| `013` | **Refine Granularity** : Seed complet des boutons pour **DMG, GBA, SP**. |
| `014` | **Fix Images** : Correction des URL images boutons (.jpg). |

---

## 3. Convention de nommage des IDs

- **Produit :** `{TYPE}_{CONSOLE}_{BRAND}` (ex: `SHELL_GBC_OEM`)
- **Variante :** `VAR_{TYPE}_{CONSOLE}_{BRAND}_{COLOR}` (ex: `VAR_BUT_GBA_CGS_EMERALD`)
- **Soumission :** UUID v4
- **Utilisateur :** `usr_` + NanoID/UUID
- **Configuration :** `cfg_` + NanoID/UUID

---

## 4. Statistiques du Catalogue

- **Modèles supportés :** GBC, DMG, GBA, GBA SP.
- **Variantes de coques :** ~74
- **Options de boutons :** Support granulaire complet pour les 4 modèles.
- **Logique de prix :** Kit-Centric (+5€ par kit de couleur unique).
