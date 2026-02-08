<script setup>
import { computed } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';

const store = useConfiguratorStore();

const hasSelection = computed(() => store.currentSelection.length > 0);

const shell = computed(() => store.currentSelection.find(i => i.category === 'shell'));
const screen = computed(() => store.currentSelection.find(i => i.category === 'screen'));
const lens = computed(() => store.currentSelection.find(i => i.category === 'lens'));

// Helper to get image or placeholder
function getImage(item) {
  if (item.category === 'shell') {
     return item.imageUrl;
  }
  return item.imageUrl;
}

function getCardStyle(category) {
    if (category === 'shell') {
        return 'w-[340px] aspect-[1/2]'; // Tall card for shell
    }
    return 'w-[340px] aspect-square'; // Square for components
}
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-start lg:justify-center p-6 lg:p-10 overflow-y-auto lg:overflow-hidden relative lg:pl-[500px] lg:pr-[400px]">
      
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-grey-ultra-dark z-0 pointer-events-none fixed">
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-neo-purple/5 blur-[100px] rounded-full"></div>
          <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neo-orange/5 blur-[100px] rounded-full"></div>
      </div>

      <div v-if="hasSelection" class="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full lg:h-[70vh] max-w-5xl items-stretch justify-center z-10 pb-20 lg:pb-0">
        
        <!-- LEFT COLUMN: SHELL (Tall on Desktop, Square-ish on Mobile) -->
        <div 
          v-if="shell"
          class="flex-none lg:flex-1 w-full aspect-[4/5] lg:aspect-auto group relative glass-premium rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
        >
            <!-- REMOVE BUTTON -->
            <button 
              @click.stop="store.selectShell(shell.id)" 
              class="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/40 hover:bg-red-500/80 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
              title="Remove Item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-black/80 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            <div class="absolute inset-0 p-8 flex items-center justify-center">
                 <img 
                    :src="shell.imageUrl" 
                    class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-700 ease-out"
                 />
            </div>

            <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pt-20 flex flex-col justify-end pointer-events-none">
                <div class="absolute top-4 right-4 text-white/20 font-retro text-4xl group-hover:text-white/30 transition-colors pointer-events-none">01</div>
                <h3 class="text-neo-orange font-retro text-[10px] tracking-widest mb-1 uppercase">SHELL</h3>
                <p class="text-white font-title text-2xl uppercase leading-none mb-1 truncate">{{ shell.detail }}</p>
                <div class="flex justify-between items-end">
                    <p class="text-white/70 text-[10px] font-retro uppercase tracking-wider">{{ shell.brand }}</p>
                    <span class="text-white/90 font-bold font-retro bg-white/20 px-2 py-1 rounded text-[10px]">{{ shell.supplement > 0 ? `+${shell.supplement}€` : 'INCLUDED' }}</span>
                </div>
            </div>
        </div>

        <!-- RIGHT COLUMN: SCREEN & LENS (Stacked) -->
        <div class="flex-none lg:flex-1 flex flex-col gap-4 lg:gap-8 min-h-0">
            
            <!-- SCREEN -->
            <div 
              v-if="screen"
              class="flex-1 w-full aspect-square lg:aspect-auto group relative glass-premium rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            >
                <!-- REMOVE BUTTON -->
                <button 
                  @click.stop="store.selectScreen(screen.id)" 
                  class="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/40 hover:bg-red-500/80 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                  title="Remove Item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-black/80 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div class="absolute inset-0 p-6 flex items-center justify-center">
                     <img :src="screen.imageUrl" class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent pt-16 flex flex-col justify-end pointer-events-none">
                    <div class="absolute top-4 right-4 text-white/20 font-retro text-3xl group-hover:text-white/30 transition-colors pointer-events-none">02</div>
                    <h3 class="text-neon-cyan font-retro text-[10px] tracking-widest mb-1 uppercase">SCREEN</h3>
                    <p class="text-white font-title text-lg uppercase leading-none mb-1 truncate">{{ screen.detail }}</p>
                    <div class="flex justify-between items-end">
                        <p class="text-white/70 text-[9px] font-retro uppercase tracking-wider">{{ screen.brand }}</p>
                        <span class="text-white/90 font-bold font-retro bg-white/20 px-2 py-0.5 rounded text-[9px]">{{ screen.supplement > 0 ? `+${screen.supplement}€` : 'INCLUDED' }}</span>
                    </div>
                </div>
            </div>

            <!-- LENS -->
            <div 
              v-if="lens"
              class="flex-1 w-full aspect-square lg:aspect-auto group relative glass-premium rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            >
                <!-- REMOVE BUTTON -->
                <button 
                  @click.stop="store.selectLens(lens.id)" 
                  class="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/40 hover:bg-red-500/80 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                  title="Remove Item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-black/80 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div class="absolute inset-0 p-6 flex items-center justify-center">
                     <img :src="lens.imageUrl" class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent pt-16 flex flex-col justify-end pointer-events-none">
                    <div class="absolute top-4 right-4 text-white/20 font-retro text-3xl group-hover:text-white/30 transition-colors pointer-events-none">03</div>
                    <h3 class="text-neo-green font-retro text-[10px] tracking-widest mb-1 uppercase">LENS</h3>
                    <p class="text-white font-title text-lg uppercase leading-none mb-1 truncate">{{ lens.detail }}</p>
                    <div class="flex justify-between items-end">
                        <p class="text-white/70 text-[9px] font-retro uppercase tracking-wider">{{ lens.category }}</p>
                         <span class="text-white/90 font-bold font-retro bg-white/20 px-2 py-0.5 rounded text-[9px]">{{ lens.supplement > 0 ? `+${lens.supplement}€` : 'INCLUDED' }}</span>
                    </div>
                </div>
            </div>

        </div>

      </div>

      <!-- Empty State -->
      <div v-else class="w-full h-full flex flex-col items-center justify-center z-10 text-center opacity-40">
          <p class="font-title text-2xl text-white mb-2">NO SELECTION</p>
          <p class="font-retro text-xs text-neo-orange">Start by choosing a shell from the menu</p>
      </div>

  </div>
</template>
