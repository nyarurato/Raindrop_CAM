import * as THREE from "three";
import { NURBSCurve } from "three/examples/jsm/curves/NURBSCurve";
import { NURBSPath } from "./Path";

export class Section {
  path: NURBSPath;
  projectionPlane: THREE.Plane;
  origin: THREE.Vector3;
  name: string;

  constructor(
    origin: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    path: NURBSPath = new NURBSPath([]),
    projectionPlaneNormalVec: THREE.Vector3 = new THREE.Vector3(0, 0, 1),
    name = ""
  ) {
    this.origin = origin;
    this.path = path;
    this.projectionPlane = new THREE.Plane(
      projectionPlaneNormalVec.normalize()
    );
    if (name === "") {
      //set random name
      this.name = "Section_" + Math.random().toString(36).substring(2, 5);
    } else {
      this.name = name;
    }
  }

  setProjectionPlane(projectionPlaneNormalVec: THREE.Vector3): void {
    this.projectionPlane = new THREE.Plane(
      projectionPlaneNormalVec.normalize()
    );
  }

  getPlaneGeometry(width = 2, height = 5): THREE.PlaneGeometry {
    const planeGeometry = new THREE.PlaneGeometry(width, height);
    planeGeometry.lookAt(this.projectionPlane.normal);
    return planeGeometry;
  }

  //平面上のXYを3DのXYZに変換し、変換された曲線を返す。
  convertTo3D(): NURBSCurve {
    const nurbsCurve2D = this.path.GetNurbsCurve();
    const normal_vec = this.projectionPlane.normal;
    const convertedPoints: THREE.Vector3[] = new Array<THREE.Vector3>();

    //座標変換を実施する
    //クォータニオンを使って、Z軸が平面の法線に一致するように回転させる。
    const rotate_quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal_vec
    );

    nurbsCurve2D.controlPoints.forEach((point) => {
      let convertedPoint: THREE.Vector3;
      if (point instanceof THREE.Vector3) {
        convertedPoint = point.applyQuaternion(rotate_quaternion);
      } else if (point instanceof THREE.Vector2) {
        convertedPoint = new THREE.Vector3(point.x, point.y, 0).applyQuaternion(
          rotate_quaternion
        );
      } else {
        //Vector4
        convertedPoint = new THREE.Vector3(
          point.x,
          point.y,
          point.z
        ).applyQuaternion(rotate_quaternion);
      }
      convertedPoints.push(convertedPoint);
    });

    const nurbsCurve3D = new NURBSCurve(1, nurbsCurve2D.knots, convertedPoints);
    console.log("pre-converted", nurbsCurve2D);
    console.log("converted", nurbsCurve3D);
    return nurbsCurve3D;
  }
}

//中心点に対して回転させるようなオブジェクトを生成する
export class Rotary3DBuilder {
  sections: Section[];

  constructor(sections: Section[]) {
    this.sections = sections;
  }

  buildMesh(material: THREE.Material): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 1); //tmp
    return new THREE.Mesh(geometry, material);
  }

  // Add other methods as needed
}
