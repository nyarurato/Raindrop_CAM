<template>
  <BaseWidget title="ストック" keyname="StockWidget">
    <template v-slot:contents>
      <v-form>
        <v-select
          :items="shapeOptions"
          label="形状"
          variant="outlined"
        ></v-select>

        <v-text-field
          v-model="radius"
          label="半径"
          variant="outlined"
          type="number"
        ></v-text-field>

        <v-text-field
          v-model="height"
          label="高さ"
          variant="outlined"
          type="number"
        ></v-text-field>
      </v-form>
    </template>
  </BaseWidget>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import BaseWidget from "./BaseWidget.vue";

const shape = ref(0);
const radius = ref(0);
const height = ref(0);

const shapeOptions = ["円柱", "四角柱"];
</script>
