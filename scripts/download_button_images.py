#!/usr/bin/env python3
"""
Script pour télécharger les images des boutons Gameboy Color depuis AliExpress
et les sauvegarder dans assets/images/buttons/ avec les bons noms de fichiers.

Usage:
    python scripts/download_button_images.py [--url URL_ALIEXPRESS]
    
Dépendances:
    pip install selenium beautifulsoup4 requests pillow
"""

import os
import sys
import time
import requests
from pathlib import Path
from urllib.parse import urljoin, urlparse
import json
import re

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("❌ Selenium n'est pas installé. Installez-le avec: pip install selenium")
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
    # Variantes possibles sur AliExpress
    'Red': 'VAR_BTN_GBC_CGS_RED',
    'Blue': 'VAR_BTN_GBC_CGS_BLUE',
    'Purple': 'VAR_BTN_GBC_CGS_PURPLE',
    'Pink': 'VAR_BTN_GBC_CGS_PINK',
    'Black': 'VAR_BTN_GBC_CGS_BLACK',
    'Green': 'VAR_BTN_GBC_CGS_GREEN',
    'White': 'VAR_BTN_GBC_CGS_WHITE',
    'Yellow': 'VAR_BTN_GBC_CGS_YELLOW',
    'Clear': 'VAR_BTN_GBC_CGS_CLEAR_RED',  # Par défaut, à ajuster manuellement
    'Transparent': 'VAR_BTN_GBC_CGS_CLEAR_RED',  # Par défaut
    'Glow': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
    'Glow in Dark': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
}

# URL par défaut
DEFAULT_URL = "https://nl.aliexpress.com/item/1005002768502107.html?pdp_npi=4%40dis!EUR!%E2%82%AC%201%2C34!%E2%82%AC%200%2C85!!!10.74!6.82!%40211b615317709839520975382ef6dc!12000022104840919!sh!BE!0!X&spm=a2g0o.store_pc_allItems_or_groupList.new_all_items_2007586145329.1005002768502107&gatewayAdapt=glo2nld"

# Dossier de destination
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "buttons"


def setup_driver(headless=False):
    """Configure et retourne un driver Selenium Chrome"""
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de Chrome: {e}")
        print("💡 Assurez-vous que ChromeDriver est installé et dans votre PATH")
        sys.exit(1)


def find_color_variants(driver, url):
    """Trouve toutes les variantes de couleurs disponibles sur la page"""
    print(f"🌐 Ouverture de la page: {url}")
    driver.get(url)
    
    # Attendre que la page charge
    time.sleep(3)
    
    variants = []
    
    try:
        # Chercher la section "Couleur" ou "Color"
        # Les variantes sont généralement dans des éléments avec des classes comme "sku-property-item" ou similaires
        color_section = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='sku'], [class*='color'], [class*='variant']"))
        )
        
        # Chercher les thumbnails de couleurs
        # AliExpress utilise souvent des images dans des divs avec des data-attributes
        color_elements = driver.find_elements(By.CSS_SELECTOR, 
            "[class*='sku-property-item'], [class*='color-item'], [data-role='sku-item'], img[alt*='color'], img[alt*='Color']")
        
        print(f"📦 Trouvé {len(color_elements)} éléments de couleur potentiels")
        
        # Alternative: chercher les images dans la section couleur
        # Les images principales changent quand on clique sur une variante
        main_images = driver.find_elements(By.CSS_SELECTOR, 
            ".images-view-item img, .product-image img, [class*='main-image'] img")
        
        for img in main_images:
            img_url = img.get_attribute('src') or img.get_attribute('data-src')
            if img_url and ('button' in img_url.lower() or 'btn' in img_url.lower()):
                # Extraire le nom de couleur depuis l'alt ou title
                alt_text = img.get_attribute('alt') or img.get_attribute('title') or ''
                variants.append({
                    'url': img_url,
                    'name': alt_text,
                    'element': img
                })
        
        # Si pas trouvé via images, essayer de cliquer sur chaque variante
        # et capturer l'image principale qui change
        color_buttons = driver.find_elements(By.CSS_SELECTOR,
            "[class*='sku-property-item'], [class*='color-item'], button[class*='color']")
        
        if color_buttons:
            print(f"🎨 Trouvé {len(color_buttons)} boutons de couleur")
            for i, btn in enumerate(color_buttons):
                try:
                    # Cliquer sur le bouton
                    driver.execute_script("arguments[0].click();", btn)
                    time.sleep(2)  # Attendre que l'image se charge
                    
                    # Récupérer l'image principale mise à jour
                    main_img = driver.find_element(By.CSS_SELECTOR,
                        ".images-view-item img, .product-image img, [class*='main-image'] img")
                    img_url = main_img.get_attribute('src') or main_img.get_attribute('data-src')
                    
                    # Récupérer le nom de la couleur
                    color_name = btn.get_attribute('title') or btn.get_attribute('alt') or btn.text or f"Color_{i}"
                    
                    if img_url:
                        variants.append({
                            'url': img_url,
                            'name': color_name.strip(),
                            'index': i
                        })
                        print(f"  ✓ Variante {i+1}: {color_name}")
                except Exception as e:
                    print(f"  ⚠️ Erreur lors du clic sur la variante {i}: {e}")
                    continue
        
    except TimeoutException:
        print("⚠️ Timeout: La section couleur n'a pas été trouvée. Tentative de méthode alternative...")
        # Méthode alternative: extraire directement les URLs d'images depuis le HTML
        page_source = driver.page_source
        
        # Chercher les URLs d'images dans le JavaScript ou les data-attributes
        img_pattern = r'https?://[^"\s]+\.(jpg|jpeg|png|webp)[^"\s]*'
        img_urls = re.findall(img_pattern, page_source)
        
        for url in set(img_urls[:20]):  # Limiter à 20 pour éviter trop d'images
            if 'button' in url.lower() or 'btn' in url.lower():
                variants.append({
                    'url': url,
                    'name': 'Unknown',
                    'source': 'regex'
                })
    
    return variants


