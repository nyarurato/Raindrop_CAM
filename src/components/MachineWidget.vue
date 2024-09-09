<template>
  <BaseWidget title="マシン設定" keyname="MachineWidget">
    <template v-slot:contents>
      <h5>構成軸</h5>
      <v-select
        v-model="raidus_axis_name"
        :items="machineAxes"
        label="半径方向軸"
      ></v-select>
      <v-select
        v-model="height_axis_name"
        :items="machineAxes"
        label="高さ方向軸"
      ></v-select>
      <v-select
        v-model="rotation_axis_name"
        :items="machineAxes"
        label="回転軸"
      ></v-select>
    </template>
  </BaseWidget>
</template>

<script lang="ts" setup>
import { defineComponent, ref, inject } from "vue";
import BaseWidget from "./BaseWidget.vue";
import { ReactiveParameters } from "./CAM/Parameters";
import { Machine } from "./CAM/Machine";

const machineAxes = ["X", "Y", "Z", "A", "B", "C"];

const raidus_axis_name = ref("X");
const height_axis_name = ref("Y");
const rotation_axis_name = ref("B");

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

const movableX = ref(300);
const movableY = ref(500);
const movableZ = ref(500);
</script>
