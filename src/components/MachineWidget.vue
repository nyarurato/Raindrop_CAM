<template>
  <BaseWidget title="マシン設定" keyname="MachineWidget">
    <template v-slot:contents>
      <v-select
        v-model="selectedMachineType"
        :items="machineTypes"
        label="マシン"
      ></v-select>
      <v-text-field
        v-model="movableX"
        label="Movable X"
        type="number"
      ></v-text-field>
      <v-text-field
        v-model="movableY"
        label="Movable Y"
        type="number"
      ></v-text-field>
      <v-text-field
        v-model="movableZ"
        label="Movable Z"
        type="number"
      ></v-text-field>
    </template>
  </BaseWidget>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from "vue";
import BaseWidget from "./BaseWidget.vue";

const selectedMachineType = ref("Marko 2+1 500");
const machineTypes = [
  "Marko 2+1 500",
  "Marko 2+1 1000",
  "Marko 3+1 500",
  "Marko 3+1 1000",
];
const movableX = ref(300);
const movableY = ref(500);
const movableZ = ref(500);
</script>
