# 🎮 Rapport d'Audit 3D & Guide de Rendu Avancé

Ce document analyse votre pipeline de rendu 3D et propose des solutions pour l'individualisation des couleurs et l'intégration de textures réalistes.

---

## 🏛️ Audit du Moteur 3D (Expert Graphics)

### État Actuel du Rendu
Votre composant `ThreeDPreview.vue` utilise **TresJS**, une excellente abstraction de Three.js pour Vue. L'implémentation actuelle est déjà très avancée pour un projet "débutant" :
- **Segmentation des Pièces** : Le regroupement par noms (`shell_front`, `button_a`, etc.) est la bonne approche.
- **Matériaux Physiques** : Vous utilisez `MeshPhysicalMaterial`, ce qui permet des effets réalistes comme la `transmission` (transparence) et le `clearcoat` (vernis).
- **Optimisation** : L'utilisation de `shallowRef` et `markRaw` évite les surcharges de réactivité de Vue sur les objets Three.js lourds. ✅

### Points de Blocage Potentiels
- **Remplacement de Matériau** : Dans `updateMaterials()`, vous créez un `new MeshPhysicalMaterial()` à chaque mise à jour. C'est propre, mais cela peut être lourd si on change souvent de couleur. Il vaudrait mieux mettre à jour le matériau existant.
- **Mapping UV** : Pour appliquer des textures (images), votre fichier `gbc.glb` doit être "déplié" (UV Unwrapped) correctement par un graphiste 3D.

---

## 🎨 Individualisation des Couleurs (Sub-Parts)

Votre code supporte déjà l'individualisation via la prop `partsColors`. Pour que l'utilisateur puisse en profiter, voici les étapes :

1.  **Extension du Store** : Ajouter un objet `customColors` dans le store Pinia pour stocker les choix de l'utilisateur pour chaque groupe (`dpad`, `buttons_a_b`, etc.).
2.  **Interface UI** : Créer un nouveau menu "Customisation Avancée" qui permet de choisir une couleur pour chaque identifiant de groupe.
3.  **Liaison** : Passer cet objet du store directement à la prop `partsColors` du composant 3D.

---

## 🖼️ Intégration des Textures (Images Réelles)

Appliquer le rendu des images d'assets sur le modèle 3D est tout à fait possible. Voici la marche à suivre technique :

### La "Texture Magique"
Plutôt que d'appliquer une simple couleur, on peut appliquer l'image du produit comme une "peau" sur le plastique.

```javascript
// Exemple de logique à intégrer dans updateMaterials
const loader = new TextureLoader();
const texture = await loader.loadAsync(variantImageUrl);

child.material.map = texture; // Applique l'image sur la surface
child.material.color = new Color('#ffffff'); // On reset la couleur pour ne pas teinter l'image
```

### ⚠️ Précautions Importantes
1.  **Réalisme** : Si l'image de l'asset est une photo de studio avec des ombres portées, l'appliquer sur la 3D risque de créer des ombres doubles bizarres. L'idéal est d'avoir des textures "plates" (Albedo).
2.  **Transparence + Texture** : On peut mixer les deux ! Une texture de plastique granuleux avec une forte `transmission` donnera un aspect "Frosted Clear" (dépoli) magnifique.

---

## 📖 Guide Pédagogique (Expert Pédagogue)

### Comment Three.js voit votre Game Boy ?
C'est comme un jeu d'icônes :
- **Le Mesh (La Géométrie)** : C'est le squelette, la forme des boutons et de la coque.
- **Le Material (La Peau)** : C'est ce que vous contrôlez. C'est là qu'on définit si c'est brillant, mat, ou transparent.
- **La Texture (Le Dessin)** : C'est une image collée sur le Material.

### Votre fonctionnalité "Incroyable"
Pour que le rendu 3D ressemble aux photos, nous allons devoir créer un "Générateur de Matériaux". Au lieu de dire "C'est Violet", on dira au robot 3D : "Prends cette photo, colle-la sur la coque, et rajoute une couche de vernis brillant par-dessus".

---

## 💡 Prochaine Étape
Je vous conseille de tester l'individualisation des boutons en premier, car c'est le plus simple. Ensuite, nous pourrons essayer d'injecter une texture de test sur la coque pour voir si le "déplimage" de votre modèle `.glb` actuel permet un rendu propre.
