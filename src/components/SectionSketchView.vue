<template>
  <div ref="canvasRef"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

const canvasRef = ref(null);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

let points: Array<THREE.Vector2> = [];
let lines: Array<THREE.Line> = [];

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (canvasRef.value)
    (canvasRef.value as HTMLElement).appendChild(renderer.domElement);

  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  camera.position.z = 5;

  animate();
};

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

const addPoint = (x: number, y: number) => {
  const geometry = new THREE.CircleGeometry(0.1, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const point = new THREE.Mesh(geometry, material);
  point.position.x = x;
  point.position.y = y;
  scene.add(point);
  points.push(point);

  if (points.length > 1) {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => p.position)
    );
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    lines.push(line);
  }
};

const movePoint = (index: number, x: number, y: number) => {
  const point = points[index];
  point.x = x;
  point.y = y;

  if (lines.length > 0) {
    scene.remove(lines[index]);
    lines.splice(index, 1);

    if (points.length > 1) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => p.position)
      );
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      lines.splice(index, 0, line);
    }
  }
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  renderer.dispose();
});
</script>

<style scoped></style>
