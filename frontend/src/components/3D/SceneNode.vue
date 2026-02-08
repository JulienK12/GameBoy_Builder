<script setup>
import { ref } from 'vue';

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 }
});

const isExpanded = ref(true);

function toggleExpand() {
  if (props.node.children && props.node.children.length > 0) {
    isExpanded.value = !isExpanded.value;
  }
}

function toggleVisibility() {
  props.node.visible = !props.node.visible;
}

const hasChildren = props.node.children && props.node.children.length > 0;
const isMesh = props.node.isMesh;
</script>

<template>
  <div class="scene-node text-white/80 font-retro text-[9px] selection:bg-transparent">
    <div 
      class="flex items-center gap-2 py-1 px-2 hover:bg-white/5 transition-colors cursor-pointer group"
      :style="{ paddingLeft: (depth * 12 + 8) + 'px' }"
      @click.stop="toggleExpand"
    >
      <!-- Expand Icon -->
      <span v-if="hasChildren" class="w-3 h-3 flex items-center justify-center text-neo-orange/50">
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span v-else class="w-3 h-3"></span>

      <!-- Type Icon -->
      <span class="opacity-40">
        {{ isMesh ? '⊡' : '📁' }}
      </span>

      <!-- Name -->
      <span 
        class="truncate flex-1" 
        :class="{ 'text-neo-orange font-bold': !node.visible, 'opacity-100': node.visible, 'opacity-40': !node.visible }"
      >
        {{ node.name || 'Sans nom' }}
      </span>

      <!-- Visibility Toggle -->
      <button 
        @click.stop="toggleVisibility"
        class="px-2 py-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        :class="{ '!opacity-100 text-neo-orange': !node.visible, 'text-white/40': node.visible }"
      >
        {{ node.visible ? '👁' : 'Ø' }}
      </button>
    </div>

    <!-- Recursive Children -->
    <div v-if="hasChildren && isExpanded" class="border-l border-white/5 ml-3">
      <SceneNode 
        v-for="child in node.children" 
        :key="child.uuid" 
        :node="child" 
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<style scoped>
.scene-node {
  user-select: none;
}
</style>
