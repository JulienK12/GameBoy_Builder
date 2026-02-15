#!/usr/bin/env python3
"""
Script simplifié pour télécharger les images des boutons Gameboy Color depuis AliExpress
Utilise requests + BeautifulSoup (pas besoin de Selenium)

Usage:
    python scripts/download_button_images_simple.py
"""

import os
import sys
import json
import re
import requests
from pathlib import Path
from urllib.parse import urljoin, urlparse

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ BeautifulSoup4 n'est pas installé.")
    print("💡 Installez-le avec: pip install beautifulsoup4")
    sys.exit(1)

# Mapping des couleurs AliExpress vers nos noms de fichiers
COLOR_MAPPING = {
    # Couleurs solides
    'Rouge': 'VAR_BTN_GBC_CGS_RED',
    'Bleu': 'VAR_BTN_GBC_CGS_BLUE',
    'Violet': 'VAR_BTN_GBC_CGS_PURPLE',
    'Rose': 'VAR_BTN_GBC_CGS_PINK',
    'Noir': 'VAR_BTN_GBC_CGS_BLACK',
    'Vert': 'VAR_BTN_GBC_CGS_GREEN',
    'Blanc': 'VAR_BTN_GBC_CGS_WHITE',
    'Jaune': 'VAR_BTN_GBC_CGS_YELLOW',
    # Couleurs transparentes
    'Rouge Transparent': 'VAR_BTN_GBC_CGS_CLEAR_RED',
    'Jaune Transparent': 'VAR_BTN_GBC_CGS_CLEAR_YELLOW',
    'Vert Transparent': 'VAR_BTN_GBC_CGS_CLEAR_GREEN',
    'Bleu Transparent': 'VAR_BTN_GBC_CGS_CLEAR_BLUE',
    'Bleu Clair Transparent': 'VAR_BTN_GBC_CGS_CLEAR_LIGHT_BLUE',
    'Violet Transparent': 'VAR_BTN_GBC_CGS_CLEAR_PURPLE',
    # Phosphorescent
    'Vert Phosphorescent': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
    # Variantes possibles
    'Red': 'VAR_BTN_GBC_CGS_RED',
    'Blue': 'VAR_BTN_GBC_CGS_BLUE',
    'Purple': 'VAR_BTN_GBC_CGS_PURPLE',
    'Pink': 'VAR_BTN_GBC_CGS_PINK',
    'Black': 'VAR_BTN_GBC_CGS_BLACK',
    'Green': 'VAR_BTN_GBC_CGS_GREEN',
    'White': 'VAR_BTN_GBC_CGS_WHITE',
    'Yellow': 'VAR_BTN_GBC_CGS_YELLOW',
    'Clear Red': 'VAR_BTN_GBC_CGS_CLEAR_RED',
    'Clear Blue': 'VAR_BTN_GBC_CGS_CLEAR_BLUE',
    'Clear Green': 'VAR_BTN_GBC_CGS_CLEAR_GREEN',
    'Clear Yellow': 'VAR_BTN_GBC_CGS_CLEAR_YELLOW',
    'Clear Purple': 'VAR_BTN_GBC_CGS_CLEAR_PURPLE',
    'Light Blue': 'VAR_BTN_GBC_CGS_CLEAR_LIGHT_BLUE',
    'Glow': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
    'Glow in Dark': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
}

# URL de la page AliExpress
URL = "https://nl.aliexpress.com/item/1005002768502107.html"

# Dossier de destination
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "buttons"


def get_page_content(url):
    """Récupère le contenu HTML de la page"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    }
    
    print(f"🌐 Téléchargement de la page: {url}")
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"❌ Erreur lors du téléchargement de la page: {e}")
        return None


def extract_image_urls(html_content):
    """Extrait les URLs d'images depuis le HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    image_urls = []
    
    # Méthode 1: Chercher dans les données JSON embarquées (AliExpress utilise souvent ça)
    script_tags = soup.find_all('script', type='text/javascript')
    for script in script_tags:
        if script.string:
            # Chercher des URLs d'images dans le JavaScript
            # AliExpress stocke souvent les images dans window.runParams ou similaire
            img_pattern = r'https?://[^"\s]+\.(jpg|jpeg|png|webp)[^"\s]*'
            matches = re.findall(img_pattern, script.string)
            for match in matches:
                url = match[0] if isinstance(match, tuple) else match
                if 'button' in url.lower() or 'btn' in url.lower() or 'aliexpress-media' in url:
                    if url not in image_urls:
                        image_urls.append(url)
    
    # Méthode 2: Chercher les images dans les éléments img
    img_tags = soup.find_all('img')
    for img in img_tags:
        src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
        if src:
            # Convertir en URL absolue si nécessaire
            if src.startswith('//'):
                src = 'https:' + src
            elif src.startswith('/'):
                src = urljoin(URL, src)
            
            if 'button' in src.lower() or 'btn' in src.lower() or 'aliexpress-media' in src:
                if src not in image_urls:
                    image_urls.append(src)
    
    # Méthode 3: Chercher dans les attributs data-*
    for element in soup.find_all(attrs={'data-image': True}):
        img_url = element.get('data-image')
        if img_url and img_url not in image_urls:
            image_urls.append(img_url)
    
    return image_urls


