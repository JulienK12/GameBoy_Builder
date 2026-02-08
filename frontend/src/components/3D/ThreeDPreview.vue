<script setup>
import { ref, watch, onMounted, shallowRef, markRaw } from 'vue';
import { TresCanvas } from '@tresjs/core';
import { OrbitControls, ContactShadows } from '@tresjs/cientos';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { MeshPhysicalMaterial, Color, Box3, Vector3, MathUtils } from 'three';

const props = defineProps({
  shellColor: { type: String, default: '#8B5CF6' },
  isTransparent: { type: Boolean, default: true },
  variantId: { type: String, default: 'VAR_SHELL_GBC_FP_ATOMIC_PURPLE' },
  // New props for independent part colors
  partsColors: {
    type: Object,
    default: () => ({
      shell_front: '#8B5CF6',
      shell_back: '#8B5CF6',
      lens: '#1a1a1a',
      button_a: '#ff0000',
      button_b: '#ff0000',
      button_dpad: '#333333',
      buttons_start_select: '#333333'
    })
  },
  activeVerificationGroup: {
    type: String,
    default: null // If set, only this group will be colored, others will be grey/ghosted
  }
});

const isWebGLAvailable = ref(true);
const model = shallowRef(null);
const errorMessage = ref(null);
// We'll keep currentColor for the main shell lerp, but for now focus on the grouping
const currentColor = ref(null); 
const targetColor = ref(null);
const colorLerpProgress = ref(1);

const cameraZ = ref(15);
const cameraFov = ref(35);

function fitModelToCamera() {
    if (!model.value) return;

    // 1. Ensure world matrix is up to date
    model.value.updateMatrixWorld(true);

    // 2. Calculate Bounding Box
    const box = new Box3().setFromObject(model.value);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    // 3. Final alignment: verify model is centered at [0,0,0]
    // model.value.position.sub(center); 

    // 4. Calculate distance required to fit
    const aspect = window.innerWidth / window.innerHeight;
    const fovRad = MathUtils.degToRad(cameraFov.value);
    
    // Frustum geometry math:
    // How far back do we need to be to see the HEIGHT?
    const distForHeight = (size.y / 2) / Math.tan(fovRad / 2);
    // How far back do we need to be to see the WIDTH? (accounting for aspect ratio)
    const distForWidth = (size.x / 2) / Math.tan(fovRad / 2) / aspect;
    
    // We take the max of both + 45% margin for "breathing room" (luxury spacing)
    let distance = Math.max(distForHeight, distForWidth) * 1.45;
    
    // Safety constraints (Allowing extensive dezoom)
    distance = Math.max(5, Math.min(50, distance));
    
    cameraZ.value = distance;
    console.log(`📐 High-Precision Framing: Size=[${size.x.toFixed(2)}, ${size.y.toFixed(2)}], Aspect=${aspect.toFixed(2)} -> TargetZ=${distance.toFixed(2)}`);
}

onMounted(async () => {
  try {
    const canvas = document.createElement('canvas');
    isWebGLAvailable.value = !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      
    if (isWebGLAvailable.value) {
        console.log("🚀 Starting GLTF load...");
        
        const loader = new GLTFLoader();
        
        try {
            // Using gbc.glb which has better named parts
            const gltf = await loader.loadAsync('/models/gbc.glb');
            
            let scene = gltf.scene || (gltf.scenes && gltf.scenes[0]);
            
            if (!scene) {
                 throw new Error(`Structure GLB invalide`);
            }

            const loadedModel = markRaw(scene);
            
            // SCALE NORMALIZATION:
            // Standardize model size so distance math is predictable 
            // Most Game Boy Color assets fit well within a 10-unit box
            const initialBox = new Box3().setFromObject(loadedModel);
            const initialSize = initialBox.getSize(new Vector3());
            const maxDim = Math.max(initialSize.x, initialSize.y, initialSize.z);
            const targetSize = 8.5; // Target height
            const scaleFactor = targetSize / maxDim;
            loadedModel.scale.setScalar(scaleFactor);
            loadedModel.updateMatrixWorld(true);

            // CENTERING:
            const box1 = new Box3().setFromObject(loadedModel);
            const center1 = box1.getCenter(new Vector3());
            loadedModel.position.sub(center1);
            
            model.value = loadedModel;
            updateMaterials();
            
        } catch (loadErr) {
            console.error("❌ Loader failed:", loadErr);
            throw loadErr;
        }
        fitModelToCamera();
        window.addEventListener('resize', fitModelToCamera);
    }
  } catch (e) {
    isWebGLAvailable.value = false;
    errorMessage.value = e.message || "Erreur de chargement";
    console.error("WebGL/Loading error:", e);
  }
});

