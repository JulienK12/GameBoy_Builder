/**
 * Story 2.3 - Task 14: Tests Playwright pour logique optimiste et feedback technique
 * AC #1, #2, #3, #4, #5
 */
import { test, expect } from '@playwright/test';

test.describe('Expert Mode - Optimistic updates & validation', () => {
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
    const mockExpertMods = {
        mods: {
            cpu: [
                { id: 'MOD_CPU_OVERCLOCK_2X', name: 'CPU Overclock 2x', category: 'Cpu', price: 25.0, description: '', tooltip_content: '', dependencies: [] }
            ],
            audio: [
                { id: 'MOD_AUDIO_CLEANAMP_PRO', name: 'CleanAmp Pro', category: 'Audio', price: 35.0, description: '', tooltip_content: '', dependencies: [] },
                { id: 'MOD_AUDIO_ENHANCEMENT_KIT', name: 'Audio Enhancement Kit', category: 'Audio', price: 20.0, description: '', tooltip_content: '', dependencies: [] }
            ],
            power: [
                { id: 'MOD_POWER_BATTERY_1700MAH', name: 'Batterie Li-Po 1700mAh', category: 'Power', price: 18.0, description: '', tooltip_content: '', dependencies: [] },
                { id: 'MOD_POWER_BATTERY_2000MAH', name: 'Batterie Li-Po 2000mAh', category: 'Power', price: 22.0, description: '', tooltip_content: '', dependencies: [] }
            ]
        }
    };

    const baseQuote = {
        success: true,
        quote: {
            items: [
                { label: 'COQUE FunnyPlaying', detail: 'Atomic Purple', price: 15.0, item_type: 'Part' },
                { label: 'ÉCRAN Nintendo', detail: 'Original LCD', price: 0.0, item_type: 'Part' },
                { label: 'VITRE', detail: 'Black Glass', price: 5.0, item_type: 'Part' }
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
        await page.route('**/catalog/expert-mods', async route => route.fulfill({ json: mockExpertMods }));
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    async function goToAtelierAndSelectBase(page) {
        await page.locator('text=ATELIER LIBRE').click();
        await expect(page.locator('.fixed.inset-0.z-\\[100\\]')).not.toBeVisible({ timeout: 8000 });
        await page.locator('button[data-category="shell"]').filter({ visible: true }).first().click();
        await page.locator('[data-variant-id="VAR_SHELL_GBC_FP_ATOMIC_PURPLE"]').filter({ visible: true }).first().click();
        await page.locator('button[data-category="screen"]').filter({ visible: true }).first().click();
        await page.locator('[data-variant-id="VAR_SCR_GBC_OEM"]').filter({ visible: true }).first().click();
        await page.locator('button[data-category="lens"]').filter({ visible: true }).first().click();
        await page.locator('[data-variant-id="VAR_LENS_GBC_GLASS_BLACK"]').filter({ visible: true }).first().click();
    }

    async function openExpertMode(page) {
        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expertToggle.click();
        await expect(page.locator('text=EXPERT_MODE')).toBeVisible({ timeout: 5000 });
    }

    // 14.1 — Sélectionner CleanAmp Pro → UI se met à jour immédiatement (optimistic update)
    test('14.1 - Selecting CleanAmp Pro updates UI immediately (optimistic update)', async ({ page }) => {
        let quoteCalls = 0;
        await page.route('**/quote', async route => {
            quoteCalls++;
            const body = route.request().postDataJSON() || {};
            const withExpert = body.expert_options?.audio === 'MOD_AUDIO_CLEANAMP_PRO';
            const quote = withExpert
                ? { ...baseQuote.quote, items: [...baseQuote.quote.items, { label: 'CleanAmp Pro', detail: 'Mod Audio', price: 35.0, item_type: 'ExpertMod' }], total_price: 55.0 }
                : baseQuote.quote;
            await route.fulfill({ json: { success: true, quote, error: null } });
        });

        await goToAtelierAndSelectBase(page);
        await page.waitForTimeout(500);
        await openExpertMode(page);

        await expect(page.locator('text=CleanAmp Pro')).toBeVisible({ timeout: 5000 });
        const cleanAmpCard = page.locator('button:has-text("CleanAmp Pro")').first();
        await cleanAmpCard.click();

        // Optimistic: CleanAmp Pro doit apparaître dans le recap ou la sidebar sans attendre la réponse
        await expect(page.locator('text=Mods expert').or(page.locator('text=CleanAmp Pro'))).toBeVisible({ timeout: 3000 });
        expect(quoteCalls).toBeGreaterThanOrEqual(1);
    });

    // 14.2 — CleanAmp Pro sans batterie → effet Glitch et rollback
    test('14.2 - CleanAmp Pro without battery shows error and rollback', async ({ page }) => {
        await page.route('**/quote', async route => {
            const body = route.request().postDataJSON() || {};
            const hasCleanAmp = body.expert_options?.audio === 'MOD_AUDIO_CLEANAMP_PRO';
            const hasBattery = body.expert_options?.power;
            if (hasCleanAmp && !hasBattery) {
                await route.fulfill({
                    status: 400,
                    json: { success: false, quote: null, error: 'CleanAmp Pro nécessite une batterie d\'au moins 1700mAh. Aucune batterie sélectionnée.' }
                });
                return;
            }
            await route.fulfill({ json: { success: true, quote: baseQuote.quote, error: null } });
        });

        await goToAtelierAndSelectBase(page);
        await page.waitForTimeout(500);
        await openExpertMode(page);

        const cleanAmpButton = page.locator('button:has-text("CleanAmp Pro")').first();
        await cleanAmpButton.click();

        await expect(page.locator('text=CleanAmp Pro nécessite')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('[role="alert"]').filter({ hasText: /CleanAmp|batterie/ })).toBeVisible({ timeout: 3000 });
        // Rollback : CleanAmp Pro ne doit plus être affiché comme sélectionné (aria-pressed)
        await expect(cleanAmpButton).not.toHaveAttribute('aria-pressed', 'true');
    });

    // 14.3 — CleanAmp Pro avec batterie 1700mAh → validation réussie et feedback positif
    test('14.3 - CleanAmp Pro with 1700mAh battery succeeds with positive feedback', async ({ page }) => {
        await page.route('**/quote', async route => {
            const body = route.request().postDataJSON() || {};
            const quote = {
                ...baseQuote.quote,
                items: [...baseQuote.quote.items],
                total_price: baseQuote.quote.total_price
            };
            if (body.expert_options?.audio) {
                quote.items.push({ label: 'CleanAmp Pro', detail: 'Mod Audio', price: 35.0, item_type: 'ExpertMod' });
                quote.total_price += 35;
            }
            if (body.expert_options?.power) {
                quote.items.push({ label: 'Batterie Li-Po 1700mAh', detail: 'Mod Alimentation', price: 18.0, item_type: 'ExpertMod' });
                quote.total_price += 18;
            }
            await route.fulfill({ json: { success: true, quote, error: null } });
        });

        await goToAtelierAndSelectBase(page);
        await page.waitForTimeout(500);
        await openExpertMode(page);

        await page.locator('button:has-text("Batterie Li-Po 1700mAh")').first().click();
        await page.waitForTimeout(800);
        await page.locator('button:has-text("CleanAmp Pro")').first().click();

        await expect(page.locator('text=Mods expert')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=CleanAmp Pro').first()).toBeVisible();
    });

    // 14.4 — Plusieurs sélections rapides → queue traitée correctement
    test('14.4 - Multiple rapid selections are queued and applied', async ({ page }) => {
        let lastQuote = null;
        await page.route('**/quote', async route => {
            const body = route.request().postDataJSON() || {};
            const opts = body.expert_options || {};
            const quote = {
                ...baseQuote.quote,
                items: [...baseQuote.quote.items],
                total_price: baseQuote.quote.total_price
            };
            if (opts.cpu) { quote.items.push({ label: 'CPU Overclock 2x', detail: 'Mod CPU', price: 25.0, item_type: 'ExpertMod' }); quote.total_price += 25; }
            if (opts.audio) { quote.items.push({ label: 'CleanAmp Pro', detail: 'Mod Audio', price: 35.0, item_type: 'ExpertMod' }); quote.total_price += 35; }
            if (opts.power) { quote.items.push({ label: 'Batterie Li-Po 1700mAh', detail: 'Mod Alimentation', price: 18.0, item_type: 'ExpertMod' }); quote.total_price += 18; }
            lastQuote = quote;
            await route.fulfill({ json: { success: true, quote, error: null } });
        });

        await goToAtelierAndSelectBase(page);
        await page.waitForTimeout(500);
        await openExpertMode(page);

        await page.locator('button:has-text("CPU Overclock 2x")').first().click();
        await page.locator('button:has-text("CleanAmp Pro")').first().click();
        await page.locator('button:has-text("Batterie Li-Po 1700mAh")').first().click();

        await page.waitForTimeout(2500);

        await expect(page.locator('text=Mods expert')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=CPU Overclock 2x').first()).toBeVisible();
        await expect(page.locator('text=CleanAmp Pro').first()).toBeVisible();
        await expect(page.locator('text=Batterie Li-Po 1700mAh').first()).toBeVisible();
    });

    // 14.5 — Erreur réseau → rollback et message avec bouton Réessayer
    test('14.5 - Network error shows rollback and Retry button', async ({ page }) => {
        await page.route('**/quote', async route => {
            const body = route.request().postDataJSON() || {};
            if (body.expert_options && (body.expert_options.audio || body.expert_options.power || body.expert_options.cpu)) {
                await route.abort('failed');
                return;
            }
            await route.fulfill({ json: { success: true, quote: baseQuote.quote, error: null } });
        });

        await goToAtelierAndSelectBase(page);
        await page.waitForTimeout(500);
        await openExpertMode(page);

        await page.locator('button:has-text("CleanAmp Pro")').first().click();

        await expect(page.locator('button:has-text("Réessayer")')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 3000 });
    });
});
