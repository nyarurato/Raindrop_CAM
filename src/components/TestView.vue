<template>
  <!--<Suspense>-->
  <TresCanvas v-bind="state" class="canvas3d">
    <Stats />
    <OrbitControls />
    <TresPerspectiveCamera
      :position="[
        0,
        Param.stocks.value[0].height * 1.5,
        Param.stocks.value[0].radius * 3,
      ]"
      :fov="75"
      :near="0.1"
      :far="5000"
    />

    <!-- Stock -->
    <!-- 半透明 -->
    <TresMesh
      :geometry="mesh.geometry"
      :position="cylinder_position"
      v-if="is_checked_stock"
    >
      <TresMeshBasicMaterial
        :color="cylinder_color"
        :wireframe="false"
        :transparent="true"
        :opacity="0.1"
      />
    </TresMesh>
    <!-- 線 -->
    <TresLineSegments :position="cylinder_position" v-if="is_checked_stock">
      <TresEdgesGeometry :args="[mesh.geometry]" />
      <TresLineBasicMaterial color="black" />
    </TresLineSegments>

    <!-- Stock ここまで-->

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

    <!--ボクセル表示-->
    <primitive v-if="show_voxel" :object="voxel_group" />
    <!--ここまでボクセル表示-->

    <TresAmbientLight :intensity="1" />
    <TresAxesHelper :args="[Param.stocks.value[0].radius / 2]" />
    <!--<TresGridHelper :args="grid_arg" />-->
  </TresCanvas>
  <!--</Suspense>-->

  <v-card>
    <v-card-title class="text-h6">表示設定</v-card-title>
    <v-row>
      <v-col>
        <v-checkbox label="ストック" v-model="is_checked_stock"></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          label="断面"
          v-model="is_checked_section"
          disabled
        ></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          label="パス"
          v-model="is_checked_path"
          disabled
        ></v-checkbox>
      </v-col>
    </v-row>
    <v-row v-if="simulator.is_exist_voxel">
      <v-col>
        <v-row class="justify-center">
          <v-btn @click="createVoxelModel(simulator.voxel_data)"
            >シミュレーション結果描画</v-btn
          >
        </v-row>
        <v-row>
          <v-spacer></v-spacer>
          <v-col>
            <v-checkbox
              label="除去部"
              v-model="show_removed_voxel"
            ></v-checkbox>
          </v-col>

          <v-col>
            <v-checkbox label="残部" v-model="show_remain_voxel"></v-checkbox>
          </v-col>
          <v-spacer></v-spacer>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts" setup>
import { TresCanvas, useRenderLoop, extend } from "@tresjs/core";
import { onMounted, onUnmounted, reactive, shallowRef } from "vue";
import {
  BasicShadowMap,
  SRGBColorSpace,
  NoToneMapping,
  OrthographicCamera,
} from "three";
import { ModelMaker, BaseCylinderGeometryOptions } from "./ModelMaker";
import { OrbitControls, Line2 } from "@tresjs/cientos";
//import { TresLeches, useControls } from "@tresjs/leches";
import * as THREE from "three";

import { NURBSPath } from "./CAM/Path";
import { Rotary3DBuilder, Section } from "./CAM/Sections";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";

extend({ ParametricGeometry });

import { Stats } from "@tresjs/cientos";
import { ref, inject, watch } from "vue";
import { ReactiveParameters } from "./CAM/Parameters";

import { CLData } from "./CAM/MainProcessor/CL";
import { Simulator } from "./Simulation/Simulator";

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

const simulator = inject("simulator") as Simulator;

const is_checked_stock = ref(true);
const is_checked_section = ref(false);
const is_checked_path = ref(false);

const state = reactive({
  clearColor: "#333333",
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  renderMode: "on-demand" as "on-demand" | "always" | "manual",
});

const { onLoop } = useRenderLoop();

const grid_arg = [Param.stocks.value[0].radius * 4, 50];

const modelmaker = new ModelMaker();
const cylinderop: BaseCylinderGeometryOptions = {
  radiusTop: Param.stocks.value[0].radius,
  radiusBottom: Param.stocks.value[0].radius,
  height: Param.stocks.value[0].height,
  radialSegments: 20,
  heightSegments: 1,
};

const cylinder_position = new THREE.Vector3(
  0,
  Param.stocks.value[0].height / 2,
  0
);

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

const voxel_group = new THREE.Group();
const show_voxel = ref(false);
const show_removed_voxel = ref(true);
const show_remain_voxel = ref(true);

const is_calculating = ref(false);

function createVoxelModel(data: Array<Array<Array<boolean>>>) {
  console.log("createVoxelModel");
  is_calculating.value = true;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.1,
    //wireframe: true,
  });
  const material_erase = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.1,
    //wireframe: true,
  });
  const all_item = data.length * data[0].length * data[0][0].length;
  const voxelGeometry = new THREE.InstancedMesh(geometry, material, all_item);
  const voxelGeometry_erase = new THREE.InstancedMesh(
    geometry,
    material_erase,
    all_item
  );

  const start_position = new THREE.Vector3(0, 0, 0);
  const voxel_size = 1;
  voxel_group.clear();
  if (show_remain_voxel.value) {
    voxel_group.add(voxelGeometry);
  }
  if (show_removed_voxel.value) {
    voxel_group.add(voxelGeometry_erase);
  }
  let remain_voxel_index = 0;
  let removed_voxel_index = 0;

  //位置オフセット。ボクセルの中心を原点にするためのオフセット
  const pos_offset = new THREE.Vector3(
    (-data.length * voxel_size) / 2,
    (-data[0].length * voxel_size) / 2,
    0
  );

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      for (let k = 0; k < data[i][j].length; k++) {
        const voxel = new THREE.Object3D();
        voxel.position.set(
          start_position.x + i * voxel_size + pos_offset.x,
          start_position.z + k * voxel_size + pos_offset.z, //3Dの座標系はyが高さ方向のため、zと入れ替え
          start_position.y + j * voxel_size + pos_offset.y
        );
        voxel.updateMatrix();
        if (data[i][j][k]) {
          if (!show_remain_voxel.value) {
            //残っているボクセルを表示しない場合はスキップ
            continue;
          }
          voxelGeometry.setMatrixAt(remain_voxel_index++, voxel.matrix);
        } else {
          if (!show_removed_voxel.value) {
            //削除されたボクセルを表示しない場合はスキップ
            continue;
          }
          //stock範囲内か確認
          if (
            (i * voxel_size + pos_offset.x) ** 2 +
              (j * voxel_size + pos_offset.y) ** 2 <
            Param.stocks.value[0].radius ** 2
          ) {
            voxelGeometry_erase.setMatrixAt(
              removed_voxel_index++,
              voxel.matrix
            );
          }
        }
      }
    }
  }
  show_voxel.value = true;
  is_calculating.value = false;
}
/*
onMounted(() => {
  console.log("mounted");
});

onUnmounted(() => {
  console.log("unmounted");
});
*/
watch(Param.stocks.value, (val) => {
  console.log("stock changed", val);
});
</script>

<style scoped>
canvas {
  box-sizing: border-box;
}

.overlay3dui {
  position: relative;
  top: 10;
  right: 10;
  background-color: rgba(255, 255, 255, 0.5);
}
</style>
