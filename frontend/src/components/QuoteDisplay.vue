<script setup>
import { computed, ref, watch } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';

const store = useConfiguratorStore();

const formattedTotal = computed(() => {
  return store.totalPrice.toFixed(2);
});

// Tooltip Logic
const hoveredItem = ref(null);
const lockedItem = ref(null);

const activeTooltipItem = computed(() => lockedItem.value || hoveredItem.value);

// Reset locked item when quote changes (user selected new variant)
watch(() => store.quote, () => {
  lockedItem.value = null;
});

function onHover(event, item) {
  hoveredItem.value = item;
}

function onLeave() {
  hoveredItem.value = null;
}

function onClick(event, item) {
  if (lockedItem.value === item) {
    lockedItem.value = null;
  } else {
    lockedItem.value = item;
  }
}

// Find the full variant object to get imageUrl
function findVariantDetails(item) {
  const label = (item.label || '').toLowerCase();
  const detail = item.detail || '';
  
  if (!detail) return null;

  // 1. Precise Match: Check against currently selected items first
  // This handles ambiguous names like "Black" correctly if we check the category from label
  const currentShell = store.shellVariants.find(v => v.id === store.selectedShellVariantId);
  const currentScreen = store.screenVariants.find(v => v.id === store.selectedScreenVariantId);
  const currentLens = store.lensVariants.find(v => v.id === store.selectedLensVariantId);

  // Heuristics to guess category from label
  const isScreen = label.includes('screen') || label.includes('écran') || label.includes('retro pixel') || label.includes('ips') || label.includes('q5') || label.includes('hispeedido') || label.includes('lcd');
  const isLens = label.includes('lens') || label.includes('vitre') || label.includes('protection');
  const isInstallation = label.includes('installation') || label.includes('montage') || label.includes('assemblage');

  if (isInstallation) return null; // No image for service

  // Check specific categories based on hint
  if (isScreen && currentScreen && currentScreen.name === detail) return currentScreen;
  if (isLens && currentLens && currentLens.name === detail) return currentLens;
  
  // Default to Shell if not strictly identified as others, or if label explicitly mentions shell/coque
  if (currentShell && currentShell.name === detail) return currentShell;

  // 2. Fallback: Search in all variants (if quote is stale or selection changed)
  if (isScreen) {
    return store.screenVariants.find(v => v.name === detail);
  }
  if (isLens) {
    return store.lensVariants.find(v => v.name === detail);
  }
  
  // Try to find in shells
  return store.shellVariants.find(v => v.name === detail);
}

const activeVariantDetails = computed(() => {
  if (!activeTooltipItem.value) return null;
  return findVariantDetails(activeTooltipItem.value);
});

// Use backend items when available, fallback to frontend selection
const displayItems = computed(() => {
  if (store.quote?.items?.length > 0) {
    return store.quote.items;
  }
  // Fallback: map currentSelection to match backend format
  return store.currentSelection.map(item => ({
    label: item.label,
    detail: item.detail,
    price: item.supplement || item.price || 0,
    item_type: 'Part'
  }));
});

const hasBackendQuote = computed(() => store.quote?.items?.length > 0);
</script>

<template>
  <div class="space-y-6 relative h-full flex flex-col">
    <!-- Loading State -->
    <div v-if="store.isLoading" class="flex flex-col items-center justify-center py-8">
      <div class="w-8 h-8 border-4 border-neo-purple border-t-black animate-spin mb-4"></div>
      <span class="font-retro text-[10px] text-white/50">CALCULATING...</span>
    </div>
    
    <!-- Quote List (Backend OR Frontend fallback) -->
    <div v-else-if="displayItems.length > 0" class="space-y-4 flex-1 overflow-auto custom-scrollbar">
      <div 
        v-for="(item, index) in displayItems" 
        :key="index"
        class="group cursor-help transition-all p-2 -mx-2 rounded-lg border border-transparent hover:border-neo-purple/30 hover:bg-white/5"
        :class="lockedItem === item ? '!border-neo-purple/60 bg-neo-purple/10' : ''"
        @mouseenter="onHover($event, item)"
        @mouseleave="onLeave"
        @click="onClick($event, item)"
      >
        <div class="flex justify-between items-start gap-2 py-1">
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-title text-white group-hover:text-neo-orange transition-colors truncate uppercase"
               :class="lockedItem === item ? 'text-neo-orange' : ''"
            >
              {{ item.label }}
            </p>
            <p v-if="item.detail" class="text-[9px] text-white/60 truncate">{{ item.detail }}</p>
          </div>
          <span class="text-[10px] font-title text-neo-purple font-bold shrink-0">
            {{ item.price > 0 ? item.price.toFixed(2) + '€' : 'INCLUS' }}
          </span>
        </div>
        <div class="h-[1px] bg-white/20 w-full mt-1 group-hover:bg-neo-orange/50"></div>
      </div>
      
      <!-- Total (Cyber-Luxury Style) -->
      <div v-if="hasBackendQuote" class="mt-8 pt-4 border-t border-white/20">
        <div class="flex justify-between items-center bg-neo-purple/10 p-4 rounded-lg border border-neo-purple/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]">
          <div class="flex justify-between items-center w-full">
            <span class="font-retro text-[12px] text-white">TOTAL</span>
            <span class="font-title text-xl text-neo-orange tracking-widest">{{ store.quote.total_price.toFixed(2) }}€</span>
          </div>
        </div>
      </div>


      <!-- Minimal Tooltip (Glassmorphic Preview) -->
      <div v-if="activeTooltipItem && activeTooltipItem.item_type === 'Part' && activeVariantDetails?.imageUrl" class="mt-6 animate-fade-in-up relative z-50">
        <div class="glass-premium rounded-xl overflow-hidden border border-white/20 shadow-2xl">
          <img :src="activeVariantDetails.imageUrl" class="h-48 w-full object-contain p-4 brightness-110 contrast-110" />
        </div>
      </div>

    </div>
    
    <!-- Pending Selection or Empty -->
    <div v-else-if="!store.isLoading && !store.hasError" class="text-center py-12 border-2 border-dashed border-white/20">
      <p class="font-retro text-[9px] text-white/50">PENDING_INITIAL_SELECTION</p>
    </div>

    <!-- Error State (Below List) -->
    <div v-if="store.hasError" class="mt-auto bg-red-900/50 border-2 border-red-500/50 p-3 shadow-[4px_4px_0px_black] animate-pulse">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xl">🚫</span>
        <span class="text-red-500 font-title text-[10px] uppercase">CONFIGURATION_ERROR</span>
      </div>
      <p class="text-white/80 text-[10px] font-bold uppercase">{{ store.error }}</p>
    </div>

    <!-- Warnings (Bottom fixed style) -->
    <div v-if="store.quote?.warnings?.length && !store.isLoading" class="mt-auto flex flex-col gap-2 transition-all duration-300">
      <div 
        v-for="warning in store.quote.warnings" 
        :key="warning"
        class="bg-yellow-900/40 border-2 border-yellow-500/50 p-3 shadow-[4px_4px_0px_black] animate-pulse"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">⚠️</span>
          <span class="text-yellow-500 font-title text-[10px] uppercase">ATTENTION</span>
        </div>
        <p class="text-white/80 text-[9px] font-bold uppercase">{{ warning }}</p>
      </div>
    </div>

  </div>
</template>
