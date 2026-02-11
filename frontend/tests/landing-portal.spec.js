import { test, expect } from '@playwright/test';

test.describe('Landing Portal & Packs (Story 1.1)', () => {

    test.beforeEach(async ({ page }) => {
        // Go to home page
        await page.goto('http://localhost:5173');
    });

    test('should display Landing Portal on initial load', async ({ page }) => {
        // Check for main portal container
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).toBeVisible();

        // Check for the two main options
        await expect(page.getByText('STARTER KITS')).toBeVisible();
        await expect(page.getByText('ATELIER LIBRE')).toBeVisible();
    });

    test('should load packs from API when clicking Starter Kits', async ({ page }) => {
        // Click "Starter Kits"
        await page.getByText('STARTER KITS').click();

        // APIs should be called (previously verified manual test, here we wait for UI)
        // Expect at least one pack card to appear
        const packCard = page.locator('text=Budget Gamer');
        await packCard.scrollIntoViewIfNeeded();
        await expect(packCard).toBeVisible({ timeout: 5000 });

        // Check price is displayed (105.00 € = 10 Shell + 70 Screen + 5 Lens + 20 Install)
        await expect(page.locator('text=105.00 €')).toBeVisible();
    });

    test('should apply pack and close portal when selecting a pack', async ({ page }) => {
        await page.getByText('STARTER KITS').click();

        // Select "Budget Gamer" pack
        // Note: The UI now has "SÉLECTIONNER" but the whole card is clickable
        // We can click the card containing "Budget Gamer"
        await page.locator('button:has-text("Budget Gamer")').click();

        // Portal should disappear
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible();

        // Check that components are selected in the store/UI
        // We expect the "Selection Recap" to show items
        // Note: The badge text might depend on implementation, assuming "Budget Gamer"
        await expect(page.locator('text=Budget Gamer')).toBeVisible();

        // Verify specific components of Budget Gamer (Sapphire Blue shell)
        // Use .first() to avoid strict mode violation if name appears multiple times
        const shellLabel = page.getByText('Sapphire Blue').first();
        await shellLabel.scrollIntoViewIfNeeded();
        await expect(shellLabel).toBeVisible();
    });

    test('should start empty when clicking Atelier Libre', async ({ page }) => {
        await page.getByText('ATELIER LIBRE').click();

        // Portal closed
        await expect(page.locator('.fixed.inset-0.z-\\[100\\]')).not.toBeVisible();

        // No pack badge
        await expect(page.locator('text=Budget Gamer 🎁')).not.toBeVisible();

        // Recap should be empty or prompting to select
        // (Depending on implementation, might show "Aucune sélection")
    });
});
