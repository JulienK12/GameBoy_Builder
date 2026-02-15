# 📥 Script de téléchargement des images de boutons AliExpress

Ce script télécharge automatiquement les images des variantes de boutons Gameboy Color depuis une page AliExpress et les sauvegarde dans `assets/images/buttons/` avec les noms de fichiers correspondant au seed SQL.

## 📋 Prérequis

1. **Python 3.8+**
2. **Chrome** installé sur votre système
3. **ChromeDriver** (sera téléchargé automatiquement par Selenium si nécessaire)

## 🔧 Installation des dépendances

```bash
pip install selenium beautifulsoup4 requests pillow
```

Ou avec un environnement virtuel (recommandé) :

```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install selenium beautifulsoup4 requests pillow
```

## 🚀 Utilisation

### 1. Obtenir l'URL de la page AliExpress

1. Ouvrez votre navigateur
2. Allez sur la page produit AliExpress des boutons Cloud GameStore
3. Copiez l'URL complète (ex: `https://www.aliexpress.com/item/1005001924850140.html`)

### 2. Lancer le script

**Mode interactif (avec interface Chrome visible)** :
```bash
python scripts/download_button_images.py --url "VOTRE_URL_ALIEXPRESS"
```

**Mode headless (sans interface)** :
```bash
python scripts/download_button_images.py --url "VOTRE_URL_ALIEXPRESS" --headless
```

**Mode dry-run (voir ce qui serait téléchargé sans télécharger)** :
```bash
python scripts/download_button_images.py --url "VOTRE_URL_ALIEXPRESS" --dry-run
```

### 3. Vérifier les résultats

Les images seront sauvegardées dans :
```
assets/images/buttons/
```

Avec les noms de fichiers correspondant au seed SQL :
- `VAR_BTN_GBC_CGS_RED.jpg`
- `VAR_BTN_GBC_CGS_BLUE.jpg`
- `VAR_BTN_GBC_CGS_PURPLE.jpg`
- etc.

## 🔍 Fonctionnement

Le script :

1. **Ouvre la page AliExpress** avec Selenium
2. **Identifie les variantes de couleurs** disponibles (clique sur chaque variante)
3. **Capture l'image principale** qui change pour chaque variante
4. **Mappe les noms de couleurs** vers nos noms de fichiers (voir `COLOR_MAPPING` dans le script)
5. **Télécharge chaque image** dans `assets/images/buttons/`

## ⚠️ Notes importantes

- **Mapping manuel** : Si certaines variantes ne sont pas automatiquement mappées, le script les listera à la fin. Vous devrez ajouter ces mappings dans `COLOR_MAPPING` du script.

- **Images déjà présentes** : Le script ignore les fichiers déjà existants pour éviter de les ré-télécharger.

- **Rate limiting** : AliExpress peut limiter les requêtes. Le script inclut des délais entre les actions.

- **Structure de page** : Si la structure de la page AliExpress change, vous devrez peut-être ajuster les sélecteurs CSS dans la fonction `find_color_variants()`.

## 🛠️ Dépannage

### Erreur "ChromeDriver not found"
```bash
# Installer ChromeDriver manuellement
# Sur macOS avec Homebrew:
brew install chromedriver

# Sur Linux:
# Télécharger depuis https://chromedriver.chromium.org/
```

### Les variantes ne sont pas détectées
1. Vérifiez que l'URL est correcte
2. Essayez le mode interactif (sans `--headless`) pour voir ce qui se passe
3. Vérifiez la console pour les messages d'erreur
4. Vous devrez peut-être ajuster les sélecteurs CSS selon la structure actuelle de la page

### Images de mauvaise qualité
Le script télécharge l'image principale affichée. Si vous avez besoin d'images en meilleure qualité :
1. Inspectez la page pour trouver les URLs d'images haute résolution
2. Modifiez le script pour utiliser ces URLs directement

## 📝 Exemple de sortie

```
============================================================
🎮 Téléchargement des images de boutons Gameboy Color
============================================================
📁 Dossier de destination: /path/to/assets/images/buttons
🌐 URL: https://www.aliexpress.com/item/...

🌐 Ouverture de la page: https://...
📦 Trouvé 16 éléments de couleur potentiels
🎨 Trouvé 16 boutons de couleur
  ✓ Variante 1: Rouge
  ✓ Variante 2: Bleu
  ...

📥 Variante 1: Rouge → VAR_BTN_GBC_CGS_RED.jpg
  ✅ Téléchargé: VAR_BTN_GBC_CGS_RED.jpg
...

============================================================
✅ Téléchargés: 16
⏭️  Ignorés: 0

✅ Script terminé
```

## 🔄 Mise à jour du mapping

Si de nouvelles variantes apparaissent sur AliExpress, ajoutez-les dans `COLOR_MAPPING` :

```python
COLOR_MAPPING = {
    # ... mappings existants ...
    'Nouvelle Couleur': 'VAR_BTN_GBC_CGS_NEW_COLOR',
}
```
