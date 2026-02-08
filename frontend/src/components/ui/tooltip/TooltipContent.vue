<script setup lang="ts">
import { TooltipContent, TooltipPortal, type TooltipContentEmits, type TooltipContentProps, useForwardPropsEmits } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<TooltipContentProps & { class?: string }>()
const emits = defineEmits<TooltipContentEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <TooltipPortal to="body">
    <TooltipContent
      v-bind="forwarded"
      :class="cn('z-[9999] overflow-visible rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', props.class)"
    >
      <slot />
    </TooltipContent>
  </TooltipPortal>
</template>
