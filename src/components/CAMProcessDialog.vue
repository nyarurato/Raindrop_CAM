<template>
  <v-dialog v-model="dialogflag" persistent max-width="500px">
    <v-card>
      <v-card-title> Progress Dialog </v-card-title>
      <v-card-text>
        <v-progress-linear
          v-if="showProgressBar"
          v-model="progressValue"
          :color="progressbarColor"
          height="25"
          :striped="isAnimate"
        >
          <template v-slot:default="{ value }">
            <strong>{{ Math.ceil(value) }}%</strong>
          </template>
        </v-progress-linear>
        <div>
          <v-btn v-if="!showProgressBar" @click="startProgress"
            >Start Progress</v-btn
          >
          <v-btn @click="Restart">Restart</v-btn>
          <v-btn @click="dialogflag = false">Close</v-btn>
        </div>
        <div>
          <v-btn v-if="isDownloadableCL" download="cl.txt" :href="DownloadCL()"
            >CLダウンロード</v-btn
          >
          <v-btn v-if="isDownloadableNC" download="out.nc" :href="DownloadNC()"
            >NCダウンロード</v-btn
          >
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="showLogBox = !showLogBox" color="secondary"
          >ログ表示</v-btn
        >
      </v-card-actions>

      <v-card-text v-if="showLogBox" style="">
        <v-card>
          <v-card-title>ログ</v-card-title>
          <v-card-text
            style="white-space: pre; max-height: 10rem; overflow-y: auto"
          >
            {{ logData }}
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { defineComponent, defineModel, ref, inject } from "vue";
import { SimpleROffsetProcessor } from "./CAM/MainProcessor/SimpleROffsetProcessor";
import { ReactiveParameters } from "./CAM/Parameters";
import { Machine } from "./CAM/Machine";
import { CLData } from "./CAM/MainProcessor/CL";
import { PostProcessorParameter } from "./CAM/PostProcessor/PostProcessorParameter";
import { RepRapCNCPostProcessor } from "./CAM/PostProcessor/reprapcnc";

const dialogflag = defineModel<boolean>();

const showProgressBar = ref(false);
const progressValue = ref(0);
const showLogBox = ref(false);
const logData = ref("");
const progressbarColor = ref("success");
const isAnimate = ref(true);
const isDownloadableCL = ref(false);
const isDownloadableNC = ref(false);

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

let _cl_data: CLData | null = null;
let _nc_data = "";

async function startProgress() {
  showProgressBar.value = true;
  const mainprocessor = new SimpleROffsetProcessor();
  const endmills = Param.endmills.value;
  const stocks = Param.stocks.value;
  const sections = Param.sections.value;
  const main_param = Param.main_param.value;
  const machine = Param.machine.value;
  const postprocessor = new RepRapCNCPostProcessor();

  _cl_data = null;
  _nc_data = "";

  mainprocessor.onProgress = (value: number, message: string) => {
    progressbarColor.value = "success";
    progressValue.value = value;
    logData.value = message;
    isAnimate.value = true;
  };

  mainprocessor.onErrorEnd = (message: string) => {
    progressbarColor.value = "error";
    logData.value = message;
    progressValue.value = 100;
    isAnimate.value = false;
  };

  const cldata = await mainprocessor.processAsync(
    sections,
    stocks[0],
    endmills[0],
    machine ?? new Machine(),
    main_param
  );

  if (cldata) {
    isDownloadableCL.value = true;
    _cl_data = cldata;
  } else {
    progressbarColor.value = "error";
    logData.value += "CLデータの生成に失敗しました。\n";
    progressValue.value = 100;
    isAnimate.value = false;
    return;
  }

  const postprocessor_param: PostProcessorParameter = {
    offset: { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 },
    coefficient: { x: 1, y: 1, z: 1, a: 1, b: 1, c: 1 },
    is_angle_reset_on_360: true,
    machine: machine ?? new Machine(),
  };

  postprocessor.onProgress = (value: number, message: string) => {
    progressbarColor.value = "success";
    progressValue.value = value;
    logData.value += message;
    isAnimate.value = true;
  };

  postprocessor.onErrorEnd = (message: string) => {
    progressbarColor.value = "error";
    logData.value += message;
    progressValue.value = 100;
    isAnimate.value = false;
  };
  _nc_data = await postprocessor.processAsync(cldata, postprocessor_param);

  if (_nc_data) {
    isAnimate.value = false;
    isDownloadableNC.value = true;
  } else {
    progressbarColor.value = "error";
    logData.value += "NCデータの生成に失敗しました。\n";
    progressValue.value = 100;
    isAnimate.value = false;
    return;
  }
}

function Restart() {
  progressValue.value = 0;
  startProgress();
}

function DownloadCL() {
  return _cl_data?.SaveAsTextURL();
}

function DownloadNC() {
  const nc_url = URL.createObjectURL(
    new Blob([_nc_data], { type: "text/plain" })
  );
  return nc_url;
}
</script>

<style scoped></style>
