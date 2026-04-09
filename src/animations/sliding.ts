import type { AnimationRenderer, GateCardConfig, GateStates } from "../types";

export const sliding: AnimationRenderer = {
  getCSS() {
    return `
      .slide-wrapper {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 24px;
        overflow: hidden;
      }

      .slide-track {
        position: absolute;
        bottom: 8px;
        left: 20px; right: 20px;
        height: 2px;
        background: var(--divider-color, #e5e5e5);
        border-radius: 1px;
        z-index: 1;
      }

      .slide-post {
        position: absolute;
        top: 50%; transform: translateY(-50%);
        width: 8px; height: 80px;
        background: var(--divider-color, #d4d4d4);
        border-radius: 3px; z-index: 3;
      }
      .slide-post-l { left: 20px; }
      .slide-post-r { right: 20px; }

      .slide-panel {
        position: absolute;
        top: 50%; margin-top: -38px;
        height: 76px;
        left: 28px; right: 28px;
        transition: transform .9s cubic-bezier(.4,0,.2,1);
        z-index: 2;
      }
      .slide-panel.dir-right.open { transform: translateX(calc(100% + 8px)); }
      .slide-panel.dir-left.open  { transform: translateX(calc(-100% - 8px)); }

      .slide-face {
        width: 100%; height: 100%;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #eaeaea);
        border-radius: 2px;
        display: flex;
        align-items: center; justify-content: space-evenly;
        padding: 0 12px;
      }
      .vbar {
        width: 2px; height: 50%; border-radius: 1px;
        background: var(--divider-color, #e5e5e5);
      }
    `;
  },

  buildScene(config: GateCardConfig): HTMLElement {
    const dir = config.slide_direction || "right";
    const scene = document.createElement("div");
    scene.className = "scene";
    scene.innerHTML = `
      <div class="ground"></div>
      <div class="slide-wrapper">
        <div class="slide-track"></div>
        <div class="slide-post slide-post-l"></div>
        <div class="slide-post slide-post-r"></div>
        <div class="slide-panel dir-${dir}" data-leaf="main">
          <div class="slide-face">
            <div class="vbar"></div><div class="vbar"></div><div class="vbar"></div>
            <div class="vbar"></div><div class="vbar"></div><div class="vbar"></div>
          </div>
        </div>
      </div>
    `;
    return scene;
  },

  updateScene(scene: HTMLElement, _config: GateCardConfig, states: GateStates): void {
    const panel = scene.querySelector('[data-leaf="main"]') as HTMLElement;
    if (!panel) return;

    const isOpen = states.main === "open" || states.main === "opening";
    const isMoving = states.main === "opening" || states.main === "closing";

    panel.classList.toggle("open", isOpen);
    panel.classList.toggle("moving", isMoving);
  },
};
