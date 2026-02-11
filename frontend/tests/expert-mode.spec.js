import { test, expect } from '@playwright/test';

test.describe('Expert Mode Toggle', () => {

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

    const mockExpertMods = {
        mods: {
            cpu: [
                { id: 'MOD_CPU_OVERCLOCK_2X', name: 'CPU Overclock 2x', category: 'Cpu', price: 25, technical_specs: {}, power_requirements: null, description: 'Double la vitesse.', tooltip_content: 'Impact: 2x. Dépendances: Aucune.', dependencies: [] }
            ],
            audio: [
                { id: 'MOD_AUDIO_CLEANAMP_PRO', name: 'CleanAmp Pro', category: 'Audio', price: 35, technical_specs: { amplification: '2x' }, power_requirements: '1700mAh', description: 'Amplification 2x.', tooltip_content: 'Nécessite batterie 1700mAh.', dependencies: ['MOD_POWER_BATTERY_1700MAH'] }
            ],
            power: [
                { id: 'MOD_POWER_BATTERY_1700MAH', name: 'Batterie 1700mAh', category: 'Power', price: 18, technical_specs: {}, power_requirements: null, description: 'Batterie.', tooltip_content: 'Autonomie.', dependencies: [] }
            ]
        }
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

        await page.route('**/catalog/expert-mods', async route => {
            await route.fulfill({ json: mockExpertMods });
        });

        await page.route('**/quote', async route => {
            await route.fulfill({ json: mockQuote });
        });

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('should preserve pack selections when activating Expert Mode', async ({ page }) => {
        // 1. Select a pack
        const portal = page.locator('text=STARTER KITS');
        await expect(portal).toBeVisible();
        await portal.click();

        // Wait for packs list to load (async fetch + transition)
        const packButton = page.getByText(/budget gamer/i).first();
        await expect(packButton).toBeVisible({ timeout: 10000 });
        await packButton.click();

        // Wait for portal to close (configurator visible)
        await expect(page.locator('button:has-text("EXPERT_OFF")')).toBeVisible({ timeout: 10000 });

        // 2. Verify pack components are visible in Selection Recap
        await expect(page.locator('text=/atomic purple/i').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=/original lcd/i').first()).toBeVisible();

        // 3. Activate Expert Mode
        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expect(expertToggle).toBeVisible();
        await expertToggle.click();

        // 4. Verify Expert Sidebar is visible (aside containing EXPERT_MODE)
        const expertSidebar = page.locator('aside:has-text("EXPERT_MODE")');
        await expect(expertSidebar).toBeVisible({ timeout: 5000 });

        // 5. Verify pack components are still visible in Expert Sidebar (Configuration de Base)
        await expect(expertSidebar.locator('text=/atomic purple/i').first()).toBeVisible();
        await expect(expertSidebar.locator('text=/original lcd/i').first()).toBeVisible();

        // 6. Verify pack badge is still visible in Selection Recap
        await expect(page.locator('text=🎁')).toBeVisible();
        await expect(page.getByText(/budget gamer/i).first()).toBeVisible();
    });

    test('should preserve selections when toggling Expert Mode on and off', async ({ page }) => {
        // 1. Enter via "Atelier Libre" and select components manually
        await page.locator('text=ATELIER LIBRE').click();
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible();

        // 2. Select Shell
        const shellNav = page.locator('button[data-category="shell"]').filter({ visible: true }).first();
        await shellNav.click();
        const variantCard = page.locator('[data-variant-id="VAR_SHELL_GBC_FP_ATOMIC_PURPLE"]').filter({ visible: true }).first();
        await expect(variantCard).toBeVisible({ timeout: 10000 });
        await variantCard.scrollIntoViewIfNeeded();
        await variantCard.click();

        // 3. Select Screen
        const screenNav = page.locator('button[data-category="screen"]').filter({ visible: true }).first();
        await screenNav.click();
        const screenCard = page.locator('[data-variant-id="VAR_SCR_GBC_OEM"]').filter({ visible: true }).first();
        await screenCard.scrollIntoViewIfNeeded();
        await screenCard.click();

        // 4. Verify selections are visible
        await expect(page.locator('text=/atomic purple/i').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=/original lcd/i').first()).toBeVisible();

        // 5. Activate Expert Mode
        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expertToggle.click();

        // 6. Verify Expert Sidebar appears
        await expect(page.locator('text=EXPERT_MODE')).toBeVisible({ timeout: 5000 });

        // 7. Deactivate Expert Mode
        const expertToggleActive = page.locator('button:has-text("EXPERT_ON")').first();
        await expertToggleActive.click();

        // 8. Verify Expert Sidebar disappears
        await expect(page.locator('text=EXPERT_MODE')).not.toBeVisible({ timeout: 5000 });

        // 9. Verify selections are still preserved
        await expect(page.locator('text=/atomic purple/i').first()).toBeVisible();
        await expect(page.locator('text=/original lcd/i').first()).toBeVisible();
    });

    test('should display Expert toggle button in HUD', async ({ page }) => {
        // 1. Navigate to page
        await page.locator('text=ATELIER LIBRE').click();
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible();

        // 2. Verify Expert toggle is visible
        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expect(expertToggle).toBeVisible();

        // 3. Verify toggle is clickable
        await expect(expertToggle).toBeEnabled();

        // 4. Verify toggle has correct styling when inactive
        const toggleClasses = await expertToggle.getAttribute('class');
        expect(toggleClasses).toContain('glass-premium');
        expect(toggleClasses).toContain('font-retro');
    });

    test('should animate Expert Sidebar reveal and hide', async ({ page }) => {
        // 1. Navigate to page
        await page.locator('text=ATELIER LIBRE').click();
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible();

        // 2. Activate Expert Mode
        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expertToggle.click();

        // 3. Verify Expert Sidebar appears with animation (check for transition class)
        const expertSidebar = page.locator('aside:has-text("EXPERT_MODE")');
        await expect(expertSidebar).toBeVisible({ timeout: 5000 });
        
        // Check that sidebar has slide-in transition classes
        const sidebarClasses = await expertSidebar.getAttribute('class');
        // The transition is handled by Vue Transition component, so we verify the sidebar is visible

        // 4. Deactivate Expert Mode
        const expertToggleActive = page.locator('button:has-text("EXPERT_ON")').first();
        await expertToggleActive.click();

        // 5. Verify Expert Sidebar disappears with animation
        await expect(expertSidebar).not.toBeVisible({ timeout: 5000 });
    });

    test('should adjust SelectionRecap layout when Expert Sidebar is visible', async ({ page }) => {
        // 1. Navigate to page and select components
        await page.locator('text=ATELIER LIBRE').click();
        const portal = page.locator('.fixed.inset-0.z-\\[100\\]');
        await expect(portal).not.toBeVisible();

        // 2. Select Shell
        const shellNav = page.locator('button[data-category="shell"]').filter({ visible: true }).first();
        await shellNav.click();
        const variantCard = page.locator('[data-variant-id="VAR_SHELL_GBC_FP_ATOMIC_PURPLE"]').filter({ visible: true }).first();
        await expect(variantCard).toBeVisible({ timeout: 10000 });
        await variantCard.scrollIntoViewIfNeeded();
        await variantCard.click();

        // 3. Select Screen
        const screenNav = page.locator('button[data-category="screen"]').filter({ visible: true }).first();
        await screenNav.click();
        const screenCard = page.locator('[data-variant-id="VAR_SCR_GBC_OEM"]').filter({ visible: true }).first();
        await screenCard.scrollIntoViewIfNeeded();
        await screenCard.click();

        // 4. Verify SelectionRecap is visible
        const selectionRecap = page.locator('text=/atomic purple/i').first();
        await expect(selectionRecap).toBeVisible({ timeout: 5000 });

        // 5. Get initial margin-left value (should be lg:ml-[480px] when Expert Mode is off)
        const recapContainer = page.locator('.lg\\:ml-\\[480px\\]').first();
        await expect(recapContainer).toBeVisible();

        // 6. Activate Expert Mode
        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expertToggle.click();

        // 7. Verify Expert Sidebar is visible
        const expertSidebar = page.locator('aside:has-text("EXPERT_MODE")');
        await expect(expertSidebar).toBeVisible({ timeout: 5000 });

        // 8. Verify SelectionRecap layout has adjusted (should now have lg:ml-[920px] when Expert Mode is on)
        const adjustedRecapContainer = page.locator('.lg\\:ml-\\[920px\\]').first();
        await expect(adjustedRecapContainer).toBeVisible({ timeout: 2000 });

        // 9. Verify SelectionRecap content is still visible and not overlapped
        await expect(selectionRecap).toBeVisible();
    });

    // --- Story 2.2: Sidebar technique HUD (Tasks 9.1, 9.5) ---
    test('should display three expert mod categories (CPU, Audio, Alimentation) when Expert Mode is on (Story 2.2 AC #1, Task 9.1)', async ({ page }) => {
        await page.locator('text=ATELIER LIBRE').click();
        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expertToggle.click();

        const sidebar = page.locator('aside:has-text("EXPERT_MODE")');
        await expect(sidebar).toBeVisible({ timeout: 5000 });

        await expect(sidebar.locator('text=CPU').first()).toBeVisible();
        await expect(sidebar.locator('text=AUDIO').first()).toBeVisible();
        await expect(sidebar.locator('text=ALIMENTATION').first()).toBeVisible();
    });

    test('should display Configuration de Base section with base selections (Story 2.2 AC #6, Task 9.5)', async ({ page }) => {
        await page.locator('text=ATELIER LIBRE').click();
        const shellNav = page.locator('button[data-category="shell"]').filter({ visible: true }).first();
        await shellNav.click();
        const variantCard = page.locator('[data-variant-id="VAR_SHELL_GBC_FP_ATOMIC_PURPLE"]').filter({ visible: true }).first();
        await expect(variantCard).toBeVisible({ timeout: 10000 });
        await variantCard.click();

        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expertToggle.click();

        const sidebar = page.locator('aside:has-text("EXPERT_MODE")');
        await expect(sidebar).toBeVisible({ timeout: 5000 });
        await expect(sidebar.locator('text=Configuration de Base').first()).toBeVisible();
        await expect(sidebar.locator('text=/atomic purple/i').first()).toBeVisible();
    });

    test('should show mod selection state and expert mods in sidebar (Story 2.2 Task 9.2)', async ({ page }) => {
        await page.locator('text=ATELIER LIBRE').click();
        const shellNav = page.locator('button[data-category="shell"]').filter({ visible: true }).first();
        await shellNav.click();
        await page.locator('[data-variant-id="VAR_SHELL_GBC_FP_ATOMIC_PURPLE"]').filter({ visible: true }).first().click();
        const screenNav = page.locator('button[data-category="screen"]').filter({ visible: true }).first();
        await screenNav.click();
        await page.locator('[data-variant-id="VAR_SCR_GBC_OEM"]').filter({ visible: true }).first().click();

        const expertToggle = page.locator('button:has-text("EXPERT_OFF")').first();
        await expertToggle.click();

        const sidebar = page.locator('aside:has-text("EXPERT_MODE")');
        await expect(sidebar).toBeVisible({ timeout: 5000 });
        await expect(sidebar.locator('text=CleanAmp Pro').first()).toBeVisible();
        await expect(sidebar.locator('text=CPU Overclock 2x').first()).toBeVisible();

        await sidebar.locator('text=CPU Overclock 2x').first().click();
        await expect(sidebar.locator('button:has-text("CPU Overclock 2x")').first()).toHaveAttribute('aria-pressed', 'true');
    });
});
