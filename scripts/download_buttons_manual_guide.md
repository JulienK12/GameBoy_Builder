# 📥 Guide de téléchargement manuel des images de boutons

Comme AliExpress charge les images dynamiquement avec JavaScript, voici un guide pour télécharger les images manuellement.

## Méthode 1 : Via le navigateur (Recommandé)

### Étapes :

1. **Ouvrir la page AliExpress**
   - URL: https://nl.aliexpress.com/item/1005002768502107.html

2. **Ouvrir les outils de développement**
   - Chrome/Edge: `F12` ou `Ctrl+Shift+I`
   - Firefox: `F12` ou `Ctrl+Shift+I`

3. **Onglet Network (Réseau)**
   - Cliquez sur l'onglet "Network" ou "Réseau"
   - Filtrez par "Img" ou "Images"
   - Rechargez la page (`F5`)

4. **Sélectionner chaque variante de couleur**
   - Cliquez sur chaque couleur dans la section "Couleur: ..."
   - Pour chaque couleur, une nouvelle image se charge
   - Dans l'onglet Network, vous verrez les requêtes d'images

5. **Télécharger les images**
   - Clic droit sur chaque image dans Network → "Open in new tab"
   - Ou copiez l'URL de l'image
   - Téléchargez l'image avec un nom approprié

### Mapping des couleurs vers les noms de fichiers :

D'après le seed SQL (`migrations/012_seed_buttons.sql`), voici le mapping :

| Couleur AliExpress | Nom de fichier |
|-------------------|----------------|
| Rouge | `VAR_BTN_GBC_CGS_RED.jpg` |
| Bleu | `VAR_BTN_GBC_CGS_BLUE.jpg` |
| Violet | `VAR_BTN_GBC_CGS_PURPLE.jpg` |
| Rose | `VAR_BTN_GBC_CGS_PINK.jpg` |
| Noir | `VAR_BTN_GBC_CGS_BLACK.jpg` |
| Vert | `VAR_BTN_GBC_CGS_GREEN.jpg` |
| Blanc | `VAR_BTN_GBC_CGS_WHITE.jpg` |
| Jaune | `VAR_BTN_GBC_CGS_YELLOW.jpg` |
| Rouge Transparent | `VAR_BTN_GBC_CGS_CLEAR_RED.jpg` |
| Jaune Transparent | `VAR_BTN_GBC_CGS_CLEAR_YELLOW.jpg` |
| Vert Transparent | `VAR_BTN_GBC_CGS_CLEAR_GREEN.jpg` |
| Bleu Transparent | `VAR_BTN_GBC_CGS_CLEAR_BLUE.jpg` |
| Bleu Clair Transparent | `VAR_BTN_GBC_CGS_CLEAR_LIGHT_BLUE.jpg` |
| Violet Transparent | `VAR_BTN_GBC_CGS_CLEAR_PURPLE.jpg` |
| Vert Phosphorescent | `VAR_BTN_GBC_CGS_GLOW_GREEN.jpg` |

## Méthode 2 : Script avec URLs directes

Si vous avez les URLs des images, créez un fichier `button_urls.txt` avec une URL par ligne :

```
https://ae-pic-a1.aliexpress-media.com/kf/.../VAR_BTN_GBC_CGS_RED.jpg
https://ae-pic-a1.aliexpress-media.com/kf/.../VAR_BTN_GBC_CGS_BLUE.jpg
...
```

Puis utilisez ce script :

```python
import requests
from pathlib import Path

OUTPUT_DIR = Path("assets/images/buttons")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

with open("button_urls.txt") as f:
    for line in f:
        url, filename = line.strip().split()
        response = requests.get(url)
        (OUTPUT_DIR / filename).write_bytes(response.content)
        print(f"✅ {filename}")
```

## Méthode 3 : Extension navigateur

Utilisez une extension comme "Image Downloader" ou "Download All Images" pour télécharger toutes les images de la page, puis renommez-les manuellement.

## Dossier de destination

Toutes les images doivent être placées dans :
```
assets/images/buttons/
```

## Vérification

Après téléchargement, vérifiez que vous avez bien 16 fichiers (ou le nombre de variantes disponibles) :

```bash
ls -la assets/images/buttons/
```

Vous devriez voir :
- VAR_BTN_GBC_CGS_RED.jpg
- VAR_BTN_GBC_CGS_BLUE.jpg
- VAR_BTN_GBC_CGS_PURPLE.jpg
- ... (etc)
