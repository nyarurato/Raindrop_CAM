export const StockType = {
  None: -1,
  Cylinder: 0,
  RectangularPrism: 1,
} as const;

type StockType = (typeof StockType)[keyof typeof StockType];

export class BaseStock {
  height: number;
  radius: number;
  type: StockType;

  constructor(height: number, radius: number, type: StockType) {
    this.height = height;
    this.radius = radius;
    this.type = type;
  }

  public getVolume(): number {
    return this.getCylinderVolume();
  }

  private getCylinderVolume(): number {
    return Math.PI * this.radius ** 2 * this.height;
  }
}

export class RectangularPrism extends BaseStock {
  w: number;
  l: number;
  radius: number;

  constructor(height: number, radius: number, w: number, l: number) {
    const type = StockType.RectangularPrism;
    super(height, radius, type);
    this.radius = this.calcRadius(w, l);
    this.w = w;
    this.l = l;
  }

  private calcRadius(w: number, l: number): number {
    return Math.sqrt(w ** 2 + l ** 2) / 2;
  }

  public override getVolume(): number {
    return this.getRectangularPrismVolume();
  }

  private getRectangularPrismVolume(): number {
    return this.w * this.l * this.height;
  }
}

export class Cylinder extends BaseStock {
  constructor(height: number, radius: number) {
    const type = StockType.Cylinder;
    super(height, radius, type);
  }
}
