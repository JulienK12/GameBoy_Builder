import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';
import { useAuthStore } from '@/stores/auth';
import { getShellImageUrl, fetchDeck, createDeckConfig, deleteDeckConfig } from '@/api/backend';

/** Nombre max de configurations dans le deck (Story 3.1 / 3.2). */
const MAX_DECK_CONFIGS = 3;

/** Normalise un élément API (snake_case) vers le format store (totalPrice). */
function normalizeConfig(c) {
    return {
        id: c.id,
        name: c.name,
        configuration: c.configuration || {},
        totalPrice: c.total_price ?? c.totalPrice,
    };
}

/**
 * Store Pinia "deck" — jusqu'à 3 configurations sauvegardées pour comparaison (Story 3.1).
 * Persistance locale via pinia-plugin-persistedstate (Story 3.2) — clé localStorage: gameboy-deck.
 * Story 3.3 : si connecté, sync avec le backend (GET/POST/DELETE /deck).
 */
export const useDeckStore = defineStore(
    'deck',
    () => {
    /** @type {import('vue').Ref<Array<{ id: string, name: string, configuration: object, totalPrice?: number }>>} */
    const configurations = ref([]);

    const canAddMore = computed(() => configurations.value.length < MAX_DECK_CONFIGS);

    /**
     * Snapshot de la configuration actuelle du configurator (aligné QuoteRequest + options expert).
     */
    function buildConfigurationSnapshot() {
        const configurator = useConfiguratorStore();
        return {
            shellVariantId: configurator.selectedShellVariantId,
            screenVariantId: configurator.selectedScreenVariantId,
            lensVariantId: configurator.selectedLensVariantId,
            selectedExpertOptions: configurator.selectedExpertOptions
                ? { ...configurator.selectedExpertOptions }
                : null,
            selectedShellColorHex: configurator.selectedShellColorHex ?? null,
        };
    }

    /**
     * Génère un nom par défaut pour une configuration (ex. "Configuration 1", "Configuration 2").
     */
    function getDefaultName() {
        const n = configurations.value.length + 1;
        return `Configuration ${n}`;
    }

    /**
     * Charge le deck depuis le backend si l'utilisateur est connecté (Story 3.3).
     * À appeler au chargement de l'app ou à l'ouverture du Deck Manager.
     * @returns {Promise<boolean>} true si chargé depuis le cloud, false sinon (invité ou erreur)
     */
    async function loadFromCloud() {
        const auth = useAuthStore();
        const ok = await auth.fetchUser();
        if (!ok || !auth.isAuthenticated) return false;
        try {
            const data = await fetchDeck();
            configurations.value = (data.configurations || []).map(normalizeConfig);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Ajoute la configuration actuelle du configurator au deck.
     * Si connecté : POST /deck puis mise à jour du store ; sinon localStorage (Story 3.2).
     * @param {string} [name] - Nom optionnel ; sinon "Configuration 1", "Configuration 2", etc.
     * @returns {Promise<boolean>} true si ajouté, false si limite atteinte ou erreur
     */
    async function addCurrentConfig(name) {
        if (configurations.value.length >= MAX_DECK_CONFIGS) return false;

        const configurator = useConfiguratorStore();
        const quote = configurator.quote;
        const totalPrice = quote?.total_price ?? 0;
        const configuration = buildConfigurationSnapshot();
        const displayName = name?.trim() || getDefaultName();

        const auth = useAuthStore();
        if (auth.isAuthenticated) {
            const res = await createDeckConfig({ name: displayName, configuration });
            const c = res.configuration;
            configurations.value.push(normalizeConfig(c));
            return true;
        }

        const id = crypto.randomUUID();
        configurations.value.push({
            id,
            name: displayName,
            configuration,
            totalPrice,
        });
        return true;
    }

    /**
     * Retire une configuration du deck par id.
     * Si connecté : DELETE /deck/:id puis mise à jour du store ; en cas d'erreur, remonte l'exception (AC 7.4).
     * @param {string} id - UUID de l'entrée deck
     * @throws {Error} si connecté et que le DELETE échoue (réseau, 401, 404, etc.)
     */
    async function removeConfig(id) {
        const auth = useAuthStore();
        if (auth.isAuthenticated) {
            await deleteDeckConfig(id);
        }
        configurations.value = configurations.value.filter((c) => c.id !== id);
    }

    /**
     * URL d'aperçu pour une entrée deck (image coque ou placeholder).
     * @param {object} entry - Entrée deck { configuration: { shellVariantId } }
     * @returns {string} URL image ou chaîne vide pour placeholder
     */
    function getPreviewImageUrl(entry) {
        const variantId = entry?.configuration?.shellVariantId;
        if (!variantId) return '';
        return getShellImageUrl(variantId);
    }

    return {
        configurations,
        canAddMore,
        loadFromCloud,
        addCurrentConfig,
        removeConfig,
        getPreviewImageUrl,
    };
    },
    { persist: { key: 'gameboy-deck' } }
);
