// The console's client script, part 1 of 3: state, the API helper, the write
// lock, formatting, charts and tables. The three parts are concatenated into
// one inline <script> by admin-dashboard-html.ts and share one closure, which
// this part opens and part 3 closes.
//
// String.raw on purpose. In an ordinary template literal a single backslash
// disappears at compile time, which can turn a regex into a comment and
// leave the page blank. Raw text reaches the browser exactly as written here. Two things still cannot
// appear in these files: a backtick, and a dollar sign followed by a brace.
export const ADMIN_CLIENT_CORE = String.raw`
(function () {
  var API = location.origin;
  var DAY = 86400000;
  var HOUR = 3600000;

  function stored(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  var SECTIONS = [
    { id: 'today', label: 'Today', pages: [
      ['glance', 'At a glance'], ['pulse', 'Pulse'], ['errors', 'Errors'], ['infra', 'Infrastructure'], ['versions', 'Versions'], ['notes', 'Notes'],
    ] },
    { id: 'growth', label: 'Growth', pages: [
      ['overview', 'Overview'], ['activation', 'Activation'], ['events', 'Download clicks'],
      ['downloads', 'Downloads'], ['site', 'Site'],
    ] },
    { id: 'money', label: 'Money', pages: [
      ['revenue', 'Revenue'], ['subscriptions', 'Subscriptions'], ['usage', 'Usage'],
      ['venice', 'Venice cost'], ['faucet', 'Faucet'], ['promos', 'Promos'],
    ] },
    { id: 'accounts', label: 'Accounts', pages: [
      ['accounts', 'Accounts'], ['audit', 'Audit'], ['admins', 'Admins'],
    ] },
  ];
  // The pages whose figures follow the period selector. On the others it is
  // dimmed rather than left looking like it does something.
  var PERIOD_PAGES = ['glance', 'errors', 'infra', 'overview', 'activation', 'events', 'site',
    'revenue', 'subscriptions', 'usage', 'venice', 'downloads'];
  var PERIODS = [[1, '24 h'], [7, '7 d'], [30, '30 d'], [90, '90 d']];

  var state = {
    token: sessionStorage.getItem('alice_admin_token') || null,
    role: null,
    page: stored('alice_admin_page', 'glance'),
    detail: null,
    days: Number(stored('alice_admin_days', '30')) || 30,
    // The write unlock lives in memory only: closing or reloading the tab
    // locks the console again.
    unlock: null,
    health: null,
    marks: [],
    accountFilter: {},
    ticket: 0,
  };

  var app = document.getElementById('app');
  var alertsEl = document.getElementById('alerts');
  var sectionsEl = document.getElementById('sections');
  var pagesEl = document.getElementById('pages');
  var periodEl = document.getElementById('period');
  var stampEl = document.getElementById('stamp');
  var lockBtn = document.getElementById('lock');
  var unlockForm = document.getElementById('unlock');

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined) return;
      if (k === 'text') el.textContent = attrs[k];
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }

  // ---- Formatting ----

  function pad(n) { return ('0' + n).slice(-2); }

  function fmtTime(ms) {
    if (!ms) return '—';
    return new Date(ms).toLocaleString();
  }
  function fmtDate(ms) {
    if (!ms) return '—';
    return new Date(ms).toISOString().slice(0, 10);
  }
  function fmtClock(ms) {
    var d = new Date(ms);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  // Amounts read as amounts, not as raw integers: 2100 is a payout,
  // 2 100 000 is a float, and the eye should not have to count digits.
  function num(n) {
    if (n === null || n === undefined) return '—';
    var parts = String(Math.round(n * 100) / 100).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  }
  var sats = num;

  function bytes(n) {
    if (n === null || n === undefined) return '—';
    var units = ['B', 'kB', 'MB', 'GB', 'TB'];
    var i = 0;
    while (n >= 1000 && i < units.length - 1) { n /= 1000; i += 1; }
    return (i === 0 ? String(n) : n.toFixed(n < 10 ? 2 : 1)) + ' ' + units[i];
  }

  function money(cents, currency) {
    return num(Math.round(cents) / 100) + ' ' + (currency || 'EUR');
  }
  function usd(n) { return (Math.round(n * 100) / 100).toFixed(2) + ' USD'; }
  function ms(n) { return (Math.round(n * 100) / 100) + ' ms'; }

  function periodName() { return state.days === 1 ? '24 hours' : state.days + ' days'; }

  // A bucket's label: an hour of the day on the 24-hour view, a date otherwise.
  function bucketLabel(t, bucketMs) {
    var d = new Date(t);
    if (bucketMs === HOUR) {
      return d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' + pad(d.getHours()) + ':00';
    }
    return d.toISOString().slice(5, 10);
  }

  // ---- API ----

  // The dashboard can be served from a secret path, so it learns where it
  // lives from its own URL rather than hard-coding /admin. Call sites keep
  // writing '/admin/api/...' and this rewrites the prefix: one place to get
  // right instead of forty.
  var ADMIN_BASE = location.pathname.replace(/\/+$/, '') || '/admin';

  function unlocked() {
    return Boolean(state.unlock && state.unlock.expires > Date.now());
  }

  function api(path, options) {
    options = options || {};
    var headers = Object.assign({ 'content-type': 'application/json' }, options.headers || {});
    if (state.token) headers.authorization = 'Bearer ' + state.token;
    if (unlocked()) headers['x-admin-unlock'] = state.unlock.token;
    var target = API + path.replace(/^\/admin\/api/, ADMIN_BASE + '/api');
    return fetch(target, Object.assign({}, options, { headers: headers }))
      .then(function (res) {
        if (res.status === 204) return null;
        return res.json().then(function (body) {
          if (!res.ok) throw new Error((body.error && body.error.message) || 'Request failed');
          return body;
        });
      });
  }

  // A read that follows the period selector.
  function periodic(path) {
    return api(path + (path.indexOf('?') < 0 ? '?' : '&') + 'days=' + state.days);
  }

  function setToken(token) {
    state.token = token;
    if (token) sessionStorage.setItem('alice_admin_token', token);
    else sessionStorage.removeItem('alice_admin_token');
  }

  // ---- Page plumbing ----

  // Loads, then builds. The ticket drops an answer that arrives after the
  // operator has already moved to another page, so a slow request can never
  // paint over the page they are now reading.
  function page(load, build) {
    var ticket = ++state.ticket;
    app.innerHTML = '<p class="muted">Loading…</p>';
    // The marks are drawn on the curves, so they are awaited too, but a page
    // never fails or waits long because of them.
    var marks = Promise.race([
      loadMarks().catch(function () { return []; }),
      new Promise(function (resolve) { setTimeout(resolve, 4000); }),
    ]);
    Promise.all([load(), marks]).then(function (loaded) {
      var data = loaded[0];
      if (ticket !== state.ticket) return;
      app.innerHTML = '';
      build(data);
      stampEl.textContent = fmtClock(Date.now());
      stampEl.title = 'When the figures on this page were read';
    }).catch(function (e) {
      if (ticket !== state.ticket) return;
      app.innerHTML = '';
      app.appendChild(h('p', { class: 'err', text: e.message }));
    });
  }

  function card(title, children) {
    return h('div', { class: 'card' }, [h('h2', { text: title })].concat(children || []));
  }
  function para(text, cls) { return h('p', { class: cls || 'muted', text: text }); }

  // Where a figure comes from and how fresh it is.
  function source(text, at) {
    return h('p', { class: 'src', text: 'Source: ' + text + (at ? ' · read ' + fmtTime(at) : '') });
  }

  function statCard(n, l, hint) {
    return h('div', { class: 'stat' }, [
      h('div', { class: 'n', text: String(n) }),
      h('div', { class: 'l', text: l }),
      hint ? h('div', { class: 'hint', text: hint }) : null,
    ]);
  }

  // A figure for the chosen period against the same span just before it. The
  // absolute difference comes first: off a base of 1, "+300%" says nothing
  // and "+3" says exactly what happened.
  function compareCard(value, previous, label, hint, fmt, lowerIsBetter) {
    fmt = fmt || num;
    var diff = value - previous;
    var good = lowerIsBetter ? diff < 0 : diff > 0;
    var text = (diff > 0 ? '▲ +' : (diff < 0 ? '▼ −' : '= ')) + (diff === 0 ? 'same' : fmt(Math.abs(diff)));
    if (previous > 0 && diff !== 0) text += ' (' + (diff > 0 ? '+' : '−') + Math.abs(Math.round((diff / previous) * 100)) + '%)';
    text += ' vs the ' + periodName() + ' before (' + fmt(previous) + ')';
    return h('div', { class: 'stat hero' }, [
      h('div', { class: 'n', text: fmt(value) }),
      h('div', { class: 'l', text: label }),
      h('div', { class: 'hint', text: hint }),
      h('div', { class: 'delta ' + (diff === 0 ? '' : (good ? 'up' : 'down')), text: text }),
    ]);
  }

  var BAR_CELLS = 40;

  // A horizontal bar drawn as discrete cells. Rounding up means any non-zero
  // value lights at least one cell, so a small-but-real number never renders
  // as an empty row.
  function bar(label, value, max, tone) {
    var filled = max > 0 ? Math.ceil((value / max) * BAR_CELLS) : 0;
    var strip = h('div', { class: 'pxbar' });
    for (var i = 0; i < BAR_CELLS; i += 1) {
      strip.appendChild(h('div', {
        class: 'pxcell' + (i < filled ? ' on' + (tone ? ' ' + tone : '') : ''),
      }));
    }
    return h('div', { class: 'pxrow' }, [
      h('div', { class: 'lbl' }, [h('span', { text: label }), h('span', { text: num(value) })]),
      strip,
    ]);
  }

  // ---- Charts ----

  // Round a maximum up to a value that divides cleanly, so the axis reads
  // 0 / 10 / 20 rather than 0 / 10.5 / 21.
  function niceMax(value) {
    if (value <= 0) return 1;
    var magnitude = Math.pow(10, Math.floor(Math.log(value) / Math.LN10));
    var steps = [1, 2, 2.5, 5, 10];
    for (var i = 0; i < steps.length; i += 1) {
      var candidate = steps[i] * magnitude;
      if (candidate >= value) return candidate;
    }
    return value;
  }

  var SERIES_COLORS = ['#8bb8ff', '#f7931a', '#56dc4b', '#c792ea', '#5fd3bc', '#f14317', '#e6c35c', '#9aa9c0'];

  function pointsOf(series, field, bucketMs) {
    return (series || []).map(function (row) {
      return { t: row.t, span: bucketMs, label: bucketLabel(row.t, bucketMs), count: row[field || 'count'] || 0 };
    });
  }

  // Rows of {t, key, count} laid over a list of bucket starts: one bar per
  // bucket, one segment per key.
  function stackPoints(times, rows, bucketMs) {
    var keys = [];
    var totals = {};
    var cells = {};
    (rows || []).forEach(function (r) {
      if (keys.indexOf(r.key) < 0) keys.push(r.key);
      totals[r.key] = (totals[r.key] || 0) + r.count;
      cells[r.t] = cells[r.t] || {};
      cells[r.t][r.key] = (cells[r.t][r.key] || 0) + r.count;
    });
    // Largest first, so the same key keeps the same colour down the legend.
    keys.sort(function (a, b) { return totals[b] - totals[a]; });
    var points = times.map(function (t) {
      var sum = 0;
      var parts = keys.map(function (k) {
        var c = (cells[t] || {})[k] || 0;
        sum += c;
        return { key: k, count: c };
      });
      return { t: t, span: bucketMs, label: bucketLabel(t, bucketMs), count: sum, parts: parts };
    });
    return { points: points, keys: keys };
  }

  function dayTimes(days) {
    var today = Math.floor(Date.now() / DAY) * DAY;
    var out = [];
    for (var i = Math.max(days, 2) - 1; i >= 0; i -= 1) out.push(today - i * DAY);
    return out;
  }

  /**
   * A bar chart with a real scale, one bar per bucket of the period.
   *
   * options.fmt formats a value (bytes, sats, ms). options.keys turns each
   * bar into stacked segments, one colour per key, with a legend.
   * options.level marks a measure that is a level, not a quantity (a p99):
   * its buckets are not added up into a total.
   *
   * Under the plot: total, average, lowest and highest bucket, so the shape
   * does not have to be estimated from bar heights.
   */
  function columns(points, unit, options) {
    options = options || {};
    var fmt = options.fmt || num;
    if (!points || points.length === 0) return para('No data yet.');
    var peak = 0, low = Infinity, total = 0, peakLabel = '', lowLabel = '';
    points.forEach(function (p) {
      total += p.count;
      if (p.count > peak) { peak = p.count; peakLabel = p.label; }
      if (p.count < low) { low = p.count; lowLabel = p.label; }
    });
    if (peak === 0) return para('Nothing recorded in this period.');
    var average = total / points.length;
    var top = niceMax(peak);

    var colorOf = {};
    (options.keys || []).forEach(function (k, i) { colorOf[k] = SERIES_COLORS[i % SERIES_COLORS.length]; });

    var tip = h('div', { class: 'chart-tip' });
    var bars = h('div', { class: 'chart-bars' });
    points.forEach(function (p, index) {
      var column = h('div', { class: 'chart-bar' });
      var parts = p.parts || [{ key: null, count: p.count }];
      // Stacked from the bottom: the first key sits on the axis.
      parts.slice().reverse().forEach(function (part) {
        if (!part.count) return;
        var fill = h('div', { class: 'chart-fill' });
        if (part.key !== null && colorOf[part.key]) fill.style.setProperty('--fill', colorOf[part.key]);
        fill.style.height = '0%';
        var target = (part.count / top) * 100;
        setTimeout(function () { fill.style.height = target + '%'; }, 20 + index * 8);
        column.appendChild(fill);
      });
      column.addEventListener('mouseenter', function () {
        column.classList.add('hot');
        var detail = p.parts
          ? p.parts.filter(function (x) { return x.count; })
            .map(function (x) { return x.key + ' ' + fmt(x.count); }).join(', ')
          : '';
        tip.textContent = p.label + ' · ' + fmt(p.count) + ' ' + unit + (detail ? ' (' + detail + ')' : '');
        tip.style.opacity = '1';
        // Anchored over the hovered bar, clamped inside the plot so the first
        // and last buckets stay readable.
        var pct = (index + 0.5) / points.length * 100;
        tip.style.left = Math.min(85, Math.max(15, pct)) + '%';
      });
      column.addEventListener('mouseleave', function () {
        column.classList.remove('hot');
        tip.style.opacity = '0';
      });
      bars.appendChild(column);
    });

    // Releases and the operator's notes, on the bar of their day. A day can
    // hold several; they share one flag and one line of text.
    var flags = [];
    var flagged = {};
    (state.marks || []).forEach(function (m) {
      points.forEach(function (p, index) {
        if (p.t === undefined || Math.floor(p.t / DAY) * DAY !== m.t) return;
        // On the hourly view a day's mark sits on its first hour shown.
        if (flagged[m.label + m.t]) return;
        flagged[m.label + m.t] = true;
        var existing = flags.filter(function (f) { return f.index === index; })[0];
        if (existing) existing.labels.push(m.label);
        else flags.push({ index: index, day: fmtDate(m.t).slice(5), labels: [m.label] });
      });
    });
    flags.sort(function (a, b) { return a.index - b.index; });
    var flagEls = flags.map(function (f) {
      return h('div', {
        class: 'chart-flag',
        style: 'left:' + ((f.index + 0.5) / points.length * 100) + '%',
        title: f.day + ' · ' + f.labels.join(', '),
      });
    });

    var plot = h('div', { class: 'chart-plot' }, [
      h('div', { class: 'chart-grid', style: 'bottom:100%' }),
      h('div', { class: 'chart-grid', style: 'bottom:50%' }),
      h('div', { class: 'chart-avg', style: 'bottom:' + (average / top * 100) + '%', title: 'Average' }),
    ].concat(flagEls, [bars, tip]));
    var axis = h('div', { class: 'chart-y' }, [
      h('span', { text: fmt(top) }),
      h('span', { text: fmt(top / 2) }),
      h('span', { text: '0' }),
    ]);
    var ticks = h('div', { class: 'chart-x' }, [
      h('span', { text: points[0].label }),
      points.length > 2 ? h('span', { text: points[Math.floor(points.length / 2)].label }) : null,
      h('span', { text: points[points.length - 1].label }),
    ]);

    function fact(label, value) {
      return h('span', {}, [document.createTextNode(label + ' '), h('b', { text: value })]);
    }
    var bucketName = points.length && /:/.test(points[0].label) ? 'hour' : 'day';
    var summary = h('p', { class: 'chart-summary' }, [
      options.level ? null : fact('Total', fmt(total) + ' ' + unit),
      fact('Average (dotted line)', fmt(Math.round(average * 100) / 100) + ' per ' + bucketName),
      fact('Lowest', fmt(low) + ' · ' + lowLabel),
      fact('Highest', fmt(peak) + ' · ' + peakLabel),
    ]);

    var legend = null;
    if (options.keys && options.keys.length) {
      legend = h('div', { class: 'legend' }, options.keys.map(function (k) {
        var swatch = h('i');
        swatch.style.background = colorOf[k];
        return h('span', {}, [swatch, document.createTextNode(k)]);
      }));
    }
    var flagList = null;
    if (flags.length) {
      var shown = flags.slice(-6);
      flagList = h('p', { class: 'chart-flags' }, shown.map(function (f) {
        return h('span', {}, [h('b', { text: '⚑ ' + f.day }), document.createTextNode(' ' + f.labels.join(', '))]);
      }));
      if (flags.length > shown.length) {
        flagList.insertBefore(h('span', { text: (flags.length - shown.length) + ' earlier' }), flagList.firstChild);
      }
    }
    return h('div', {}, [legend, h('div', { class: 'chart' }, [axis, plot]), ticks, flagList, summary]);
  }

  // ---- Tables ----

  function csvCell(value) {
    var text = value === null || value === undefined ? '' : String(value);
    // A leading = + - @ would run as a formula in a spreadsheet.
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function download(name, text) {
    var url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    var link = h('a', { href: url, download: name });
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /**
   * A table whose columns sort on a click and that exports what it shows.
   *
   * cols: { key, label, num, get(row), fmt(value), cell(row) -> Node, wrap }
   * options: { sort, dir, csv: 'file name', onRow(row), empty }
   */
  function dataTable(cols, rows, options) {
    options = options || {};
    var sortKey = options.sort || null;
    var dir = options.dir || -1;
    var wrap = h('div');

    function value(row, col) { return col.get ? col.get(row) : row[col.key]; }
    function shown(row, col) {
      var v = value(row, col);
      if (v === null || v === undefined || v === '') return '—';
      return col.fmt ? col.fmt(v) : String(v);
    }

    function draw() {
      wrap.innerHTML = '';
      if (!rows || rows.length === 0) {
        wrap.appendChild(para(options.empty || 'Nothing to show.'));
        return;
      }
      var sorted = rows.slice();
      var sortCol = cols.filter(function (c) { return c.key === sortKey; })[0];
      if (sortCol) {
        sorted.sort(function (a, b) {
          var x = value(a, sortCol), y = value(b, sortCol);
          if (x === null || x === undefined) x = typeof y === 'number' ? -Infinity : '';
          if (y === null || y === undefined) y = typeof x === 'number' ? -Infinity : '';
          if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
          return String(x).localeCompare(String(y)) * dir;
        });
      }
      var head = h('tr', {}, cols.map(function (c) {
        var th = h('th', {
          class: (c.num ? 'num ' : '') + (c.label ? 'sortable' : '') + (c.key === sortKey ? ' sorted' : ''),
          text: c.label + (c.key === sortKey ? (dir > 0 ? ' ▲' : ' ▼') : ''),
          title: c.label ? 'Sort by ' + c.label : null,
        });
        if (c.label) {
          th.addEventListener('click', function () {
            if (sortKey === c.key) dir = -dir; else { sortKey = c.key; dir = c.num ? -1 : 1; }
            draw();
          });
        }
        return th;
      }));
      var table = h('table', {}, [head]);
      sorted.forEach(function (row) {
        var tr = h('tr', { class: options.onRow ? 'clickable' : null }, cols.map(function (c) {
          var cls = (c.num ? 'num' : '') + (c.wrap ? ' wrap' : '');
          if (c.cell) return h('td', { class: cls }, [c.cell(row)]);
          return h('td', { class: cls, text: shown(row, c) });
        }));
        if (options.onRow) tr.addEventListener('click', function () { options.onRow(row); });
        table.appendChild(tr);
      });
      wrap.appendChild(table);
      if (options.csv) {
        var exportBtn = h('button', { class: 'tool', text: 'Export CSV' });
        exportBtn.addEventListener('click', function () {
          var named = cols.filter(function (c) { return c.label; });
          var lines = [named.map(function (c) { return csvCell(c.label); }).join(',')];
          sorted.forEach(function (row) {
            lines.push(named.map(function (c) { return csvCell(value(row, c)); }).join(','));
          });
          download(options.csv + '-' + fmtDate(Date.now()) + '.csv', lines.join('\n'));
        });
        wrap.appendChild(h('div', { class: 'table-tools' }, [exportBtn]));
      }
    }
    draw();
    return wrap;
  }

  // ---- The write lock ----

  // A control that changes production. Disabled until writes are unlocked,
  // and it says so, rather than failing after the click.
  function writeBtn(text, cls, onclick) {
    var btn = h('button', { class: 'btn ' + (cls || ''), text: text });
    if (state.role !== 'admin') {
      btn.disabled = true;
      btn.title = 'Your role is read-only.';
    } else if (!unlocked()) {
      btn.disabled = true;
      btn.title = 'Read-only. Unlock writes in the header first.';
    }
    btn.addEventListener('click', onclick);
    return btn;
  }

  function lockNote() {
    if (state.role !== 'admin') return para('Your role is read-only: these controls are for full admins.');
    if (unlocked()) return null;
    return para('The console is read-only. Use "Unlock" in the header: one password entry opens these controls for 10 minutes.', 'warn');
  }

  function paintLock() {
    if (state.role !== 'admin') { lockBtn.style.display = 'none'; return; }
    lockBtn.style.display = '';
    if (unlocked()) {
      var left = Math.max(0, Math.ceil((state.unlock.expires - Date.now()) / 1000));
      lockBtn.className = 'tool open';
      lockBtn.textContent = 'Writes open ' + Math.floor(left / 60) + ':' + pad(left % 60) + ' · Lock';
    } else {
      lockBtn.className = 'tool locked';
      lockBtn.textContent = 'Read-only · Unlock';
    }
  }

  var unlockPassword = h('input', { type: 'password', placeholder: 'Your admin password', autocomplete: 'current-password' });
  var unlockError = h('span', { class: 'err' });
  unlockForm.appendChild(h('span', { class: 'muted', text: 'This console writes to production. Unlock writes for 10 minutes:' }));
  unlockForm.appendChild(unlockPassword);
  unlockForm.appendChild(h('button', { class: 'btn primary', type: 'submit', text: 'Unlock' }));
  unlockForm.appendChild(unlockError);
  unlockForm.addEventListener('submit', function (e) {
    e.preventDefault();
    unlockError.textContent = '';
    api('/admin/api/unlock', { method: 'POST', body: JSON.stringify({ admin_password: unlockPassword.value }) })
      .then(function (r) {
        state.unlock = { token: r.unlock_token, expires: r.expires_at };
        unlockPassword.value = '';
        unlockForm.classList.remove('show');
        render();
      })
      .catch(function (err) { unlockError.textContent = err.message; });
  });
  lockBtn.addEventListener('click', function () {
    if (unlocked()) { state.unlock = null; render(); return; }
    unlockForm.classList.toggle('show');
    if (unlockForm.classList.contains('show')) unlockPassword.focus();
  });
  setInterval(function () {
    if (state.unlock && !unlocked()) { state.unlock = null; render(); return; }
    if (state.unlock) paintLock();
  }, 1000);
`;
