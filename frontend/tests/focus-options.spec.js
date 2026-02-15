/**
 * E2E Focus Options (Story 5.1).
 * Vérifie que RECAP_VIEW est la vue par défaut, que les options sont mises en avant,
 * et que le badge 3D est présent quand la vue 3D est activée.
 * Couvre les chemins Pack ET Atelier Libre (AC #1).
 */
import { test, expect } from '@playwright/test';

test.describe('Focus Options (Story 5.1)', () => {

    const mockPacks = {
        packs: [{
            id: 'PACK_BUDGET_01',
            name: 'Budget Gamer',
            description: 'Entry level',
            shell_variant_id: 'VAR_SHELL_GBC_FP_ATOMIC_PURPLE',
            screen_variant_id: 'VAR_SCR_GBC_OEM',
            lens_variant_id: 'VAR_LENS_GBC_GLASS_BLACK',
            sort_order: 1
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
        await page.route('**/catalog/packs', async route => route.fulfill({ json: mockPacks }));
        await page.route('**/catalog/shells', async route => route.fulfill({ json: mockCatalogShells }));
        await page.route('**/catalog/screens', async route => route.fulfill({ json: mockCatalogScreens }));
        await page.route('**/catalog/lenses', async route => route.fulfill({ json: mockCatalogLenses }));
        await page.route('**/catalog/expert-mods', async route => route.fulfill({ json: { mods: { cpu: [], audio: [], power: [] } } }));
        await page.route('**/quote', async route => route.fulfill({ json: mockQuote }));

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('5.1 AC#1 — RECAP_VIEW est affiché par défaut au chargement via Pack', async ({ page }) => {
        // 1. Ouvrir l'atelier via un pack
        await page.locator('text=STARTER KITS').click();
        await page.locator('text=BUDGET GAMER').first().click();
        await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

        // 2. Vérifier que RECAP_VIEW est actif (aria-pressed=true)
        const recapButton = page.getByTestId('btn-recap-view');
        await expect(recapButton).toBeVisible({ timeout: 5000 });
        await expect(recapButton).toHaveAttribute('aria-pressed', 'true');

        // 3. Vérifier que 3D_VIEW n'est PAS actif
        const view3DButton = page.getByTestId('btn-3d-view');
        await expect(view3DButton).toBeVisible();
        await expect(view3DButton).toHaveAttribute('aria-pressed', 'false');

        // 4. Vérifier que SelectionRecap est visible (pas ThreeDPreview)
        await expect(page.locator('text=Atomic Purple').first()).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('3d-preview-badge')).not.toBeVisible();
    });

    test('5.1 AC#1 — RECAP_VIEW est affiché par défaut au chargement via Atelier Libre', async ({ page }) => {
        // 1. Ouvrir l'atelier via Atelier Libre (AC #1 : pack OU atelier libre)
        await page.getByText('ATELIER LIBRE').click();
        await expect(page.locator('text=STARTER KITS')).not.toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=ATELIER LIBRE')).not.toBeVisible({ timeout: 5000 });

        // 2. Vérifier que RECAP_VIEW est actif par défaut
        const recapButton = page.getByTestId('btn-recap-view');
        await expect(recapButton).toBeVisible({ timeout: 5000 });
        await expect(recapButton).toHaveAttribute('aria-pressed', 'true');

        // 3. Vérifier que la zone récap est affichée (état vide sans sélection)
        await expect(page.getByTestId('recap-empty-state')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=NO SELECTION')).toBeVisible();

        // 4. Le badge 3D ne doit pas être visible
        await expect(page.getByTestId('3d-preview-badge')).not.toBeVisible();
    });

    test('5.1 AC#2 — Les options (pack, coque, écran, vitre) sont visibles et mises en avant dans le récap', async ({ page }) => {
        // 1. Charger avec un pack
        await page.locator('text=STARTER KITS').click();
        await page.locator('text=BUDGET GAMER').first().click();
        await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

        // 2. Vérifier que le pack badge est visible et mis en avant
        await expect(page.locator('text=🎁')).toBeVisible();
        await expect(page.locator('text=BUDGET GAMER')).toBeVisible();
        await expect(page.locator('text=PACK ACTIVÉ')).toBeVisible();

        // 3. Vérifier que les options sont visibles dans le récap
        await expect(page.locator('text=/atomic purple/i').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=/original lcd/i').first()).toBeVisible();
        await expect(page.locator('text=/black glass/i').first()).toBeVisible();

        // 4. Vérifier la hiérarchie visuelle (les cartes doivent être présentes)
        const recapCards = page.locator('ul[role="list"]').getByRole('listitem');
        await expect(recapCards).toHaveCount(3);
    });

    test('5.1 AC#3 — Basculement 3D_VIEW / RECAP_VIEW : toggle fonctionne et badge 3D présent en mode 3D', async ({ page }) => {
        // 1. Charger avec un pack
        await page.locator('text=STARTER KITS').click();
        await page.locator('text=BUDGET GAMER').first().click();
        await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

        // 2. Vérifier que RECAP_VIEW est actif par défaut
        const recapButton = page.getByTestId('btn-recap-view');
        await expect(recapButton).toBeVisible();
        await expect(recapButton).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('text=Atomic Purple').first()).toBeVisible({ timeout: 5000 });

        // 3. Basculer vers 3D_VIEW (force sur mobile pour éviter conflit avec RETOUR)
        const view3DButton = page.getByTestId('btn-3d-view');
        const isMobile = test.info().project.name.toLowerCase().includes('mobile');
        if (isMobile) {
            await view3DButton.click({ force: true });
        } else {
            await view3DButton.click();
        }

        // 4. Vérifier que le badge 3D est présent (Task 2.1)
        await expect(page.getByTestId('3d-preview-badge')).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('3d-preview-badge')).toContainText('APERÇU_3D');

        // 5. Vérifier que 3D_VIEW est maintenant actif (aria-pressed)
        await expect(view3DButton).toHaveAttribute('aria-pressed', 'true');

        // 6. Rebasculer vers RECAP_VIEW
        await recapButton.click();

        // 7. Vérifier que RECAP_VIEW est de nouveau actif et le badge 3D disparaît
        await expect(page.locator('text=Atomic Purple').first()).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('3d-preview-badge')).not.toBeVisible();
        await expect(recapButton).toHaveAttribute('aria-pressed', 'true');
    });

});
