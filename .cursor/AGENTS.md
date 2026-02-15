# BMAD Agents & Workflows

Ce fichier liste tous les agents et workflows BMAD disponibles pour ce projet.

---

## ⌨️ Commandes Cursor (`.cursor/commands/`)

Les commandes ci-dessous sont celles réellement présentes dans l'espace de travail. Dans Cursor : **Cmd/Ctrl+Shift+P** → "Run Command" puis le nom, ou tapez `/` + nom dans le chat.

### Commandes Agents (personas)

| Commande Cursor | Description |
|-----------------|-------------|
| **`bmad-master`** | Agent Master BMAD pour la supervision globale |
| **`analyst`** | Agent Analyste pour l'analyse de projet |
| **`architect`** | Agent Architecte pour la conception système |
| **`dev`** | Agent Développeur pour l'implémentation |
| **`pm`** | Agent Product Manager pour la gestion produit |
| **`sm`** | Agent Scrum Master pour la gestion de sprint |
| **`ux-designer`** | Agent UX Designer pour le design utilisateur |
| **`tech-writer`** | Agent Technical Writer pour la documentation |
| **`qa`** | Agent QA pour les tests et la qualité |
| **`quick-flow-solo-dev`** | Agent Solo Dev pour développement rapide |
| **`agent-builder`** | Builder pour créer de nouveaux agents |
| **`module-builder`** | Builder pour créer de nouveaux modules |
| **`workflow-builder`** | Builder pour créer de nouveaux workflows |

### Commandes Workflows BMM (Brownfield Method)

