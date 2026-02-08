
import { chromium } from 'playwright';

(async () => {
    // Wait for previous browser instances to fully close if running sequentially
    await new Promise(r => setTimeout(r, 2000));
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless']
    });

    try {
        console.log('Starting UI Audit...');
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

        // 1. Desktop View
        await page.goto('http://172.19.156.219:5173/', { waitUntil: 'networkidle' });
        // Wait for 3D or initial load
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'audit_desktop.png', fullPage: true });
        console.log('📸 Desktop screenshot saved');

        // 2. Hover State (Simulate hover on sidebar button)
        // Try to hover over the "SCREEN" category if it exists
        // Sidebar is hidden on mobile, visible on desktop
        // We need a robust selector. Based on App.vue: header nav button
        try {
            const firstCatBtn = page.locator('header nav button').first();
            if (await firstCatBtn.count() > 0) {
                await firstCatBtn.hover();
                await page.waitForTimeout(500);
                await page.screenshot({ path: 'audit_hover.png' });
                console.log('📸 Hover screenshot saved');
            } else {
                console.log('⚠️ Could not find desktop sidebar buttons for hover test');
            }
        } catch (e) {
            console.log('⚠️ Hover test failed:', e.message);
        }

        // 3. Mobile View
        const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
        await mobilePage.goto('http://172.19.156.219:5173/', { waitUntil: 'networkidle' });
        await mobilePage.waitForTimeout(2000);
        await mobilePage.screenshot({ path: 'audit_mobile.png', fullPage: true });
        console.log('📸 Mobile screenshot saved');
        await mobilePage.close();

    } catch (error) {
        console.error('❌ Audit Failed:', error);
    } finally {
        await browser.close();
    }
})();
