<script setup>
import { Suspense, onMounted, ref, computed } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';
import { useDeckStore } from '@/stores/deck';
import ThreeDPreview from '@/components/3D/ThreeDPreview.vue';
import VariantGallery from '@/components/VariantGallery.vue';
import QuoteDisplay from '@/components/QuoteDisplay.vue';
import ModelMapper from '@/components/3D/ModelMapper.vue';
import SelectionRecap from '@/components/SelectionRecap.vue';
import LandingPortal from '@/components/LandingPortal.vue';
import ExpertSidebar from '@/components/ExpertSidebar.vue';
import DeckManager from '@/components/DeckManager.vue';
import GlitchEffect from '@/components/GlitchEffect.vue';
import SignatureShowcase from '@/components/SignatureShowcase.vue';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// import DebugOverlay from '@/components/DebugOverlay.vue'; // Disabled for production

const store = useConfiguratorStore();
const isQuoteOpen = ref(true); // Open by default on desktop
const isShowroomMode = ref(false);
const isMappingMode = ref(false);
const currentVerifyIdx = ref(-1);
const showDeckManager = ref(false);

// Shortcut for mapping mode: Shift + M
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key.toLowerCase() === 'm') {
      isMappingMode.value = !isMappingMode.value;
      console.log('Mapping Mode:', isMappingMode.value);
    }
  });
});

function toggleQuote() {
  isQuoteOpen.value = !isQuoteOpen.value;
}

function toggleShowroom() {
  isShowroomMode.value = !isShowroomMode.value;
  // If we are entering showroom mode, close quote to maximize view
  if (isShowroomMode.value) isQuoteOpen.value = false;
}

/**
 * Retour au portail de choix du mode (Starter Kits / Atelier Libre).
 * Réinitialise la config si un pack était sélectionné pour éviter les états incohérents.
 */
function retourPortail() {
  // Réinitialiser la configuration si un pack était sélectionné
  if (store.selectedPackId) {
    store.resetConfig();
  }
  store.showLandingPortal = true;
}

// Charger le catalogue et le deck (cloud si connecté) au démarrage
onMounted(() => {
  store.fetchCatalog();
  useDeckStore().loadFromCloud();

  // Auto-close quote on mobile initially
  if (window.innerWidth < 1024) {
    isQuoteOpen.value = false;
  }
});

// Story 4.1 — Finaliser : configuration complète + devis valide pour afficher Signature Showcase
// Note: Les boutons sont optionnels - un utilisateur peut finaliser sans sélectionner de boutons
const canFinalize = computed(() => {
  const hasShell = !!store.selectedShellVariantId;
  const hasScreen = !!store.selectedScreenVariantId;
  const hasLensOrNotRequired = !!store.selectedLensVariantId || !store.isLensRequired;
  const hasValidQuote = store.quote?.total_price != null && !store.hasError;
  // Buttons are optional - no check needed for selectedButtonVariantId
  return hasShell && hasScreen && hasLensOrNotRequired && hasValidQuote;
});

const verificationGroups = [
  'shell_front',
  'shell_back',
  'lens',
  'button_a',
  'button_b',
  'button_dpad',
  'buttons_start_select'
];
const isLargeScreen = ref(window.innerWidth >= 1024);

function nextVerify() {
  currentVerifyIdx.value = (currentVerifyIdx.value + 1) % (verificationGroups.length + 1);
  if (currentVerifyIdx.value === verificationGroups.length) currentVerifyIdx.value = -1;
}

onMounted(() => {
  window.addEventListener('resize', () => {
    isLargeScreen.value = window.innerWidth >= 1024;
  });
});
</script>

