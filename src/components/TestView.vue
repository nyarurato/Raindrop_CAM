<template>
  <!--<Suspense>-->
  <TresCanvas v-bind="state" class="canvas3d">
    <Stats />
    <TresPerspectiveCamera
      :position="[
        0,
        Param.stocks.value[0].height * 1.5,
        Param.stocks.value[0].radius * 3,
      ]"
      :fov="75"
      :near="0.1"
      :far="5000"
    >
      <TresDirectionalLight />
    </TresPerspectiveCamera>
    <OrbitControls />

    <!-- Stock -->
    <!-- 半透明 -->
    <TresGroup v-if="is_checked_stock">
      <TresMesh :geometry="mesh.geometry" :position="cylinder_position">
        <TresMeshBasicMaterial
          :color="cylinder_color"
          :wireframe="false"
          :transparent="true"
          :opacity="0.1"
        />
      </TresMesh>
      <!-- 線 -->
      <TresLineSegments :position="cylinder_position">
        <TresEdgesGeometry :args="[mesh.geometry]" />
        <TresLineBasicMaterial color="black" />
      </TresLineSegments>
    </TresGroup>

    <!-- Stock ここまで-->

    <!-- 断面線 -->
    <TresGroup v-if="is_checked_section_path">
      <primitive :object="sec_lines" v-for="sec_lines in section_path_points" />
    </TresGroup>

    <!-- ここまで断面線 -->
    <!-- 面表示 -->
    <TresGroup v-if="is_checked_section">
      <TresMesh
        :geometry="geo"
        :position="[
          (Param.stocks.value[0].radius / 2) *
            Math.cos((index * Math.PI * 2) / Param.sections.value.length),
          Param.stocks.value[0].height / 2,
          (Param.stocks.value[0].radius / 2) *
            Math.sin((index * Math.PI * 2) / Param.sections.value.length),
        ]"
        v-for="(geo, index) in test_plane_geo"
      >
        <TresMeshBasicMaterial
          :args="[
            {
              color: 0x00ff00,
              side: THREE.DoubleSide,
              opacity: 0.5,
              map: plane_texture[index],
            },
          ]"
        />
      </TresMesh>
    </TresGroup>
    <!-- ここまで面表示 -->

    <!--ボクセル表示-->
    <primitive v-if="show_voxel" :object="voxel_group" />
    <!--ここまでボクセル表示-->

    <TresAmbientLight :intensity="0.1" />
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
        <v-checkbox label="断面" v-model="is_checked_section"></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          label="断面パス"
          v-model="is_checked_section_path"
        ></v-checkbox>
      </v-col>
    </v-row>
    <v-row v-if="show_simulator_result_button">
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
import { isReturnStatement } from "typescript";
import { isArray } from "@tresjs/core/dist/src/utils";

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

const simulator = inject("simulator") as Simulator;

const is_checked_stock = ref(true);
const is_checked_section = ref(true);
const is_checked_section_path = ref(true);

const test_style = {
  position: "absolute",
  top: "100px",
  right: "100px",
};

const state = reactive({
  clearColor: "#333333",
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  renderMode: "on-demand" as "on-demand" | "always" | "manual",
});

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

const test_plane_geo = createSectionPlanes();
const plane_texture = createPlaneTexture();
const section_path_points = createSectionPlanesPaths();

const voxel_group = new THREE.Group();
const show_voxel = ref(false);
const show_removed_voxel = ref(true);
const show_remain_voxel = ref(true);

const show_simulator_result_button = ref(simulator.is_exist_voxel);
const is_calculating = ref(false);

function createSectionPlanes(): THREE.PlaneGeometry[] {
  const section_planes = Param.sections.value.map((section, index, array) => {
    const angle = (360 / Param.sections.value.length) * (Math.PI / 180) * index;

    const vec = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const normal = vec.cross(new THREE.Vector3(0, 1, 0));
    section.setProjectionPlane(normal);
    return section.getPlaneGeometry(
      Param.stocks.value[0].radius,
      Param.stocks.value[0].height
    );
  });
  return section_planes;
}

function createPlaneTexture(): Array<THREE.CanvasTexture> {
  //Planeの右上に数字を表示するためのテクスチャを作成
  const plane_textures = new Array<THREE.CanvasTexture>();

  for (let i = 0; i < Param.sections.value.length; i++) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = Math.floor(
      (256 * Param.stocks.value[0].height) / Param.stocks.value[0].radius
    );
    if (context) {
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "black";
      context.font = "50px Arial";
      context.textAlign = "left";
      context.textBaseline = "top";
      context.fillText((i + 1).toString(), 10, 10);
    }
    const texture = new THREE.CanvasTexture(canvas);
    plane_textures.push(texture);
  }
  return plane_textures;
}

function createSectionPlanesPaths(): Array<THREE.Group> {
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 2,
  });
  const section_paths = Param.sections.value.map((section, index, array) => {
    const start_pos = new THREE.Vector3(0, 0, 0);

    const p = section.projectTo3DPlane(section.path.points, start_pos);

    const points = p instanceof Array ? p : [p];

    const group = new THREE.Group();
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    group.add(line);

    //頂点を描画
    const points_geo = new THREE.BufferGeometry().setFromPoints(points);
    const points_material = new THREE.PointsMaterial({ color: 0x0000ff });
    const points_mesh = new THREE.Points(points_geo, points_material);
    group.add(points_mesh);

    return group;
  });
  return section_paths;
}

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
  is_checked_stock.value = false;
  is_checked_section.value = false;
  is_checked_section_path.value = false;
}

watch(
  () => Param.sections.value.length,
  () => {
    test_plane_geo.splice(0, test_plane_geo.length, ...createSectionPlanes());
    plane_texture.splice(0, plane_texture.length, ...createPlaneTexture());
    section_path_points.splice(
      0,
      section_path_points.length,
      ...createSectionPlanesPaths()
    );
  }
);
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
