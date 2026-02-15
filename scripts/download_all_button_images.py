#!/usr/bin/env python3
"""
Script final pour télécharger toutes les images de boutons depuis AliExpress
"""

import re
import requests
from pathlib import Path

URL = "https://nl.aliexpress.com/item/1005002768502107.html"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "buttons"

# URLs trouvées dans le HTML (les URLs courtes sont les meilleures qualités)
IMAGE_URLS = [
    "https://ae01.alicdn.com/kf/H1c7a6943724f478eaad84407bcd3fcb2S.jpg",  # Bleu
    "https://ae01.alicdn.com/kf/Ha6e81c1b1ce04f53b4abd172bf753568N.jpg",  # Variante 2
    "https://ae01.alicdn.com/kf/Hb9c17be093724d28883cc01dc3fe274ag.jpg",  # Variante 3
    "https://ae01.alicdn.com/kf/Hf1d8f17ad5234267a4855be7e5f372f2o.jpg",  # Variante 4
    "https://ae01.alicdn.com/kf/Hb10890ab32144293b4ba01b391c358d19.jpg",  # Variante 5
    "https://ae01.alicdn.com/kf/H11024791cab64529b6f73ca643295b5e6.jpg",  # Variante 6
]

# Mapping temporaire (à ajuster après visualisation des images)
FILENAME_MAPPING = [
    'VAR_BTN_GBC_CGS_BLUE',
    'VAR_BTN_GBC_CGS_RED',
    'VAR_BTN_GBC_CGS_PURPLE',
    'VAR_BTN_GBC_CGS_PINK',
    'VAR_BTN_GBC_CGS_BLACK',
    'VAR_BTN_GBC_CGS_GREEN',
    'VAR_BTN_GBC_CGS_WHITE',
    'VAR_BTN_GBC_CGS_YELLOW',
    'VAR_BTN_GBC_CGS_CLEAR_RED',
    'VAR_BTN_GBC_CGS_CLEAR_YELLOW',
    'VAR_BTN_GBC_CGS_CLEAR_GREEN',
    'VAR_BTN_GBC_CGS_CLEAR_BLUE',
    'VAR_BTN_GBC_CGS_CLEAR_LIGHT_BLUE',
    'VAR_BTN_GBC_CGS_CLEAR_PURPLE',
    'VAR_BTN_GBC_CGS_GLOW_GREEN',
]


def download_image(url, filepath):
    """Télécharge une image"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': URL
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type:
            print(f"  ⚠️  {filepath.name}: Pas une image (type: {content_type})")
            return False
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        size_kb = len(response.content) / 1024
        print(f"  ✅ {filepath.name} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        return False


def main():
    print("=" * 60)
    print("🎮 Téléchargement de toutes les images de boutons")
    print("=" * 60)
    print(f"📁 Dossier: {OUTPUT_DIR}")
    print(f"📦 {len(IMAGE_URLS)} URLs à télécharger\n")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    downloaded = 0
    skipped = 0
    
    for i, img_url in enumerate(IMAGE_URLS):
        # Utiliser le mapping si disponible, sinon nom générique
        if i < len(FILENAME_MAPPING):
            filename_base = FILENAME_MAPPING[i]
        else:
            filename_base = f'VAR_BTN_GBC_CGS_UNKNOWN_{i+1}'
        
        filename = f"{filename_base}.jpg"
        filepath = OUTPUT_DIR / filename
        
        if filepath.exists():
            print(f"⏭️  {filename}: Déjà présent")
            skipped += 1
            continue
        
        print(f"📥 [{i+1}/{len(IMAGE_URLS)}] {filename}")
        print(f"    {img_url}")
        
        if download_image(img_url, filepath):
            downloaded += 1
        else:
            skipped += 1
        print()
    
    print("=" * 60)
    print(f"✅ Téléchargés: {downloaded}")
    print(f"⏭️  Ignorés: {skipped}")
    print(f"\n📁 Images dans: {OUTPUT_DIR}")
    print("\n💡 Vérifiez les images et renommez-les si nécessaire")
    print("   selon les couleurs réelles (voir seed SQL pour les noms)")
    print("\n✅ Terminé!")


if __name__ == '__main__':
    main()
