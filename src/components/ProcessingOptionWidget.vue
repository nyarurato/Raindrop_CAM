<template>
  <BaseWidget title="加工設定" keyname="ProcessingOptionWidget">
    <template v-slot:contents>
      <v-text-field v-model="sending" label="送り速度(mm/min)" />
      <v-text-field v-model="cutting" label="切り込み量" />
    </template>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseWidget from "./BaseWidget.vue";

const sending = ref(500);
const cutting = ref(1);
</script>
