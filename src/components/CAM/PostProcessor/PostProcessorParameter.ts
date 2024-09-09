import { Machine } from "../Machine";

export interface PostProcessorParameter {
  offset: Vector6; //オフセット
  coefficient: Vector6; //係数
  is_angle_reset_on_360: boolean; //360度を指定されるときに角度をリセットするか(true:360=0,false:カウントして720を許容)
  machine: Machine; //Machineの設定
}

export interface Vector6 {
  x: number | null;
  y: number | null;
  z: number | null;
  a: number | null;
  b: number | null;
  c: number | null;
}
