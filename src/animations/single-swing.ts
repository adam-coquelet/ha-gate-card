import type { AnimationRenderer, GateCardConfig, GateStates } from "../types";

export const singleSwing: AnimationRenderer = {
  getCSS() {
    return `
      .scene { perspective: 600px; }
      .pillar-hinge { left: 26px; }
      .pillar-latch { right: 26px; }
      .pillar-hinge.right { left: auto; right: 26px; }
      .pillar-latch.right { right: auto; left: 26px; }

      .leaf-single {
        position: absolute;
        top: 50%; margin-top: -38px;
        height: 76px;
        width: calc(100% - 72px);
        transform-style: preserve-3d;
        transition: transform .9s cubic-bezier(.4,0,.2,1);
        z-index: 2;
      }
      .leaf-single.hinge-left {
        left: 36px;
        transform-origin: left center;
      }
      .leaf-single.hinge-left.open { transform: rotateY(-72deg); }
      .leaf-single.hinge-right {
        right: 36px;
        transform-origin: right center;
      }
      .leaf-single.hinge-right.open { transform: rotateY(72deg); }

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

  buildScene(config: GateCardConfig): HTMLElement {
    const side = config.swing_side || "left";
    const scene = document.createElement("div");
    scene.className = "scene";
    scene.innerHTML = `
      <div class="ground"></div>
      <div class="pillar pillar-hinge ${side === "right" ? "right" : ""}"></div>
      <div class="pillar pillar-latch ${side === "right" ? "right" : ""}"></div>
      <div class="leaf-single hinge-${side}" data-leaf="main">
        <div class="leaf-face">
          <div class="bar"></div><div class="bar"></div>
          <div class="bar"></div><div class="bar"></div>
        </div>
      </div>
    `;
    return scene;
  },

  updateScene(scene: HTMLElement, _config: GateCardConfig, states: GateStates): void {
    const leaf = scene.querySelector('[data-leaf="main"]') as HTMLElement;
    if (!leaf) return;

    const isOpen = states.main === "open" || states.main === "opening";
    const isMoving = states.main === "opening" || states.main === "closing";

    leaf.classList.toggle("open", isOpen);
    leaf.classList.toggle("moving", isMoving);
  },
};
