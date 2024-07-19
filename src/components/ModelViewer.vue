<template>
  <div class="hello">
    <div class="view">
      <TestView />
      <!-- <SectionSketchView /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from "vue";
import TestView from "./TestView.vue";
import SectionSketchView from "./SectionSketchView.vue";

const props = defineProps({
  msg: String,
});
</script>

<style scoped>
.view {
  margin: auto;
  height: 70vh;
}
</style>
