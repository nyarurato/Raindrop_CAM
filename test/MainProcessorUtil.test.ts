import { MainProcessorUtil } from "../src/components/CAM/MainProcessor/MainProcessorUitl";
import * as THREE from "three";
import { expect, test } from "vitest";
import { BasePath } from "../src/components/CAM/Path";

test("CreatePointOn2PointsLine", () => {
  const p1 = new THREE.Vector2(0, 0);
  const p2 = new THREE.Vector2(10, 10);
  const t = 0.5;
  const result = MainProcessorUtil.CreatePointOn2PointsLine(p1, p2, t);
  expect(result.x).toBe(5);
  expect(result.y).toBe(5);
});

test("AxisDictionaryToDistanceArray", () => {
  const axisDictionary = {
    X: 100,
    Z: 50,
    B: 20,
  };
  const result =
    MainProcessorUtil.AxisDictionaryToDistanceArray(axisDictionary);
  expect(result[0]).toBe(100);
  expect(result[1]).toBeNull();
  expect(result[2]).toBe(50);
  expect(result[3]).toBeNull();
  expect(result[4]).toBe(20);
  expect(result[5]).toBeNull();
});

test("InsertNewPointOnPath", () => {
  const path = new BasePath(new Array<THREE.Vector2>());
  path.points.push(new THREE.Vector2(0, 0));
  path.points.push(new THREE.Vector2(10, 10));
  path.points.push(new THREE.Vector2(20, 20));

  const insert_pos_y = 5;
  MainProcessorUtil.InsertNewPointOnPath(path, insert_pos_y);

  expect(path.points.length).toBe(4);
  expect(path.points[0].y).toBe(0);
  expect(path.points[1].y).toBe(5);
  expect(path.points[2].y).toBe(10);
  expect(path.points[3].y).toBe(20);
});

test("InsertNewPointOnPathWithDivide", () => {
  const start_point = new THREE.Vector2(0, 0);
  const end_point = new THREE.Vector2(10, 10);
  const divide_num = 5;
  const result = MainProcessorUtil.InsertNewPointOnPathWithDivide(
    start_point,
    end_point,
    divide_num
  );
  expect(result.length).toBe(divide_num - 1);
  expect(result[0].x).toBeCloseTo(2);
  expect(result[0].y).toBeCloseTo(2);
  expect(result[1].x).toBeCloseTo(4);
  expect(result[1].y).toBeCloseTo(4);
  expect(result[2].x).toBeCloseTo(6);
  expect(result[2].y).toBeCloseTo(6);
  expect(result[3].x).toBeCloseTo(8);
  expect(result[3].y).toBeCloseTo(8);
});
