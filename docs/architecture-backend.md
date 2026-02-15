# 🏗️ Architecture — Backend (Rust/Axum)

> **Type :** API REST
> **Langage :** Rust (Edition 2021)
> **Framework :** Axum 0.7
> **Base de données :** PostgreSQL (SQLx 0.8)
> **Dernière mise à jour :** 2026-02-15 (Post-Epic 6)

---

## 1. Pattern architectural : 3-Tier

L'application suit une structure modulaire stricte :
- **src/api/** : Handlers HTTP, routage Axum, Middleware Auth.
- **src/logic/** : Cœur de calcul (`calculator.rs`), règles de compatibilité (`rules.rs`), logique d'authentification.
- **src/data/** : Accès PostgreSQL via `sqlx`, chargement du catalogue en mémoire (`Arc<Catalog>`).
- **src/models/** : Structs du domaine, Enums métier et constantes de prix.

---

## 2. Coeur du Système : `calculator.rs`

Le fichier `calculator.rs` est la pièce maîtresse (env. 1000 LOC), gérant les trois modes de calcul :
1. **Mode Pack (Starter Kits)** : Résolution d'un `pack_id` en composants individuels avec overrides possibles.
2. **Mode Manuel (Expert)** : Calcul granulaire basé sur les IDs de variantes fournis.
3. **Logic Kit-Centric (Boutons)** : Nouveau moteur calculant le supplément en fonction du nombre de couleurs uniques de boutons sélectionnées (5€ par kit).

### Algorithme de calcul Kit-Centric :
- Extraction des variantes de boutons du corps de la requête.
- Filtrage des options "OEM" (gratuites).
- Comptage des identifiants de variantes uniques restants.
- Ajout d'une ligne de devis "Boutons personnalisés" au total.

---

## 3. Structure du Catalogue (In-Memory)

Le catalogue est chargé au démarrage dans un `Arc<Catalog>` pour des performances optimales sans accès DB répétés lors des calculs de devis.

```rust
pub struct Catalog {
    pub shells: Vec<Shell>,
    pub shell_variants: Vec<ShellVariant>,
    pub screens: Vec<Screen>,
    pub screen_variants: Vec<ScreenVariant>,
    pub lenses: Vec<Lens>,
    pub lens_variants: Vec<LensVariant>,
    pub packs: Vec<Pack>,
    pub expert_mods: Vec<ExpertMod>,
    pub buttons: Vec<ButtonCategory>,
    pub button_variants: Vec<ButtonVariant>,
    pub compatibility_matrix: HashMap<(String, String), CompatibilityStatus>,
}
```

---

## 4. Persistance & Sécurité

### Authentification & Deck
- **Middleware Auth** : Intercepte les cookies `auth_token`, vérifie le JWT et injecte l'`UserId` dans les handlers.
- **Deck Manager** : CRUD sur la table `user_configurations`. Une contrainte logicielle (via trigger SQL) limite chaque utilisateur à 3 configurations sauvegardées.
- **Quote Submissions** : Persistance des configurations finales "Ready for Build" après le passage par le **Signature Showcase**.

### Multi-Console
Le backend est agnostique au modèle ; il filtre dynamiquement le catalogue via le paramètre `console_id` ou déduit le modèle à partir de l'`handled_model` de la coque choisie.

---

## 5. Stratégie de Test

La suite de tests backend (`api/` integration tests) couvre :
- **Calcul de prix** : Packs, Expert mods, Kit-centric buttons.
- **Compatibilité** : Rejet des écrans/coques incompatibles (ex: GBC shell avec GBA screen).
- **Sécurité** : Protection des endpoints `/deck` et `/quote/submit`.
- **Intégrité** : Rollback des transactions DB lors des tests d'intégration.
