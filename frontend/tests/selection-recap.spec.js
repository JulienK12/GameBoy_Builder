import { test, expect } from '@playwright/test';

test.describe('Selection Recap Component', () => {

    // Mock Data using existing catalog structure ID references
    const mockPacks = {
        packs: [
            {
                id: 'PACK_BUDGET_01',
                name: 'Budget Gamer',
                description: 'Entry level configuration',
                shell_variant_id: 'VAR_SHELL_GBC_FP_ATOMIC_PURPLE',
                screen_variant_id: 'VAR_SCR_GBC_OEM',
                lens_variant_id: 'VAR_LENS_GBC_GLASS_BLACK',
                sort_order: 1
            }
        ]
    };

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
        // Capture browser console logs
        page.on('console', msg => console.log('BROWSER:', msg.text()));

        // Intercept and mock API calls
        await page.route('**/catalog/packs', async route => {
            await route.fulfill({ json: mockPacks });
        });

        await page.route('**/catalog/shells', async route => {
            await route.fulfill({ json: mockCatalogShells });
        });

        await page.route('**/catalog/screens', async route => {
            await route.fulfill({ json: mockCatalogScreens });
        });

        await page.route('**/catalog/lenses', async route => {
            await route.fulfill({ json: mockCatalogLenses });
        });

        await page.route('**/quote', async route => {
            await route.fulfill({ json: mockQuote });
        });

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('should apply Pack components and display Pack Badge', async ({ page }) => {
        // 1. Open Landing Portal (should happen by default on load)
        const portal = page.locator('text=STARTER KITS');
        await expect(portal).toBeVisible();
        await portal.click();

        // 2. Select Pack "Budget Gamer"
        const packButton = page.locator('text=BUDGET GAMER').first();
        await expect(packButton).toBeVisible();
        await packButton.click();

        // 3. Verify Landing Portal is closed
        await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

        // 4. Verify Selection Recap has 3 items
        const recapItems = page.getByRole('listitem');
        await expect(recapItems).toHaveCount(3);

        // 5. Verify Pack Badge is visible (AC #4)
        // 5. Verify Pack Badge is visible (AC #4)
        // Check for emoji and name separately as they are in different elements
        await expect(page.locator('text=🎁')).toBeVisible();
        await expect(page.locator('text=BUDGET GAMER')).toBeVisible();

        // 6. Verify specific items from mock
        const recap = page.locator('main');
        await recap.locator('text=/atomic purple/i').first().scrollIntoViewIfNeeded();
        await expect(recap.locator('text=/atomic purple/i').first()).toBeVisible();
        await recap.locator('text=/original lcd/i').first().scrollIntoViewIfNeeded();
        await expect(recap.locator('text=/original lcd/i').first()).toBeVisible();
    });

    test('should update Recap when changing components manually', async ({ page }) => {
        // 1. Enter via "Atelier Libre" (Empty state)
        await page.locator('text=ATELIER LIBRE').click();

        // Attente explicite que le portail disparaisse (fin de transition)
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible();

        // 2. Verify Empty State
        await expect(page.locator('text=NO SELECTION')).toBeVisible();

        // 3. Select Shell manually
        // On clique sur la catégorie "shell" (on filtre par visibilité pour gérer les deux boutons mobile/desktop)
        const shellNav = page.locator('button[data-category="shell"]').filter({ visible: true }).first();
        await shellNav.click();

        // On attend que la variante soit visible (le catalogue peut mettre un peu de temps à s'afficher dans le DOM)
        const variantCard = page.locator('[data-variant-id="VAR_SHELL_GBC_FP_ATOMIC_PURPLE"]').filter({ visible: true }).first();
        await expect(variantCard).toBeVisible({ timeout: 10000 });
        await variantCard.scrollIntoViewIfNeeded();
        await variantCard.click();

        // Sélection d'un écran (requis pour le devis)
        const screenNav = page.locator('button[data-category="screen"]').filter({ visible: true }).first();
        await screenNav.click();
        const screenCard = page.locator('[data-variant-id="VAR_SCR_GBC_OEM"]').filter({ visible: true }).first();
        await screenCard.scrollIntoViewIfNeeded();
        await screenCard.click();

        // 4. Update Price expectation
        await expect(page.locator('text=20.00€').first()).toBeVisible();

        // 5. Remove item via Recap X button
        const recapContainer = page.locator('ul[role="list"]');
        const card = recapContainer.getByRole('listitem').first();

        // On utilise force: true pour le hover et le click car sur desktop les panneaux flottants (z-index) 
        // peuvent parfois intercepter les événements même s'ils ne chevauchent pas visuellement les cartes.
        const isMobile = test.info().project.name.toLowerCase().includes('mobile');
        if (!isMobile) {
            await card.hover({ force: true });
        }

        const removeButton = card.locator('button[title="Remove Item"]').first();
        await removeButton.click({ force: true });

        // 6. Verify item removed
        // On attend que l'item disparaisse complètement (on utilise toHaveCount(0) pour gérer la fin des transitions)
        await expect(recapContainer.locator('text=/atomic purple/i')).toHaveCount(0, { timeout: 10000 });
    });

    test('should verify Airy Cyberpunk Layout Spacing (gap-8)', async ({ page }) => {
        // 1. Load with Pack to have items
        await page.locator('text=STARTER KITS').click();
        await page.locator('text=BUDGET GAMER').first().click();

        // 2. Get the container element of the list
        // 2. Get the container element of the list
        // Use a more specific selector or wait for it
        const recapList = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
        await expect(recapList).toBeVisible();

        // 3. Check gap property
        const gap = await recapList.evaluate((el) => {
            return window.getComputedStyle(el).getPropertyValue('gap');
        });

        // 32px = 2rem = gap-8
        expect(gap).toBe('32px');

        // 4. Check padding
        const container = page.locator('.w-full.h-full.flex.flex-col').first();
        const padding = await container.evaluate((el) => {
            return window.getComputedStyle(el).getPropertyValue('padding-left'); // Checking only one side to avoid "32px 32px 32px 32px" vs "32px" comparison issues
        });

        // p-8 = 32px, p-10 = 40px
        const isMobile = test.info().project.name.toLowerCase().includes('mobile');
        expect(padding).toBe(isMobile ? '32px' : '40px');
    });

});
