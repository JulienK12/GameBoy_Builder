import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless']
    });
    const page = await browser.newPage();
    try {
        console.log('Navigating to http://172.19.156.219:5173...');
        await page.goto('http://172.19.156.219:5173', { waitUntil: 'networkidle', timeout: 30000 });
        console.log('Page loaded. Taking screenshot...');
        await page.screenshot({ path: 'frontend_manual_screenshot.png', fullPage: true });
        console.log('Screenshot saved to frontend_manual_screenshot.png');
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        await browser.close();
    }
})();
