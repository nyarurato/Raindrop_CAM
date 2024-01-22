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
        <!-- Left Widget -->
        <BaseWidget :title="'aaa'" />
        <BaseWidget :title="'aaa'" />
      </v-col>
      <v-col>
        <!-- center canvas -->
        <HelloWorld />
      </v-col>
      <v-col cols="3">
        <!-- Right Widget -->
        <BaseWidget :title="'aaa'" />
        <BaseWidget :title="'aaa'" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import BaseWidget from "@/components/BaseWidget.vue"; // Import the Widget component

export default defineComponent({
  name: "HomeView",
  components: {
    HelloWorld,
    BaseWidget, // Register the Widget component
  },
});
</script>
