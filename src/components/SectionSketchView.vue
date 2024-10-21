<template>
  <v-row>
    <v-col
      ><canvas ref="canvasref" @contextmenu.prevent style="touch-action: none">
      </canvas
    ></v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-btn @click="SaveSection" color="success">編集完了</v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
canvas {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgb(173, 173, 173);
}
</style>

<script lang="ts" setup>
import { ref, onMounted, inject, watch } from "vue";
import { Vector2 } from "three";
import { useToast } from "vue-toastification";
import { BaseStock } from "./CAM/Stock";
import { ReactiveParameters } from "./CAM/Parameters";
import { NURBSPath } from "./CAM/Path";
import Two from "two.js";
import { Circle } from "two.js/src/shapes/circle";
import { c } from "vite/dist/node/types.d-aGj9QkWt";

const canvasref = ref<HTMLCanvasElement | null>(null);
const points = ref<Vector2[]>([]);
const toast = useToast();

let two: Two;

let scale_factor = 1;
let axis_origin_x = 0;
let axis_origin_y = 0;

const decimal_point_order = 0;

const Param = inject(
  "Param",
  () => new ReactiveParameters(),
  true
) as ReactiveParameters;

const stock = Param.stocks.value[0] as BaseStock;

const props = defineProps<{
  points?: Array<Vector2>;
}>();

const point_objects: Array<Circle> = [];
const current_point_copy = new Vector2();

onMounted(() => {
  if (canvasref.value) {
    setup_initial_points();

    drawInit();

    two.renderer.domElement.addEventListener("pointerdown", handleMouseDown);
    two.renderer.domElement.addEventListener("pointermove", handleMouseMove);
    two.renderer.domElement.addEventListener("pointerup", handleMouseUp);
    two.renderer.domElement.addEventListener("pointercandel", handlecancel);
  }
});

window.addEventListener("resize", () => {
  drawInit();
});

function drawInit() {
  if (!canvasref.value) return;

  const tow_params = {
    type: Two.Types.canvas,
    autostart: true,
    domElement: canvasref.value,
  };
  if (!two) two = new Two(tow_params);
  two.clear();

  const axis_margin = 30;

  if (stock.radius && stock.height) {
    scale_factor = Math.min(
      ((two.width - 2 * axis_margin) * 0.9) / stock.radius,
      ((two.height - 2 * axis_margin) * 0.9) / stock.height
    );
  }

  const [origin_x, origin_y] = drawAxis(two, 30, 30, axis_margin);
  drawStock(two, stock.radius, stock.height, origin_x, origin_y, scale_factor);
  draw_line_points(two, points.value, origin_x, origin_y, scale_factor);
  draw_line_info(two, points.value);
}

function drawAxis(
  tw: Two,
  v_axis_from_right: number,
  h_axis_from_bottom: number,
  margin: number
): [number, number] {
  const width = tw.width;
  const height = tw.height;
  const gray = "#ababab";

  const origin_x = width - v_axis_from_right - margin;
  const origin_y = height - h_axis_from_bottom - margin;
  axis_origin_x = origin_x;
  axis_origin_y = origin_y;

  const v_axis = tw.makeArrow(origin_x, height - margin, origin_x, margin, 5);
  v_axis.stroke = gray;
  v_axis.linewidth = 2;

  const h_axis = tw.makeArrow(width - margin, origin_y, margin, origin_y, 5);
  h_axis.stroke = gray;
  h_axis.linewidth = 2;

  const origin = tw.makeCircle(origin_x, origin_y, 3);
  origin.fill = "black";

  const origin_text = tw.makeText(
    "(0,0)",
    width - v_axis_from_right - margin / 2,
    height - h_axis_from_bottom - margin / 2
  );
  origin_text.size = 12;

  const v_axis_text = tw.makeText("回転軸", width - margin + 5, height / 2);
  v_axis_text.size = 12;

  const h_axis_text = tw.makeText(
    "半径方向",
    width / 2,
    height - h_axis_from_bottom - margin + 15
  );
  h_axis_text.size = 12;

  return [origin_x, origin_y];
}

function drawStock(
  tw: Two,
  stock_radius: number,
  stock_height: number,
  origin_x: number,
  origin_y: number,
  scale = 1
) {
  const gray = "#e0e0e0ab";

  const stock = tw.makeRectangle(
    origin_x - (stock_radius * scale) / 2,
    origin_y - (stock_height * scale) / 2,
    stock_radius * scale,
    stock_height * scale
  );
  stock.fill = gray;
  stock.stroke = "black";
  stock.linewidth = 0.3;
}

