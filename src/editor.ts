import type { GateCardConfig, HomeAssistant } from "./types";
import { t } from "./i18n";

export class GateCardEditor extends HTMLElement {
  private _config!: GateCardConfig;
  private _hass!: HomeAssistant;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  setConfig(config: GateCardConfig): void {
    this._config = { ...config };
    this._render();
  }

  private _getSchema(): Record<string, unknown>[] {
    const gateType = this._config?.gate_type || "double_swing";

    const schema: Record<string, unknown>[] = [
      { name: "title", selector: { text: {} } },
      {
        name: "entity",
        required: true,
        selector: { entity: { domain: "cover" } },
      },
      {
        name: "gate_type",
        selector: {
          select: {
            options: [
              { value: "double_swing", label: t("gate_types.double_swing", this._lang) },
              { value: "single_swing", label: t("gate_types.single_swing", this._lang) },
              { value: "sliding", label: t("gate_types.sliding", this._lang) },
            ],
            mode: "dropdown",
          },
        },
      },
    ];

    if (gateType === "double_swing") {
      schema.push(
        {
          name: "entity_left",
          selector: { entity: { domain: "cover" } },
        },
        {
          name: "entity_right",
          selector: { entity: { domain: "cover" } },
        },
      );
    }

    if (gateType === "single_swing") {
      schema.push({
        name: "swing_side",
        selector: {
          select: {
            options: [
              { value: "left", label: t("editor.left", this._lang) },
              { value: "right", label: t("editor.right", this._lang) },
            ],
            mode: "dropdown",
          },
        },
      });
    }

    if (gateType === "sliding") {
      schema.push({
        name: "slide_direction",
        selector: {
          select: {
            options: [
              { value: "left", label: t("editor.left", this._lang) },
              { value: "right", label: t("editor.right", this._lang) },
            ],
            mode: "dropdown",
          },
        },
      });
    }

    schema.push(
      {
        name: "language",
        selector: {
          select: {
            options: [
              { value: "auto", label: t("editor.auto", this._lang) },
              { value: "fr", label: "Français" },
              { value: "en", label: "English" },
            ],
            mode: "dropdown",
          },
        },
      },
      { name: "compact", selector: { boolean: {} } },
    );

    return schema;
  }

  private get _lang(): string {
    return this._config?.language || "auto";
  }

  private _computeLabel(schema: Record<string, unknown>): string {
    const labels: Record<string, string> = {
      title: t("editor.title", this._lang),
      entity: t("editor.entity", this._lang),
      gate_type: t("editor.gate_type", this._lang),
      entity_left: t("editor.entity_left", this._lang),
      entity_right: t("editor.entity_right", this._lang),
      swing_side: t("editor.swing_side", this._lang),
      slide_direction: t("editor.slide_direction", this._lang),
      language: t("editor.language", this._lang),
      compact: t("editor.compact", this._lang),
    };
    return labels[schema.name as string] || (schema.name as string);
  }

  private _render(): void {
    if (!this._hass || !this._config) return;

    const form = this.querySelector("ha-form") || document.createElement("ha-form");
    const anyForm = form as unknown as Record<string, unknown>;
    anyForm.hass = this._hass;
    anyForm.data = this._config;
    anyForm.schema = this._getSchema();
    anyForm.computeLabel = (s: Record<string, unknown>) => this._computeLabel(s);

    if (!form.parentElement) {
      form.addEventListener("value-changed", (e: Event) => {
        const newConfig = (e as CustomEvent).detail.value as GateCardConfig;
        const gateTypeChanged = newConfig.gate_type !== this._config.gate_type;
        this._config = { ...newConfig };

        if (gateTypeChanged) {
          this._render();
        }

        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
          }),
        );
      });
      this.appendChild(form);
    }
  }
}
