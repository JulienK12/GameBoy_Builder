<script setup>
import { ref, computed, watch } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';
import { CATEGORIES as categories } from '@/constants';

// Sub-components
import GalleryHeader from './Gallery/GalleryHeader.vue';
import GalleryFilters from './Gallery/GalleryFilters.vue';
import VariantCard from './Gallery/VariantCard.vue';
import VariantDetailsDialog from './Gallery/VariantDetailsDialog.vue';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const props = defineProps({
  isMobile: { type: Boolean, default: false }
});

const store = useConfiguratorStore();
const searchQuery = ref('');
const activeFilter = ref('ALL');
const sortBy = ref('name');
const viewMode = ref('grid'); 

const mobileDetailVariant = ref(null);
const isMobileDetailOpen = ref(false);

function showMobileDetails(variant) {
  mobileDetailVariant.value = variant;
  isMobileDetailOpen.value = true;
}

function formatPrice(variant) {
  if (variant.supplement > 0) return `+${variant.supplement}€`;
  if (variant.price > 0) return `${variant.price}€`;
  return 'Inclus';
}

// Filter Configuration
const activeFilterGroup = ref('ALL');

const shellBrands = computed(() => {
  const brands = [...new Set(store.shellVariants.map(v => v.brand).filter(b => b && b !== 'Unknown'))];
  return brands.map(brand => ({ id: `BRAND_${brand}`, label: brand, icon: '🏭' }));
});

const shellMolds = computed(() => {
  const molds = [...new Set(store.shellVariants.map(v => v.mold).filter(m => m))];
  const labels = { 'LaminatedReady': 'Laminé', 'IpsReady': 'IPS Ready', 'OemStandard': 'OEM' };
  return molds.map(mold => ({ id: `MOLD_${mold}`, label: labels[mold] || mold, icon: '🛠' }));
});

const screenBrands = computed(() => {
  const brands = [...new Set(store.screenVariants.map(v => v.brand).filter(b => b && b !== 'Unknown'))];
  return brands.map(brand => ({ id: `BRAND_${brand}`, label: brand, icon: '🏭' }));
});

const filtersConfig = computed(() => ({
  shell: {
    groups: [
      { id: 'ALL', label: 'Tout', icon: '◉' },
      { id: 'BRAND', label: 'Marque', icon: '🏭' },
      { id: 'MOLD', label: 'Type', icon: '🛠' }
    ],
    options: { BRAND: shellBrands.value, MOLD: shellMolds.value }
  },
  screen: {
    groups: [
      { id: 'ALL', label: 'Tout', icon: '◉' },
      { id: 'BRAND', label: 'Marque', icon: '🏭' },
      { id: 'TECH', label: 'Technologie', icon: '⚡' }
    ],
    options: { BRAND: screenBrands.value, TECH: [{ id: 'LAMINATED', label: 'Laminé', icon: '▣' }, { id: 'OEM', label: 'Original', icon: '▢' }] }
  },
  lens: {
    groups: [{ id: 'ALL', label: 'Tout', icon: '◉' }, { id: 'SIZE', label: 'Taille', icon: '📏' }],
    options: { SIZE: [{ id: 'STD', label: 'Standard', icon: '□' }, { id: 'LARGE', label: 'Large', icon: '▭' }] }
  }
}));

const currentVariants = computed(() => {
  switch (store.activeCategory) {
    case 'shell': return store.shellVariants;
    case 'screen': return store.screenVariants;
    case 'lens': return store.lensVariants;
    default: return [];
  }
});

