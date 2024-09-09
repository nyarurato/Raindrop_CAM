import { BaseStock } from "../Stock";
import { Endmill } from "../Endmill";
import { Machine } from "../Machine";
import { Section } from "../Sections";
import { MainProcessorParameter } from "./MainProcessorParameter";
import { CLData } from "./CL";

export abstract class BaseMainProcessor {
  constructor() {
    this._processingprogress = 0;
    this._log_message = "";
  }

  protected _processingprogress = 0;
  //進捗状況0-100
  get processingprogress(): number {
    return this._processingprogress;
  }

  onProgress: ((progress: number, message: string) => void) | null = null;
  onErrorEnd: ((message: string) => void) | null = null;

  protected _log_message = "";
  get log_message(): string {
    return this._log_message;
  }

  abstract processAsync(
    sections: Array<Section>,
    stock: BaseStock,
    endmill: Endmill,
    machine: Machine,
    param: MainProcessorParameter
  ): Promise<CLData>;
}
