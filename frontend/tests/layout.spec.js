import { test, expect } from '@playwright/test';

test.describe('Cyber-Showroom Layout Verification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for the 3D model to potentially load (or at least the app to be ready)
        await page.waitForLoadState('networkidle');
    });

    test('should display floating glassmorphic panels on desktop', async ({ page, isMobile }) => {
        test.skip(isMobile, 'Desktop only feature');

        // Check Branding Header
        const header = page.locator('header.lg\\:block');
        await expect(header).toBeVisible({ timeout: 15000 });

        // Check Variant Gallery (Nested in aside)
        const gallery = page.locator('aside .glass-premium').first();
        await expect(gallery).toBeVisible({ timeout: 15000 });

        // Check Quote Panel (Nested in aside)
        const quote = page.locator('aside .glass-premium').last();
        await expect(quote).toBeVisible({ timeout: 15000 });

        // Capture Desktop Proof
        await page.screenshot({ path: 'tests/screenshots/desktop_framing.png', fullPage: true });
    });

    test('should display mobile bottom navigation and horizontal gallery on mobile', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only feature');

        // Check Bottom Nav
        const bottomNav = page.locator('div.lg\\:hidden.fixed.bottom-0');
        await expect(bottomNav).toBeVisible({ timeout: 15000 });

        // Check Horizontal Gallery
        const gallery = page.locator('.flex-row.overflow-x-auto');
        await expect(gallery).toBeVisible({ timeout: 15000 });
    });

    test('should toggle mobile quote sheet', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only feature');

        const toggleButton = page.locator('button:has-text("DETAIL")');
        await expect(toggleButton).toBeVisible({ timeout: 10000 });

        // Toggle up
        await toggleButton.click();
        await expect(page.locator('button:has-text("FERMER")')).toBeVisible({ timeout: 5000 });

        // Capture Normal Mobile View
        await page.screenshot({ path: 'tests/screenshots/mobile_normal.png' });

        // Toggle Showroom Mode
        await page.locator('button:has-text("ENTER_SHOWROOM")').click();
        await expect(page.locator('button:has-text("EXIT_SHOWROOM")')).toBeVisible({ timeout: 5000 });

        // Wait for transition
        await page.waitForTimeout(500);

        // Capture Showroom Mode Proof
        await page.screenshot({ path: 'tests/screenshots/mobile_showroom.png' });

        // Exit Showroom Mode
        await page.locator('button:has-text("EXIT_SHOWROOM")').click();
        await expect(page.locator('button:has-text("ENTER_SHOWROOM")')).toBeVisible({ timeout: 5000 });
    });

    test('should have glass styles', async ({ page }) => {
        // Verify that the glass-premium class exists and has background
        const glassPanel = page.locator('.glass-premium').first();
        await expect(glassPanel).toBeVisible({ timeout: 10000 });
        const bgColor = await glassPanel.evaluate((el) => window.getComputedStyle(el).backgroundColor);
        console.log(`Panel BG: ${bgColor}`);
        // Support both rgb and rgba depending on browser
        expect(bgColor).toMatch(/rgba?\(10,\s*10,\s*20/);
    });
});
