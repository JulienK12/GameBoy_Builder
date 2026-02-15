<script setup>
/**
 * SignatureShowcase.vue — Story 4.1 + 4.2
 * Mode "Signature" plein écran : révélation visuelle de la configuration finale.
 * Confirmer la Création : auth check → modale si non connecté → POST /quote/submit → récap panier.
 */
import { computed, ref, onMounted, nextTick } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';
import { useAuthStore } from '@/stores/auth';
import { submitQuote } from '@/api/backend';
import ThreeDPreview from '@/components/3D/ThreeDPreview.vue';
import AuthModal from '@/components/AuthModal.vue';

const store = useConfiguratorStore();
const authStore = useAuthStore();
const retourBtnRef = ref(null);
const showAuthModal = ref(false);
const submitError = ref('');
const submitLoading = ref(false);

// Numéro de série : format RB-XXXX (4 caractères, timestamp + aléatoire pour éviter collision même ms)
// Documenté pour cohérence future (Story 4.2 / panier)
const serialNumber = ref('RB-0000');

function generateSerialNumber() {
  const timePart = Date.now().toString(36).toUpperCase().slice(-2);
  const randomPart = Math.random().toString(36).slice(2, 4).toUpperCase();
  const base = (timePart + randomPart).padStart(4, '0').slice(-4);
  return 'RB-' + base;
}

onMounted(() => {
  serialNumber.value = generateSerialNumber();
  nextTick(() => {
    retourBtnRef.value?.focus();
  });
});

const shellLabel = computed(() => {
  const v = store.shellVariants.find(s => s.id === store.selectedShellVariantId);
  return v?.name ?? '—';
});

const screenLabel = computed(() => {
  const v = store.screenVariants.find(s => s.id === store.selectedScreenVariantId);
  return v?.name ?? '—';
});

const lensLabel = computed(() => {
  if (!store.selectedLensVariantId) return '—';
  const v = store.lensVariants.find(l => l.id === store.selectedLensVariantId);
  return v?.name ?? '—';
});

const totalPriceFormatted = computed(() => {
  const total = store.quote?.total_price ?? store.totalPrice ?? 0;
  return total.toFixed(2) + '€';
});

// Pack Resolution (pour afficher le badge dans le récap)
const selectedPack = computed(() => {
  if (!store.selectedPackId) return null;
  return store.packs.find(p => p.id === store.selectedPackId);
});

// Recap items pour affichage visuel dans SignatureShowcase (Story 5.1)
const recapItems = computed(() => {
  const items = [];
  
  // Shell
  const shell = store.currentSelection.find(i => i.category === 'shell');
  if (shell) {
    items.push({
      id: 'shell',
      data: shell,
      label: 'SHELL',
      color: 'text-neo-orange',
      index: '01',
    });
  }

  // Screen
  const screen = store.currentSelection.find(i => i.category === 'screen');
  if (screen) {
    items.push({
      id: 'screen',
      data: screen,
      label: 'SCREEN',
      color: 'text-neon-cyan',
      index: '02',
    });
  }

  // Lens
  const lens = store.currentSelection.find(i => i.category === 'lens');
  if (lens) {
    items.push({
      id: 'lens',
      data: lens,
      label: 'LENS',
      color: 'text-neo-green',
      index: '03',
    });
  }

  return items;
});

// Mods expert issus du devis
const expertModItems = computed(() => {
  const quote = store.quote;
  if (!quote?.items) return [];
  return quote.items.filter((i) => i.item_type === 'ExpertMod');
});

const partsColors = computed(() => ({
  shell_front: store.selectedShellColorHex,
  shell_back: store.selectedShellColorHex,
  lens: '#111111',
  button_a: '#EF4444',
  button_b: '#EF4444',
  button_dpad: '#1F2937',
  buttons_start_select: '#1F2937'
}));

function closeShowcase() {
  store.showSignatureShowcase = false;
  submitError.value = '';
}

/** Construire le payload pour POST /quote/submit (snake_case). */
function buildSubmitPayload() {
  const opts = store.selectedExpertOptions || {};
  return {
    shell_variant_id: store.selectedShellVariantId,
    screen_variant_id: store.selectedScreenVariantId ?? null,
    lens_variant_id: store.selectedLensVariantId ?? null,
    expert_options: {
      cpu: opts.cpu ?? null,
      audio: opts.audio ?? null,
      power: opts.power ?? null,
    },
  };
}

/** Soumettre la config (après auth). En cas de succès : fermer showcase + message récap. */
async function doSubmit() {
  submitError.value = '';
  submitLoading.value = true;
  try {
    await submitQuote(buildSubmitPayload());
    store.showSignatureShowcase = false;
    store.submissionSuccessMessage = 'Commande enregistrée — Ready for Build';
    setTimeout(() => {
      store.submissionSuccessMessage = null;
    }, 5000);
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Erreur réseau. Réessayez ou revenez en arrière.';
    submitError.value = msg;
  } finally {
    submitLoading.value = false;
  }
}

