/**
 * E2E Signature Showcase (Story 4.1).
 * Vérifie la transition "Finaliser" → plein écran Signature Showcase, SignatureCard, bouton Retour.
 */
import { test, expect } from '@playwright/test';

test.describe('Signature Showcase (Story 4.1)', () => {

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

    test('4.1 — Full config → Finaliser → fullscreen Signature Showcase, SignatureCard, Retour', async ({ page }) => {
        await page.locator('text=STARTER KITS').click();
        await page.locator('text=BUDGET GAMER').first().click();
        await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

        const finaliserBtn = page.getByTestId('btn-finaliser').or(page.getByTestId('btn-finaliser-mobile'));
        await finaliserBtn.first().waitFor({ state: 'visible', timeout: 10000 });
        await finaliserBtn.first().click();

        await expect(page.getByRole('dialog', { name: /signature showcase/i })).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('signature-serial')).toBeVisible();
        await expect(page.getByTestId('signature-serial')).toContainText(/^RB-/);
        await expect(page.getByTestId('signature-shell')).toContainText(/atomic purple/i);
        await expect(page.getByTestId('signature-screen')).toContainText(/original lcd/i);
        await expect(page.getByTestId('signature-lens')).toContainText(/black glass/i);
        await expect(page.getByTestId('signature-total')).toContainText(/20\.00€/);
        await expect(page.getByTestId('signature-confirm-creation')).toBeVisible();
        await expect(page.getByRole('button', { name: /retour à l'atelier/i })).toBeVisible();
    });

    test('4.2 — Retour ramène à l\'atelier sans perte d\'état', async ({ page }) => {
        await page.locator('text=STARTER KITS').click();
        await page.locator('text=BUDGET GAMER').first().click();
        await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

        const finaliserBtn = page.getByTestId('btn-finaliser').or(page.getByTestId('btn-finaliser-mobile'));
        await finaliserBtn.first().click();
        await expect(page.getByRole('dialog', { name: /signature showcase/i })).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: /retour à l'atelier/i }).click();
        await expect(page.getByRole('dialog', { name: /signature showcase/i })).not.toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('btn-recap-view')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Atomic Purple').first()).toBeVisible({ timeout: 5000 });
    });

    test('4.3 — Mobile : mode Signature utilisable (responsive, touch)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.locator('text=STARTER KITS').click();
        await page.locator('text=BUDGET GAMER').first().click();
        await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

        const finaliserMobile = page.getByTestId('btn-finaliser-mobile');
        await finaliserMobile.waitFor({ state: 'visible', timeout: 10000 });
        await finaliserMobile.click();

        await expect(page.getByRole('dialog', { name: /signature showcase/i })).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('signature-serial')).toBeVisible();
        await expect(page.getByRole('button', { name: /retour à l'atelier/i })).toBeVisible();
        await expect(page.getByTestId('signature-total')).toBeVisible();
        await page.getByRole('button', { name: /retour à l'atelier/i }).click();
        await expect(page.getByRole('dialog', { name: /signature showcase/i })).not.toBeVisible({ timeout: 3000 });
    });

    test.describe('Story 4.2 — Confirmer la Création (auth + submit)', () => {
        test('6.2 — Sans être connecté : clic Confirmer → modale Login ; après login → soumission et message succès', async ({ page }) => {
            await page.route('**/auth/me', async route => route.fulfill({ status: 401 }));
            await page.route('**/auth/login', async route => route.fulfill({
                status: 200,
                headers: { 'set-cookie': 'auth_token=fake-jwt; Path=/' },
                body: JSON.stringify({ user: { id: 'u1', email: 'u@test.com' } })
            }));
            await page.route('**/quote/submit', async route => route.fulfill({
                status: 201,
                body: JSON.stringify({ success: true, submission_id: 'sub-123' })
            }));

            await page.locator('text=STARTER KITS').click();
            await page.locator('text=BUDGET GAMER').first().click();
            await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

            const finaliserBtn = page.getByTestId('btn-finaliser').or(page.getByTestId('btn-finaliser-mobile'));
            await finaliserBtn.first().click();
            await expect(page.getByRole('dialog', { name: /signature showcase/i })).toBeVisible({ timeout: 5000 });

            await page.getByTestId('signature-confirm-creation').click();
            await expect(page.getByTestId('auth-email')).toBeVisible({ timeout: 5000 });

            await page.getByTestId('auth-email').fill('u@test.com');
            await page.getByTestId('auth-password').fill('password123');
            await page.getByTestId('auth-submit-login').click();

            await expect(page.getByTestId('submission-success-banner')).toContainText(/commande enregistrée|ready for build/i, { timeout: 10000 });
            await expect(page.getByRole('dialog', { name: /signature showcase/i })).not.toBeVisible({ timeout: 3000 });
        });

        test('6.3 — Déjà connecté : Confirmer la Création → soumission directe et message succès', async ({ page }) => {
            await page.route('**/auth/me', async route => route.fulfill({
                status: 200,
                body: JSON.stringify({ user: { id: 'u1', email: 'u@test.com' } })
            }));
            await page.route('**/quote/submit', async route => route.fulfill({
                status: 201,
                body: JSON.stringify({ success: true, submission_id: 'sub-456' })
            }));

            await page.locator('text=STARTER KITS').click();
            await page.locator('text=BUDGET GAMER').first().click();
            await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

            const finaliserBtn = page.getByTestId('btn-finaliser').or(page.getByTestId('btn-finaliser-mobile'));
            await finaliserBtn.first().click();
            await expect(page.getByRole('dialog', { name: /signature showcase/i })).toBeVisible({ timeout: 5000 });

            await page.getByTestId('signature-confirm-creation').click();

            await expect(page.getByTestId('auth-modal')).not.toBeVisible({ timeout: 2000 });
            await expect(page.getByRole('dialog', { name: /signature showcase/i })).not.toBeVisible({ timeout: 5000 });
            await expect(page.getByTestId('submission-success-banner')).toContainText(/commande enregistrée|ready for build/i, { timeout: 5000 });
        });

        test('6.4 — Erreur réseau ou 500 sur submit → message affiché, pas de redirection', async ({ page }) => {
            await page.route('**/auth/me', async route => route.fulfill({
                status: 200,
                body: JSON.stringify({ user: { id: 'u1', email: 'u@test.com' } })
            }));
            await page.route('**/quote/submit', async route => route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'Erreur serveur' })
            }));

            await page.locator('text=STARTER KITS').click();
            await page.locator('text=BUDGET GAMER').first().click();
            await expect(page.locator('text=STARTER_KITS')).not.toBeVisible({ timeout: 10000 });

            const finaliserBtn = page.getByTestId('btn-finaliser').or(page.getByTestId('btn-finaliser-mobile'));
            await finaliserBtn.first().click();
            await expect(page.getByRole('dialog', { name: /signature showcase/i })).toBeVisible({ timeout: 5000 });

            await page.getByTestId('signature-confirm-creation').click();

            await expect(page.getByTestId('signature-submit-error')).toContainText(/erreur|réessayez/i, { timeout: 5000 });
            await expect(page.getByRole('dialog', { name: /signature showcase/i })).toBeVisible();
            await expect(page.getByTestId('submission-success-banner')).not.toBeVisible();
        });
    });
});