<template>
  <div class="h-[100dvh] w-full max-w-[100vw] bg-grey-ultra-dark overflow-hidden relative selection:bg-neo-orange/30">
    <!-- Effet Glitch global (Story 2.3 - erreurs validation expert) -->
    <GlitchEffect :trigger="store.glitchTrigger" />
    <!-- Story 4.1 — Signature Showcase (plein écran, au-dessus du reste) -->
    <SignatureShowcase v-if="store.showSignatureShowcase" />
    <!-- LandingPortal -->
    <LandingPortal v-if="store.showLandingPortal" />

    <!-- Message succès après Confirmer la Création (Story 4.2) -->
    <Transition name="fade">
      <div
        v-if="store.submissionSuccessMessage"
        class="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 glass-premium border-2 border-neo-orange/50 text-neo-orange font-title text-[10px] tracking-widest rounded-lg shadow-neo-glow-orange"
        role="status"
        data-testid="submission-success-banner"
      >
        {{ store.submissionSuccessMessage }}
      </div>
    </Transition>

    <!-- Atelier : masqué quand Signature Showcase est affiché (AC #1) -->
    <template v-if="!store.showSignatureShowcase">
    <!-- <DebugOverlay /> -->
    
    <!-- 3D Mapper Tool (Temporary) -->
    <ModelMapper v-if="isMappingMode" />

    <!-- Mon Deck (Story 3.1) — au-dessus du header (z-50) pour être cliquable -->
    <div class="absolute top-6 left-6 z-50 pointer-events-auto">
      <button
        @click="showDeckManager = true"
        class="px-4 py-2 glass-premium rounded-full border border-white/20 text-[8px] font-retro tracking-widest transition-all duration-300 hover:border-neo-purple/50 hover:text-white"
        :class="showDeckManager ? 'border-neo-purple text-white shadow-neo-glow-purple' : 'text-white/60'"
        aria-label="Ouvrir le Deck Manager"
      >
        MON_DECK
      </button>
    </div>

    <!-- 1. BACKGROUND: MASSIVE 3D STAGE (The "Hero") -->
    <main class="absolute inset-0 z-0 bg-black group overflow-hidden flex flex-col justify-center items-center">
       <!-- Toggle 3D/Recap Button (Story 5.1) — top-16 sur mobile pour éviter le conflit avec RETOUR -->
       <div class="absolute top-16 lg:top-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/5 pointer-events-auto" data-testid="toggle-3d-recap">
          <button 
             @click="store.show3D = true"
             class="px-4 py-1.5 rounded-full text-[10px] font-retro tracking-widest transition-all duration-300"
             :class="store.show3D ? 'bg-neo-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'text-white/40 hover:text-white'"
             :aria-pressed="store.show3D"
             aria-label="Afficher la vue 3D"
             data-testid="btn-3d-view"
          >
             3D_VIEW
          </button>
          <button 
             @click="store.show3D = false"
             class="px-4 py-1.5 rounded-full text-[10px] font-retro tracking-widest transition-all duration-300"
             :class="!store.show3D ? 'bg-neo-orange text-white shadow-[0_0_15px_rgba(255,107,53,0.5)]' : 'text-white/40 hover:text-white'"
             :aria-pressed="!store.show3D"
             aria-label="Afficher le récapitulatif des options"
             data-testid="btn-recap-view"
          >
             RECAP_VIEW
          </button>
       </div>

       <!-- Expert Mode Toggle -->
       <TooltipProvider>
         <Tooltip>
           <TooltipTrigger as-child>
             <button 
               @click="store.toggleExpertMode()"
               @keydown.enter.prevent="store.toggleExpertMode()"
               @keydown.space.prevent="store.toggleExpertMode()"
               class="absolute top-6 right-6 z-50 px-4 py-2 glass-premium rounded-full border text-[8px] font-retro tracking-widest transition-all duration-300 hover:shadow-neo-glow-orange focus:outline-none focus:ring-2 focus:ring-neo-orange focus:ring-offset-2 focus:ring-offset-black"
               :class="store.isExpertMode ? 'bg-neo-orange text-black border-neo-orange shadow-neo-glow-orange' : 'text-white/60 border-white/20 hover:text-white hover:border-white/40'"
               :aria-label="store.isExpertMode ? 'Désactiver le Mode Expert' : 'Activer le Mode Expert'"
               :aria-pressed="store.isExpertMode"
               aria-describedby="expert-mode-tooltip"
             >
               {{ store.isExpertMode ? 'EXPERT_ON' : 'EXPERT_OFF' }}
             </button>
           </TooltipTrigger>
           <TooltipContent 
             id="expert-mode-tooltip"
             class="bg-black/90 border border-neo-orange/50 text-white text-xs font-retro p-2 max-w-xs"
             role="tooltip"
           >
             <p>Mode Expert : Accès aux composants haut de gamme et personnalisation avancée</p>
           </TooltipContent>
         </Tooltip>
       </TooltipProvider>

       <Transition name="fade" mode="out-in">
         <div v-if="store.show3D" class="w-full h-full relative">
            <!-- Badge APERÇU_3D (Task 2.1 - Story 5.1) — contraste WCAG AA (NFR2) -->
            <div 
              class="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 glass-premium border border-white/20 rounded-full pointer-events-none"
              data-testid="3d-preview-badge"
            >
              <span class="text-[8px] font-retro text-white/90 tracking-widest uppercase">APERÇU_3D</span>
            </div>
            
            <!-- Corner Accents inside 3D view -->
            <div class="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-neon-cyan/20 z-10 pointer-events-none"></div>
            <div class="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-neo-purple/20 z-10 pointer-events-none"></div>

            <Suspense>
              <template #default>
                 <ModelMapper v-if="isMappingMode" />
                 <ThreeDPreview v-else 
                   :shell-color="store.selectedShellColorHex"
                   :is-transparent="store.selectedShellIsTransparent"
                   :variant-id="store.selectedShellVariantId"
                   :active-verification-group="currentVerifyIdx >= 0 ? verificationGroups[currentVerifyIdx] : null"
                   :parts-colors="{
                      shell_front: store.selectedShellColorHex,
                      shell_back: store.selectedShellColorHex, 
                      lens: '#111111',
                      button_a: '#EF4444',
                      button_b: '#EF4444',
                      button_dpad: '#1F2937',
                      buttons_start_select: '#1F2937'
                   }"
                 />
              </template>
              <template #fallback>
                 <div class="w-full h-full flex flex-col items-center justify-center bg-grey-ultra-dark">
                    <div class="w-32 h-1 bg-grey-dark relative overflow-hidden">
                      <div class="absolute inset-y-0 left-0 bg-neo-orange w-1/3 animate-[loading_1s_infinite]"></div>
                    </div>
                    <div class="mt-4 font-retro text-[8px] text-neo-orange tracking-[.5em] animate-pulse">STREAMING_GEOMETRY...</div>
                 </div>
              </template>
            </Suspense>
            
            <!-- Viewport Label -->
            <div class="absolute top-6 right-6 pointer-events-none z-20 hidden lg:block">
                 <div class="text-[8px] font-retro text-white/10 text-right rotate-90 origin-top-right translate-y-4">720P_RENDER_BUFFER_ACTIVE</div>
            </div>
         </div>
         
         <SelectionRecap v-else />
       </Transition>
    </main>

    <!-- 2. UI LAYER: FLOATING PANELS -->
    
    <!-- TOP LEFT: Branding & Main Category Nav (Desktop) -->
    <header class="absolute top-6 left-6 z-40 w-[440px] pointer-events-none hidden lg:block">
      <div class="glass-premium p-6 rounded-lg pointer-events-auto border-l-4 border-neo-orange shadow-neo-hard-orange">
        <div class="flex items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-4">
            <div class="w-9 h-9 bg-neo-orange border border-black rotate-3 flex items-center justify-center">
              <span class="font-title text-black text-xs">RB</span>
            </div>
            <h1 class="font-title text-base text-white tracking-[.2em]">RAYBOY<span class="text-neo-orange mx-1">.</span>92</h1>
          </div>
          <!-- Bouton retour vers le portail -->
          <button
            v-if="!store.showLandingPortal"
            @click="retourPortail"
            class="group flex items-center gap-2 px-3 py-1.5 text-white/60 hover:text-white font-retro text-[8px] tracking-widest border border-white/10 hover:border-neo-orange/50 rounded transition-all duration-300 hover:bg-white/5 active:scale-95"
            aria-label="Retour au portail de choix du mode"
          >
            <span class="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span>RETOUR</span>
          </button>
        </div>

        <nav class="flex gap-2">
          <button 
            v-for="cat in store.categories" 
            :key="cat.id"
            @click="!cat.disabled && store.setCategory(cat.id)"
            :data-category="cat.id"
            class="flex-1 h-12 border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center group relative overflow-hidden"
            :class="[store.activeCategory === cat.id ? 'border-neo-orange bg-neo-orange/10 !opacity-100' : 'opacity-90 hover:opacity-100']"
          >
             <img 
               :src="cat.image" 
               class="w-8 h-8 lg:w-10 lg:h-10 object-contain z-10 transition-all duration-300" 
               :class="store.activeCategory === cat.id ? 'brightness-125 saturate-200 drop-shadow-[0_0_8px_rgba(255,107,53,1)] scale-110' : 'brightness-[3] contrast-200 opacity-80 group-hover:brightness-150 group-hover:opacity-100'" 
             />
             <div v-if="store.activeCategory === cat.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-neo-orange"></div>
          </button>
        </nav>
      </div>
    </header>

    <!-- CENTER-LEFT: Variant Gallery (Floating) -->
    <aside class="absolute top-[180px] bottom-6 left-6 z-30 w-[440px] pointer-events-none hidden lg:flex flex-col">
      <div class="glass-premium flex-1 flex flex-col rounded-lg pointer-events-auto overflow-hidden">
        <div class="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
          <span class="text-[8px] font-retro text-white/90 uppercase tracking-widest">{{ store.activeCategory }} // SELECTION</span>
          <div class="flex gap-1.5">
            <div class="w-1 h-1 bg-neo-orange rounded-full"></div>
            <div class="w-1 h-1 bg-neo-orange/40 rounded-full"></div>
            <div class="w-1 h-1 bg-neo-orange/10 rounded-full"></div>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
            <VariantGallery class="!border-0 !max-h-full" />
        </div>
      </div>
    </aside>

    <!-- Expert Sidebar (Left side, appears when Expert Mode is active) -->
    <ExpertSidebar />

    <!-- Deck Manager (Story 3.1) — panneau droit -->
    <Teleport to="body">
      <Transition name="deck-panel">
        <div
          v-if="showDeckManager"
          class="fixed inset-0 z-[45] flex justify-end pointer-events-none"
          aria-modal="true"
          role="dialog"
          aria-label="Deck Manager"
        >
          <div
            class="absolute inset-0 bg-black/40 pointer-events-auto"
            aria-hidden="true"
            @click="showDeckManager = false"
          />
          <div
            class="deck-panel-slide relative w-full max-w-md sm:max-w-lg h-full glass-premium border-l-4 border-neo-purple shadow-neo-hard-purple pointer-events-auto flex flex-col overflow-hidden"
            @click.stop
          >
            <DeckManager @close="showDeckManager = false" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- RIGHT: Quote & Confirmation (Floating Desktop) -->
    <aside 
      v-if="isQuoteOpen"
      class="absolute top-6 bottom-6 right-6 z-40 w-[340px] pointer-events-none hidden xl:flex flex-col"
    >
      <div class="glass-premium h-full flex flex-col rounded-lg pointer-events-auto overflow-hidden border-r-4 border-neo-purple shadow-neo-hard-purple">
        <div class="p-5 bg-black/40 border-b border-white/5">
          <div class="flex justify-between items-center">
            <h2 class="font-title text-[10px] text-neo-purple tracking-[.2em]">BUILD_RECAP</h2>
            <div class="w-1.5 h-1.5 bg-neo-purple shadow-[0_0_8px_#7C3AED]"></div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <QuoteDisplay />
        </div>

        <div class="p-5 bg-black/40 border-t border-white/5">
          <button
            type="button"
            :disabled="!canFinalize"
            @click="store.showSignatureShowcase = true"
            class="w-full py-3 font-title text-xs tracking-[.25em] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :class="canFinalize ? 'bg-neon-cyan text-black hover:brightness-110 active:scale-95 shadow-[4px_4px_0px_#111]' : 'bg-white/20 text-white/60'"
            data-testid="btn-finaliser"
          >
            FINALISER
          </button>
        </div>
      </div>
    </aside>

    <!-- 3. MOBILE INTERFACE (Touch Optimized) -->
    
    <!-- Mobile Bouton Retour (en haut à gauche) -->
    <div v-if="!store.showLandingPortal" class="lg:hidden fixed top-6 left-6 z-[60]">
       <button 
         @click="retourPortail"
         class="px-4 py-2 glass-premium rounded-full border border-white/20 text-[8px] font-retro tracking-widest uppercase transition-all active:scale-90 text-white/60 hover:text-white hover:border-neo-orange/50"
         aria-label="Retour au portail de choix du mode"
       >
         ← RETOUR
       </button>
    </div>

    <!-- Mobile Showroom Mode Toggle -->
    <div class="lg:hidden fixed top-20 right-6 z-[60]">
       <button 
         @click="toggleShowroom" 
         class="px-4 py-2 glass-premium rounded-full border border-white/20 text-[8px] font-retro tracking-widest uppercase transition-all active:scale-90"
         :class="isShowroomMode ? 'bg-neo-orange text-black border-neo-orange shadow-neo-glow-orange' : 'text-white/60'"
       >
         {{ isShowroomMode ? 'EXIT_SHOWROOM' : 'ENTER_SHOWROOM' }}
       </button>
    </div>

    <!-- Mobile Bottom Navigation (Categories) -->
    <Transition name="slide-down">
      <div v-if="!isShowroomMode" class="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-premium border-b-0 border-x-0 rounded-t-2xl pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        <div class="p-2 flex justify-around">
          <button 
            v-for="cat in store.categories" 
            :key="cat.id"
            @click="store.setCategory(cat.id)"
            :data-category="cat.id"
            class="flex-col items-center gap-1 p-2 transition-all flex"
            :class="[store.activeCategory === cat.id ? 'text-neo-orange' : 'text-white/80 opacity-90 hover:text-white']"
          >
            <img 
              :src="cat.image" 
              class="w-8 h-8 object-contain transition-all duration-300" 
              :class="store.activeCategory === cat.id ? 'brightness-125 saturate-200 drop-shadow-[0_0_8px_rgba(255,107,53,1)] scale-110' : 'brightness-[3] contrast-200 opacity-80'" 
            />
            <span class="text-[7px] font-retro uppercase">{{ cat.label }}</span>
          </button>
        </div>
        
        <!-- Variant Gallery Mobile (Horizontal) -->
        <div class="h-[160px] bg-black/20">
          <VariantGallery :is-mobile="true" />
        </div>

        <!-- Mobile Total & Expand (Story 4.1 : Finaliser ouvre Signature Showcase) -->
        <div class="p-4 bg-black/60 flex justify-between items-center gap-2 border-t border-white/10">
          <div>
             <span class="text-[8px] font-retro text-white/30 block mb-1 uppercase">ESTIMATED_TOTAL</span>
             <span class="text-xl font-title text-neo-orange tracking-tight">{{ store.totalPrice.toFixed(2) }}€</span>
          </div>
          <div class="flex gap-2">
            <button
              v-if="canFinalize"
              type="button"
              @click="store.showSignatureShowcase = true"
              class="px-4 py-2 bg-neo-orange text-black font-title text-[10px] tracking-widest rounded-sm active:scale-95 transition-all"
              data-testid="btn-finaliser-mobile"
            >
              FINALISER
            </button>
            <button @click="toggleQuote" class="px-6 py-2 bg-neo-purple text-white font-title text-[10px] tracking-widest rounded-sm active:scale-95 transition-all">
              {{ isQuoteOpen ? ' FERMER' : 'DETAIL' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Mobile Dashboard (Overlay) -->
    <div v-if="isLargeScreen && !isQuoteOpen" class="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-30">
       <button @click="toggleQuote" class="w-10 h-24 glass-premium border-r-0 rounded-l-xl text-neo-purple flex items-center justify-center hover:bg-white/10 transition-all">
         <span class="rotate-90 font-title text-[10px] tracking-[.3em] whitespace-nowrap">VIEW_DEVIS</span>
       </button>
    </div>

    <!-- VERIFICATION OVERLAY (Remains same but glassmorphic) -->
    <div v-if="currentVerifyIdx >= 0" class="absolute inset-0 z-50 flex items-center justify-center pointer-events-none p-6">
      <div class="glass-premium p-10 pointer-events-auto text-center border-neo-orange shadow-[0_0_50px_rgba(255,107,53,0.3)] max-w-sm w-full">
        <h2 class="text-neo-orange font-title text-xs mb-3 tracking-[.5em] animate-pulse">MODE_VERIFICATION</h2>
        <p class="text-white font-title text-3xl mb-8 uppercase tracking-widest underline decoration-neo-orange decoration-4 underline-offset-8">
          {{ verificationGroups[currentVerifyIdx].replace('_', ' ') }}
        </p>
        <button @click="nextVerify" class="w-full py-4 bg-neo-orange text-black font-title text-sm hover:brightness-110 active:scale-95 transition-all">
          SUIVANT_COMPONENT ->
        </button>
      </div>
    </div>

    </template>
  </div>
</template>

<style>
.slide-down-enter-active, .slide-down-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from, .slide-down-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Deck Manager panel (Story 3.1) */
.deck-panel-enter-active,
.deck-panel-leave-active {
  transition: opacity 0.2s ease;
}
.deck-panel-enter-active .deck-panel-slide,
.deck-panel-leave-active .deck-panel-slide {
  transition: transform 0.25s ease;
}
.deck-panel-enter-from,
.deck-panel-leave-to {
  opacity: 0;
}
.deck-panel-enter-from .deck-panel-slide,
.deck-panel-leave-to .deck-panel-slide {
  transform: translateX(100%);
}
</style>

