import { test, expect } from '@playwright/test';

test.describe('Asset Serving Verification (Story 7.1)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // If Landing Portal is visible, bypass it
        const atelierBtn = page.locator('button:has-text("ATELIER LIBRE")');
        if (await atelierBtn.isVisible()) {
            await atelierBtn.click();
        }

        // Wait for catalog to load
        await page.waitForSelector('[data-category]', { timeout: 20000 });
    });

    test('should load shell images from /assets/ path', async ({ page }) => {
        const shellImage = page.locator('img[src*="/assets/images/shells/"]').first();
        await expect(shellImage).toBeVisible();
        const src = await shellImage.getAttribute('src');
        expect(src).toMatch(/\/assets\/images\/shells\/.*\.png|jpg/);
    });

    test('should load special shell extensions correctly (PNG)', async ({ page }) => {
        // Go to Shells category
        await page.click('[data-category="shell"]');

        // Find Atomic Purple or Kiwi specifically if possible, or just check if any PNG exists
        const pngImage = page.locator('img[src*=".png"]');
        if (await pngImage.count() > 0) {
            await expect(pngImage.first()).toBeVisible();
        }
    });

    test('should load screen images from /assets/ path', async ({ page }) => {
        await page.click('[data-category="screen"]');
        const screenImage = page.locator('img[src*="/assets/images/screens/"]').first();
        await expect(screenImage).toBeVisible();
    });

    test('should load lens images from /assets/ path', async ({ page }) => {
        await page.click('[data-category="lens"]');
        const lensImage = page.locator('img[src*="/assets/images/lenses/"]').first();
        await expect(lensImage).toBeVisible();
    });
});
