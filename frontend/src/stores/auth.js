/**
 * Store Pinia "auth" — état d'authentification (Story 3.3).
 * Utilisé par le store deck pour savoir si on sync avec le backend ou localStorage.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAuthMe } from '@/api/backend';

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
     * Déconnexion : efface l'état local. Optionnellement appeler POST /auth/logout pour supprimer le cookie.
     */
    function logout() {
        user.value = null;
    }

    return {
        user,
        isAuthenticated,
        fetchUser,
        logout,
    };
});
