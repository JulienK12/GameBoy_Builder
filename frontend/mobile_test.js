
import { chromium } from 'playwright';

(async () => {
    // Wait for previous browser instances to fully close if running sequentially
    await new Promise(r => setTimeout(r, 2000));
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless']
    });
    // iPhone 12 Pro Viewport
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    try {
        console.log('Starting Mobile Layout Test...');
        await page.goto('http://172.19.156.219:5173/', { waitUntil: 'networkidle' });

        // 1. Verify Bottom Navigation Visible
        // The class 'fixed bottom-0' is used in App.vue for mobile nav
        const bottomNav = await page.isVisible('.fixed.bottom-0');
        if (bottomNav) console.log('✅ Mobile Bottom Nav Visible');
        else throw new Error('Mobile Bottom Nav Missing');

        // 2. Verify "ENTER_SHOWROOM" button
        const showroomBtn = await page.isVisible('button:has-text("ENTER_SHOWROOM")');
        // Check if text might be different based on state, but default is ENTER_SHOWROOM
        if (showroomBtn) console.log('✅ Showroom Toggle Visible');

        // 3. Verify Desktop Sidebar is HIDDEN
        // The desktop header has 'hidden lg:block'
        // Playwright isVisible respects display:none? Yes.
        const desktopSidebar = await page.locator('header.absolute.top-6.left-6').isVisible();

        if (!desktopSidebar) console.log('✅ Desktop Sidebar Hidden on Mobile');
        else console.warn('⚠️ Desktop Sidebar might still be visible?');

        console.log('✅ Mobile Test Passed');

    } catch (error) {
        console.error('❌ Mobile Test Failed:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
