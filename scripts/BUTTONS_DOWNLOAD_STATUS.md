# 📥 Statut du téléchargement des images de boutons

## ✅ Images téléchargées (6/16)

Les images suivantes ont été téléchargées avec succès dans `assets/images/buttons/` :

1. ✅ `VAR_BTN_GBC_CGS_BLUE.jpg` (36 KB)
2. ✅ `VAR_BTN_GBC_CGS_RED.jpg` (824 bytes - probablement une petite image)
3. ✅ `VAR_BTN_GBC_CGS_PURPLE.jpg` (56 KB)
4. ✅ `VAR_BTN_GBC_CGS_PINK.jpg` (88 KB)
5. ✅ `VAR_BTN_GBC_CGS_BLACK.jpg` (115 KB)
6. ✅ `VAR_BTN_GBC_CGS_GREEN.jpg` (105 KB)

## ⚠️ Images manquantes (10/16)

Les variantes suivantes du seed SQL n'ont pas encore été téléchargées :

- `VAR_BTN_GBC_CGS_WHITE.jpg`
- `VAR_BTN_GBC_CGS_YELLOW.jpg`
- `VAR_BTN_GBC_CGS_CLEAR_RED.jpg` (Rouge Transparent)
- `VAR_BTN_GBC_CGS_CLEAR_YELLOW.jpg` (Jaune Transparent)
- `VAR_BTN_GBC_CGS_CLEAR_GREEN.jpg` (Vert Transparent)
- `VAR_BTN_GBC_CGS_CLEAR_BLUE.jpg` (Bleu Transparent)
- `VAR_BTN_GBC_CGS_CLEAR_LIGHT_BLUE.jpg` (Bleu Clair Transparent)
- `VAR_BTN_GBC_CGS_CLEAR_PURPLE.jpg` (Violet Transparent)
- `VAR_BTN_GBC_CGS_GLOW_GREEN.jpg` (Vert Phosphorescent)

## 🔍 Pourquoi seulement 6 images ?

AliExpress charge les autres variantes dynamiquement avec JavaScript quand l'utilisateur :
1. Clique sur "Voir plus" dans la section des couleurs
2. Clique sur chaque couleur individuellement

Les 6 images trouvées sont celles visibles dans le HTML initial.

## 📋 Prochaines étapes

### Option 1 : Téléchargement manuel (Recommandé)

1. Ouvrir la page AliExpress dans un navigateur
2. Ouvrir DevTools (F12) → Network → Filtrer "Img"
3. Cliquer sur chaque couleur pour charger l'image
4. Clic droit sur chaque image dans Network → "Open in new tab"
5. Télécharger et renommer selon le mapping dans le seed SQL

### Option 2 : Utiliser Selenium (Automatique)

Si vous installez Selenium :
```bash
pip install selenium webdriver-manager
python scripts/download_button_images.py
```

Le script `download_button_images.py` utilise Selenium pour cliquer automatiquement sur chaque variante et télécharger les images.

### Option 3 : Compléter avec les URLs trouvées

Si vous trouvez les URLs des autres variantes, ajoutez-les dans `scripts/button_urls.txt` et lancez :
```bash
python scripts/download_from_urls.py
```

## 📝 Notes

- Les images téléchargées sont de bonne qualité (35-115 KB)
- Le fichier `VAR_BTN_GBC_CGS_RED.jpg` est très petit (824 bytes) - peut-être une erreur, à vérifier
- Les noms de fichiers actuels sont des estimations basées sur l'ordre de téléchargement
- **Important** : Vérifiez visuellement les images téléchargées et renommez-les selon les vraies couleurs

## 🎯 URLs des images téléchargées

Pour référence, voici les URLs des images déjà téléchargées :

1. Bleu: `https://ae01.alicdn.com/kf/H1c7a6943724f478eaad84407bcd3fcb2S.jpg`
2. Rouge: `https://ae01.alicdn.com/kf/S6d426a8dcf3b480bb7d1e83ab6666db10/208x824.png` (⚠️ PNG, pas JPG)
3. Violet: `https://ae01.alicdn.com/kf/Hb9c17be093724d28883cc01dc3fe274ag.jpg`
4. Rose: `https://ae01.alicdn.com/kf/Hf1d8f17ad5234267a4855be7e5f372f2o.jpg`
5. Noir: `https://ae01.alicdn.com/kf/Hb10890ab32144293b4ba01b391c358d19.jpg`
6. Vert: `https://ae01.alicdn.com/kf/H11024791cab64529b6f73ca643295b5e6.jpg`