const filteredVariants = computed(() => {
  let variants = [...currentVariants.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    variants = variants.filter(v => v.name.toLowerCase().includes(query));
  }
  if (activeFilter.value !== 'ALL') {
    if (store.activeCategory === 'shell') {
      if (activeFilter.value.startsWith('BRAND_')) variants = variants.filter(v => v.brand === activeFilter.value.replace('BRAND_', ''));
      else if (activeFilter.value.startsWith('MOLD_')) variants = variants.filter(v => v.mold === activeFilter.value.replace('MOLD_', ''));
    }
    else if (store.activeCategory === 'screen') {
      if (activeFilter.value === 'LAMINATED') variants = variants.filter(v => v.isLaminated);
      else if (activeFilter.value.startsWith('BRAND_')) variants = variants.filter(v => v.brand === activeFilter.value.replace('BRAND_', ''));
      else if (activeFilter.value === 'OEM') variants = variants.filter(v => v.id === null);
    }
    else if (store.activeCategory === 'lens') {
      if (activeFilter.value === 'LARGE') variants = variants.filter(v => v.id && v.id.includes('LRG'));
      if (activeFilter.value === 'STD') variants = variants.filter(v => v.id && v.id.includes('STD'));
    }
  }
  // 4. Smart Sort (Compatibility)
  if (store.smartSortEnabled) {
    variants.sort((a, b) => {
      const statusA = getCompatibility(a).status;
      const statusB = getCompatibility(b).status;

      // Define priority: OK (0) > WARNING (1) > FORBIDDEN (2)
      const score = (status) => {
        if (status === 'OK' || status === 'Yes') return 0;
        if (status === 'WARNING' || status === 'Cut') return 1;
        return 2; // FORBIDDEN / No
      };

      const scoreA = score(statusA);
      const scoreB = score(statusB);
      
      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }
      return 0; // Maintain existing order if status is same
    });
  }

  // 5. Standard Sorts (Name/Price) - applied *after* or *as secondary*?
  // User asked for "smart sort", usually this overrides standard sort or acts as primary. 
  // If active, it should be Primary. Name/Price becomes secondary.
  
  if (sortBy.value === 'name') variants.sort((a, b) => {
      if (store.smartSortEnabled) {
          const scoreA = getCompatibility(a).status === 'OK' ? 0 : (getCompatibility(a).status === 'WARNING' ? 1 : 2);
          const scoreB = getCompatibility(b).status === 'OK' ? 0 : (getCompatibility(b).status === 'WARNING' ? 1 : 2);
          if (scoreA !== scoreB) return scoreA - scoreB;
      }
      return a.name.localeCompare(b.name);
  });
  else if (sortBy.value === 'price-asc') variants.sort((a, b) => {
       if (store.smartSortEnabled) {
          const scoreA = getCompatibility(a).status === 'OK' ? 0 : (getCompatibility(a).status === 'WARNING' ? 1 : 2);
          const scoreB = getCompatibility(b).status === 'OK' ? 0 : (getCompatibility(b).status === 'WARNING' ? 1 : 2);
          if (scoreA !== scoreB) return scoreA - scoreB;
      }
      return (a.supplement || a.price || 0) - (b.supplement || b.price || 0);
  });
  else if (sortBy.value === 'price-desc') variants.sort((a, b) => {
       if (store.smartSortEnabled) {
          const scoreA = getCompatibility(a).status === 'OK' ? 0 : (getCompatibility(a).status === 'WARNING' ? 1 : 2);
          const scoreB = getCompatibility(b).status === 'OK' ? 0 : (getCompatibility(b).status === 'WARNING' ? 1 : 2);
          if (scoreA !== scoreB) return scoreA - scoreB;
      }
      return (b.supplement || b.price || 0) - (a.supplement || a.price || 0);
  });

  return variants;
});

function selectVariant(variant) {
  if (store.activeCategory === 'shell') store.selectShell(variant.id, variant.colorHex);
  if (store.activeCategory === 'screen') store.selectScreen(variant.id);
  if (store.activeCategory === 'lens') store.selectLens(variant.id);
}

function isActive(variant) {
  if (store.activeCategory === 'shell') return store.selectedShellVariantId === variant.id;
  if (store.activeCategory === 'screen') return store.selectedScreenVariantId === variant.id;
  if (store.activeCategory === 'lens') return store.selectedLensVariantId === variant.id;
  return false;
}

function getCompatibility(variant) {
  if (!variant) return { compatible: true, status: 'OK', reason: '' };
  
  // When viewing shells: check against selected screen (if any)
  if (store.activeCategory === 'screen') {
    // No shell selected yet = no compatibility to check
    if (!store.selectedShellParentId) return { compatible: true, status: 'OK', reason: '' };
    return store.checkCompatibility(store.selectedShellParentId, variant.screenId);
  }
  
  if (store.activeCategory === 'shell') {
    // No screen selected yet = no compatibility to check
    if (!store.selectedScreenParentId) return { compatible: true, status: 'OK', reason: '' };
    return store.checkCompatibility(variant.shellId, store.selectedScreenParentId);
  }
  
  return { compatible: true, status: 'OK', reason: '' };
}

watch(() => store.activeCategory, () => {
  activeFilter.value = 'ALL';
  activeFilterGroup.value = 'ALL';
  searchQuery.value = '';
});

watch(activeFilterGroup, (newVal) => {
  console.log('VariantGallery: activeFilterGroup changed to:', newVal, 'Current activeCategory:', store.activeCategory);
  console.log('VariantGallery: filtersConfig:', JSON.stringify(filtersConfig.value, null, 2));
  activeFilter.value = 'ALL';
});
// Logic to handle group change
function handleFilterGroupChange(val) {
  activeFilterGroup.value = val;
}

watch(activeFilterGroup, () => {
  activeFilter.value = 'ALL';
});
</script>

