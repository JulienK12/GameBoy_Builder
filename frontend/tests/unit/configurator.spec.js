import { setActivePinia, createPinia } from 'pinia';
import { useConfiguratorStore } from '@/stores/configurator';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock backend API
vi.mock('@/api/backend', () => ({
    calculateQuote: vi.fn(() => Promise.resolve({ total_price: 100, items: [] })),
    fetchShells: vi.fn(() => Promise.resolve({})),
    fetchScreens: vi.fn(() => Promise.resolve({})),
    fetchLenses: vi.fn(() => Promise.resolve({})),
    fetchButtons: vi.fn(() => Promise.resolve({})),
    fetchPacks: vi.fn(() => Promise.resolve({})),
    fetchExpertMods: vi.fn(() => Promise.resolve({})),
    formatImageUrl: (url) => url
}));

import { calculateQuote } from '@/api/backend';

describe('Configurator Store - Story 6.3 Granular Buttons', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('should initialize with empty selectedButtons', () => {
        const store = useConfiguratorStore();
        expect(store.selectedButtons).toEqual({});
    });

    it('should update selectedButtons and call API when updateButtonSelection is called', async () => {
        const store = useConfiguratorStore();

        // We need to set shell and screen to trigger quote calculation (as per fetchQuoteData logic)
        store.selectedShellVariantId = 'SHELL_1';
        store.selectedScreenVariantId = 'SCREEN_1';

        // Select a button
        store.updateButtonSelection('d_pad', 'VAR_BTN_GBC_OEM_GRAPE');

        expect(store.selectedButtons).toEqual({
            d_pad: 'VAR_BTN_GBC_OEM_GRAPE'
        });

        // fetchQuoteData calls calculateQuote
        // Wait for promises
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(calculateQuote).toHaveBeenCalled();
        // Verify arguments
        expect(calculateQuote).toHaveBeenCalledWith(expect.objectContaining({
            selected_buttons: { d_pad: 'VAR_BTN_GBC_OEM_GRAPE' }
        }));
    });

    it('should remove button selection if variantId is null', async () => {
        const store = useConfiguratorStore();
        store.selectedShellVariantId = 'SHELL_1';
        store.selectedScreenVariantId = 'SCREEN_1';

        store.selectedButtons = {
            d_pad: 'VAR_BTN_GBC_OEM_GRAPE',
            button_a: 'VAR_BTN_GBC_OEM_TEAL'
        };

        store.updateButtonSelection('d_pad', null);

        expect(store.selectedButtons).toEqual({
            button_a: 'VAR_BTN_GBC_OEM_TEAL'
        });

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(calculateQuote).toHaveBeenCalled();
    });

    it('should include selectedButtons in currentSelection computed', () => {
        const store = useConfiguratorStore();

        // Mock buttonVariants
        store.buttonVariants = [
            { id: 'VAR_BTN_GBC_OEM_GRAPE', name: 'Grape', buttonId: 'd_pad' },
            { id: 'VAR_BTN_GBC_OEM_TEAL', name: 'Teal', buttonId: 'button_a' }
        ];
        // Mock parent buttons
        store.buttons = [
            { id: 'd_pad', name: 'D-Pad' },
            { id: 'button_a', name: 'Bouton A' }
        ];

        store.selectedButtons = {
            d_pad: 'VAR_BTN_GBC_OEM_GRAPE',
            button_a: 'VAR_BTN_GBC_OEM_TEAL'
        };

        const selection = store.currentSelection;
        const dPad = selection.find(s => s.buttonId === 'd_pad');
        const btnA = selection.find(s => s.buttonId === 'button_a');

        expect(dPad).toBeDefined();
        // expect(dPad.name).toBe('Grape'); // computed might assume different structure or name property?
        // Let's check what logic I put in `currentSelection`:
        // if (variant) selection.push({ ...variant, ... })
        // variant has name: 'Grape'.
        expect(dPad.name).toBe('Grape');

        expect(btnA).toBeDefined();
        expect(btnA.name).toBe('Teal');
    });
    it('should clear selectedButtons on resetConfig', () => {
        const store = useConfiguratorStore();
        store.selectedButtons = { d_pad: 'VAR_1', button_a: 'VAR_2' };
        store.resetConfig();
        expect(store.selectedButtons).toEqual({});
    });

    it('should send null for selected_buttons when no granular selection', async () => {
        const store = useConfiguratorStore();
        store.selectedShellVariantId = 'SHELL_1';
        store.selectedScreenVariantId = 'SCREEN_1';
        // selectedButtons is empty {}

        await store.fetchQuote();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(calculateQuote).toHaveBeenCalledWith(expect.objectContaining({
            selected_buttons: null
        }));
    });
});
