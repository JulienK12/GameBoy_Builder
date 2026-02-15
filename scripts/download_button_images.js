#!/usr/bin/env node
/**
 * Script pour télécharger les images des boutons Gameboy Color depuis AliExpress
 * Utilise Playwright (déjà installé dans le projet)
 * 
 * Usage:
 *   node scripts/download_button_images.js
 */

const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const URL = 'https://fr.aliexpress.com/item/1005002768502107.html?pdp_npi=4%40dis%21EUR%21%E2%82%AC%201%2C34%21%E2%82%AC%200%2C85%21%21%2110.74%216.82%21%40211b615317709839520975382ef6dc%2112000022104840919%21sh%21BE%210%21X&spm=a2g0o.store_pc_allItems_or_groupList.new_all_items_2007586145329.1005002768502107&gatewayAdapt=glo2fra';
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'images', 'buttons');

// Mapping des couleurs vers nos noms de fichiers
const COLOR_MAPPING = {
  // Couleurs solides
  'Rouge': 'VAR_BTN_GBC_CGS_RED',
  'Bleu': 'VAR_BTN_GBC_CGS_BLUE',
  'Violet': 'VAR_BTN_GBC_CGS_PURPLE',
  'Rose': 'VAR_BTN_GBC_CGS_PINK',
  'Noir': 'VAR_BTN_GBC_CGS_BLACK',
  'Vert': 'VAR_BTN_GBC_CGS_GREEN',
  'Blanc': 'VAR_BTN_GBC_CGS_WHITE',
  'Jaune': 'VAR_BTN_GBC_CGS_YELLOW',
  // Couleurs transparentes
  'Rouge Transparent': 'VAR_BTN_GBC_CGS_CLEAR_RED',
  'Jaune Transparent': 'VAR_BTN_GBC_CGS_CLEAR_YELLOW',
  'Vert Transparent': 'VAR_BTN_GBC_CGS_CLEAR_GREEN',
  'Bleu Transparent': 'VAR_BTN_GBC_CGS_CLEAR_BLUE',
  'Bleu Clair Transparent': 'VAR_BTN_GBC_CGS_CLEAR_LIGHT',
  'Violet Transparent': 'VAR_BTN_GBC_CGS_CLEAR_PURPLE',
  // Phosphorescent
  'Vert Phosphorescent': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
  // Variantes possibles
  'Red': 'VAR_BTN_GBC_CGS_RED',
  'Blue': 'VAR_BTN_GBC_CGS_BLUE',
  'Purple': 'VAR_BTN_GBC_CGS_PURPLE',
  'Pink': 'VAR_BTN_GBC_CGS_PINK',
  'Black': 'VAR_BTN_GBC_CGS_BLACK',
  'Green': 'VAR_BTN_GBC_CGS_GREEN',
  'White': 'VAR_BTN_GBC_CGS_WHITE',
  'Yellow': 'VAR_BTN_GBC_CGS_YELLOW',
  'Clear': 'VAR_BTN_GBC_CGS_CLEAR_RED',
  'Transparent': 'VAR_BTN_GBC_CGS_CLEAR_RED',
  'Glow': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
  'Glow in Dark': 'VAR_BTN_GBC_CGS_GLOW_GREEN',
  // Néerlandais
  'Rood': 'VAR_BTN_GBC_CGS_RED',
  'Roze': 'VAR_BTN_GBC_CGS_PINK',
  'Blauw': 'VAR_BTN_GBC_CGS_BLUE',
  'Geel': 'VAR_BTN_GBC_CGS_YELLOW',
  'Groen': 'VAR_BTN_GBC_CGS_GREEN',
  'Zwart': 'VAR_BTN_GBC_CGS_BLACK',
  'Wit': 'VAR_BTN_GBC_CGS_WHITE',
  'Paars': 'VAR_BTN_GBC_CGS_PURPLE',
  'Duidelijk': 'VAR_BTN_GBC_CGS_CLEAR_RED', // Clear en néerlandais
  'fluorescence': 'VAR_BTN_GBC_CGS_GLOW_GREEN', // Fluorescent = glow green
  'claret': 'VAR_BTN_GBC_CGS_RED', // Claret = rouge foncé
  'Lichtpaars': 'VAR_BTN_GBC_CGS_CLEAR_PURPLE', // Light purple
  'Ice blue': 'VAR_BTN_GBC_CGS_CLEAR_LIGHT',
  'Clear blue': 'VAR_BTN_GBC_CGS_CLEAR_BLUE',
  'Clear green': 'VAR_BTN_GBC_CGS_CLEAR_GREEN',
  'Clear yellow': 'VAR_BTN_GBC_CGS_CLEAR_YELLOW',
  'Clear orange': 'VAR_BTN_GBC_CGS_CLEAR_RED', // Orange transparent -> rouge transparent
  'Orange clair': 'VAR_BTN_GBC_CGS_CLEAR_RED', // Orange clair = orange transparent -> rouge transparent
  'Clear black': 'VAR_BTN_GBC_CGS_BLACK', // Black transparent -> noir
  'Noir clair': 'VAR_BTN_GBC_CGS_BLACK', // Noir clair = noir transparent -> noir
  'Violet clair': 'VAR_BTN_GBC_CGS_CLEAR_PURPLE', // Violet clair = violet transparent
  'Light green': 'VAR_BTN_GBC_CGS_CLEAR_GREEN',
  'Vert clair': 'VAR_BTN_GBC_CGS_CLEAR_GREEN', // Vert clair = vert transparent
  'Bleu clair': 'VAR_BTN_GBC_CGS_CLEAR_BLUE', // Bleu clair = bleu transparent (différent de Bleu glacé)
  'Jaune clair': 'VAR_BTN_GBC_CGS_CLEAR_YELLOW', // Jaune clair = jaune transparent
  'Red blue green': 'VAR_BTN_GBC_CGS_CLEAR_RED', // Multi-color -> par défaut
  'zwart': 'VAR_BTN_GBC_CGS_BLACK', // zwart = noir (minuscule)
  'groen': 'VAR_BTN_GBC_CGS_GREEN', // groen = vert (minuscule)
};

