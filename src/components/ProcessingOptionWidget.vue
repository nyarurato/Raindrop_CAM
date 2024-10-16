<template>
  <BaseWidget title="加工設定" keyname="ProcessingOptionWidget">
    <template v-slot:contents>
      <v-text-field
        v-model.number="Param.main_param.value.feedrate"
        label="送り速度(mm/min)"
      />
      <v-text-field
        v-model.number="Param.main_param.value.cut_depth"
        label="半径方向切り込み量(mm)"
      />
    </template>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, inject } from "vue";
import BaseWidget from "./BaseWidget.vue";
import { ReactiveParameters } from "./CAM/Parameters";

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;
</script>
