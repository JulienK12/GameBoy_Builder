import { test, expect } from '@playwright/test';

// Les tests du sélecteur granulaire ne tournent que sur desktop.
// Le sélecteur granulaire est un composant Expert Mode (sidebar desktop-only).
test.describe('Granular Button Selection (Story 6.3)', () => {

    // Mock data — API renvoie du snake_case
    const mockButtonsGBC = {
        buttons: [
            { id: 'd_pad', name: 'D-Pad', handled_model: 'Gameboy Color' },
            { id: 'button_a', name: 'Bouton A', handled_model: 'Gameboy Color' },
            { id: 'button_b', name: 'Bouton B', handled_model: 'Gameboy Color' }
        ],
        variants: [
            { id: 'VAR_BTN_GBC_OEM_GRAPE', button_id: 'd_pad', name: 'Grape', color_hex: '#800080', supplement: 0 },
            { id: 'VAR_BTN_GBC_OEM_TEAL', button_id: 'button_a', name: 'Teal', color_hex: '#008080', supplement: 0 },
            { id: 'VAR_BTN_GBC_CUSTOM_NEON', button_id: 'button_b', name: 'Neon Pink', color_hex: '#FF00FF', supplement: 5 }
        ]
    };

    const mockQuote = {
        success: true,
        quote: {
            items: [],
            total_price: 100.0,
            warnings: []
        }
    };

    test.beforeEach(async ({ page }, testInfo) => {
        // Skip mobile — Expert Mode sidebar n'est pas accessible sur mobile
        test.skip(testInfo.project.name.includes('Mobile'),
            'Expert Mode sidebar not available on mobile viewport');

        // Mock toutes les APIs
        await page.route('**/catalog/buttons/gbc', route =>
            route.fulfill({ json: mockButtonsGBC })
        );
        await page.route('**/catalog/buttons', route =>
            route.fulfill({ json: mockButtonsGBC })
        );
        await page.route('**/quote', route =>
            route.fulfill({ json: mockQuote })
        );
        await page.route('**/catalog/shells', route =>
            route.fulfill({
                json: {
                    shells: [{ id: 'S1', name: 'Shell GBC' }],
                    variants: [{ id: 'VAR_SHELL_GBC_1', shell_id: 'S1', name: 'Shell 1', color_hex: '#800080' }]
                }
            })
        );
        await page.route('**/catalog/screens', route =>
            route.fulfill({
                json: {
                    screens: [{ id: 'SCR1', name: 'Screen 1' }],
                    variants: [{ id: 'VAR_SCR_1', screen_id: 'SCR1', name: 'Screen 1' }]
                }
            })
        );
        await page.route('**/catalog/lenses', route =>
            route.fulfill({ json: { lenses: [], variants: [] } })
        );
        await page.route('**/catalog/expert-mods', route =>
            route.fulfill({ json: { mods: { cpu: [], audio: [], power: [] } } })
        );
        await page.route('**/catalog/packs', route =>
            route.fulfill({ json: { packs: [] } })
        );

        await page.goto('/');

        // Wait for the button to be visible/enabled before clicking
        const startButton = page.locator('text=ATELIER LIBRE');
        await expect(startButton).toBeVisible();
        await startButton.click();

        // Attendre le chargement du catalogue
        await expect(page.locator('[data-variant-id]').first()).toBeVisible({ timeout: 10000 });

        // Shell (catégorie par défaut)
        const shellVariant = page.locator('[data-variant-id="VAR_SHELL_GBC_1"]').first();
        await expect(shellVariant).toBeVisible();
        await shellVariant.click();

        // Screen — changer catégorie puis sélectionner
        const screenCategoryBtn = page.locator('button[data-category="screen"]').first();
        await expect(screenCategoryBtn).toBeVisible();
        await screenCategoryBtn.click();

        const screenVariant = page.locator('[data-variant-id="VAR_SCR_1"]').first();
        await expect(screenVariant).toBeVisible();
        await screenVariant.click();
    });

    test('should display granular button selector in Expert Mode', async ({ page }) => {
        await page.locator('button:has-text("EXPERT_OFF")').click();

        await expect(page.getByText('PERSONNALISATION BOUTONS')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('[data-button-id="d_pad"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('[data-button-id="d_pad"]').getByText('Emplacement')).toBeVisible();
    });

    test('should allow selecting a variant for a button', async ({ page }) => {
        await page.locator('button:has-text("EXPERT_OFF")').click();

        const dpadButton = page.locator('[data-button-id="d_pad"]');
        await expect(dpadButton).toBeVisible({ timeout: 10000 });
        await dpadButton.click();

        const variantButton = page.locator('.variant-grid .variant-button').first();
        await expect(variantButton).toBeVisible({ timeout: 5000 });
        await variantButton.click();

        await expect(dpadButton.getByText(/Grape/i)).toBeVisible({ timeout: 5000 });
    });

    test('should send selected_buttons in quote request', async ({ page }) => {
        await page.locator('button:has-text("EXPERT_OFF")').click();

        const dpadButton = page.locator('[data-button-id="d_pad"]');
        await expect(dpadButton).toBeVisible({ timeout: 10000 });
        await dpadButton.click();

        const requestPromise = page.waitForRequest(request =>
            request.url().includes('/quote') && request.method() === 'POST'
        );

        const variantButton = page.locator('.variant-grid .variant-button').first();
        await expect(variantButton).toBeVisible({ timeout: 5000 });
        await variantButton.click();

        const request = await requestPromise;

        expect(request, "La requête /quote n'a pas été envoyée").not.toBeNull();
        const postData = request.postDataJSON();
        expect(postData, "Le postData ne doit pas être null").toBeTruthy();
        expect(postData.selected_buttons).toEqual({
            d_pad: 'VAR_BTN_GBC_OEM_GRAPE'
        });
    });

    test('should display price badge when custom variant selected', async ({ page }) => {
        await page.locator('button:has-text("EXPERT_OFF")').click();

        // Sélectionner button_b — le panel s'ouvre par défaut sur d_pad
        const buttonB = page.locator('[data-button-id="button_b"]');
        await expect(buttonB).toBeVisible({ timeout: 10000 });
        await buttonB.click();

        // Attendre que le panel passe sur "Bouton B"
        await expect(page.locator('.variant-panel-label')).toContainText('Bouton B', { timeout: 5000 });

        // Sélectionner Neon Pink par son ID (supplement: 5 → premium)
        const neonVariant = page.locator('[data-variant-id="VAR_BTN_GBC_CUSTOM_NEON"]');
        await expect(neonVariant).toBeVisible({ timeout: 5000 });
        await neonVariant.click();

        // Le badge prix doit apparaître, on utilise une assertion avec retry (toBeVisible) au lieu de waitForTimeout
        const priceBadge = page.locator('.price-badge');
        await expect(priceBadge).toBeVisible({ timeout: 5000 });
        await expect(priceBadge).toContainText('+5€');
    });
});
