<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  category: { type: String, required: true },
  compatibility: { type: Object, default: () => ({ compatible: true, status: 'OK' }) },
  viewMode: { type: String, default: 'grid' }
});

const emit = defineEmits(['select', 'hover', 'leave', 'show-details']);

function formatPrice(variant) {
  if (variant.supplement > 0) return `+${variant.supplement}€`;
  if (variant.price > 0) return `${variant.price}€`;
  return 'Inclus';
}

const cardClasses = computed(() => ({
  'glass-card !border-neo-orange/60 animate-glow-orange': props.isActive,
  '!border-red-500/50 bg-red-500/5': props.compatibility?.status === 'FORBIDDEN',
  '!border-neo-orange/30': props.compatibility?.status === 'WARNING'
}));

function handleMouseEnter(e) {
  emit('hover', e, props.variant);
}

function handleMouseLeave() {
  emit('leave');
}

function handleInfoClick(e) {
  e.stopPropagation();
  emit('show-details', props.variant);
}
</script>

<template>
  <!-- GRID MODE -->
  <div 
    v-if="viewMode === 'grid'"
    class="relative group cursor-pointer transition-all duration-200 flex flex-col h-full"
    :class="cardClasses"
    :data-variant-id="variant.id"
    @click="emit('select', variant)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Compatibility Indicator (🚫 Forbidden or ⚠️ Warning) -->
    <div v-if="compatibility?.status && compatibility.status !== 'OK'" class="absolute top-1 left-1 z-30 transform -rotate-12">
       <div 
         class="text-[10px] p-0.5 border-2 border-black shadow-[2px_2px_0px_black] bg-black flex items-center justify-center"
         :class="compatibility.status === 'FORBIDDEN' ? 'text-red-500' : 'bg-neo-yellow text-black'"
       >
          <span v-if="compatibility.status === 'FORBIDDEN'">🚫</span>
          <span v-else>⚠️</span>
       </div>
    </div>

    <!-- Thumbnail Container (Smaller) -->
    <div 
      class="h-20 relative overflow-hidden bg-grey-dark/50 flex items-center justify-center p-2"
      :style="category === 'shell' ? { backgroundColor: variant.colorHex + '20' } : {}"
    >
      <img 
        v-if="variant.imageUrl" 
        :src="variant.imageUrl" 
        class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1" 
        :alt="variant.name"
      />
      <!-- Fallback Icon -->
      <div v-else class="text-white/20">
         <svg v-if="category === 'shell'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
         </svg>
         <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
         </svg>
      </div>

      <!-- Price Label (Cyber Style) -->
      <div 
        v-if="variant.supplement > 0 || (variant.price > 0 && category !== 'shell')"
        class="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-neo-orange font-title text-[8px] px-2 py-0.5 border border-white/10 rounded-sm group-hover:bg-neo-orange group-hover:text-black transition-colors"
      >
        {{ formatPrice(variant) }}
      </div>
    </div>

    <!-- Info Section (Cyber-Luxury) -->
    <div class="px-3 py-2 border-t border-white/5 bg-black/20 group-hover:bg-black/40 transition-colors flex-1">
      <h4 
        class="text-[9px] font-bold uppercase truncate tracking-widest"
        :class="isActive ? 'text-neo-orange' : 'text-white'"
      >
        {{ variant.name }}
      </h4>
      <div class="flex items-center justify-between mt-1">
        <span class="text-[7px] text-white/60 uppercase font-retro tracking-widest">{{ variant.brand || 'Std' }}</span>
        <div v-if="isActive" class="w-1 h-1 rounded-full bg-neo-orange shadow-[0_0_8px_var(--color-neo-orange)]"></div>
        <div v-else-if="compatibility?.status === 'FORBIDDEN'" class="w-1 h-1 rounded-full bg-red-600"></div>
        <div v-else-if="compatibility?.status === 'WARNING'" class="w-1 h-1 rounded-full bg-neo-yellow/40"></div>
      </div>
    </div>
  </div>

  <!-- MOBILE SQUARE MODE -->
  <div 
    v-else-if="viewMode === 'mobile'"
    class="relative w-[100px] h-[100px] shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/5 transition-all active:scale-95"
    :class="cardClasses"
    :data-variant-id="variant.id"
    @click="emit('select', variant)"
  >
     <!-- Background hue -->
     <div 
       class="absolute inset-0 opacity-20"
       :style="category === 'shell' ? { backgroundColor: variant.colorHex } : { backgroundColor: '#ffffff' }"
     ></div>

     <!-- Product Image -->
     <div class="absolute inset-0 p-3 flex items-center justify-center">
       <img 
         v-if="variant.imageUrl" 
         :src="variant.imageUrl" 
         class="w-full h-full object-contain brightness-110 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" 
       />
       <div v-else class="text-white/10 text-[6px] font-retro">NO_IMG</div>
     </div>

     <!-- Price Badge -->
     <div class="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[7px] font-title text-neo-orange">
        {{ formatPrice(variant) }}
     </div>

     <!-- Info Trigger (Mobile Spefic) -->
     <button 
       @click="handleInfoClick"
       class="absolute bottom-1.5 right-1.5 w-5 h-5 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/60 active:bg-white active:text-black transition-all"
     >
        <span class="text-[10px] pointer-events-none">ⓘ</span>
     </button>

     <!-- Compatibility Dot -->
     <div 
       v-if="compatibility?.status !== 'OK'" 
       class="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full"
       :class="compatibility.status === 'FORBIDDEN' ? 'bg-red-500 animate-pulse' : 'bg-neo-orange'"
     ></div>

     <!-- Active Indicator Overlay -->
     <div v-if="isActive" class="absolute inset-0 border-2 border-neo-orange rounded-xl pointer-events-none shadow-[inset_0_0_15px_rgba(255,107,53,0.3)]"></div>
  </div>
  <div 
    v-else
    class="relative group cursor-pointer transition-all duration-200 flex items-center p-3 gap-4 glass-card hover:bg-white/5"
    :class="cardClasses"
    :data-variant-id="variant.id"
    @click="emit('select', variant)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="w-12 h-12 bg-black/40 border border-white/10 rounded-lg shrink-0 flex items-center justify-center p-1 overflow-hidden group-hover:border-neo-orange/50 transition-colors">
      <img v-if="variant.imageUrl" :src="variant.imageUrl" class="w-full h-full object-contain brightness-110" />
      <span v-else class="text-[7px] font-retro text-white/10">IMG</span>
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="text-[10px] font-title text-white/90 truncate uppercase tracking-widest">{{ variant.name }}</h4>
      <p class="text-[8px] text-white/30 uppercase font-retro tracking-tighter">{{ variant.brand || 'OEM' }} {{ variant.mold ? '| ' + variant.mold : '' }}</p>
    </div>
    <div class="text-right">
      <span class="text-neo-orange font-title text-[10px] font-bold">{{ formatPrice(variant) }}</span>
      <div v-if="isActive" class="text-[7px] font-retro text-neo-orange/40 uppercase tracking-widest mt-1">SELECTED</div>
    </div>
  </div>

  <!-- Compatibility Tooltip/Label (List Mode) -->
  <div v-if="compatibility?.status !== 'OK' && viewMode === 'list'" class="ml-auto pointer-events-none">
       <span 
         class="text-[7px] font-bold uppercase tracking-tighter"
         :class="compatibility.status === 'FORBIDDEN' ? 'text-red-500' : 'text-neo-yellow'"
       >
         {{ compatibility.reason }}
       </span>
  </div>
</template>

<style scoped>
.neo-card {
  /* This component inherits the global .neo-card but adds specific layout */
  display: flex;
  flex-direction: column;
}
</style>
