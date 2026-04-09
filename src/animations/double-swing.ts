import type { AnimationRenderer, GateCardConfig, GateStates } from "../types";

export const doubleSwing: AnimationRenderer = {
  getCSS() {
    return `
      .scene { perspective: 600px; }
      .pillar-l { left: 26px; }
      .pillar-r { right: 26px; }

      .leaf-l, .leaf-r {
        position: absolute;
        top: 50%; margin-top: -38px;
        height: 76px;
        width: calc(50% - 36px);
        transform-style: preserve-3d;
        transition: transform .9s cubic-bezier(.4,0,.2,1);
        z-index: 2;
      }
      .leaf-l { left: 36px; transform-origin: left center; }
      .leaf-r { right: 36px; transform-origin: right center; }
      .leaf-l.open { transform: rotateY(-72deg); }
      .leaf-r.open { transform: rotateY(72deg); }

      .leaf-face {
        width: 100%; height: 100%;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #eaeaea);
        border-radius: 2px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: space-evenly;
        padding: 8px 0;
        position: relative;
        transition: border-color .2s;
      }
      .bar {
        width: 50%; height: 2px; border-radius: 1px;
        background: var(--divider-color, #e5e5e5);
      }
    `;
  },

  buildScene(_config: GateCardConfig): HTMLElement {
    const scene = document.createElement("div");
    scene.className = "scene";
    scene.innerHTML = `
      <div class="ground"></div>
      <div class="pillar pillar-l"></div>
      <div class="pillar pillar-r"></div>
      <div class="leaf-l" data-leaf="left">
        <div class="leaf-face">
          <div class="bar"></div><div class="bar"></div>
          <div class="bar"></div><div class="bar"></div>
        </div>
      </div>
      <div class="leaf-r" data-leaf="right">
        <div class="leaf-face">
          <div class="bar"></div><div class="bar"></div>
          <div class="bar"></div><div class="bar"></div>
        </div>
      </div>
    `;
    return scene;
  },

  updateScene(scene: HTMLElement, _config: GateCardConfig, states: GateStates): void {
    const leafL = scene.querySelector('[data-leaf="left"]') as HTMLElement;
    const leafR = scene.querySelector('[data-leaf="right"]') as HTMLElement;
    if (!leafL || !leafR) return;

    const lOpen = states.left === "open" || states.left === "opening";
    const rOpen = states.right === "open" || states.right === "opening";
    const lMoving = states.left === "opening" || states.left === "closing";
    const rMoving = states.right === "opening" || states.right === "closing";

    leafL.classList.toggle("open", lOpen);
    leafL.classList.toggle("moving", lMoving);
    leafR.classList.toggle("open", rOpen);
    leafR.classList.toggle("moving", rMoving);
  },
};
