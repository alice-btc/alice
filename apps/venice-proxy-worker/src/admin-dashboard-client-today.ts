// The console's client script, part 2 of 3: the Today and Growth sections.
// See admin-dashboard-client-core.ts for why this is String.raw.
export const ADMIN_CLIENT_TODAY = String.raw`
  // ---- Health, shared by the alert strip and the Pulse page ----

  function paintAlerts() {
    alertsEl.innerHTML = '';
    var alerts = (state.health && state.health.alerts) || [];
    alerts.forEach(function (a) {
      alertsEl.appendChild(h('div', { class: 'alert ' + (a.level === 'bad' ? 'bad' : '') }, [
        h('b', { text: a.label }),
        h('span', { text: a.summary }),
      ]));
    });
  }

  var healthRequest = null;
  var healthAt = 0;
  function loadHealth(fresh) {
    // Signing in and opening Pulse both ask for a fresh read within the same
    // second; one request answers both.
    if (!healthRequest || (fresh && Date.now() - healthAt > 3000)) {
      healthAt = Date.now();
      healthRequest = api('/admin/api/health').then(function (data) {
        state.health = data;
        paintAlerts();
        return data;
      });
      // The strip is a convenience: a failed health read must not break a page.
      healthRequest.catch(function () {});
    }
    return healthRequest;
  }

  var LEVEL_WORDS = { ok: 'Fine', warn: 'Look at this', bad: 'Needs you', unknown: 'Not connected' };

  // ---- Downloads and marks (GitHub, through the Worker) ----

  var PLATFORMS = ['Mac', 'Windows', 'Linux', 'Android'];

  // GitHub allows 60 unauthenticated requests an hour and every read costs
  // several, so an answer is kept for 10 minutes per period. Refresh asks again.
  var githubCache = {};
  function fetchGithub(days) {
    var entry = githubCache[days];
    if (!entry || Date.now() - entry.at > 600000) {
      entry = { at: Date.now(), promise: api('/admin/api/github?days=' + days) };
      entry.promise.catch(function () { delete githubCache[days]; });
      githubCache[days] = entry;
    }
    return entry.promise;
  }

  function fetchDownloads() {
    return fetchGithub(state.days).then(function (g) {
      g.baseDay = g.base_day;
      return g;
    });
  }

  // What happened on which day: Alice's public releases, read from GitHub,
  // and the operator's own notes. Drawn on every daily curve.
  var marksRequest = null;
  function loadMarks(fresh) {
    if (!marksRequest || fresh) {
      marksRequest = Promise.all([
        api('/admin/api/annotations').catch(function () { return { annotations: [] }; }),
        fetchGithub(30).catch(function () { return { releases: [] }; }),
      ]).then(function (both) {
        var marks = [];
        (both[0].annotations || []).forEach(function (a) {
          marks.push({ t: a.day * DAY, label: a.label, kind: a.kind });
        });
        (both[1].releases || []).forEach(function (r) {
          marks.push({ t: Math.floor(r.published_at / DAY) * DAY, label: r.product + ' ' + r.version, kind: 'release' });
        });
        state.marks = marks;
        return marks;
      });
    }
    return marksRequest;
  }

  function downloadTotals(result) {
    var totals = {};
    PLATFORMS.forEach(function (p) { totals[p] = { count: 0, added: result.baseDay ? 0 : null }; });
    result.assets.forEach(function (a) {
      totals[a.platform].count += a.count;
      if (totals[a.platform].added !== null) totals[a.platform].added += a.added;
    });
    return totals;
  }

  function addedText(added, baseDay) {
    if (added === null || added === undefined) return 'first check today, new downloads show from tomorrow';
    return (added > 0 ? '+' + added : String(added)) + ' since ' + baseDay;
  }

  function siteSummary(s) {
    if (!s.configured) {
      return para('Not connected yet: add ' + s.missing.join(' and ') + ' to .dev.vars. See Growth, Site.');
    }
    if (s.error) return h('p', { class: 'err', text: s.error });
    var days = s.daily || [];
    var today = days.length ? days[days.length - 1] : null;
    var yesterday = days.length > 1 ? days[days.length - 2] : null;
    return h('table', {}, [
      h('tr', {}, [h('td', { text: 'Visits today (' + (today ? today.key : '—') + ')' }), h('td', { class: 'num', text: num(today ? today.visits : 0) })]),
      h('tr', {}, [h('td', { text: 'Visits yesterday' }), h('td', { class: 'num', text: num(yesterday ? yesterday.visits : 0) })]),
      h('tr', {}, [h('td', { text: 'Page views today' }), h('td', { class: 'num', text: num(today ? today.page_views : 0) })]),
    ]);
  }

  // ---- Today · At a glance ----

  // A bar per bucket and nothing else: the shape of the period, to be read
  // in a second. The detail page has the axis and the numbers.
  function spark(values) {
    var peak = (values || []).reduce(function (m, v) { return Math.max(m, v); }, 0);
    if (!values || !values.length || peak === 0) {
      return h('div', { class: 'spark none', text: values && values.length ? 'nothing in this period' : '' });
    }
    return h('div', { class: 'spark' }, values.map(function (v) {
      var barEl = h('i', { class: v ? '' : 'zero' });
      if (v) barEl.style.height = Math.max(4, Math.round((v / peak) * 100)) + '%';
      return barEl;
    }));
  }

  // One key figure: its value, how it moved against the period before, the
  // shape of the period, and a click through to the page that explains it.
  function tile(t) {
    var fmt = t.fmt || num;
    var delta = h('div', { class: 'd', text: t.note || '' });
    if (t.previous !== undefined && t.previous !== null && !t.note) {
      var diff = t.value - t.previous;
      var good = t.lowerIsBetter ? diff < 0 : diff > 0;
      delta.className = 'd ' + (diff === 0 ? '' : (good ? 'up' : 'down'));
      delta.textContent = diff === 0
        ? '= same as the ' + periodName() + ' before'
        : (diff > 0 ? '▲ +' : '▼ −') + fmt(Math.abs(diff))
          + (t.previous > 0 ? ' (' + (diff > 0 ? '+' : '−') + Math.abs(Math.round((diff / t.previous) * 100)) + '%)' : '')
          + ' vs before';
    }
    return h('button', { class: 'tile', title: 'Open ' + t.label, onclick: function () { go(t.page); } }, [
      h('div', { class: 'l', text: t.label }),
      h('div', { class: 'n', text: t.value === null || t.value === undefined ? '—' : fmt(t.value) }),
      delta,
      t.series ? spark(t.series) : null,
    ]);
  }

  function values(series, field) {
    return (series || []).map(function (row) { return row[field || 'count'] || 0; });
  }

  function renderGlance() {
    // Every source is asked at once and none can hold the page up or blank
    // it: a source that fails leaves its own tiles saying so.
    function soft(promise) { return promise.catch(function (e) { return { failed: e.message }; }); }
    page(function () {
      return Promise.all([
        periodic('/admin/api/growth'),
        periodic('/admin/api/money'),
        soft(periodic('/admin/api/errors')),
        soft(loadHealth(true)),
        soft(periodic('/admin/api/site-analytics')),
        soft(periodic('/admin/api/venice')),
        soft(fetchDownloads()),
      ]);
    }, function (all) {
      var g = all[0], m = all[1], e = all[2], health = all[3], site = all[4], v = all[5], d = all[6];
      var cur = mainCurrency(m);
      function fiat(c) { return money(c, cur); }

      if (health && health.checks) {
        var worst = health.checks.filter(function (c) { return c.level === 'bad'; }).length;
        var watch = health.checks.filter(function (c) { return c.level === 'warn'; }).length;
        app.appendChild(h('div', {
          class: 'strip', title: 'Open Pulse for the reason behind each light',
          onclick: function () { go('pulse'); },
        }, [h('span', {}, [h('b', { text: worst ? worst + ' need you' : (watch ? watch + ' to look at' : 'All systems fine') })])]
          .concat(health.checks.map(function (c) {
            return h('span', { title: c.summary }, [h('i', { class: 'is-' + c.level }), document.createTextNode(c.label)]);
          }))));
      }

      app.appendChild(h('div', { class: 'group', text: 'People · ' + periodName() }));
      app.appendChild(h('div', { class: 'tiles' }, [
        tile({ label: 'New installations', value: g.installations.current, previous: g.installations.previous, series: values(g.series.installations), page: 'overview' }),
        tile({ label: 'Devices that used Alice', value: g.active_installations, note: 'seen at least once in this period', page: 'activation' }),
        tile({ label: 'New accounts', value: g.accounts.current, previous: g.accounts.previous, series: values(g.series.accounts), page: 'overview' }),
        tile({ label: 'AI requests answered', value: g.requests.current, previous: g.requests.previous, series: values(g.series.requests), page: 'usage' }),
      ]));

      var subs = m.subscriptions;
      var moneyTiles = [
        tile({ label: 'Sats received', value: m.revenue.current.sats, previous: m.revenue.previous.sats, fmt: sats, series: values(m.revenue.series, 'sats'), page: 'revenue' }),
        tile({ label: 'Invoiced value paid', value: m.revenue.current.cents, previous: m.revenue.previous.cents, fmt: fiat, series: values(m.revenue.series, 'cents'), page: 'revenue' }),
        tile({ label: 'Paying accounts', value: subs.active, note: subs.expiring_7d + ' run out within 7 days, ' + subs.expiring_30d + ' within 30', page: 'subscriptions' }),
      ];
      if (v && v.configured && !v.error) {
        moneyTiles.push(tile({ label: 'Venice spend', value: v.total_usd, fmt: usd, note: usd(v.per_day_usd) + ' a day on average', series: values(v.series, 'usd'), page: 'venice' }));
        moneyTiles.push(tile({ label: 'Venice balance', value: v.balances.USD + v.balances.BUNDLED_CREDITS, fmt: usd,
          note: v.runway_days === null ? num(v.balances.DIEM) + ' DIEM on top' : 'about ' + num(v.runway_days) + ' days at this pace', page: 'venice' }));
      } else {
        moneyTiles.push(tile({ label: 'Venice spend', value: null, note: 'not connected, open to set it up', page: 'venice' }));
      }
      app.appendChild(h('div', { class: 'group', text: 'Money · ' + periodName() }));
      app.appendChild(h('div', { class: 'tiles' }, moneyTiles));

      var reach = [];
      if (site && site.configured && !site.error) {
        var days = site.daily || [];
        reach.push(tile({ label: 'Site visits', value: days.reduce(function (sum, x) { return sum + x.visits; }, 0),
          note: num(days.reduce(function (sum, x) { return sum + x.page_views; }, 0)) + ' page views',
          series: days.map(function (x) { return x.visits; }), page: 'site' }));
      } else {
        reach.push(tile({ label: 'Site visits', value: null, note: site && site.error ? 'Cloudflare could not be read' : 'not connected, open to set it up', page: 'site' }));
      }
      if (d && d.assets) {
        var totals = downloadTotals(d);
        var count = 0, added = d.baseDay ? 0 : null;
        PLATFORMS.forEach(function (p) { count += totals[p].count; if (added !== null) added += totals[p].added; });
        reach.push(tile({ label: 'Downloads, all time', value: count,
          note: added === null ? 'new downloads show from tomorrow' : '+' + added + ' since ' + d.baseDay, page: 'downloads' }));
      }
      app.appendChild(h('div', { class: 'group', text: 'Reach' }));
      app.appendChild(h('div', { class: 'tiles' }, reach));

      var quality = [];
      if (e && !e.failed) {
        quality.push(tile({ label: 'Server-side failures', value: e.server.current, previous: e.server.previous, lowerIsBetter: true, page: 'errors' }));
        quality.push(tile({ label: 'All recorded errors', value: e.total.current, previous: e.total.previous, lowerIsBetter: true, page: 'errors' }));
      }
      var ended = {};
      (m.usage.by_type || []).forEach(function (row) { ended[row.status] = (ended[row.status] || 0) + row.count; });
      var answered = (ended.confirmed || 0) + (ended.refunded || 0);
      quality.push(tile({ label: 'Requests that failed at Venice',
        value: answered ? Math.round(((ended.refunded || 0) / answered) * 1000) / 10 : null,
        fmt: function (x) { return x + '%'; },
        note: answered ? (ended.refunded || 0) + ' refunded out of ' + answered : 'no request in this period', page: 'usage' }));
      app.appendChild(h('div', { class: 'group', text: 'Quality · ' + periodName() }));
      app.appendChild(h('div', { class: 'tiles' }, quality));

      app.appendChild(source('Alice database, Cloudflare, Venice and GitHub. Click a tile for its page', g.generated_at));
    });
  }

  // ---- Today · Pulse ----

  function hourPoints(series) {
    return (series || []).map(function (row) {
      return { label: bucketLabel(row.hour * HOUR, HOUR), count: row.count };
    });
  }

  // The 24-hour figures keep their own wording: this page is always the last
  // 24 hours against the 24 before, whatever the period selector says.
  function dayCard(pair, label, hint, lowerIsBetter) {
    var diff = pair.last_24h - pair.previous_24h;
    var good = lowerIsBetter ? diff < 0 : diff > 0;
    return h('div', { class: 'stat hero' }, [
      h('div', { class: 'n', text: num(pair.last_24h) }),
      h('div', { class: 'l', text: label }),
      h('div', { class: 'hint', text: hint }),
      h('div', {
        class: 'delta ' + (diff === 0 ? '' : (good ? 'up' : 'down')),
        text: (diff > 0 ? '▲ +' : (diff < 0 ? '▼ ' : '= ')) + diff + ' vs the 24 hours before (' + pair.previous_24h + ')',
      }),
    ]);
  }

  function renderPulse() {
    page(function () {
      return Promise.all([loadHealth(true), api('/admin/api/launch')]);
    }, function (both) {
      var health = both[0];
      var l = both[1];

      var v = health.since_last_visit;
      if (v) {
        app.appendChild(card('Since your last visit', [
          para('Since ' + fmtTime(v.since) + '. A visit is a console sign-in; several within half an hour count as one.'),
          h('div', { class: 'grid' }, [
            statCard(num(v.installations), 'New installations'),
            statCard(num(v.accounts), 'New accounts'),
            statCard(num(v.requests), 'AI requests'),
            statCard(num(v.paid_invoices), 'Invoices paid'),
            statCard(num(v.server_errors), 'Server-side errors'),
          ]),
        ]));
      }

      app.appendChild(h('div', { class: 'lights' }, health.checks.map(function (c) {
        return h('div', { class: 'light is-' + c.level }, [
          h('div', { class: 'dot' }),
          h('div', {}, [
            h('div', { class: 'name', text: c.label }),
            h('div', { class: 'state', text: LEVEL_WORDS[c.level] || c.level }),
            h('div', { class: 'why', text: c.summary }),
          ]),
        ]);
      })));

      app.appendChild(h('div', { class: 'grid grid-3' }, [
        dayCard(l.installations, 'New installations',
          'Devices the server saw for the first time. ' + l.active_installations_24h + ' devices used Alice in the last 24 hours.'),
        dayCard(l.requests, 'AI requests', 'Private Cloud requests that reached Venice and succeeded.'),
        dayCard(l.accounts, 'New accounts', 'People who tied an email or another login to Alice.'),
      ]));

      var dlCard = card('Downloads', [para('Asking GitHub…')]);
      var siteCard = card('Site visits', [para('Asking Cloudflare…')]);
      app.appendChild(h('div', { class: 'grid grid-2' }, [dlCard, siteCard]));

      fetchDownloads().then(function (d) {
        var totals = downloadTotals(d);
        dlCard.lastChild.replaceWith(h('table', {}, PLATFORMS.map(function (p) {
          return h('tr', {}, [
            h('td', { text: p }),
            h('td', { class: 'num', text: num(totals[p].count) }),
            h('td', { class: 'muted', text: addedText(totals[p].added, d.baseDay) }),
          ]);
        }).concat(d.errors.map(function (e) {
          return h('tr', {}, [h('td', { class: 'err', text: e })]);
        }))));
      });
      api('/admin/api/site-analytics?days=7').then(function (s) {
        siteCard.lastChild.replaceWith(siteSummary(s));
      }).catch(function (e) {
        siteCard.lastChild.replaceWith(h('p', { class: 'err', text: e.message }));
      });

      app.appendChild(card('AI requests per hour · 48 hours', [columns(hourPoints(l.series.requests), 'requests')]));
      app.appendChild(card('New installations per hour · 48 hours', [columns(hourPoints(l.series.installations), 'installations')]));

      app.appendChild(card('Scheduled tasks', [
        !health.crons ? para('Not available: migration 0021 is not applied to this database.', 'warn') : null,
        health.crons ? dataTable([
          { key: 'label', label: 'Task' },
          { key: 'every_minutes', label: 'Every', get: function (c) { return c.every_minutes + ' min'; } },
          { key: 'last_started_at', label: 'Last run', fmt: fmtTime },
          { key: 'state', label: 'Result', cell: function (c) {
            if (c.last_started_at === null) return h('span', { class: 'pill', text: 'never recorded' });
            if (c.late) return h('span', { class: 'pill bad', text: 'late' });
            return h('span', { class: 'pill ' + (c.last_ok ? 'ok' : 'bad'), text: c.last_ok ? 'worked' : 'failed' + (c.failures_in_a_row > 1 ? ' ×' + c.failures_in_a_row : '') });
          } },
          { key: 'last_duration_ms', label: 'Took', num: true, fmt: function (v) { return v < 1000 ? v + ' ms' : (v / 1000).toFixed(1) + ' s'; } },
          { key: 'last_detail', label: 'Detail', wrap: true },
        ], health.crons) : null,
        para('Written by the deployed Worker at each run. A task is late after two and a half intervals without a run.'),
      ]));
      app.appendChild(source('Alice database, Cloudflare, GitHub and Venice, read live', health.generated_at));
    });
  }

  // ---- Today · Errors ----

  // What each code means and what to do about it. An unlisted code falls back
  // to its HTTP status, which at least says whose problem it is.
  var ERROR_NOTES = {
    internal_error: ['Alice\'s own code failed on a request.', 'Open the Worker logs in Cloudflare for the time shown. This one is always worth a look.'],
    rate_limited: ['Someone hit a rate limit.', 'Normal in small numbers. A sudden spike is a script or an attack being held back, which is the limit doing its job.'],
    too_many_accounts: ['One network tried to create too many accounts.', 'The limit worked. Nothing to do unless real users report it.'],
    invalid_code: ['A wrong or expired sign-in code was typed.', 'A user mistake. Nothing to do.'],
    invalid_password: ['A wrong password was typed.', 'A user mistake. Many against one account would show as rate_limited.'],
    invalid_challenge: ['A sign-in step arrived out of order or too late.', 'Usually an abandoned sign-in. Nothing to do.'],
    invalid_signature: ['A passkey or wallet signature did not verify.', 'Occasional ones are user-side. A run after a release means the sign-in flow broke.'],
    invalid_refresh_token: ['An app presented a session that no longer exists.', 'Expected after a suspension, a deletion or a long absence. The app signs in again by itself.'],
    session_expired: ['An app used an expired access token.', 'Expected: the app renews it and retries.'],
    account_required: ['A request arrived without a session.', 'Expected from crawlers and old clients.'],
    account_unavailable: ['A suspended account tried to use Alice.', 'The suspension is working.'],
    installation_blocked: ['A blocked installation tried to use Alice.', 'The block is working.'],
    cloud_disabled: ['An account with Private Cloud switched off asked for it.', 'Check the account if this was not intended.'],
    account_creation_failed: ['The database refused to create an account.', 'Look at the Worker logs: this should not happen.'],
    reservation_failed: ['A request could not be reserved against its quota.', 'Look at the Worker logs if it repeats: quota accounting is failing.'],
    auth_not_configured: ['The Worker is missing its signing key.', 'A deployment lost a secret. Fix it now: nobody can sign in.'],
    email_not_configured: ['The Worker cannot send email.', 'A deployment lost its email binding. Sign-in by code is down.'],
    billing_upstream_failed: ['BTCPay answered with an error when creating an invoice.', 'Open BTCPay: the store or the API key has a problem.'],
    billing_unavailable: ['Payment is switched off or BTCPay cannot be reached.', 'Check the BTCPay host. Nobody can pay while this lasts.'],
    body_too_large: ['A request body was over the size limit.', 'Nothing to do unless users report long messages being refused.'],
    invalid_json: ['A malformed request body.', 'Scanners and broken clients. Nothing to do.'],
  };

  function explainError(row) {
    var note = ERROR_NOTES[row.code];
    if (note) return note;
    var upstream = /^upstream_http_(\d+)$/.exec(row.code);
    if (upstream) {
      var s = Number(upstream[1]);
      if (s === 429) return ['Venice rate-limited Alice.', 'Traffic is above the key\'s limits. See Money, Venice cost for the limits and the balance.'];
      if (s === 401 || s === 403) return ['Venice refused Alice\'s key.', 'The key expired, was revoked or ran out of credit. Private Cloud is down until it is fixed.'];
      if (s === 402) return ['Venice says the account is out of credit.', 'Top up the Venice balance.'];
      if (s >= 500) return ['Venice failed on its side (' + s + ').', 'Nothing to fix here. The user was refunded their request. Worth watching if it lasts.'];
      return ['Venice refused a request (' + s + ').', 'Usually a model or parameter Venice no longer accepts. Check after a model change.'];
    }
    if (row.category === 'email') return ['A login email could not be sent.', 'Check the email sending service in Cloudflare.'];
    if (row.status >= 500) return ['A server-side failure.', 'Look at the Worker logs for the time shown.'];
    if (row.status === 429) return ['A rate limit was hit.', 'Normal in small numbers.'];
    return ['A request refused as designed.', 'Nothing to do unless it spikes.'];
  }

  function renderErrors() {
    page(function () { return periodic('/admin/api/errors'); }, function (e) {
      app.appendChild(h('div', { class: 'grid grid-2' }, [
        compareCard(e.server.current, e.server.previous, 'Server-side failures',
          'Status 500 and above: Alice, or something Alice depends on, failed. These are the ones that need you.', num, true),
        compareCard(e.total.current, e.total.previous, 'All recorded errors',
          'Includes refusals that worked as designed: wrong passwords, expired codes, rate limits.', num, true),
      ]));

      var times = (function () {
        var out = [];
        var step = e.bucket_ms;
        var end = Math.floor(e.generated_at / step) * step;
        var count = state.days === 1 ? 24 : state.days;
        for (var i = count - 1; i >= 0; i -= 1) out.push(end - i * step);
        return out;
      }());
      var stacked = stackPoints(times, e.series, e.bucket_ms);
      app.appendChild(card('Errors over ' + periodName() + ', by kind', [
        columns(stacked.points, 'errors', { keys: stacked.keys }),
        para('auth: sign-in and accounts. email: login emails that could not be sent. venice: the AI provider.'),
      ]));

      app.appendChild(card('Each error, in plain words', [
        dataTable([
          { key: 'code', label: 'Code', cell: function (r) { return h('code', { text: r.code }); } },
          { key: 'category', label: 'Kind' },
          { key: 'status', label: 'Status', num: true },
          { key: 'count', label: 'Count', num: true, fmt: num },
          { key: 'previous', label: 'Before', num: true, fmt: num },
          { key: 'meaning', label: 'What it means', wrap: true, get: function (r) { return explainError(r)[0]; } },
          { key: 'action', label: 'What to do', wrap: true, get: function (r) { return explainError(r)[1]; } },
          { key: 'last_at', label: 'Last seen', fmt: fmtTime },
        ], e.codes, { sort: 'count', csv: 'alice-errors', empty: 'No error recorded in this period.' }),
      ]));

      var outages = (e.btcpay_events || []).slice().reverse();
      var rows = [];
      var openedAt = null;
      outages.forEach(function (ev) {
        if (ev.code === 'btcpay_down') openedAt = ev.created_at;
        else if (openedAt) { rows.push({ from: openedAt, to: ev.created_at, minutes: Math.round((ev.created_at - openedAt) / 60000) }); openedAt = null; }
      });
      if (openedAt) rows.push({ from: openedAt, to: null, minutes: Math.round((Date.now() - openedAt) / 60000) });
      app.appendChild(card('BTCPay outages', [
        para('Every time the payment host stopped answering and when it came back, as the hourly check saw it. While it is down nobody can pay, and nothing else in Alice shows it.'),
        dataTable([
          { key: 'from', label: 'Went down', fmt: fmtTime },
          { key: 'to', label: 'Came back', get: function (r) { return r.to ? fmtTime(r.to) : 'still down'; } },
          { key: 'minutes', label: 'Minutes', num: true, fmt: num },
        ], rows.reverse(), { empty: 'No outage on record.' }),
      ]));
      app.appendChild(source('technical_events in the Alice database. No IP, no message content', e.generated_at));
    });
  }

  // ---- Today · Infrastructure ----

  var WORKER_STATUS = {
    success: 'The Worker answered.',
    clientDisconnected: 'The app closed the connection first, typically a streamed answer the user stopped.',
    scriptThrewException: 'Alice\'s code threw an error.',
    exceededResources: 'The request ran out of CPU time or memory.',
    internalError: 'Cloudflare failed on its side.',
  };

  function renderInfra() {
    page(function () { return periodic('/admin/api/platform'); }, function (p) {
      if (!p.configured) {
        app.appendChild(card('Connect Cloudflare', [
          para('This page reads the counters Cloudflare keeps for every Worker and database. It needs CF_ANALYTICS_API_TOKEN (Account Analytics: Read) and CF_ACCOUNT_ID in apps/venice-proxy-worker/.dev.vars, the same two as the Site page.'),
        ]));
        return;
      }
      var w = p.worker;
      if (!w) {
        app.appendChild(card('Worker', [h('p', { class: 'err', text: p.worker_error })]));
      } else {
        var cpuPeak = w.series.reduce(function (m, x) { return Math.max(m, x.cpu_p99_ms); }, 0);
        app.appendChild(h('div', { class: 'grid' }, [
          statCard(num(w.requests), 'Requests', 'Everything the Worker served: the apps, the site\'s calls, crons excluded.'),
          statCard(num(w.errors), 'Exceptions', w.error_percent === null ? 'No traffic.' : w.error_percent + '% of requests.'),
          statCard(ms(cpuPeak), 'Worst CPU p99', 'The slowest 1% of requests in the worst bucket. The paid plan allows 30 s.'),
        ]));
        app.appendChild(card('Worker requests · ' + periodName(), [columns(pointsOf(w.series, 'requests', p.bucket_ms), 'requests')]));
        app.appendChild(card('Worker exceptions · ' + periodName(), [columns(pointsOf(w.series, 'errors', p.bucket_ms), 'exceptions')]));
        app.appendChild(card('CPU time, p99 · ' + periodName(), [
          columns(pointsOf(w.series, 'cpu_p99_ms', p.bucket_ms), '', { fmt: ms, level: true }),
          para('CPU time is what the code itself burns, not how long the user waited: time spent waiting for Venice does not count.'),
        ]));
        app.appendChild(card('How requests ended', [
          dataTable([
            { key: 'status', label: 'Outcome' },
            { key: 'count', label: 'Requests', num: true, fmt: num },
            { key: 'meaning', label: 'What it means', wrap: true, get: function (r) { return WORKER_STATUS[r.status] || '—'; } },
          ], w.by_status, { sort: 'count' }),
        ]));
      }

      var d = p.database;
      if (!d) {
        app.appendChild(card('Database', [h('p', { class: 'err', text: p.database_error })]));
      } else {
        app.appendChild(h('div', { class: 'grid' }, [
          statCard(bytes(d.size_bytes), 'Database size', 'D1 allows 500 MB per database on the free plan and 10 GB on the paid one.'),
          statCard(num(d.read_queries), 'Read queries'),
          statCard(num(d.write_queries), 'Write queries'),
          statCard(num(d.rows_read), 'Rows read', 'What D1 bills on. A query that scans a whole table shows here first.'),
          statCard(num(d.rows_written), 'Rows written'),
        ]));
        var dbNote = (d.scoped_to_database ? '' : 'CF_D1_DATABASE_ID is not set, so these figures cover every D1 database of the account. ')
          + (d.days_shown < state.days ? 'Cloudflare keeps 31 days of database analytics, so this shows ' + d.days_shown + ' days.' : '');
        if (dbNote) app.appendChild(para(dbNote, 'warn'));
        app.appendChild(card('Rows read · ' + (d.days_shown === 1 ? '24 hours' : d.days_shown + ' days'), [columns(pointsOf(d.series, 'rows_read', p.bucket_ms), 'rows')]));
        app.appendChild(card('Query time, p99', [
          columns(pointsOf(d.series, 'p99_ms', p.bucket_ms), '', { fmt: ms, level: true }),
          para('Time spent executing SQL inside D1. Network and queueing are not included.'),
        ]));
        app.appendChild(card('Queries that cost the most time', [
          para('The statement text as D1 logs it: SQL with its placeholders, never the values.'),
          dataTable([
            { key: 'query', label: 'Statement', wrap: true, cell: function (r) { return h('code', { text: r.query }); } },
            { key: 'runs', label: 'Runs', num: true, fmt: num },
            { key: 'avg_ms', label: 'Average', num: true, fmt: ms },
            { key: 'total_ms', label: 'Total', num: true, fmt: ms },
            { key: 'rows_read', label: 'Rows read', num: true, fmt: num },
          ], d.slowest_queries, { sort: 'total_ms', csv: 'alice-d1-queries' }),
        ]));
      }
      app.appendChild(source('Cloudflare GraphQL Analytics. Sampled on busy days, so small numbers can move slightly', p.generated_at));
    });
  }

  // ---- Today · Versions ----

  function renderVersions() {
    page(function () {
      return Promise.all([api('/admin/api/versions'), fetchGithub(30).catch(function (e) { return { releases: [], errors: [e.message] }; })]);
    }, function (both) {
      var v = both[0];
      var releases = both[1];

      var c = v.console;
      var offMain = c.branch && c.branch !== 'main';
      app.appendChild(card('This console', [
        h('table', {}, [
          h('tr', {}, [h('td', { text: 'Branch' }), h('td', {}, [h('code', { text: c.branch || 'unknown' })])]),
          h('tr', {}, [h('td', { text: 'Commit' }), h('td', {}, [h('code', { text: c.commit || 'unknown' })])]),
        ]),
        offMain ? para('The console is not running from main. It shows the code of this branch, which may be behind or ahead of what is deployed.', 'warn') : null,
        !c.branch ? para('Set CONSOLE_GIT_BRANCH and CONSOLE_GIT_COMMIT to see which checkout the console runs from.') : null,
      ]));

      var m = v.migrations;
      var pending = m.pending;
      app.appendChild(card('Database migrations', [
        m.applied_error ? para(m.applied_error, 'warn') : null,
        pending && pending.length
          ? para(pending.length + ' migration(s) in this checkout are not applied to the database: ' + pending.join(', ') + '. Apply them before deploying the Worker, never after.', 'warn')
          : (pending ? para('Every migration in this checkout is applied (' + m.checkout_count + ').', 'ok') : null),
        dataTable([
          { key: 'name', label: 'Migration' },
          { key: 'applied_at', label: 'Applied (UTC)' },
        ], (m.applied || []).slice().reverse().slice(0, 8), { empty: 'Nothing to show.' }),
      ]));

      app.appendChild(card('Worker versions that served traffic · 7 days', [
        v.worker_error ? h('p', { class: 'err', text: v.worker_error }) : null,
        !v.cloudflare_configured ? para('Cloudflare is not connected, see Infrastructure.') : null,
        dataTable([
          { key: 'version', label: 'Version id', cell: function (r) { return h('code', { text: r.version.slice(0, 8) }); } },
          { key: 'first_day', label: 'First seen' },
          { key: 'last_day', label: 'Last seen' },
          { key: 'requests', label: 'Requests', num: true, fmt: num },
        ], v.worker_versions_7d, { empty: 'No traffic recorded.' }),
        para('The top row is the deployment live now. A new row appears the day a deployment starts taking traffic.'),
      ]));

      var s = v.site;
      app.appendChild(card('Site (alicebtc.com)', [
        !s.configured ? para('Not connected. To show the last Vercel deployment here, add VERCEL_API_TOKEN and VERCEL_PROJECT_ID to .dev.vars. Optional.') : null,
        s.error ? h('p', { class: 'err', text: s.error }) : null,
        s.configured && !s.error ? h('table', {}, [
          h('tr', {}, [h('td', { text: 'State' }), h('td', {}, [h('span', { class: 'pill ' + (s.state === 'READY' ? 'ok' : 'warn'), text: s.state })])]),
          h('tr', {}, [h('td', { text: 'Deployed' }), h('td', { text: fmtTime(s.created_at) })]),
          h('tr', {}, [h('td', { text: 'Commit' }), h('td', { text: (s.commit || '—') + (s.message ? ' · ' + s.message : '') })]),
        ]) : null,
      ]));

      var latest = [];
      var seenProduct = {};
      (releases.releases || []).forEach(function (rel) {
        if (seenProduct[rel.product]) return;
        seenProduct[rel.product] = true;
        latest.push({ product: rel.product, version: rel.version, published: rel.published_at });
      });
      app.appendChild(card('Latest public releases', [
        dataTable([
          { key: 'product', label: 'Product' },
          { key: 'version', label: 'Version' },
          { key: 'published', label: 'Published', fmt: fmtTime },
        ], latest, { empty: (releases.errors || []).join(' ') || 'No public release found.' }),
      ]));
      app.appendChild(source('this checkout, D1, Cloudflare and GitHub', v.generated_at));
    });
  }

  // ---- Today · Notes ----

  var KIND_NAMES = { release: 'Release', post: 'Post', article: 'Article', other: 'Other' };

  function renderNotes() {
    page(function () { return api('/admin/api/annotations'); }, function (data) {
      var msg = h('div');
      var date = h('input', { type: 'date', value: fmtDate(Date.now()) });
      var label = h('input', { placeholder: 'What happened, in a few words', maxlength: '80', style: 'width:320px' });
      var kind = h('select', {}, Object.keys(KIND_NAMES).map(function (k) { return h('option', { value: k, text: KIND_NAMES[k] }); }));
      kind.value = 'post';
      function reload() { loadMarks(true); renderNotes(); }
      var add = writeBtn('Add note', 'primary', function () {
        msg.textContent = '';
        api('/admin/api/annotations', {
          method: 'POST',
          body: JSON.stringify({ date: date.value, label: label.value.trim(), kind: kind.value }),
        }).then(reload).catch(function (e) { msg.className = 'err'; msg.textContent = e.message; });
      });
      app.appendChild(card('Mark a day', [
        para('A tweet, an article, an announcement: note the day and it is drawn as a flag on every daily curve of the console, so a spike can be read against what caused it. Public releases are flagged by themselves, from GitHub.'),
        lockNote(),
        h('div', { class: 'row' }, [date, kind, label, add]),
        msg,
      ]));
      app.appendChild(card('Your notes', [
        dataTable([
          { key: 'day', label: 'Day', get: function (a) { return fmtDate(a.day * DAY); } },
          { key: 'kind', label: 'Kind', get: function (a) { return KIND_NAMES[a.kind] || a.kind; } },
          { key: 'label', label: 'Note', wrap: true },
          { key: 'action', label: '', cell: function (a) {
            return writeBtn('Remove', '', function () {
              api('/admin/api/annotations/' + encodeURIComponent(a.id), { method: 'DELETE', body: '{}' })
                .then(reload).catch(function (e) { msg.className = 'err'; msg.textContent = e.message; });
            });
          } },
        ], data.annotations, { sort: 'day', csv: 'alice-notes', empty: 'No note yet.' }),
      ]));
      var releases = (state.marks || []).filter(function (m) { return m.kind === 'release' && /^(Alice|Wallet) /.test(m.label); });
      app.appendChild(card('Flagged by themselves', [
        dataTable([
          { key: 't', label: 'Day', fmt: fmtDate },
          { key: 'label', label: 'Release' },
        ], releases, { sort: 't', empty: 'No public release read from GitHub.' }),
      ]));
    });
  }

  // ---- Growth · Overview ----

  function seriesTimes(series) { return (series || []).map(function (row) { return row.t; }); }

  function renderOverview() {
    page(function () {
      return Promise.all([periodic('/admin/api/growth'), api('/admin/api/overview')]);
    }, function (both) {
      var g = both[0];
      var o = both[1];

      app.appendChild(h('div', { class: 'grid grid-3' }, [
        compareCard(g.installations.current, g.installations.previous, 'New installations',
          'Devices the server saw for the first time. ' + num(g.active_installations) + ' devices used Alice in this period, ' + num(o.installations_total) + ' exist in all.'),
        compareCard(g.requests.current, g.requests.previous, 'AI requests',
          'Private Cloud requests that reached Venice and succeeded. ' + num(o.requests_total) + ' since launch.'),
        compareCard(g.accounts.current, g.accounts.previous, 'New accounts',
          'People who tied a login to Alice. ' + num(o.accounts_created) + ' accounts in all, anonymous installs excluded.'),
      ]));

      app.appendChild(card('AI requests · ' + periodName(), [columns(pointsOf(g.series.requests, 'count', g.bucket_ms), 'requests')]));

      var byPlatform = stackPoints(seriesTimes(g.series.installations), g.series.installations_by_platform, g.bucket_ms);
      app.appendChild(card('New installations by platform · ' + periodName(), [
        columns(byPlatform.points, 'installations', { keys: byPlatform.keys }),
      ]));

      app.appendChild(card('New accounts · ' + periodName(), [columns(pointsOf(g.series.accounts, 'count', g.bucket_ms), 'accounts')]));

      // Free vs paid, and what the free tier actually absorbs. Aggregates
      // only; the average is the one number that says whether 21 free
      // requests is generous or thin.
      var freePlans = 0;
      var paidPlans = 0;
      (o.plans || []).forEach(function (p) {
        if (p.plan === 'free') freePlans += p.count; else paidPlans += p.count;
      });
      var avgFree = o.accounts_with_free_usage > 0
        ? (o.free_requests_used_total / o.accounts_with_free_usage).toFixed(1) : '0';
      var atQuotaShare = o.accounts_with_free_usage > 0
        ? Math.round((o.accounts_at_quota / o.accounts_with_free_usage) * 100) + '%' : '0%';
      function line(label, value) {
        return h('tr', {}, [h('td', { text: label }), h('td', { class: 'num', text: String(value) })]);
      }
      app.appendChild(card('Free quota · all time', [
        para('Every Alice user gets 21 free Private Cloud requests. These are the numbers that tell you whether 21 is the right figure. They do not follow the period selector.'),
        h('table', {}, [
          line('Accounts and anonymous users on the free plan', num(freePlans)),
          line('On a paid plan', num(paidPlans)),
          line('Used at least one free request', num(o.accounts_with_free_usage)),
          line('Free requests per active free user (average)', avgFree + ' / 21'),
          line('Share of them who spent all 21', atQuotaShare),
          line('Free requests consumed in all', num(o.free_requests_used_total)),
        ]),
      ]));
      app.appendChild(source('Alice database: installations, user_identities, cloud_request_ledger', g.generated_at));
    });
  }

  // ---- Growth · Activation ----

  function heatCell(retained, size, eligible) {
    if (!eligible) return h('td', { class: 'heat muted', text: 'too early' });
    var share = size > 0 ? retained / size : 0;
    var cell = h('td', { class: 'heat', text: Math.round(share * 100) + '%', title: retained + ' of ' + size });
    cell.style.background = 'rgba(139, 184, 255, ' + (0.08 + share * 0.5).toFixed(2) + ')';
    return cell;
  }

  function renderActivation() {
    page(function () {
      return Promise.all([api('/admin/api/analytics'), periodic('/admin/api/growth')]);
    }, function (both) {
      var a = both[0];
      var g = both[1];

      var r = a.retention;
      app.appendChild(card('Retention · all installations', [
        para('Share of installations still seen N days after first contact. Only installations old enough to qualify are counted.'),
        h('div', { class: 'grid' }, [
          statCard((r.d1.percent === null ? '—' : r.d1.percent + '%'), 'After 1 day', r.d1.retained + ' of ' + r.d1.eligible),
          statCard((r.d7.percent === null ? '—' : r.d7.percent + '%'), 'After 7 days', r.d7.retained + ' of ' + r.d7.eligible),
          statCard((r.d30.percent === null ? '—' : r.d30.percent + '%'), 'After 30 days', r.d30.retained + ' of ' + r.d30.eligible),
        ]),
      ]));

      var cohortTable = h('table', {}, [h('tr', {}, [
        h('th', { text: 'Week of first use' }), h('th', { class: 'num', text: 'Installations' }),
        h('th', { class: 'num', text: 'After 1 day' }), h('th', { class: 'num', text: 'After 7 days' }), h('th', { class: 'num', text: 'After 30 days' }),
      ])]);
      var now = Date.now();
      (g.retention_by_week || []).slice().reverse().forEach(function (w) {
        var weekEnd = w.week_start + 7 * DAY;
        cohortTable.appendChild(h('tr', {}, [
          h('td', { text: fmtDate(w.week_start) }),
          h('td', { class: 'num', text: num(w.size) }),
          heatCell(w.d1, w.size, weekEnd + DAY <= now),
          heatCell(w.d7, w.size, weekEnd + 7 * DAY <= now),
          heatCell(w.d30, w.size, weekEnd + 30 * DAY <= now),
        ]));
      });
      app.appendChild(card('Retention by week of first use · 12 weeks', [
        para('Read down a column: if a release made Alice stickier, the weeks after it are darker. A week is judged only once all its installations are old enough.'),
        (g.retention_by_week || []).length ? cohortTable : para('No installation in the last 12 weeks.'),
      ]));

      var f = a.funnel;
      var funnelCard = card('Activation funnel · all time', [
        para('Aggregate only: computed from write-once installation milestones, never a per-user timeline.'),
      ]);
      // Milestones only began recording when the feature shipped, so older
      // installations have no data. Say that outright rather than let the
      // steps read as "nobody ever made a request".
      var untracked = f.installs - (f.tracked || 0);
      if (untracked > 0) {
        funnelCard.appendChild(para(untracked + ' of ' + f.installs + ' installations predate milestone tracking'
          + (f.tracking_since ? ' (started ' + fmtDate(f.tracking_since) + ')' : '')
          + ' and show as zero at every step. Only the ' + (f.tracked || 0) + ' newer ones can be measured.', 'warn'));
      }
      [['Installations', f.installs], ['1st cloud request', f.made_first_request],
        ['10th cloud request', f.made_ten_requests], ['Quota exhausted', f.exhausted_quota],
        ['Account created', f.created_account]].forEach(function (s) {
        funnelCard.appendChild(bar(s[0], s[1], f.installs));
      });
      app.appendChild(funnelCard);

      var q = a.quota_histogram;
      var qSteps = [['0 requests used', q.used_none, null], ['1 to 5', q.used_1_5, null],
        ['6 to 10', q.used_6_10, null], ['11 to 20', q.used_11_20, 'warn'], ['All 21', q.exhausted, 'danger']];
      var qMax = qSteps.reduce(function (m, s) { return Math.max(m, s[1]); }, 0);
      var qCard = card('Free quota consumption · all time', [para('How far users go into their 21 free requests. Is 21 the right number?')]);
      qSteps.forEach(function (s) { qCard.appendChild(bar(s[0], s[1], qMax, s[2])); });
      app.appendChild(qCard);

      app.appendChild(card('Versions still in use · seen in the last 30 days', [
        dataTable([
          { key: 'platform', label: 'Platform' },
          { key: 'app_version', label: 'Version' },
          { key: 'count', label: 'Installations', num: true, fmt: num },
        ], g.active_versions_30d, { sort: 'count', csv: 'alice-versions-in-use' }),
        para('The last version each installation reported. Old versions at the top of this list are the people an upgrade prompt would reach.'),
      ]));
      app.appendChild(source('Alice database: installations', g.generated_at));
    });
  }

  // ---- Growth · Download clicks ----

  var SITE_PLATFORMS = {
    'desktop-macos': 'Mac', 'desktop-windows': 'Windows', 'desktop-linux': 'Linux', android: 'Android', ios: 'iPhone',
  };

  function renderEvents() {
    page(function () { return periodic('/admin/api/events'); }, function (data) {
      function button(row) { return SITE_PLATFORMS[row.platform] || row.platform; }
      app.appendChild(card('Clicks on the site\'s Download buttons · ' + periodName(), [
        dataTable([
          { key: 'platform', label: 'Button', get: button },
          { key: 'count', label: 'Clicks', num: true, fmt: num },
        ], data.totals, { sort: 'count', csv: 'alice-download-clicks', empty: 'No click recorded in this period.' }),
        para('A click on the site, against the downloads GitHub counts: the difference is people who clicked and did not finish, or who got the file elsewhere.'),
      ]));

      var rows = (data.by_day || []).map(function (r) { return { t: r.day * DAY, key: button(r), count: r.count }; });
      var stacked = stackPoints(dayTimes(state.days), rows, DAY);
      app.appendChild(card('Clicks per day · ' + periodName(), [
        columns(stacked.points, 'clicks', { keys: stacked.keys }),
        para('The only counter the site sends: a button and a day, with no cookie and nothing about the visitor. The apps send no usage counter.'),
      ]));
      app.appendChild(source('events_daily in the Alice database'));
    });
  }

  // ---- Growth · Downloads ----

  function renderDownloads() {
    page(fetchDownloads, function (d) {
      var totals = downloadTotals(d);
      app.appendChild(h('div', { class: 'grid' }, PLATFORMS.map(function (p) {
        return statCard(num(totals[p].count), p, addedText(totals[p].added, d.baseDay));
      })));
      d.errors.forEach(function (e) { app.appendChild(h('p', { class: 'err', text: 'GitHub unreachable · ' + e })); });
      if (d.history_error) app.appendChild(para(d.history_error, 'warn'));

      var byDay = stackPoints(dayTimes(state.days), d.downloads_by_day, DAY);
      app.appendChild(card('Downloads per day · ' + periodName(), [
        columns(byDay.points, 'downloads', { keys: byDay.keys }),
        para('GitHub only gives a running total per file. The console files that total each day it is opened'
          + (d.first_day ? ', since ' + d.first_day + ' (' + d.snapshot_days + ' days on record)' : '')
          + ', and a day\'s downloads are the difference with the read before. After several days without opening the console, their downloads all land on the day of the next read.'),
      ]));

      app.appendChild(card('Every installer, every release', [
        para('GitHub counts each download of a file, repeats included, and tells nobody who downloaded it. '
          + (d.baseDay ? '"New" compares with ' + d.baseDay + ', the last earlier day on record.' : 'This is the first day on record: "New" starts tomorrow.')),
        dataTable([
          { key: 'product', label: 'Product' },
          { key: 'version', label: 'Version' },
          { key: 'platform', label: 'Platform' },
          { key: 'file', label: 'File' },
          { key: 'count', label: 'Downloads', num: true, fmt: num },
          { key: 'added', label: 'New', num: true, fmt: function (v) { return v > 0 ? '+' + v : String(v); } },
        ], d.assets, { csv: 'alice-downloads', empty: 'No installer published yet.' }),
      ]));

      var t = d.traffic;
      if (!t.configured) {
        app.appendChild(card('Repository traffic', [
          para('GitHub also counts who looks at the repositories and where they come from, and keeps it 14 days. To show it here and keep it longer, add GITHUB_TRAFFIC_TOKEN to apps/venice-proxy-worker/.dev.vars: a fine-grained token limited to the 2 public repositories, with the Administration permission in read-only, which is what GitHub asks for to read traffic.'),
        ]));
      } else {
        var views = stackPoints(dayTimes(state.days), t.views, DAY);
        var clones = stackPoints(dayTimes(state.days), t.clones, DAY);
        app.appendChild(card('Repository page views per day · ' + periodName(), [columns(views.points, 'views', { keys: views.keys })]));
        app.appendChild(card('Clones per day · ' + periodName(), [
          columns(clones.points, 'clones', { keys: clones.keys }),
          para('A clone is a copy of the source code, by a person or by a machine building it. Not a download of the app.'),
        ]));
        app.appendChild(card('Where repository visitors come from · last 14 days', [
          dataTable([
            { key: 'referrer', label: 'Referring site' },
            { key: 'product', label: 'Repository' },
            { key: 'views', label: 'Views', num: true, fmt: num },
          ], t.referrers, { sort: 'views', csv: 'alice-github-referrers', empty: 'No referrer on record yet.' }),
        ]));
      }
      app.appendChild(source('GitHub releases and traffic APIs, filed by day in the Alice database', d.generated_at));
    });
  }

  // ---- Growth · Site ----

  function renderSite() {
    page(function () { return periodic('/admin/api/site-analytics'); }, function (s) {
      if (!s.configured) {
        app.appendChild(card('Connect Cloudflare Web Analytics', [
          para('alicebtc.com already counts visits with Cloudflare Web Analytics, without cookies. To show them here, add to apps/venice-proxy-worker/.dev.vars:'),
          h('ul', {}, [
            h('li', { text: 'CF_ANALYTICS_API_TOKEN: a Cloudflare API token with only Account → Account Analytics → Read' }),
            h('li', { text: 'CF_ACCOUNT_ID: the Cloudflare account id' }),
          ]),
          para('Then restart the console. Missing now: ' + s.missing.join(', ') + '.'),
        ]));
        return;
      }
      if (s.error) {
        app.appendChild(card('Site visits', [h('p', { class: 'err', text: s.error })]));
        return;
      }
      var days = s.daily || [];
      var points = days.map(function (d) { return { label: d.key.slice(5), count: d.visits }; });
      var totalVisits = days.reduce(function (sum, d) { return sum + d.visits; }, 0);
      var totalViews = days.reduce(function (sum, d) { return sum + d.page_views; }, 0);
      var span = s.period_days === 1 ? '2 days' : s.period_days + ' days';
      app.appendChild(h('div', { class: 'grid' }, [
        statCard(num(totalVisits), 'Visits · ' + span),
        statCard(num(totalViews), 'Page views · ' + span),
        statCard(totalVisits ? (totalViews / totalVisits).toFixed(1) : '—', 'Pages per visit'),
      ]));
      app.appendChild(card('Visits per day · ' + span, [columns(points, 'visits')]));
      function top(title, rows, empty, file) {
        return card(title + ' · ' + periodName(), [
          dataTable([
            { key: 'key', label: title, get: function (r) { return r.key || empty; } },
            { key: 'visits', label: 'Visits', num: true, fmt: num },
            { key: 'page_views', label: 'Page views', num: true, fmt: num },
          ], rows, { sort: 'visits', csv: file, empty: 'No data yet.' }),
        ]);
      }
      app.appendChild(top('Pages', s.top_paths || [], '—', 'alice-site-pages'));
      app.appendChild(h('div', { class: 'grid grid-2' }, [
        top('Countries', s.countries || [], 'Unknown', 'alice-site-countries'),
        top('Referrers', s.referers || [], 'Direct or hidden', 'alice-site-referrers'),
      ]));
      app.appendChild(source('Cloudflare Web Analytics, aggregate and cookie-free. Cloudflare samples busy days, so small numbers can move slightly. A visit can take half an hour to appear', Date.now()));
    });
  }
`;
