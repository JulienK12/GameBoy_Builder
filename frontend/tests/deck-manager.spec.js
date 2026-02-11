/**
 * E2E Deck Manager (Story 3.1).
 * Utilise des mocks catalogue + /quote (comme expert-mode) : pas besoin de backend pour exécuter
 * ces tests. En CI, aucun job backend n'est requis pour deck-manager.
 */
import { test, expect } from '@playwright/test';

test.describe('Deck Manager (Story 3.1)', () => {

    const mockCatalogShells = {
        shells: [{ id: 'SHELL_GBC_FP', name: 'FunnyPlaying Shell', brand: 'FunnyPlaying' }],
        variants: [{
            id: 'VAR_SHELL_GBC_FP_ATOMIC_PURPLE',
            shell_id: 'SHELL_GBC_FP',
            name: 'Atomic Purple',
            image_url: '/images/shells/atomic_purple.jpg',
            color_hex: '#8B5CF6'
        }]
    };
    const mockCatalogScreens = {
        screens: [{ id: 'SCR_GBC_OEM', name: 'OEM LCD', brand: 'Nintendo', assembly: 'Component' }],
        variants: [{
            id: 'VAR_SCR_GBC_OEM',
            screen_id: 'SCR_GBC_OEM',
            name: 'Original LCD',
            image_url: '/images/screens/oem.jpg'
        }]
    };
    const mockCatalogLenses = {
        lenses: [{ id: 'LENS_GBC_GLASS', name: 'Glass Lens' }],
        variants: [{
            id: 'VAR_LENS_GBC_GLASS_BLACK',
            lens_id: 'LENS_GBC_GLASS',
            name: 'Black Glass',
            image_url: '/images/lenses/black.jpg'
        }]
    };
    const mockQuote = {
        success: true,
        quote: {
            items: [
                { label: 'COQUE FunnyPlaying', detail: 'Atomic Purple', price: 15.0 },
                { label: 'ÉCRAN Nintendo', detail: 'Original LCD', price: 0.0 },
                { label: 'VITRE', detail: 'Black Glass', price: 5.0 }
            ],
            total_price: 20.0,
            warnings: []
        },
        error: null
    };

    test.beforeEach(async ({ page }) => {
        await page.route('**/catalog/packs', async route => route.fulfill({ json: { packs: [] } }));
        await page.route('**/catalog/shells', async route => route.fulfill({ json: mockCatalogShells }));
        await page.route('**/catalog/screens', async route => route.fulfill({ json: mockCatalogScreens }));
        await page.route('**/catalog/lenses', async route => route.fulfill({ json: mockCatalogLenses }));
        await page.route('**/catalog/expert-mods', async route => route.fulfill({ json: { mods: { cpu: [], audio: [], power: [] } } }));
        await page.route('**/quote', async route => route.fulfill({ json: mockQuote }));

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        await page.getByText('ATELIER LIBRE').click();
        await expect(page.locator('.fixed.inset-0.z-\\[100\\]')).not.toBeVisible({ timeout: 8000 });
    });

    test('should open Deck Manager when clicking MON_DECK', async ({ page }) => {
        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();
        await expect(page.getByRole('dialog', { name: /deck manager/i })).toBeVisible();
        await expect(page.getByText('Mon Deck')).toBeVisible();
        await expect(page.getByRole('button', { name: /sauvegarder dans le deck/i })).toBeVisible();
    });

    test('should show empty state when deck has no configurations', async ({ page }) => {
        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();
        await expect(page.getByText('Aucune configuration')).toBeVisible();
    });

    test('AC #2: should disable add button and show message when deck has 3 configurations', async ({ page }) => {
        // Need a valid config: select shell and screen so quote exists (requires backend/catalog)
        await page.getByText('RECAP_VIEW').click();
        await page.locator('[data-category="shell"]').first().click();
        const firstShell = page.locator('[data-variant-id]').first();
        await firstShell.waitFor({ state: 'visible', timeout: 15000 });
        await firstShell.click();
        await page.locator('[data-category="screen"]').first().click();
        const firstScreen = page.locator('[data-variant-id]').first();
        await firstScreen.waitFor({ state: 'visible', timeout: 10000 });
        await firstScreen.click();

        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();

        const addBtn = page.getByRole('button', { name: /sauvegarder dans le deck/i });
        await addBtn.click();
        await addBtn.click();
        await addBtn.click();
        await expect(addBtn).toBeDisabled();
        await addBtn.hover();
        await expect(page.getByText(/limite de 3 configurations atteinte/i)).toBeVisible({ timeout: 5000 });
    });

    test('AC #3: should allow adding again after removing a configuration', async ({ page }) => {
        await page.locator('[data-category="shell"]').first().click();
        await page.locator('[data-variant-id]').first().waitFor({ state: 'visible', timeout: 15000 });
        await page.locator('[data-variant-id]').first().click();
        await page.locator('[data-category="screen"]').first().click();
        await page.locator('[data-variant-id]').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('[data-variant-id]').first().click();

        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();
        const addBtn = page.getByRole('button', { name: /sauvegarder dans le deck/i });
        await addBtn.click();
        await addBtn.click();
        await addBtn.click();
        await expect(addBtn).toBeDisabled();
        const deleteBtn = page.locator('button[aria-label="Supprimer cette configuration"]').first();
        await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
        await deleteBtn.click();
        await expect(addBtn).toBeEnabled();
        await addBtn.click();
        await expect(addBtn).toBeDisabled();
    });

    test('AC #1: each card should display image or placeholder, name and total price', async ({ page }) => {
        await page.locator('[data-category="shell"]').first().click();
        await page.locator('[data-variant-id]').first().waitFor({ state: 'visible', timeout: 15000 });
        await page.locator('[data-variant-id]').first().click();
        await page.locator('[data-category="screen"]').first().click();
        await page.locator('[data-variant-id]').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('[data-variant-id]').first().click();

        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();
        await page.getByRole('button', { name: /sauvegarder dans le deck/i }).click();

        const panel = page.getByRole('dialog', { name: /deck manager/i });
        await expect(panel).toBeVisible();
        await expect(panel.getByText('Configuration 1')).toBeVisible();
        await expect(panel.locator('text=/\\d+\\.\\d{2}\\s*€/')).toBeVisible();
        const card = panel.locator('.glass-premium.rounded-xl').first();
        await expect(card.locator('img, [aria-hidden="true"]').first()).toBeVisible();
    });
});

