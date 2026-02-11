---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['PRD.md', 'docs/architecture-backend.md', 'docs/architecture-frontend.md', '_bmad-output/planning-artifacts/ux-design-specification.md']
---

# gameboy_builder - Découpage en Epics

## Présentation

Ce document présente le découpage complet en epics et stories pour gameboy_builder, décomposant les exigences du PRD, de la spécification UX et de l'architecture technique en tâches implémentables.

## Inventaire des Exigences

### Exigences Fonctionnelles

FR1: Proposer 3 profils types ("Starter Kits") pour un démarrage instantané (Budget, Performance, Purist).
FR2: Implémenter un Toggle "Expert Mode" pour basculer entre la configuration simplifiée et la personnalisation totale.
FR3: Assurer la persistance du pack sélectionné lors de l'activation du mode Expert.
FR4: Gérer un "Deck" (multi-console) permettant de visualiser plusieurs configurations sous forme de cartes.
FR5: Sauvegarder le panier via localStorage pour les invités.
FR6: Synchroniser le panier via PostgreSQL pour les utilisateurs connectés.
FR7: Mettre à jour les prix et valider les compatibilités via le backend (Rust) en tant que Single Source of Truth.
FR8: Implémenter des Optimistic Updates côté frontend avec rollback en cas d'erreur API.
FR9: Navigation via un double-portail HUD (Packs vs Atelier Libre).
FR10: Présentation "Signature" (Photo Statutaire) pour la validation finale.
FR11: Authentification simple (email/password) pour la synchronisation cloud du Deck.

### Exigences Non-Fonctionnelles

NFR1: Esthétique Cyberpunk haute-lisibilité (Fond noir/bleu nuit, accents Néon Orange/Violet/Émeraude).
NFR2: Ratio de contraste WCAG AA impératif pour l'accessibilité.
NFR3: Utilisation de modèles 3D compressés Draco pour une fluidité totale sur mobile.
NFR4: Performance : Découpe du catalogue en mémoire via Arc<Catalog> sans blocage.
NFR5: Sécurité : Isolation des règles métier dans logic/rules.rs.
NFR6: Responsive : Design "Touch-First" pour mobile.

### Exigences Additionnelles

- **Backend / Rust (Axum)**:
  - Nouveau schéma DB pour supporter le type de donnée "Deck".
  - Extension des endpoints `/quote` pour supporter les configurations multiples (`Vec<QuoteRequest>`).
  - Implémentation du module `logic/rules.rs` pour les dépendances complexes (ex: CleanAmp Pro nécessite batterie 1700mAh).
- **Frontend / Vue 3 (Pinia)**:
  - Nouveau store `deck` pour la persistance multiple.
  - Intégration de `pinia-plugin-persistedstate`.
  - Nouveaux composants : `LandingPortal.vue`, `ExpertSidebar.vue`, `SignatureShowcase.vue`.
  - UX Pattern "Airy Cyberpunk" : augmentation des marges (`p-8`, `gap-8`).

### Plan de Couverture des FR

FR1: Epic 1 - Sélection de Starter Kits.
FR2: Epic 2 - Toggle Expert Mode.
FR3: Epic 2 - Persistance de l'état lors du switch mode.
FR4: Epic 3 - Gestionnaire de Deck (Multi-console).
FR5: Epic 3 - Sauvegarde localStorage (Invité).
FR6: Epic 3 - Synchronisation DB (Auth).
FR7: Epic 1 - Validation Backend (Price & Compat).
FR8: Epic 2 - Optimistic Updates frontend.
FR9: Epic 1 - Landing Portal HUD.
FR10: Epic 4 - Showcase Signature (Validation).
FR11: Epic 3 - Authentification simple (Story 3.0).

## Liste des Epics

### Epic 1: "L'Atelier de Base" - Starter Kits & Moteur de Prix
Permettre aux utilisateurs de commencer instantanément via des Packs thématiques et de voir un récapitulatif technique validé par le backend. L'approche est pilotée par les données (Data-Driven) pour permettre une évolution future du contenu des packs sans changement de code.
**FR couverts:** FR1, FR7, FR9.

### Epic 2: "Le Mode Expert" - Personnalisation Avancée & Immersion
Offrir à l'utilisateur passionné (Expert User) un contrôle total sur chaque composant technique avec une interface HUD dense et des interactions fluides.
**FR couverts:** FR2, FR3, FR8.

