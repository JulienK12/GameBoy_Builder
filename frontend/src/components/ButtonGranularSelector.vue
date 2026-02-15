<script setup>
import { ref, computed, watch } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';
import { fetchButtons } from '@/api/backend';
import { Check, Loader2 } from 'lucide-vue-next';

const props = defineProps({
  consoleId: {
    type: String,
    required: true
  }
});

const store = useConfiguratorStore();
const isLoading = ref(false);
const error = ref(null);

// Données API (transformées en camelCase)
const buttons = ref([]);
const variants = ref([]);

// UI State
const activeButtonId = ref(null);

/**
 * Transforme un objet variant API (snake_case) en format camelCase interne.
 * Évite le bug colorHex/color_hex entre API et template.
 */
function normaliserVariant(v) {
  return {
    id: v.id,
    buttonId: v.button_id ?? v.buttonId,
    name: v.name,
    colorHex: v.color_hex ?? v.colorHex ?? null,
    imageUrl: v.image_url ?? v.imageUrl ?? null,
    supplement: v.supplement ?? 0,
    isTransparent: v.is_transparent ?? v.isTransparent ?? false,
    isGlowInDark: v.is_glow_in_dark ?? v.isGlowInDark ?? false,
  };
}

/**
 * Transforme un objet button API (snake_case) en format camelCase interne.
 */
function normaliserButton(b) {
  return {
    id: b.id,
    name: b.name,
    handledModel: b.handled_model ?? b.handledModel ?? null,
  };
}

async function loadButtons() {
  if (!props.consoleId) return;

  isLoading.value = true;
  error.value = null;
  try {
    const data = await fetchButtons(props.consoleId);
    buttons.value = (data.buttons || []).map(normaliserButton);
    variants.value = (data.variants || []).map(normaliserVariant);

    // Sélectionner le 1er bouton par défaut si disponible
    if (buttons.value.length > 0 && !activeButtonId.value) {
      activeButtonId.value = buttons.value[0].id;
    }
  } catch (err) {
    console.error('Failed to load buttons:', err);
    error.value = "Impossible de charger les boutons.";
  } finally {
    isLoading.value = false;
  }
}

// Recharger quand le consoleId change
watch(() => props.consoleId, () => {
    loadButtons();
}, { immediate: true });

// Variantes filtrées pour le bouton actuellement sélectionné
const activeVariants = computed(() => {
    if (!activeButtonId.value) return [];
    return variants.value.filter(v => v.buttonId === activeButtonId.value);
});

// Helper : récupérer la variante sélectionnée pour un bouton
function getSelectedVariant(buttonId) {
    const variantId = store.selectedButtons[buttonId];
    if (!variantId) return null;
    return variants.value.find(v => v.id === variantId);
}

function selectVariant(variant) {
    if (activeButtonId.value) {
        store.updateButtonSelection(activeButtonId.value, variant.id);
    }
}

function clearSelection(buttonId) {
    store.updateButtonSelection(buttonId, null);
}

/**
 * Détecte si une variante est custom/premium via son supplément.
 * Plus fiable que de vérifier si l'ID contient "OEM".
 */
function isPremium(variant) {
    return (variant.supplement ?? 0) > 0;
}

// Nombre de kits custom sélectionnés (pour l'affichage prix)
const customKitCount = computed(() => {
    const uniqueColors = new Set();
    for (const [, variantId] of Object.entries(store.selectedButtons)) {
        const variant = variants.value.find(v => v.id === variantId);
        if (variant && isPremium(variant)) {
            uniqueColors.add(variantId);
        }
    }
    return uniqueColors.size;
});