def extract_variants_from_json(html_content):
    """Extrait les variantes depuis les données JSON embarquées"""
    variants = []
    
    # AliExpress stocke souvent les variantes dans window.runParams
    json_pattern = r'window\.runParams\s*=\s*({.*?});'
    match = re.search(json_pattern, html_content, re.DOTALL)
    
    if match:
        try:
            json_str = match.group(1)
            data = json.loads(json_str)
            # Chercher les sku/variants dans la structure JSON
            # La structure exacte dépend d'AliExpress, donc on essaie plusieurs chemins
            if 'skuModule' in data:
                sku_module = data['skuModule']
                if 'productSKUPropertyList' in sku_module:
                    for prop in sku_module['productSKUPropertyList']:
                        if prop.get('skuPropertyName') == 'Color' or prop.get('skuPropertyName') == 'Couleur':
                            for value in prop.get('skuPropertyValues', []):
                                variants.append({
                                    'name': value.get('propertyValueDisplayName', ''),
                                    'image': value.get('skuPropertyImagePath', ''),
                                    'valueId': value.get('propertyValueId', '')
                                })
        except json.JSONDecodeError:
            pass
    
    return variants


def map_color_to_filename(color_name):
    """Mappe le nom de couleur vers notre nom de fichier"""
    if not color_name:
        return None
    
    color_name_clean = color_name.strip()
    
    # Correspondance exacte
    if color_name_clean in COLOR_MAPPING:
        return COLOR_MAPPING[color_name_clean]
    
    # Correspondance partielle (insensible à la casse)
    color_lower = color_name_clean.lower()
    for key, value in COLOR_MAPPING.items():
        if key.lower() in color_lower or color_lower in key.lower():
            return value
    
    # Détection de transparent/clear
    if 'transparent' in color_lower or 'clear' in color_lower:
        if 'red' in color_lower or 'rouge' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_RED'
        elif 'blue' in color_lower or 'bleu' in color_lower:
            if 'light' in color_lower or 'clair' in color_lower:
                return 'VAR_BTN_GBC_CGS_CLEAR_LIGHT_BLUE'
            return 'VAR_BTN_GBC_CGS_CLEAR_BLUE'
        elif 'green' in color_lower or 'vert' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_GREEN'
        elif 'yellow' in color_lower or 'jaune' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_YELLOW'
        elif 'purple' in color_lower or 'violet' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_PURPLE'
    
    # Détection de glow/phosphorescent
    if 'glow' in color_lower or 'phosphorescent' in color_lower:
        return 'VAR_BTN_GBC_CGS_GLOW_GREEN'
    
    return None


def download_image(url, filepath):
    """Télécharge une image"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': URL
        }
        
        # Nettoyer l'URL (enlever les paramètres de taille si présents)
        clean_url = url.split('_50x50')[0].split('_220x220')[0].split('_640x640')[0]
        clean_url = clean_url.split('?')[0]  # Enlever les query params
        
        response = requests.get(clean_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✅ Téléchargé: {filepath.name}")
        return True
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        return False


def main():
    print("=" * 60)
    print("🎮 Téléchargement des images de boutons Gameboy Color")
    print("=" * 60)
    print(f"📁 Dossier: {OUTPUT_DIR}")
    print(f"🌐 URL: {URL}")
    print()
    
    # Créer le dossier
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Télécharger la page
    html_content = get_page_content(URL)
    if not html_content:
        return
    
    print("📦 Extraction des URLs d'images...")
    
    # Extraire les variantes depuis JSON
    variants = extract_variants_from_json(html_content)
    
    # Extraire les URLs d'images depuis le HTML
    image_urls = extract_image_urls(html_content)
    
    print(f"  ✓ Trouvé {len(variants)} variantes dans JSON")
    print(f"  ✓ Trouvé {len(image_urls)} URLs d'images")
    
    downloaded = 0
    skipped = 0
    manual_review = []
    
    # Traiter les variantes depuis JSON
    if variants:
        print("\n📥 Téléchargement des variantes depuis JSON:")
        for variant in variants:
            color_name = variant.get('name', '')
            img_url = variant.get('image', '')
            
            if not img_url:
                continue
            
            filename_base = map_color_to_filename(color_name)
            
            if not filename_base:
                manual_review.append({
                    'name': color_name,
                    'url': img_url,
                    'source': 'JSON'
                })
                continue
            
            filename = f"{filename_base}.jpg"
            filepath = OUTPUT_DIR / filename
            
            if filepath.exists():
                print(f"⏭️  {filename}: Déjà présent")
                skipped += 1
                continue
            
            print(f"📥 {color_name} → {filename}")
            if download_image(img_url, filepath):
                downloaded += 1
            else:
                skipped += 1
    
    # Si pas de variantes JSON, utiliser les URLs d'images trouvées
    if not variants and image_urls:
        print("\n📥 Téléchargement des images trouvées:")
        for i, img_url in enumerate(image_urls[:20], 1):  # Limiter à 20
            filename_base = f"VAR_BTN_GBC_CGS_UNKNOWN_{i}"
            filename = f"{filename_base}.jpg"
            filepath = OUTPUT_DIR / filename
            
            if filepath.exists():
                skipped += 1
                continue
            
            print(f"📥 Image {i} → {filename}")
            if download_image(img_url, filepath):
                downloaded += 1
                manual_review.append({
                    'name': f'Unknown_{i}',
                    'url': img_url,
                    'source': 'HTML',
                    'suggested_filename': filename_base
                })
            else:
                skipped += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Téléchargés: {downloaded}")
    print(f"⏭️  Ignorés: {skipped}")
    
    if manual_review:
        print(f"\n⚠️  {len(manual_review)} images nécessitent un renommage manuel:")
        for item in manual_review:
            print(f"  - {item.get('name', 'Unknown')}: {item.get('url', '')[:80]}...")
        print("\n💡 Renommez ces fichiers selon le mapping dans le seed SQL")
    
    print("\n✅ Terminé!")


if __name__ == '__main__':
    main()
