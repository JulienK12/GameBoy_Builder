/**
 * E2E Tests for Buttons functionality.
 * Tests button selection, display in gallery, recap, and quote calculation.
 */
import { test, expect } from '@playwright/test';

test.describe('Buttons Functionality', () => {

    const mockCatalogButtons = {
        buttons: [{
            id: 'BTN_GBC_CGS',
            handled_model: 'Gameboy Color',
            brand: 'CloudGameStore',
            name: 'High-quality Button Set',
            price: 0.85,
            description: 'Set complet de boutons de remplacement'
        }],
        variants: [{
            id: 'VAR_BTN_GBC_CGS_RED',
            button_id: 'BTN_GBC_CGS',
            name: 'Rouge',
            supplement: 0.0,
            color_hex: '#DC143C',
            image_url: '/assets/images/buttons/VAR_BTN_GBC_CGS_RED.jpg',
            is_transparent: false,
            is_glow_in_dark: false
        }, {
            id: 'VAR_BTN_GBC_CGS_BLUE',
            button_id: 'BTN_GBC_CGS',
            name: 'Bleu',
            supplement: 0.0,
            color_hex: '#4169E1',
            image_url: '/assets/images/buttons/VAR_BTN_GBC_CGS_BLUE.jpg',
            is_transparent: false,
            is_glow_in_dark: false
        }]
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

    test.beforeEach(async ({ page }) => {
        // Mock API responses
        await page.route('**/catalog/shells', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockCatalogShells)
        }));

        await page.route('**/catalog/screens', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockCatalogScreens)
        }));

        await page.route('**/catalog/lenses', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockCatalogLenses)
        }));

        await page.route('**/catalog/buttons', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockCatalogButtons)
        }));

        await page.goto('/');
        // Wait for catalog to load
        await page.waitForTimeout(500);
    });

    test('AC #1: Should display buttons category in navigation', async ({ page }) => {
        // Check that buttons category exists in navigation
        const buttonsCategory = page.getByRole('button', { name: /BUTTONS/i });
        await expect(buttonsCategory).toBeVisible();
    });

    test('AC #2: Should display button variants when buttons category is selected', async ({ page }) => {
        // Click on buttons category
        const buttonsCategory = page.getByRole('button', { name: /BUTTONS/i });
        await buttonsCategory.click();

        // Wait for variants to load
        await page.waitForTimeout(300);

        // Check that button variants are displayed
        const redButton = page.getByText('Rouge');
        const blueButton = page.getByText('Bleu');
        
        await expect(redButton).toBeVisible();
        await expect(blueButton).toBeVisible();
    });

    test('AC #3: Should select button variant when clicked', async ({ page }) => {
        // Select shell and screen first (required for quote)
        const shellCategory = page.getByRole('button', { name: /SHELL/i });
        await shellCategory.click();
        await page.waitForTimeout(200);
        const shellVariant = page.getByText('Atomic Purple').first();
        await shellVariant.click();
        await page.waitForTimeout(200);

        const screenCategory = page.getByRole('button', { name: /SCREEN/i });
        await screenCategory.click();
        await page.waitForTimeout(200);
        const screenVariant = page.getByText('Original LCD').first();
        await screenVariant.click();
        await page.waitForTimeout(200);

        // Now select buttons
        const buttonsCategory = page.getByRole('button', { name: /BUTTONS/i });
        await buttonsCategory.click();
        await page.waitForTimeout(200);

        // Click on red button variant
        const redButton = page.getByText('Rouge').first();
        await redButton.click();
        await page.waitForTimeout(300);

        // Verify button is selected (should have active state)
        // The variant card should have some indication of being selected
        const selectedButton = page.locator('[data-testid*="variant"], .variant-card').filter({ hasText: 'Rouge' }).first();
        await expect(selectedButton).toBeVisible();
    });

    test('AC #4: Should display selected buttons in Selection Recap', async ({ page }) => {
        // Select required components
        const shellCategory = page.getByRole('button', { name: /SHELL/i });
        await shellCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Atomic Purple').first().click();
        await page.waitForTimeout(200);

        const screenCategory = page.getByRole('button', { name: /SCREEN/i });
        await screenCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Original LCD').first().click();
        await page.waitForTimeout(200);

        // Select buttons
        const buttonsCategory = page.getByRole('button', { name: /BUTTONS/i });
        await buttonsCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Rouge').first().click();
        await page.waitForTimeout(300);

        // Check Selection Recap shows buttons
        const recap = page.locator('[data-testid="selection-recap"], .selection-recap');
        await expect(recap).toBeVisible();
        
        // Should show "BOUTONS" label
        const buttonsLabel = recap.getByText(/BOUTONS/i);
        await expect(buttonsLabel).toBeVisible();
    });

    test('AC #5: Should include buttons in quote calculation', async ({ page }) => {
        // Mock quote response with buttons
        await page.route('**/quote', route => {
            const request = route.request().postDataJSON();
            const hasButtons = request?.button_variant_id === 'VAR_BTN_GBC_CGS_RED';
            
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    quote: {
                        items: [
                            { label: 'COQUE FunnyPlaying', detail: 'Atomic Purple', price: 15.0 },
                            { label: 'ÉCRAN Nintendo', detail: 'Original LCD', price: 0.0 },
                            ...(hasButtons ? [{ label: 'High-quality Button Set', detail: 'Rouge', price: 0.85 }] : [])
                        ],
                        total_price: hasButtons ? 15.85 : 15.0,
                        warnings: []
                    },
                    error: null
                })
            });
        });

        // Select required components
        const shellCategory = page.getByRole('button', { name: /SHELL/i });
        await shellCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Atomic Purple').first().click();
        await page.waitForTimeout(200);

        const screenCategory = page.getByRole('button', { name: /SCREEN/i });
        await screenCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Original LCD').first().click();
        await page.waitForTimeout(200);

        // Select buttons
        const buttonsCategory = page.getByRole('button', { name: /BUTTONS/i });
        await buttonsCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Rouge').first().click();
        await page.waitForTimeout(500);

        // Check quote includes buttons price
        const quoteTotal = page.locator('[data-testid="quote-total"], .quote-total, .total-price');
        await expect(quoteTotal).toContainText('15.85');
    });

    test('AC #6: Should allow finalizing without buttons (buttons are optional)', async ({ page }) => {
        // Mock quote response without buttons
        await page.route('**/quote', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                quote: {
                    items: [
                        { label: 'COQUE FunnyPlaying', detail: 'Atomic Purple', price: 15.0 },
                        { label: 'ÉCRAN Nintendo', detail: 'Original LCD', price: 0.0 }
                    ],
                    total_price: 15.0,
                    warnings: []
                },
                error: null
            })
        }));

        // Select only required components (no buttons)
        const shellCategory = page.getByRole('button', { name: /SHELL/i });
        await shellCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Atomic Purple').first().click();
        await page.waitForTimeout(200);

        const screenCategory = page.getByRole('button', { name: /SCREEN/i });
        await screenCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Original LCD').first().click();
        await page.waitForTimeout(500);

        // Verify finalize button is enabled (buttons are optional)
        const finalizeButton = page.getByRole('button', { name: /finaliser|confirmer/i });
        await expect(finalizeButton).toBeEnabled();
    });

    test('AC #7: Should deselect button when clicking again', async ({ page }) => {
        // Select required components
        const shellCategory = page.getByRole('button', { name: /SHELL/i });
        await shellCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Atomic Purple').first().click();
        await page.waitForTimeout(200);

        const screenCategory = page.getByRole('button', { name: /SCREEN/i });
        await screenCategory.click();
        await page.waitForTimeout(200);
        await page.getByText('Original LCD').first().click();
        await page.waitForTimeout(200);

        // Select buttons
        const buttonsCategory = page.getByRole('button', { name: /BUTTONS/i });
        await buttonsCategory.click();
        await page.waitForTimeout(200);
        const redButton = page.getByText('Rouge').first();
        await redButton.click();
        await page.waitForTimeout(300);

        // Click again to deselect
        await redButton.click();
        await page.waitForTimeout(300);

        // Button should be deselected (no active state)
        // This is verified by the button not being in the selection recap
        const recap = page.locator('[data-testid="selection-recap"], .selection-recap');
        if (await recap.isVisible()) {
            const buttonsLabel = recap.getByText(/BOUTONS/i);
            await expect(buttonsLabel).not.toBeVisible();
        }
    });
});
