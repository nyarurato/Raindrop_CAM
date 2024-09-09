<template>
  <v-dialog v-model="dialogVisible" persistent max-width="50vw">
    <v-card>
      <v-card-title class="text-h5">
        <span class="headline">ようこそ Raindrop CAD/CAM v{{ version }}へ</span>
      </v-card-title>
      <div class="text-h5 warn_smartphone" v-if="isSmartphone()">
        現在スマートフォン、タブレットでの動作は非対応です。
      </div>
      <v-card-text>
        <div v-if="currentStep === 0">
          <p>使用するにあたって注意点がいくつかあります。</p>
          <p class="description">1. 以下のパスには現在非対応です。</p>
          <v-row>
            <v-col>
              <div>自己交差</div>
              <v-img
                width="8vw"
                class="path_img"
                src="./img/selfintercection.jpg"
              />
            </v-col>
            <v-col>
              <div>オーバーハング</div>
              <v-img width="8vw" class="path_img" src="./img/overhang.jpg" />
            </v-col>
            <v-col>
              <div>立ち壁</div>
              <v-img width="8vw" class="path_img" src="./img/wall.jpg" />
            </v-col>
          </v-row>
        </div>
        <div v-else-if="currentStep === 1">
          <p class="description">2. 生成パスは以下の特徴があります</p>
          <v-row>
            <v-col>
              <div>ワーク原点、軸構成の想定は下図の通りです。</div>
              <v-img width="12vw" class="path_img" src="./img/axis.jpg" />
            </v-col>
            <v-col>
              <div>
                現verでは加工パスは単純に半径方向オフセットのため、断面形状によっては指定形状に干渉することがあります。
              </div>
              <v-img width="8vw" class="path_img" src="./img/conflict.jpg" />
            </v-col>
          </v-row>
        </div>
        <div v-else-if="currentStep === 2">
          <p class="description">3. その他</p>
          <p></p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="previousStep" v-if="currentStep > 0"
          >前へ</v-btn
        >
        <v-btn color="primary" @click="nextStep" v-if="currentStep < 2"
          >次へ</v-btn
        >
        <v-btn color="primary" @click="closeDialog" v-if="currentStep === 2"
          >閉じる</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { version } from "../../package.json";

const dialogVisible = ref(true);
const currentStep = ref(0);

const closeDialog = () => {
  dialogVisible.value = false;
};

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const isSmartphone = () => {
  const ua = navigator.userAgent;
  return /iPhone|iPad|Android|.+Mobile/.test(ua);
};
</script>

<style scoped>
.headline {
}
.path_img {
  background-color: #f0f0f0;
}
.warn_smartphone {
  color: red;
  font-weight: bold;
}
.description {
  font-weight: bold;
  font-size: 1.1rem;
}
</style>
