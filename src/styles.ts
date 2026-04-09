export const sharedStyles = `
  :host { display: block; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .card {
    background: var(--card-background-color, #fff);
    border-radius: 12px;
    border: 1px solid var(--divider-color, #eaeaea);
    padding: 20px;
    font-family: var(--ha-card-header-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  }
  .card.compact { padding: 16px; }

  /* Header */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .compact .header { margin-bottom: 12px; }

  .title {
    font-size: 13px; font-weight: 500; letter-spacing: -0.01em;
    color: var(--primary-text-color, #171717);
  }

  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500;
    padding: 4px 10px; border-radius: 999px;
    letter-spacing: -0.01em;
    transition: background .3s, color .3s;
  }
  .dot {
    width: 6px; height: 6px; border-radius: 50%;
    transition: background .3s;
  }

  .s-closed { background: var(--secondary-background-color, #fafafa); color: var(--secondary-text-color, #666); }
  .s-closed .dot { background: #999; }
  .s-open   { background: #f0fdf4; color: #15803d; }
  .s-open   .dot { background: #22c55e; }
  .s-moving { background: #fffbeb; color: #a16207; }
  .s-moving .dot { background: #f59e0b; animation: pulse .8s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  /* Scene */
  .scene {
    background: var(--secondary-background-color, #fafafa);
    border: 1px solid var(--divider-color, #eaeaea);
    border-radius: 8px;
    height: 120px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }
  .ground {
    position: absolute; bottom: 0; left: 0; right: 0; height: 24px;
    background: var(--primary-background-color, #f5f5f5);
    border-top: 1px solid var(--divider-color, #eaeaea);
  }
  .pillar {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 10px; height: 80px;
    background: var(--divider-color, #d4d4d4);
    border-radius: 3px; z-index: 3;
  }

  @keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .moving { animation: shimmer 1.5s ease-in-out infinite; }

  /* Buttons */
  .actions {
    display: flex; gap: 8px;
  }

  .btn {
    flex: 1;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--divider-color, #eaeaea);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #171717);
    font-size: 13px; font-weight: 500; letter-spacing: -0.01em;
    cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    transition: background .15s, border-color .15s, transform .1s;
    font-family: inherit;
  }
  .compact .btn { height: 36px; font-size: 12px; }
  .btn:hover { background: var(--secondary-background-color, #fafafa); border-color: var(--primary-text-color, #171717); }
  .btn:active { transform: scale(.98); }

  .btn-primary {
    background: var(--primary-text-color, #171717);
    color: var(--card-background-color, #fff);
    border-color: var(--primary-text-color, #171717);
  }
  .btn-primary:hover { opacity: .9; background: var(--primary-text-color, #171717); }

  .btn svg { width: 14px; height: 14px; flex-shrink: 0; }

  .sep { height: 1px; background: var(--divider-color, #eaeaea); margin: 10px 0; }

  /* Clickable leaves */
  [data-leaf] {
    cursor: pointer;
  }

  [data-leaf]:hover .leaf-face,
  [data-leaf]:hover .slide-face {
    border-color: var(--primary-text-color, #171717);
  }

  /* Lock state — prevents spam */
  .card.locked .btn,
  .card.locked [data-leaf] {
    pointer-events: none;
    opacity: .55;
  }
  .card.locked .btn { cursor: not-allowed; }
`;
