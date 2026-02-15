import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

/** Options axios pour envoyer les cookies (JWT) — Story 3.3 */
const withCredentials = { withCredentials: true };

/**
 * Format relative image URLs
 * Images are served by the backend (axum) from the assets/ folder
 * @param {string} url - The URL to format
 * @returns {string} The formatted URL
 */
export function formatImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('/')) {
        return `${API_URL}${url}`;
    }
    return url;
}

/**
 * Calculate quote from backend
 * @param {Object} config - Configuration object
 * @param {string} config.shellVariantId - Shell variant ID
 * @param {string|null} config.screenVariantId - Screen variant ID (null for OEM)
 * @param {string|null} config.lensVariantId - Lens variant ID (null if laminated)
 * @param {string|null} [config.buttonVariantId] - Button variant ID (optional)
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
        button_variant_id: config.buttonVariantId || null,
        pack_id: config.packId || null,
        overrides: config.overrides || null,
        selected_buttons: config.selected_buttons || null, // Story 6.3 - Granular buttons
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
 * @param {string} [extension='jpg'] - File extension
 * @returns {string} Image URL
 */
export function getShellImageUrl(variantId, extension = 'jpg') {
    // Handle known PNG cases (Story 7.1)
    const ext = (variantId?.includes('ATOMIC_PURPLE') || variantId?.includes('KIWI')) ? 'png' : extension;
    return `${API_URL}/assets/images/shells/${variantId}.${ext}`;
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
 * Fetch all buttons with their variants
 * @returns {Promise<Object>} Buttons catalog
 */
/**
 * Fetch buttons, optionally filtered by console ID
 * @param {string} [consoleId] - Optional console ID (e.g. 'GBC')
 * @returns {Promise<Object>} Buttons catalog
 */
export async function fetchButtons(consoleId) {
    const url = consoleId ? `${API_URL}/catalog/buttons/${consoleId}` : `${API_URL}/catalog/buttons`;
    const response = await axios.get(url);
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
 * POST /auth/login — Connexion (Story 4.2).
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: { id: string, email: string } }>} ou throw si 401/400
 */
export async function login(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password }, withCredentials);
    return response.data;
}

/**
 * POST /auth/register — Inscription (Story 4.2).
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: { id: string, email: string } }>} ou throw si 400 (email déjà pris, etc.)
 */
export async function register(email, password) {
    const response = await axios.post(`${API_URL}/auth/register`, { email, password }, withCredentials);
    return response.data;
}

/**
 * POST /auth/logout — Déconnexion (supprime le cookie).
 */
export async function logout() {
    await axios.post(`${API_URL}/auth/logout`, {}, withCredentials);
}

/**
 * POST /quote/submit — Soumettre la configuration en "Ready for Build" (Story 4.2). Auth requise (cookie).
 * @param {Object} config — Même format que calculateQuote (snake_case côté API)
 * @param {string} config.shell_variant_id
 * @param {string|null} config.screen_variant_id
 * @param {string|null} config.lens_variant_id
 * @param {Object|null} [config.expert_options] — { cpu, audio, power }
 * @returns {Promise<{ success: boolean, submission_id?: string }>} ou throw en cas d'erreur
 */
export async function submitQuote(config) {
    const payload = {
        shell_variant_id: config.shell_variant_id,
        screen_variant_id: config.screen_variant_id ?? null,
        lens_variant_id: config.lens_variant_id ?? null,
    };
    if (config.expert_options !== undefined && config.expert_options !== null) {
        payload.expert_options = {
            cpu: config.expert_options.cpu ?? null,
            audio: config.expert_options.audio ?? null,
            power: config.expert_options.power ?? null,
        };
    }
    const response = await axios.post(`${API_URL}/quote/submit`, payload, withCredentials);
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
    login,
    register,
    logout,
    submitQuote,
    fetchDeck,
    createDeckConfig,
    deleteDeckConfig,
    updateDeckConfig,
};
