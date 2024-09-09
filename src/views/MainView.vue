<template>
  <v-container>
    <v-app-bar color="primary" density="compact">
      <template v-slot:prepend>
        <v-img src="./img/logo.png" width="2.5rem" />
        <span class="titlename ml-2"
          >Raindrop<span class="cadcam ml-3">CAD/CAM v{{ version }}</span></span
        >
      </template>
      <template v-slot:append>
        <v-btn variant="outlined" class="mx-2" @click="onCliclkCreatePath"
          >加工パス生成</v-btn
        >
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="3">
        <v-expansion-panels multiple v-model="widget_open_list_left">
          <!-- Left Widget -->
          <StockWidget />
          <ProcessingFigureListWidget />
        </v-expansion-panels>
      </v-col>
      <v-col>
        <!-- center canvas -->
        <ModelViewer />
      </v-col>
      <v-col cols="3">
        <v-expansion-panels multiple v-model="widget_open_list_right">
          <!-- Right Widget -->
          <EndmillWidget />
          <ProcessingOptionWidget />
          <MachineWidget />
        </v-expansion-panels>
      </v-col>
    </v-row>
    <CAMProcessDialog v-model:model-value="camprocessing_dialog" />
    <StartHereDialog />
  </v-container>
</template>

<script lang="ts" setup>
import ModelViewer from "@/components/ModelViewer.vue"; // @ is an alias to /src
import BaseWidget from "@/components/BaseWidget.vue"; // Import the Widget component
import StockWidget from "@/components/StockWidget.vue";
import ProcessingFigureListWidget from "@/components/ProcessingFigureListWidget.vue";
import EndmillWidget from "@/components/EndmillWidget.vue";
import ProcessingOptionWidget from "@/components/ProcessingOptionWidget.vue";
import MachineWidget from "@/components/MachineWidget.vue";
import CAMProcessDialog from "@/components/CAMProcessDialog.vue";
import StartHereDialog from "@/components/StartHereDialog.vue";

import { Endmill, EndmillType } from "@/components/CAM/Endmill";
import { BaseStock, Cylinder, StockType } from "@/components/CAM/Stock";
import { Section } from "@/components/CAM/Sections";
import { ReactiveParameters } from "@/components/CAM/Parameters";

import { provide, ref } from "vue";
import { Vector3 } from "three";

import { version } from "../../package.json";

const widget_open_list_left = ref([
  "StockWidget",
  "ProcessingFigureListWidget",
]);

const widget_open_list_right = ref([
  "EndmillWidget",
  "ProcessingOptionWidget",
  "MachineWidget",
]);

const Param = new ReactiveParameters();

provide("Param", Param);

const camprocessing_dialog = ref(false);
function onCliclkCreatePath() {
  camprocessing_dialog.value = true;
  console.log("Create Path");
}
</script>

<style scoped>
.titlename {
  font-size: 1.5rem;
  font-style: italic;
  font-weight: bold;
}
.cadcam {
  font-size: 0.8rem;
  font-style: normal;
  font-weight: bold;
}
</style>
