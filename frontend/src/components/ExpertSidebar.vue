<script setup>
import { useConfiguratorStore } from '@/stores/configurator';
import { computed, watch } from 'vue';
import ExpertModCard from '@/components/ExpertModCard.vue';

const store = useConfiguratorStore();

// Charger les mods expert à l'ouverture du mode expert (Story 2.2/2.3)
watch(() => store.isExpertMode, (on) => { if (on) store.fetchExpertModsAction(); }, { immediate: true });

// Computed pour afficher les sélections actuelles préservées
const currentSelections = computed(() => {
  const selections = [];
  
  if (store.selectedShellVariantId) {
    const shell = store.shellVariants.find(v => v.id === store.selectedShellVariantId);
    if (shell) {
      selections.push({
        category: 'shell',
        label: 'COQUE',
        name: shell.fullName || shell.name,
        brand: shell.brand
      });
    }
  }
  
  if (store.selectedScreenVariantId) {
    const screen = store.screenVariants.find(v => v.id === store.selectedScreenVariantId);
    if (screen) {
      selections.push({
        category: 'screen',
        label: 'ÉCRAN',
        name: screen.fullName || screen.name,
        brand: screen.brand
      });
    }
  }
  
  if (store.selectedLensVariantId) {
    const lens = store.lensVariants.find(v => v.id === store.selectedLensVariantId);
    if (lens) {
      selections.push({
        category: 'lens',
        label: 'VITRE',
        name: lens.name
      });
    }
  }
  
  if (store.selectedPackId) {
    const pack = store.packs.find(p => p.id === store.selectedPackId);
    if (pack) {
      selections.push({
        category: 'pack',
        label: 'PACK',
        name: pack.name
      });
    }
  }
  
  return selections;
});
</script>

<template>
  <Transition name="slide-in">
    <aside 
      v-if="store.isExpertMode"
      class="fixed top-0 left-0 h-full w-[440px] z-30 lg:z-30 glass-premium border-r-4 border-neo-orange shadow-neo-hard-orange pointer-events-auto overflow-y-auto custom-scrollbar"
      role="complementary"
      aria-label="Mode Expert - Personnalisation avancée"
      aria-hidden="false"
    >
      <div class="p-8 gap-8 flex flex-col h-full">
        <!-- Header -->
        <div class="border-b border-white/10 pb-4">
          <h2 class="font-title text-base text-neo-orange tracking-[.2em] mb-2" id="expert-sidebar-title">EXPERT_MODE</h2>
          <p class="text-[8px] font-retro text-white/60 uppercase tracking-widest" aria-describedby="expert-sidebar-title">
            Personnalisation avancée
          </p>
        </div>

        <!-- Section Configuration de Base (AC #6) -->
        <div class="flex-1">
          <div class="mb-6">
            <h3 class="text-[10px] font-retro text-white/90 uppercase tracking-widest mb-4" id="current-selections-heading">
              Configuration de Base
            </h3>
            <div v-if="currentSelections.length > 0" class="space-y-3" role="list" aria-labelledby="current-selections-heading">
              <div 
                v-for="selection in currentSelections" 
                :key="selection.category"
                class="p-3 bg-black/20 border border-white/10 rounded"
                role="listitem"
                :aria-label="`${selection.label}: ${selection.name}`"
              >
                <div class="text-[8px] font-retro text-neo-orange uppercase tracking-widest mb-1">
                  {{ selection.label }}
                </div>
                <div class="text-xs text-white/90">
                  {{ selection.name }}
                </div>
                <div v-if="selection.brand" class="text-[8px] text-white/50 mt-1">
                  {{ selection.brand }}
                </div>
              </div>
            </div>
            <div v-else class="text-white/40 text-xs italic">
              Aucune sélection pour le moment
            </div>
          </div>

          <!-- Erreur de validation expert (Story 2.3 - AC #3, #5) -->
          <div
            v-if="store.expertValidationError"
            class="p-4 rounded border bg-red-900/50 border-red-500/50 text-white font-retro text-xs space-y-3"
            role="alert"
          >
            <p class="uppercase tracking-widest text-red-300">{{ store.expertValidationError }}</p>
            <button
              v-if="store.isNetworkError"
              type="button"
              class="px-4 py-2 rounded border border-neo-orange text-neo-orange hover:bg-neo-orange/20 transition-colors"
              @click="store.retryExpertValidation()"
            >
              Réessayer
            </button>
          </div>

          <!-- Mods expert par catégorie (Story 2.2 Task 6) -->
          <div v-if="store.expertMods" class="space-y-6">
            <section v-for="cat in ['cpu', 'audio', 'power']" :key="cat" class="space-y-2">
              <h3 class="text-[10px] font-retro text-neo-orange uppercase tracking-widest">
                {{ cat === 'cpu' ? 'CPU' : cat === 'audio' ? 'AUDIO' : 'ALIMENTATION' }}
              </h3>
              <div class="space-y-2">
                <ExpertModCard
                  v-for="mod in (store.expertMods[cat] || [])"
                  :key="mod.id"
                  :mod="mod"
                  :category="cat"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
/* Slide-in animation depuis la gauche */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-in-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-in-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Responsive: sur mobile, la sidebar devient un drawer overlay avec backdrop */
@media (max-width: 1023px) {
  aside {
    width: 100%;
    max-width: 100vw;
    z-index: 60; /* Au-dessus de tout sur mobile */
  }
  
  /* Backdrop overlay pour mobile */
  aside::before {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: -1;
    pointer-events: auto;
  }
}
</style>
