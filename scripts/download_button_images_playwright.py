#!/usr/bin/env python3
"""
Script pour télécharger les images des boutons Gameboy Color depuis AliExpress
Utilise Playwright (plus moderne et déjà utilisé dans le projet)

Usage:
    python scripts/download_button_images_playwright.py
"""

import os
import sys
import re
import requests
from pathlib import Path
import json

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("❌ Playwright n'est pas installé.")
    print("💡 Installez-le avec: pip install playwright")
    print("   Puis: playwright install chromium")
    sys.exit(1)

# URL de la page AliExpress
URL = "https://nl.aliexpress.com/item/1005002768502107.html"

# Dossier de destination
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "buttons"

# Mapping des couleurs vers nos noms de fichiers
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
    'Clear': 'VAR_BTN_GBC_CGS_CLEAR_RED',  # Par défaut
    'Transparent': 'VAR_BTN_GBC_CGS_CLEAR_RED',  # Par défaut
    'Glow': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
    'Glow in Dark': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
}


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


def find_color_variants(page):
    """Trouve toutes les variantes de couleurs sur la page"""
    variants = []
    
    print("🔍 Recherche des variantes de couleurs...")
    
    # Attendre que la page soit chargée
    page.wait_for_load_state('networkidle')
    
    # Chercher la section "Couleur" ou les boutons de sélection de couleur
    # AliExpress utilise souvent des éléments avec des classes comme "sku-property-item"
    color_selectors = [
        '[class*="sku-property-item"]',
        '[class*="color-item"]',
        '[class*="sku-item"]',
        '[data-role="sku-item"]',
        'button[class*="color"]',
        '.sku-property-item',
    ]
    
    color_elements = []
    for selector in color_selectors:
        elements = page.query_selector_all(selector)
        if elements:
            color_elements = elements
            print(f"  ✓ Trouvé {len(elements)} éléments avec: {selector}")
            break
    
    if not color_elements:
        print("  ⚠️  Aucun élément de couleur trouvé avec les sélecteurs standards")
        # Essayer de trouver toutes les images de boutons directement
        images = page.query_selector_all('img[src*="alicdn.com/kf/"]')
        print(f"  ✓ Trouvé {len(images)} images alicdn.com")
        for img in images:
            src = img.get_attribute('src') or img.get_attribute('data-src')
            if src and '/kf/' in src and '.jpg' in src.lower():
                variants.append({
                    'url': src,
                    'name': img.get_attribute('alt') or 'Unknown',
                    'element': img
                })
        return variants
    
    print(f"  📦 {len(color_elements)} variantes trouvées")
    
    # Cliquer sur chaque variante et capturer l'image principale
    main_image_selector = [
        '.images-view-item img',
        '.product-image img',
        '[class*="main-image"] img',
        '.gallery-image img',
        'img[class*="product"]',
    ]
    
    for i, element in enumerate(color_elements):
        try:
            # Obtenir le nom de la couleur
            color_name = (
                element.get_attribute('title') or
                element.get_attribute('alt') or
                element.text_content() or
                element.get_attribute('data-value') or
                f"Color_{i+1}"
            ).strip()
            
            print(f"  🎨 Variante {i+1}: {color_name}")
            
            # Cliquer sur l'élément
            element.click()
            
            # Attendre que l'image se charge (attendre un changement dans le réseau)
            page.wait_for_timeout(2000)  # 2 secondes pour que l'image se charge
            
            # Trouver l'image principale mise à jour
            img_url = None
            for selector in main_image_selector:
                img = page.query_selector(selector)
                if img:
                    img_url = img.get_attribute('src') or img.get_attribute('data-src')
                    if img_url and '/kf/' in img_url:
                        break
            
            if img_url:
                # Nettoyer l'URL
                img_url = img_url.split('?')[0]
                img_url = re.sub(r'_\d+x\d+', '', img_url)
                
                variants.append({
                    'url': img_url,
                    'name': color_name,
                    'index': i
                })
                print(f"    ✓ Image trouvée: {img_url[:80]}...")
            else:
                print(f"    ⚠️  Image principale non trouvée pour cette variante")
        
        except Exception as e:
            print(f"    ❌ Erreur lors du clic sur la variante {i+1}: {e}")
            continue
    
    # Si "Voir plus" existe, cliquer dessus pour révéler plus de variantes
    try:
        voir_plus = page.query_selector('text="Voir plus"') or page.query_selector('[class*="see-more"]')
        if voir_plus:
            print("  📖 Clic sur 'Voir plus' pour révéler plus de variantes...")
            voir_plus.click()
            page.wait_for_timeout(2000)
            
            # Répéter la recherche
            new_elements = page.query_selector_all('[class*="sku-property-item"], [class*="color-item"]')
            if len(new_elements) > len(color_elements):
                print(f"  ✓ {len(new_elements) - len(color_elements)} variantes supplémentaires trouvées")
                # Traiter les nouvelles variantes...
    except Exception as e:
        print(f"  ⚠️  Impossible de cliquer sur 'Voir plus': {e}")
    
    return variants


def main():
    print("=" * 60)
    print("🎮 Téléchargement des images de boutons avec Playwright")
    print("=" * 60)
    print(f"📁 Dossier: {OUTPUT_DIR}")
    print(f"🌐 URL: {URL}")
    print()
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    downloaded = 0
    skipped = 0
    manual_review = []
    
    with sync_playwright() as p:
        print("🚀 Démarrage de Chromium...")
        browser = p.chromium.launch(headless=False)  # headless=False pour voir ce qui se passe
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        try:
            print(f"🌐 Ouverture de la page: {URL}")
            page.goto(URL, wait_until='networkidle')
            page.wait_for_timeout(3000)  # Attendre le chargement complet
            
            # Trouver les variantes
            variants = find_color_variants(page)
            
            if not variants:
                print("❌ Aucune variante trouvée")
                return
            
            print(f"\n📦 {len(variants)} variantes trouvées\n")
            
            # Télécharger chaque variante
            for i, variant in enumerate(variants, 1):
                color_name = variant.get('name', f'Unknown_{i}')
                img_url = variant.get('url', '')
                
                if not img_url:
                    print(f"⚠️  Variante {i} ({color_name}): Pas d'URL")
                    skipped += 1
                    continue
                
                # Mapper le nom de couleur
                filename_base = map_color_to_filename(color_name)
                
                if not filename_base:
                    print(f"⚠️  Variante {i} ({color_name}): Mapping manuel requis")
                    manual_review.append({
                        'name': color_name,
                        'url': img_url,
                        'index': i
                    })
                    skipped += 1
                    continue
                
                filename = f"{filename_base}.jpg"
                filepath = OUTPUT_DIR / filename
                
                if filepath.exists():
                    print(f"⏭️  {filename}: Déjà présent")
                    skipped += 1
                    continue
                
                print(f"📥 [{i}/{len(variants)}] {color_name} → {filename}")
                
                if download_image(img_url, filepath):
                    downloaded += 1
                else:
                    skipped += 1
                print()
        
        finally:
            browser.close()
    
    print("=" * 60)
    print(f"✅ Téléchargés: {downloaded}")
    print(f"⏭️  Ignorés: {skipped}")
    
    if manual_review:
        print(f"\n⚠️  {len(manual_review)} variantes nécessitent un mapping manuel:")
        print(json.dumps(manual_review, indent=2, ensure_ascii=False))
        print("\n💡 Ajoutez ces mappings dans COLOR_MAPPING du script")
    
    print("\n✅ Terminé!")


if __name__ == '__main__':
    main()
