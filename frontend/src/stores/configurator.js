import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { calculateQuote, fetchShells, fetchScreens, fetchLenses, fetchButtons, fetchPacks, fetchExpertMods, formatImageUrl } from '@/api/backend';
import { CATEGORIES } from '@/constants';

export const useConfiguratorStore = defineStore('configurator', () => {
    // State
    const selectedShellVariantId = ref(null);
    const selectedScreenVariantId = ref(null);
    const selectedLensVariantId = ref(null);
    const selectedButtonVariantId = ref(null);
    const selectedButtons = ref({}); // Story 6.3 - Granular selection { button_id: variant_id }
    const selectedShellColorHex = ref('#8B5CF6'); // Default: Atomic Purple

    // UI State
    const activeCategory = ref('shell'); // shell, screen, buttons, lens, power, etc.
    const smartSortEnabled = ref(true); // Auto-sort by compatibility
    const show3D = ref(false); // Toggle between 3D view and Selection Recap
    const showLandingPortal = ref(true); // Portail d'accueil visible par défaut
    const isExpertMode = ref(false); // Expert Mode toggle state
    const showSignatureShowcase = ref(false); // Story 4.1 — mode Signature plein écran
    const submissionSuccessMessage = ref(null); // Story 4.2 — message après POST /quote/submit réussi ("Commande enregistrée")

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
    const buttons = ref([]);
    const buttonVariants = ref([]);

    // Packs data
    const packs = ref([]);
    const selectedPackId = ref(null);

    // Expert Options (Story 2.3)
    const selectedExpertOptions = ref({ cpu: null, audio: null, power: null });

    // Rollback system for optimistic updates (Story 2.3)
    const lastValidConfig = ref(null);
    const pendingSelections = ref({}); // { category: modId }
    const validationQueue = ref([]); // [{ category, modId }]
    const isValidating = ref(false);
    const expertValidationError = ref(null);
    const isNetworkError = ref(false); // true si erreur réseau (pour afficher "Réessayer")
    const glitchTrigger = ref(false); // déclenche l'effet Glitch global (AC #3, #5)
    const GLITCH_DURATION_MS = 500; // aligné avec GlitchEffect.vue
    const expertMods = ref({ cpu: [], audio: [], power: [] }); // mods chargés depuis l'API (Story 2.2/2.3)
    const lastFailedValidation = ref(null); // { category, modId } pour bouton Réessayer (AC #5)
    const expertModsLoaded = ref(false); // cache : un seul chargement quand isExpertMode devient true (Task 4.3)
    const lastSuccessSelection = ref(null); // { category, modId, until } pour feedback vert 1–2 s (Task 10)

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
            const [shellsData, screensData, lensesData, buttonsData] = await Promise.all([
                fetchShells(),
                fetchScreens(),
                fetchLenses(),
                fetchButtons(),
            ]);

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

            // Process buttons
            buttons.value = buttonsData.buttons || [];
            buttonVariants.value = (buttonsData.variants || []).map(v => {
                const parentButton = buttons.value.find(b => b.id === v.button_id);
                return {
                    id: v.id,
                    name: v.name,
                    imageUrl: formatImageUrl(v.image_url),
                    buttonId: v.button_id,
                    supplement: v.supplement || 0,
                    colorHex: v.color_hex || null,
                    isTransparent: v.is_transparent || false,
                    isGlowInDark: v.is_glow_in_dark || false,
                    brand: parentButton?.brand || 'Unknown',
                    buttonName: parentButton?.name || '',
                    basePrice: parentButton?.price || 0,
                    fullName: parentButton?.name ? `${parentButton.name} - ${v.name}` : v.name,
                };
            });

            // ... (rest of logging/auto-select)
            console.log(`✅ Catalogue chargé: ${shellVariants.value.length} variantes coques, ${screenVariants.value.length} variantes écrans, ${lensVariants.value.length} variantes vitres, ${buttonVariants.value.length} variantes boutons, ${compatibility.value.length} règles de compatibilité`);

            // NOTE: No auto-selection - user must explicitly choose their configuration
        } catch (err) {
            console.error('Failed to load catalog:', err);
            error.value = 'Impossible de charger le catalogue.';
            catalogError.value = err.message;
            alert('ERREUR CHARGEMENT: ' + err.message);
            throw err;
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
            // Inclure expert options si Expert Mode est actif
            const expertOptions = isExpertMode.value ? selectedExpertOptions.value : null;

            quote.value = await calculateQuote({
                shellVariantId: selectedShellVariantId.value,
                screenVariantId: selectedScreenVariantId.value,
                lensVariantId: selectedLensVariantId.value,
                buttonVariantId: selectedButtonVariantId.value,
                selected_buttons: Object.keys(selectedButtons.value).length > 0 ? selectedButtons.value : null,
                expertOptions,
            });
        } catch (err) {
            error.value = err.response?.data?.error || 'Erreur de connexion au serveur';
            quote.value = null;
        } finally {
            isLoading.value = false;
        }
    }

    function selectShell(variantId, colorHex, skipFetch = false) {
        if (selectedShellVariantId.value === variantId) {
            selectedShellVariantId.value = null;
        } else {
            selectedShellVariantId.value = variantId;
            selectedShellColorHex.value = colorHex;
        }
        if (!skipFetch) fetchQuoteData();
    }

    function selectScreen(variantId, skipFetch = false) {
        if (selectedScreenVariantId.value === variantId) {
            selectedScreenVariantId.value = null;
        } else {
            selectedScreenVariantId.value = variantId;
        }

        if (!skipFetch) fetchQuoteData();
    }

    function selectLens(variantId, skipFetch = false) {
        if (selectedLensVariantId.value === variantId) {
            selectedLensVariantId.value = null;
        } else {
            selectedLensVariantId.value = variantId;
        }
        if (!skipFetch) fetchQuoteData();
    }

    /**
     * Sélectionne une variante de boutons
     * @param {string|null} variantId - ID de la variante à sélectionner, ou null pour désélectionner
     * @param {boolean} skipFetch - Si true, ne déclenche pas le recalcul du devis
     */
    function selectButton(variantId, skipFetch = false) {
        // Validation: vérifier que le variantId existe si fourni
        if (variantId && !buttonVariants.value.find(v => v.id === variantId)) {
            console.error(`❌ Button variant "${variantId}" not found in catalog`);
            return;
        }

        if (selectedButtonVariantId.value === variantId) {
            selectedButtonVariantId.value = null;
        } else {
            selectedButtonVariantId.value = variantId;
        }
        // Story 6.3: Clearing granular selection when main kit is selected could be an option,
        // but for now we keep them independent or let selectedButtons override in backend.
        // User flow: selection of a kit might clear granular? 
        // Let's clear granular if a master kit is selected to avoid confusion?
        // For now, keep simple.

        if (!skipFetch) fetchQuoteData();
    }

    /**
     * Story 6.3 - Update specific button selection
     */
    function updateButtonSelection(buttonId, variantId) {
        if (!variantId) {
            const newSelection = { ...selectedButtons.value };
            delete newSelection[buttonId];
            selectedButtons.value = newSelection;
        } else {
            selectedButtons.value = {
                ...selectedButtons.value,
                [buttonId]: variantId
            };
        }
        fetchQuoteData();
    }

    function resetConfig() {
        selectedShellVariantId.value = null;
        selectedScreenVariantId.value = null;
        selectedLensVariantId.value = null;
        selectedButtonVariantId.value = null;
        selectedButtons.value = {};
        selectedPackId.value = null;
        quote.value = null;
        error.value = null;
        showSignatureShowcase.value = false; // Story 4.1 — fermer le showcase si config réinitialisée
        // Optionally reset category to shell
        activeCategory.value = 'shell';
    }

    // Charger les packs depuis l'API
    async function fetchPacksAction() {
        try {
            const data = await fetchPacks();
            packs.value = data.packs || [];
            console.log(`✅ ${packs.value.length} packs chargés`);
        } catch (err) {
            console.error('Erreur chargement packs:', err);
        }
    }

    // Charger les mods expert (Story 2.2/2.3) — lazy loading avec cache (Task 4.3)
    async function fetchExpertModsAction() {
        if (expertModsLoaded.value) return;
        try {
            const data = await fetchExpertMods();
            const mods = data.mods || {};
            expertMods.value = {
                cpu: mods.cpu || [],
                audio: mods.audio || [],
                power: mods.power || [],
            };
            expertModsLoaded.value = true;
        } catch (err) {
            console.error('Erreur chargement mods expert:', err);
        }
    }

    // Sélectionner un pack et appliquer ses composants
    function selectPack(packId) {
        const pack = packs.value.find(p => p.id === packId);
        if (!pack) {
            return;
        }

        selectedPackId.value = packId;

        // Résoudre la variante shell et sa couleur
        const shellVariant = shellVariants.value.find(v => v.id === pack.shell_variant_id);
        if (shellVariant) {
            selectShell(shellVariant.id, shellVariant.colorHex, true);
        }

        // Résoudre la variante screen
        const screenVariant = screenVariants.value.find(v => v.id === pack.screen_variant_id);
        if (screenVariant) {
            selectScreen(screenVariant.id, true);
        }

        // Résoudre la variante lens (optionnelle)
        if (pack.lens_variant_id) {
            const lensVariant = lensVariants.value.find(v => v.id === pack.lens_variant_id);
            if (lensVariant) {
                selectLens(lensVariant.id, true);
            }
        }

        // Appel unique au devis après avoir appliqué tout le pack
        fetchQuoteData();

        // Fermer le portail
        showLandingPortal.value = false;
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

    function toggleExpertMode() {
        isExpertMode.value = !isExpertMode.value;
    }

    // ========================================
    // Expert Mods - Rollback System (Story 2.3)
    // ========================================

    /**
     * Sauvegarde la configuration actuelle comme valide (avant modification optimiste)
     */
    function saveCurrentConfigAsValid() {
        lastValidConfig.value = {
            selectedShellVariantId: selectedShellVariantId.value,
            selectedScreenVariantId: selectedScreenVariantId.value,
            selectedLensVariantId: selectedLensVariantId.value,
            selectedExpertOptions: JSON.parse(JSON.stringify(selectedExpertOptions.value)), // Deep copy
        };
    }

    /**
     * Restaure l'état depuis la dernière configuration valide (rollback)
     */
    function rollbackToLastValidConfig() {
        if (!lastValidConfig.value) return;

        selectedShellVariantId.value = lastValidConfig.value.selectedShellVariantId;
        selectedScreenVariantId.value = lastValidConfig.value.selectedScreenVariantId;
        selectedLensVariantId.value = lastValidConfig.value.selectedLensVariantId;
        selectedExpertOptions.value = JSON.parse(JSON.stringify(lastValidConfig.value.selectedExpertOptions));
        pendingSelections.value = {};
    }

    // ========================================
    // Expert Mods - Validation Queue (Story 2.3)
    // ========================================

    /**
     * Ajoute une validation expert à la queue
     */
    function enqueueValidation(category, modId) {
        validationQueue.value.push({ category, modId });
        processValidationQueue();
    }

    /** Délais de retry en ms (AC #5 : 3 tentatives max, backoff 1s, 2s, 4s) */
    const RETRY_DELAYS_MS = [1000, 2000, 4000];

    /**
     * Traite les validations expert séquentiellement (avec retry réseau 3x backoff)
     */
    async function processValidationQueue() {
        if (isValidating.value || validationQueue.value.length === 0) return;

        isValidating.value = true;
        const { category, modId } = validationQueue.value.shift();
        const config = {
            shellVariantId: selectedShellVariantId.value,
            screenVariantId: selectedScreenVariantId.value,
            lensVariantId: selectedLensVariantId.value,
            expertOptions: { ...selectedExpertOptions.value },
        };

        try {
            let lastError;
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    await validateExpertSelection(config);
                    lastError = null;
                    break;
                } catch (err) {
                    lastError = err;
                    // Erreur métier (400) : pas de retry
                    if (err.response?.status === 400) break;
                    if (attempt < 2) {
                        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
                    }
                }
            }
            if (lastError) throw lastError;

            // Succès : retirer pending, afficher feedback positif (Task 10 - glow vert 1–2 s)
            delete pendingSelections.value[category];
            expertValidationError.value = null;
            isNetworkError.value = false;
            lastFailedValidation.value = null;
            lastSuccessSelection.value = { category, modId, until: Date.now() + 1500 };
            setTimeout(() => {
                if (lastSuccessSelection.value?.category === category && lastSuccessSelection.value?.modId === modId) {
                    lastSuccessSelection.value = null;
                }
            }, 1500);

            await fetchQuoteData();
        } catch (error) {
            rollbackToLastValidConfig();
            expertValidationError.value = error.response?.data?.error || error.message || 'Erreur de validation';
            isNetworkError.value = !error.response;
            lastFailedValidation.value = { category, modId };
            glitchTrigger.value = true;
            setTimeout(() => { glitchTrigger.value = false; }, GLITCH_DURATION_MS);
        } finally {
            isValidating.value = false;
            processValidationQueue();
        }
    }

    /**
     * Valide une sélection expert avec le backend (throw si erreur 400 ou réseau)
     */
    async function validateExpertSelection(config) {
        const response = await calculateQuote({
            shellVariantId: config.shellVariantId,
            screenVariantId: config.screenVariantId,
            lensVariantId: config.lensVariantId,
            expertOptions: config.expertOptions,
        });
        if (!response) throw new Error('Erreur de validation');
        return response;
    }

    /**
     * Réessayer la validation après une erreur réseau (Story 2.3 - AC #5)
     * Re-applique la dernière sélection et re-enqueue sa validation, sinon rafraîchit le devis.
     */
    function retryExpertValidation() {
        expertValidationError.value = null;
        isNetworkError.value = false;
        const failed = lastFailedValidation.value;
        lastFailedValidation.value = null;
        if (failed) {
            saveCurrentConfigAsValid();
            selectedExpertOptions.value[failed.category] = failed.modId;
            pendingSelections.value[failed.category] = failed.modId;
            enqueueValidation(failed.category, failed.modId);
        } else {
            fetchQuoteData();
        }
    }

    /**
     * Sélectionne un mod expert avec optimistic update (Story 2.3)
     */
    function selectExpertMod(category, modId) {
        // Sauvegarder l'état actuel avant modification
        saveCurrentConfigAsValid();

        // Optimistic update : appliquer immédiatement
        selectedExpertOptions.value[category] = modId;
        pendingSelections.value[category] = modId;

        // Envoyer à la queue de validation
        enqueueValidation(category, modId);
    }

    return {
        // State
        selectedShellVariantId,
        selectedScreenVariantId,
        selectedLensVariantId,
        selectedButtonVariantId,
        selectedButtons,
        selectedShellColorHex,
        activeCategory,
        smartSortEnabled, // Integrated
        show3D,          // New state
        isExpertMode,    // Expert Mode state
        showSignatureShowcase, // Story 4.1 — Signature Showcase fullscreen
        submissionSuccessMessage, // Story 4.2 — récap panier après submit
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
        buttons,
        buttonVariants,
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
            // Buttons (optional - user can finalize without selecting buttons)
            if (selectedButtonVariantId.value) {
                const b = buttonVariants.value.find(v => v.id === selectedButtonVariantId.value);
                if (b) selection.push({ ...b, category: 'buttons', label: 'BOUTONS', detail: b.name });
            }

            // Buttons (Granular)
            if (Object.keys(selectedButtons.value).length > 0) {
                Object.entries(selectedButtons.value).forEach(([btnId, variantId]) => {
                    const variant = buttonVariants.value.find(v => v.id === variantId);
                    const button = buttons.value.find(b => b.id === btnId);
                    if (variant) {
                        selection.push({
                            ...variant,
                            category: 'buttons',
                            label: button ? button.name.toUpperCase() : 'BOUTON',
                            detail: variant.name,
                            buttonId: btnId // Helper for tests/UI
                        });
                    }
                });
            }
            // NOTE: Service items are now fetched from backend via quote.items
            return selection;
        }),
        // Actions
        selectShell,
        selectScreen,
        selectLens,
        selectButton,
        updateButtonSelection,
        selectPack,
        setCategory, // Exposed
        toggle3D,
        toggleExpertMode,
        fetchQuote: fetchQuoteData,
        fetchCatalog,
        fetchPacksAction,
        fetchExpertModsAction,
        checkCompatibility,
        resetConfig,
        // Portal state
        showLandingPortal,
        packs,
        selectedPackId,
        // Expert Options (Story 2.3)
        selectedExpertOptions,
        pendingSelections,
        isValidating,
        expertValidationError,
        isNetworkError,
        glitchTrigger,
        expertMods,
        lastSuccessSelection,
        selectExpertMod,
        rollbackToLastValidConfig,
        retryExpertValidation,
    };
});

