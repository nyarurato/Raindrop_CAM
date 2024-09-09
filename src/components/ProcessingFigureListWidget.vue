<template>
  <BaseWidget title="加工断面" keyname="ProcessingFigureListWidget">
    <template v-slot:contents>
      <div>
        <v-text-field
          v-model.number="divisionCount"
          label="分割数"
          type="number"
          :onchange="changeSectionNum"
        ></v-text-field>
      </div>
      <v-data-table :headers="headers" :items="figureList" items-per-page="5">
        <template v-slot:[`item.selected`]="{ item }">
          <v-icon
            v-if="item.instance === Param.selectedSection.value"
            color="success"
          >
            mdi-checkbox-marked-circle
          </v-icon>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon
            class="me-1"
            size="small"
            @click="editItem(item)"
            color="primary"
          >
            mdi-file-edit
          </v-icon>
          <v-icon
            class="me-1"
            size="small"
            @click="duplicateItem(item)"
            color="success"
          >
            mdi-content-duplicate
          </v-icon>
          <v-icon size="small" @click="deleteItem(item)" color="error">
            mdi-delete
          </v-icon>
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
}

const figureList = computed(() => {
  const list = new Array<SectionItem>();
  for (let i = 0; i < Param.sections.value.length; i++) {
    list.push({
      index: i + 1,
      name: Param.sections.value[i].name,
      instance: Param.sections.value[i],
    } as SectionItem);
  }
  return list;
});

const toast = useToast();

function addSection() {
  console.log("addSection");
}

function changeSectionNum() {
  if (divisionCount.value < Param.sections.value.length) {
    Param.sections.value.splice(divisionCount.value);
  } else {
    for (let i = Param.sections.value.length; i < divisionCount.value; i++) {
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
    }
  }
}

function editItem(item: SectionItem) {
  console.log("Item edited:", item);
  changeSection(item);
}

function duplicateItem(item: SectionItem) {
  console.log("Item duplicated:", item);
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

function saveSection() {
  console.log("saveSection");
}
</script>
