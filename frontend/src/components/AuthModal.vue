<script setup>
/**
 * AuthModal.vue — Modale Login / Register (Story 4.2).
 * Utilisée par SignatureShowcase quand l'utilisateur clique "Confirmer la Création" sans être connecté.
 */
import { ref, computed, watch } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  /** Contrôle l'ouverture de la modale (v-model:open) */
  open: { type: Boolean, default: false },
  /** Classe additionnelle pour le contenu (ex. z-[110] au-dessus du showcase) */
  contentClass: { type: String, default: '' },
});

const emit = defineEmits(['update:open', 'success']);

const authStore = useAuthStore();
const tab = ref('login'); // 'login' | 'register'
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const errorMessage = ref('');
const loading = ref(false);

const isOpenProxy = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

watch(() => props.open, (open) => {
  if (open) {
    tab.value = 'login';
    email.value = '';
    password.value = '';
    passwordConfirm.value = '';
    errorMessage.value = '';
  }
});

async function submitLogin() {
  errorMessage.value = '';
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Email et mot de passe requis.';
    return;
  }
  loading.value = true;
  try {
    await authStore.login(email.value.trim(), password.value);
    emit('success');
    isOpenProxy.value = false;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error;
    if (status === 401) {
      errorMessage.value = msg || 'Email ou mot de passe incorrect.';
    } else {
      errorMessage.value = msg || 'Erreur de connexion.';
    }
  } finally {
    loading.value = false;
  }
}

async function submitRegister() {
  errorMessage.value = '';
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Email et mot de passe requis.';
    return;
  }
  if (password.value.length < 8) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 8 caractères.';
    return;
  }
  loading.value = true;
  try {
    await authStore.register(email.value.trim(), password.value);
    emit('success');
    isOpenProxy.value = false;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error;
    if (status === 400 && (msg || '').toLowerCase().includes('déjà')) {
      errorMessage.value = msg || 'Cet email est déjà utilisé.';
    } else {
      errorMessage.value = msg || 'Erreur lors de l\'inscription.';
    }
  } finally {
    loading.value = false;
  }
}

function switchToLogin() {
  tab.value = 'login';
  errorMessage.value = '';
}
function switchToRegister() {
  tab.value = 'register';
  errorMessage.value = '';
}
</script>

<template>
  <Dialog v-model:open="isOpenProxy">
    <DialogContent
      :class="[
        'sm:max-w-[400px] p-0 border-2 border-neo-orange/30 bg-black/90 backdrop-blur-xl text-white overflow-hidden shadow-neo-hard-orange',
        contentClass
      ]"
      data-testid="auth-modal"
    >
      <DialogClose
        class="absolute right-4 top-4 z-50 rounded-full bg-black/40 p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neo-orange text-white hover:bg-white/20"
        aria-label="Fermer"
      >
        <X class="h-4 w-4" />
      </DialogClose>

      <div class="p-6 pt-10">
        <DialogHeader>
          <DialogTitle class="font-title text-lg uppercase tracking-widest text-neo-orange mb-1">
            Connexion
          </DialogTitle>
          <DialogDescription class="text-xs text-white/80 font-body uppercase tracking-wider">
            Connectez-vous ou créez un compte pour confirmer votre création.
          </DialogDescription>
        </DialogHeader>

        <!-- Tabs Login / Register -->
        <div class="flex gap-2 mt-4 mb-4 border-b border-white/20">
          <button
            type="button"
            :class="[
              'px-3 py-2 text-[10px] font-retro uppercase tracking-widest transition-colors',
              tab === 'login'
                ? 'text-neo-orange border-b-2 border-neo-orange -mb-px'
                : 'text-white/60 hover:text-white'
            ]"
            @click="switchToLogin"
            data-testid="auth-tab-login"
          >
            Se connecter
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-2 text-[10px] font-retro uppercase tracking-widest transition-colors',
              tab === 'register'
                ? 'text-neo-orange border-b-2 border-neo-orange -mb-px'
                : 'text-white/60 hover:text-white'
            ]"
            @click="switchToRegister"
            data-testid="auth-tab-register"
          >
            Créer un compte
          </button>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="tab === 'login' ? submitLogin() : submitRegister()"
        >
          <div>
            <label for="auth-email" class="block text-[10px] font-retro text-white/70 uppercase tracking-wider mb-1">Email</label>
            <input
              id="auth-email"
              v-model="email"
              type="email"
              autocomplete="email"
              class="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-neo-orange focus:border-transparent"
              placeholder="vous@exemple.com"
              data-testid="auth-email"
            />
          </div>
          <div>
            <label for="auth-password" class="block text-[10px] font-retro text-white/70 uppercase tracking-wider mb-1">Mot de passe</label>
            <input
              id="auth-password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-neo-orange focus:border-transparent"
              placeholder="••••••••"
              data-testid="auth-password"
            />
          </div>
          <p v-if="tab === 'register'" class="text-[10px] text-white/50">
            Minimum 8 caractères.
          </p>

          <p v-if="errorMessage" class="text-sm text-red-400" data-testid="auth-error">
            {{ errorMessage }}
          </p>

          <DialogFooter class="flex gap-2 pt-2 border-t border-white/20 mt-4">
            <Button
              v-if="tab === 'login'"
              type="submit"
              :disabled="loading"
              class="flex-1 bg-neo-orange/80 text-black font-title text-[10px] tracking-widest hover:bg-neo-orange"
              data-testid="auth-submit-login"
            >
              {{ loading ? 'Connexion…' : 'Se connecter' }}
            </Button>
            <Button
              v-else
              type="submit"
              :disabled="loading"
              class="flex-1 bg-neo-orange/80 text-black font-title text-[10px] tracking-widest hover:bg-neo-orange"
              data-testid="auth-submit-register"
            >
              {{ loading ? 'Création…' : 'Créer un compte' }}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
