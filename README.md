# Gate Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A Lovelace card to control swing and sliding gates in Home Assistant.

Works with **any cover entity** (ESPHome, Shelly, Zigbee2MQTT, Z-Wave, template covers, etc.).

## Features

- **3 gate types**: double swing, single swing, sliding
- **Animated 3D scene** with real-time state feedback
- **Visual editor** — configure everything from the UI, no YAML needed
- **Bilingual** — French and English with auto-detection
- **Compact mode** — hides the animation for a smaller card

## Installation

### HACS (recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend** > **Custom repositories**
3. Add this repository URL and select **Lovelace** as category
4. Install **Gate Card**
5. Refresh your browser

### Manual

1. Download `dist/gate-card.js` from the latest release
2. Copy it to `/config/www/gate-card.js`
3. Add the resource in **Settings > Dashboards > Resources**:
   - URL: `/local/gate-card.js`
   - Type: JavaScript Module

## Configuration

Add the card via the visual editor (recommended) or manually in YAML:

### Double swing gate (battant double)

```yaml
type: custom:gate-card
entity: cover.gate
entity_left: cover.gate_left
entity_right: cover.gate_right
gate_type: double_swing
title: Front Gate
```

### Single swing gate (battant simple)

```yaml
type: custom:gate-card
entity: cover.gate
gate_type: single_swing
swing_side: left
```

### Sliding gate (coulissant)

```yaml
type: custom:gate-card
entity: cover.gate
gate_type: sliding
slide_direction: right
```

### All options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Main cover entity |
| `gate_type` | string | `double_swing` | `double_swing`, `single_swing`, or `sliding` |
| `title` | string | `Gate` | Card title |
| `compact` | boolean | `false` | Hide the animation scene |
| `language` | string | `auto` | `auto`, `fr`, or `en` |
| `entity_left` | string | — | Left leaf entity (double swing only) |
| `entity_right` | string | — | Right leaf entity (double swing only) |
| `swing_side` | string | `left` | Hinge side (single swing only) |
| `slide_direction` | string | `right` | Slide direction (sliding only) |

## Compatibility

This card uses standard `cover.*` services (`open_cover`, `close_cover`) and reads standard cover states (`open`, `closed`, `opening`, `closing`). It works with any integration that exposes cover entities.

## License

MIT
