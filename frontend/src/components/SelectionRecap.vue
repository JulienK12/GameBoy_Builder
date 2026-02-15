<script setup>
import { computed } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';

const store = useConfiguratorStore();

const hasSelection = computed(() => store.currentSelection.length > 0);

// Pack Resolution
const selectedPack = computed(() => {
  if (!store.selectedPackId) return null;
  return store.packs.find(p => p.id === store.selectedPackId);
});

// Normalized items for the recap list
const recapItems = computed(() => {
  const items = [];
  
  // Shell
  const shell = store.currentSelection.find(i => i.category === 'shell');
  if (shell) {
    items.push({
      id: 'shell', // Stable ID for transition
      data: shell,
      label: 'SHELL',
      color: 'text-neo-orange',
      index: '01',
      aspect: 'aspect-[4/5] lg:aspect-auto', // Tall on mobile/desktop adjustment
      removeAction: () => store.selectShell(shell.id)
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
      aspect: 'aspect-square lg:aspect-auto',
      removeAction: () => store.selectScreen(screen.id)
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
      aspect: 'aspect-square lg:aspect-auto',
      removeAction: () => store.selectLens(lens.id)
    });
  }

  // Buttons
  const buttonSelection = store.currentSelection.find(i => i.category === 'buttons');
  if (buttonSelection) {
    items.push({
      id: 'buttons',
      data: buttonSelection,
      label: 'BOUTONS',
      color: 'text-neo-purple',
      index: '04',
      aspect: 'aspect-square lg:aspect-auto',
      removeAction: () => store.selectButton(buttonSelection.id)
    });
  }

  return items;
});

// Mods expert issus du devis (Story 2.3 - Task 13)
const expertModItems = computed(() => {
  const quote = store.quote;
  if (!quote?.items) return [];
  return quote.items.filter((i) => i.item_type === 'ExpertMod');
});

const hasExpertPending = computed(() => store.isValidating || Object.keys(store.pendingSelections || {}).length > 0);
</script>

