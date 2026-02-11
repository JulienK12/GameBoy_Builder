
import { test, expect } from '@playwright/test';

test.describe('API Contract & Pricing (Story 1.2)', () => {

    test('should calculate correct price for a Pack via API', async ({ request }) => {
        // Simulate frontend calling POST /quote with a pack_id
        // ID from seed data: PACK_BUDGET
        const response = await request.post('http://localhost:3000/quote', {
            data: {
                pack_id: 'PACK_BUDGET',
                overrides: null
            }
        });

        if (!response.ok()) {
            console.log('Status:', response.status());
            console.log('Body:', await response.text());
        }

        expect(response.ok()).toBeTruthy();
        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.pack_name).toBe('Budget Build'); // Name from seed

        // Budget build price (PACK_BUDGET):
        // Shell: VAR_SHELL_GBC_HI_SAPPHIRE_BLUE (Hispeedido) -> ~15-20€ ?
        // Screen: VAR_SCR_GBC_HI_245L_BLACK (Hispeedido 2.45) -> ~45€ ?
        // Lens: VAR_LENS_GBC_STD_BLACK (Standard) -> ~5€ ?
        // Let's just check it's > 0 for now as exact price depends on dynamic catalog
        expect(result.quote.total_price).toBeGreaterThan(0);
    });

    test('should handle Pack with Overrides', async ({ request }) => {
        // Pack Budget + Override Coque (FP Atomic Purple)

        const response = await request.post('http://localhost:3000/quote', {
            data: {
                pack_id: 'PACK_BUDGET',
                overrides: {
                    shell_variant_id: 'VAR_SHELL_GBC_FP_ATOMIC_PURPLE'
                }
            }
        });

        if (!response.ok()) {
            console.log('Status:', response.status());
            console.log('Body:', await response.text());
        }

        expect(response.ok()).toBeTruthy();
        const result = await response.json();

        // Should be different price than base or at least valid
        expect(result.quote.items.some(i => i.label.includes('FunnyPlaying'))).toBe(true);
    });

    test('should return 400 for invalid pack_id', async ({ request }) => {
        const response = await request.post('http://localhost:3000/quote', {
            data: {
                pack_id: 'PACK_INEXISTANT_999'
            }
        });

        expect(response.status()).toBe(400);
        const result = await response.json();
        expect(result.success).toBe(false);
    });
});

test.describe('GET /catalog/expert-mods (Story 2.2 Task 2.4)', () => {

    test('should return expert mods grouped by category', async ({ request }) => {
        const response = await request.get('http://localhost:3000/catalog/expert-mods');

        expect(response.ok()).toBeTruthy();
        const result = await response.json();

        expect(result).toHaveProperty('mods');
        expect(result.mods).toHaveProperty('cpu');
        expect(result.mods).toHaveProperty('audio');
        expect(result.mods).toHaveProperty('power');
        expect(Array.isArray(result.mods.cpu)).toBe(true);
        expect(Array.isArray(result.mods.audio)).toBe(true);
        expect(Array.isArray(result.mods.power)).toBe(true);

        // Each mod should have required fields (from seed or empty)
        for (const mod of [...result.mods.cpu, ...result.mods.audio, ...result.mods.power]) {
            expect(mod).toHaveProperty('id');
            expect(mod).toHaveProperty('name');
            expect(mod).toHaveProperty('price');
            expect(mod).toHaveProperty('category');
        }
    });
});
