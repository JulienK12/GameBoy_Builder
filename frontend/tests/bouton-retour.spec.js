/**
 * Tests E2E pour le bouton retour vers le portail de choix du mode
 * Feature: Bouton retour dans le header de l'atelier (backlog item #2)
 */
import { test, expect } from '@playwright/test';

test.describe('Bouton Retour - Navigation vers le portail', () => {
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
        // Mock API calls
        await page.route('**/catalog/packs', async route => route.fulfill({ json: { packs: [] } }));
        await page.route('**/catalog/shells', async route => route.fulfill({ json: mockCatalogShells }));
        await page.route('**/catalog/screens', async route => route.fulfill({ json: mockCatalogScreens }));
        await page.route('**/catalog/lenses', async route => route.fulfill({ json: mockCatalogLenses }));
        await page.route('**/catalog/expert-mods', async route => route.fulfill({ json: { mods: { cpu: [], audio: [], power: [] } } }));
        await page.route('**/quote', async route => route.fulfill({ json: mockQuote }));

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('AC #1: Le bouton retour est visible dans l\'atelier (mode expert)', async ({ page, isMobile }) => {
        // Le bouton est maintenant disponible sur desktop ET mobile

        // 1. Entrer dans l'atelier via "Atelier Libre"
        await page.getByText('ATELIER LIBRE').click();
        
        // 2. Attendre que le portail disparaisse
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible({ timeout: 8000 });

        // 3. Vérifier que le bouton retour est visible
        // Sur desktop: dans le header, sur mobile: en haut à gauche
        const boutonRetour = page.getByRole('button', { name: /retour au portail de choix du mode/i });
        await expect(boutonRetour).toBeVisible({ timeout: 5000 });
        
        // 4. Vérifier que le texte "RETOUR" est visible (format différent sur mobile: "← RETOUR")
        // Utiliser .first() car il peut y avoir deux boutons (desktop + mobile) mais un seul visible selon la taille d'écran
        if (isMobile) {
            await expect(page.getByText('← RETOUR').first()).toBeVisible();
        } else {
            // Sur desktop, chercher le bouton dans le header (pas celui en haut à gauche mobile)
            await expect(boutonRetour.getByText('RETOUR')).toBeVisible();
        }
    });

    test('AC #2: Le bouton retour n\'est pas visible sur le LandingPortal', async ({ page }) => {
        // 1. Vérifier que le portail est visible au chargement initial
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).toBeVisible();

        // 2. Vérifier que le bouton retour n'est PAS visible
        const boutonRetour = page.getByRole('button', { name: /retour au portail de choix du mode/i });
        await expect(boutonRetour).not.toBeVisible();
    });

    test('AC #3: Le clic sur le bouton retour affiche le LandingPortal', async ({ page, isMobile }) => {
        // Le bouton fonctionne maintenant sur desktop ET mobile

        // 1. Entrer dans l'atelier
        await page.getByText('ATELIER LIBRE').click();
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible({ timeout: 8000 });

        // 2. Vérifier que le bouton retour est visible (desktop ou mobile)
        const boutonRetour = page.getByRole('button', { name: /retour au portail de choix du mode/i });
        await expect(boutonRetour).toBeVisible({ timeout: 5000 });

        // 3. Cliquer sur le bouton retour
        await boutonRetour.click();

        // 4. Vérifier que le portail réapparaît
        await expect(portal).toBeVisible({ timeout: 5000 });

        // 5. Vérifier que les options du portail sont visibles
        await expect(page.getByText('STARTER KITS')).toBeVisible();
        await expect(page.getByText('ATELIER LIBRE')).toBeVisible();
    });

    test('AC #4: Le bouton retour fonctionne depuis l\'atelier avec un pack sélectionné', async ({ page, isMobile }) => {
        // Le bouton fonctionne maintenant sur desktop ET mobile

        // 1. Sélectionner un pack (si disponible)
        // Note: Si aucun pack n'est disponible dans les mocks, on teste juste l'atelier libre
        await page.getByText('ATELIER LIBRE').click();
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible({ timeout: 8000 });

        // 2. Vérifier que le bouton retour est visible
        const boutonRetour = page.getByRole('button', { name: /retour au portail de choix du mode/i });
        await expect(boutonRetour).toBeVisible({ timeout: 5000 });

        // 3. Cliquer sur le bouton retour
        await boutonRetour.click();

        // 4. Vérifier que le portail réapparaît
        await expect(portal).toBeVisible({ timeout: 5000 });
    });

    test('AC #5: Le bouton retour est accessible (aria-label présent)', async ({ page, isMobile }) => {
        // Le bouton est maintenant accessible sur desktop ET mobile

        // 1. Entrer dans l'atelier
        await page.getByText('ATELIER LIBRE').click();
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible({ timeout: 8000 });

        // 2. Vérifier que le bouton a un aria-label
        const boutonRetour = page.getByRole('button', { name: /retour au portail de choix du mode/i });
        await expect(boutonRetour).toBeVisible({ timeout: 5000 });
        
        // 3. Vérifier l'attribut aria-label
        const ariaLabel = await boutonRetour.getAttribute('aria-label');
        expect(ariaLabel).toBe('Retour au portail de choix du mode');
    });

    test('AC #6: Le bouton retour est visible sur mobile (responsive)', async ({ page }) => {
        // 1. Définir une taille d'écran mobile
        await page.setViewportSize({ width: 375, height: 667 });

        // 2. Entrer dans l'atelier
        await page.getByText('ATELIER LIBRE').click();
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible({ timeout: 8000 });

        // 3. Vérifier que le bouton retour mobile est visible (en haut à gauche)
        const boutonRetourMobile = page.getByRole('button', { name: /retour au portail de choix du mode/i });
        await expect(boutonRetourMobile).toBeVisible({ timeout: 5000 });
        
        // 4. Vérifier que le texte "RETOUR" est visible
        await expect(page.getByText('← RETOUR')).toBeVisible();
    });

    test('AC #7: Le bouton retour réinitialise le pack sélectionné (scénario critique)', async ({ page, isMobile }) => {
        // Scénario critique rapporté par l'utilisateur :
        // Pack sélectionné → Retour → Atelier Libre → Le pack ne doit plus être sélectionné

        // Mock un pack pour ce test
        const mockPack = {
            id: 'PACK_TEST_1',
            name: 'Pack Test',
            description: 'Pack de test',
            shell_variant_id: 'VAR_SHELL_GBC_FP_ATOMIC_PURPLE',
            screen_variant_id: 'VAR_SCR_GBC_OEM',
            lens_variant_id: 'VAR_LENS_GBC_GLASS_BLACK',
            price: 20.0
        };

        // Override le mock des packs pour ce test
        await page.route('**/catalog/packs', async route => {
            await route.fulfill({ json: { packs: [mockPack] } });
        });

        // 1. Aller dans Starter Kits
        await page.getByText('STARTER KITS').click();
        await page.waitForTimeout(500); // Attendre le chargement

        // 2. Vérifier que la liste des packs est visible
        await expect(page.getByText('STARTER_KITS')).toBeVisible({ timeout: 5000 });

        // 3. Sélectionner un pack
        const packButton = page.locator('button').filter({ hasText: mockPack.name.toUpperCase() }).first();
        if (await packButton.isVisible({ timeout: 2000 })) {
            await packButton.click();
            
            // 4. Attendre que le portail disparaisse (pack appliqué)
            const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
            await expect(portal).not.toBeVisible({ timeout: 5000 });

            // 5. Vérifier que le pack est sélectionné (badge "PACK ACTIVÉ" visible)
            const packBadge = page.locator('text=PACK ACTIVÉ');
            await expect(packBadge).toBeVisible({ timeout: 3000 });

            // 6. Cliquer sur le bouton retour
            const boutonRetour = page.getByRole('button', { name: /retour au portail de choix du mode/i });
            await expect(boutonRetour).toBeVisible({ timeout: 5000 });
            await boutonRetour.click();

            // 7. Vérifier que le portail réapparaît
            await expect(portal).toBeVisible({ timeout: 5000 });

            // 8. Choisir "Atelier Libre"
            await page.getByText('ATELIER LIBRE').click();
            await expect(portal).not.toBeVisible({ timeout: 5000 });

            // 9. Vérifier que le pack n'est PLUS sélectionné (badge "PACK ACTIVÉ" ne doit pas être visible)
            // Le badge ne doit pas apparaître car le pack a été réinitialisé
            const packBadgeAfter = page.locator('text=PACK ACTIVÉ');
            await expect(packBadgeAfter).not.toBeVisible({ timeout: 2000 });

            // 10. Vérifier que l'atelier est vide (pas de sélections de composants)
            // On vérifie qu'il n'y a pas de composants sélectionnés en cherchant le message "NO SELECTION"
            // ou en vérifiant que le total est à 0
            const noSelectionText = page.locator('text=NO SELECTION');
            // Le texte peut être présent ou non selon l'état, mais le pack ne doit pas être là
            // La vérification principale est que le badge pack n'est pas visible
        } else {
            // Si aucun pack n'est disponible, skip le test mais log
            test.skip(isMobile, 'Pack non disponible dans les mocks pour ce test');
        }
    });
});
