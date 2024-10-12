import { Vector2, Vector3 } from "three";
import { Endmill } from "../Endmill";
import { NURBSPath } from "../Path";
import { Section } from "../Sections";
import { BaseStock } from "../Stock";
import { BaseMainProcessor } from "./BaseMainProcessor";
import {
  CLData,
  BaseCL,
  LinearCL,
  RapidCL,
  DwellCL,
  CommentCL,
  ResetRotationAngleCL,
} from "./CL";
import { MainProcessorParameter } from "./MainProcessorParameter";
import { Machine, AxisType } from "../Machine";
import { MainProcessorUtil } from "./MainProcessorUitl";
import { c } from "vite/dist/node/types.d-aGj9QkWt";

export class SimpleROffsetProcessor extends BaseMainProcessor {
  constructor() {
    super();
  }

  async processAsync(
    sections: Array<Section>,
    stock: BaseStock,
    endmill: Endmill,
    machine: Machine,
    param: MainProcessorParameter
  ): Promise<CLData> {
    const cldata = new CLData();

    this.reset_progress();

    /*
     * CAMパラメータの表示
     */
    this.update_progress(0, "---CAM Parameter---\n");
    this.update_progress(0, `Cut depth: ${param.cut_depth}\n`);
    this.update_progress(0, `Feedrate: ${param.feedrate}\n`);
    this.update_progress(0, `Cut pitch: ${param.cut_pitch}\n`);

    //TODO: fix エンドミルの先端座標でワーク原点設定のため、最終点群は断面図形の表面と一致
    //TODO: fix 内側から外側に切削しているのを、外側から内側に切削するように変更する
    //TODO: fix 最初の点群の補完なし？

    /*
     * 最終加工の点群生成=最終断面の点群（工具先端座標系のため、最終点群は断面図形の表面と一致）
     */
    this.update_progress(0, "---Create Path---\n");
    const lastlayer_sections = sections;
    /*sections.map((section) => { //工具中心座標系の場合、最終点群はオフセット
      const points = section.path.points.map((point) => {
        return new Vector2(point.x + endmill.radius, point.y);
      });
      return new Section(
        section.origin,
        new NURBSPath(points),
        section.projectionPlane.normal,
        section.name + "_outer_last"
      );
    });
    */
    console.log("lastlayer", lastlayer_sections);

    // 高さ方向Vector2.yでソートされているか確認
    const is_sorted = lastlayer_sections.every((section) => {
      return section.path.points.every((point, index, array) => {
        if (index === 0) {
          return true;
        } else {
          return point.y >= array[index - 1].y;
        }
      });
    });
    // ソートされていない場合、エラーを出力して終了
    if (!is_sorted) {
      this.update_progress(100, "Error: Section is not sorted by Y.\n");
      throw new Error("section is not sorted by Y");
    }

    /*
     * 点群の補完処理
     */

    //断面点数を点間隔が切り込みピッチ以下になるようにする。
    //さらに全ての断面を同じ点数かつ、同じindexの点は高さ方向の値が同じ点になるように点を補完し生成する。
    //1. 全ての断面に対してindexを見ていき、前の点（基準点）との高さが最も小さい点を基準に点間隔判定を行う。
    //2. 点間隔が切り込みピッチよりも大きい場合、切り込みピッチ以下となるように分割数を決める。
    //3. 全ての断面に対して分割点及び分割の終点を挿入する。
    //4. 分割の終点を基準点として1.に戻る
    //5. 全ての断面が同じ点数かつ、配列最後の点との間の間隔がピッチ以下になるまで繰り返す。

    //断面の点数を揃える。断面の点数は、全てのSectionのPath.points.yのユニークなの数とする。
    //点数カウント
    const num_of_points_list = sections.map(
      (section) => section.path.points.length
    );
    this.update_progress(
      0,
      `section detail divided num (original): [${num_of_points_list}]\n`
    );
    const uniq_y = new Set<number>(
      sections.flatMap((section) => section.path.points.map((point) => point.y))
    );
    const target_section_divided_num = uniq_y.size;
    this.update_progress(
      0,
      `section divided num (unique Y): ${target_section_divided_num}\n`
    );

    console.log("uniq_y", uniq_y);

    //断面の点数を揃え
    lastlayer_sections.forEach((section) => {
      if (section.path.points.length < target_section_divided_num) {
        //点数が少ない場合、補完する
        uniq_y.forEach((y) => {
          //yの値がない場合、補完する
          MainProcessorUtil.InsertNewPointOnPath(section.path, y);
        });
      }
    });

    //断面の点数が同じかチェック
    if (
      !lastlayer_sections.every(
        (section) => section.path.points.length === target_section_divided_num
      )
    ) {
      this.error_end("Error: Section divided num is not same. Unique Y\n");
      throw new Error("section divided num is not same. Unique Y");
    }

    //ピッチ以下になるように点を補完する。
    //yのユニーク値から点間隔を求め、ピッチで除算し点間隔が切り込みピッチ以下になるように点数を決定する。
    //点間の分割数を示す配列
    const pitch_complement_count_array = [...uniq_y]
      .sort((a, b) => a - b)
      .map((y, index, array) => {
        if (index === 0) {
          return 0;
        } else {
          return Math.ceil((y - array[index - 1]) / param.cut_depth);
        }
      })
      .slice(1);
    this.update_progress(
      0,
      `section detail divided num (pitch Y): ${pitch_complement_count_array.reduce(
        (a, x) => {
          return a + x;
        },
        0
      )}\n`
    );

    console.log("pitch_complement_count_array", pitch_complement_count_array);

    //点を補完する
    const complemented_sections = lastlayer_sections.map((section, index) => {
      const complemented_points = new Array<Vector2>();
      complemented_points.push(section.path.points[0]); //最初の点はそのまま
      for (let i = 0; i < section.path.points.length - 1; i++) {
        const start_point = section.path.points[i];
        const end_point = section.path.points[i + 1];
        const divide_num = pitch_complement_count_array[i];
        const result = MainProcessorUtil.InsertNewPointOnPathWithDivide(
          start_point,
          end_point,
          divide_num
        );
        complemented_points.push(...result);
        complemented_points.push(end_point); //最後の点はそのまま
      }
      return new Section(
        section.origin,
        new NURBSPath(complemented_points),
        section.projectionPlane.normal,
        section.name + "_complemented"
      );
    });
    console.log("hokan", complemented_sections);

    //断面間の点数チェック。全ての断面の点数が同じかチェック
    const is_same_section_divided_num = complemented_sections.every(
      (section) =>
        section.path.points.length ===
        complemented_sections[0].path.points.length
    );
    if (!is_same_section_divided_num) {
      console.log(complemented_sections);
      this.error_end("Error: Section divided num is not same. Pitch Y\n");
      throw new Error("section divided num is not same. Pitch Y");
    } else {
      this.update_progress(0, "Section divided num is same. OK\n");
    }

    /*
     *
     * オフセット処理
     *
     */
    // Sectionの点を加工パスとするためのOffset 回数を計算する。
    // Offset_times = Max（ALL Section (（ストックR - Min（Section R））/ 切り込み))
    const offset_times = Math.max(
      ...lastlayer_sections.map((section) => {
        // Sectionの点の中で最小のRを取得
        const minR = Math.min(...section.path.points.map((point) => point.x));
        return Math.ceil((stock.radius - minR) / param.cut_depth);
      })
    );

    this.update_progress(10, `Offset times: ${offset_times}\n`);

    const layered_sections = new Array<Array<Section>>();
    // 補正済みsectionsをベースに、一番内側のオフセットを作成し、順に外側のオフセットを作成する。
    for (let offset_num = 0; offset_num < offset_times; offset_num++) {
      //オフセット回数分ループ
      //オフセット処理。オリジナルのArray<Section>からオフセットしたArray<Section>を作成する。
      const offset_section = complemented_sections.map((section) => {
        const points = section.path.points.map((point) => {
          return new Vector2(point.x + offset_num * param.cut_depth, point.y);
        });
        return new Section(
          section.origin,
          new NURBSPath(points),
          section.projectionPlane.normal,
          section.name + "_outer_" + offset_num.toString()
        );
      });
      layered_sections.push(offset_section);
      this.update_progress(0, `Offset ${offset_num} created.\n`);
    }

    /*
     *
     * 加工パスを生成する
     *
     */
    //0.軸名を取得
    const radius_axis_name = machine.axes.radius_axis?.name;
    const height_axis_name = machine.axes.height_axis?.name;
    const angular_axis_name = machine.axes.angular_axis?.name;
    if (
      radius_axis_name === undefined ||
      height_axis_name === undefined ||
      angular_axis_name === undefined
    ) {
      this.error_end("Error: Axis is not defined.\n");
      throw new Error("axis name is not defined");
    } else {
      this.update_progress(
        0,
        `Axis name: R: ${radius_axis_name}, H: ${height_axis_name}, theta: ${angular_axis_name}\n`
      );
    }

    //1. 初期位置への移動
    //工具退避
    cldata.data.push(new CommentCL("ToolEscape"));
    const tool_escape = MainProcessorUtil.AxisDictionaryToDistanceArray({
      [radius_axis_name]: stock.radius + endmill.diameter + 10, //tmp: 10mm up
    });

    const escape_cl = new RapidCL(...tool_escape);
    cldata.data.push(escape_cl);

    //開始位置へ移動。（高さ0、角度0）半径方向軸は移動しない
    const start_position = MainProcessorUtil.AxisDictionaryToDistanceArray({
      [height_axis_name]: 0,
      [angular_axis_name]: 0,
    });
    const start_cl = new RapidCL(...start_position);
    cldata.data.push(start_cl);

    //2. レイヤー毎に加工パスを生成
    //各レイヤーのSectionのPathの同じindexの点を加工パスとする。
    //レイヤーを移動する場合は一度工具退避を実施し、初期位置へ移動してからレイヤー移動を行う。
    for (
      let layer_index = layered_sections.length - 1;
      layer_index >= 0;
      layer_index--
    ) {
      //レイヤーループ

      //レイヤー毎の加工パス生成
      this.update_progress(0, `Layer ${layer_index} processing...\n`);
      cldata.data.push(new CommentCL(`Layer ${layer_index}`));

      //レイヤーのセクション配列を取得
      const selected_layer_sections = layered_sections[layer_index];

      console.log("selectedlayer", selected_layer_sections);

      //レイヤー内の加工パスを生成
      for (
        let point_i = 0;
        point_i < selected_layer_sections[0].path.points.length;
        point_i++
      ) {
        //断面の点数ループ=輪切りの点数ループ
        cldata.data.push(new CommentCL(`Loop ${point_i}`));
        //レイヤーの点を加工パスに変換（回転軸1周分）
        selected_layer_sections.forEach((section, index) => {
          const point = section.path.points[point_i]; //加工対象点
          const angle = (360 / selected_layer_sections.length) * index; //加工対象断面の角度

          //加工パスを生成
          const axis = MainProcessorUtil.AxisDictionaryToDistanceArray({
            [radius_axis_name]: point.x,
            [height_axis_name]: point.y,
            [angular_axis_name]: angle,
          });

          //加工パスを追加
          cldata.data.push(new LinearCL(...axis, param.feedrate));
        });
        //一周の初期点に戻る加工パスを生成
        const first_point = selected_layer_sections[0].path.points[point_i];
        const first_axis = MainProcessorUtil.AxisDictionaryToDistanceArray({
          [radius_axis_name]: first_point.x,
          [height_axis_name]: first_point.y,
          [angular_axis_name]: 360,
        });
        cldata.data.push(new LinearCL(...first_axis, param.feedrate));
        cldata.data.push(new ResetRotationAngleCL());
      }
      //工具退避
      cldata.data.push(new CommentCL("ToolEscape"));

      cldata.data.push(escape_cl);
      cldata.data.push(start_cl);
    }
    this.finish_progress(`finish create CL Data\n---Finish MainProcessor---\n`);

    return cldata;
  }

  reset_progress() {
    this._processingprogress = 0;
    this._log_message = "";
    this.onProgress?.(0, "");
  }

  update_progress(progress_inc: number, message: string) {
    this._processingprogress += progress_inc;
    this._log_message += message;
    this.onProgress?.(this._processingprogress, this._log_message);
  }

  finish_progress(message: string) {
    const finish_progress_percent_main = 50;
    this._log_message += message;
    this.onProgress?.(finish_progress_percent_main, this._log_message);
  }

  error_end(message: string) {
    this._log_message += message;
    this.onErrorEnd?.(this._log_message);
  }
}
