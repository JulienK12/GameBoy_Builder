#!/usr/bin/env python3
"""
Script pour télécharger les images de boutons depuis une liste d'URLs

Usage:
    1. Créez un fichier button_urls.txt avec le format:
       VAR_BTN_GBC_CGS_RED.jpg https://url-de-l-image.jpg
       VAR_BTN_GBC_CGS_BLUE.jpg https://url-de-l-image.jpg
       ...
    
    2. Lancez: python scripts/download_from_urls.py
"""

import sys
import requests
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "buttons"
URLS_FILE = Path(__file__).parent / "button_urls.txt"


def download_image(url, filepath):
    """Télécharge une image depuis une URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.aliexpress.com/'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        size_kb = len(response.content) / 1024
        print(f"✅ {filepath.name} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"❌ Erreur pour {filepath.name}: {e}")
        return False


def main():
    print("=" * 60)
    print("📥 Téléchargement des images depuis button_urls.txt")
    print("=" * 60)
    
    if not URLS_FILE.exists():
        print(f"❌ Fichier {URLS_FILE} introuvable")
        print("\n💡 Créez le fichier avec le format:")
        print("   VAR_BTN_GBC_CGS_RED.jpg https://url-de-l-image.jpg")
        print("   VAR_BTN_GBC_CGS_BLUE.jpg https://url-de-l-image.jpg")
        return
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    downloaded = 0
    skipped = 0
    errors = 0
    
    with open(URLS_FILE, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            parts = line.split(None, 1)
            if len(parts) != 2:
                print(f"⚠️  Ligne {line_num} ignorée (format invalide): {line}")
                continue
            
            filename, url = parts
            filepath = OUTPUT_DIR / filename
            
            if filepath.exists():
                print(f"⏭️  {filename}: Déjà présent")
                skipped += 1
                continue
            
            print(f"📥 [{line_num}] {filename}")
            if download_image(url, filepath):
                downloaded += 1
            else:
                errors += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Téléchargés: {downloaded}")
    print(f"⏭️  Ignorés: {skipped}")
    print(f"❌ Erreurs: {errors}")
    print(f"\n📁 Dossier: {OUTPUT_DIR}")
    print("\n✅ Terminé!")


if __name__ == '__main__':
    main()
