export type GateType = "double_swing" | "single_swing" | "sliding";

export interface GateCardConfig {
  type: string;
  title?: string;
  gate_type?: GateType;
  entity?: string;
  compact?: boolean;
  language?: string;

  // Double swing
  entity_left?: string;
  entity_right?: string;

  // Single swing
  swing_side?: "left" | "right";

  // Sliding
  slide_direction?: "left" | "right";
}

export interface GateStates {
  main: string;
  left: string;
  right: string;
}

export interface HomeAssistant {
  states: Record<string, { state: string; attributes: Record<string, unknown> }>;
  callService(domain: string, service: string, data: Record<string, unknown>): void;
  language?: string;
}

export interface AnimationRenderer {
  buildScene(config: GateCardConfig): HTMLElement;
  updateScene(scene: HTMLElement, config: GateCardConfig, states: GateStates): void;
  getCSS(): string;
}
