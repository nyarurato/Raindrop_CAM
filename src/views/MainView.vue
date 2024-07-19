<template>
  <v-container>
    <v-app-bar color="primary" density="compact">
      <template v-slot:prepend>
        <span style="font-size: 1.5rem">☔</span>
      </template>
      <template v-slot:append>
        <v-btn variant="outlined" class="mx-2">シミュレート</v-btn>
        <v-btn variant="outlined" class="mx-2">NC保存</v-btn>
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

import { Endmill } from "@/components/CAM/Endmill";
import { BaseStock } from "@/components/CAM/Stock";

import { provide, ref } from "vue";

const widget_open_list_left = ref([
  "StockWidget",
  "ProcessingFigureListWidget",
]);

const widget_open_list_right = ref([
  "EndmillWidget",
  "ProcessingOptionWidget",
  "MachineWidget",
]);

const Endmills = new Array<Endmill>();
const Stocks = new Array<BaseStock>();

provide("Endmills", Endmills);
provide("Stocks", Stocks);
</script>
