<template>
  <canvas ref="canvasref" @contextmenu.prevent> </canvas>
  <v-btn @click="SaveSection" color="success">編集完了</v-btn>
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

const canvasref = ref<HTMLCanvasElement | null>(null);
const points = ref<Vector2[]>([]);
const toast = useToast();

let scale_factor = 1;
let origin_x = 0;
let origin_y = 0;

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

onMounted(() => {
  if (canvasref.value) {
    const canvas = canvasref.value;
    const ctx = canvas.getContext("2d");
    setup_initial_points();

    if (ctx) {
      drawInit(ctx);

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
    }
  }
});

window.addEventListener("resize", () => {
  if (canvasref.value) {
    const canvas = canvasref.value;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawInit(ctx);
    }
  }
});

function drawInit(ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;
  const rect = ctx.canvas.getBoundingClientRect();
  const width = rect.width * dpr;
  const height = rect.height * dpr;
  const axis_margin = 30;

  scale_factor = 1;

  ctx.canvas.width = width;
  ctx.canvas.height = height;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  [origin_x, origin_y] = drawAxis(ctx, axis_margin, axis_margin, axis_margin);

  if (stock.radius && stock.height) {
    scale_factor = Math.min(
      ((width - 2 * axis_margin) * 0.9) / stock.radius,
      ((height - 2 * axis_margin) * 0.9) / stock.height
    );

    drawStock(
      ctx,
      stock.radius,
      stock.height,
      origin_x,
      origin_y,
      scale_factor
    );
  }

  draw_line_points(ctx, points.value, origin_x, origin_y, scale_factor);
  draw_line_info(ctx, points.value);
}

function drawAxis(
  ctx: CanvasRenderingContext2D,
  v_axis_from_right: number,
  h_axis_from_bottom: number,
  margin: number
): [number, number] {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const gray = "#ababab";

  const origin_x = width - v_axis_from_right - margin;
  const origin_y = height - h_axis_from_bottom - margin;

  ctx.strokeStyle = gray;
  ctx.lineWidth = 2;
  // Draw vertical axis
  ctx.beginPath();
  ctx.moveTo(width - v_axis_from_right - margin, height - margin);
  ctx.lineTo(width - v_axis_from_right - margin, margin);
  ctx.stroke();
  // Draw horizontal axis
  ctx.beginPath();
  ctx.moveTo(margin, height - h_axis_from_bottom - margin);
  ctx.lineTo(width - margin, height - h_axis_from_bottom - margin);
  ctx.stroke();
  // draw axis heads
  //vertical axis
  ctx.fillStyle = gray;
  ctx.beginPath();
  ctx.moveTo(width - v_axis_from_right - margin, margin);
  ctx.lineTo(width - v_axis_from_right - margin - 5, margin + 10);
  ctx.lineTo(width - v_axis_from_right - margin + 5, margin + 10);
  ctx.lineTo(width - v_axis_from_right - margin, margin);
  ctx.fill();

  //horizontal axis
  ctx.beginPath();
  ctx.moveTo(margin, height - h_axis_from_bottom - margin);
  ctx.lineTo(margin + 10, height - h_axis_from_bottom - margin - 5);
  ctx.lineTo(margin + 10, height - h_axis_from_bottom - margin + 5);
  ctx.lineTo(margin, height - h_axis_from_bottom - margin);
  ctx.fill();

  // Draw origin
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(origin_x, origin_y, 3, 0, 2 * Math.PI);
  ctx.fill();
  //show (0,0) on origin
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "(0,0)",
    width - v_axis_from_right - margin / 2,
    height - h_axis_from_bottom - margin / 2,
    margin * 2
  );

  // Draw axis labels
  ctx.font = "12px Arial";
  // Vertical axis label

  ctx.fillText("回転軸", width - margin + 5, height / 2, margin);
  // Horizontal axis label
  ctx.fillText(
    "半径方向",
    width / 2,
    height - h_axis_from_bottom - margin + 15
  );

  return [origin_x, origin_y];
}

function drawStock(
  ctx: CanvasRenderingContext2D,
  stock_radius: number,
  stock_height: number,
  origin_x: number,
  origin_y: number,
  scale = 1
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const gray = "#e0e0e0ab";

  ctx.strokeStyle = "black";
  ctx.fillStyle = gray;
  ctx.lineWidth = 0.3;
  // Draw stock area as a rectangle
  ctx.fillRect(
    origin_x - stock_radius * scale,
    origin_y - stock_height * scale,
    stock_radius * scale,
    stock_height * scale
  );
  // Draw stock outline
  ctx.beginPath();
  ctx.rect(
    origin_x - stock_radius * scale,
    origin_y - stock_height * scale,
    stock_radius * scale,
    stock_height * scale
  );
  ctx.stroke();

  // Draw size labels next to axis
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  // Horizontal size label
  ctx.fillText(
    `${stock_radius}`,
    origin_x - stock_radius * scale,
    origin_y + 15
  );
  // Vertical size label
  ctx.textAlign = "left";
  ctx.fillText(
    `${stock_height}`,
    origin_x + 5,
    origin_y - stock_height * scale
  );
}

