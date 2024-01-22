<template>
  <v-card>
    <v-card-title>{{ title }}</v-card-title>
    <v-card-text>
      <!-- Content of the widget goes here -->
      <slot></slot>
    </v-card-text>
    <v-card-actions>
      <!-- Actions for the widget goes here -->
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { defineComponent } from "vue";

const props = defineProps<{
  title: string;
}>();
</script>
