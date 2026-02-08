<script setup>
import { computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';

const props = defineProps({
  variant: Object,
  category: String,
  compatibility: Object,
  isOpen: Boolean
});

const emit = defineEmits(['close', 'update:isOpen']);

// Sync internal dialog state with parent prop
const isOpenProxy = computed({
  get: () => props.isOpen,
  set: (val) => emit('close')
});

function formatPrice(variant) {
  if (variant.supplement > 0) return `+${variant.supplement}€`;
  if (variant.price > 0) return `${variant.price}€`;
  return 'Inclus';
}

function getVariantDescription(variant, category) {
  if (category === 'shell') {
    return variant.isTransparent 
      ? `Finition transparente. Effet cristal révélant l'intérieur.`
      : `Finition opaque. Plastique ABS haute qualité.`;
  }
  return `Composant ${category} certifié Rayboy.`;
}
</script>

<template>
  <Dialog v-model:open="isOpenProxy">
    <DialogContent class="sm:max-w-[425px] p-0 border-white/20 bg-black/80 backdrop-blur-xl text-white overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.2)]">
      
      <!-- Close Button Override -->
      <DialogClose class="absolute right-4 top-4 z-50 rounded-full bg-black/40 p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-white/20 text-white">
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogClose>

      <!-- Header Image Section -->
      <div 
        class="h-56 w-full flex items-center justify-center p-8 bg-gradient-to-b from-white/5 to-transparent relative"
        :style="category === 'shell' && variant ? { backgroundColor: variant.colorHex + '15' } : {}"
      >
        <img 
          v-if="variant?.imageUrl" 
          :src="variant.imageUrl" 
          class="h-full object-contain brightness-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-110" 
        />
        <div class="absolute top-6 left-6 px-3 py-1 bg-black/60 border border-white/10 text-[8px] font-retro text-white/80 uppercase tracking-[.3em] backdrop-blur-md">
           {{ variant?.brand || 'RAYBOY_CERTIFIED' }}
        </div>
      </div>

      <div class="p-6">
        <DialogHeader>
          <DialogTitle class="font-title text-lg uppercase tracking-widest text-white mb-2">
            {{ variant?.name }}
          </DialogTitle>
          <DialogDescription class="text-xs text-white/80 font-body uppercase tracking-wider leading-relaxed">
            {{ variant ? getVariantDescription(variant, category) : '' }}
          </DialogDescription>
        </DialogHeader>

        <!-- Compatibility Status -->
        <div v-if="compatibility" class="mt-6 mb-6">
           <div class="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
             <div class="text-lg">
               {{ compatibility.status === 'OK' ? '✅' : (compatibility.status === 'FORBIDDEN' ? '🚫' : '⚠️') }}
             </div>
             <div class="flex flex-col">
               <span class="text-[9px] font-retro uppercase tracking-wider text-white">Compatibility Check</span>
               <span 
                 class="text-[10px] uppercase font-bold tracking-tight"
                 :class="compatibility.status === 'OK' ? 'text-green-400' : (compatibility.status === 'FORBIDDEN' ? 'text-red-400' : 'text-neo-yellow')"
               >
                 {{ compatibility.reason || 'COMPONENT_COMPATIBLE' }}
               </span>
             </div>
           </div>
        </div>

        <DialogFooter class="flex items-center justify-between sm:justify-between pt-4 border-t border-white/20 mt-2">
           <div class="flex flex-col">
             <span class="text-[8px] font-retro text-white/50 uppercase tracking-widest">ESTIMATED_COST</span>
             <span class="text-neo-orange font-title text-xl font-bold">{{ variant ? formatPrice(variant) : '' }}</span>
           </div>
           
           <Button v-if="variant" variant="retro" @click="emit('close')" class="bg-neo-purple/20 border-neo-purple hover:bg-neo-purple hover:text-white">
             CONFIM_SELECTION
           </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>