function draw_line_points(
  tw: Two,
  points: Vector2[],
  origin_x: number,
  origin_y: number,
  scale = 1
) {
  const red = "#ff0000";
  const gray = "#ababab";

  const line = tw.makePath(
    points.map(
      (p) => new Two.Anchor(-p.x * scale + origin_x, -p.y * scale + origin_y)
    )
  );
  line.stroke = red;
  line.linewidth = 2;
  line.fill = "none";
  line.closed = false;

  point_objects.splice(0, point_objects.length); //clear
  points.forEach((p, index) => {
    const point = tw.makeCircle(
      -p.x * scale + origin_x,
      -p.y * scale + origin_y,
      4
    );
    point.fill = red;
    point.linewidth = 0.5;
    point_objects.push(point);

    const text = tw.makeText(
      `${index + 1}`,
      10 - p.x * scale + origin_x,
      -p.y * scale + origin_y
    );
    text.size = 12;
  });
}

function draw_line_info(tw: Two, points: Vector2[]) {
  const text_param = {
    size: 12,
    fill: "black",
    family: "Arial",
    alignment: "left",
  };
  tw.makeText(`N = ${points.length}`, 20, 20, text_param);
  tw.makeText(`Name: ${Param.selectedSection.value?.name}`, 20, 40, text_param);
  tw.makeText(
    "左クリックで点を移動、右クリックで点を追加・削除",
    tw.width / 2,
    15,
    text_param
  ).alignment = "center";
}

function setup_initial_points() {
  if (props.points && props.points.length > 2) {
    points.value = props.points;
  } else if (
    Param.selectedSection.value?.path &&
    Param.selectedSection.value?.path.points.length > 2
  ) {
    points.value = Param.selectedSection.value.path.points;
    return;
  } else if (stock.radius && stock.height) {
    const x = stock.radius / 2;
    const y = stock.height / 2;
    points.value = [
      new Vector2(x, y * 0),
      new Vector2(x, y * 1),
      new Vector2(x, y * 2),
    ];
  } else {
    points.value = [
      new Vector2(0, 0),
      new Vector2(0, 100),
      new Vector2(0, 200),
    ];
  }

  if (Param.selectedSection.value)
    Param.selectedSection.value.path.points = points.value;
}

function convert_MouseXY_to_pointxy(
  index: number,
  offsetX: number,
  offsetY: number
): Vector2 {
  let x = (axis_origin_x - offsetX) / scale_factor;
  let y = (axis_origin_y - offsetY) / scale_factor;

  if (stock.height && stock.radius) {
    if (x < 0) x = 0;
    else if (x > stock.radius) x = stock.radius;

    if (y < 0) y = 0;
    else if (y > stock.height) y = stock.height;

    if (index === 0) {
      y = 0;
    } else if (index === points.value.length - 1) {
      y = stock.height;
    }
  }

  return new Vector2(x, y);
}

function convert_pointxy_to_canvasXY(point: Vector2): Vector2 {
  return new Vector2(
    -point.x * scale_factor + axis_origin_x,
    -point.y * scale_factor + axis_origin_y
  );
}

function round_point_decimal_point(v: Vector2, order?: number): Vector2 {
  if (order) {
    return new Vector2(
      Math.round(v.x * 10 ** order) / 10 ** order,
      Math.round(v.y * 10 ** order) / 10 ** order
    );
  } else {
    return new Vector2(
      Math.round(v.x * 10 ** decimal_point_order) / 10 ** decimal_point_order,
      Math.round(v.y * 10 ** decimal_point_order) / 10 ** decimal_point_order
    );
  }
}

let selected_point_index = -1;
let is_dragging = false;
const drag_threshold = 10;

function draw_seleced_point_info(tw: Two, selected_point_index: number) {
  const margin = 5;
  if (selected_point_index >= 0) {
    const point = points.value[selected_point_index];
    const point_on_canvas = convert_pointxy_to_canvasXY(point);
    const origin_x = 0;
    const origin_y = 0;

    const text_param = {
      size: 12,
      fill: "black",
      family: "Arial",
      alignment: "left",
    };

    // Horizontal line
    const h_line = tw.makeLine(
      point_on_canvas.x,
      point_on_canvas.y,
      axis_origin_x,
      point_on_canvas.y
    );
    h_line.stroke = "black";
    h_line.linewidth = 0.5;
    h_line.dashes = [2, 2];

    // Vertical line
    const v_line = tw.makeLine(
      point_on_canvas.x,
      point_on_canvas.y,
      point_on_canvas.x,
      axis_origin_y
    );
    v_line.stroke = "black";
    v_line.linewidth = 0.5;
    v_line.dashes = [2, 2];

    // Position label on axis
    tw.makeText(
      `${point.y.toFixed(1)}`,
      axis_origin_x + margin,
      point_on_canvas.y + margin,
      text_param
    );

    tw.makeText(
      `${point.x.toFixed(1)}`,
      point_on_canvas.x + margin,
      axis_origin_y + 10 + margin,
      text_param
    ).alignment = "center";
  }
}