function getPartGroup(name) {
    const n = name.toLowerCase();
    if (n.includes('shell_low') || n.includes('front')) return 'shell_front';
    if (n.includes('back_low')) return 'shell_back';
    if (n.includes('screen')) return 'lens';
    if (n.includes('a_button')) return 'button_a';
    if (n.includes('b_button')) return 'button_b';
    if (n.includes('directional')) return 'button_dpad';
    if (n.includes('start') || n.includes('select')) return 'buttons_start_select';
    return null;
}

function updateMaterials() {
    if (!model.value) return;
    
    try {
        model.value.traverse((child) => {
            if (child.isMesh) {
                const name = child.name;
                const group = getPartGroup(name);
                
                if (group) {
                    console.log(`✨ Grouping detected: ${name} -> ${group}`);
                    
                    let groupColor = props.partsColors[group] || props.shellColor;
                    let opacity = 1.0;
                    
                    // IF we are in verification mode
                    if (props.activeVerificationGroup) {
                        if (group === props.activeVerificationGroup) {
                            groupColor = '#00FF00'; // Pure Green for the one we are checking
                            opacity = 1.0;
                        } else {
                            groupColor = '#333333'; // Dark grey for others
                            opacity = 0.2;
                        }
                    }

                    const isShell = group.startsWith('shell');
                    
                    child.material = new MeshPhysicalMaterial({
                        color: new Color(groupColor),
                        transmission: (isShell && props.isTransparent && !props.activeVerificationGroup) ? 0.95 : 0,
                        opacity: opacity,
                        transparent: opacity < 1.0 || (isShell && props.isTransparent && !props.activeVerificationGroup),
                        roughness: group === 'lens' ? 0.05 : (isShell ? 0.15 : 0.6),
                        metalness: group === 'lens' ? 0.1 : (isShell ? 0.05 : 0.0),
                        clearcoat: (isShell && !props.activeVerificationGroup) ? 1.0 : 0.0,
                        clearcoatRoughness: 0.1,
                        ior: group === 'lens' ? 1.5 : 1.45,
                        thickness: isShell ? 0.1 : 0,
                        specularIntensity: 0.8,
                        specularColor: new Color('#ffffff'),
                        envMapIntensity: 1.5
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.visible = true;
                } else {
                    // Hide internal parts or decoration that doesn't fit the groups
                    // (Unless it's something important we missed)
                    const keep = name.toLowerCase().includes('logo') || name.includes('nintendo');
                    if (!keep) {
                        // child.visible = false; 
                    }
                }
            }
        });
    } catch (err) {
        console.error("Materials error:", err);
    }
}

// Smooth color transition with lerp
function lerpToColor(newColorHex) {
  if (!currentColor.value) {
    currentColor.value = new Color(newColorHex);
    targetColor.value = new Color(newColorHex);
    return;
  }
  
  targetColor.value = new Color(newColorHex);
  colorLerpProgress.value = 0;
  
  const animate = () => {
    if (colorLerpProgress.value < 1) {
      colorLerpProgress.value = Math.min(1, colorLerpProgress.value + 0.05); // 20 frames = ~300ms at 60fps
      
      const lerpedColor = currentColor.value.clone().lerp(
        targetColor.value, 
        MathUtils.smoothstep(colorLerpProgress.value, 0, 1)
      );
      
      // Apply lerped color to all shell materials
      if (model.value) {
        model.value.traverse((child) => {
          if (child.isMesh) {
            const name = child.name.toLowerCase();
            if (name.includes('shell') || name.includes('back') || name.includes('front') || name.includes('body')) {
              child.material.color.copy(lerpedColor);
            }
          }
        });
      }
      
      requestAnimationFrame(animate);
    } else {
      currentColor.value.copy(targetColor.value);
    }
  };
  
  requestAnimationFrame(animate);
}

// Watch for color changes and trigger smooth transition
watch(() => props.shellColor, (newColor) => {
  lerpToColor(newColor);
});

// Watch for transparency changes
watch(() => props.isTransparent, () => {
  updateMaterials();
});

// Watch for verification changes
watch(() => props.activeVerificationGroup, () => {
  updateMaterials();
});
</script>

<template>
  <div class="w-full h-full relative" style="background-color: var(--color-grey-ultra-dark)">
    
    <!-- 3D Canvas -->
    <TresCanvas 
      v-if="isWebGLAvailable && model" 
      clear-color="#050508" 
      shadows
      alpha
      power-preference="high-performance"
    >
      <TresPerspectiveCamera :position="[0, 1, cameraZ]" :fov="cameraFov" :look-at="[0, 0, 0]" />

      <!-- Showroom Lights -->
      <TresAmbientLight :intensity="0.8" />
      
      <!-- Key Light (Dramatic) -->
      <TresSpotLight 
        :position="[5, 8, 5]" 
        :intensity="150" 
        :angle="0.4"
        :penumbra="0.5"
        cast-shadow 
        color="#ffffff"
      />

      <!-- Rim Lights (Neon Accents) -->
      <TresDirectionalLight :position="[-5, 5, -5]" :intensity="15.0" color="#7C3AED" />
      <TresDirectionalLight :position="[5, -2, 5]" :intensity="8.0" color="#00E5FF" />
      
      <!-- Top Soft Light -->
      <TresRectAreaLight 
        :position="[0, 10, 0]" 
        :args="['#ffffff', 10, 10, 10]" 
        :look-at="[0, 0, 0]"
      />

      <!-- Ground & Shadows -->
      <ContactShadows
        :position="[0, -4.5, 0]"
        :opacity="0.6"
        :blur="2.5"
        :far="10"
        :resolution="512"
      />
      
      <TresGridHelper :args="[40, 40, '#1A1A2E', '#0D0D1A']" :position="[0, -4.6, 0]" :opacity="0.3" />

      <primitive :object="model" />
      
      <OrbitControls 
        :enableDamping="true" 
        :dampingFactor="0.05"
        :minDistance="3"
        :maxDistance="50"
        :autoRotate="false"
        :enablePan="false"
        :target="[0, 0, 0]"
      />
    </TresCanvas>

    <!-- Loading State -->
    <div v-else-if="isWebGLAvailable && !model" class="w-full h-full flex flex-col items-center justify-center">
        <div class="w-12 h-12 border-4 border-neo-purple border-t-neo-orange animate-spin mb-4"></div>
        <p class="text-neo-orange font-retro text-[10px] animate-pulse">LOADING_NEO_CORE...</p>
    </div>

    <!-- Error State -->
    <div v-else class="w-full h-full flex flex-col items-center justify-center">
        <p class="text-neo-orange font-retro text-[10px] mb-2 font-bold">ERROR::WEBGL_INACTIVE</p>
        <p class="text-white/40 text-[9px] px-4 text-center">{{ errorMessage }}</p>
    </div>
  </div>
</template>

