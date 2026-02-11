<script setup>
import { ref, onMounted } from 'vue';
import { useDeckStore } from '@/stores/deck';
import { useConfiguratorStore } from '@/stores/configurator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const deck = useDeckStore();
const configurator = useConfiguratorStore();
const optionalName = ref('');
const deckError = ref('');
const addLoading = ref(false);

const emit = defineEmits(['close']);

onMounted(() => {
  deck.loadFromCloud();
});

function formatPrice(value) {
  if (value == null || value === undefined) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${num.toFixed(2)} €`;
}

async function addToDeck() {
  if (!deck.canAddMore) return;
  deckError.value = '';
  addLoading.value = true;
  const name = optionalName.value?.trim() || undefined;
  try {
    await deck.addCurrentConfig(name);
    optionalName.value = '';
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error || err.message;
    if (status === 401) {
      deckError.value = 'Session expirée. Reconnectez-vous pour sauvegarder dans le cloud.';
      configurator.showLandingPortal = true;
      emit('close');
    } else if (status === 409 || status === 400) {
      deckError.value = msg || 'Limite de 3 configurations atteinte.';
    } else {
      deckError.value = msg || 'Erreur lors de l\'ajout.';
    }
  } finally {
    addLoading.value = false;
  }
}

async function removeFromDeck(id) {
  deckError.value = '';
  try {
    await deck.removeConfig(id);
    delete imageError.value[id];
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error || err.message;
    if (status === 401) {
      deckError.value = 'Session expirée. Reconnectez-vous.';
      configurator.showLandingPortal = true;
      emit('close');
    } else {
      deckError.value = msg || 'Erreur lors de la suppression.';
    }
  }
}

function previewUrl(entry) {
  return deck.getPreviewImageUrl(entry) || '';
}

/** Fallback si l'image ne charge pas (catalogue pas encore dispo ou variante invalide après restauration). */
const imageError = ref({});
function onPreviewImageError(entryId) {
  imageError.value[entryId] = true;
}
function showPlaceholder(entry) {
  return !previewUrl(entry) || imageError.value[entry?.id];
}
</script>

<template>
  <div class="flex flex-col h-full bg-grey-ultra-dark/95 backdrop-blur-xl">
    <!-- Header -->
    <div class="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
      <h2 class="font-title text-neo-purple text-sm tracking-widest uppercase">
        Mon Deck
      </h2>
      <button
        type="button"
        class="p-2 rounded-lg border border-white/20 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
        aria-label="Fermer"
        @click="emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Add current config (Task 5: optional name) -->
    <div class="p-4 border-b border-white/10 space-y-2 shrink-0">
      <label class="block text-[10px] font-retro text-white/70 uppercase tracking-wider">
        Nom (optionnel)
      </label>
      <input
        v-model="optionalName"
        type="text"
        placeholder="ex. Projet A, Comparatif 1…"
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:border-neo-orange/50"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="w-full py-2.5 rounded-lg font-retro text-[10px] tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed border"
              :class="deck.canAddMore
                ? 'bg-neo-orange text-black border-neo-orange hover:shadow-neo-glow-orange'
                : 'bg-white/10 text-white/50 border-white/20 cursor-not-allowed'"
              :disabled="!deck.canAddMore || addLoading"
              @click="addToDeck"
            >
              {{ addLoading ? 'Enregistrement…' : 'Sauvegarder dans le Deck' }}
            </button>
          </TooltipTrigger>
          <TooltipContent
            v-if="!deck.canAddMore"
            class="bg-black/90 border border-neo-orange/50 text-white text-xs font-retro p-2 max-w-xs"
          >
            Limite de 3 configurations atteinte. Supprimez une carte pour en ajouter une nouvelle.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <!-- Message toujours visible quand limite atteinte (AC #2, accessible sans hover) -->
      <p
        v-if="!deck.canAddMore"
        class="text-[10px] text-neo-orange/90 font-retro mt-1"
        role="status"
      >
        Limite de 3 configurations atteinte. Supprimez une carte pour en ajouter une nouvelle.
      </p>
      <p
        v-if="deckError"
        class="text-[10px] text-red-400 font-retro mt-1"
        role="alert"
      >
        {{ deckError }}
      </p>
    </div>

    <!-- Cards grid (AC #1: image, name, total price) -->
    <div class="flex-1 overflow-y-auto p-4">
      <div
        v-if="deck.configurations.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center text-white/50"
      >
        <p class="font-retro text-[10px] uppercase tracking-wider mb-2">Aucune configuration</p>
        <p class="text-xs">Configurez votre build puis cliquez sur « Sauvegarder dans le Deck ».</p>
      </div>

      <div
        v-else
        class="grid gap-4"
        style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));"
      >
        <div
          v-for="entry in deck.configurations"
          :key="entry.id"
          class="group relative glass-premium rounded-xl overflow-hidden border border-white/20 hover:border-neo-purple/40 transition-all duration-300 flex flex-col"
        >
          <!-- Preview image (Task 3.1–3.2: shell image or placeholder; fallback si erreur chargement après restauration) -->
          <div class="aspect-[4/5] bg-grey-dark/50 flex items-center justify-center overflow-hidden">
            <img
              v-if="previewUrl(entry) && !showPlaceholder(entry)"
              :src="previewUrl(entry)"
              :alt="entry.name"
              class="w-full h-full object-contain"
              @error="onPreviewImageError(entry.id)"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-white/20 bg-grey-dark"
              aria-hidden="true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Name & price -->
          <div class="p-3 bg-black/30 border-t border-white/10">
            <p class="font-title text-white text-xs uppercase truncate mb-1" :title="entry.name">
              {{ entry.name }}
            </p>
            <p class="text-neo-orange font-retro text-[10px] tracking-wider">
              {{ formatPrice(entry.totalPrice) }}
            </p>
          </div>

          <!-- Supprimer (AC #3) — visible au hover sur desktop, toujours visible sur mobile/touch -->
          <button
            type="button"
            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-red-500/80 text-white flex items-center justify-center transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
            aria-label="Supprimer cette configuration"
            @click="removeFromDeck(entry.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
