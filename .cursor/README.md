# Configuration Cursor pour BMAD

Ce dossier contient la configuration pour intégrer BMAD dans Cursor.

## Fichiers

- **AGENTS.md** - Liste complète de tous les agents et workflows BMAD disponibles
- **README.md** - Ce fichier

## Comment utiliser les commandes BMAD dans Cursor

1. **Via le chat Cursor** : Tapez simplement une commande BMAD (ex: `/bmad:bmm:agents:dev`)
2. **Via les suggestions** : Cursor devrait suggérer les commandes disponibles quand vous tapez `/bmad:`
3. **Consultez AGENTS.md** : Pour voir toutes les commandes disponibles

## Exemples

- Activer l'agent développeur : `/bmad:bmm:agents:dev`
- Vérifier le statut : `/bmad:bmm:workflows:workflow-status`
- Développer une story : `/bmad:bmm:workflows:dev-story`
- Planifier un sprint : `/bmad:bmm:workflows:sprint-planning`

## Documentation BMAD

- Workflow status : `_bmad-output/planning-artifacts/bmm-workflow-status.yaml`
- Structure BMAD : `_bmad/`
- Outputs : `_bmad-output/`
