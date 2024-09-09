import { BasePath } from "../Path";
import * as THREE from "three";

export class MainProcessorUtil {
  /*
   * Convert axis type to Position array
   * {"X":100,"Z":50,"B":20} => [100,null,50,null,20,null]
   *
   */
  public static AxisDictionaryToDistanceArray(axisDictionary: {
    [key: string]: number;
  }): [
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null
  ] {
    const axisArray: [
      number | null,
      number | null,
      number | null,
      number | null,
      number | null,
      number | null
    ] = [null, null, null, null, null, null];
    for (const key in axisDictionary) {
      const axis = key as "X" | "Y" | "Z" | "A" | "B" | "C";
      const index = MainProcessorUtil.AxisTypeToIndex(axis);
      axisArray[index] = axisDictionary[axis];
    }
    return axisArray;
  }

  /*
   * Convert Position array to axis type
   * "X" => 0, "A" => 3
   */
  public static AxisTypeToIndex(
    axis: "X" | "Y" | "Z" | "A" | "B" | "C"
  ): number {
    switch (axis) {
      case "X":
        return 0;
      case "Y":
        return 1;
      case "Z":
        return 2;
      case "A":
        return 3;
      case "B":
        return 4;
      case "C":
        return 5;
      default:
        throw new Error("Invalid Axis Name");
    }
  }

  /*
   * destructive method
   * Insert new point to path
   * @param {BasePath} path path
   * @param {number} insert_pos_y y position to insert
   */
  public static InsertNewPointOnPath(
    path: BasePath,
    insert_pos_y: number
  ): void {
    //高さ方向に同値の点がある場合は処理しない
    if (path.points.some((point: THREE.Vector2) => point.y === insert_pos_y)) {
      return;
    }

    //高さ方向に同値の点がない場合は追加。
    //index昇順で見ていきyの値が挟まれる領域に線形補完を行いで点を追加する。
    const last_index_previous_pos_h = path.points.findLastIndex(
      (point: THREE.Vector2) => point.y <= insert_pos_y
    );
    //console.log("InserNewPoint", path.points, "pos_y", insert_pos_y);
    if (last_index_previous_pos_h < 0) {
      //見つからない場合。最初の点よりも小さい場合（マイナス）
      throw new Error(
        `Invalid insert position. It may be negative. i:${last_index_previous_pos_h}, y: ${insert_pos_y}`
      );
    } else if (last_index_previous_pos_h === path.points.length) {
      //見つかった場合。最後の点よりも大きい場合（ストック超え）
      throw new Error(
        `Invalid insert position. It may be over the stock size. i:${last_index_previous_pos_h}, y: ${insert_pos_y}`
      );
    } else if (path.points[last_index_previous_pos_h + 1].y === insert_pos_y) {
      //たち壁形状において最後の点が採用されなかった場合
      throw new Error(
        `Invalid insert position. It may be Wall Shape. i:${last_index_previous_pos_h}, y: ${insert_pos_y}`
      );
    } else if (path.points[last_index_previous_pos_h + 1].y > insert_pos_y) {
      //正常
      path.points.splice(
        last_index_previous_pos_h + 1,
        0,
        MainProcessorUtil.CreatePointOn2PointsLine(
          path.points[last_index_previous_pos_h],
          path.points[last_index_previous_pos_h + 1],
          (insert_pos_y - path.points[last_index_previous_pos_h].y) /
            (path.points[last_index_previous_pos_h + 1].y -
              path.points[last_index_previous_pos_h].y)
        )
      );
      return;
    } else {
      //それ以外の場合
      throw new Error(
        `Invalid insert position. Other Error. i:${last_index_previous_pos_h}, y: ${insert_pos_y}`
      );
    }
  }

  /*
   * パスを指定個数に分割して返す
   * (0,0) -> (10,10) 5分割 -> return [(2,2),(4,4),(6,6),(8,8)]
   */
  public static InsertNewPointOnPathWithDivide(
    start_point: THREE.Vector2,
    end_point: THREE.Vector2,
    divide_num: number
  ): THREE.Vector2[] {
    const new_points = new Array<THREE.Vector2>(); //新しい点群
    const t_interval = 1 / divide_num;

    for (let i = 1; i < divide_num; i++) {
      new_points.push(
        MainProcessorUtil.CreatePointOn2PointsLine(
          start_point,
          end_point,
          t_interval * i
        )
      );
    }
    return new_points;
  }

  public static CreatePointOn2PointsLine(
    p1: THREE.Vector2,
    p2: THREE.Vector2,
    t: number
  ): THREE.Vector2 {
    return new THREE.Vector2(
      p1.x + (p2.x - p1.x) * t,
      p1.y + (p2.y - p1.y) * t
    );
  }
}