| Commande Cursor | Description |
|-----------------|-------------|
| **`document-project`** | Documenter un projet brownfield existant |
| **`generate-project-context`** | Générer le contexte du projet (project-context.md) |
| **`brainstorming`** | Session de brainstorming avec techniques créatives |
| **`technical-research`** | Recherche technique (technos, architecture, implémentation) |
| **`domain-research`** | Recherche domaine (secteur, réglementation, écosystème) |
| **`market-research`** | Recherche marché (taille, concurrence, clients) |
| **`create-product-brief`** | Créer un brief produit |
| **`create-prd`** | Créer un PRD (Product Requirements Document) |
| **`edit-prd`** | Éditer / améliorer un PRD existant |
| **`validate-prd`** | Valider un PRD selon les standards BMAD |
| **`create-ux-design`** | Créer la spécification UX avec un pair UX |
| **`create-architecture`** | Facilitation des décisions d'architecture |
| **`create-epics-and-stories`** | Transformer PRD + Architecture en epics et stories |
| **`check-implementation-readiness`** | Vérifier la préparation avant implémentation |
| **`sprint-planning`** | Planifier le sprint et le fichier de suivi |
| **`sprint-status`** | Résumer le statut du sprint et orienter |
| **`create-story`** | Créer la prochaine user story à partir des epics |
| **`dev-story`** | Implémenter une story (tâches, tests, critères d'acceptation) |
| **`code-review`** | Review de code adversarial (qualité, tests, architecture) |
| **`correct-course`** | Gérer les changements importants en cours de sprint |
| **`retrospective`** | Rétrospective après complétion d'une epic |
| **`quick-spec`** | Spécification conversationnelle (tech-spec prête à implémenter) |
| **`quick-dev`** | Développement flexible (tech-spec ou instructions directes) |
| **`qa-automate`** | Générer des tests pour des fonctionnalités existantes |

### Commandes Workflows BMB (BMAD Builder)

| Commande Cursor | Description |
|-----------------|-------------|
| **`create-agent`** | Créer un nouvel agent BMAD |
| **`edit-agent`** | Éditer un agent existant en restant conforme |
| **`validate-agent`** | Valider un agent et proposer des améliorations |
| **`create-workflow`** | Créer un nouveau workflow BMAD |
| **`edit-workflow`** | Éditer un workflow existant |
| **`rework-workflow`** | Rework d'un workflow vers une version V6 conforme |
| **`validate-workflow`** | Valider un workflow contre les bonnes pratiques |
| **`validate-max-parallel-workflow`** | Valider en mode MAX-PARALLEL (sous-processus) |
| **`create-module-brief`** | Créer un brief produit pour un module |
| **`create-module`** | Créer un module BMAD complet |
| **`edit-module`** | Éditer un module existant |
| **`validate-module`** | Valider un module contre les bonnes pratiques |

### Commandes Core / Utilitaires

| Commande Cursor | Description |
|-----------------|-------------|
| **`workflow`** | Exécuter un workflow donné (config + instructions) |
| **`party-mode`** | Discussions multi-agents entre tous les agents BMAD installés |
| **`help`** | Aide : prochaines étapes du workflow ou réponses aux questions |
| **`shard-doc`** | Découper un gros document markdown en fichiers par sections (niveau 2 par défaut) |
| **`index-docs`** | Générer ou mettre à jour un index.md d'un répertoire |
| **`review-adversarial-general`** | Review cynique du contenu et production de findings |
| **`editorial-review-prose`** | Review rédactionnelle (clarté, communication) |
| **`editorial-review-structure`** | Review structurelle (coupures, réorganisation, simplification) |

---

## 🤖 Agents BMAD (référence logique)

### Agents BMM (Brownfield Method)

- **`/bmad:bmm:agents:analyst`** - Agent Analyste pour l'analyse de projet
- **`/bmad:bmm:agents:architect`** - Agent Architecte pour la conception système
- **`/bmad:bmm:agents:dev`** - Agent Développeur pour l'implémentation
- **`/bmad:bmm:agents:pm`** - Agent Product Manager pour la gestion produit
- **`/bmad:bmm:agents:sm`** - Agent Scrum Master pour la gestion de sprint
- **`/bmad:bmm:agents:ux-designer`** - Agent UX Designer pour le design utilisateur
- **`/bmad:bmm:agents:tech-writer`** - Agent Technical Writer pour la documentation
- **`/bmad:bmm:agents:qa`** - Agent QA pour les tests
- **`/bmad:bmm:agents:quick-flow-solo-dev`** - Agent Solo Dev pour développement rapide

### Agents Core

- **`/bmad:core:agents:bmad-master`** - Agent Master BMAD pour la supervision globale

### Agents BMB (BMAD Builder)

- **`/bmad:bmb:agents:agent-builder`** - Builder pour créer de nouveaux agents
- **`/bmad:bmb:agents:module-builder`** - Builder pour créer de nouveaux modules
- **`/bmad:bmb:agents:workflow-builder`** - Builder pour créer de nouveaux workflows

---

## 📋 Workflows BMAD

### Phase 0 - Documentation

- **`/bmad:bmm:workflows:document-project`** - Documenter un projet brownfield existant
- **`/bmad:bmm:workflows:generate-project-context`** - Générer le contexte du projet

### Phase 1 - Analysis

- **`/bmad:core:workflows:brainstorming`** - Session de brainstorming
- **`/bmad:bmm:workflows:research`** - Recherche technique
- **`/bmad:bmm:workflows:create-product-brief`** - Créer un brief produit

### Phase 2 - Planning

- **`/bmad:bmm:workflows:prd`** - Créer/Valider/Éditer un PRD (Product Requirements Document)
- **`/bmad:bmm:workflows:create-ux-design`** - Créer la spécification UX

### Phase 3 - Solutioning

- **`/bmad:bmm:workflows:create-architecture`** - Créer l'architecture système
- **`/bmad:bmm:workflows:create-epics-and-stories`** - Créer les epics et stories
- **`/bmad:bmm:workflows:check-implementation-readiness`** - Vérifier la préparation à l'implémentation

### Phase 4 - Implementation

- **`/bmad:bmm:workflows:sprint-planning`** - Planification de sprint
- **`/bmad:bmm:workflows:sprint-status`** - Statut du sprint
- **`/bmad:bmm:workflows:create-story`** - Créer une story
- **`/bmad:bmm:workflows:dev-story`** - Développer une story (implémentation complète)
- **`/bmad:bmm:workflows:code-review`** - Review de code
- **`/bmad:bmm:workflows:correct-course`** - Corriger la trajectoire
- **`/bmad:bmm:workflows:retrospective`** - Rétrospective de sprint

### Workflows TestArch (Architecture de Tests)

- **`/bmad:bmm:workflows:testarch:framework`** - Framework de tests
- **`/bmad:bmm:workflows:testarch:test-design`** - Design de tests
- **`/bmad:bmm:workflows:testarch:atdd`** - ATDD (Acceptance Test Driven Development)
- **`/bmad:bmm:workflows:testarch:automate`** - Automatisation des tests
- **`/bmad:bmm:workflows:testarch:trace`** - Traçabilité des tests
- **`/bmad:bmm:workflows:testarch:test-review`** - Review des tests
- **`/bmad:bmm:workflows:testarch:nfr`** - Tests NFR (Non-Functional Requirements)
- **`/bmad:bmm:workflows:testarch:ci`** - Intégration CI/CD pour les tests

### Workflows Excalidraw (Diagrammes)

- **`/bmad:bmm:workflows:create-excalidraw-diagram`** - Créer un diagramme Excalidraw
- **`/bmad:bmm:workflows:create-excalidraw-wireframe`** - Créer un wireframe Excalidraw
- **`/bmad:bmm:workflows:create-excalidraw-flowchart`** - Créer un flowchart Excalidraw
- **`/bmad:bmm:workflows:create-excalidraw-dataflow`** - Créer un diagramme de flux de données

### Workflows Quick Flow

- **`/bmad:bmm:workflows:quick-spec`** - Spécification rapide
- **`/bmad:bmm:workflows:quick-dev`** - Développement rapide

### Workflows de Gestion

- **`/bmad:bmm:workflows:workflow-init`** - Initialiser un nouveau workflow BMAD
- **`/bmad:bmm:workflows:workflow-status`** - Vérifier le statut du workflow actuel

### Workflows Core

- **`/bmad:core:workflows:party-mode`** - Mode collaboratif multi-agents

### Workflows BMB (BMAD Builder)

- **`/bmad:bmb:workflows:agent`** - Workflow pour créer un agent
- **`/bmad:bmb:workflows:module`** - Workflow pour créer un module
- **`/bmad:bmb:workflows:workflow`** - Workflow pour créer un workflow

---

## 🚀 Utilisation

- **Dans le chat Cursor** : tapez `/` puis le **nom de la commande Cursor** (ex. `/dev`, `/bmad-master`, `/dev-story`, `/sprint-planning`). Les noms exacts sont dans le tableau « Commandes Cursor » ci-dessus.
- **Palette de commandes** : **Cmd/Ctrl+Shift+P** → « Run Command » → choisir la commande par son nom.

Les agents activent leur persona complète et suivent leurs instructions spécifiques. Les workflows exécutent leurs processus étape par étape.

---

## 📚 Documentation

- Structure BMAD: `_bmad/`
- Outputs BMAD: `_bmad-output/`
- Statut workflow: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml`