<template>
  <div 
    class="w-full h-full flex flex-col items-center justify-start lg:justify-center p-8 lg:p-10 overflow-y-auto lg:overflow-hidden relative transition-all duration-300"
    :class="store.isExpertMode ? 'lg:ml-[920px] xl:mr-[380px]' : 'lg:ml-[480px] xl:mr-[380px]'"
  >
      
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-grey-ultra-dark z-0 pointer-events-none fixed">
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-neo-purple/5 blur-[100px] rounded-full"></div>
          <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neo-orange/5 blur-[100px] rounded-full"></div>
      </div>

      <!-- Content Container -->
      <div v-if="hasSelection" class="relative z-10 w-full max-w-5xl flex flex-col gap-8 pb-20 lg:pb-0">
        
        <!-- Pack Badge (Task 3.1-3.2 - Story 5.1: Enhanced visual hierarchy) -->
        <div v-if="selectedPack" class="flex justify-center animate-fade-in-down mb-4">
          <div class="glass-premium border-2 border-neo-orange/70 px-8 py-3 rounded-full flex items-center gap-4 shadow-[0_0_20px_rgba(255,107,53,0.5)] hover:shadow-[0_0_30px_rgba(255,107,53,0.7)] transition-shadow duration-300">
            <span class="text-2xl">🎁</span>
            <div class="flex flex-col items-start leading-none">
              <span class="text-[9px] font-retro text-neo-orange tracking-[.25em] uppercase font-bold">PACK ACTIVÉ</span>
              <span class="font-title text-white text-base tracking-wide uppercase">{{ selectedPack.name }}</span>
            </div>
          </div>
        </div>

        <!-- Cards List -->
        <div class="w-full lg:h-[70vh] flex justify-center">
          
          <TransitionGroup 
            name="recap-card" 
            tag="ul"
            role="list"
            class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl"
          >
            
            <li 
              v-for="(item, idx) in recapItems" 
              :key="item.id"
              class="flex-1 min-w-0"
              :class="{ 'lg:row-span-2': item.id === 'shell' }"
            >
              <!-- RECAP CARD COMPONENT (Task 3.1-3.3 - Story 5.1: Enhanced visual hierarchy) -->
              <div 
                class="w-full h-full group relative glass-premium rounded-xl overflow-hidden border-2 border-white/30 hover:border-white/60 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,107,53,0.4)] hover:-translate-y-2 block"
                :class="item.aspect"
                :aria-label="`${item.label}: ${item.data.detail} - ${item.data.brand}`"
              >
                  <!-- REMOVE BUTTON -->
                  <button 
                    @click.stop="item.removeAction()" 
                    class="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/40 hover:bg-red-500/80 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                    title="Remove Item"
                    aria-label="Remove Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-black/80 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                  
                  <div class="absolute inset-0 p-8 flex items-center justify-center">
                      <img 
                        :src="item.data.imageUrl" 
                        class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        :alt="item.data.detail"
                      />
                  </div>

                  <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pt-20 flex flex-col justify-end pointer-events-none">
                      <div class="absolute top-4 right-4 text-white/20 font-retro text-4xl group-hover:text-white/30 transition-colors pointer-events-none">{{ item.index }}</div>
                      <h3 class="font-retro text-[10px] tracking-widest mb-1 uppercase" :class="item.color">{{ item.label }}</h3>
                      <p class="text-white font-title text-xl uppercase leading-none mb-1 truncate">{{ item.data.detail }}</p>
                      <div class="flex justify-between items-end">
                          <p class="text-white/70 text-[10px] font-retro uppercase tracking-wider">{{ item.data.brand }}</p>
                          <span class="text-white/90 font-bold font-retro bg-white/20 px-2 py-1 rounded text-[10px]">
                            {{ item.data.supplement > 0 ? `+${item.data.supplement}€` : 'INCLUDED' }}
                          </span>
                      </div>
                  </div>
              </div>
            </li>

          </TransitionGroup>

        </div>

        <!-- Expert Mods (Story 2.3 - AC #1, #2) - Task 3.1-3.3: Enhanced visual hierarchy -->
        <div
          v-if="store.isExpertMode && expertModItems.length > 0"
          class="relative z-10 w-full max-w-4xl mt-6"
        >
          <h3 class="text-[11px] font-retro text-neo-orange uppercase tracking-widest mb-4 font-bold">
            Mods expert
            <span
              v-if="hasExpertPending"
              class="ml-2 inline-flex items-center gap-1 text-white/70 animate-pulse"
            >
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              validation…
            </span>
          </h3>
          <ul class="flex flex-wrap gap-3" role="list">
            <li
              v-for="(mod, idx) in expertModItems"
              :key="`expert-${idx}-${mod.label}`"
              class="px-5 py-3 rounded-lg border-2 bg-black/30 border-white/30 hover:border-neo-orange/50 text-white font-retro text-sm flex items-center gap-3 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,53,0.3)]"
              :class="{ 'border-blue-500/50 bg-blue-500/10 animate-pulse': hasExpertPending }"
            >
              <span class="font-bold">{{ mod.label }}</span>
              <span class="text-neo-orange font-bold text-base">{{ mod.price }}€</span>
            </li>
          </ul>
        </div>

      </div>

      <!-- Empty State (Story 5.1 — hiérarchie visuelle) -->
      <div v-else class="w-full h-full flex flex-col items-center justify-center z-10 text-center opacity-70" data-testid="recap-empty-state">
          <p class="font-title text-2xl text-white mb-2">NO SELECTION</p>
          <p class="font-retro text-xs text-neo-orange">Start by choosing a shell from the menu</p>
      </div>

  </div>
</template>

<style scoped>
/* TransitionGroup Animations */
.recap-card-enter-active,
.recap-card-leave-active,
.recap-card-move {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.recap-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.recap-card-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Ensure leaving elements don't block layout during move */
.recap-card-leave-active {
  position: absolute;
  width: auto;
}
</style>
