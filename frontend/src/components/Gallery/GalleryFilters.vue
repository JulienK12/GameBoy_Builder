<script setup>
const props = defineProps({
  categories: Object,
  activeCategory: String,
  filtersConfig: Object,
  activeFilterGroup: String,
  activeFilter: String
});

const emit = defineEmits(['update:filterGroup', 'update:filter']);

function selectGroup(id) {
  emit('update:filterGroup', id);
}
function selectFilter(id) {
  if (props.activeFilter === id) {
    emit('update:filter', 'ALL');
  } else {
    emit('update:filter', id);
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4 bg-grey-dark/80">
    <!-- Level 1: Groups (Tout, Marque, Type...) -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="group in (filtersConfig[activeCategory]?.groups || [])"
        :key="group.id"
        :data-testid="'filter-group-' + group.id"
        :title="'Filter by ' + group.label"
        @click="selectGroup(group.id)"
        class="px-4 py-1.5 font-bold text-[10px] uppercase tracking-wider transition-all border-2 border-black shadow-[2px_2px_0px_black] active:translate-y-[2px] active:shadow-none"
        :class="activeFilterGroup === group.id
          ? 'bg-neo-purple text-white'
          : 'bg-grey-medium text-white/80 hover:text-white'"
      >
        <span class="mr-2 opacity-100">{{ group.icon }}</span>
        {{ group.label }}
      </button>
    </div>

    <!-- Level 2: Specific Options (FunnyPlaying, Laminated...) -->
    <Transition name="fade-slide">
      <div 
        v-if="activeFilterGroup !== 'ALL' && filtersConfig[activeCategory]?.options?.[activeFilterGroup]" 
        class="flex flex-wrap gap-2 pl-4 border-l-2 border-neo-orange/50"
        data-testid="filter-options-container"
      >
        <button 
          v-for="filter in filtersConfig[activeCategory].options[activeFilterGroup]"
          :key="filter.id"
          @click="selectFilter(filter.id)"
          :data-testid="'filter-option-' + filter.id"
          :title="'Select ' + filter.label"
          class="px-3 py-1 font-bold text-[9px] uppercase tracking-tighter transition-all border-2 border-black"
          :class="activeFilter === filter.id 
            ? 'bg-neo-orange text-black shadow-[3px_3px_0px_black]' 
            : 'bg-black text-white/70 hover:text-white'"
        >
          <span class="mr-1.5 opacity-80">{{ filter.icon }}</span>
          {{ filter.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
