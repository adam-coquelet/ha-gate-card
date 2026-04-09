import type { GateCardConfig, HomeAssistant } from "./types";
import { t } from "./i18n";

const GATE_TYPES = ["double_swing", "single_swing", "sliding"] as const;
const SIDES = ["left", "right"] as const;

export class GateCardEditor extends HTMLElement {
  private _config!: GateCardConfig;
  private _hass!: HomeAssistant;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
  }

  setConfig(config: GateCardConfig): void {
    this._config = { ...config };
    this._render();
  }

  private get _lang(): string {
    return this._config.language || "auto";
  }

  private _render(): void {
    const lang = this._lang;
    const gateType = this._config.gate_type || "double_swing";

    this.innerHTML = `
      <style>
        .editor-form { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
        ha-entity-picker, ha-select, ha-textfield { width: 100%; }
        .switch-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; }
        .switch-row span { font-size: 14px; color: var(--primary-text-color); }
      </style>
      <div class="editor-form">
        <ha-textfield
          label="${t("editor.title", lang)}"
          class="cfg-title"
        ></ha-textfield>

        <ha-entity-picker
          class="cfg-entity"
          allow-custom-entity
        ></ha-entity-picker>

        <ha-select
          label="${t("editor.gate_type", lang)}"
          class="cfg-gate-type"
        >
          ${GATE_TYPES.map(
            (gt) =>
              `<mwc-list-item value="${gt}" ${gt === gateType ? "selected" : ""}>${t("gate_types." + gt, lang)}</mwc-list-item>`,
          ).join("")}
        </ha-select>

        ${
          gateType === "double_swing"
            ? `
          <ha-entity-picker class="cfg-entity-left" allow-custom-entity></ha-entity-picker>
          <ha-entity-picker class="cfg-entity-right" allow-custom-entity></ha-entity-picker>
        `
            : ""
        }

        ${
          gateType === "single_swing"
            ? `
          <ha-select label="${t("editor.swing_side", lang)}" class="cfg-swing-side">
            ${SIDES.map(
              (s) =>
                `<mwc-list-item value="${s}" ${s === (this._config.swing_side || "left") ? "selected" : ""}>${t("editor." + s, lang)}</mwc-list-item>`,
            ).join("")}
          </ha-select>
        `
            : ""
        }

        ${
          gateType === "sliding"
            ? `
          <ha-select label="${t("editor.slide_direction", lang)}" class="cfg-slide-dir">
            ${SIDES.map(
              (s) =>
                `<mwc-list-item value="${s}" ${s === (this._config.slide_direction || "right") ? "selected" : ""}>${t("editor." + s, lang)}</mwc-list-item>`,
            ).join("")}
          </ha-select>
        `
            : ""
        }

        <ha-select label="${t("editor.language", lang)}" class="cfg-language">
          <mwc-list-item value="auto" ${this._lang === "auto" ? "selected" : ""}>${t("editor.auto", lang)}</mwc-list-item>
          <mwc-list-item value="fr" ${this._lang === "fr" ? "selected" : ""}>Français</mwc-list-item>
          <mwc-list-item value="en" ${this._lang === "en" ? "selected" : ""}>English</mwc-list-item>
        </ha-select>

        <div class="switch-row">
          <span>${t("editor.compact", lang)}</span>
          <ha-switch class="cfg-compact"></ha-switch>
        </div>
      </div>
    `;

    this._bindFields();
  }

  private _bindFields(): void {
    const $ = <T extends HTMLElement>(sel: string): T | null =>
      this.querySelector<T>(sel);

    const titleEl = $<HTMLInputElement>(".cfg-title");
    if (titleEl) {
      titleEl.value = this._config.title || "";
      titleEl.addEventListener("input", () =>
        this._update("title", titleEl.value),
      );
    }

    this._bindEntityPicker(".cfg-entity", "entity", this._config.entity);

    const gateTypeEl = $(".cfg-gate-type");
    if (gateTypeEl) {
      gateTypeEl.addEventListener("selected", (e: Event) => {
        const val = (e.target as HTMLSelectElement & { value: string }).value;
        if (val && val !== this._config.gate_type) {
          this._update("gate_type", val);
        }
      });
    }

    this._bindEntityPicker(".cfg-entity-left", "entity_left", this._config.entity_left);
    this._bindEntityPicker(".cfg-entity-right", "entity_right", this._config.entity_right);

    const swingSideEl = $(".cfg-swing-side");
    if (swingSideEl) {
      swingSideEl.addEventListener("selected", (e: Event) => {
        const val = (e.target as HTMLSelectElement & { value: string }).value;
        if (val) this._update("swing_side", val);
      });
    }

    const slideDirEl = $(".cfg-slide-dir");
    if (slideDirEl) {
      slideDirEl.addEventListener("selected", (e: Event) => {
        const val = (e.target as HTMLSelectElement & { value: string }).value;
        if (val) this._update("slide_direction", val);
      });
    }

    const langEl = $(".cfg-language");
    if (langEl) {
      langEl.addEventListener("selected", (e: Event) => {
        const val = (e.target as HTMLSelectElement & { value: string }).value;
        if (val) this._update("language", val);
      });
    }

    const compactEl = $<HTMLInputElement>(".cfg-compact");
    if (compactEl) {
      compactEl.checked = !!this._config.compact;
      compactEl.addEventListener("change", () =>
        this._update("compact", compactEl.checked),
      );
    }
  }

  private _bindEntityPicker(selector: string, key: string, value?: string): void {
    const el = this.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    const anyEl = el as unknown as Record<string, unknown>;
    anyEl.hass = this._hass;
    anyEl.value = value || "";
    anyEl.label = t("editor." + key, this._lang);
    anyEl.includeDomains = ["cover"];
    el.addEventListener("value-changed", (e: Event) => {
      const val = (e as CustomEvent).detail?.value;
      this._update(key, val || "");
    });
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
