import * as THREE from "three";

self.onmessage = (event) => {
  const data = event.data.voxel_flag;
  const show_remain_voxel = event.data.show_remain_voxel;
  const show_removed_voxel = event.data.show_removed_voxel;
  const radius = event.data.radius;

  console.log("start voxel calculating in web worker");

  const all_item = data.length * data[0].length * data[0][0].length;

  const start_position = new THREE.Vector3(0, 0, 0);
  const voxel_size = 1;

  const remainMatrices = new Array<THREE.Matrix4Tuple>();
  const removedMatrices = new Array<THREE.Matrix4Tuple>();

  const pos_offset = new THREE.Vector3(
    (-data.length * voxel_size) / 2,
    (-data[0].length * voxel_size) / 2,
    0
  );

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      for (let k = 0; k < data[i][j].length; k++) {
        const voxel = new THREE.Object3D();
        voxel.position.set(
          start_position.x + i * voxel_size + pos_offset.x,
          start_position.z + k * voxel_size + pos_offset.z,
          start_position.y + j * voxel_size + pos_offset.y
        );
        voxel.updateMatrix();
        if (data[i][j][k]) {
          if (!show_remain_voxel) {
            continue;
          }
          remainMatrices.push(voxel.matrix.toArray());
        } else {
          if (!show_removed_voxel) {
            continue;
          }
          if (
            (i * voxel_size + pos_offset.x) ** 2 +
              (j * voxel_size + pos_offset.y) ** 2 <
            radius ** 2
          ) {
            removedMatrices.push(voxel.matrix.toArray());
          }
        }
      }
    }
  }

  self.postMessage({ remain: remainMatrices, removed: removedMatrices });
};

export default {};
