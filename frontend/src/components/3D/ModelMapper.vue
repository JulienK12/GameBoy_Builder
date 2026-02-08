<script setup>
import { ref, shallowRef, markRaw, onMounted, computed } from 'vue';
import { TresCanvas } from '@tresjs/core';
import { OrbitControls, ContactShadows } from '@tresjs/cientos';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Color, MeshStandardMaterial, Box3, Vector3 } from 'three';
import SceneNode from './SceneNode.vue';

const model = shallowRef(null);
const isLoading = ref(true);
const debugMessage = ref('Initialisation...');
const controlsRef = ref(null);

onMounted(async () => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  loader.setDRACOLoader(dracoLoader);

  try {
    debugMessage.value = 'Chargement du fichier GLB...';
    const gltf = await loader.loadAsync('/models/gameboy_color.glb');
    const scene = gltf.scene || (gltf.scenes && gltf.scenes[0]);
    
    if (!scene) {
      debugMessage.value = 'Erreur : Aucune scène trouvée';
      return;
    }

    // 1. Centering & Scaling the Whole Model
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim; // Normalize to a visible size
    
    scene.scale.setScalar(scale);
    scene.position.sub(center.multiplyScalar(scale));

    model.value = markRaw(scene);
    debugMessage.value = `Prêt : Le graphe de scène est chargé`;
    isLoading.value = false;
  } catch (error) {
    debugMessage.value = 'Erreur : ' + error.message;
  }
});

function setAllVisibility(visible) {
  if (!model.value) return;
  model.value.traverse((child) => {
    child.visible = visible;
  });
}
</script>

<template>
  <div class="absolute inset-0 z-[100] bg-black flex overflow-hidden">
    <!-- LEFT SIDEBAR: OUTLINER -->
    <aside class="w-[320px] h-full bg-grey-ultra-dark border-r border-white/10 flex flex-col z-10 shadow-xl">
      <div class="p-6 border-b border-white/5 bg-black/40">
        <h2 class="text-neo-orange font-title text-[10px] mb-1 tracking-[.3em]">SCENE_OUTLINER</h2>
        <p class="text-white/40 text-[8px] font-retro uppercase mb-4">Hierarchical Explorer</p>
        
        <div class="flex gap-2">
          <button 
            @click="setAllVisibility(true)"
            class="flex-1 py-1.5 bg-white/5 border border-white/10 text-[8px] font-retro hover:bg-white/10 transition-all"
          >
            SHOW_ALL
          </button>
          <button 
            @click="setAllVisibility(false)"
            class="flex-1 py-1.5 bg-white/5 border border-white/10 text-[8px] font-retro hover:bg-white/10 transition-all"
          >
            HIDE_ALL
          </button>
        </div>
      </div>

      <!-- Scrollable Tree View -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
        <SceneNode v-if="model" :node="model" />
        <div v-else-if="isLoading" class="p-10 text-center animate-pulse">
            <p class="text-neo-orange font-retro text-[8px]">ANALYZING_CORE_DATA...</p>
        </div>
      </div>

      <div class="p-4 bg-black/40 border-t border-white/5">
         <p class="text-white/40 text-[8px] font-retro mb-2 uppercase">System Status</p>
         <div class="flex items-center gap-2">
           <div class="w-1.5 h-1.5 rounded-full" :class="isLoading ? 'bg-neo-orange animate-pulse' : 'bg-green-500'"></div>
           <span class="text-[9px] text-white/60 font-retro truncate">{{ debugMessage }}</span>
         </div>
      </div>
    </aside>

    <!-- MAIN VIEW: 3D CANVAS -->
    <main class="flex-1 relative">
      <TresCanvas clear-color="#050508" shadows alpha power-preference="high-performance">
        <TresPerspectiveCamera :position="[3, 3, 7]" :fov="45" />
        <OrbitControls ref="controlsRef" :enableDamping="true" />
        
        <TresAmbientLight :intensity="0.8" />
        <TresSpotLight 
            :position="[10, 10, 10]" 
            :intensity="150" 
            cast-shadow 
        />
        <TresDirectionalLight :position="[-5, 5, -5]" :intensity="10.0" color="#7C3AED" />
        
        <primitive v-if="model" :object="model" />
        
        <ContactShadows :opacity="0.2" :blur="2" :position="[0, -3, 0]" />
      </TresCanvas>

      <!-- Viewport Labels -->
      <div class="absolute bottom-6 right-6 pointer-events-none text-right">
        <p class="text-[8px] font-retro text-white/20 uppercase tracking-[.2em] mb-1">Interactive Diagnostic Port</p>
        <p class="text-[7px] font-retro text-white/10 uppercase">Shift + M to toggle interface</p>
      </div>

      <!-- Navigation Guide -->
      <div class="absolute top-6 right-6 glass-premium p-4 border-r-2 border-neo-purple pointer-events-none max-w-[240px]">
        <h3 class="text-neo-purple font-title text-[9px] mb-2">CONTROLS_GBC</h3>
        <ul class="text-white/40 text-[8px] font-retro space-y-1">
          <li>● Left Click: Rotate Model</li>
          <li>● Right Click: Pan Camera</li>
          <li>● Scroll: Precise Zoom</li>
          <li>● Sidebar: Toggle Components</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 53, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 53, 0.4);
}
</style>
