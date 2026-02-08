import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { calculateQuote, fetchShells, fetchScreens, fetchLenses, formatImageUrl } from '@/api/backend';
import { CATEGORIES } from '@/constants';

export const useConfiguratorStore = defineStore('configurator', () => {
    // State
    const selectedShellVariantId = ref(null);
    const selectedScreenVariantId = ref(null);
    const selectedLensVariantId = ref(null);
    const selectedShellColorHex = ref('#8B5CF6'); // Default: Atomic Purple

    // UI State
    const activeCategory = ref('shell'); // shell, screen, buttons, lens, power, etc.
    const smartSortEnabled = ref(true); // Auto-sort by compatibility
    const show3D = ref(false); // Toggle between 3D view and Selection Recap

    const quote = ref(null);
    const error = ref(null);
    const isLoading = ref(false);
    const catalogLoading = ref(false);
    const catalogError = ref(null);

    // Shell variants data (loaded from API)
    const shells = ref([]);
    const shellVariants = ref([]);
    const screens = ref([]);
    const screenVariants = ref([]);
    const lenses = ref([]);
    const lensVariants = ref([]);

    // Computed
    const totalPrice = computed(() => quote.value?.total_price ?? 0);
    const hasError = computed(() => error.value !== null);

    const isLensRequired = computed(() => {
        const selectedScreen = screenVariants.value.find(s => s.id === selectedScreenVariantId.value);
        // If screen is laminated, no lens required
        return selectedScreen ? selectedScreen.assembly !== 'Laminated' : true;
    });

    const selectedShellParentId = computed(() => {
        const variant = shellVariants.value.find(s => s.id === selectedShellVariantId.value);
        return variant ? variant.shellId : null;
    });

    const selectedScreenParentId = computed(() => {
        const variant = screenVariants.value.find(s => s.id === selectedScreenVariantId.value);
        return variant ? variant.screenId : null;
    });

    const selectedShellIsTransparent = computed(() => {
        const variant = shellVariants.value.find(s => s.id === selectedShellVariantId.value);
        return variant ? variant.isTransparent : true;
    });

    // Actions
    // Compatibility data
    const compatibility = ref([]);

    // ... (rest of state)

    // Actions
    async function fetchCatalog() {
        catalogLoading.value = true;
        catalogError.value = null;

        try {
            // Fetch real data from backend API
            const [shellsData, screensData, lensesData] = await Promise.all([
                fetchShells(),
                fetchScreens(),
                fetchLenses(),
            ]);

            console.log('📦 Catalogue chargé depuis API:');
            console.log('Shells Data:', shellsData);
            console.log('Screens Data:', screensData);
            console.log('Lenses Data:', lensesData);

            // Load compatibility
            compatibility.value = shellsData.compatibility || [];

            // Process shells
            shells.value = shellsData.shells || [];
            shellVariants.value = (shellsData.variants || []).map(v => {
                // ... (existing mapping logic)
                const parentShell = shells.value.find(s => s.id === v.shell_id);
                return {
                    // ... existing fields
                    id: v.id,
                    name: v.name,
                    colorHex: v.color_hex || '#808080',
                    imageUrl: formatImageUrl(v.image_url),
                    shellId: v.shell_id,
                    supplement: v.supplement || 0,
                    isTransparent: v.is_transparent,
                    brand: parentShell?.brand || 'Unknown',
                    shellName: parentShell?.name || '',
                    mold: parentShell?.mold || '',
                    basePrice: parentShell?.price || 0,
                    fullName: parentShell?.name ? `${parentShell.name} - ${v.name}` : v.name,
                };
            });

            // ... (rest of existing logic for screens/lenses)
            screens.value = screensData.screens || [];
            screenVariants.value = (screensData.variants || []).map(v => {
                const parentScreen = screens.value.find(s => s.id === v.screen_id);
                return {
                    id: v.id,
                    name: v.name,
                    imageUrl: formatImageUrl(v.image_url),
                    screenId: v.screen_id,
                    supplement: v.supplement || 0,
                    assembly: parentScreen?.assembly || v.assembly || 'Component',
                    isLaminated: parentScreen?.assembly === 'Laminated',
                    brand: parentScreen?.brand || 'Unknown',
                    screenName: parentScreen?.name || '',
                    size: parentScreen?.size || 'Standard',
                    basePrice: parentScreen?.price || 0,
                    fullName: parentScreen?.name ? `${parentScreen.name} - ${v.name}` : v.name,
                };
            });
            // ... (OEM screen logic)
            const oemScreen = screens.value.find(s => s.id === 'SCR_GBC_OEM');
            if (oemScreen) {
                screenVariants.value.unshift({
                    id: '__OEM__',  // Special ID to differentiate from "no selection" (which is null)
                    name: 'Écran OEM Original',
                    screenId: 'SCR_GBC_OEM',
                    supplement: 0,
                    assembly: 'Component',
                    isLaminated: false,
                    brand: 'OEM',
                    screenName: 'Original LCD Screen',
                    size: 'Standard',
                    basePrice: 0,
                    fullName: 'Écran OEM Original',
                });
            }

            // Process lenses
            lenses.value = lensesData.lenses || [];
            lensVariants.value = (lensesData.variants || []).map(v => ({
                id: v.id,
                name: v.name,
                imageUrl: formatImageUrl(v.image_url),
                lensId: v.lens_id,
                supplement: v.supplement || 0,
            }));

            // ... (rest of logging/auto-select)
            console.log(`✅ Catalogue chargé: ${shellVariants.value.length} variantes coques, ${screenVariants.value.length} variantes écrans, ${lensVariants.value.length} variantes vitres, ${compatibility.value.length} règles de compatibilité`);

            // NOTE: No auto-selection - user must explicitly choose their configuration
        } catch (err) {
            console.error('Failed to load catalog:', err);
            error.value = 'Impossible de charger le catalogue.';
            catalogError.value = err.message;
            alert('ERREUR CHARGEMENT: ' + err.message);
        } finally {
            catalogLoading.value = false;
        }
    }

    // Helper: Check compatibility
    function checkCompatibility(shellId, screenId) {
        if (!shellId || !screenId) {
            return { compatible: true, status: 'OK', reason: '' };
        }

        const rule = compatibility.value.find(c => c.shell_id === shellId && c.screen_id === screenId);

        if (!rule) {
            return {
                compatible: false,
                status: 'FORBIDDEN',
                reason: 'Désolé, cette combinaison n\'est pas supportée.'
            };
        }

        if (rule.status === 'Yes') {
            return {
                compatible: true,
                status: 'OK',
                reason: 'Composant 100% compatible.'
            };
        } else if (rule.status === 'Warning' || rule.status === 'Cut') {
            return {
                compatible: true,
                status: 'WARNING',
                reason: 'Attention : Service de découpe de coque requis pour cet écran.'
            };
        } else {
            return {
                compatible: false,
                status: 'FORBIDDEN',
                reason: 'Incompatible avec le modèle de coque sélectionné.'
            };
        }
    }



    async function fetchQuoteData() {
        // Only fetch if user has selected both shell AND screen
        if (!selectedShellVariantId.value || !selectedScreenVariantId.value) {
            quote.value = null;
            error.value = null;
            return;
        }

        isLoading.value = true;
        error.value = null;

        try {
            quote.value = await calculateQuote({
                shellVariantId: selectedShellVariantId.value,
                screenVariantId: selectedScreenVariantId.value,
                lensVariantId: selectedLensVariantId.value,
            });
        } catch (err) {
            error.value = err.response?.data?.error || 'Erreur de connexion au serveur';
            quote.value = null;
        } finally {
            isLoading.value = false;
        }
    }

    function selectShell(variantId, colorHex) {
        if (selectedShellVariantId.value === variantId) {
            selectedShellVariantId.value = null;
            // No color change needed or reset to default? I'll keep it or reset.
        } else {
            selectedShellVariantId.value = variantId;
            selectedShellColorHex.value = colorHex;
        }
        fetchQuoteData();
    }

    function selectScreen(variantId) {
        if (selectedScreenVariantId.value === variantId) {
            selectedScreenVariantId.value = null;
        } else {
            selectedScreenVariantId.value = variantId;
        }

        // Auto-clear lens logic REMOVED to allow optional lens purchase
        // if (!isLensRequired.value) {
        //     selectedLensVariantId.value = null;
        // }

        fetchQuoteData();
    }

    function selectLens(variantId) {
        if (selectedLensVariantId.value === variantId) {
            selectedLensVariantId.value = null;
        } else {
            selectedLensVariantId.value = variantId;
        }
        fetchQuoteData();
    }

    function resetConfig() {
        selectedShellVariantId.value = null;
        selectedScreenVariantId.value = null;
        selectedLensVariantId.value = null;
        quote.value = null;
        error.value = null;
        // Optionally reset category to shell
        activeCategory.value = 'shell';
    }

    // Helper: Determine compatibility based on selected variants in other categories
    function getCompatibility(variant) {
        if (!variant) return 'Yes';

        if (activeCategory.value === 'shell') {
            // If we are looking at shells, check against selected screen
            return checkCompatibility(variant.shellId, selectedScreenParentId.value);
        } else if (activeCategory.value === 'screen') {
            // If we are looking at screens, check against selected shell
            return checkCompatibility(selectedShellParentId.value, variant.screenId);
        }

        return 'Yes';
    }

    function setCategory(category) {
        activeCategory.value = category;
    }

    function toggle3D() {
        show3D.value = !show3D.value;
    }

    return {
        // State
        selectedShellVariantId,
        selectedScreenVariantId,
        selectedLensVariantId,
        selectedShellColorHex,
        activeCategory,
        smartSortEnabled, // Integrated
        show3D,          // New state
        selectedShellParentId,   // Exposed for gallery
        selectedScreenParentId,  // Exposed for gallery
        categories: CATEGORIES,
        quote,
        error,
        isLoading,
        catalogLoading,
        catalogError,
        shells,
        shellVariants,
        screens,
        screenVariants,
        lenses,
        lensVariants,
        // Computed
        totalPrice,
        hasError,
        isLensRequired,
        selectedShellIsTransparent,
        currentSelection: computed(() => {
            const selection = [];
            // Shell
            if (selectedShellVariantId.value) {
                const s = shellVariants.value.find(v => v.id === selectedShellVariantId.value);
                if (s) selection.push({ ...s, category: 'shell', label: `COQUE ${s.brand}`, detail: s.name });
            }
            // Screen
            if (selectedScreenVariantId.value) {
                const s = screenVariants.value.find(v => v.id === selectedScreenVariantId.value);
                if (s) selection.push({ ...s, category: 'screen', label: `ÉCRAN ${s.brand}`, detail: s.name });
            }
            // Lens
            if (selectedLensVariantId.value) {
                const l = lensVariants.value.find(v => v.id === selectedLensVariantId.value);
                if (l) selection.push({ ...l, category: 'lens', label: 'VITRE', detail: l.name });
            }
            // NOTE: Service items are now fetched from backend via quote.items
            return selection;
        }),
        // Actions
        selectShell,
        selectScreen,
        selectLens,
        setCategory, // Exposed
        toggle3D,
        fetchQuote: fetchQuoteData,
        fetchCatalog,
        checkCompatibility,
        resetConfig,
    };
});