### Epic 3: "Le Gestionnaire de Deck" - Persistance & Multi-Console
Permettre de gérer plusieurs projets simultanément (max 3) et de les retrouver sur différents appareils/sessions.
**FR couverts:** FR4, FR5, FR6.

### Epic 4: "L'Expérience Signature" - Showcase & Validation Finale
Transformer l'acte de validation en un moment de célébration visuelle haute-fidélité.
**FR couverts:** FR10.

---

## Epic 1: "L'Atelier de Base" - Starter Kits & Moteur de Prix

### Story 1.1: Système de Portail Dynamique
En tant que Visiteur,
Je veux arriver sur un portail HUD pour choisir entre un "Starter Kit" ou l'"Atelier Libre",
Afin de commencer mon parcours de création selon le niveau de guidage souhaité.

**Critères d'Acceptation:**
**Étant donné** une configuration non initialisée
**Quand** l'application charge
**Alors** le composant "Landing Portal" est affiché avec deux cartes "Notched" principales
**Et** l'option "Starter Kits" récupère la liste actuelle des packs via l'API
**Et** la sélection d'une option redirige l'utilisateur vers l'espace de travail approprié.

### Story 1.2: Logique de "Bundle" Backend & Tarification
En tant que Développeur Backend,
Je veux un endpoint d'API capable de résoudre un ID de Pack et de calculer son prix dynamique,
Afin que le frontend ne contienne aucune donnée produit codée en dur.

**Critères d'Acceptation:**
**Étant donné** une `QuoteRequest` avec un `pack_id`
**Quand** j'appelle l'endpoint `POST /quote`
**Alors** le système résout le pack en ses IDs de composants individuels (coque, écran, vitre, etc.)
**Et** le moteur de prix calcule le total avec les prix actuels du catalogue
**Et** la réponse inclut la liste complète des articles et les éventuels avertissements de compatibilité.

### Story 1.3: Mise en page HUD "Airy" & Récapitulatif de Sélection
En tant que Créateur,
Je veux un résumé clair et aéré de ma sélection actuelle,
Afin de pouvoir valider ma configuration sans surcharge cognitive.

**Critères d'Acceptation:**
**Étant donné** une configuration en cours
**Quand** je consulte le panneau "Selection Recap"
**Alors** la mise en page suit les directives "Airy Cyberpunk" (gap-8, marges généreuses)
**Et** chaque article sélectionné est affiché avec son aperçu visuel et son prix
**Et** toute mise à jour dans le store déclenche un rafraîchissement fluide de la liste.

---

## Epic 2: "Le Mode Expert" - Personnalisation Avancée & Immersion

### Story 2.1: Le Toggle "Mode Expert" (État & UI)
En tant qu'Utilisateur Expert,
Je veux pouvoir activer le "Mode Expert" pour accéder aux composants haut de gamme sans perdre ma configuration basée sur un pack,
Afin de peaufiner mon projet avec une précision chirurgicale.

**Critères d'Acceptation:**
**Étant donné** une configuration en cours
**Quand** l'utilisateur actionne l'interrupteur Expert du HUD
**Alors** l'état global `isExpertMode` est mis à jour
**Et** le composant `ExpertSidebar` est révélé
**Et** toutes les sélections actuelles sont préservées et affichées dans les filtres avancés.

### Story 2.2: La Sidebar Technique HUD
En tant qu'Utilisateur Expert, Je veux une barre latérale technique regroupant les mods avancés (CPU, Audio, Alimentation),
Afin de spécifier exactement quels composants internes je souhaite que le moddeur installe.

**Critères d'Acceptation:**
**Étant donné** que le Mode Expert est actif
**Quand** je parcours la catégorie "Mods"
**Alors** l'UI affiche les paramètres techniques et les exigences d'alimentation
**Et** chaque option dispose d'une "Data-Tooltip" expliquant son impact sur les performances finales et le processus du moddeur.

### Story 2.3: Logique Optimiste & Feedback Technique
En tant qu'Utilisateur,
Je veux que l'UI réagisse instantanément à mes choix techniques tout en les validant avec le contrôle de mission backend,
Afin que l'expérience ressemble à un HUD fluide plutôt qu'à un formulaire web lent.

**Critères d'Acceptation:**
**Étant donné** une sélection technique (ex: CleanAmp Pro)
**Quand** elle est sélectionnée dans la Sidebar Expert
**Alors** la sélection est appliquée immédiatement au store frontend (Mise à jour optimiste)
**Et** le backend valide la compatibilité (ex: nécessite une batterie 1700mAh) de manière asynchrone
**Et** si une erreur survient, un effet de "Glitch" est affiché et l'état revient à la dernière configuration valide.

