import {
  CLData,
  RapidCL,
  LinearCL,
  CommentCL,
  DwellCL,
  ResetRotationAngleCL,
  BaseCL,
} from "../MainProcessor/CL";
import { PostProcessorParameter } from "./PostProcessorParameter";

export abstract class BasePostProcessor {
  data = "";
  abstract onOpen(): void;
  abstract onClose(): void;
  abstract onComment(comment: string): void;
  abstract onCommand(command: string): void;
  abstract onDwell(dwell: number): void;
  abstract onRapid5D(
    x: number | undefined | null,
    y: number | undefined | null,
    z: number | undefined | null,
    a: number | undefined | null,
    b: number | undefined | null,
    c: number | undefined | null
  ): void;
  abstract onLinear5D(
    x: number | undefined | null,
    y: number | undefined | null,
    z: number | undefined | null,
    a: number | undefined | null,
    b: number | undefined | null,
    c: number | undefined | null,
    feed: number
  ): void;
  abstract onResetRotationAngle(): void;

  abstract postparam: PostProcessorParameter;

  async processAsync(
    clData: CLData,
    postparam: PostProcessorParameter
  ): Promise<string> {
    this.onOpen();
    this.onProgress?.(50, "---PostProcessor---\n");
    this.postparam = postparam;

    for (const cl of clData.data) {
      if (cl instanceof RapidCL) {
        this.onRapid5D(cl.x, cl.y, cl.z, cl.a, cl.b, cl.c);
      } else if (cl instanceof LinearCL) {
        this.onLinear5D(cl.x, cl.y, cl.z, cl.a, cl.b, cl.c, cl.feed);
      } else if (cl instanceof DwellCL) {
        this.onDwell(cl.seconds);
      } else if (cl instanceof CommentCL) {
        this.onComment(cl.message);
      } else if (cl instanceof ResetRotationAngleCL) {
        this.onResetRotationAngle();
      }
    }

    this.onClose();
    this.onProgress?.(100, "---Finish PostProcessor---");

    return this.data;
  }

  onProgress: ((progress: number, message: string) => void) | null = null;
  onErrorEnd: ((message: string) => void) | null = null;
}
