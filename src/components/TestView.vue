<template>
  <TresCanvas v-bind="state">
    <TresPerspectiveCamera :position="[0, 5, 15]" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.5" :color="'red'" />
    <TresMesh ref="boxRef" :position="[0, 2, 0]">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshNormalMaterial />
    </TresMesh>
    <TresMesh :geometry="mesh.geometry" :position="[0, 0, 0]">
      <TresMeshNormalMaterial />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" cast-shadow />
    <TresAxesHelper />
    <TresGridHelper :args="[100, 100, 0x444444, 'teal']" />
  </TresCanvas>
  <v-btn @click="modelmaker.downloadModelAsSTL(mesh, 'aaa')">
    Save as STL
  </v-btn>
</template>

<style scoped>
canvas {
  box-sizing: border-box;
}
</style>

<script lang="ts" setup>
import { TresCanvas, useRenderLoop } from "@tresjs/core";
import { reactive, shallowRef } from "vue";
import { BasicShadowMap, SRGBColorSpace, NoToneMapping } from "three";
import { ModelMaker, BaseCylinderGeometryOptions } from "./ModelMaker";
import { OrbitControls } from "@tresjs/cientos";
//import { TresLeches, useControls } from "@tresjs/leches";
import * as THREE from "three";

const state = reactive({
  clearColor: "#82DBC5",
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
});

//useControls("fpsgraph");

const { onLoop } = useRenderLoop();

const boxRef = shallowRef(null);
const modelmaker = new ModelMaker();
const cylinderop: BaseCylinderGeometryOptions = {
  radiusTop: 0.5,
  radiusBottom: 1,
  height: 1,
  radialSegments: 1000,
  heightSegments: 4,
};
const points = new Array<THREE.Vector3>();
const mesh = modelmaker.createCustomModel(cylinderop, points);

onLoop(({ elapsed }) => {
  if (boxRef.value) {
    boxRef.value.rotation.y = elapsed;
    boxRef.value.rotation.z = elapsed;
  }
});
/*
export default defineComponent({
  name: "ThreeComponent",
  setup() {
    const canvasContainer = ref<HTMLDivElement | null>(null);

    onMounted(() => {
      if (canvasContainer.value) {
        // Create a scene
        const scene = new THREE.Scene();

        // Create a camera
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(10, 10, 0);
        camera.lookAt(0, 0, 0);

        // Create a renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        canvasContainer.value.appendChild(renderer.domElement);

        // Create a cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({
          color: 0xff00f0,
          wireframe: true,
        }); // Set wireframe to true
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Create a grid
        const gridHelper = new THREE.GridHelper();
        scene.add(gridHelper);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          // Rotate the cube
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;

          // Render the scene with the camera
          renderer.render(scene, camera);
        };

        // Start the animation loop
        animate();
      }
    });

    return {
      canvasContainer,
    };
  },
});
*/
</script>
