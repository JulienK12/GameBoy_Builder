/**
 * Store Pinia "auth" — état d'authentification (Story 3.3, 4.2).
 * Utilisé par le store deck et par SignatureShowcase (Confirmer la Création).
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAuthMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '@/api/backend';

export const useAuthStore = defineStore('auth', () => {
    /** @type {import('vue').Ref<{ id: string, email: string } | null>} */
    const user = ref(null);

    const isAuthenticated = computed(() => user.value !== null);

    /**
     * Vérifie la session (GET /auth/me). Met à jour user ou null.
     * À appeler au chargement de l'app ou à l'ouverture du Deck Manager.
     */
    async function fetchUser() {
        try {
            const data = await getAuthMe();
            user.value = data.user ? { id: data.user.id, email: data.user.email } : null;
            return true;
        } catch {
            user.value = null;
            return false;
        }
    }

    /**
     * Connexion (POST /auth/login). Met à jour user depuis la réponse.
     * @param {string} email
     * @param {string} password
     * @throws en cas d'erreur (401, etc.)
     */
    async function login(email, password) {
        const data = await apiLogin(email, password);
        user.value = data.user ? { id: data.user.id, email: data.user.email } : null;
    }

    /**
     * Inscription (POST /auth/register). Met à jour user depuis la réponse.
     * @param {string} email
     * @param {string} password
     * @throws en cas d'erreur (400 email déjà pris, etc.)
     */
    async function register(email, password) {
        const data = await apiRegister(email, password);
        user.value = data.user ? { id: data.user.id, email: data.user.email } : null;
    }

    /**
     * Déconnexion : appelle POST /auth/logout puis efface l'état local.
     */
    async function logout() {
        try {
            await apiLogout();
        } finally {
            user.value = null;
        }
    }

    return {
        user,
        isAuthenticated,
        fetchUser,
        login,
        register,
        logout,
    };
});
