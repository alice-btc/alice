// Static shell for the Alice admin dashboard, served at GET /admin.
//
// Deliberately a single dependency-free HTML page with inline JS: no build
// step, no third-party analytics/admin SaaS, nothing loaded from a CDN. It
// authenticates using the same account API every Alice client uses
// (/auth/password/login), then talks to /admin/api/* with the resulting
// bearer token. The server is the only thing enforcing admin access: this
// page has no special privilege on its own.
//
// Visually it is the wallet: the same Alice Blue palette from
// packages/alice-content/src/theme.ts (PALETTES.blue), the same PressStart2P
// display face, terminal-grotesque for figures, and the same 2px border /
// 2px radius "pixel" treatment as the wallet's own surfaces.
//
// The page is assembled from four pieces so that no file is too long to read:
// the stylesheet, and the client script in three parts that share one
// closure (core, the Today and Growth sections, the Money and Accounts
// sections). They are concatenated here into one inline <script>.
import { ADMIN_CLIENT_CORE } from './admin-dashboard-client-core.ts';
import { ADMIN_CLIENT_MONEY } from './admin-dashboard-client-money.ts';
import { ADMIN_CLIENT_TODAY } from './admin-dashboard-client-today.ts';
import { ADMIN_DASHBOARD_CSS } from './admin-dashboard-css.ts';
import { NUMBERS_FONT_WOFF2, PIXEL_FONT_WOFF2 } from './admin-dashboard-fonts.ts';

export const ADMIN_DASHBOARD_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Alice Admin</title>
<style>
  @font-face {
    font-family: 'PressStart2P';
    src: url(data:font/woff2;base64,${PIXEL_FONT_WOFF2}) format('woff2');
    font-display: swap;
  }
  @font-face {
    font-family: 'TerminalGrotesque';
    src: url(data:font/woff2;base64,${NUMBERS_FONT_WOFF2}) format('woff2');
    font-display: swap;
  }
${ADMIN_DASHBOARD_CSS}
</style>
</head>
<body>
<header>
  <div class="bar">
    <h1>ALICE · ADMIN</h1>
    <div id="sections" class="chrome" style="display:none"></div>
    <span class="spacer"></span>
    <div id="period" class="seg chrome" style="display:none"></div>
    <button id="refresh" class="tool chrome" style="display:none" title="Read every figure on this page again">Refresh</button>
    <span id="stamp" class="stamp chrome" style="display:none"></span>
    <button id="lock" class="tool locked chrome" style="display:none"></button>
    <span id="role" class="pill chrome" style="display:none"></span>
    <button id="theme" class="tool" title="Light / dark">◐</button>
    <button id="logout" class="tool danger chrome" style="display:none">Sign out</button>
  </div>
  <div class="bar chrome" style="display:none"><div id="pages"></div></div>
  <form id="unlock"></form>
</header>
<div id="alerts"></div>
<main id="app"></main>
<script>${ADMIN_CLIENT_CORE}${ADMIN_CLIENT_TODAY}${ADMIN_CLIENT_MONEY}</script>
</body>
</html>
`;
