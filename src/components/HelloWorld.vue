<template>
  <div class="hello">
    <div class="view">
      <TestView />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from "vue";
import TestView from "./TestView.vue";

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