test.describe('Deck Manager persistence (Story 3.2)', () => {
    const mockCatalogShells = {
        shells: [{ id: 'SHELL_GBC_FP', name: 'FunnyPlaying Shell', brand: 'FunnyPlaying' }],
        variants: [{ id: 'VAR_SHELL_GBC_FP_ATOMIC_PURPLE', shell_id: 'SHELL_GBC_FP', name: 'Atomic Purple', image_url: '/images/shells/atomic_purple.jpg', color_hex: '#8B5CF6' }]
    };
    const mockCatalogScreens = {
        screens: [{ id: 'SCR_GBC_OEM', name: 'OEM LCD', brand: 'Nintendo', assembly: 'Component' }],
        variants: [{ id: 'VAR_SCR_GBC_OEM', screen_id: 'SCR_GBC_OEM', name: 'Original LCD', image_url: '/images/screens/oem.jpg' }]
    };
    const mockCatalogLenses = {
        lenses: [{ id: 'LENS_GBC_GLASS', name: 'Glass Lens' }],
        variants: [{ id: 'VAR_LENS_GBC_GLASS_BLACK', lens_id: 'LENS_GBC_GLASS', name: 'Black Glass', image_url: '/images/lenses/black.jpg' }]
    };
    const mockQuote = {
        success: true,
        quote: {
            items: [
                { label: 'COQUE FunnyPlaying', detail: 'Atomic Purple', price: 15.0 },
                { label: 'ÉCRAN Nintendo', detail: 'Original LCD', price: 0.0 },
                { label: 'VITRE', detail: 'Black Glass', price: 5.0 }
            ],
            total_price: 20.0,
            warnings: []
        },
        error: null
    };

    test.beforeEach(async ({ page }) => {
        await page.route('**/catalog/packs', async route => route.fulfill({ json: { packs: [] } }));
        await page.route('**/catalog/shells', async route => route.fulfill({ json: mockCatalogShells }));
        await page.route('**/catalog/screens', async route => route.fulfill({ json: mockCatalogScreens }));
        await page.route('**/catalog/lenses', async route => route.fulfill({ json: mockCatalogLenses }));
        await page.route('**/catalog/expert-mods', async route => route.fulfill({ json: { mods: { cpu: [], audio: [], power: [] } } }));
        await page.route('**/quote', async route => route.fulfill({ json: mockQuote }));

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        await page.evaluate(() => localStorage.removeItem('gameboy-deck'));
        await page.getByText('ATELIER LIBRE').click();
        await expect(page.locator('.fixed.inset-0.z-\\[100\\]')).not.toBeVisible({ timeout: 8000 });
    });

    test('AC #1: deck is restored after page reload (1–3 cards with names, prices, previews)', async ({ page }) => {
        await page.locator('[data-category="shell"]').first().click();
        await page.locator('[data-variant-id]').first().waitFor({ state: 'visible', timeout: 15000 });
        await page.locator('[data-variant-id]').first().click();
        await page.locator('[data-category="screen"]').first().click();
        await page.locator('[data-variant-id]').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('[data-variant-id]').first().click();

        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();
        await page.getByRole('button', { name: /sauvegarder dans le deck/i }).click();
        await page.getByRole('button', { name: /fermer/i }).click();

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.getByText('ATELIER LIBRE').click();
        await expect(page.locator('.fixed.inset-0.z-\\[100\\]')).not.toBeVisible({ timeout: 8000 });
        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();

        const panel = page.getByRole('dialog', { name: /deck manager/i });
        await expect(panel).toBeVisible();
        await expect(panel.getByText('Configuration 1')).toBeVisible();
        await expect(panel.locator('text=/\\d+\\.\\d{2}\\s*€/')).toBeVisible();
        const deckCards = panel.locator('.grid.gap-4 > div');
        await expect(deckCards).toHaveCount(1);
    });

    test('AC #2: deck state reflects last modifications after reload (add then remove, then reload)', async ({ page }) => {
        await page.locator('[data-category="shell"]').first().click();
        await page.locator('[data-variant-id]').first().waitFor({ state: 'visible', timeout: 15000 });
        await page.locator('[data-variant-id]').first().click();
        await page.locator('[data-category="screen"]').first().click();
        await page.locator('[data-variant-id]').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('[data-variant-id]').first().click();

        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();
        await page.getByRole('button', { name: /sauvegarder dans le deck/i }).click();
        await page.getByRole('button', { name: /sauvegarder dans le deck/i }).click();
        const panel = page.getByRole('dialog', { name: /deck manager/i });
        const deckCards = panel.locator('.grid.gap-4 > div');
        await expect(deckCards).toHaveCount(2);
        const deleteBtn = panel.locator('button[aria-label="Supprimer cette configuration"]').first();
        await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
        await deleteBtn.click();
        await expect(deckCards).toHaveCount(1);
        await page.getByRole('button', { name: /fermer/i }).click();

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.getByText('ATELIER LIBRE').click();
        await expect(page.locator('.fixed.inset-0.z-\\[100\\]')).not.toBeVisible({ timeout: 8000 });
        await page.getByRole('button', { name: /ouvrir le deck manager/i }).click();

        const panelAfterReload = page.getByRole('dialog', { name: /deck manager/i });
        await expect(panelAfterReload).toBeVisible();
        await expect(panelAfterReload.locator('.grid.gap-4 > div')).toHaveCount(1);
    });
});
