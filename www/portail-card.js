/**
 * portail-card — Carte Lovelace double battant
 *
 * Config options:
 *   type:          custom:portail-card
 *   title:         Portail              (optionnel, défaut: "Portail")
 *   entity_global: cover.portail        (optionnel)
 *   entity_left:   cover.portail_gauche (optionnel)
 *   entity_right:  cover.portail_droit  (optionnel)
 *   compact:       true                 (optionnel — masque la scène animée)
 */
class PortailCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this.config = {
      title:         "Portail",
      entity_global: "cover.portail",
      entity_left:   "cover.portail_gauche",
      entity_right:  "cover.portail_droit",
      compact:       false,
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _state(id) {
    return this._hass?.states[id]?.state ?? "unknown";
  }

  _svc(domain, service, entity_id) {
    this._hass.callService(domain, service, { entity_id });
  }

  _render() {
    const sg = this._state(this.config.entity_global);
    const sl = this._state(this.config.entity_left);
    const sr = this._state(this.config.entity_right);

    const isOpen   = sg === "open";
    const isMoving = sg === "opening" || sg === "closing";
    const badgeCls = isMoving ? "s-moving" : isOpen ? "s-open" : "s-closed";
    const badgeLbl = isMoving ? (sg === "opening" ? "Ouverture…" : "Fermeture…") : isOpen ? "Ouvert" : "Fermé";
    const mainSvc  = isOpen ? "close_cover" : "open_cover";
    const mainLbl  = isOpen ? "Fermer" : "Ouvrir";

    const leafLOpen = sl === "open";
    const leafROpen = sr === "open";
    const compact   = this.config.compact;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        * { box-sizing: border-box; }

        .card {
          background: var(--card-background-color, #fff);
          border-radius: 14px;
          border: 1px solid var(--divider-color, #e5e5e5);
          padding: ${compact ? "14px 16px" : "18px 20px"};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: ${compact ? "12px" : "16px"};
        }
        .title {
          font-size: 14px; font-weight: 500;
          color: var(--primary-text-color); margin: 0;
        }
        .badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 500;
          padding: 3px 9px; border-radius: 7px;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; }
        .s-closed { background: var(--secondary-background-color, #f0f0f0); color: var(--secondary-text-color, #666); }
        .s-closed .dot { background: #999; }
        .s-open   { background: #eaf3de; color: #3b6d11; }
        .s-open   .dot { background: #639922; }
        .s-moving { background: #faeeda; color: #854f0b; }
        .s-moving .dot { background: #ef9f27; animation: blink .8s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        .scene {
          background: var(--secondary-background-color, #f7f7f7);
          border: 1px solid var(--divider-color, #e5e5e5);
          border-radius: 10px;
          height: 130px;
          margin-bottom: 14px;
          position: relative;
          overflow: hidden;
          perspective: 600px;
          display: ${compact ? "none" : "block"};
        }
        .ground {
          position: absolute; bottom: 0; left: 0; right: 0; height: 26px;
          background: var(--primary-background-color, #eee);
          border-top: 1px solid var(--divider-color, #e5e5e5);
        }
        .pillar {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 13px; height: 85px;
          background: var(--divider-color, #bbb);
          border-radius: 3px; z-index: 3;
        }
        .pillar-l { left: 26px; }
        .pillar-r { right: 26px; }

        .leaf-l, .leaf-r {
          position: absolute;
          top: 50%; margin-top: -42px;
          height: 84px;
          width: calc(50% - 39px);
          transform-style: preserve-3d;
          transition: transform .9s cubic-bezier(.4,0,.2,1);
          z-index: 2;
        }
        .leaf-l { left: 39px;  transform-origin: left center; }
        .leaf-r { right: 39px; transform-origin: right center; }
        .leaf-l.open { transform: rotateY(-72deg); }
        .leaf-r.open { transform: rotateY(72deg); }

        .leaf-inner {
          width: 100%; height: 100%;
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #ccc);
          display: flex; flex-direction: column;
          align-items: center; justify-content: space-evenly;
          padding: 9px 0;
        }
        .bar {
          width: 55%; height: 3px; border-radius: 2px;
          background: var(--divider-color, #ddd);
        }

        .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
        .btn-full { grid-column: 1/-1; }
        .sep { height: 1px; background: var(--divider-color, #e5e5e5); margin: 7px 0; }

        button {
          padding: ${compact ? "8px 10px" : "9px 12px"};
          border-radius: 8px;
          border: 1px solid var(--divider-color, #e5e5e5);
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
          font-size: 13px; font-weight: 500; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: opacity .15s, transform .1s;
          font-family: inherit;
        }
        button:active { transform: scale(.97); }
        button.primary {
          background: var(--primary-text-color);
          color: var(--card-background-color, #fff);
          border-color: transparent;
        }
        button svg { width: 14px; height: 14px; flex-shrink: 0; }
      </style>

      <div class="card">
        <div class="header">
          <p class="title">${this.config.title}</p>
          <div class="badge ${badgeCls}">
            <div class="dot"></div>
            <span>${badgeLbl}</span>
          </div>
        </div>

        <div class="scene">
          <div class="ground"></div>
          <div class="pillar pillar-l"></div>
          <div class="pillar pillar-r"></div>
          <div class="leaf-l ${leafLOpen ? "open" : ""}">
            <div class="leaf-inner">
              <div class="bar"></div><div class="bar"></div>
              <div class="bar"></div><div class="bar"></div>
            </div>
          </div>
          <div class="leaf-r ${leafROpen ? "open" : ""}">
            <div class="leaf-inner">
              <div class="bar"></div><div class="bar"></div>
              <div class="bar"></div><div class="bar"></div>
            </div>
          </div>
        </div>

        <div class="btn-grid">
          <button class="primary btn-full" id="btn-main">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="3" width="5" height="10" rx="1"/>
              <rect x="9" y="3" width="5" height="10" rx="1"/>
            </svg>
            ${mainLbl}
          </button>
        </div>
        <div class="sep"></div>
        <div class="btn-grid">
          <button id="btn-left">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="3" width="5" height="10" rx="1"/>
              <line x1="10" y1="8" x2="14" y2="8"/><polyline points="12,6 14,8 12,10"/>
            </svg>
            Gauche
          </button>
          <button id="btn-right">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="9" y="3" width="5" height="10" rx="1"/>
              <line x1="2" y1="8" x2="6" y2="8"/><polyline points="4,6 2,8 4,10"/>
            </svg>
            Droite
          </button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById("btn-main").addEventListener("click", () => {
      this._svc("cover", mainSvc, this.config.entity_global);
    });
    this.shadowRoot.getElementById("btn-left").addEventListener("click", () => {
      this._svc("cover", leafLOpen ? "close_cover" : "open_cover", this.config.entity_left);
    });
    this.shadowRoot.getElementById("btn-right").addEventListener("click", () => {
      this._svc("cover", leafROpen ? "close_cover" : "open_cover", this.config.entity_right);
    });
  }

  getCardSize() { return this.config.compact ? 2 : 3; }
}

customElements.define("portail-card", PortailCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "portail-card",
  name: "Portail double battant",
  description: "Carte de contrôle pour portail électrique double battant",
});
