import type { GateCardConfig, HomeAssistant } from "./types";
import { t } from "./i18n";

const GATE_TYPES = ["double_swing", "single_swing", "sliding"] as const;
const SIDES = ["left", "right"] as const;

export class GateCardEditor extends HTMLElement {
  private _config!: GateCardConfig;
  private _hass!: HomeAssistant;
  private _rendered = false;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    // Push hass to all entity pickers already in the DOM
    this.querySelectorAll("ha-entity-picker").forEach((el) => {
      (el as unknown as Record<string, unknown>).hass = hass;
    });
  }

  setConfig(config: GateCardConfig): void {
    this._config = { ...config };
    this._rendered = false;
    this._render();
  }

  connectedCallback(): void {
    if (!this._rendered && this._config) {
      this._render();
    }
  }

  private get _lang(): string {
    return this._config.language || "auto";
  }

  private _render(): void {
    if (!this._config) return;
    const lang = this._lang;
    const gateType = this._config.gate_type || "double_swing";

    this.innerHTML = "";

    const form = document.createElement("div");
    form.className = "editor-form";
    form.innerHTML = `
      <style>
        .editor-form { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
        ha-entity-picker, ha-select, ha-textfield { width: 100%; }
        .switch-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; }
        .switch-row span { font-size: 14px; color: var(--primary-text-color); }
      </style>
    `;
    this.appendChild(form);

    // Title
    const titleEl = document.createElement("ha-textfield") as HTMLInputElement;
    titleEl.setAttribute("label", t("editor.title", lang));
    titleEl.value = this._config.title || "";
    titleEl.addEventListener("input", () => this._update("title", titleEl.value));
    form.appendChild(titleEl);

    // Main entity
    this._addEntityPicker(form, "entity", this._config.entity);

    // Gate type
    const gateTypeEl = document.createElement("ha-select");
    gateTypeEl.setAttribute("label", t("editor.gate_type", lang));
    for (const gt of GATE_TYPES) {
      const item = document.createElement("mwc-list-item");
      item.setAttribute("value", gt);
      if (gt === gateType) item.setAttribute("selected", "");
      item.textContent = t("gate_types." + gt, lang);
      gateTypeEl.appendChild(item);
    }
    gateTypeEl.addEventListener("selected", (e: Event) => {
      const target = e.target as HTMLElement & { value?: string };
      if (target.value && target.value !== this._config.gate_type) {
        this._update("gate_type", target.value);
      }
    });
    // Also listen for closed (ha-select fires this after selection)
    gateTypeEl.addEventListener("closed", (e: Event) => e.stopPropagation());
    form.appendChild(gateTypeEl);

    // Double swing: left/right entity pickers
    if (gateType === "double_swing") {
      this._addEntityPicker(form, "entity_left", this._config.entity_left);
      this._addEntityPicker(form, "entity_right", this._config.entity_right);
    }

    // Single swing: swing side
    if (gateType === "single_swing") {
      this._addSelect(form, "swing_side", this._config.swing_side || "left", SIDES, lang);
    }

    // Sliding: direction
    if (gateType === "sliding") {
      this._addSelect(form, "slide_direction", this._config.slide_direction || "right", SIDES, lang);
    }

    // Language
    const langEl = document.createElement("ha-select");
    langEl.setAttribute("label", t("editor.language", lang));
    for (const [val, label] of [["auto", t("editor.auto", lang)], ["fr", "Français"], ["en", "English"]]) {
      const item = document.createElement("mwc-list-item");
      item.setAttribute("value", val);
      if (val === (this._config.language || "auto")) item.setAttribute("selected", "");
      item.textContent = label;
      langEl.appendChild(item);
    }
    langEl.addEventListener("selected", (e: Event) => {
      const target = e.target as HTMLElement & { value?: string };
      if (target.value) this._update("language", target.value);
    });
    langEl.addEventListener("closed", (e: Event) => e.stopPropagation());
    form.appendChild(langEl);

    // Compact
    const switchRow = document.createElement("div");
    switchRow.className = "switch-row";
    const switchLabel = document.createElement("span");
    switchLabel.textContent = t("editor.compact", lang);
    switchRow.appendChild(switchLabel);
    const switchEl = document.createElement("ha-switch") as HTMLInputElement;
    if (this._config.compact) switchEl.setAttribute("checked", "");
    switchEl.addEventListener("change", () => {
      this._update("compact", (switchEl as unknown as Record<string, unknown>).checked);
    });
    switchRow.appendChild(switchEl);
    form.appendChild(switchRow);

    this._rendered = true;
  }

  private _addEntityPicker(parent: HTMLElement, key: string, value?: string): void {
    const el = document.createElement("ha-entity-picker");
    const anyEl = el as unknown as Record<string, unknown>;
    anyEl.hass = this._hass;
    anyEl.value = value || "";
    anyEl.label = t("editor." + key, this._lang);
    anyEl.includeDomains = ["cover"];
    anyEl.allowCustomEntity = true;
    el.addEventListener("value-changed", (e: Event) => {
      const val = (e as CustomEvent).detail?.value;
      this._update(key, val || "");
    });
    parent.appendChild(el);
  }

  private _addSelect(
    parent: HTMLElement,
    key: string,
    current: string,
    options: readonly string[],
    lang: string,
  ): void {
    const el = document.createElement("ha-select");
    el.setAttribute("label", t("editor." + key, lang));
    for (const val of options) {
      const item = document.createElement("mwc-list-item");
      item.setAttribute("value", val);
      if (val === current) item.setAttribute("selected", "");
      item.textContent = t("editor." + val, lang);
      el.appendChild(item);
    }
    el.addEventListener("selected", (e: Event) => {
      const target = e.target as HTMLElement & { value?: string };
      if (target.value) this._update(key, target.value);
    });
    el.addEventListener("closed", (e: Event) => e.stopPropagation());
    parent.appendChild(el);
  }

  private _update(key: string, value: unknown): void {
    if ((this._config as unknown as Record<string, unknown>)[key] === value) return;
    this._config = { ...this._config, [key]: value };

    if (key === "gate_type" || key === "language") {
      this._render();
    }

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
