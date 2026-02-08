# 🗄️ Rapport d'Audit Database & Design "Catalog Sync"

Ce document analyse la structure de votre base de données PostgreSQL et propose une architecture pour votre future fonctionnalité de synchronisation automatique.

---

## 🏛️ Audit de la Base de Données (Expert Architecte DB)

### Points Forts (Elite Design)
*   **Normalisation (3NF)** : Votre schéma est parfaitement normalisé. La séparation entre les entités parentes (`shells`, `screens`) et leurs déclinaisons (`shell_variants`) évite toute duplication de données.
*   **Types Énumérés (Postgres ENUMs)** : L'utilisation de `mold_type`, `brand`, etc., garantit qu'aucune valeur fantaisiste ne peut entrer dans la base. C'est du "Type Safety" au niveau stockage. ✅
*   **Contraintes d'Intégrité** : Les clés étrangères (`REFERENCES`) assurent qu'on ne peut pas avoir une variante sans coque parente. Votre "Matrice de Compatibilité" est une excellente utilisation des tables de jointure avec clé primaire composée.

### Opportunités d'Amélioration (Postgres Pro)
*   **Indexation** : Actuellement, vous n'avez que des index sur les clés primaires. Si votre catalogue dépasse les 1000 items, il faudra ajouter des index sur `shell_id` dans `shell_variants` pour accélérer les recherches.
*   **Audit Trail** : Il manque des colonnes `created_at` et `updated_at` sur vos tables. C'est indispensable pour savoir quand une donnée a été modifiée pour la dernière fois.

---

## 🚀 Design de la Feature "Catalog Sync" (Expert Automatisation)

Votre idée de "vérifier comme un être humain" les variantes s'appelle du **Web Scraping**. Voici comment nous pourrions l'implémenter de manière robuste :

### 1. Evolution du Schéma DB
Pour que le système sache *où* chercher, nous devons ajouter des informations aux variantes :

```sql
ALTER TABLE shell_variants ADD COLUMN source_url TEXT; -- Le lien vers la page produit (ex: FunnyPlaying)
ALTER TABLE shell_variants ADD COLUMN is_available BOOLEAN DEFAULT TRUE; -- Stock constaté
ALTER TABLE shell_variants ADD COLUMN last_sync_at TIMESTAMP; -- Date du dernier passage du robot
```

### 2. Le "Robot de Surveillance" (The Oracle)
Nous utiliserions **Playwright** (un navigateur piloté par IA) pour :
1.  Parcourir les `source_url` enregistrés.
2.  Lire le stock en temps réel sur la page (ex: bouton "Add to cart" barré ou non).
3.  Détecter de nouvelles couleurs qui n'existeraient pas encore dans votre base.
4.  Télécharger les nouvelles images et les stocker localement.

### 3. Workflow de Consolidation
*   **Mode Automatique** : Le robot tourne la nuit et met à jour les prix/stocks.
*   **Mode Semi-Humain** : Vous naviguez, et un petit script d'extension chrome (ou un bouton dans votre interface) envoie l'URL courante au backend Rust pour "aspirer" les données.

---

## 📖 Le Guide Pédagogique (Expert Pédagogue)

### Pourquoi Postgres est votre meilleur ami ici ?
Votre base de données n'est pas juste un "placard à rangement". C'est le **Cœur de Calcul**.
- Quand vous demandez une coque, Postgres fait le lien instantanément avec toutes ses couleurs.
- La table de compatibilité est comme un immense tableau à double entrée que Postgres consulte en quelques micro-secondes.

### Comment lire votre schéma ?
Imaginez une étagère :
1.  **Table `shells`** : C'est l'étiquette sur l'étagère (ex: "Coque FunnyPlaying").
2.  **Table `shell_variants`** : Ce sont les différents modèles sur cette étagère (Rouge, Bleu, Transparent).
3.  **Table `compatibility`** : C'est le manuel d'instruction qui dit "Si tu prends cet écran, il te faut cette étagère".

---

## 💡 Conseil pour la suite
Pour implémenter votre feature incroyable, je vous conseille de commencer par ajouter les colonnes de "Source" à votre base. Cela nous permettra ensuite de coder un petit robot Rust ou Node.js qui ira faire le travail de vérification pour vous !