---

## Epic 3: "Le Gestionnaire de Deck" - Persistance & Multi-Console

### Story 3.0: Authentification Simple (Email/Password)
En tant que Visiteur,
Je veux pouvoir créer un compte et me connecter avec un email et un mot de passe,
Afin de pouvoir retrouver mes configurations sur plusieurs appareils.

**Critères d'Acceptation:**
**Étant donné** un visiteur non authentifié
**Quand** il accède au formulaire d'inscription
**Alors** il peut créer un compte avec email + mot de passe (hashé Argon2 côté Rust)
**Et** il reçoit un JWT stocké dans un cookie HttpOnly/Secure
**Et** les endpoints protégés vérifient le JWT via un middleware Axum
**Et** les tables `users` et `user_configurations` sont créées via la migration `009_auth_and_deck.sql`.

### Story 3.1: L'UI du "Deck" (Multi-Cartes)
En tant que Créateur,
Je veux voir toutes mes configurations en cours sous forme de cartes dans un gestionnaire dédié,
Afin de pouvoir comparer différents projets avant de commander.

**Critères d'Acceptation:**
**Étant donné** plusieurs configurations dans le store
**Quand** je consulte le "Deck Manager"
**Alors** chaque configuration est affichée sous forme de carte avec une image d'aperçu, un nom et un prix total
**Et** le système empêche de créer plus de 3 configurations par utilisateur
**Et** l'utilisateur peut supprimer une configuration pour libérer un emplacement.

### Story 3.2: Persistance Locale & Logique de Synchronisation
En tant qu'Utilisateur,
Je veux que mon deck soit sauvegardé même si je ferme mon navigateur,
Afin de ne pas perdre ma progression créative.

**Prérequis technique :** Dépendance `pinia-plugin-persistedstate` installée dans le projet.

**Critères d'Acceptation:**
**Étant donné** un deck avec 1 à 3 configurations
**Quand** le navigateur est fermé et rouvert
**Alors** le plugin `pinia-plugin-persistedstate` récupère les données du `localStorage`
**Et** l'UI restaure précisément l'état de chaque carte dans le deck.

### Story 3.3: Synchronisation Cloud & Optimisation VPS CX11
En tant qu'Utilisateur Authentifié,
Je veux que mon deck soit synchronisé avec la base de données,
Afin de pouvoir accéder à mes projets depuis n'importe quel appareil.

**Critères d'Acceptation:**
**Étant donné** un utilisateur connecté
**Quand** le deck est modifié
**Alors** les changements sont synchronisés vers la base PostgreSQL via les endpoints CRUD Rust
**Et** le backend applique la "Limite Stricte de 3" configurations par ID utilisateur pour garder une taille de base de données minimale
**Et** les données sont stockées dans un format JSONB optimisé pour les performances sur un VPS d'entrée de gamme.

---

## Epic 4: "L'Expérience Signature" - Showcase & Validation Finale

### Story 4.1: Le Moment "Signature" (Focus Reveal)
En tant qu'Utilisateur,
Je veux une révélation visuelle spectaculaire de ma configuration finale avant validation,
Afin de ressentir la satisfaction d'avoir créé un objet unique.

**Critères d'Acceptation:**
**Étant donné** une configuration complète et validée
**Quand** je clique sur "Finaliser"
**Alors** l'UI passe en mode "Signature Showcase" (plein écran)
**Et** la console est présentée avec un éclairage dramatique et des particules (style Photo Statutaire)
**Et** la fiche technique "SignatureCard" résume la création avec son numéro de série et ses caractéristiques clés.

### Story 4.2: Validation & Transition Panier
En tant qu'Utilisateur,
Je veux confirmer ma création pour la préparation de l'assemblage,
Afin de passer à l'étape finale de la commande.

**Critères d'Acceptation:**
**Étant donné** que le Signature Showcase est actif
**Quand** l'utilisateur clique sur "Confirmer la Création"
**Alors** le système vérifie si l'utilisateur est authentifié
**Et** si non, affiche la modale d'authentification (Login/Register)
**Et** une fois authentifié, le statut de la configuration passe à "Ready for Build"
**Et** une demande de devis officielle est créée via `POST /quote/submit`
**Et** l'utilisateur est redirigé vers le récapitulatif final du panier.
