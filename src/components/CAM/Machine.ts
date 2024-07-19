export const AxisType = {
  X: 0,
  Y: 1,
  Z: 2,
  A: 3,
  B: 4,
  C: 5,
} as const;

type AxisType = (typeof AxisType)[keyof typeof AxisType];

export class Axis {
  private _axis_type: AxisType;
  private _max_limit_position: number;
  private _min_limit_position: number;

  constructor(
    axis_type: AxisType,
    max_limit_position: number,
    min_limit_position: number
  ) {
    this._axis_type = axis_type;
    this._max_limit_position = max_limit_position;
    this._min_limit_position = min_limit_position;
  }

  // Getter methods
  get axis_type(): AxisType {
    return this._axis_type;
  }
  get max_limit_position(): number {
    return this._max_limit_position;
  }
  get min_limit_position(): number {
    return this._min_limit_position;
  }
}

export class AxisStructure {
  private _axis: Axis[];

  constructor(axis: Axis[]) {
    this._axis = axis;
  }

  public getAxis(axis_type: AxisType): Axis | undefined {
    return this._axis.find((axis) => axis.axis_type === axis_type);
  }
}

export class Machine {
  private _name: string;
  private _max_feedrate: number;
  private _max_spindle_speed: number;

  constructor(name: string, max_feedrate: number, max_spindle_speed: number) {
    this._name = name;
    this._max_feedrate = max_feedrate;
    this._max_spindle_speed = max_spindle_speed;
  }

  // Getter methods
  get name(): string {
    return this._name;
  }

  set name(name: string) {
    this._name = name;
  }

  get max_feedrate(): number {
    return this._max_feedrate;
  }

  set max_feedrate(max_feedrate: number) {
    this._max_feedrate = max_feedrate;
  }

  get max_spindle_speed(): number {
    return this._max_spindle_speed;
  }

  set max_spindle_speed(max_spindle_speed: number) {
    this._max_spindle_speed = max_spindle_speed;
  }
}
