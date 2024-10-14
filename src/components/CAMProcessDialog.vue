<template>
  <v-dialog v-model="dialogflag" persistent max-width="500px">
    <v-card>
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        <span class="headline">CAM実行ダイアログ</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="dialogflag = false"
        ></v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
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
        </v-row>
        <v-row v-if="isDoneCAM">
          開始日時: {{ startDate.toLocaleString() }}<br />
          終了日時: {{ endDate.toLocaleString() }}<br />
          所要時間 {{ processingTime }}ms
        </v-row>
        <v-row v-if="isDoneSimulate">
          シミュレーション結果は3Dビューを開き、描画ボタンを押して結果を確認します。
        </v-row>
        <v-row>
          <v-col v-if="!showProgressBar" class="d-flex justify-center">
            <v-btn
              @click="startProgress"
              prepend-icon="mdi-play"
              color="primary"
              >処理開始</v-btn
            >
          </v-col>
          <v-col v-if="isDoneCAM">
            <v-btn
              @click="Restart"
              class="new-line-button"
              prepend-icon="mdi-restart"
              color="secondary"
              block
              >CAM計算<br />再スタート</v-btn
            >
          </v-col>
          <v-col v-if="isDoneCAM">
            <v-btn
              @click="simulate_result"
              prepend-icon="mdi-calculator-variant"
              color="primary"
              block
              class="new-line-button"
              >結果シミュレーション<br />計算開始</v-btn
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              v-if="isDownloadableNC"
              download="out.nc"
              :href="DownloadNC()"
              prepend-icon="mdi-bolt"
              color="success"
              block
              class="new-line-button"
              >NCダウンロード<br />マシン用</v-btn
            >
          </v-col>
          <v-col>
            <v-btn
              v-if="isDownloadableCL"
              download="cl.txt"
              :href="DownloadCL()"
              prepend-icon="mdi-bug-outline"
              color="warning"
              block
              class="new-line-button"
              >CLダウンロード<br />デバッグ用</v-btn
            >
          </v-col>
        </v-row>
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
import { defineComponent, defineModel, ref, inject, provide } from "vue";
import { SimpleROffsetProcessor } from "./CAM/MainProcessor/SimpleROffsetProcessor";
import { ReactiveParameters } from "./CAM/Parameters";
import { Machine } from "./CAM/Machine";
import { CLData } from "./CAM/MainProcessor/CL";
import { PostProcessorParameter } from "./CAM/PostProcessor/PostProcessorParameter";
import { RepRapCNCPostProcessor } from "./CAM/PostProcessor/reprapcnc";

import { Simulator } from "./Simulation/Simulator";

const dialogflag = defineModel<boolean>();

const showProgressBar = ref(false);
const progressValue = ref(0);
const showLogBox = ref(false);
const logData = ref("");
const progressbarColor = ref("success");
const isAnimate = ref(true);
const isDownloadableCL = ref(false);
const isDownloadableNC = ref(false);
const isDoneCAM = ref(false);
const startDate = ref(new Date());
const endDate = ref(new Date());
const processingTime = ref(0);
const isDoneSimulate = ref(false);

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

const simulator = inject("simulator") as Simulator;

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
  startDate.value = new Date();

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
    isDoneCAM.value = true;
  };

  let cldata: CLData | null = null;
  try {
    cldata = await mainprocessor.processAsync(
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
      Error("CLデータの生成に失敗しました。CLデータがnullです。");
    }
  } catch (e) {
    console.error(e);
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
    isDoneCAM.value = true;
  };
  try {
    _nc_data = await postprocessor.processAsync(cldata, postprocessor_param);

    if (_nc_data) {
      isAnimate.value = false;
      isDownloadableNC.value = true;
    } else {
      Error("NCデータの生成に失敗しました。NCデータがnullです。");
    }
  } catch (e) {
    console.error(e);
    progressbarColor.value = "error";
    logData.value += "NCデータの生成に失敗しました。\n";
    progressValue.value = 100;
    isAnimate.value = false;
    return;
  }

  endDate.value = new Date();
  processingTime.value = endDate.value.getTime() - startDate.value.getTime();
  isDoneCAM.value = true;
  isDoneSimulate.value = false;
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

async function simulate_result(): Promise<void> {
  if (!isDoneCAM) return;
  if (!simulator) return;

  if (Param.machine.value) {
    progressValue.value = 50;
    isAnimate.value = true;
    logData.value += "start simulation\n";
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      await simulator.start(
        Param.stocks.value[0],
        Param.endmills.value[0],
        _cl_data!,
        Param.machine.value
      );
    } catch (e) {
      console.error(e);
      logData.value += e;
      progressbarColor.value = "error";
      progressValue.value = 100;
      isAnimate.value = false;
      return;
    }
    logData.value += "end simulation\n";
    logData.value += simulator.debugVoxelString();
    progressValue.value = 100;
    isAnimate.value = false;
    isDoneSimulate.value = true;
  } else {
    console.error("Machine parameter is null");
    return;
  }
}
</script>

<style scoped>
.v-card .v-row {
  margin-top: 20px;
}

.new-line-button.v-btn {
  height: auto;
}
</style>
