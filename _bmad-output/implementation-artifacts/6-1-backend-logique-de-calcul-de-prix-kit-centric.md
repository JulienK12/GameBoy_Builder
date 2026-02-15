# Story 6.1: Backend - Logique de calcul de prix "Kit-Centric"

Status: ready-for-dev

## Story

**En tant que** Développeur Backend,
**Je veux** que le moteur de prix calcule le supplément pour les boutons en fonction du nombre de kits de couleurs uniques utilisés,
**Afin de** refléter le coût réel des pièces détachées et d'assurer une tarification équitable.

## Acceptance Criteria (BDD)

1. **Étant donné** une `QuoteRequest` avec l'objet `selected_buttons` (Map des types de boutons vers IDs de variantes),
   **Quand** le calcul du devis est lancé,
   **Alors** le système identifie le nombre de couleurs uniques en ignorant les valeurs "OEM" et les IDs inexistants.

2. **Étant donné** le nombre de couleurs uniques identifié,
   **Quand** le prix est calculé,
   **Alors** le système ajoute un montant de `5.0 * nombre_de_kits` au devis final.
   *(Exemple : Bouton A=Rouge, Bouton B=Bleu -> +10€ | Bouton A=Rouge, Bouton B=Rouge -> +5€).*

3. **Étant donné** une configuration hybride (`button_variant_id` ET `selected_buttons`),
   **Alors** `selected_buttons` (granulaire) prévaut sur `button_variant_id` pour éviter les doubles facturations.

4. **Étant donné** une configuration de boutons,
   **Quand** la requête est traitée,
   **Alors** le système valide que chaque type de bouton (clés de l'objet) existe pour le modèle de console spécifié dans le catalogue.

## Tasks / Subtasks

### Backend (Rust/Axum)

- [x] **Task 1 — Mise à jour des modèles des contrats API**
  - [x] 1.1 — Modifier `QuoteRequest` dans `src/api/handlers.rs` pour inclure `selected_buttons: Option<HashMap<String, String>>`.
  - [x] 1.2 — S'assurer que le struct `QuoteResponse` reste compatible avec les versions précédentes.

- [x] **Task 2 — Implémentation de la Logique Kit-Centric**
  - [x] 2.1 — Mettre à jour la signature de `calculate_quote` dans `src/logic/calculator.rs`.
  - [x] 2.2 — Utiliser `std::collections::HashSet` pour dédoublonner les variantes de couleurs.
  - [x] 2.3 — **Important** : Ignorer les variantes contenant "OEM" dans leur ID.
  - [x] 2.4 — Ajouter le `LineItem` de type "Part" avec le total calculé (5€ par kit unique).

- [x] **Task 3 — Validation et Tests de Régression**
  - [x] 3.1 — Ajouter des tests unitaires dans `src/logic/calculator.rs` couvrant :
    - 0 kits custom (Tout OEM) -> +0€
    - 1 kit custom utilisé sur plusieurs boutons -> +5€
    - 2 kits custom différents -> +10€
  - [x] 3.2 — Vérifier que `selected_buttons` ignore les entrées invalides avec un `warning` ou une erreur 400 selon la politique du projet.

## Developer Guardrails & Context

- **File Path Correction** : Toute la logique de prix se trouve dans `src/logic/calculator.rs`. Ne pas créer de nouveau fichier `pricing.rs`.
- **Architecture Compliance** : Utiliser l'instance `Catalog` injectée via l'état Axum pour valider les IDs de variantes.
- **Code Patterns** : Suivre le pattern `LineItem` existant avec `item_type: "Part"`.
- **Zero Ambiguity** : Le calcul est basé sur l'ID de la variante. Si deux boutons utilisent la même variante custom, c'est **UN SEUL** kit (+5€).
