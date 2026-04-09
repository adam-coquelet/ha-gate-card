import type { AnimationRenderer, GateType } from "../types";
import { doubleSwing } from "./double-swing";
import { singleSwing } from "./single-swing";
import { sliding } from "./sliding";

const renderers: Record<GateType, AnimationRenderer> = {
  double_swing: doubleSwing,
  single_swing: singleSwing,
  sliding,
};

export function getRenderer(gateType?: GateType): AnimationRenderer {
  return renderers[gateType || "double_swing"] || renderers.double_swing;
}
