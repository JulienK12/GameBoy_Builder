import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000';

/** Options axios pour envoyer les cookies (JWT) — Story 3.3 */
const withCredentials = { withCredentials: true };

/**
 * Format relative image URLs
 * Images are served by Vite from public/ folder, so /images/... paths work directly
 * @param {string} url - The URL to format
 * @returns {string} The formatted URL
 */
export function formatImageUrl(url) {
    if (!url) return '';
    // URLs are already correct (/images/...) for Vite's public folder
    return url;
}

/**
 * Calculate quote from backend
 * @param {Object} config - Configuration object
 * @param {string} config.shellVariantId - Shell variant ID
 * @param {string|null} config.screenVariantId - Screen variant ID (null for OEM)
 * @param {string|null} config.lensVariantId - Lens variant ID (null if laminated)
 * @param {string|null} [config.packId] - Pack ID (optional)
 * @param {Object|null} [config.overrides] - Pack overrides (optional)
 * @param {Object|null} [config.expertOptions] - Expert options { cpu, audio, power } (optional)
 * @returns {Promise<Object>} Quote response
 */
export async function calculateQuote(config) {
    const payload = {
        shell_variant_id: config.shellVariantId,
        screen_variant_id: config.screenVariantId || null,
        lens_variant_id: config.lensVariantId || null,
        pack_id: config.packId || null,
        overrides: config.overrides || null,
    };
    
    // Ajouter expert_options si fourni (même si toutes les valeurs sont null, envoyer l'objet pour cohérence)
    if (config.expertOptions !== undefined && config.expertOptions !== null) {
        payload.expert_options = {
            cpu: config.expertOptions.cpu || null,
            audio: config.expertOptions.audio || null,
            power: config.expertOptions.power || null,
        };
    }
    
    const response = await axios.post(`${API_URL}/quote`, payload);
    
    // Si erreur backend (400 Bad Request), throw pour que le catch dans le store gère le rollback
    if (!response.data.success && response.data.error) {
        const error = new Error(response.data.error);
        error.response = { data: response.data };
        throw error;
    }
    
    // API returns { success: true, quote: { ... }, error: null }
    // We need to return just the quote object
    return response.data.quote;
}

/**
 * Get shell image URL
 * @param {string} variantId - Shell variant ID
 * @returns {string} Image URL
 */
export function getShellImageUrl(variantId) {
    return `${API_URL}/assets/images/shells/${variantId}.jpg`;
}

/**
 * Get screen image URL
 * @param {string} variantId - Screen variant ID
 * @returns {string} Image URL
 */
export function getScreenImageUrl(variantId) {
    return `${API_URL}/assets/images/screens/${variantId}.jpg`;
}

/**
 * Get lens image URL
 * @param {string} variantId - Lens variant ID
 * @returns {string} Image URL
 */
export function getLensImageUrl(variantId) {
    return `${API_URL}/assets/images/lenses/${variantId}.jpg`;
}

/**
 * Fetch all shells with their variants
 * @returns {Promise<Object>} Shells catalog
 */
export async function fetchShells() {
    const response = await axios.get(`${API_URL}/catalog/shells`);
    return response.data;
}

/**
 * Fetch all screens with their variants
 * @returns {Promise<Object>} Screens catalog
 */
export async function fetchScreens() {
    const response = await axios.get(`${API_URL}/catalog/screens`);
    return response.data;
}

/**
 * Fetch all lenses with their variants
 * @returns {Promise<Object>} Lenses catalog
 */
export async function fetchLenses() {
    const response = await axios.get(`${API_URL}/catalog/lenses`);
    return response.data;
}

/**
 * Fetch all pre-configured packs
 * @returns {Promise<Object>} Packs catalog
 */
export async function fetchPacks() {
    const response = await axios.get(`${API_URL}/catalog/packs`);
    return response.data;
}

/**
 * Fetch expert mods grouped by category (CPU, Audio, Power)
 * @returns {Promise<Object>} { mods: { cpu: [], audio: [], power: [] } }
 */
export async function fetchExpertMods() {
    const response = await axios.get(`${API_URL}/catalog/expert-mods`);
    return response.data;
}

/**
 * GET /auth/me — Vérifie si l'utilisateur est connecté (cookie JWT).
 * @returns {Promise<{ user: { id: string, email: string } }>} ou throw si 401
 */
export async function getAuthMe() {
    const response = await axios.get(`${API_URL}/auth/me`, withCredentials);
    return response.data;
}

/**
 * GET /deck — Liste les configurations de l'utilisateur (Story 3.3).
 * @returns {Promise<{ configurations: Array<{ id, name, configuration, total_price, created_at, updated_at }> }>}
 */
export async function fetchDeck() {
    const response = await axios.get(`${API_URL}/deck`, withCredentials);
    return response.data;
}

/**
 * POST /deck — Crée une configuration.
 * @param {Object} body - { name: string, configuration: object }
 * @returns {Promise<{ configuration: object }>}
 */
export async function createDeckConfig(body) {
    const response = await axios.post(`${API_URL}/deck`, body, withCredentials);
    return response.data;
}

/**
 * DELETE /deck/:id — Supprime une configuration.
 * @param {string} id - UUID de la configuration
 */
export async function deleteDeckConfig(id) {
    await axios.delete(`${API_URL}/deck/${id}`, withCredentials);
}

/**
 * PUT /deck/:id — Renomme une configuration.
 * @param {string} id - UUID de la configuration
 * @param {Object} body - { name: string }
 * @returns {Promise<{ configuration: object }>}
 */
export async function updateDeckConfig(id, body) {
    const response = await axios.put(`${API_URL}/deck/${id}`, body, withCredentials);
    return response.data;
}

export default {
    calculateQuote,
    getShellImageUrl,
    getScreenImageUrl,
    getLensImageUrl,
    fetchShells,
    fetchScreens,
    fetchLenses,
    fetchPacks,
    fetchExpertMods,
    getAuthMe,
    fetchDeck,
    createDeckConfig,
    deleteDeckConfig,
    updateDeckConfig,
};
