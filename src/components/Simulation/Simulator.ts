import { BaseStock, Cylinder } from "../CAM/Stock";
import { Endmill } from "../CAM/Endmill";
import {
  CLData,
  LinearCL,
  RapidCL,
  ResetRotationAngleCL,
} from "../CAM/MainProcessor/CL";
import { Machine } from "../CAM/Machine";
import { Vector2, Vector3 } from "three";

export class Simulator {
  voxel_div_size: number; //ボクセルの大きさ(mm)
  private _voxel_data: Array<Array<Array<boolean>>>;

  public get voxel_data(): Array<Array<Array<boolean>>> {
    return this._voxel_data;
  }

  public get is_exist_voxel(): boolean {
    return this._voxel_data.length > 0;
  }

  constructor() {
    this.voxel_div_size = 1;
    this._voxel_data = [];
  }

  async start(
    stock: BaseStock,
    endmill: Endmill,
    cldata: CLData,
    machine: Machine
  ) {
    this.createVoxelData(stock);
    //エンドミルはボールエンドミル想定。半径範囲のすべてのボクセルを消す
    const endmill_radius_count_voxel = Math.floor(
      endmill.diameter / 2 / this.voxel_div_size
    );

    const radius_axis = machine.axes.radius_axis;
    const current_pos = new Vector3(0, 0, 0); //現在の工具中心座標 0,0,0は原点。ストックの底部中心を原点とする
    let current_angle = 0; //現在の回転角度
    let current_radius = 0; //現在の半径
    let current_height = 0; //現在の高さ

    //現在の仮定(cl)：z=半径、y=高さ、b=角度(deg)
    //voxelの座標: x:半径*cos, y:半径*sin, z:高さ

    //cldataのデータを順番に処理
    //cldataの座標値がnullの場合、前回の座標値を使う
    for (const cl of cldata.data) {
      if (cl instanceof RapidCL) {
        //Rapidの場合、ボクセルを消さない
        const radius_pos = cl.z ?? current_radius;
        const height_pos = cl.y ?? current_height;
        const angle = cl.b ?? current_angle;

        current_pos.x = radius_pos * Math.cos(this.deg2rad(angle));
        current_pos.y = radius_pos * Math.sin(this.deg2rad(angle));
        current_pos.z = height_pos;
        current_angle = angle;
        current_radius = radius_pos;
        current_height = height_pos;
      } else if (cl instanceof LinearCL) {
        //Linearの場合、行き先を計算してボクセルを消す
        const radius_pos = cl.z ?? current_radius;
        const height_pos = cl.y ?? current_height;
        const angle = cl.b ?? current_angle;

        if (angle != current_angle) {
          //角度が変わる場合、円弧補完でボクセルを消していく
          const divcount = Math.floor(Math.abs(angle - current_angle)); //分割数
          this.eraseVoxelInterpolation(
            current_radius,
            current_height,
            current_angle,
            radius_pos,
            height_pos,
            angle,
            divcount,
            endmill_radius_count_voxel
          );
        } else if (
          radius_pos != current_radius ||
          height_pos != current_height
        ) {
          //半径、高さが変わる場合、直線補完でボクセルを消していく
          const distance = Math.sqrt(
            (radius_pos - current_radius) ** 2 +
              (height_pos - current_height) ** 2
          );
          const divcount = Math.floor(distance); //分割数
          this.eraseVoxelInterpolation(
            current_radius,
            current_height,
            current_angle,
            radius_pos,
            height_pos,
            angle,
            divcount,
            endmill_radius_count_voxel
          );
        }

        current_pos.x = radius_pos * Math.cos(this.deg2rad(angle));
        current_pos.y = radius_pos * Math.sin(this.deg2rad(angle));
        current_pos.z = height_pos;
        current_angle = angle;
        current_radius = radius_pos;
        current_height = height_pos;
      } else if (cl instanceof ResetRotationAngleCL) {
        current_angle = 0;
      }
    }
  }

  stop() {}

  debugVoxelString(): String {
    const xsize = this.voxel_data.length;
    const ysize = this.voxel_data[0].length;
    const zsize = this.voxel_data[0][0].length;
    const all_voxel_count = xsize * ysize * zsize;
    const estimate_memory_size = all_voxel_count * 1;
    return `voxel_size:[${this.voxel_data.length},${this.voxel_data[0].length},${this.voxel_data[0][0].length}]; \nall_voxel_count:${all_voxel_count}; \nestimate_memory_size:${(estimate_memory_size / 1024 / 1024).toFixed(2)}MB\n`;
  }

