import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000';

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
 * @returns {Promise<Object>} Quote response
 */
export async function calculateQuote(config) {
    const response = await axios.post(`${API_URL}/quote`, {
        shell_variant_id: config.shellVariantId,
        screen_variant_id: config.screenVariantId || null,
        lens_variant_id: config.lensVariantId || null,
    });
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

export default {
    calculateQuote,
    getShellImageUrl,
    getScreenImageUrl,
    getLensImageUrl,
    fetchShells,
    fetchScreens,
    fetchLenses,
};
