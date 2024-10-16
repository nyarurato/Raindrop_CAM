import * as THREE from "three";
import { Simulator } from "../src/components/Simulation/Simulator";
import { describe, it, expect, beforeEach } from "vitest";
import { BaseStock, Cylinder } from "../src/components/CAM/Stock";
import { Endmill, EndmillType } from "../src/components/CAM/Endmill";
import {
  CLData,
  LinearCL,
  RapidCL,
} from "../src/components/CAM/MainProcessor/CL";
import { Machine } from "../src/components/CAM/Machine";