function mapColorToFilename(colorName) {
  if (!colorName) return null;
  
  const clean = colorName.trim();
  
  // Correspondance exacte
  if (COLOR_MAPPING[clean]) {
    return COLOR_MAPPING[clean];
  }
  
  // Correspondance partielle
  const lower = clean.toLowerCase();
  for (const [key, value] of Object.entries(COLOR_MAPPING)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Détection transparent/clear (néerlandais: Duidelijk = Clear)
  if (lower.includes('transparent') || lower.includes('clear') || lower.includes('duidelijk')) {
    if (lower.includes('red') || lower.includes('rood') || lower.includes('rouge')) return 'VAR_BTN_GBC_CGS_CLEAR_RED';
    if (lower.includes('blue') || lower.includes('blauw') || lower.includes('bleu')) {
      if (lower.includes('light') || lower.includes('licht') || lower.includes('clair')) return 'VAR_BTN_GBC_CGS_CLEAR_LIGHT';
      return 'VAR_BTN_GBC_CGS_CLEAR_BLUE';
    }
    if (lower.includes('green') || lower.includes('groen') || lower.includes('vert')) return 'VAR_BTN_GBC_CGS_CLEAR_GREEN';
    if (lower.includes('yellow') || lower.includes('geel') || lower.includes('jaune')) return 'VAR_BTN_GBC_CGS_CLEAR_YELLOW';
    if (lower.includes('purple') || lower.includes('paars') || lower.includes('violet')) return 'VAR_BTN_GBC_CGS_CLEAR_PURPLE';
  }
  
  // Détection glow/phosphorescent
  if (lower.includes('glow') || lower.includes('phosphorescent') || lower.includes('gloeiend')) {
    return 'VAR_BTN_GBC_CGS_GLOW_GREEN';
  }
  
  // Mapping néerlandais -> français
  const nlToFr = {
    'rood': 'red', 'roze': 'pink', 'blauw': 'blue', 'geel': 'yellow',
    'groen': 'green', 'zwart': 'black', 'wit': 'white', 'paars': 'purple',
  };
  
  for (const [nl, fr] of Object.entries(nlToFr)) {
    if (lower.includes(nl)) {
      return mapColorToFilename(fr);
    }
  }
  
  return null;
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': URL
      }
    };
    
    client.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('image')) {
        reject(new Error(`Not an image: ${contentType}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`  ✅ ${path.basename(filepath)} (${sizeKB} KB)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function findColorVariants(page) {
  const variants = [];
  
  console.log('🔍 Recherche des variantes de couleurs...');
  
  // Attendre que la page soit chargée
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Attendre le chargement complet
  
  // Chercher les boutons de sélection de couleur
  const colorSelectors = [
    '[class*="sku-property-item"]',
    '[class*="color-item"]',
    '[class*="sku-item"]',
    '[data-role="sku-item"]',
    'button[class*="color"]',
    '.sku-property-item',
  ];
  
  let colorElements = [];
  for (const selector of colorSelectors) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      colorElements = elements;
      console.log(`  ✓ Trouvé ${elements.length} éléments avec: ${selector}`);
      break;
    }
  }
  
  if (colorElements.length === 0) {
    console.log('  ⚠️  Aucun élément de couleur trouvé, recherche des images directement...');
    const images = await page.$$('img[src*="alicdn.com/kf/"]');
    console.log(`  ✓ Trouvé ${images.length} images alicdn.com`);
    
    for (let i = 0; i < images.length; i++) {
      const src = await images[i].getAttribute('src') || await images[i].getAttribute('data-src');
      if (src && src.includes('/kf/') && src.includes('.jpg')) {
        const alt = await images[i].getAttribute('alt') || 'Unknown';
        variants.push({
          url: src,
          name: alt,
          index: i
        });
      }
    }
    return variants;
  }
  
  console.log(`  📦 ${colorElements.length} variantes trouvées`);
  
  // Cliquer sur "Meer Weergeven" (Voir plus) pour afficher toutes les variantes
  try {
    const voirPlusSelectors = [
      'text="Voir plus"',
      'text="Voir plus ✓"',
      'text="Meer Weergeven"',
      'text="See more"',
      '[class*="see-more"]',
      '[class*="view-more"]',
      'button:has-text("Voir plus")',
      'button:has-text("Meer")',
    ];
    
    for (const selector of voirPlusSelectors) {
      try {
        const voirPlus = await page.$(selector);
        if (voirPlus) {
          const buttonText = await voirPlus.textContent();
          console.log(`  📖 Clic sur "${buttonText.trim()}" pour révéler toutes les variantes...`);
          await voirPlus.click();
          await page.waitForTimeout(3000); // Attendre que les variantes se chargent
          
          // Re-chercher les éléments après le clic
          colorElements = [];
          for (const sel of colorSelectors) {
            const elements = await page.$$(sel);
            if (elements.length > 0) {
              colorElements = elements;
              console.log(`  ✓ ${elements.length} variantes trouvées après "Voir plus"`);
              break;
            }
          }
          break;
        }
      } catch (e) {
        // Continuer avec le prochain sélecteur
      }
    }
  } catch (error) {
    console.log(`  ⚠️  Impossible de cliquer sur "Meer Weergeven": ${error.message}`);
  }
  
  // Sélecteurs pour l'image principale
  const mainImageSelectors = [
    '.images-view-item img',
    '.product-image img',
    '[class*="main-image"] img',
    '.gallery-image img',
    'img[class*="product"]',
  ];
  
  // Analyser chaque variante SANS cliquer ni faire défiler (analyse de la page actuelle uniquement)
  for (let i = 0; i < colorElements.length; i++) {
    try {
      // Vérifier si l'élément est visible dans le viewport (sans scroll)
      const isInViewport = await colorElements[i].evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 && 
               rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
               rect.right <= (window.innerWidth || document.documentElement.clientWidth);
      });
      
      if (!isInViewport) {
        // Ignorer les éléments hors viewport pour ne pas faire défiler
        continue;
      }
      
      // Obtenir le nom de la couleur depuis l'image dans le bouton ou le texte
      let colorName = null;
      
      // Chercher une image dans l'élément (les thumbnails de couleur)
      const imgInElement = await colorElements[i].$('img');
      if (imgInElement) {
        colorName = await imgInElement.getAttribute('alt') || 
                   await imgInElement.getAttribute('title') ||
                   await imgInElement.getAttribute('data-value');
      }
      
      // Sinon, chercher dans le texte ou les attributs
      if (!colorName) {
        const text = await colorElements[i].textContent();
        // Extraire le nom de couleur depuis le texte (enlever "Couleur:", "Voir plus", etc.)
        if (text) {
          colorName = text
            .replace(/Couleur:\s*/gi, '')
            .replace(/Kleur:\s*/gi, '')
            .replace(/Color:\s*/gi, '')
            .replace(/Voir plus.*/gi, '')
            .replace(/Meer Weergeven.*/gi, '')
            .replace(/See more.*/gi, '')
            .replace(/^\s*✓\s*/, '') // Enlever le checkmark
            .trim();
        }
      }
      
      // Sinon, chercher dans les attributs
      if (!colorName) {
        colorName = await colorElements[i].getAttribute('title') ||
                   await colorElements[i].getAttribute('alt') ||
                   await colorElements[i].getAttribute('data-value') ||
                   await colorElements[i].getAttribute('aria-label');
      }
      
      if (!colorName || colorName.length < 2) {
        colorName = `Color_${i + 1}`;
      }
      
      colorName = colorName.trim();
      console.log(`  🎨 Variante ${i + 1}: ${colorName}`);
      
      // Obtenir l'URL de l'image depuis le thumbnail (si disponible)
      let imgUrl = null;
      if (imgInElement) {
        imgUrl = await imgInElement.getAttribute('src') || 
                 await imgInElement.getAttribute('data-src');
        if (imgUrl) {
          // Nettoyer l'URL : enlever les paramètres de requête, suffixes de taille, etc.
          imgUrl = imgUrl.split('?')[0]; // Enlever les query params
          
          // Gérer les URLs AliExpress avec différents formats
          if (imgUrl.includes('alicdn.com/kf/')) {
            // Extraire l'ID de l'image (le hash après /kf/, peut contenir des lettres et chiffres)
            // Format: /kf/H1bb77e97334349fbb073630dd9423f39U.jpg ou /kf/H1bb77e97334349fbb073630dd9423f39U
            const match = imgUrl.match(/\/kf\/([A-Za-z0-9]+)/);
            if (match) {
              const imageId = match[1];
              // Essayer différents domaines AliExpress (ae01, ae-pic-a1, etc.)
              // Utiliser le domaine original si disponible, sinon ae01
              const domainMatch = imgUrl.match(/https?:\/\/([^\/]+)/);
              const domain = domainMatch ? domainMatch[1] : 'ae01.alicdn.com';
              imgUrl = `https://${domain}/kf/${imageId}.jpg`;
            }
          } else {
            // Pour les autres URLs, nettoyer les suffixes de taille et formats
            imgUrl = imgUrl
              .replace(/_\d+x\d+/g, '') // Enlever _50x50, _220x220, etc.
              .replace(/q\d+\.jpg/g, '.jpg') // Enlever q75.jpg, etc.
              .replace(/\.jpgq\d+\.jpg/g, '.jpg') // Enlever .jpgq75.jpg_.jpg
              .replace(/\.avif$/i, '.jpg')
              .replace(/\.webp$/i, '.jpg');
          }
        }
      }
      
      // Si pas d'URL depuis le thumbnail, chercher l'image principale actuellement visible
      if (!imgUrl) {
        // Trouver l'image principale actuellement visible (sans cliquer)
        for (const selector of mainImageSelectors) {
          const img = await page.$(selector);
          if (img) {
            const imgVisible = await img.evaluate(el => {
              const rect = el.getBoundingClientRect();
              return rect.top >= 0 && rect.left >= 0 && 
                     rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                     rect.right <= (window.innerWidth || document.documentElement.clientWidth);
            });
            
            if (imgVisible) {
              imgUrl = await img.getAttribute('src') || await img.getAttribute('data-src');
              if (imgUrl && imgUrl.includes('/kf/')) {
                // Nettoyer l'URL (enlever avif, paramètres de taille, etc.)
                imgUrl = imgUrl.split('?')[0]; // Enlever les query params
                
                // Extraire l'ID de l'image et reconstruire l'URL propre
                const match = imgUrl.match(/\/kf\/([A-Za-z0-9]+)/);
                if (match) {
                  const imageId = match[1];
                  const domainMatch = imgUrl.match(/https?:\/\/([^\/]+)/);
                  const domain = domainMatch ? domainMatch[1] : 'ae01.alicdn.com';
                  imgUrl = `https://${domain}/kf/${imageId}.jpg`;
                } else {
                  // Fallback: nettoyage simple
                  imgUrl = imgUrl
                    .replace(/\.avif$/i, '.jpg')
                    .replace(/\.webp$/i, '.jpg')
                    .replace(/_\d+x\d+/g, '')
                    .replace(/q\d+\.jpg/g, '.jpg');
                }
                break;
              }
            }
          }
        }
      }
      
      if (imgUrl) {
        // Nettoyer les URLs malformées (ex: .jpg.jpg_.jpg)
        imgUrl = imgUrl.replace(/\.jpg\.jpg.*?\.jpg/g, '.jpg');
        imgUrl = imgUrl.replace(/\.jpgq75\.jpg.*?\.jpg/g, '.jpg');
        imgUrl = imgUrl.replace(/\.jpg.*?\.jpg/g, '.jpg'); // Enlever les doublons .jpg
        imgUrl = imgUrl.split('?')[0]; // Enlever les paramètres de requête
        
        // S'assurer que c'est une URL JPG valide
        if (!imgUrl.includes('.jpg') && !imgUrl.includes('.jpeg')) {
          imgUrl = imgUrl.replace(/\.(avif|webp|png)$/, '.jpg');
        }
        
        // Si l'URL contient encore des caractères étranges, essayer de la nettoyer davantage
        if (imgUrl.includes('alicdn.com/kf/')) {
          // Extraire l'ID de l'image et reconstruire l'URL proprement
          const match = imgUrl.match(/\/kf\/([A-Za-z0-9]+)/);
          if (match) {
            imgUrl = `https://ae01.alicdn.com/kf/${match[1]}.jpg`;
          }
        }
        
        variants.push({
          url: imgUrl,
          name: colorName,
          index: i
        });
        console.log(`    ✓ Image trouvée: ${imgUrl.substring(0, 80)}...`);
      } else {
        console.log(`    ⚠️  Image principale non trouvée pour cette variante`);
      }
    } catch (error) {
      console.log(`    ❌ Erreur lors du traitement de la variante ${i + 1}: ${error.message}`);
    }
  }
  
  
  return variants;
}

