<template>
  <BaseWidget title="加工断面" keyname="ProcessingFigureListWidget">
    <template v-slot:contents>
      <v-text-field v-model="divisionCount" label="分割数"></v-text-field>
      <v-data-table :headers="headers" :items="figureList"></v-data-table>
    </template>
  </BaseWidget>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from "vue";
import BaseWidget from "./BaseWidget.vue";
import ProcessingOptionWidget from "./ProcessingOptionWidget.vue";

const divisionCount = ref(0);

const headers = [
  { text: "Number", value: "number" },
  { text: "Name", value: "name" },
];
const figureList = [
  { number: 1, name: "Figure 1" },
  { number: 2, name: "Figure 2" },
  { number: 3, name: "Figure 3" },
];
</script>