<template>
  <div class="flex flex-col w-full h-full relative overflow-hidden">
    
    <!-- Gallery Header (Hidden on Mobile) -->
    <GalleryHeader 
      v-if="!isMobile"
      v-model:searchQuery="searchQuery"
      v-model:sortBy="sortBy"
      v-model:viewMode="viewMode"
    />

    <!-- Filters Section (Hidden on Mobile) -->
    <GalleryFilters 
      v-if="!isMobile"
      :categories="categories"
      :activeCategory="store.activeCategory"
      :filtersConfig="filtersConfig"
      :activeFilterGroup="activeFilterGroup"
      :activeFilter="activeFilter"
      @update:filterGroup="handleFilterGroupChange"
      @update:filter="(val) => activeFilter = val"
    />

    <!-- Main Content (Scrollable Grid) -->
    <div 
      class="flex-1 overflow-y-auto custom-scrollbar"
      :class="{'flex flex-row overflow-x-auto overflow-y-hidden gap-3 p-4 items-center': isMobile}"
    >
      <!-- Grid View or Mobile Horizontal List -->
      <div 
        v-if="viewMode === 'grid' || isMobile" 
        :class="isMobile ? 'flex flex-row gap-3 min-w-max' : 'grid grid-cols-3 gap-2'"
      >
        <TooltipProvider v-for="variant in filteredVariants" :key="variant.id" :delay-duration="100">
           <Tooltip>
             <TooltipTrigger as-child>
                <div class="h-full"> <!-- Wrapper div to ensure event capture if Card is weird -->
                  <VariantCard 
                    :variant="variant"
                    :isActive="isActive(variant)"
                    :category="store.activeCategory"
                    :compatibility="getCompatibility(variant)"
                    :viewMode="isMobile ? 'mobile' : viewMode"
                    @select="selectVariant"
                    @show-details="showMobileDetails"
                  />
                </div>
             </TooltipTrigger>
             <!-- Tooltip Content (Replicates old VariantTooltip logic but via ShadCN) -->
             <TooltipContent 
               v-if="!isMobile" 
               side="right" 
               :side-offset="20"
               class="p-0 border-none bg-transparent shadow-none"
             >
                <!-- Reuse the styling logic from VariantTooltip but inline or imported -->
                <!-- We can actually just use a simple component here or inline the markup -->
                <div class="glass-premium border-neon-cyan/50 shadow-[0_0_40px_rgba(0,0,10,0.8)] w-[320px] overflow-hidden rounded-xl border bg-black/90">
                  <!-- Header -->
                   <div 
                     class="h-56 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center p-8 relative"
                     :style="store.activeCategory === 'shell' ? { backgroundColor: variant.colorHex + '20' } : {}"
                   >
                     <img v-if="variant.imageUrl" :src="variant.imageUrl" class="h-full object-contain brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                     <div class="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[7px] font-retro text-white/60 uppercase tracking-widest rounded-sm">
                       {{ variant.brand || 'OEM_SPEC' }}
                     </div>
                   </div>
                   <!-- Body -->
                   <div class="p-5 border-t border-white/5 bg-black/40">
                      <h4 class="font-title text-[11px] text-white leading-tight uppercase tracking-wider mb-2">{{ variant.fullName || variant.name }}</h4>
                      <p class="text-[9px] text-white/40 mb-4 leading-relaxed font-body uppercase tracking-tight">
                        {{ store.activeCategory === 'shell' && variant.isTransparent ? 'Translucent Finish' : 'Standard Opaque Finish' }}
                      </p>
                       <!-- Price -->
                       <div class="flex items-center justify-between pt-4 border-t border-white/5">
                          <span class="text-[8px] font-retro text-white/20 uppercase tracking-widest italic">BUILD_COST</span>
                          <span class="text-neo-orange font-title text-base font-bold tracking-tighter">{{ formatPrice(variant) }}</span>
                       </div>
                   </div>
                </div>
             </TooltipContent>
           </Tooltip>
        </TooltipProvider>
      </div>

      <!-- List View -->
      <div 
        v-else 
        class="flex flex-col gap-2"
      >
        <VariantCard 
          v-for="variant in filteredVariants"
          :key="variant.id"
          :variant="variant"
          :isActive="isActive(variant)"
          :category="store.activeCategory"
          :compatibility="getCompatibility(variant)"
          :viewMode="viewMode"
          @select="selectVariant"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredVariants.length === 0" class="flex flex-col items-center justify-center py-12 text-white/30">
         <span class="font-retro text-[10px] animate-pulse">NO_VARIANTS_FOUND</span>
      </div>
    </div>

    <!-- Results Count (Minimalist) -->
    <div class="px-4 py-2 text-[7px] font-retro flex justify-between items-center bg-black/40 border-t border-white/20">
      <div class="flex items-center gap-2">
         <span class="w-1 h-1 rounded-full bg-neo-orange animate-pulse"></span>
         <span class="text-white/60 uppercase tracking-widest">MATCHES: {{ filteredVariants.length }}</span>
      </div>
      <div class="text-white/40 uppercase tracking-[0.3em]">
        STREAMS_ACTIVE
      </div>
    </div>

    <!-- Mobile Detail Modal -->
    <VariantDetailsDialog 
      :variant="mobileDetailVariant"
      :category="store.activeCategory"
      :compatibility="mobileDetailVariant ? getCompatibility(mobileDetailVariant) : null"
      :isOpen="isMobileDetailOpen"
      @close="isMobileDetailOpen = false"
    />
  </div>
</template>

<style scoped>
.tooltip-enter-active, .tooltip-leave-active { transition: opacity 0.1s; }
.tooltip-enter-from, .tooltip-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: var(--color-grey-ultra-dark); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-neo-purple); border-radius: 0; }
</style>
