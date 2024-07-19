<template>
  <BaseWidget title="エンドミル" keyname="EndmillWidget">
    <template v-slot:contents>
      <v-select
        v-model="selectedEndmill"
        :items="endmills"
        label="形状"
        outlined
      ></v-select>
      <v-text-field
        v-model="diameter"
        label="直径"
        outlined
        type="number"
      ></v-text-field>
      <v-text-field
        v-model="height"
        label="有効長"
        outlined
        type="number"
      ></v-text-field>
    </template>
  </BaseWidget>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from "vue";
import BaseWidget from "./BaseWidget.vue";

const selectedEndmill = ref("ボール");
const endmills = ref(["ボール", "スクエア"]);
const diameter = ref(5);
const height = ref(5);
</script>
