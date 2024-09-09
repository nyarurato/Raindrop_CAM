<template>
  <BaseWidget title="ストック" keyname="StockWidget">
    <template v-slot:contents>
      <v-form>
        <v-select
          v-model="shape"
          :items="shapeOptions"
          label="形状"
          variant="outlined"
          disabled
        ></v-select>

        <v-text-field
          v-model.number="radius"
          label="半径"
          variant="outlined"
          type="number"
        ></v-text-field>

        <v-text-field
          v-model.number="height"
          label="高さ"
          variant="outlined"
          type="number"
        ></v-text-field>

        <v-btn color="primary" :onclick="setStock">設定</v-btn>
      </v-form>
    </template>
  </BaseWidget>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue";
import { Ref } from "vue";
import BaseWidget from "./BaseWidget.vue";
import { Cylinder } from "./CAM/Stock";
import { ReactiveParameters } from "./CAM/Parameters";

const shapeOptions = ["円柱", "四角柱"];

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

if (Param.stocks.value.length == 0) {
  Param.stocks.value.push(new Cylinder(50, 50));
}

const shape = ref(shapeOptions[Param.stocks.value[0].type as number]);
const radius: Ref<number> = ref(Param.stocks.value[0].radius);
const height: Ref<number> = ref(Param.stocks.value[0].height);

function setStock() {
  Param.stocks.value[0].radius = radius.value;
  Param.stocks.value[0].height = height.value;
}
</script>