async function main() {
  console.log('='.repeat(60));
  console.log('🎮 Téléchargement des images de boutons avec Playwright');
  console.log('='.repeat(60));
  console.log(`📁 Dossier: ${OUTPUT_DIR}`);
  console.log(`🌐 URL: ${URL}`);
  console.log();
  
  // Créer le dossier
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'fr-FR', // Forcer la langue française
    acceptLanguage: 'fr-FR,fr;q=0.9',
    // Forcer la géolocalisation et la langue française
    geolocation: { latitude: 50.5039, longitude: 4.4699 }, // Belgique
    permissions: ['geolocation']
  });
  const page = await context.newPage();
  
  try {
    console.log(`🌐 Ouverture de la page: ${URL}`);
    
    // Définir les cookies pour forcer la langue française AVANT de charger la page
    await context.addCookies([
      {
        name: 'aep_usuc_f',
        value: 'site=fr&region=BE&b_locale=fr_FR&c_tp=EUR',
        domain: '.aliexpress.com',
        path: '/',
      },
      {
        name: 'x_locale',
        value: 'fr_FR',
        domain: '.aliexpress.com',
        path: '/',
      },
      {
        name: 'x_l',
        value: '0_0',
        domain: '.aliexpress.com',
        path: '/',
      },
    ]);
    
    // Forcer la langue française via les headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'fr-FR,fr;q=0.9',
    });
    
    await page.goto(URL, { waitUntil: 'networkidle' });
    
    // Attendre un peu et vérifier l'URL actuelle
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`  📍 URL actuelle: ${currentUrl}`);
    
    // Si l'URL a changé vers nl, forcer la redirection vers fr avec les cookies
    if (currentUrl.includes('nl.aliexpress.com')) {
      console.log('  ⚠️  Détection d\'une redirection vers nl.aliexpress.com, correction...');
      const correctedUrl = currentUrl.replace('nl.aliexpress.com', 'fr.aliexpress.com').replace('gatewayAdapt=fra2nld', 'gatewayAdapt=glo2fra');
      
      // Re-définir les cookies avant la redirection
      await context.addCookies([
        {
          name: 'aep_usuc_f',
          value: 'site=fr&region=BE&b_locale=fr_FR&c_tp=EUR',
          domain: '.aliexpress.com',
          path: '/',
        },
        {
          name: 'x_locale',
          value: 'fr_FR',
          domain: '.aliexpress.com',
          path: '/',
        },
      ]);
      
      await page.goto(correctedUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // Vérifier à nouveau
      const finalUrl = page.url();
      if (finalUrl.includes('fr.aliexpress.com')) {
        console.log('  ✅ Page ouverte en français');
      } else {
        console.log(`  ⚠️  URL finale: ${finalUrl}`);
      }
    } else if (currentUrl.includes('fr.aliexpress.com')) {
      console.log('  ✅ Page ouverte en français');
    }
    
    // La page est déjà en français grâce à l'URL, pas besoin de changer la langue
    console.log('✅ Page ouverte en français');
    await page.waitForTimeout(2000);
    
    // Trouver les variantes
    const variants = await findColorVariants(page);
    
    if (variants.length === 0) {
      console.log('❌ Aucune variante trouvée');
      return;
    }
    
    console.log(`\n📦 ${variants.length} variantes trouvées\n`);
    
    let downloaded = 0;
    let skipped = 0;
    const manualReview = [];
    
    // Télécharger chaque variante
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const colorName = variant.name || `Unknown_${i + 1}`;
      const imgUrl = variant.url || '';
      
      if (!imgUrl) {
        console.log(`⚠️  Variante ${i + 1} (${colorName}): Pas d'URL`);
        skipped++;
        continue;
      }
      
      // Mapper le nom de couleur
      const filenameBase = mapColorToFilename(colorName);
      
      if (!filenameBase) {
        console.log(`⚠️  Variante ${i + 1} (${colorName}): Mapping manuel requis`);
        manualReview.push({
          name: colorName,
          url: imgUrl,
          index: i + 1
        });
        skipped++;
        continue;
      }
      
      const filename = `${filenameBase}.jpg`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      if (fs.existsSync(filepath)) {
        console.log(`⏭️  ${filename}: Déjà présent`);
        skipped++;
        continue;
      }
      
      console.log(`📥 [${i + 1}/${variants.length}] ${colorName} → ${filename}`);
      
      try {
        await downloadImage(imgUrl, filepath);
        downloaded++;
      } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
        skipped++;
      }
      console.log();
    }
    
    console.log('='.repeat(60));
    console.log(`✅ Téléchargés: ${downloaded}`);
    console.log(`⏭️  Ignorés: ${skipped}`);
    
    if (manualReview.length > 0) {
      console.log(`\n⚠️  ${manualReview.length} variantes nécessitent un mapping manuel:`);
      console.log(JSON.stringify(manualReview, null, 2));
      console.log('\n💡 Ajoutez ces mappings dans COLOR_MAPPING du script');
    }
    
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Terminé!');
}

main().catch(console.error);
