<script setup>
/**
 * SignatureShowcase.vue — Story 4.1
 * Mode "Signature" plein écran : révélation visuelle de la configuration finale
 * (Photo Statutaire, ambiance Cyberpunk). Logique "Confirmer la Création" = Story 4.2.
 */
import { computed, ref, onMounted, nextTick } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';
import ThreeDPreview from '@/components/3D/ThreeDPreview.vue';

const store = useConfiguratorStore();
const retourBtnRef = ref(null);

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
}

// Story 4.1 : CTA visible, logique métier = Story 4.2 (placeholder)
function onConfirmPlaceholder() {
  // Événement placeholder pour 4.1 ; en 4.2 : auth + POST /quote/submit + redirection panier
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[SignatureShowcase] Confirmer la Création (placeholder — Story 4.2)');
  }
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

    <!-- SignatureCard : fiche technique Cyberpunk -->
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
        <!-- Story 4.1 : bouton visible, sans logique métier complète (Story 4.2) -->
        <button
          type="button"
          @click="onConfirmPlaceholder"
          class="w-full py-3 bg-neo-orange/80 text-black font-title text-[10px] tracking-widest rounded-lg border border-neo-orange opacity-90 cursor-not-allowed"
          disabled
          aria-disabled="true"
          data-testid="signature-confirm-creation"
        >
          CONFIRMER LA CRÉATION
        </button>
        <p class="text-[8px] text-white/40 mt-2 text-center">Disponible prochainement</p>
      </div>
    </div>
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
