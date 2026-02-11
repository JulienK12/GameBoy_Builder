# 🔗 API Contracts — Backend REST

> **Base URL :** `http://localhost:3000`
> **Format :** JSON
> **Framework :** Axum 0.7 (Rust)

---

## Endpoints

## Endpoints

### 1. `GET /health` — Health Check

**Description :** Vérifie que le serveur est opérationnel.

**Réponse (200) :**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

---

### 2. `GET /catalog/packs` — Liste des Starter Kits

**Description :** Retourne la liste dynamique des packs de démarrage disponibles (Data-Driven).

**Réponse (200) :**
```json
{
  "packs": [
    {
      "id": "PACK_BUDGET_01",
      "name": "Budget Gamer",
      "description": "Une console modée à petit prix, parfaite pour débuter.",
      "image_url": "/images/packs/PACK_BUDGET_01.jpg",
      "base_price": 89.0,
      "components": {
        "shell_variant_id": "VAR_SHELL_GBC_OEM_GRAPE",
        "screen_variant_id": "VAR_SCR_GBC_OEM_STD",
        "lens_variant_id": "VAR_LENS_GBC_STD_CLEAR"
      }
    }
  ]
}
```

---

### 3. `GET /catalog/shells` — Liste des coques

**Description :** Retourne toutes les coques, leurs variantes et la matrice de compatibilité coque/écran.

---

### 4. `GET /catalog/screens` — Liste des écrans

---

### 5. `GET /catalog/lenses` — Liste des vitres

---

### 6. `POST /quote` — Calculer un devis (Support Packs & Deck)

**Description :** Calcule un devis basé sur les variantes, un pack, ou plusieurs configurations.

**Requête (Simple) :**
```json
{
  "shell_variant_id": "VAR_SHELL_GBC_FP_ATOMIC_PURPLE",
  "screen_variant_id": "VAR_SCR_GBC_FP_RP20_BLACK",
  "lens_variant_id": null
}
```

**Requête (Pack) :**
```json
{
  "pack_id": "PACK_BUDGET_01",
  "overrides": {
    "shell_variant_id": "VAR_SHELL_GBC_FP_ATOMIC_PURPLE"
  }
}
```

**Réponse succès (200) :**
```json
{
  "success": true,
  "quotes": [
    {
      "items": [
        { "label": "FP Shell", "detail": "Atomic Purple", "price": 25.0, "item_type": "Part" },
        { "label": "Installation Écran", "detail": null, "price": 20.0, "item_type": "Service" }
      ],
      "total_price": 110.0,
      "warnings": []
    }
  ],
  "grand_total": 110.0,
  "error": null
}
```

---

### 7. `POST /auth/register` — Inscription

**Description :** Crée un compte utilisateur. JWT via cookie `HttpOnly`.

---

### 8. `POST /auth/login` — Connexion

---

### 9. `POST /auth/logout` — Déconnexion

---

### 10. `GET /deck` — Lire le Deck (🔐 Auth requise)

**Description :** Retourne les configurations sauvegardées de l'utilisateur (max 3).

---

### 11. `POST /deck` — Sauvegarder dans le Deck (🔐 Auth requise)

---

### 12. `DELETE /deck/:id` — Supprimer du Deck (🔐 Auth requise)

---

### 13. `POST /quote/submit` — Envoyer pour assemblage (🔐 Auth requise)

**Description :** Valide une configuration finale (Mode Signature) et l'envoie au moddeur.

---

## Synthèse des Accès (RBAC)

| Endpoint | Méthode | Authentification | Rôle |
|---|---|---|---|
| `/catalog/*` | GET | Optionnelle | Invité |
| `/quote` | POST | Optionnelle | Invité |
| `/auth/*` | POST | Non requise | Invité |
| `/deck/*` | ALL | **Requise** | Utilisateur |
| `/quote/submit`| POST | **Requise** | Utilisateur |

---

### 6. `GET /assets/images/{category}/{variant_id}.jpg` — Images statiques

**Description :** Sert les images produit statiques.

**Catégories :** `shells`, `screens`, `lenses`

**Exemple :** `GET /assets/images/shells/VAR_SHELL_GBC_OEM_GRAPE.jpg`
