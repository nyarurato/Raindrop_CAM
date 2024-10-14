<template>
  <BaseWidget title="加工断面" keyname="ProcessingFigureListWidget">
    <template v-slot:contents>
      <v-row>
        <v-col>
          <v-text-field
            v-model.number="divisionCount"
            label="分割数"
            type="number"
            :onchange="changeSectionNum"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-btn @click="addSection" class="my-3">追加</v-btn>
        </v-col>
      </v-row>

      <v-data-table :headers="headers" :items="figureList" items-per-page="5">
        <template v-slot:[`item.selected`]="{ item }">
          <v-icon
            v-if="item.instance === Param.selectedSection.value"
            color="success"
          >
            mdi-checkbox-marked-circle
          </v-icon>
        </template>
        <template v-slot:[`item.name`]="{ item }">
          <!--ダブルクリックで名前編集用-->
          <div @dblclick="item.editing = true" v-if="!item.editing">
            {{ item.name }}
          </div>
          <v-text-field
            v-else
            v-model="item.name"
            @blur="
              item.editing = false;
              chageSectionName(item, item.name);
            "
            @keyup.enter="
              item.editing = false;
              chageSectionName(item, item.name);
            "
            density="compact"
            hide-details
            class="namechanger"
          ></v-text-field>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            class="me-1"
            size="small"
            @click="editItem(item)"
            density="compact"
            icon
            flat
          >
            <v-icon color="primary">mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="bottom">編集</v-tooltip>
          </v-btn>
          <v-btn
            class="me-1"
            size="small"
            @click="duplicateItem(item)"
            density="compact"
            icon
            flat
          >
            <v-icon color="success">mdi-content-duplicate</v-icon>
            <v-tooltip activator="parent" location="bottom">複製</v-tooltip>
          </v-btn>
          <v-btn
            size="small"
            @click="deleteItem(item)"
            class="me-1"
            density="compact"
            icon
            flat
          >
            <v-icon color="error"> mdi-delete </v-icon>
            <v-tooltip activator="parent" location="bottom">削除</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>
    </template>
  </BaseWidget>
</template>

<script lang="ts" setup>
import { computed, defineComponent, ref, inject, watch } from "vue";
import BaseWidget from "./BaseWidget.vue";
import ProcessingOptionWidget from "./ProcessingOptionWidget.vue";
import { Section } from "./CAM/Sections";
import { ReactiveParameters } from "./CAM/Parameters";
import { useToast } from "vue-toastification";
import { NURBSPath } from "./CAM/Path";
import * as THREE from "three";

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

const divisionCount = ref(Param.sections.value.length);

const headers = [
  { title: "選択中", key: "selected", sortable: false },
  { title: "番号", value: "index", sortable: false },
  { title: "名前", value: "name", sortable: false },
  { title: "操作", key: "actions", sortable: false },
];

interface SectionItem {
  index: number;
  name: string;
  instance: Section;
  editing: boolean;
}

const figureList = computed(() => {
  const list = new Array<SectionItem>();
  for (let i = 0; i < Param.sections.value.length; i++) {
    list.push({
      index: i + 1,
      name: Param.sections.value[i].name,
      instance: Param.sections.value[i],
      editing: false,
    } as SectionItem);
  }
  return list;
});

const toast = useToast();

function addSection() {
  const defaultPath = [
    new THREE.Vector2(
      Param.stocks.value[Param.selectedStockIndex.value].radius / 2,
      0
    ),
    new THREE.Vector2(
      Param.stocks.value[Param.selectedStockIndex.value].radius / 2,
      Param.stocks.value[Param.selectedStockIndex.value].height / 2
    ),
    new THREE.Vector2(
      Param.stocks.value[Param.selectedStockIndex.value].radius / 2,
      Param.stocks.value[Param.selectedStockIndex.value].height
    ),
  ];
  Param.sections.value.push(
    new Section(new THREE.Vector3(0, 0, 0), new NURBSPath(defaultPath))
  );
  divisionCount.value = Param.sections.value.length;
}

function changeSectionNum() {
  if (divisionCount.value < 1) {
    divisionCount.value = 1;
  }
  if (divisionCount.value < Param.sections.value.length) {
    Param.sections.value.splice(divisionCount.value);
  } else {
    const addCount = divisionCount.value - Param.sections.value.length;
    for (let i = 0; i < addCount; i++) {
      addSection();
    }
  }
}

function editItem(item: SectionItem) {
  console.log("Item edited:", item);
  changeSection(item);
}

function duplicateItem(item: SectionItem) {
  console.log("Item duplicated:", item);
  Param.sections.value.push(item.instance.clone());
  divisionCount.value = Param.sections.value.length;
}

function deleteItem(item: SectionItem) {
  if (Param.sections.value.length == 1) {
    toast.error("最後の断面は削除できません");
    return;
  }
  if (confirm("断面データを削除してもよろしいですか？")) {
    console.log("Item deleted:", item);
    Param.sections.value.splice(Param.sections.value.indexOf(item.instance), 1);
    if (Param.selectedSection.value === item.instance) {
      Param.selectedSection.value = Param.sections.value[0];
    }
  }
  divisionCount.value = Param.sections.value.length;
}

function changeSection(item: SectionItem) {
  //check changes
  if (confirm("変更を保存しますか？")) {
    toast.success("変更を保存しました");
    Param.selectedSection.value = item.instance;
  }
}

function chageSectionName(item: SectionItem, changedName: string) {
  Param.sections.value[item.index - 1].name = changedName;
  console.log("changeSectionName", item, changedName);
}

function saveSection() {
  console.log("saveSection");
}
</script>

<style scoped>
.add_button {
  height: auto;
}

.namechanger >>> input {
  font-size: 0.8rem;
}
</style>

<style>
.v-data-table thead th {
  font-size: 12px !important;
}
.v-data-table tbody td {
  font-size: 12px !important;
}
</style>
