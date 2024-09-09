<template>
  <BaseWidget title="エンドミル" keyname="EndmillWidget">
    <template v-slot:contents>
      <v-select
        v-model="selectedEndmill"
        :items="endmills"
        label="形状"
        outlined
        disabled
      ></v-select>
      <v-text-field
        v-model.number="diameter"
        label="直径"
        outlined
        type="number"
      ></v-text-field>
      <v-text-field
        v-model.number="effective_length"
        label="有効長"
        outlined
        type="number"
      ></v-text-field>
      <v-btn @click="setEndmillParam" color="primary">設定</v-btn>
    </template>
  </BaseWidget>
</template>

<script lang="ts" setup>
import { ref, inject } from "vue";
import BaseWidget from "./BaseWidget.vue";
import { Endmill, EndmillType } from "./CAM/Endmill";
import { ReactiveParameters } from "./CAM/Parameters";

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

const selectedEndmill = ref("ボール");
const endmills = ref(["ボール"]); //ref(["ボール", "スクエア"]);
const diameter = ref(5.0);
const effective_length = ref(5.0);
const selectedEndmill_index = 0;

function onMounted() {
  if (Param.endmills.value.length == 0) {
    //エンドミルが未設定の場合
    Param.endmills.value.push(
      new Endmill(EndmillType.BALL, diameter.value, effective_length.value)
    );
  }
}

function setEndmillParam() {
  let endmilltype: EndmillType;
  if (selectedEndmill.value == "ボール") {
    endmilltype = EndmillType.BALL;
  } else if (selectedEndmill.value == "スクエア") {
    endmilltype = EndmillType.SQUARE;
  } else {
    endmilltype = EndmillType.BALL;
  }

  const new_endmill = new Endmill(
    endmilltype,
    diameter.value,
    effective_length.value
  );

  //エンドミルの設定を更新
  Param.endmills.value[selectedEndmill_index] = new_endmill;
}
</script>
