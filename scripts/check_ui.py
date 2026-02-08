from playwright.sync_api import sync_playwright
import time
import os

def run():
    print("🚀 Starting Playwright manual check...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("🌐 Navigating to http://localhost:5173...")
            page.goto('http://localhost:5173', timeout=60000)
            
            # Attendre que le modèle 3D soit chargé (simple timeout pour l'exemple)
            print("⌛ Waiting for page to stabilize...")
            time.sleep(5)
            
            screenshot_path = os.path.abspath('configurator_check.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"✅ Screenshot saved to: {screenshot_path}")
            
            # Vérifier les erreurs de console
            page.on("console", lambda msg: print(f"🖥️ Browser Console: {msg.text}"))
            
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
