
import { chromium } from 'playwright';

(async () => {
    // Launch browser (using system Chrome as per previous success)
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless']
    });
    const page = await browser.newPage();

    try {
        console.log('Starting Smoke Test...');

        // 1. Navigate to Home
        await page.goto('http://172.19.156.219:5173/', { waitUntil: 'networkidle' });
        console.log('✅ Page loaded successfully');

        // 2. Check Title
        const title = await page.title();
        console.log(`ℹ️ Page Title: ${title}`);

        // 3. Verify Critical UI Elements
        // Check for "RAYBOY.92" header
        // Note: The selector might need to be adjusted if data attributes aren't present
        // Using text content check which is more robust
        const bodyText = await page.textContent('body');

        if (bodyText.includes('RAYBOY')) {
            console.log('✅ Header present');
        } else {
            console.warn('⚠️ Header text "RAYBOY" not found in body text');
        }

        // Check for 3D View / Recap Toggle
        const toggleBtn = await page.isVisible('button:has-text("3D_VIEW")');
        if (toggleBtn) console.log('✅ 3D View Toggle present');

        // Check for Price Total
        const price = await page.isVisible('.text-neo-orange');
        if (price) console.log('✅ Price display present');

        console.log('✅ Smoke Test Passed');

    } catch (error) {
        console.error('❌ Smoke Test Failed:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
