<template>
  <div>
    <v-switch
      v-model="is2DView"
      color="success"
      append-icon="mdi-video-2d"
      prepend-icon="mdi-video-3d"
      class="d-flex justify-center"
    >
      <template v-slot:prepend>確認</template>
      <template v-slot:append>編集</template>
    </v-switch>

    <div class="view">
      <SectionSketchView v-if="is2DView" />
      <TestView v-else />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from "vue";
import TestView from "./TestView.vue";
import SectionSketchView from "./SectionSketchView.vue";

const props = defineProps({
  msg: String,
});

const is2DView = ref(true);
</script>

<style scoped>
.view {
  margin: auto;
  height: 70vh;
}
</style>
