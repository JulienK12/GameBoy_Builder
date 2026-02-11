<!-- GlitchEffect.vue - Effet visuel Cyberpunk pour erreurs (Story 2.3) -->
<script setup>
import { watch, ref } from 'vue';

const props = defineProps({
    trigger: {
        type: Boolean,
        default: false,
    },
});

const isActive = ref(false);

watch(() => props.trigger, (newVal) => {
    if (newVal) {
        isActive.value = true;
        // Réinitialiser après l'animation (500ms, aligné avec configurator GLITCH_DURATION_MS)
        setTimeout(() => {
            isActive.value = false;
        }, 500);
    }
});
</script>

<template>
    <Transition name="glitch">
        <div
            v-if="isActive"
            class="glitch-effect fixed inset-0 pointer-events-none z-[100]"
            aria-hidden="true"
        >
            <!-- Overlay de distorsion -->
        </div>
    </Transition>
</template>

<style scoped>
/* Animation Glitch Cyberpunk */
@keyframes glitch {
    0% {
        transform: translate(0);
        filter: hue-rotate(0deg);
    }
    20% {
        transform: translate(-2px, 2px) skew(2deg);
        filter: hue-rotate(90deg);
    }
    40% {
        transform: translate(-2px, -2px) skew(-2deg);
        filter: hue-rotate(180deg);
    }
    60% {
        transform: translate(2px, 2px) skew(2deg);
        filter: hue-rotate(270deg);
    }
    80% {
        transform: translate(2px, -2px) skew(-2deg);
        filter: hue-rotate(360deg);
    }
    100% {
        transform: translate(0);
        filter: hue-rotate(0deg);
    }
}

.glitch-effect {
    background: rgba(255, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    animation: glitch 0.5s ease-in-out;
    box-shadow: 0 0 20px rgba(255, 69, 0, 0.5) inset;
}

/* Transition Vue */
.glitch-enter-active,
.glitch-leave-active {
    transition: opacity 0.3s ease-out;
}

.glitch-enter-from,
.glitch-leave-to {
    opacity: 0;
}
</style>