/** Clic "Confirmer la Création" : vérifier auth → modale si besoin, sinon soumettre. */
async function onConfirmCreation() {
  submitError.value = '';
  await authStore.fetchUser();
  if (!authStore.isAuthenticated) {
    showAuthModal.value = true;
    return;
  }
  await doSubmit();
}

/** Après login/register réussi dans la modale : reprendre le flux (soumettre). */
async function onAuthSuccess() {
  showAuthModal.value = false;
  await doSubmit();
}
</script>

<template>
  <div
    class="signature-showcase fixed inset-0 z-[100] bg-grey-ultra-dark flex flex-col overflow-hidden"
    role="dialog"
    aria-modal="true"
    aria-label="Signature Showcase — Votre création"
    @keydown.tab.prevent="retourBtnRef?.focus()"
  >
    <!-- Fond 3D avec éclairage dramatique (réutilisation ThreeDPreview) -->
    <div class="absolute inset-0">
      <ThreeDPreview
        :shell-color="store.selectedShellColorHex"
        :is-transparent="store.selectedShellIsTransparent"
        :variant-id="store.selectedShellVariantId"
        :active-verification-group="null"
        :parts-colors="partsColors"
      />
    </div>

    <!-- Overlay effets légers : glow néon + scan (subtils, NFR2/NFR3) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      <div class="signature-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmax] h-[80vmax] rounded-full bg-neo-orange/5 blur-[80px]" />
      <div class="signature-scan absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,107,53,0.15)_2px,rgba(255,107,53,0.15)_4px)] animate-scan" />
    </div>

    <!-- Bouton Retour / Modifier -->
    <div class="absolute top-6 left-6 z-10 pointer-events-auto">
      <button
        ref="retourBtnRef"
        type="button"
        @click="closeShowcase"
        class="px-4 py-2 glass-premium rounded-full border border-white/20 text-[10px] font-retro tracking-widest text-white/90 hover:text-white hover:border-neo-orange/50 hover:shadow-neo-glow-orange transition-all duration-300"
        aria-label="Retour à l'atelier"
      >
        RETOUR
      </button>
    </div>

    <!-- Récapitulatif visuel des options (Story 5.1) — Centre gauche (desktop) / Centre (mobile) -->
    <div class="absolute left-6 top-1/2 -translate-y-1/2 z-10 pointer-events-auto max-w-[500px] w-full hidden lg:block">
      <div class="glass-premium rounded-xl border-2 border-neo-orange/30 shadow-neo-hard-orange p-6 overflow-y-auto max-h-[80vh]">
        <!-- Pack Badge -->
        <div v-if="selectedPack" class="flex justify-center mb-6">
          <div class="glass-premium border-2 border-neo-orange/70 px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(255,107,53,0.5)]">
            <span class="text-xl">🎁</span>
            <div class="flex flex-col items-start leading-none">
              <span class="text-[8px] font-retro text-neo-orange tracking-[.2em] uppercase font-bold">PACK ACTIVÉ</span>
              <span class="font-title text-white text-sm tracking-wide uppercase">{{ selectedPack.name }}</span>
            </div>
          </div>
        </div>

        <!-- Cartes récap -->
        <div v-if="recapItems.length > 0" class="space-y-4 mb-4">
          <div
            v-for="item in recapItems"
            :key="item.id"
            class="relative glass-premium rounded-lg overflow-hidden border-2 border-white/30 aspect-[4/3]"
          >
            <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-black/80 opacity-60"></div>
            <div class="absolute inset-0 p-4 flex items-center justify-center">
              <img
                :src="item.data.imageUrl"
                class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                :alt="item.data.detail"
              />
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-12">
              <div class="absolute top-2 right-2 text-white/20 font-retro text-2xl">{{ item.index }}</div>
              <h3 class="font-retro text-[9px] tracking-widest mb-1 uppercase" :class="item.color">{{ item.label }}</h3>
              <p class="text-white font-title text-sm uppercase leading-none mb-1 truncate">{{ item.data.detail }}</p>
              <p class="text-white/70 text-[9px] font-retro uppercase tracking-wider">{{ item.data.brand }}</p>
            </div>
          </div>
        </div>

        <!-- Mods expert -->
        <div v-if="expertModItems.length > 0" class="mt-4 pt-4 border-t border-white/10">
          <h3 class="text-[9px] font-retro text-neo-orange uppercase tracking-widest mb-2 font-bold">Mods expert</h3>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="(mod, idx) in expertModItems"
              :key="`expert-${idx}-${mod.label}`"
              class="px-3 py-1.5 rounded border-2 bg-black/30 border-white/30 text-white font-retro text-xs flex items-center gap-2"
            >
              <span class="font-bold">{{ mod.label }}</span>
              <span class="text-neo-orange font-bold">{{ mod.price }}€</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Récapitulatif visuel mobile (Story 5.1) — Au-dessus de la SignatureCard -->
    <div class="absolute left-6 right-6 bottom-[200px] z-10 pointer-events-auto lg:hidden max-h-[50vh] overflow-y-auto">
      <div class="glass-premium rounded-xl border-2 border-neo-orange/30 shadow-neo-hard-orange p-4">
        <!-- Pack Badge -->
        <div v-if="selectedPack" class="flex justify-center mb-4">
          <div class="glass-premium border-2 border-neo-orange/70 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.5)]">
            <span class="text-lg">🎁</span>
            <div class="flex flex-col items-start leading-none">
              <span class="text-[7px] font-retro text-neo-orange tracking-[.15em] uppercase font-bold">PACK ACTIVÉ</span>
              <span class="font-title text-white text-xs tracking-wide uppercase">{{ selectedPack.name }}</span>
            </div>
          </div>
        </div>

        <!-- Cartes récap compactes -->
        <div v-if="recapItems.length > 0" class="space-y-2 mb-3">
          <div
            v-for="item in recapItems"
            :key="item.id"
            class="relative glass-premium rounded-lg overflow-hidden border-2 border-white/30 aspect-[3/2]"
          >
            <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-black/80 opacity-60"></div>
            <div class="absolute inset-0 p-2 flex items-center justify-center">
              <img
                :src="item.data.imageUrl"
                class="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                :alt="item.data.detail"
              />
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent pt-8">
              <div class="absolute top-1 right-1 text-white/20 font-retro text-lg">{{ item.index }}</div>
              <h3 class="font-retro text-[8px] tracking-widest mb-0.5 uppercase" :class="item.color">{{ item.label }}</h3>
              <p class="text-white font-title text-xs uppercase leading-none truncate">{{ item.data.detail }}</p>
            </div>
          </div>
        </div>

        <!-- Mods expert compacts -->
        <div v-if="expertModItems.length > 0" class="mt-3 pt-3 border-t border-white/10">
          <h3 class="text-[8px] font-retro text-neo-orange uppercase tracking-widest mb-1.5 font-bold">Mods expert</h3>
          <ul class="flex flex-wrap gap-1.5">
            <li
              v-for="(mod, idx) in expertModItems"
              :key="`expert-mobile-${idx}-${mod.label}`"
              class="px-2 py-1 rounded border-2 bg-black/30 border-white/30 text-white font-retro text-[10px] flex items-center gap-1.5"
            >
              <span class="font-bold">{{ mod.label }}</span>
              <span class="text-neo-orange font-bold">{{ mod.price }}€</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- SignatureCard : fiche technique Cyberpunk — Bas droite -->
    <div class="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-[380px] z-10 pointer-events-auto">
      <div
        class="signature-card glass-premium rounded-xl border-2 border-neo-orange/30 shadow-neo-hard-orange p-5 md:p-6 notched"
        role="region"
        aria-label="Fiche technique de votre création"
      >
        <div class="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <span class="text-[8px] font-retro text-neo-orange tracking-[0.3em] uppercase">N° Série</span>
          <span class="font-title text-sm text-white tracking-widest" data-testid="signature-serial">{{ serialNumber }}</span>
        </div>
        <ul class="space-y-2 text-[10px] font-retro text-white/80 mb-4">
          <li class="flex justify-between gap-2">
            <span class="text-white/50 uppercase">Coque</span>
            <span class="text-white truncate" data-testid="signature-shell">{{ shellLabel }}</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-white/50 uppercase">Écran</span>
            <span class="text-white truncate" data-testid="signature-screen">{{ screenLabel }}</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-white/50 uppercase">Vitre</span>
            <span class="text-white truncate" data-testid="signature-lens">{{ lensLabel }}</span>
          </li>
        </ul>
        <div class="flex justify-between items-center mb-4 pt-2 border-t border-white/10">
          <span class="text-[10px] font-retro text-white/60 uppercase">Total</span>
          <span class="font-title text-lg text-neo-orange tracking-wider" data-testid="signature-total">{{ totalPriceFormatted }}</span>
        </div>
        <!-- Story 4.2 : auth + submit + récap -->
        <button
          type="button"
          :disabled="submitLoading"
          @click="onConfirmCreation"
          class="w-full py-3 bg-neo-orange/80 text-black font-title text-[10px] tracking-widest rounded-lg border border-neo-orange hover:bg-neo-orange transition-colors disabled:opacity-60 disabled:cursor-wait"
          data-testid="signature-confirm-creation"
        >
          {{ submitLoading ? 'Envoi…' : 'CONFIRMER LA CRÉATION' }}
        </button>
        <p v-if="submitError" class="text-[10px] text-red-400 mt-2 text-center" data-testid="signature-submit-error">
          {{ submitError }}
        </p>
      </div>
    </div>

    <!-- Modale Login/Register (au-dessus du showcase, z-[110]) -->
    <AuthModal
      v-model:open="showAuthModal"
      content-class="!z-[110]"
      @success="onAuthSuccess"
    />
  </div>
</template>

<style scoped>
.notched {
  clip-path: polygon(
    0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px
  );
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
.animate-scan {
  animation: scan 8s linear infinite;
}
</style>
