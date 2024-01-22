import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";

export class ModelMaker {
  constructor() {
    console.log("ModelMaker constructor");
  }

  createCustomModel(
    options: BaseCylinderGeometryOptions,
    points: THREE.Vector3[] = []
  ): THREE.Mesh {
    const {
      radiusTop = 1,
      radiusBottom = 1,
      height = 1,
      radialSegments = 8,
      heightSegments = 1,
    } = options;

    const geometry = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
      heightSegments
    );

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  downloadModelAsSTL(model: THREE.Mesh, filename: string) {
    const exporter = new STLExporter();
    // 'mesh' is the THREE.Mesh you want to export
    const stlString = exporter.parse(model);
    // Create a blob from the STL string
    const blob = new Blob([stlString], { type: "text/plain" });

    // Create a link for the blob
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename + ".stl";
    link.click();
  }
}

export interface BaseCylinderGeometryOptions {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
}
