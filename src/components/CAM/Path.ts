import * as THREE from "three";
import { NURBSCurve } from "three/examples/jsm/curves/NURBSCurve";

export class BasePath {
  points: THREE.Vector2[];

  constructor(points: THREE.Vector2[]) {
    this.points = points;
  }
}

export class NURBSPath extends BasePath {
  constructor(points: THREE.Vector2[]) {
    super(points);
  }

  GetNurbsCurve(): NURBSCurve {
    const controlPoints: THREE.Vector3[] = new Array<THREE.Vector3>();
    this.points.forEach((point) => {
      controlPoints.push(new THREE.Vector3(point.x, point.y, 0));
    });
    const degree = 1; // NURBS次数 1=直線, 2=2次曲線, 3=3次曲線
    const knots: number[] = [];
    for (let i = 0; i < controlPoints.length + degree + 1; i++) {
      //?
      knots.push(i);
    }
    //NURBSの条件チェック
    if (degree >= controlPoints.length) {
      throw new Error("degree must be less than controlPoints.length");
    }
    if (knots.length !== controlPoints.length + degree + 1) {
      throw new Error(
        "knots.length must be equal to controlPoints.length + degree + 1"
      );
    }

    const nurbsCurve = new NURBSCurve(degree, knots, controlPoints);
    return nurbsCurve;
  }

  clone(): NURBSPath {
    return new NURBSPath([...this.points]);
  }
}
