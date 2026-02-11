<script setup>
import { ref, onMounted } from 'vue'
import { useConfiguratorStore } from '@/stores/configurator'

const store = useConfiguratorStore()
const showPacks = ref(false)
const isLoading = ref(false)

async function choisirStarterKits() {
  isLoading.value = true
  try {
    await store.fetchCatalog()
    await store.fetchPacksAction()
    showPacks.value = true
  } catch (err) {
    console.error('Erreur lors de l\'initialisation des packs:', err)
  } finally {
    isLoading.value = false
  }
}

async function choisirAtelierLibre() {
  isLoading.value = true
  try {
    await store.fetchCatalog()
    store.showLandingPortal = false
  } catch (err) {
    console.error('Erreur lors du chargement de l\'atelier:', err)
  } finally {
    isLoading.value = false
  }
}

function choisirPack(packId) {
  store.selectPack(packId)
}

function retourPortail() {
  showPacks.value = false
}
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-grey-ultra-dark flex items-center justify-center overflow-hidden">
    
    <!-- Fond avec gradients animés -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-neo-purple/10 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neo-orange/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 1s;"></div>
    </div>

    <!-- Scanlines overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-5"
         style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);">
    </div>

    <!-- Contenu principal -->
    <div class="relative z-10 w-full max-w-4xl mx-auto px-6">
      
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in-up">
        <div class="inline-flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-neo-orange border-2 border-black rotate-3 flex items-center justify-center shadow-[4px_4px_0px_#000]">
            <span class="font-title text-black text-lg">RB</span>
          </div>
        </div>
        <h1 class="font-title text-2xl md:text-3xl text-white tracking-[.3em] mb-3">
          RAYBOY<span class="text-neo-orange mx-1">.</span>92
        </h1>
        <p class="font-retro text-[8px] text-white/30 tracking-[.5em] uppercase">
          Gameboy Color Modding Studio
        </p>
      </div>

      <!-- Vue principale : Choix du mode -->
      <Transition name="fade" mode="out-in">
        
        <!-- Deux cartes Notched -->
        <div v-if="!showPacks" key="portal" class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style="animation-delay: 0.2s;">
          
          <!-- Carte Starter Kits -->
          <button 
            @click="choisirStarterKits"
            :disabled="isLoading"
            class="group relative glass-premium p-8 text-left transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-l-4 border-neo-orange hover:shadow-neo-glow-orange"
            style="clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));"
          >
            <!-- Glow sur hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-neo-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                 style="clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));"></div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-2 h-2 bg-neo-orange shadow-[0_0_8px_rgba(255,107,53,0.8)]"></div>
                <span class="font-retro text-[8px] text-neo-orange tracking-[.3em]">MODE_GUIDÉ</span>
              </div>
              
              <h2 class="font-title text-xl text-white tracking-[.15em] mb-3">STARTER KITS</h2>
              <p class="text-white/50 text-sm leading-relaxed mb-6">
                Configurations pré-assemblées par nos experts. Choisissez un pack et personnalisez-le à votre goût.
              </p>

              <div class="flex items-center gap-2 text-neo-orange font-retro text-[8px] tracking-widest group-hover:gap-4 transition-all">
                <span>EXPLORER</span>
                <span class="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>

            <!-- Loading spinner -->
            <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
                 style="clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));">
              <div class="w-6 h-6 border-2 border-neo-orange border-t-transparent rounded-full animate-spin"></div>
            </div>
          </button>

          <!-- Carte Atelier Libre -->
          <button 
            @click="choisirAtelierLibre"
            :disabled="isLoading"
            class="group relative glass-premium p-8 text-left transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-l-4 border-neo-purple hover:shadow-neo-glow-purple"
            style="clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));"
          >
            <!-- Glow sur hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-neo-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                 style="clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));"></div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-2 h-2 bg-neo-purple shadow-[0_0_8px_rgba(124,58,237,0.8)]"></div>
                <span class="font-retro text-[8px] text-neo-purple tracking-[.3em]">MODE_EXPERT</span>
              </div>
              
              <h2 class="font-title text-xl text-white tracking-[.15em] mb-3">ATELIER LIBRE</h2>
              <p class="text-white/50 text-sm leading-relaxed mb-6">
                Construisez votre console de A à Z. Accès complet à toutes les options et composants disponibles.
              </p>

              <div class="flex items-center gap-2 text-neo-purple font-retro text-[8px] tracking-widest group-hover:gap-4 transition-all">
                <span>CRÉER</span>
                <span class="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>

            <!-- Loading spinner -->
            <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
                 style="clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));">
              <div class="w-6 h-6 border-2 border-neo-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
          </button>
        </div>

        <!-- Liste des packs -->
        <div v-else key="packs" class="animate-fade-in-up">
          
          <!-- Bouton retour -->
          <button 
            @click="retourPortail"
            class="flex items-center gap-2 mb-8 text-white/40 hover:text-white transition-colors font-retro text-[8px] tracking-widest"
          >
            <span>←</span>
            <span>RETOUR</span>
          </button>

          <h2 class="font-title text-lg text-white tracking-[.2em] mb-2">STARTER_KITS</h2>
          <p class="font-retro text-[8px] text-white/30 tracking-widest mb-8">CHOISISSEZ VOTRE CONFIGURATION DE BASE</p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              v-for="pack in store.packs"
              :key="pack.id"
              @click="choisirPack(pack.id)"
              class="group glass-premium p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:border-neo-orange/50"
              style="clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));"
            >
              <!-- Image pack (placeholder glow) -->
              <div class="w-full aspect-square bg-gradient-to-br from-white/5 to-white/[0.02] mb-4 flex items-center justify-center overflow-hidden"
                   style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));">
                <div class="w-16 h-16 border border-white/10 rotate-45 group-hover:rotate-[135deg] group-hover:border-neo-orange/40 transition-all duration-700"></div>
              </div>

              <div class="flex items-center gap-2 mb-2">
                <div class="w-1.5 h-1.5 bg-neo-orange shadow-[0_0_6px_rgba(255,107,53,0.6)]"></div>
                <h3 class="font-title text-sm text-white tracking-[.1em]">{{ pack.name.toUpperCase() }}</h3>
              </div>
              
              <p class="text-white/40 text-xs leading-relaxed mb-4">{{ pack.description }}</p>

              <div class="flex items-center justify-between mt-auto">
                <span v-if="pack.price" class="font-title text-sm text-neo-orange tracking-widest">{{ pack.price.toFixed(2) }} €</span>
                <span v-else class="font-title text-sm text-neo-orange tracking-widest">--.-- €</span>
                
                <div class="flex items-center gap-2 text-neo-orange font-retro text-[7px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>SÉLECTIONNER</span>
                  <span>→</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Footer -->
      <div class="text-center mt-12">
        <p class="font-retro text-[7px] text-white/10 tracking-[.4em]">SYSTEM_READY // V0.1.0</p>
      </div>
    </div>
  </div>
</template>
