// The console's stylesheet, inlined into the page by admin-dashboard-html.ts.
//
// Three faces, each with one job. The pixel face is Alice's signature and is
// kept for the few words that name a place: the title, the sections, a card's
// heading. Figures use the wallet's numeric face. Everything meant to be read
// (labels, table headings, axes, sentences) is in the system face at a size
// that does not need squinting: the pixel face is unreadable at small sizes.
export const ADMIN_DASHBOARD_CSS = String.raw`
  /* PALETTES.blue.dark, packages/alice-content/src/theme.ts */
  :root {
    color-scheme: dark;
    --alice-bg: #0d1117;
    --alice-bg-soft: #161b22;
    --alice-primary: #8bb8ff;
    --alice-primary-dark: #a8ccff;
    --alice-border: #2a3a52;
    --alice-muted: #4a6a9a;
    --alice-card-bg: rgba(22, 27, 34, 0.8);
    --alice-on-primary: #16294a;
    /* Running text. The primary blue is an accent: headings, figures, the
       active tab. A page set entirely in it has no hierarchy left. */
    --alice-white: #e6edf3;
    /* Secondary text: labels, hints, axes. --alice-muted is 3.6:1 on the
       background, fine for a border and too faint for a sentence. */
    --alice-dim: #9aa9c0;
    --alice-ink: #8bb8ff;
    --alice-danger: #f14317;   /* PALETTES.flame.primary */
    --alice-ok: #56dc4b;       /* PALETTES.green.primary */
    --alice-warn: #f7931a;     /* PALETTES.bitcoin.primary */
    --font-ui: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-num: 'TerminalGrotesque', ui-monospace, 'SF Mono', Menlo, monospace;
    --font-pixel: 'PressStart2P', monospace;
  }
  /* PALETTES.blue.light, for anyone who prefers it or screenshots on white */
  :root[data-theme="light"] {
    color-scheme: light;
    --alice-bg: #fafafa;
    --alice-bg-soft: #f0f4fa;
    --alice-primary: #8bb8ff;
    --alice-primary-dark: #6fa3f7;
    --alice-border: #b9cdea;
    --alice-muted: #4a6a9a;
    --alice-card-bg: rgba(255, 255, 255, 0.8);
    --alice-on-primary: #16294a;
    --alice-white: #1c2533;
    --alice-dim: #51627c;
    /* The primary is 1.9:1 on white and cannot carry text there. */
    --alice-ink: #1f4f9c;
    --alice-danger: #c9330c;
    --alice-ok: #1f7a17;
    --alice-warn: #a85c00;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--alice-bg);
    color: var(--alice-white);
    font-family: var(--font-ui);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  header {
    position: sticky; top: 0; z-index: 10;
    background: var(--alice-bg);
    border-bottom: 2px solid var(--alice-border);
  }
  .bar {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    padding: 10px 20px;
    max-width: 1280px; margin: 0 auto;
  }
  .bar + .bar { padding-top: 0; }
  .spacer { flex: 1; }
  header h1 {
    font-family: var(--font-pixel); font-size: 12px; font-weight: 400;
    margin: 0 8px 0 0; color: var(--alice-ink); letter-spacing: 0.02em;
  }

  /* The four sections: the only navigation in the pixel face. */
  #sections { display: flex; gap: 4px; flex-wrap: wrap; }
  #sections button {
    font-family: var(--font-pixel); font-size: 9px; text-transform: uppercase;
    background: none; border: 2px solid transparent; border-radius: 2px;
    color: var(--alice-dim); padding: 9px 10px; cursor: pointer;
  }
  #sections button:hover { color: var(--alice-ink); }
  #sections button.active {
    background: var(--alice-primary); border-color: var(--alice-primary);
    color: var(--alice-on-primary);
  }

  /* The pages of a section: plain words, underlined when open. */
  #pages { display: flex; gap: 2px; flex-wrap: wrap; }
  #pages button {
    font-family: var(--font-ui); font-size: 13px;
    background: none; border: 0; border-bottom: 2px solid transparent;
    color: var(--alice-dim); padding: 6px 10px 8px; cursor: pointer;
  }
  #pages button:hover { color: var(--alice-white); }
  #pages button.active { color: var(--alice-ink); border-bottom-color: var(--alice-primary); }

  .seg { display: inline-flex; border: 2px solid var(--alice-border); border-radius: 2px; }
  .seg button {
    font-family: var(--font-ui); font-size: 12px;
    background: none; border: 0; color: var(--alice-dim);
    padding: 5px 9px; cursor: pointer;
  }
  .seg button + button { border-left: 2px solid var(--alice-border); }
  .seg button.active { background: var(--alice-primary); color: var(--alice-on-primary); }
  .seg.off { opacity: .35; }

  .tool {
    font-family: var(--font-ui); font-size: 12px;
    background: none; border: 2px solid var(--alice-border); border-radius: 2px;
    color: var(--alice-white); padding: 5px 9px; cursor: pointer;
  }
  .tool:hover { border-color: var(--alice-primary); }
  .tool.locked { color: var(--alice-dim); }
  .tool.open { border-color: var(--alice-warn); color: var(--alice-warn); }
  .tool.danger { border-color: var(--alice-danger); color: var(--alice-danger); }
  .stamp { font-size: 12px; color: var(--alice-dim); }

  #unlock {
    display: none; gap: 8px; align-items: center; flex-wrap: wrap;
    padding: 0 20px 10px; max-width: 1280px; margin: 0 auto;
  }
  #unlock.show { display: flex; }

  /* What needs a person, above everything, on every page. */
  #alerts { max-width: 1280px; margin: 0 auto; padding: 0 20px; }
  .alert {
    display: flex; gap: 10px; align-items: baseline;
    border: 2px solid var(--alice-warn); border-radius: 2px;
    padding: 8px 12px; margin-top: 12px; font-size: 13px;
  }
  .alert.bad { border-color: var(--alice-danger); }
  .alert b { color: var(--alice-warn); font-weight: 600; white-space: nowrap; }
  .alert.bad b { color: var(--alice-danger); }

  main { padding: 20px; max-width: 1280px; margin: 0 auto; }

  /* 2px border, 2px radius: getPixel() in theme.ts */
  .card {
    background: var(--alice-card-bg);
    border: 2px solid var(--alice-border);
    border-radius: 2px;
    padding: 16px;
    margin-bottom: 16px;
    overflow-x: auto;
  }
  h2 {
    font-family: var(--font-pixel); font-size: 10px; font-weight: 400;
    margin: 0 0 14px; color: var(--alice-ink); text-transform: uppercase;
    letter-spacing: 0.02em; line-height: 1.6;
  }

  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .card .grid:last-child { margin-bottom: 0; }
  .grid-3 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .grid-2 { grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }
  .grid > .card { margin-bottom: 0; }

  .stat {
    background: var(--alice-card-bg);
    border: 2px solid var(--alice-border);
    border-radius: 2px;
    padding: 14px;
  }
  /* terminal-grotesque is the numeric face in the wallet (typography.numbers) */
  .stat .n { font-family: var(--font-num); font-size: 32px; line-height: 1; color: var(--alice-ink); }
  .stat .l {
    color: var(--alice-dim); font-size: 12px; margin-top: 8px;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .stat.hero .n { font-size: 44px; }
  /* The hint is what makes a number readable a month later: it says what is
     actually being counted, in words, not just a terse label. */
  .stat .hint { color: var(--alice-dim); font-size: 13px; margin-top: 8px; }
  .stat .delta {
    font-size: 12px; margin-top: 12px; padding-top: 10px;
    border-top: 2px solid var(--alice-border); color: var(--alice-dim);
  }
  .delta.up { color: var(--alice-ok); }
  .delta.down { color: var(--alice-warn); }

  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td {
    text-align: left; padding: 8px; white-space: nowrap;
    border-bottom: 1px solid var(--alice-border);
  }
  th {
    color: var(--alice-dim); font-weight: 500; font-size: 12px;
    text-transform: uppercase; letter-spacing: 0.05em;
    border-bottom-width: 2px;
  }
  th.sortable { cursor: pointer; user-select: none; }
  th.sortable:hover { color: var(--alice-white); }
  th.sorted { color: var(--alice-ink); }
  td.num, th.num { text-align: right; }
  td.num { font-family: var(--font-num); font-size: 19px; color: var(--alice-ink); }
  td.wrap { white-space: normal; min-width: 240px; }
  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--alice-bg-soft); }
  .table-tools { display: flex; justify-content: flex-end; margin-top: 10px; }

  input, select, textarea, button.btn {
    background: var(--alice-bg-soft);
    border: 2px solid var(--alice-border);
    border-radius: 2px;
    color: var(--alice-white);
    padding: 8px 10px;
    font-size: 14px;
    font-family: var(--font-ui);
  }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--alice-primary); }
  button:focus-visible { outline: 2px solid var(--alice-primary); outline-offset: 2px; }
  input::placeholder { color: var(--alice-dim); }
  button.btn { cursor: pointer; font-weight: 500; color: var(--alice-ink); }
  button.btn:hover { border-color: var(--alice-primary); }
  button.btn.primary {
    background: var(--alice-primary); border-color: var(--alice-primary);
    color: var(--alice-on-primary);
  }
  button.btn.danger { background: transparent; border-color: var(--alice-danger); color: var(--alice-danger); }
  button.btn.danger:hover { background: var(--alice-danger); color: var(--alice-bg); }
  button.btn:disabled { opacity: .4; cursor: not-allowed; }

  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .muted { color: var(--alice-dim); font-size: 13px; }
  .warn { color: var(--alice-warn); font-size: 13px; }
  /* Where a figure comes from and when it was read. */
  .src { color: var(--alice-dim); font-size: 12px; margin: 12px 0 0; }
  p { margin: 0 0 12px; }
  ul { margin: 0 0 12px; padding-left: 18px; }

  .pill {
    display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: 12px;
    border: 2px solid var(--alice-border); color: var(--alice-dim);
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .pill.active, .pill.ok { color: var(--alice-ok); border-color: var(--alice-ok); }
  .pill.warn { color: var(--alice-warn); border-color: var(--alice-warn); }
  .pill.suspended, .pill.bad { color: var(--alice-danger); border-color: var(--alice-danger); }

  .err { color: var(--alice-danger); margin: 10px 0; white-space: pre-wrap; font-size: 13px; }
  .ok { color: var(--alice-ok); margin: 10px 0; font-size: 13px; }

  label {
    display: block; font-size: 12px; color: var(--alice-dim); margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .field { margin-bottom: 12px; }
  code {
    background: var(--alice-bg-soft); padding: 2px 6px; border-radius: 2px;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 12px;
    color: var(--alice-white);
  }

  /* ---- Health lights ---- */
  .lights { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .light {
    display: flex; gap: 12px; align-items: flex-start;
    border: 2px solid var(--alice-border); border-radius: 2px;
    background: var(--alice-card-bg); padding: 12px 14px;
  }
  .dot { width: 14px; height: 14px; flex: none; margin-top: 3px; background: var(--alice-muted); }
  .light.is-ok .dot { background: var(--alice-ok); }
  .light.is-warn .dot { background: var(--alice-warn); }
  .light.is-bad .dot { background: var(--alice-danger); }
  .light.is-warn { border-color: var(--alice-warn); }
  .light.is-bad { border-color: var(--alice-danger); }
  .light .name { font-weight: 600; }
  .light .why { color: var(--alice-dim); font-size: 13px; }
  .light .state { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--alice-dim); }

  /* ---- At a glance: one tile per key figure ---- */
  .strip {
    display: flex; gap: 6px 18px; flex-wrap: wrap; align-items: center;
    border: 2px solid var(--alice-border); border-radius: 2px;
    background: var(--alice-card-bg); padding: 10px 14px; margin-bottom: 16px;
    font-size: 13px; cursor: pointer;
  }
  .strip:hover { border-color: var(--alice-primary); }
  .strip span { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
  .strip i { width: 10px; height: 10px; background: var(--alice-muted); }
  .strip i.is-ok { background: var(--alice-ok); }
  .strip i.is-warn { background: var(--alice-warn); }
  .strip i.is-bad { background: var(--alice-danger); }
  .group {
    font-size: 12px; color: var(--alice-dim); text-transform: uppercase;
    letter-spacing: 0.08em; margin: 18px 0 8px;
  }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
  .tile {
    display: flex; flex-direction: column; text-align: left;
    background: var(--alice-card-bg); border: 2px solid var(--alice-border);
    border-radius: 2px; padding: 12px 14px; cursor: pointer;
    font-family: var(--font-ui); color: var(--alice-white);
  }
  .tile:hover { border-color: var(--alice-primary); }
  .tile .l { font-size: 12px; color: var(--alice-dim); text-transform: uppercase; letter-spacing: 0.05em; }
  .tile .n { font-family: var(--font-num); font-size: 34px; line-height: 1.1; color: var(--alice-ink); margin-top: 4px; }
  .tile .d { font-size: 12px; color: var(--alice-dim); margin-top: 2px; min-height: 18px; }
  .tile .d.up { color: var(--alice-ok); }
  .tile .d.down { color: var(--alice-warn); }
  .spark { display: flex; align-items: flex-end; gap: 1px; height: 34px; margin-top: 10px; }
  .spark i { flex: 1; min-width: 1px; background: var(--alice-primary); opacity: .85; }
  .spark i.zero { background: var(--alice-border); height: 1px; }
  .spark.none { align-items: center; font-size: 12px; color: var(--alice-dim); }

  /* ---- Charts ----
     Bars keep the wallet's pixel language through a repeating gradient, so a
     bar reads as stacked blocks while its height stays a plain percentage. */
  .chart { display: flex; gap: 8px; height: 180px; }
  .chart-y {
    display: flex; flex-direction: column; justify-content: space-between;
    font-size: 11px; color: var(--alice-dim); text-align: right; min-width: 44px;
    padding: 0 0 0; line-height: 1;
  }
  .chart-plot {
    position: relative; flex: 1;
    border-left: 2px solid var(--alice-border);
    border-bottom: 2px solid var(--alice-border);
  }
  .chart-grid {
    position: absolute; left: 0; right: 0; height: 0;
    border-top: 1px dashed var(--alice-border); opacity: .55;
  }
  /* The period's average, drawn across the plot. */
  .chart-avg {
    position: absolute; left: 0; right: 0; height: 0;
    border-top: 2px dotted var(--alice-white); opacity: .5;
  }
  /* A release or a note, on the bar of its day. */
  .chart-flag {
    position: absolute; top: 0; bottom: 0; width: 0;
    border-left: 2px dashed var(--alice-warn); opacity: .8;
  }
  .chart-flag::before {
    content: '⚑'; position: absolute; top: -4px; left: 2px;
    font-size: 12px; color: var(--alice-warn);
  }
  .chart-flags { display: flex; gap: 6px 16px; flex-wrap: wrap; margin: 8px 0 0; font-size: 12px; color: var(--alice-dim); }
  .chart-flags b { color: var(--alice-warn); font-weight: 600; }
  .chart-bars { position: absolute; inset: 0; display: flex; align-items: flex-end; gap: 2px; padding: 0 3px; }
  .chart-bar {
    flex: 1; min-width: 2px; height: 100%;
    display: flex; flex-direction: column; justify-content: flex-end;
    cursor: default;
  }
  .chart-fill {
    width: 100%; min-height: 0;
    --fill: var(--alice-primary);
    /* The pixel texture: solid bands with gaps, rather than real elements. */
    background: repeating-linear-gradient(to top, var(--fill) 0 5px, transparent 5px 7px);
    transition: height 420ms cubic-bezier(.22, 1, .36, 1);
  }
  .chart-bar.hot { background: rgba(139, 184, 255, 0.10); }
  .chart-tip {
    position: absolute; bottom: calc(100% + 6px); transform: translateX(-50%);
    background: var(--alice-bg); border: 2px solid var(--alice-primary);
    border-radius: 2px; padding: 5px 9px; white-space: nowrap;
    font-size: 12px; color: var(--alice-white);
    opacity: 0; transition: opacity 120ms; pointer-events: none; z-index: 2;
  }
  .chart-x { display: flex; justify-content: space-between; padding: 6px 0 0 52px; font-size: 11px; color: var(--alice-dim); }
  .chart-summary {
    display: flex; gap: 18px; flex-wrap: wrap;
    margin: 10px 0 0; padding-top: 10px;
    border-top: 1px solid var(--alice-border);
    font-size: 12px; color: var(--alice-dim);
  }
  .chart-summary b { color: var(--alice-white); font-weight: 600; }
  .legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: var(--alice-dim); margin-bottom: 10px; }
  .legend i { display: inline-block; width: 10px; height: 10px; margin-right: 6px; }

  /* Horizontal bars, used by the funnel and the quota histogram. */
  .pxbar { display: flex; gap: 2px; margin-top: 5px; border: 2px solid var(--alice-border); border-radius: 2px; padding: 2px; }
  .pxcell { flex: 1; height: 10px; background: transparent; }
  .pxcell.on { background: var(--alice-primary); }
  .pxcell.on.warn { background: var(--alice-warn); }
  .pxcell.on.danger { background: var(--alice-danger); }
  .pxrow { margin-bottom: 14px; }
  .pxrow .lbl { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .pxrow .lbl span:first-child { font-size: 13px; color: var(--alice-dim); }
  .pxrow .lbl span:last-child { font-family: var(--font-num); font-size: 20px; color: var(--alice-ink); }

  /* Retention cells: the darker, the more installations came back. */
  td.heat { text-align: right; font-family: var(--font-num); font-size: 17px; }

  @media (max-width: 700px) {
    .bar { padding: 8px 12px; }
    main { padding: 12px; }
    #alerts, #unlock { padding-left: 12px; padding-right: 12px; }
  }
`;
