import { BasePostProcessor } from "./BasePostProcessor";
import { PostProcessorParameter } from "./PostProcessorParameter";

export class RepRapCNCPostProcessor extends BasePostProcessor {
  postparam: PostProcessorParameter = {} as PostProcessorParameter;

  constructor() {
    super();
    this.data = "";
  }

  onOpen(): void {
    const initialGCode = `G90 G21`;
    this.writeData(initialGCode);
  }

  onClose(): void {
    // Implementation for onClose
    const endGcode = `M0`;
    this.writeData(endGcode);
  }

  onComment(comment: string): void {
    const commentGcode = `; ${comment}`;
    this.writeData(commentGcode);
  }

  onCommand(command: string): void {
    this.writeData(command);
  }

  onDwell(dwell: number): void {
    this.writeData(`G4 S${dwell}`);
  }

  onRapid5D(
    x: number | undefined | null,
    y: number | undefined | null,
    z: number | undefined | null,
    a: number | undefined | null,
    b: number | undefined | null,
    c: number | undefined | null
  ): void {
    let rapidGcode = `G0`;
    if (x !== undefined && x !== null) {
      if (typeof x !== "number") {
        console.log("x is not number", x);
      }
      rapidGcode += ` X${x.toFixed(3)}`;
    }
    if (y !== undefined && y !== null) {
      rapidGcode += ` Y${y.toFixed(3)}`;
    }
    if (z !== undefined && z !== null) {
      rapidGcode += ` Z${z.toFixed(3)}`;
    }
    if (a !== undefined && a !== null) {
      rapidGcode += ` A${a.toFixed(3)}`;
    }
    if (b !== undefined && b !== null) {
      rapidGcode += ` B${b.toFixed(3)}`;
    }
    if (c !== undefined && c !== null) {
      rapidGcode += ` C${c.toFixed(3)}`;
    }
    this.writeData(rapidGcode);
  }

  onLinear5D(
    x: number | undefined | null,
    y: number | undefined | null,
    z: number | undefined | null,
    a: number | undefined | null,
    b: number | undefined | null,
    c: number | undefined | null,
    feed: number
  ): void {
    let linearGcode = `G1`;
    if (x !== undefined && x !== null) {
      linearGcode += ` X${x.toFixed(3)}`;
    }
    if (y !== undefined && y !== null) {
      linearGcode += ` Y${y.toFixed(3)}`;
    }
    if (z !== undefined && z !== null) {
      linearGcode += ` Z${z.toFixed(3)}`;
    }
    if (a !== undefined && a !== null) {
      linearGcode += ` A${a.toFixed(3)}`;
    }
    if (b !== undefined && b !== null) {
      linearGcode += ` B${b.toFixed(3)}`;
    }
    if (c !== undefined && c !== null) {
      linearGcode += ` C${c.toFixed(3)}`;
    }
    linearGcode += ` F${feed.toFixed(0)}`;
    this.writeData(linearGcode);
  }

  onResetRotationAngle(): void {
    if (this.postparam.is_angle_reset_on_360) {
      let resetGcode = `G92`;
      if (this.postparam.machine.axes.angular_axis !== undefined) {
        const axis = this.postparam.machine.axes.angular_axis;
        resetGcode += ` ${axis.name}0`;
      }
      this.writeData(resetGcode);
    } else {
      //TODO: Counting degree
    }
  }

  writeData(str: string): void {
    this.data += str + ";\n";
  }
}
