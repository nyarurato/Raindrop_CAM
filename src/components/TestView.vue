<template>
  <Suspense>
    <TresCanvas v-bind="state">
      <TresPerspectiveCamera :position="[0, 5, 15]" />
      <OrbitControls />
      <TresAmbientLight :intensity="0.5" :color="'red'" />
      <!-- 半透明 -->
      <TresMesh :geometry="mesh.geometry" :position="[0, 2, 0]">
        <TresMeshBasicMaterial
          :color="cylinder_color"
          :wireframe="false"
          :transparent="true"
          :opacity="0.1"
        />
      </TresMesh>
      <!-- 線 -->
      <TresLineSegments :position="[0, 2, 0]">
        <TresEdgesGeometry :args="[mesh.geometry]" />
        <TresLineBasicMaterial color="black" />
      </TresLineSegments>

      <!-- 曲線デバッグ -->
      <Line2 :points="points2" :color="line_color" />
      <Line2 :points="points3" :color="line_color2" />
      <Line2 :points="pp" :color="'cyan'" />

      <!-- まで曲線デバッグ -->
      <!-- 面表示 -->
      <TresMesh :geometry="test_plane_geo" :position="[0, 2, 0]">
        <TresMeshBasicMaterial
          :args="[{ color: 0x00ff00, side: THREE.DoubleSide }]"
        />
      </TresMesh>

      <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" cast-shadow />
      <TresAxesHelper :args="[2]" />
      <TresGridHelper :args="[100, 100, 0x444444, 'teal']" />
    </TresCanvas>
  </Suspense>
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
import { TresCanvas, useRenderLoop, extend } from "@tresjs/core";
import { reactive, shallowRef } from "vue";
import { BasicShadowMap, SRGBColorSpace, NoToneMapping } from "three";
import { ModelMaker, BaseCylinderGeometryOptions } from "./ModelMaker";
import { OrbitControls, Line2 } from "@tresjs/cientos";
//import { TresLeches, useControls } from "@tresjs/leches";
import * as THREE from "three";

import { NURBSPath } from "./CAM/Path";
import { Rotary3DBuilder, Section } from "./CAM/Sections";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";

extend({ ParametricGeometry });

const state = reactive({
  clearColor: "#82DBC5",
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
});

//useControls("fpsgraph");

const { onLoop } = useRenderLoop();

const modelmaker = new ModelMaker();
const cylinderop: BaseCylinderGeometryOptions = {
  radiusTop: 1.5,
  radiusBottom: 1.5,
  height: 5,
  radialSegments: 10,
  heightSegments: 1,
};

const points = new Array<THREE.Vector3>();
const mesh = modelmaker.createCustomModel(cylinderop, points);

const cylinder_color = new THREE.Color(0xcccccc);
const cylinder_color2 = new THREE.Color(0x000000);

const line_color = new THREE.Color(0xff0000);
const line_color2 = new THREE.Color(THREE.Color.NAMES.blue);

const points2: THREE.Vector2[] = [
  new THREE.Vector2(0.2, -0.5),
  new THREE.Vector2(1, 0),
  new THREE.Vector2(0.7, 1),
  new THREE.Vector2(0.7, 2),
  new THREE.Vector2(0.2, 4),
];
const path = new NURBSPath(points2);
const pp = path.GetNurbsCurve().getPoints(100);
const section = new Section(new THREE.Vector3(0, 0, 0), path);
section.setProjectionPlane(new THREE.Vector3(1, 0, 0));
const nubsc = section.convertTo3D();
const points3 = nubsc.controlPoints.map(
  (p) => new THREE.Vector3(p.x, p.y, p instanceof THREE.Vector2 ? 0 : p.z)
);

const test_plane_geo = section.getPlaneGeometry();
/*
onLoop(({ elapsed }) => {
  if (boxRef.value) {
    boxRef.value.rotation.y = elapsed;
    boxRef.value.rotation.z = elapsed;
  }
});
*/
</script>
