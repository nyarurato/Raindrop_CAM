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
  private _max_limit_position: number | undefined;
  private _min_limit_position: number | undefined;
  AxisName = {
    [AxisType.X]: "X",
    [AxisType.Y]: "Y",
    [AxisType.Z]: "Z",
    [AxisType.A]: "A",
    [AxisType.B]: "B",
    [AxisType.C]: "C",
  } as const;

  constructor(
    axis_type: AxisType,
    max_limit_position?: number,
    min_limit_position?: number
  ) {
    this._axis_type = axis_type;
    this._max_limit_position = max_limit_position;
    this._min_limit_position = min_limit_position;
  }

  // Getter methods
  get axis_type(): AxisType {
    return this._axis_type;
  }
  get max_limit_position(): number | null {
    return this._max_limit_position ?? null;
  }
  get min_limit_position(): number | null {
    return this._min_limit_position ?? null;
  }
  get name(): string {
    return this.AxisName[this._axis_type];
  }
}

export class AxisStructure {
  private _axis: Axis[];
  private _radius_axis: Axis | undefined;
  private _height_axis: Axis | undefined;
  private _angular_axis: Axis | undefined;

  constructor(
    axis: Axis[],
    radius_axis?: Axis,
    height_axis?: Axis,
    angular_axis?: Axis
  ) {
    this._axis = axis;
    this._radius_axis = radius_axis;
    this._height_axis = height_axis;
    this._angular_axis = angular_axis;
  }

  public getAxis(axis_type: AxisType): Axis | undefined {
    return this._axis.find((axis) => axis.axis_type === axis_type);
  }
  // Getter methods
  get axis(): Axis[] {
    return this._axis;
  }

  get radius_axis(): Axis | undefined {
    return this._radius_axis;
  }
  set radius_axis(axis: Axis) {
    this._radius_axis = axis;
  }

  get height_axis(): Axis | undefined {
    return this._height_axis;
  }
  set height_axis(axis: Axis) {
    this._height_axis = axis;
  }

  get angular_axis(): Axis | undefined {
    return this._angular_axis;
  }
  set angular_axis(axis: Axis) {
    this._angular_axis = axis;
  }
}

export class Machine {
  private _name: string;
  private _max_feedrate: number;
  private _axes: AxisStructure;

  constructor(name?: string, max_feedrate?: number) {
    this._name = name ?? "Machine";
    this._max_feedrate = max_feedrate ?? 1000;
    const axes = [
      new Axis(AxisType.Z),
      new Axis(AxisType.Y),
      new Axis(AxisType.B),
    ];
    this._axes = new AxisStructure(axes, axes[0], axes[1], axes[2]);
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

  get axes(): AxisStructure {
    return this._axes;
  }
  set axes(axes: AxisStructure) {
    this._axes = axes;
  }
}
