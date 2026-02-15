# 🔗 API Contracts — Backend REST

> **Base URL :** `http://localhost:3000`
> **Format :** JSON
> **Dernière mise à jour :** 2026-02-15 (Post-Epic 6)

---

## Catalogue & Prix

### 1. `GET /catalog/packs` — Starter Kits
Retourne les packs configurés en base de données (ex: Budget Gamer, Purist).

### 2. `GET /catalog/buttons/:console_id` — Boutons Granulaires
**Description :** Retourne la liste des boutons personnalisables pour un modèle spécifique.
- **Paramètre :** `gbc`, `dmg`, `gba`, `gba_sp`.
- **Réponse (200) :**
```json
{
  "console_id": "gbc",
  "buttons": [
    { "id": "d_pad", "name": "D-Pad", "variants": [...] },
    { "id": "button_a", "name": "Bouton A", "variants": [...] }
  ]
}
```

### 3. `POST /quote` — Calculer un devis
**Description :** Calcule le prix total, gère la logique "Kit-Centric" pour les boutons.
- **Logique Kit-Centric :** Chaque groupe de couleur unique de bouton (hors "OEM") ajoute 5€ au total.
- **Corps (Extraits) :**
```json
{
  "pack_id": "PACK_...", 
  "shell_variant_id": "VAR_...",
  "selected_buttons": {
    "d_pad": "VAR_BUT_BLUE",
    "button_a": "VAR_BUT_BLUE",
    "button_b": "VAR_BUT_RED"
  }
}
```
*Ici, "BLUE" et "RED" constituent 2 kits, donc +10€.*

---

## Authentification & Compte

### 4. `POST /auth/register` / `/login`
Inscrit ou connecte l'utilisateur. Retourne un cookie `auth_token` (HttpOnly, Secure, SameSite=Lax).

### 5. `GET /auth/me`
Vérifie l'état de connexion et retourne l'utilisateur.

---

## Deck Manager (🔐 Connexion requise)

### 6. `GET /deck`
Liste les 3 configurations max sauvegardées.

### 7. `POST /deck`
Ajoute ou met à jour une carte du deck.

### 8. `DELETE /deck/:id`
Supprime une configuration spécifique.

---

## Validation & Commande (🔐 Connexion requise)

### 9. `POST /quote/submit` — Validation Finale
**Description :** Action finale déclenchée depuis le mode "Signature".
- **Action :** Sauvegarde la configuration en base avec le statut `ready_for_build`.
- **Réponse :** `{ "success": true, "submission_id": "..." }`

---

## Assets Statiques

### 10. `GET /assets/images/{category}/{filename}.jpg`
Sert les images du catalogue.
- **Catégories :** `shells`, `screens`, `lenses`, `buttons`.
- **Note :** Les boutons sont servies en `.jpg` (identique aux autres catégories).
