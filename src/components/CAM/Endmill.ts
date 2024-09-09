export const EndmillType = {
  BALL: 0,
  SQUARE: 1,
} as const;

export type EndmillType = (typeof EndmillType)[keyof typeof EndmillType];

export class Endmill {
  private _endmill_type: EndmillType;
  private _diameter: number;
  private _effective_length: number;

  constructor(endmilltype: EndmillType, diameter: number, length: number) {
    this._diameter = diameter;
    this._effective_length = length;
    this._endmill_type = endmilltype;
  }

  // Getter methods
  get diameter(): number {
    return this._diameter;
  }

  set diameter(diameter: number) {
    this._diameter = diameter;
  }

  get effective_length(): number {
    return this._effective_length;
  }

  set effective_length(length: number) {
    this._effective_length = length;
  }
}
