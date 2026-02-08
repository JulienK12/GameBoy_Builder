<script setup>
import { useConfiguratorStore } from '@/stores/configurator';

const store = useConfiguratorStore();
const props = defineProps({
  searchQuery: String,
  sortBy: String,
  viewMode: String
});

const emit = defineEmits(['update:searchQuery', 'update:sortBy', 'update:viewMode']);

function updateSearch(val) { emit('update:searchQuery', val); }
function updateSort(val) { emit('update:sortBy', val); }
function toggleView(val) { emit('update:viewMode', val); }
</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 p-4 bg-grey-dark border-b-4 border-black">
    
    <!-- Search (Neo style) -->
    <div class="relative flex-1 group">
      <input 
        :value="searchQuery"
        @input="updateSearch($event.target.value)"
        type="text" 
        placeholder="SEARCH_VARIANTS..." 
        class="w-full bg-grey-medium border-2 border-black px-10 py-2 font-title text-xs text-white placeholder-white/30 focus:outline-none focus:border-neo-orange focus:shadow-[4px_4px_0px_black] transition-all"
      />
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-neo-orange">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Controls Group -->
    <div class="flex items-stretch gap-2 lg:gap-3">
      <!-- Smart Sort Toggle (Magic) -->
      <button 
        @click="store.smartSortEnabled = !store.smartSortEnabled"
        class="w-14 h-14 border-2 border-black flex items-center justify-center relative overflow-hidden group transition-all"
        :class="store.smartSortEnabled ? 'bg-neo-purple text-white shadow-[3px_3px_0px_black] -translate-y-0.5' : 'bg-grey-medium text-white/40 hover:text-white hover:bg-grey-medium/80'"
      >
        <span class="text-2xl group-hover:scale-110 transition-transform duration-300 relative z-10">🪄</span>
        <div v-if="store.smartSortEnabled" class="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
        
        <!-- Tooltip -->
        <span class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-title px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20 z-50 shadow-lg">
          SMART SORT
        </span>
      </button>

      <!-- Reset Button (Neo) -->
      <button 
        @click="store.resetConfig()"
        class="w-14 h-14 border-2 border-black flex items-center justify-center relative overflow-hidden group transition-all bg-grey-medium text-white/40 hover:text-red-500 hover:bg-grey-medium/80"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 relative z-10 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        
        <!-- Tooltip -->
        <span class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-title px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20 z-50 shadow-lg">
          RESET CONFIG
        </span>
      </button>

      <!-- Sort Select (Icon Only) -->
      <div class="relative w-14 h-14 group">
        <div class="absolute inset-0 border-2 border-black bg-grey-medium flex items-center justify-center transition-all group-hover:text-white text-white/40">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        </div>
        <!-- Invisible Select -->
        <select 
          :value="sortBy"
          @change="updateSort($event.target.value)"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          title="Sort Variants"
        >
          <option value="name">Name (A-Z)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
        <!-- Tooltip -->
        <span class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-title px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20 z-50 shadow-lg">
          SORT ORDER
        </span>
      </div>

      <!-- View Toggle (Buttons style) -->
      <div class="flex shadow-[3px_3px_0px_black]">
        <button 
          @click="toggleView('grid')"
          class="w-14 h-14 border-2 border-black flex items-center justify-center relative overflow-hidden group transition-all"
          :class="viewMode === 'grid' ? 'bg-neo-purple text-white shadow-none' : 'bg-grey-medium text-white/40 hover:text-white border-r-0'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <div v-if="viewMode === 'grid'" class="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
          <!-- Tooltip -->
          <span class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-title px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20 z-50 shadow-lg">
            GRID VIEW
          </span>
        </button>
        <button 
          @click="toggleView('list')"
          class="w-14 h-14 border-2 border-black flex items-center justify-center relative overflow-hidden group transition-all border-l-0"
          :class="viewMode === 'list' ? 'bg-neo-purple text-white shadow-none' : 'bg-grey-medium text-white/40 hover:text-white'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <div v-if="viewMode === 'list'" class="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
           <!-- Tooltip -->
          <span class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-title px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20 z-50 shadow-lg">
            LIST VIEW
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
