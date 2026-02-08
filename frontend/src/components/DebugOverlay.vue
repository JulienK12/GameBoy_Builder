<script setup>
import { useConfiguratorStore } from '@/stores/configurator';
import { ref, onMounted, onUnmounted } from 'vue';

const store = useConfiguratorStore();
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

const updateDims = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};

onMounted(() => window.addEventListener('resize', updateDims));
onUnmounted(() => window.removeEventListener('resize', updateDims));
</script>

<template>
  <div class="fixed top-0 left-0 bg-black/80 text-green-400 font-mono text-xs p-2 z-[9999] pointer-events-none opacity-70">
    <h3 class="font-bold border-b border-green-500 mb-1">DEBUG</h3>
    <div>Window: {{ windowWidth }}x{{ windowHeight }}</div>
    <div>Quote Open: {{ $parent.isQuoteOpen }}</div>
    <div>----------------</div>
    <div>Active Cat: {{ store.activeCategory }}</div>
    <div>Shell ID: {{ store.selectedShellVariantId || 'NULL' }}</div>
    <div>Screen ID: {{ store.selectedScreenVariantId || 'NULL' }}</div>
    <div>Quote: {{ store.quote ? store.quote.total_price + '€' : 'NULL' }}</div>
    <div>Error: {{ store.error || 'None' }}</div>
    <div>Cat Load: {{ store.catalogLoading }}</div>
    <div>Variant Count: {{ store.shellVariants.length }}</div>
  </div>
</template>