const kitSupplement = computed(() => customKitCount.value * 5);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-[10px] font-retro text-neo-orange uppercase tracking-widest">
        Personnalisation Boutons
      </h3>
      <div v-if="isLoading" class="animate-spin text-neo-orange">
        <Loader2 class="w-4 h-4" />
      </div>
    </div>

    <div v-if="error" class="text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/20">
      {{ error }}
    </div>

    <div v-else class="space-y-6">
      <!-- 1. Grille des emplacements de boutons -->
      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="btn in buttons"
          :key="btn.id"
          @click="activeButtonId = btn.id"
          class="relative group p-4 rounded-xl border transition-all duration-300 text-left overflow-hidden"
          :class="[
            activeButtonId === btn.id
              ? 'bg-neo-orange/10 border-neo-orange/50 shadow-neo-glow-orange'
              : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/60'
          ]"
          :data-button-id="btn.id"
        >
          <!-- Indicateur couleur sélectionnée -->
          <div class="absolute top-2 right-2 flex gap-1">
             <div v-if="getSelectedVariant(btn.id)"
                  class="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/10"
                  :style="{ backgroundColor: getSelectedVariant(btn.id)?.colorHex || '#ccc' }"
             ></div>
          </div>

          <div class="relative z-10">
            <span class="text-xs text-gray-400 block mb-1">Emplacement</span>
            <span class="text-sm font-bold text-gray-100 group-hover:text-white transition-colors button-name">
              {{ btn.name }}
            </span>
            <div class="mt-1 text-xs text-neo-orange" v-if="getSelectedVariant(btn.id)">
               {{ getSelectedVariant(btn.id).name }}
            </div>
            <div class="mt-1 text-xs text-gray-500 italic" v-else>
               Standard (OEM)
            </div>
          </div>

          <!-- Background Glow (design system neo-orange) -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style="background: radial-gradient(circle at center, rgba(255,107,53,0.1) 0%, transparent 70%);"
          ></div>
        </button>
      </div>

      <!-- 2. Sélecteur de variantes pour le bouton actif -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 transform translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="activeButtonId" class="glass-premium p-4 rounded-xl">
           <div class="flex justify-between items-center mb-3">
             <span class="text-xs font-medium text-gray-400 variant-panel-label">
               Couleurs pour <strong class="text-white">{{ buttons.find(b => b.id === activeButtonId)?.name }}</strong>
             </span>
             <button @click="clearSelection(activeButtonId)" class="text-xs text-red-400 hover:text-red-300 underline">
               Réinitialiser
             </button>
           </div>

           <!-- TransitionGroup pour l'apparition des variantes (AC #5) -->
           <TransitionGroup
             tag="div"
             class="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1 variant-grid"
             enter-active-class="transition-all duration-300 ease-out"
             enter-from-class="opacity-0 scale-90"
             enter-to-class="opacity-100 scale-100"
             leave-active-class="transition-all duration-200 ease-in"
             leave-from-class="opacity-100 scale-100"
             leave-to-class="opacity-0 scale-90"
           >
             <button
                v-for="variant in activeVariants"
                :key="variant.id"
                @click="selectVariant(variant)"
                class="group relative aspect-square rounded-lg border border-gray-700/50 hover:border-neo-orange/50 transition-all duration-200 flex items-center justify-center overflow-hidden variant-button"
                :class="{
                    'ring-2 ring-neo-orange ring-offset-2 ring-offset-gray-900': store.selectedButtons[activeButtonId] === variant.id,
                }"
                :data-variant-id="variant.id"
             >
                <!-- Aperçu Couleur -->
                <div class="w-full h-full transform transition-transform group-hover:scale-110"
                     :style="{ backgroundColor: variant.colorHex || '#808080' }"
                >
                   <img v-if="variant.imageUrl" :src="variant.imageUrl" class="w-full h-full object-cover opacity-80" alt="" />
                </div>

                <!-- Badge Premium (Kit Custom) -->
                <div v-if="isPremium(variant)"
                     class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neo-orange shadow-neo-glow-orange"
                     title="+5€ (Kit Custom)"
                ></div>

                <!-- Checkmark sélection -->
                <div v-if="store.selectedButtons[activeButtonId] === variant.id"
                     class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
                >
                    <Check class="w-5 h-5 text-white drop-shadow-md" />
                </div>

                <!-- Tooltip au hover -->
                 <div class="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md text-[10px] text-white text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                    {{ variant.name }}
                 </div>
             </button>
           </TransitionGroup>
        </div>
      </Transition>

      <!-- 3. Badge feedback prix (AC #4 — Task 3.1) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="kitSupplement > 0"
             class="flex items-center justify-between px-4 py-3 rounded-lg border border-neo-orange/30 bg-neo-orange/5 price-badge"
        >
          <span class="text-xs text-gray-300">
            Kit(s) de boutons custom
            <span class="text-white font-semibold">({{ customKitCount }})</span>
          </span>
          <span class="text-sm font-bold text-neo-orange">
            +{{ kitSupplement }}€
          </span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