def map_color_to_filename(color_name):
    """Mappe le nom de couleur AliExpress vers notre nom de fichier"""
    color_name_clean = color_name.strip()
    
    # Chercher une correspondance exacte
    if color_name_clean in COLOR_MAPPING:
        return COLOR_MAPPING[color_name_clean]
    
    # Chercher une correspondance partielle (insensible à la casse)
    color_lower = color_name_clean.lower()
    for key, value in COLOR_MAPPING.items():
        if key.lower() in color_lower or color_lower in key.lower():
            return value
    
    # Si transparent/clear dans le nom
    if 'transparent' in color_lower or 'clear' in color_lower:
        if 'red' in color_lower or 'rouge' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_RED'
        elif 'blue' in color_lower or 'bleu' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_BLUE'
        elif 'green' in color_lower or 'vert' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_GREEN'
        elif 'yellow' in color_lower or 'jaune' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_YELLOW'
        elif 'purple' in color_lower or 'violet' in color_lower:
            return 'VAR_BTN_GBC_CGS_CLEAR_PURPLE'
    
    # Si glow/phosphorescent
    if 'glow' in color_lower or 'phosphorescent' in color_lower:
        return 'VAR_BTN_GBC_CGS_GLOW_GREEN'
    
    # Par défaut, retourner None pour traitement manuel
    return None


def download_image(url, filepath):
    """Télécharge une image depuis une URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Sauvegarder l'image
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✅ Téléchargé: {filepath.name}")
        return True
    except Exception as e:
        print(f"  ❌ Erreur lors du téléchargement de {url}: {e}")
        return False


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Télécharge les images de boutons depuis AliExpress')
    parser.add_argument('--url', type=str, default=DEFAULT_URL,
                       help='URL de la page produit AliExpress')
    parser.add_argument('--headless', action='store_true',
                       help='Mode headless (sans interface graphique)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Affiche ce qui serait téléchargé sans télécharger')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🎮 Téléchargement des images de boutons Gameboy Color")
    print("=" * 60)
    print(f"📁 Dossier de destination: {OUTPUT_DIR}")
    print(f"🌐 URL: {args.url}")
    print()
    
    # Créer le dossier de destination
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Initialiser le driver Selenium
    driver = setup_driver(headless=args.headless)
    
    try:
        # Trouver les variantes
        variants = find_color_variants(driver, args.url)
        
        if not variants:
            print("❌ Aucune variante trouvée. Vérifiez l'URL et la structure de la page.")
            return
        
        print(f"\n📦 {len(variants)} variantes trouvées\n")
        
        downloaded = 0
        skipped = 0
        manual_review = []
        
        for i, variant in enumerate(variants, 1):
            color_name = variant.get('name', f'Unknown_{i}')
            img_url = variant.get('url', '')
            
            if not img_url:
                print(f"⚠️ Variante {i}: Pas d'URL d'image")
                skipped += 1
                continue
            
            # Mapper le nom de couleur vers notre nom de fichier
            filename_base = map_color_to_filename(color_name)
            
            if not filename_base:
                print(f"⚠️ Variante {i} ({color_name}): Mapping manuel requis")
                manual_review.append({
                    'name': color_name,
                    'url': img_url,
                    'index': i
                })
                skipped += 1
                continue
            
            filename = f"{filename_base}.jpg"
            filepath = OUTPUT_DIR / filename
            
            # Vérifier si le fichier existe déjà
            if filepath.exists() and not args.dry_run:
                print(f"⏭️  {filename}: Déjà présent, ignoré")
                skipped += 1
                continue
            
            print(f"📥 Variante {i}: {color_name} → {filename}")
            
            if not args.dry_run:
                if download_image(img_url, filepath):
                    downloaded += 1
                else:
                    skipped += 1
            else:
                print(f"  [DRY-RUN] Téléchargerait: {img_url}")
                downloaded += 1
        
        print("\n" + "=" * 60)
        print(f"✅ Téléchargés: {downloaded}")
        print(f"⏭️  Ignorés: {skipped}")
        
        if manual_review:
            print(f"\n⚠️  {len(manual_review)} variantes nécessitent un mapping manuel:")
            print("\nVariantes à mapper manuellement:")
            print(json.dumps(manual_review, indent=2, ensure_ascii=False))
            print("\n💡 Ajoutez ces mappings dans COLOR_MAPPING du script")
        
    finally:
        driver.quit()
        print("\n✅ Script terminé")


if __name__ == '__main__':
    main()
