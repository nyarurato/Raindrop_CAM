import { Vector3 } from "three";

export class CLData {
  // Add your methods here
  data: Array<BaseCL>;
  constructor() {
    this.data = [];
  }

  /*
   * テキストのデータとして出力する
   * format: ex. RapidCL(0,0,0,0,0,0)
   */
  SaveAsTextURL(): string {
    let text = "";

    for (const cl of this.data) {
      text += cl.constructor.name;
      text += "(";
      if (cl instanceof RapidCL) {
        text += `${cl.x},${cl.y},${cl.z},${cl.a},${cl.b},${cl.c}`;
      } else if (cl instanceof LinearCL) {
        text += `${cl.x},${cl.y},${cl.z},${cl.a},${cl.b},${cl.c},${cl.feed}`;
      } else if (cl instanceof DwellCL) {
        text += `${cl.seconds}`;
      } else if (cl instanceof CommentCL) {
        text += `${cl.message}`;
      } else if (cl instanceof ResetRotationAngleCL) {
        //no arg
      }
      text += ")\n";
    }
    return URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  }
}

export abstract class BaseCL {}

export class RapidCL extends BaseCL {
  constructor(
    public x: number | undefined | null,
    public y: number | undefined | null,
    public z: number | undefined | null,
    public a: number | undefined | null,
    public b: number | undefined | null,
    public c: number | undefined | null
  ) {
    super();
  }
}

export class LinearCL extends BaseCL {
  constructor(
    public x: number | undefined | null,
    public y: number | undefined | null,
    public z: number | undefined | null,
    public a: number | undefined | null,
    public b: number | undefined | null,
    public c: number | undefined | null,
    public feed: number
  ) {
    super();
  }
}

export class DwellCL extends BaseCL {
  seconds: number;
  constructor(seconds: number) {
    super();
    this.seconds = seconds;
  }
}
export class CommentCL extends BaseCL {
  message: string;
  constructor(message: string) {
    super();
    this.message = message;
  }
}
export class ResetRotationAngleCL extends BaseCL {
  constructor() {
    super();
  }
}
