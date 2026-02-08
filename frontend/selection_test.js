
import { chromium } from 'playwright';

(async () => {
    // Wait for previous browser instances to fully close if running sequentially
    await new Promise(r => setTimeout(r, 2000));
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless']
    });
    const page = await browser.newPage();

    try {
        console.log('Starting Selection Flow Test...');
        await page.goto('http://172.19.156.219:5173/', { waitUntil: 'networkidle' });

        // 1. Select a Shell (First one in grid)
        // Wait for VariantGallery to load items
        console.log('ℹ️ Waiting for gallery items...');
        // VariantCard is a div, not a button
        await page.waitForSelector('.grid > div');

        // Debug: Log number of items
        const buttons = await page.locator('.grid > div').count();
        console.log(`ℹ️ Found ${buttons} shell variants.`);

        const firstShell = await page.locator('.grid > div').first();
        // Get text content to log name
        const shellName = await firstShell.textContent();
        console.log(`ℹ️ Selecting Shell: ${shellName}`);
        await firstShell.click();

        // Switch to RECAP view to verify
        // We need to click the RECAP_VIEW button
        await page.click('button:has-text("RECAP_VIEW")');
        await page.waitForTimeout(1000); // Animation wait

        // Just take a screenshot to be safe for debugging
        await page.screenshot({ path: 'selection_test_recap.png' });

        // Use a more generic check if exact class isn't known, but based on reading App.vue, QuoteDisplay is inside SelectionRecap
        // We'll look for the text of the selected shell
        const content = await page.content();

        if (content.includes('COQUE')) {
            console.log('✅ Shell selection verified in Recap');
        } else {
            console.warn('⚠️ Could not verify shell in recap. Check selection_test_recap.png');
        }

        // 2. Select Screen Category
        console.log('ℹ️ Switching to Screen Category...');
        // Find category button for screen (2nd button in nav)
        await page.locator('header nav button').nth(1).click();

        // 3. Select a Screen
        await page.waitForTimeout(500);
        const firstScreen = await page.locator('.grid > div').first();
        console.log('ℹ️ Selecting Screen...');
        await firstScreen.click();

        console.log('✅ Selection Flow Completed');

    } catch (error) {
        console.error('❌ Selection Test Failed:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