function check_intersection(
  p1: Vector2,
  p2: Vector2,
  p3: Vector2,
  p4: Vector2
): boolean {
  const s1_x = p2.x - p1.x;
  const s1_y = p2.y - p1.y;
  const s2_x = p4.x - p3.x;
  const s2_y = p4.y - p3.y;

  const s =
    (-s1_y * (p1.x - p3.x) + s1_x * (p1.y - p3.y)) /
    (-s2_x * s1_y + s1_x * s2_y);
  const t =
    (s2_x * (p1.y - p3.y) - s2_y * (p1.x - p3.x)) /
    (-s2_x * s1_y + s1_x * s2_y);

  return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

function check_self_intersection(): [is_intersect: boolean, index: number] {
  for (let i = 0; i < points.value.length - 1; i++) {
    for (let j = i + 1; j < points.value.length - 1; j++) {
      if (i === 0 && j === points.value.length - 1) continue;
      if (i === j - 1) continue;
      if (i === j) continue;

      const p1 = points.value[i];
      const p2 = points.value[i + 1];
      const p3 = points.value[j];
      const p4 = points.value[j + 1];

      if (p1 && p2 && p3 && p4) {
        const is_intersect = check_intersection(p1, p2, p3, p4);
        if (is_intersect) {
          return [true, i];
        }
      }
    }
  }
  return [false, -1];
}

function check_overhang(): boolean {
  // Yが昇順になっているかどうかを確認する
  const overhang = points.value.every((point, index) => {
    if (index === 0) return true;
    if (point.y < points.value[index - 1].y) {
      return false;
    }
    return true;
  });
  return !overhang;
}

function check_start_last_point(): boolean {
  if (points.value.length < 3) return false;

  const start_point = points.value[0];
  const last_point = points.value[points.value.length - 1];

  return start_point.y === 0 && last_point.y === stock.height;
}

// false: out of range
// true: in range
function check_points_range_in_stock(): boolean {
  if (!stock.radius || !stock.height) return false;

  const out_of_range = points.value.some(
    (point) =>
      point.x < 0 ||
      point.x > stock.radius ||
      point.y < 0 ||
      point.y > stock.height
  );
  return !out_of_range;
}

function fix_out_of_range(): void {
  if (!check_points_range_in_stock()) {
    //out of range
    toast.warning("範囲外の点があります。範囲内に修正します。");
    points.value = points.value.map((point) => {
      if (point.x < 0) {
        point.x = 0;
      } else if (point.x > stock.radius) {
        point.x = stock.radius;
      }

      if (point.y < 0) {
        point.y = 0;
      } else if (point.y > stock.height) {
        point.y = stock.height;
      }

      return point;
    });
  }
  if (!check_start_last_point()) {
    toast.warning("開始点と終了点が範囲外です。範囲内に修正します。");
    points.value[0].y = 0;
    points.value[points.value.length - 1].y = stock.height;
  }
}

//立ち壁（Y同一点）があるかどうかを確認する
function check_wall(): boolean {
  if (points.value.length < 3) return false;

  const wall = points.value.some((point, index) => {
    if (index === 0 || index === points.value.length - 1) return false;
    if (point.y === points.value[index - 1].y) {
      return true;
    }
    return false;
  });
  return wall;
}

function handleMouseDown(event: PointerEvent) {
  const X = event.clientX;
  const Y = event.clientY;

  const device_drag_threshold = drag_threshold / scale_factor;
  let near_point_index = -1;

  const canvas_rect = canvasref.value?.getBoundingClientRect();
  if (!canvas_rect) return;

  for (let i = 0; i < points.value.length; i++) {
    const shape = point_objects[i];
    const rect = shape.getBoundingClientRect(false);
    if (
      rect.left + canvas_rect.x <= X &&
      X <= rect.right + canvas_rect.x &&
      rect.top + canvas_rect.y <= Y &&
      Y <= rect.bottom + canvas_rect.y
    ) {
      near_point_index = i;
      is_dragging = true;
      break;
    }
  }

  if (near_point_index >= 0) {
    selected_point_index = near_point_index;
    is_dragging = true;
    current_point_copy.set(
      points.value[selected_point_index].x,
      points.value[selected_point_index].y
    );
  } else {
    selected_point_index = -1;
    is_dragging = false;
    current_point_copy.set(-1, -1);
  }
}

function handleMouseMove(event: PointerEvent) {
  // Implement logic to move points when the mouse is dragged
  if (is_dragging && selected_point_index >= 0) {
    const canvas_rect = canvasref.value?.getBoundingClientRect();
    const X = event.clientX - canvas_rect!.x;
    const Y = event.clientY - canvas_rect!.y;

    points.value[selected_point_index] = round_point_decimal_point(
      convert_MouseXY_to_pointxy(selected_point_index, X, Y)
    );

    if (two) {
      drawInit();
      draw_seleced_point_info(two, selected_point_index);
    }
  }
}

function handleMouseUp(event: PointerEvent) {
  if (event.button === 0) {
    //left click
    if (is_dragging) {
      const [is_intersect, index] = check_self_intersection();

      if (is_intersect) {
        toast.warning("自己交差しています。自己交差を解消します。");
        points.value.sort((a, b) => a.y - b.y);
      }

      const overhang = check_overhang();
      if (overhang) {
        toast.warning("オーバーハングしています。オーバーハングを解消します。");
        points.value.sort((a, b) => a.y - b.y);
      }

      const wall = check_wall();
      if (wall) {
        toast.warning("立壁形状があります。元に戻します。"); //v0.1.0
        points.value[selected_point_index].set(
          current_point_copy.x,
          current_point_copy.y
        );
      }
    }
  } else if (event.button === 2) {
    //right click
    if (
      is_dragging &&
      points.value.length >= 3 &&
      selected_point_index != 0 &&
      selected_point_index != points.value.length - 1
    ) {
      //erase point
      points.value.splice(selected_point_index, 1);
      selected_point_index = -1;
    } else if (!is_dragging) {
      //add point
      addPoint(event);
    }
  }

  is_dragging = false;
  selected_point_index = -1;
  current_point_copy.set(-1, -1);

  drawInit();
}

function handlecancel(event: PointerEvent) {
  console.log("pointercancel event");
  is_dragging = false;
  selected_point_index = -1;
  points.value[selected_point_index].set(
    current_point_copy.x,
    current_point_copy.y
  );
  current_point_copy.set(-1, -1);
}

function addPoint(event: PointerEvent) {
  const canvas_rect = canvasref.value?.getBoundingClientRect();
  const X = event.clientX - canvas_rect!.x;
  const Y = event.clientY - canvas_rect!.y;
  //search nearest point
  const x = (axis_origin_x - X) / scale_factor;
  const y = (axis_origin_y - Y) / scale_factor;

  if (!stock.height || !stock.radius) return;

  if (x < 0 || x > stock.radius || y < 0 || y > stock.height) {
    //範囲外の点は追加しない
    console.log("out of range", x, y, stock.radius, stock.height);
    is_dragging = false;
    selected_point_index = -1;
    return;
  }

  const click_point = round_point_decimal_point(new Vector2(x, y));
  console.log("clock", click_point);

  points.value.sort((a, b) => a.y - b.y);
  const near_point_index = points.value.findLastIndex(
    (point, index) => point.y <= click_point.y
  );

  if (near_point_index >= 0) {
    points.value.splice(near_point_index + 1, 0, click_point);
  }
}

function SaveSection() {
  if (check_self_intersection()[0]) {
    toast.error("自己交差しています。自己交差を解消してください。");
    return;
  }

  if (check_overhang()) {
    toast.error("オーバーハングしています。オーバーハングを解消してください。");
    return;
  }

  if (!check_points_range_in_stock()) {
    toast.error("範囲外の点があります。範囲内に修正してください。");
    return;
  }

  if (!check_start_last_point()) {
    toast.error("開始点と終了点が範囲外です。範囲内に修正してください。");
    return;
  }

  if (check_wall()) {
    toast.error("立ち壁形状があります。立ち壁を解消してください。");
    return;
  }
  const path = new NURBSPath(points.value);
  if (Param.selectedSection.value) {
    Param.selectedSection.value.path = path;
  }
  toast.success("断面データを保存しました。");
}

watch(
  () => [stock.radius, stock.height],
  () => {
    fix_out_of_range();
    drawInit();
  }
);

watch(
  () => Param.selectedSection.value,
  () => {
    setup_initial_points();
    drawInit();
  }
);
</script>