  deg2rad(deg: number) {
    return (deg * Math.PI) / 180;
  }

  // ボクセルindexから実座標へ変換
  // ボクセルは原点角の下から積み上げ式→実座標はストックの底部中心を原点とする
  convertVoxelPosToRealPos(
    x_index: number,
    y_index: number,
    z_index: number,
    voxel_div_size: number,
    real_stock_bottom_center_pos: Vector3
  ): Vector3 {
    const voxel_center_index = new Vector3(
      this.voxel_data.length / 2,
      this.voxel_data[0].length / 2,
      0
    );
    const x = x_index * voxel_div_size;
    const y = y_index * voxel_div_size;
    const z = z_index * voxel_div_size;
    return new Vector3(x, y, z)
      .sub(voxel_center_index)
      .add(real_stock_bottom_center_pos);
  }

  // 実座標からボクセルindexへ変換
  convertRealPosToVoxelindex(x: number, y: number, z: number): Vector3 {
    const voxel_center_index = new Vector3(
      this.voxel_data.length / 2,
      this.voxel_data[0].length / 2,
      0
    );
    const x_index = Math.floor(x / this.voxel_div_size + voxel_center_index.x);
    const y_index = Math.floor(y / this.voxel_div_size + voxel_center_index.y);
    const z_index = Math.floor(z / this.voxel_div_size + voxel_center_index.z);

    return new Vector3(x_index, y_index, z_index);
  }

  createVoxelData(stock: BaseStock) {
    //ボクセルデータの初期化
    this._voxel_data = [];
    const x_loop_count = Math.ceil((stock.radius * 2) / this.voxel_div_size);
    const y_loop_count = Math.ceil((stock.radius * 2) / this.voxel_div_size);
    const z_loop_count = Math.ceil(stock.height / this.voxel_div_size);
    const is_cylinder = stock instanceof Cylinder;

    for (let x = 0; x < x_loop_count; x++) {
      this._voxel_data[x] = [];
      for (let y = 0; y < y_loop_count; y++) {
        this._voxel_data[x][y] = [];
        for (let z = 0; z < z_loop_count; z++) {
          if (is_cylinder) {
            //ストックが円筒の場合、円筒の外側を消す
            const x_pos = x * this.voxel_div_size - stock.radius;
            const y_pos = y * this.voxel_div_size - stock.radius;
            if (Math.sqrt(x_pos ** 2 + y_pos ** 2) < stock.radius) {
              this._voxel_data[x][y][z] = true;
            } else {
              this._voxel_data[x][y][z] = false;
            }
          } else {
            this._voxel_data[x][y][z] = true;
          }
        }
      }
    }
  }

  //工具中心（index:x,y,z）のボクセルから指定サイズのボクセルを立方体で消す
  eraseVoxel(x: number, y: number, z: number, erase_size: number) {
    const erase_count = Math.floor(erase_size / this.voxel_div_size);
    for (let x_offset = -erase_count; x_offset <= erase_count; x_offset++) {
      for (let y_offset = -erase_count; y_offset <= erase_count; y_offset++) {
        for (let z_offset = -erase_count; z_offset <= erase_count; z_offset++) {
          const x_index = x + x_offset;
          const y_index = y + y_offset;
          const z_index = z + z_offset;
          if (
            x_index >= 0 &&
            x_index < this._voxel_data.length &&
            y_index >= 0 &&
            y_index < this._voxel_data[x_index].length &&
            z_index >= 0 &&
            z_index < this._voxel_data[x_index][y_index].length
          ) {
            this._voxel_data[x_index][y_index][z_index] = false;
          }
        }
      }
    }
  }

  eraseVoxelInterpolation(
    current_radius: number,
    current_height: number,
    current_angle: number,
    next_radius_pos: number,
    next_height_pos: number,
    next_angle: number,
    divcount: number,
    erase_size: number
  ) {
    const radius_interval = (next_radius_pos - current_radius) / divcount;
    const height_interval = (next_height_pos - current_height) / divcount;
    const angle_interval = (next_angle - current_angle) / divcount;

    for (let i = 0; i < divcount; i++) {
      const radius_pos = current_radius + radius_interval * i;
      const height_pos = current_height + height_interval * i;
      const angle = current_angle + angle_interval * i;
      const x = radius_pos * Math.cos(this.deg2rad(angle));
      const y = radius_pos * Math.sin(this.deg2rad(angle));
      const z = height_pos / this.voxel_div_size;
      const indexs = this.convertRealPosToVoxelindex(x, y, z);
      this.eraseVoxel(indexs.x, indexs.y, indexs.z, erase_size);
    }
  }
}
