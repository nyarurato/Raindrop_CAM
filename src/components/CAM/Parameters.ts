import { ref, Ref } from "vue";
import { BaseStock, StockType, Cylinder } from "./Stock";
import { Endmill, EndmillType } from "./Endmill";
import { Section } from "./Sections";
import { MainProcessorParameter } from "./MainProcessor/MainProcessorParameter";
import { Machine } from "./Machine";
export class ReactiveParameters {
  public stocks: Ref<BaseStock[]>; // BaseStock[]のリアクティブな配列
  public endmills: Ref<Endmill[]>; // Endmill[]のリアクティブな配列
  public sections: Ref<Section[]>; // Section[]のリアクティブな配列
  public selectedSection: Ref<Section | null> = ref(null); // 選択されたSection
  public selectedStockIndex: Ref<number> = ref(-1); // 選択されたStock
  public machine: Ref<Machine | null> = ref(null); // Machineのリアクティブな変数
  public main_param: Ref<MainProcessorParameter> = ref({
    cut_depth: 5,
    feedrate: 500,
    cut_pitch: 5,
  }); // MainProcessorParameterのリアクティブな変数

  constructor() {
    this.stocks = ref([]);
    this.stocks.value.push(new Cylinder(100, 50));
    this.selectedStockIndex.value = 0;
    this.endmills = ref([]);
    this.endmills.value.push(new Endmill(EndmillType.BALL, 10, 10));
    this.sections = ref([]);
    this.sections.value.push(new Section());
    this.selectedSection.value = this.sections.value[0];
    this.main_param.value = {
      cut_depth: 5,
      feedrate: 500,
      cut_pitch: 5,
    };
    this.machine.value = new Machine();
  }
}