function draw_line_points(
  ctx: CanvasRenderingContext2D,
  points: Vector2[],
  origin_x: number,
  origin_y: number,
  scale = 1
) {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-points[0].x * scale + origin_x, -points[0].y * scale + origin_y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(
      -points[i].x * scale + origin_x,
      -points[i].y * scale + origin_y
    );
  }
  ctx.stroke();
  //point circles
  ctx.fillStyle = "red";
  for (let i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.arc(
      -points[i].x * scale + origin_x,
      -points[i].y * scale + origin_y,
      4,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

function draw_line_info(ctx: CanvasRenderingContext2D, points: Vector2[]) {
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  // number points
  ctx.fillText(`N = ${points.length}`, 20, 20);
  ctx.fillText(`Name: ${Param.selectedSection.value?.name}`, 20, 40);
  // control annotation
  ctx.textAlign = "center";
  ctx.fillText(
    "左クリックで点を移動、右クリックで点を追加・削除",
    ctx.canvas.width / 2,
    15
  );
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
  let x = (origin_x - offsetX) / scale_factor;
  let y = (origin_y - offsetY) / scale_factor;

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
    -point.x * scale_factor + origin_x,
    -point.y * scale_factor + origin_y
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

function draw_seleced_point_info(ctx: CanvasRenderingContext2D) {
  const margin = 5;
  if (is_dragging && selected_point_index >= 0) {
    const point = points.value[selected_point_index];
    const point_on_canvas = convert_pointxy_to_canvasXY(point);
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";

    ctx.fillText(
      `${selected_point_index + 1}`,
      point_on_canvas.x + margin,
      point_on_canvas.y
    );
    //position line
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.5;
    //horizontal line
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.moveTo(point_on_canvas.x, point_on_canvas.y);
    ctx.lineTo(origin_x, point_on_canvas.y);
    ctx.stroke();
    //vertical line
    ctx.beginPath();
    ctx.moveTo(point_on_canvas.x, point_on_canvas.y);
    ctx.lineTo(point_on_canvas.x, origin_y);
    ctx.stroke();

    ctx.setLineDash([]);
    //position label on axis
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(
      `${point.y.toFixed(1)}`,
      origin_x + margin,
      point_on_canvas.y + margin
    );
    ctx.textAlign = "center";
    ctx.fillText(
      `${point.x.toFixed(1)}`,
      point_on_canvas.x + margin,
      origin_y + 10 + margin
    );
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

function handleMouseDown(event: MouseEvent) {
  const { offsetX, offsetY } = event;
  const x = (origin_x - offsetX) / scale_factor;
  const y = (origin_y - offsetY) / scale_factor;
  const click_point = new Vector2(x, y);

  const device_drag_threshold = drag_threshold / scale_factor;

  const near_point_index = points.value.findIndex(
    (point, index) => point.distanceTo(click_point) < device_drag_threshold
  );

  if (near_point_index >= 0) {
    selected_point_index = near_point_index;
    is_dragging = true;
  } else {
    selected_point_index = -1;
    is_dragging = false;
  }
}

function handleMouseMove(event: MouseEvent) {
  // Implement logic to move points when the mouse is dragged
  if (is_dragging && selected_point_index >= 0) {
    const { offsetX, offsetY } = event;

    points.value[selected_point_index] = round_point_decimal_point(
      convert_MouseXY_to_pointxy(selected_point_index, offsetX, offsetY)
    );

    if (canvasref.value) {
      const ctx = canvasref.value.getContext("2d");
      if (ctx) {
        drawInit(ctx);
        draw_seleced_point_info(ctx);
      }
    }
  }
}

function handleMouseUp(event: MouseEvent) {
  if (event.button === 0) {
    //left click
    if (is_dragging) {
      const [is_intersect, index] = check_self_intersection();

      if (is_intersect) {
        toast.warning("自己交差しています。自己交差を解消します。");
        points.value.sort((a, b) => a.y - b.y);
      } else {
        const overhang = check_overhang();
        if (overhang) {
          toast.warning(
            "オーバーハングしています。オーバーハングを解消します。"
          );
          points.value.sort((a, b) => a.y - b.y);
        }
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
      const { offsetX, offsetY } = event;
      //search nearest point
      const x = (origin_x - offsetX) / scale_factor;
      const y = (origin_y - offsetY) / scale_factor;

      if (stock.height && stock.radius) {
        if (x < 0 || x > stock.radius || y < 0 || y > stock.height) {
          is_dragging = false;
          selected_point_index = -1;
          return;
        }
      }

      const click_point = round_point_decimal_point(new Vector2(x, y));
      points.value.sort((a, b) => a.y - b.y);
      const near_point_index = points.value.findLastIndex(
        (point, index) => point.y <= click_point.y
      );

      if (near_point_index >= 0) {
        points.value.splice(near_point_index + 1, 0, click_point);
      }
    }
  }

  is_dragging = false;
  selected_point_index = -1;

  if (canvasref.value) {
    const ctx = canvasref.value.getContext("2d");
    if (ctx) {
      drawInit(ctx);
    }
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
  const path = new NURBSPath(points.value);
  if (Param.selectedSection.value) {
    Param.selectedSection.value.path = path;
  }
  toast.success("断面データを保存しました。");
}

watch(
  () => [stock.radius, stock.height],
  () => {
    if (canvasref.value) {
      const ctx = canvasref.value.getContext("2d");
      if (ctx) {
        fix_out_of_range();
        drawInit(ctx);
      }
    }
  }
);

watch(
  () => Param.selectedSection.value,
  () => {
    setup_initial_points();
    if (canvasref.value) {
      const ctx = canvasref.value.getContext("2d");
      if (ctx) {
        drawInit(ctx);
      }
    }
  }
);
</script>
