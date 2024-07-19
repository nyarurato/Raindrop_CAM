<template>
  <v-expansion-panel :title="props.title" :value="props.keyname">
    <v-expansion-panel-text>
      <v-card flat>
        <v-card-text>
          <!-- Content of the widget goes here -->
          <slot name="contents"></slot>
        </v-card-text>
      </v-card>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from "vue";

const props = defineProps<{
  title: string;
  keyname: string;
}>();
</script>
