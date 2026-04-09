import type { GateCardConfig, GateStates, HomeAssistant } from "./types";
import { GateCardEditor } from "./editor";
import { getRenderer } from "./animations";
import { sharedStyles } from "./styles";
import { getState, callCoverService } from "./utils";
import { t } from "./i18n";

const VERSION = "1.0.3";
const LOCK_MS = 1500;

class GateCard extends HTMLElement {
  private config!: GateCardConfig;
  private _hass!: HomeAssistant;
  private _built = false;
  private _prevGateType?: string;
  private _locked = false;
  private _lockTimer: ReturnType<typeof setTimeout> | null = null;

  // DOM refs
  private _cardEl!: HTMLElement;
  private _badgeEl!: HTMLElement;
  private _badgeLblEl!: HTMLElement;
  private _titleEl!: HTMLElement;
  private _sceneEl: HTMLElement | null = null;
  private _btnMain!: HTMLButtonElement;

  static getConfigElement(): HTMLElement {
    return document.createElement("gate-card-editor");
  }

  static getStubConfig(): Partial<GateCardConfig> {
    return {
      entity: "",
      gate_type: "double_swing",
      title: "Gate",
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config: GateCardConfig): void {
    this.config = {
      gate_type: "double_swing",
      language: "auto",
      ...config,
    };
    if (this._prevGateType && this._prevGateType !== this.config.gate_type) {
      this._built = false;
    }
    this._prevGateType = this.config.gate_type;
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (!this.config.entity) {
      this.shadowRoot!.innerHTML = `<div style="padding:20px;font-size:13px;color:var(--secondary-text-color,#666);">Select a cover entity in the card editor.</div>`;
      this._built = false;
      return;
    }
    if (!this._built) {
      this._build();
    }
    this._update();
  }

  /* --- Lock mechanism --- */

  private _lock(): void {
    this._locked = true;
    this._cardEl.classList.add("locked");
    if (this._lockTimer) clearTimeout(this._lockTimer);
    this._lockTimer = setTimeout(() => {
      this._locked = false;
      this._cardEl.classList.remove("locked");
    }, LOCK_MS);
  }

  private _act(service: string, entityId: string): void {
    if (this._locked) return;
    this._lock();
    callCoverService(this._hass, service, entityId);
  }

  /* --- State helpers --- */

  private _getStates(): GateStates {
    const mainState = getState(this._hass, this.config.entity);
    let leftState = mainState;
    let rightState = mainState;

    if (this.config.gate_type === "double_swing") {
      if (this.config.entity_left) {
        leftState = getState(this._hass, this.config.entity_left);
      }
      if (this.config.entity_right) {
        rightState = getState(this._hass, this.config.entity_right);
      }
    }

    return { main: mainState, left: leftState, right: rightState };
  }

  /* --- Build DOM (once) --- */

  private _build(): void {
    const root = this.shadowRoot!;
    const cfg = this.config;
    const renderer = getRenderer(cfg.gate_type);

    root.innerHTML = "";

    // Styles
    const style = document.createElement("style");
    style.textContent = sharedStyles + renderer.getCSS();
    root.appendChild(style);

    // Card
    this._cardEl = document.createElement("div");
    this._cardEl.className = "card" + (cfg.compact ? " compact" : "");
    root.appendChild(this._cardEl);

    // Header
    const header = document.createElement("div");
    header.className = "header";
    this._cardEl.appendChild(header);

    this._titleEl = document.createElement("span");
    this._titleEl.className = "title";
    this._titleEl.textContent = cfg.title || "Gate";
    header.appendChild(this._titleEl);

    this._badgeEl = document.createElement("span");
    this._badgeEl.className = "badge s-closed";
    header.appendChild(this._badgeEl);

    const dot = document.createElement("span");
    dot.className = "dot";
    this._badgeEl.appendChild(dot);

    this._badgeLblEl = document.createElement("span");
    this._badgeEl.appendChild(this._badgeLblEl);

    // Scene
    if (!cfg.compact) {
      this._sceneEl = renderer.buildScene(cfg);
      this._cardEl.appendChild(this._sceneEl);
      this._bindLeafClicks();
    } else {
      this._sceneEl = null;
    }

    // Main action
    const actions = document.createElement("div");
    actions.className = "actions";
    this._cardEl.appendChild(actions);

    this._btnMain = document.createElement("button");
    this._btnMain.className = "btn btn-primary";
    this._btnMain.addEventListener("click", () => {
      const states = this._getStates();
      const svc = states.main === "open" ? "close_cover" : "open_cover";
      this._act(svc, cfg.entity!);
    });
    actions.appendChild(this._btnMain);

    this._built = true;
  }

  /* --- Clickable leaves in scene --- */

  private _bindLeafClicks(): void {
    if (!this._sceneEl) return;
    const cfg = this.config;

    if (cfg.gate_type === "double_swing") {
      const leafL = this._sceneEl.querySelector('[data-leaf="left"]') as HTMLElement | null;
      const leafR = this._sceneEl.querySelector('[data-leaf="right"]') as HTMLElement | null;

      // Left leaf: use entity_left if available, otherwise main entity
      if (leafL) {
        leafL.addEventListener("click", () => {
          const entity = cfg.entity_left || cfg.entity!;
          const states = this._getStates();
          const st = cfg.entity_left ? states.left : states.main;
          this._act(st === "open" ? "close_cover" : "open_cover", entity);
        });
      }

      // Right leaf: use entity_right if available, otherwise main entity
      if (leafR) {
        leafR.addEventListener("click", () => {
          const entity = cfg.entity_right || cfg.entity!;
          const states = this._getStates();
          const st = cfg.entity_right ? states.right : states.main;
          this._act(st === "open" ? "close_cover" : "open_cover", entity);
        });
      }
    } else {
      // single_swing and sliding both use data-leaf="main"
      const leaf = this._sceneEl.querySelector('[data-leaf="main"]') as HTMLElement | null;
      if (leaf) {
        leaf.addEventListener("click", () => {
          const states = this._getStates();
          this._act(states.main === "open" ? "close_cover" : "open_cover", cfg.entity!);
        });
      }
    }
  }

  /* --- Update (no DOM rebuild) --- */

  private _update(): void {
    const cfg = this.config;
    const lang = cfg.language;
    const states = this._getStates();

    const isOpen = states.main === "open";
    const isMoving = states.main === "opening" || states.main === "closing";

    // Badge
    this._badgeEl.className =
      "badge " + (isMoving ? "s-moving" : isOpen ? "s-open" : "s-closed");
    this._badgeLblEl.textContent = isMoving
      ? t("states." + states.main, lang)
      : isOpen
        ? t("states.open", lang)
        : t("states.closed", lang);

    // Main button
    const mainLbl = isOpen ? t("actions.close", lang) : t("actions.open", lang);
    this._btnMain.textContent = mainLbl;

    // Scene animation
    if (this._sceneEl) {
      const renderer = getRenderer(cfg.gate_type);
      renderer.updateScene(this._sceneEl, cfg, states);
    }
  }

  getCardSize(): number {
    return this.config?.compact ? 2 : 3;
  }
}

// Register
customElements.define("gate-card-editor", GateCardEditor);
customElements.define("gate-card", GateCard);

const w = window as unknown as Record<string, unknown[]>;
w.customCards = w.customCards || [];
w.customCards.push({
  type: "gate-card",
  name: "Gate Card",
  description:
    "Control card for swing and sliding gates / Carte de contrôle pour portails",
  preview: true,
});

console.info(`%c GATE-CARD %c v${VERSION} `, "background:#171717;color:#fff;border-radius:3px 0 0 3px;padding:2px 0", "background:#f59e0b;color:#171717;border-radius:0 3px 3px 0;padding:2px 0");
