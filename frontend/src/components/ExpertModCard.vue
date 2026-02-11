<!-- ExpertModCard.vue - Carte de sélection d'un mod expert (Story 2.2 Task 7, 2.3 Task 10) -->
<script setup>
import { computed } from 'vue';
import { useConfiguratorStore } from '@/stores/configurator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const props = defineProps({
  mod: {
    type: Object,
    required: true,
    // { id, name, category, price, technical_specs, power_requirements, description, tooltip_content, dependencies, ... }
  },
  category: {
    type: String,
    required: true,
    // 'cpu' | 'audio' | 'power'
  },
});

const store = useConfiguratorStore();

const isSelected = computed(() => store.selectedExpertOptions?.[props.category] === props.mod.id);

const isPending = computed(() => store.pendingSelections?.[props.category] === props.mod.id);

const isSuccess = computed(() => {
  const s = store.lastSuccessSelection;
  if (!s) return false;
  return s.category === props.category && s.modId === props.mod.id && Date.now() < s.until;
});

/** Indicateur de dépendance non satisfaite (AC #5) : au moins une dépendance du mod n'est pas dans la config actuelle */
const hasDependencyWarning = computed(() => {
  const deps = props.mod.dependencies;
  if (!deps || !Array.isArray(deps) || deps.length === 0) return false;
  const selected = store.selectedExpertOptions || {};
  const selectedIds = [selected.cpu, selected.audio, selected.power].filter(Boolean);
  return deps.some((depId) => !selectedIds.includes(depId));
});

/** Specs techniques affichables (objet JSON → lignes clé: valeur) */
const technicalSpecsLines = computed(() => {
  const specs = props.mod.technical_specs;
  if (!specs || typeof specs !== 'object') return [];
  return Object.entries(specs).map(([k, v]) => ({ key: k, value: v }));
});

function select() {
  store.selectExpertMod(props.category, props.mod.id);
}
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          type="button"
          class="w-full text-left p-3 rounded-lg border-2 transition-all duration-200 glass-premium"
          :class="[
            isSelected
              ? 'border-neo-orange bg-neo-orange/20 shadow-neo-glow-orange'
              : 'border-white/20 hover:border-white/40',
            isPending && 'animate-pulse border-blue-500/50 bg-blue-500/10',
            isSuccess && 'border-green-500/50 bg-green-500/20',
          ]"
          :aria-pressed="isSelected"
          :aria-busy="isPending"
          :aria-describedby="hasDependencyWarning ? `expert-warning-${mod.id}` : undefined"
          @click="select()"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="font-retro text-[10px] uppercase tracking-widest text-white/90 truncate">
                {{ mod.name }}
              </div>
              <div class="text-[10px] text-neo-orange mt-0.5">
                {{ mod.price }}€
              </div>
              <!-- Specs techniques (AC #2) -->
              <div v-if="technicalSpecsLines.length > 0" class="mt-2 space-y-0.5">
                <div
                  v-for="line in technicalSpecsLines"
                  :key="line.key"
                  class="text-[8px] text-white/60 uppercase tracking-wider"
                >
                  {{ line.key }}: {{ line.value }}
                </div>
              </div>
              <!-- Exigences alimentation (AC #2) -->
              <div
                v-if="mod.power_requirements"
                class="mt-1 text-[8px] text-white/50 uppercase tracking-wider"
              >
                Alim. {{ mod.power_requirements }}
              </div>
            </div>
            <!-- Indicateur dépendance non satisfaite (AC #5) -->
            <span
              v-if="hasDependencyWarning"
              :id="`expert-warning-${mod.id}`"
              class="flex-shrink-0 text-orange-400"
              aria-label="Dépendance non satisfaite"
              title="Dépendance non satisfaite"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </span>
            <!-- Pending (Story 2.3) -->
            <span
              v-else-if="isPending"
              class="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/80 animate-pulse"
              aria-hidden="true"
            />
            <!-- Success (Story 2.3) -->
            <span
              v-else-if="isSuccess"
              class="flex-shrink-0 text-green-400"
              aria-hidden="true"
              title="Validé"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        :side-offset="12"
        class="max-w-xs p-4 glass-premium border border-white/20 rounded-xl text-left text-xs text-white/90 space-y-2"
      >
        <p class="font-retro uppercase tracking-widest text-neo-orange mb-2">{{ mod.name }}</p>
        <p class="text-white/80">{{ mod.tooltip_content || mod.description }}</p>
        <p v-if="hasDependencyWarning" class="text-orange-400 font-retro uppercase tracking-wider">
          Dépendance manquante : sélectionnez les options requises (ex. batterie).
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
