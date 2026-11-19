// The console's client script, part 3 of 3: the Money and Accounts sections,
// the sign-in form, the header and the router. Closes the closure that part 1
// opened. See admin-dashboard-client-core.ts for why this is String.raw.
export const ADMIN_CLIENT_MONEY = String.raw`
  // ---- Money · Revenue ----

  function mainCurrency(m) {
    return m.fiat_currency || 'EUR';
  }

  function renderRevenue() {
    page(function () {
      // The Venice side is optional here: without a working key the page
      // still shows what was earned.
      return Promise.all([
        periodic('/admin/api/money'),
        periodic('/admin/api/venice').catch(function () { return null; }),
      ]);
    }, function (both) {
      var m = both[0];
      var venice = both[1];
      var cur = mainCurrency(m);
      var r = m.revenue;
      function fiat(c) { return money(c, cur); }

      app.appendChild(h('div', { class: 'grid grid-3' }, [
        compareCard(r.current.sats, r.previous.sats, 'Sats received',
          'What BTCPay settled for paid invoices, in satoshis.', sats),
        compareCard(r.current.cents, r.previous.cents, 'Invoiced value paid',
          'The same invoices at the price they were issued in.', fiat),
        compareCard(r.current.count, r.previous.count, 'Invoices paid',
          m.invoices.paid_percent === null
            ? 'No invoice was opened in this period.'
            : m.invoices.paid + ' of the ' + m.invoices.created + ' invoices opened in this period were paid (' + m.invoices.paid_percent + '%).'),
      ]));

      app.appendChild(card('Sats received · ' + periodName(), [
        columns(pointsOf(r.series, 'sats', m.bucket_ms), 'sats', { fmt: sats }),
      ]));

      var costCard = card('Revenue against what Private Cloud costs · ' + periodName(), []);
      if (venice && venice.configured && !venice.error && !venice.usage_error) {
        costCard.appendChild(h('div', { class: 'grid' }, [
          statCard(fiat(r.current.cents), 'Paid invoices'),
          statCard(usd(venice.total_usd), 'Venice spend', 'At Venice list prices.'),
        ]));
        costCard.appendChild(para('Shown side by side and not subtracted: one is in ' + cur + ', the other in USD, and the console does not invent an exchange rate.'));
      } else {
        costCard.appendChild(para('The Venice spend is not available' + (venice && (venice.error || venice.usage_error) ? ' (' + (venice.error || venice.usage_error) + ')' : '') + '. See Venice cost.'));
      }
      app.appendChild(costCard);

      app.appendChild(card('By month · 12 months', [
        dataTable([
          { key: 'month', label: 'Month' },
          { key: 'count', label: 'Invoices paid', num: true, fmt: num },
          { key: 'cents', label: 'Invoiced value', num: true, fmt: fiat },
          { key: 'sats', label: 'Sats received', num: true, fmt: sats },
        ], r.monthly, { sort: 'month', dir: -1, csv: 'alice-revenue-by-month', empty: 'No paid invoice yet.' }),
      ]));

      function statusTable(rows) {
        return dataTable([
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Invoices', num: true, fmt: num },
          { key: 'cents', label: 'Value', num: true, fmt: fiat },
          { key: 'sats', label: 'Sats', num: true, fmt: sats },
        ], rows, { sort: 'count', empty: 'No invoice.' });
      }
      app.appendChild(h('div', { class: 'grid grid-2' }, [
        card('Invoices opened in this period', [
          statusTable(m.invoices.period),
          para('expired: the checkout was opened and nobody paid in time. A high share of expired invoices is people giving up at the payment step.'),
        ]),
        card('Invoices · all time', [statusTable(m.invoices.all_time)]),
      ]));

      app.appendChild(card('Length people pay for · all time', [
        dataTable([
          { key: 'months', label: 'Months bought', num: true },
          { key: 'count', label: 'Invoices paid', num: true, fmt: num },
        ], r.months_mix, { sort: 'months', dir: 1, empty: 'No paid invoice yet.' }),
      ]));
      app.appendChild(source('invoices in the Alice database, written by BTCPay webhooks. Totals only, no payer', m.generated_at));
    });
  }

  // ---- Money · Subscriptions ----

  var REMINDER_NAMES = { t_minus_3: '3 days before expiry', expiry_day: 'On the expiry day' };

  function renderSubscriptions() {
    page(function () { return periodic('/admin/api/money'); }, function (m) {
      var s = m.subscriptions;
      app.appendChild(h('div', { class: 'grid' }, [
        statCard(num(s.active), 'Active paid plans', 'Accounts on Cloud whose plan has not run out.'),
        statCard(num(s.expiring_7d), 'Run out within 7 days'),
        statCard(num(s.expiring_30d), 'Run out within 30 days'),
        statCard(num(s.overdue), 'Past their date', 'Waiting for the hourly sweep to return them to free.'),
        statCard(num(s.free), 'On the free plan', 'Anonymous installations included.'),
      ]));

      // Bitcoin cannot be direct-debited: every one of these is a renewal
      // someone has to decide to make.
      var byDay = {};
      (s.next_expiries || []).forEach(function (t) {
        var d = Math.floor(t / DAY) * DAY;
        byDay[d] = (byDay[d] || 0) + 1;
      });
      var today = Math.floor(Date.now() / DAY) * DAY;
      var points = [];
      for (var i = 0; i <= 30; i += 1) {
        var t = today + i * DAY;
        points.push({ label: new Date(t).toISOString().slice(5, 10), count: byDay[t] || 0 });
      }
      app.appendChild(card('Plans running out · next 30 days', [
        columns(points, 'plans'),
        para('Dates only. To see who, open Accounts filtered on the Cloud plan and sort by expiry.'),
        h('div', { class: 'row' }, [h('button', {
          class: 'btn',
          text: 'Open paying accounts',
          onclick: function () { state.accountFilter = { plan: 'cloud' }; go('accounts'); },
        })]),
      ]));

      app.appendChild(card('Renewal reminders sent · ' + periodName(), [
        dataTable([
          { key: 'kind', label: 'Reminder', get: function (r) { return REMINDER_NAMES[r.kind] || r.kind; } },
          { key: 'count', label: 'Emails sent', num: true, fmt: num },
        ], s.reminders, { empty: 'No reminder sent in this period.' }),
        para('Sent by the hourly cron to the billing address of an account whose plan is about to run out.'),
      ]));
      app.appendChild(source('entitlements and billing_reminders in the Alice database', m.generated_at));
    });
  }

  // ---- Money · Usage ----

  function renderUsage() {
    page(function () { return periodic('/admin/api/money'); }, function (m) {
      var u = m.usage;
      var total = u.series.reduce(function (acc, p) {
        acc.count += p.count; acc.input += p.input_bytes; acc.output += p.output_bytes; return acc;
      }, { count: 0, input: 0, output: 0 });
      app.appendChild(h('div', { class: 'grid' }, [
        statCard(num(total.count), 'Requests answered', 'Private Cloud requests confirmed in ' + periodName() + '.'),
        statCard(bytes(total.input), 'Sent to Venice', 'Size of the encrypted questions. The paid plan is metered in bytes because the relay cannot read tokens.'),
        statCard(bytes(total.output), 'Received from Venice', 'Size of the encrypted answers.'),
      ]));
      app.appendChild(card('Requests answered · ' + periodName(), [columns(pointsOf(u.series, 'count', m.bucket_ms), 'requests')]));
      app.appendChild(card('Answer bytes · ' + periodName(), [columns(pointsOf(u.series, 'output_bytes', m.bucket_ms), '', { fmt: bytes })]));

      app.appendChild(card('Free and paid · ' + periodName(), [
        dataTable([
          { key: 'plan', label: 'Plan held today' },
          { key: 'count', label: 'Requests', num: true, fmt: num },
          { key: 'input_bytes', label: 'Sent', num: true, fmt: bytes },
          { key: 'output_bytes', label: 'Received', num: true, fmt: bytes },
        ], u.by_plan, { sort: 'count', empty: 'No request in this period.' }),
        para('Grouped by the plan each account holds today. The ledger does not record the plan a request was served under, so a request made on the free plan by someone who paid since counts as paid here.'),
      ]));

      var a = u.allowance;
      function share(used, limit) { return limit > 0 ? Math.round((used / limit) * 100) + '%' : '—'; }
      app.appendChild(card('Allowance of the paid plans · current period', [
        h('table', {}, [
          h('tr', {}, [h('td', { text: 'Active paid plans' }), h('td', { class: 'num', text: num(a.accounts) })]),
          h('tr', {}, [h('td', { text: 'Input allowance used, all together' }), h('td', { class: 'num', text: share(a.input_used, a.input_limit) })]),
          h('tr', {}, [h('td', { text: 'Output allowance used, all together' }), h('td', { class: 'num', text: share(a.output_used, a.output_limit) })]),
          h('tr', {}, [h('td', { text: 'Plans above 80% of their output allowance' }), h('td', { class: 'num', text: num(a.near_limit) })]),
        ]),
        para('If most plans sit far below their allowance the plan is generous; several above 80% means the allowance is what people run into.'),
      ]));

      app.appendChild(card('How requests ended · ' + periodName(), [
        dataTable([
          { key: 'request_type', label: 'Type' },
          { key: 'status', label: 'Outcome' },
          { key: 'count', label: 'Requests', num: true, fmt: num },
        ], u.by_type, { sort: 'count', empty: 'No request in this period.' }),
        para('confirmed: answered. refunded: Venice failed and the user got their request back. rejected: refused before reaching Venice. reserved: in flight, or never closed by the app.'),
      ]));
      app.appendChild(source('cloud_request_ledger in the Alice database. Sizes only, never content', m.generated_at));
    });
  }

  // ---- Money · Venice cost ----

  function renderVenice() {
    page(function () { return periodic('/admin/api/venice'); }, function (v) {
      if (!v.configured || v.error) {
        app.appendChild(card('Connect Venice billing', [
          v.error ? h('p', { class: 'err', text: v.error }) : null,
          para('This page reads the balance and the spending of the Venice account. Add to apps/venice-proxy-worker/.dev.vars:'),
          h('ul', {}, [h('li', { text: 'VENICE_BILLING_API_KEY: a Venice API key of the account Alice is billed on' })]),
          para('The VENICE_API_KEY already in that file is usually a placeholder, which Venice refuses. The key stays on this machine; it is never deployed. Then restart the console.'),
        ]));
        return;
      }
      var b = v.balances;
      app.appendChild(h('div', { class: 'grid' }, [
        statCard(usd(b.USD), 'USD balance'),
        statCard(num(b.DIEM), 'DIEM', 'Refills every epoch' + (v.next_epoch_begins ? ', next ' + fmtTime(Date.parse(v.next_epoch_begins)) : '') + '.'),
        statCard(usd(b.BUNDLED_CREDITS), 'Bundled credits'),
        statCard(usd(v.total_usd), 'Spent · ' + periodName(), 'At Venice list prices, whichever balance paid.'),
        statCard(usd(v.per_day_usd), 'Per day, average'),
        statCard(v.runway_days === null ? '—' : num(v.runway_days) + ' d', 'Runway',
          'How long USD and bundled credits last at this pace. DIEM is not counted: it refills.'),
      ]));
      if (v.key_expiration) app.appendChild(para('This key expires ' + fmtTime(Date.parse(v.key_expiration)) + '.', 'warn'));
      if (v.usage_error) app.appendChild(h('p', { class: 'err', text: 'The spending history could not be read: ' + v.usage_error }));
      if (v.truncated) app.appendChild(para('More history than the console reads in one go: the totals below are a lower bound. Pick a shorter period.', 'warn'));

      app.appendChild(card('Spend · ' + periodName(), [columns(pointsOf(v.series, 'usd', v.bucket_ms), '', { fmt: usd })]));
      app.appendChild(card('By product', [
        dataTable([
          { key: 'sku', label: 'Venice product' },
          { key: 'usd', label: 'Spend', num: true, fmt: usd },
          { key: 'units', label: 'Units', num: true, fmt: num },
          { key: 'lines', label: 'Charges', num: true, fmt: num },
        ], v.by_sku, { sort: 'usd', csv: 'alice-venice-by-product', empty: 'No spending in this period.' }),
        para('A product is a model and a direction, for example its output tokens in millions. This is the whole account, not one user: Venice\'s per-request lines are added up here and not kept.'),
      ]));
      app.appendChild(card('Which balance paid', [
        dataTable([
          { key: 'currency', label: 'Balance' },
          { key: 'usd', label: 'Value at list price', num: true, fmt: usd },
        ], v.by_currency, { sort: 'usd', empty: 'No spending in this period.' }),
      ]));
      app.appendChild(source('Venice billing API (beta, its format can change without notice)', v.generated_at));
    });
  }

  // ---- Money · Faucet ----

  // The test wallet faucet: Alice's own Mutinynet float, and how fast the
  // learners are drawing it down. Read-only, and deliberately incapable of
  // showing the recovery phrase or who received what: the API returns
  // neither, so there is nothing here to leak or to click by accident.
  function renderFaucet() {
    page(function () { return api('/admin/api/test-wallet-faucet'); }, function (f) {
      var w = f.wallet;
      var c = f.claims;

      if (!f.configured && !w) {
        app.appendChild(card('Faucet is off', [
          para('No TEST_WALLET_FAUCET_MNEMONIC secret is set, so Alice hands out nothing and the app sends learners to the public Mutinynet faucet instead. See docs/test-wallet-faucet.md to turn it on.'),
        ]));
      }
      if (f.claimsError) {
        app.appendChild(card('Faucet tables missing', [
          para('The counters cannot be read: ' + f.claimsError + ' This normally means the faucet migrations have not been applied to this database yet.', 'warn'),
        ]));
      }

      app.appendChild(card('Float', [
        para('Mutinynet coins, worth nothing anywhere. What is bounded here is how fast the wallet empties, not any value.'),
        h('div', { class: 'grid' }, [
          statCard(w ? sats(w.balanceSats) : '—', 'Sats in the wallet'),
          statCard(w ? num(w.payoutsLeft) : '—', 'Payouts left'),
          statCard(c ? sats(c.total * f.payoutSats) : '—', 'Sats handed out'),
          statCard(c ? num(c.total) : '—', 'Learners served'),
        ]),
        w && w.low ? para('Below ' + sats(f.lowBalanceSats) + ' sats. Top the wallet up at the address below before it runs dry.', 'warn') : null,
        f.walletError ? h('p', { class: 'err', text: 'The chain could not be read: ' + f.walletError }) : null,
        !f.configured && w ? para('This console sees the float through its public key and cannot spend it, which is why the faucet reads as not configured from here. That is the intended setup.') : null,
      ]));

      if (w) {
        var copied = h('span', { class: 'pill ok', style: 'visibility:hidden', text: 'copied' });
        app.appendChild(card('Top-up address', [
          para('The dispensing wallet\'s own receiving address. Fund it from faucet.mutinynet.com; every payout leaves from here and its change comes back to the wallet.'),
          h('div', { class: 'row', style: 'margin-bottom:12px' }, [
            h('code', { text: w.address }),
            h('button', {
              class: 'btn',
              text: 'Copy',
              onclick: function () {
                navigator.clipboard.writeText(w.address).then(function () {
                  copied.style.visibility = 'visible';
                  setTimeout(function () { copied.style.visibility = 'hidden'; }, 1500);
                });
              },
            }),
            copied,
          ]),
          h('div', { class: 'grid' }, [
            statCard(sats(w.confirmedSats), 'Confirmed'),
            statCard(sats(w.pendingSats), 'Waiting for a block'),
            statCard(num(w.coins), 'Coins'),
            statCard(f.payingOut ? 'busy' : 'idle', 'Right now'),
          ]),
        ]));
      }

      if (c) {
        var capCard = card('Today', [
          para('One payout per installation for life, and ' + f.dailyCap + ' a day platform-wide. The daily cap is the backstop against someone clearing site data to mint a fresh installation.'),
        ]);
        capCard.appendChild(bar('Daily cap used', c.today, f.dailyCap,
          c.today >= f.dailyCap ? 'danger' : (c.today > f.dailyCap * 0.7 ? 'warn' : null)));
        capCard.appendChild(para(Math.max(0, f.dailyCap - c.today) + ' payouts left today, ' + sats(Math.max(0, f.dailyCap - c.today) * f.payoutSats) + ' sats at most.'));
        app.appendChild(capCard);

        app.appendChild(card('Payouts per day · 30 days', [
          columns((c.byDay || []).map(function (row) {
            return { label: new Date(row.day * DAY).toISOString().slice(5, 10), count: row.count };
          }), 'payouts'),
        ]));
        app.appendChild(card('Take-up', [
          h('div', { class: 'grid' }, [
            statCard(num(c.today), 'Today'),
            statCard(num(c.last7d), 'Last 7 days'),
            statCard(num(c.last30d), 'Last 30 days'),
            statCard(num(c.total), 'All time'),
          ]),
          para('First payout ' + fmtTime(c.firstAt) + ', most recent ' + fmtTime(c.lastAt) + '.'),
        ]));
      }
      app.appendChild(card('What this page cannot show', [
        para('The recovery phrase never leaves its Worker secret and is not returned by this API. Neither is any payout transaction or recipient: the claims table holds a keyed hash and a timestamp, nothing that points back at a learner or their wallet. Everything above is aggregate, and nothing on this page can move funds.'),
      ]));
      app.appendChild(source('Mutinynet (Esplora) and the Alice database', Date.now()));
    });
  }

  // ---- Money · Promos ----

  function renderPromos() {
    state.ticket += 1;
    app.innerHTML = '';
    var msg = h('div');
    var code = h('input', { placeholder: 'Code (optional, auto-generated)' });
    var credits = h('input', { type: 'number', placeholder: 'Credits', value: '21' });
    var maxRedemptions = h('input', { type: 'number', placeholder: 'Max redemptions', value: '1' });
    var expiresInDays = h('input', { type: 'number', placeholder: 'Expires in days (optional)' });
    var list = h('div');
    function load() {
      list.innerHTML = '<p class="muted">Loading…</p>';
      api('/admin/api/promo-codes').then(function (data) {
        list.innerHTML = '';
        list.appendChild(dataTable([
          { key: 'code', label: 'Code', cell: function (p) { return h('code', { text: p.code }); } },
          { key: 'credits', label: 'Credits', num: true, fmt: num },
          { key: 'redemptions_count', label: 'Redeemed', get: function (p) { return p.redemptions_count + ' / ' + p.max_redemptions; } },
          { key: 'expires_at', label: 'Expires', fmt: fmtTime },
          { key: 'created_at', label: 'Created', fmt: fmtTime },
          { key: 'disabled_at', label: 'Status', get: function (p) { return p.disabled_at ? 'disabled' : 'active'; } },
          { key: 'action', label: '', cell: function (p) {
            var disable = writeBtn('Disable', '', function () {
              api('/admin/api/promo-codes/' + encodeURIComponent(p.code) + '/disable', { method: 'POST', body: '{}' })
                .then(load)
                .catch(function (e) { msg.className = 'err'; msg.textContent = e.message; });
            });
            if (p.disabled_at) disable.disabled = true;
            return disable;
          } },
        ], data.promo_codes, { sort: 'created_at', csv: 'alice-promo-codes', empty: 'No promo code yet.' }));
      }).catch(function (e) { list.innerHTML = ''; list.appendChild(h('p', { class: 'err', text: e.message })); });
    }
    var createBtn = writeBtn('Create', 'primary', function () {
      msg.textContent = '';
      api('/admin/api/promo-codes', {
        method: 'POST',
        body: JSON.stringify({
          code: code.value.trim() || undefined,
          credits: Number(credits.value),
          max_redemptions: Number(maxRedemptions.value),
          expires_in_days: expiresInDays.value ? Number(expiresInDays.value) : undefined,
        }),
      }).then(function () { code.value = ''; load(); })
        .catch(function (e) { msg.className = 'err'; msg.textContent = e.message; });
    });
    app.appendChild(card('Create promo code', [
      // The apps show no redeem field during the beta, so a code created here
      // cannot be entered by anyone. The screen says so, rather than let an
      // operator hand out a dead code.
      para('Codes cannot be redeemed right now: the promo field is not shown in the apps during the beta. To give an account more requests, open it under Accounts and adjust its credits directly.', 'warn'),
      lockNote(),
      h('div', { class: 'row' }, [code, credits, maxRedemptions, expiresInDays, createBtn]),
      msg,
    ]));
    app.appendChild(card('Promo codes', [list]));
    load();
  }

  // ---- Accounts ----

  function statusPill(status) {
    return h('span', { class: 'pill ' + (status === 'active' ? 'active' : 'suspended'), text: status });
  }

  function renderAccounts() {
    state.ticket += 1;
    app.innerHTML = '';
    var filter = state.accountFilter || {};
    var q = h('input', { placeholder: 'username, exact email, or support id', style: 'width:300px' });
    function choice(options, current) {
      var select = h('select', {}, options.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
      select.value = current || '';
      return select;
    }
    var plan = choice([['', 'Any plan'], ['free', 'Free'], ['cloud', 'Cloud (paying)']], filter.plan);
    var status = choice([['', 'Any status'], ['active', 'Active'], ['suspended', 'Suspended']], filter.status);
    var created = choice([['', 'Created any time'], ['1', 'Last 24 hours'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days']], filter.created);
    var results = h('div');
    var loaded = [];

    function draw(nextOffset) {
      results.innerHTML = '';
      results.appendChild(dataTable([
        { key: 'support_id', label: 'Support id' },
        { key: 'display_name', label: 'Display name' },
        { key: 'email_masked', label: 'Email' },
        { key: 'status', label: 'Status', cell: function (a) { return statusPill(a.status); } },
        { key: 'plan', label: 'Plan' },
        { key: 'plan_expires_at', label: 'Plan ends', fmt: fmtDate },
        { key: 'cloud_requests_used', label: 'Free requests', get: function (a) { return a.cloud_requests_used + ' / ' + a.cloud_requests_limit; } },
        { key: 'created_at', label: 'Created', fmt: fmtTime },
      ], loaded, {
        csv: 'alice-accounts',
        empty: 'No account matches.',
        onRow: function (a) { state.detail = a.support_id; go('account'); },
      }));
      results.appendChild(para(loaded.length + ' accounts shown. Sorting and the export cover what is loaded.'));
      if (nextOffset !== null) {
        results.appendChild(h('button', { class: 'btn', text: 'Load more', onclick: function () { load(nextOffset); } }));
      }
    }
    function load(offset) {
      if (!offset) loaded = [];
      state.accountFilter = { plan: plan.value, status: status.value, created: created.value };
      var qs = '?offset=' + (offset || 0)
        + (q.value ? '&q=' + encodeURIComponent(q.value.trim()) : '')
        + (plan.value ? '&plan=' + plan.value : '')
        + (status.value ? '&status=' + status.value : '')
        + (created.value ? '&created_within_days=' + created.value : '');
      api('/admin/api/accounts' + qs).then(function (data) {
        loaded = loaded.concat(data.accounts);
        draw(data.next_offset);
      }).catch(function (e) { results.innerHTML = ''; results.appendChild(h('p', { class: 'err', text: e.message })); });
    }
    [plan, status, created].forEach(function (el) { el.addEventListener('change', function () { load(0); }); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') load(0); });
    app.appendChild(card('Accounts', [
      h('div', { class: 'row', style: 'margin-bottom:12px' }, [
        q, h('button', { class: 'btn primary', text: 'Search', onclick: function () { load(0); } }),
        plan, status, created,
      ]),
      para('Accounts with a login only. Emails are masked everywhere; an exact email is matched by its hash, since Alice never stores the address in clear.'),
      results,
    ]));
    load(0);
  }

  function renderAccountDetail(id) {
    page(function () { return api('/admin/api/accounts/' + encodeURIComponent(id)); }, function (a) {
      var msg = h('div');
      function run(promise) {
        msg.textContent = '';
        return promise.then(function () { renderAccountDetail(id); })
          .catch(function (e) { msg.className = 'err'; msg.textContent = e.message; });
      }
      app.appendChild(h('p', {}, [h('button', { class: 'btn', text: '← Back to accounts', onclick: function () { go('accounts'); } })]));

      app.appendChild(card(a.support_id, [
        h('p', {}, [statusPill(a.status)]),
        h('table', {}, [
          h('tr', {}, [h('td', { text: 'Display name' }), h('td', { text: a.display_name || '—' })]),
          h('tr', {}, [h('td', { text: 'Email' }), h('td', { text: a.email_masked || '—' })]),
          h('tr', {}, [h('td', { text: 'Plan' }), h('td', { text: a.plan })]),
          h('tr', {}, [h('td', { text: 'Free requests' }), h('td', { text: a.cloud_requests_used + ' / ' + a.cloud_requests_limit + ' (remaining ' + a.cloud_requests_remaining + ')' })]),
          h('tr', {}, [h('td', { text: 'Last activity' }), h('td', { text: fmtTime(a.last_activity_at) })]),
          h('tr', {}, [h('td', { text: 'Internal id' }), h('td', {}, [h('code', { text: a.internal_id })])]),
        ]),
      ]));

      app.appendChild(card('Login methods', [
        dataTable([
          { key: 'provider', label: 'Method' },
          { key: 'label', label: 'Label' },
          { key: 'created_at', label: 'Added', fmt: fmtTime },
          { key: 'last_used_at', label: 'Last used', fmt: fmtTime },
        ], a.login_methods, { empty: 'None.' }),
      ]));

      app.appendChild(card('Recent technical errors', [
        dataTable([
          { key: 'created_at', label: 'When', fmt: fmtTime },
          { key: 'code', label: 'Code', cell: function (r) { return h('code', { text: r.code }); } },
          { key: 'status', label: 'Status', num: true },
          { key: 'meaning', label: 'What it means', wrap: true, get: function (r) { return explainError(r)[0]; } },
        ], a.recent_errors || [], { empty: 'None.' }),
        para('No prompts, AI responses, IP addresses, or wallet data are ever stored here.'),
      ]));

      var reason = h('input', { placeholder: 'Reason (required)', style: 'width:260px' });
      var suspendBtn = writeBtn(a.status === 'active' ? 'Suspend' : 'Reactivate', 'danger', function () {
        if (!reason.value.trim()) { msg.className = 'err'; msg.textContent = 'A reason is required.'; return; }
        run(api('/admin/api/accounts/' + encodeURIComponent(id) + '/' + (a.status === 'active' ? 'suspend' : 'reactivate'), {
          method: 'POST', body: JSON.stringify({ reason: reason.value.trim() }),
        }));
      });
      var creditDelta = h('input', { type: 'number', placeholder: 'e.g. 10 or -5', style: 'width:130px' });
      var creditReason = h('input', { placeholder: 'Reason (required)', style: 'width:260px' });
      var creditBtn = writeBtn('Change free requests', 'primary', function () {
        if (!creditReason.value.trim()) { msg.className = 'err'; msg.textContent = 'A reason is required.'; return; }
        run(api('/admin/api/accounts/' + encodeURIComponent(id) + '/credits', {
          method: 'POST',
          body: JSON.stringify({ delta: Number(creditDelta.value), reason: creditReason.value.trim() }),
        }));
      });
      app.appendChild(card('Operator tools', [
        lockNote(),
        h('div', { class: 'row', style: 'margin-bottom:10px' }, [reason, suspendBtn]),
        h('div', { class: 'row' }, [creditDelta, creditReason, creditBtn]),
        msg,
      ]));

      // Deleting cannot be undone, so it never rides on the 10-minute unlock:
      // it asks for the password and the account's name every time.
      var confirmDelete = h('input', { placeholder: 'Type "' + a.support_id + '" to confirm', style: 'width:260px' });
      var deletePassword = h('input', { type: 'password', placeholder: 'Your admin password', style: 'width:200px', autocomplete: 'current-password' });
      var deleteMsg = h('div');
      var deleteBtn = h('button', { class: 'btn danger', text: 'Permanently delete account' });
      if (state.role !== 'admin') deleteBtn.disabled = true;
      deleteBtn.addEventListener('click', function () {
        if (!confirm('This permanently deletes ' + a.support_id + ' and all server-side metadata. Continue?')) return;
        api('/admin/api/accounts/' + encodeURIComponent(id), {
          method: 'DELETE',
          body: JSON.stringify({ confirm: confirmDelete.value.trim(), admin_password: deletePassword.value }),
        }).then(function () { go('accounts'); })
          .catch(function (e) { deleteMsg.className = 'err'; deleteMsg.textContent = e.message; });
      });
      app.appendChild(card('Delete this account', [
        para('Irreversible. Asks for your password every time, whether or not writes are unlocked.'),
        h('div', { class: 'row' }, [confirmDelete, deletePassword, deleteBtn]),
        deleteMsg,
      ]));
    });
  }

  // ---- Accounts · Audit ----

  function renderAudit() {
    page(function () {
      return Promise.all([api('/admin/api/audit-log'), api('/admin/api/access-denials')]);
    }, function (both) {
      app.appendChild(card('What admins did', [
        dataTable([
          { key: 'created_at', label: 'When', fmt: fmtTime },
          { key: 'actor_support_id', label: 'Admin' },
          { key: 'action', label: 'Action' },
          { key: 'target_support_id', label: 'Account' },
          { key: 'metadata', label: 'Details', wrap: true, get: function (e) {
            var keys = Object.keys(e.metadata || {});
            return keys.length ? keys.map(function (k) { return k + ': ' + e.metadata[k]; }).join(' · ') : '';
          } },
        ], both[0].entries, { sort: 'created_at', csv: 'alice-audit-log', empty: 'Nothing yet.' }),
        para('The 50 most recent entries. Opening an account is logged too, so reading leaves a trace as well as writing.'),
      ]));
      app.appendChild(card('Refused attempts to reach the console', [
        dataTable([
          { key: 'created_at', label: 'When', fmt: fmtTime },
          { key: 'support_id', label: 'Signed-in account' },
          { key: 'reason', label: 'Why refused' },
          { key: 'path', label: 'Path' },
        ], both[1].denials, { sort: 'created_at', empty: 'No refused attempt on record.' }),
        para('not_admin: a valid Alice session with no admin rights tried a console route. reauth_failed: a wrong admin password. Someone probing shows up here.'),
      ]));
    });
  }

  // ---- Accounts · Admins ----

  function renderAdmins() {
    state.ticket += 1;
    app.innerHTML = '';
    var msg = h('div');
    var account = h('input', { placeholder: 'username or support id' });
    var roleSelect = h('select', {}, [
      h('option', { value: 'admin', text: 'admin (full access)' }),
      h('option', { value: 'support', text: 'support (read-only)' }),
    ]);
    // Who is an admin is the key to everything else, so these two actions
    // ask for the password every time, like deletion.
    var password = h('input', { type: 'password', placeholder: 'Your admin password', style: 'width:200px', autocomplete: 'current-password' });
    var list = h('div');
    function load() {
      list.innerHTML = '<p class="muted">Loading…</p>';
      api('/admin/api/admins').then(function (data) {
        list.innerHTML = '';
        list.appendChild(dataTable([
          { key: 'support_id', label: 'Support id' },
          { key: 'role', label: 'Role', cell: function (a) { return h('span', { class: 'pill ' + (a.role === 'admin' ? 'active' : ''), text: a.role }); } },
          { key: 'granted_at', label: 'Granted', fmt: fmtTime },
          { key: 'action', label: '', cell: function (a) {
            var revoke = h('button', { class: 'btn', text: 'Revoke' });
            if (state.role !== 'admin') revoke.disabled = true;
            revoke.addEventListener('click', function () {
              if (!confirm('Remove console access for ' + a.support_id + '?')) return;
              api('/admin/api/admins/' + encodeURIComponent(a.support_id), {
                method: 'DELETE',
                body: JSON.stringify({ admin_password: password.value }),
              }).then(load).catch(function (e) { msg.className = 'err'; msg.textContent = e.message; });
            });
            return revoke;
          } },
        ], data.admins));
      }).catch(function (e) { list.innerHTML = ''; list.appendChild(h('p', { class: 'err', text: e.message })); });
    }
    var grant = h('button', { class: 'btn primary', text: 'Grant access' });
    if (state.role !== 'admin') grant.disabled = true;
    grant.addEventListener('click', function () {
      msg.textContent = '';
      api('/admin/api/admins', {
        method: 'POST',
        body: JSON.stringify({ account: account.value.trim(), role: roleSelect.value, admin_password: password.value }),
      }).then(function () { account.value = ''; load(); })
        .catch(function (e) { msg.className = 'err'; msg.textContent = e.message; });
    });
    app.appendChild(card('Grant console access', [
      para('support is read-only: it sees every page and can change nothing. Granting and revoking ask for your password every time, whether or not writes are unlocked.'),
      h('div', { class: 'row' }, [account, roleSelect, password, grant]),
      msg,
    ]));
    app.appendChild(card('Current admins', [list]));
    load();
  }

  // ---- Sign-in ----

  function renderLogin() {
    state.ticket += 1;
    app.innerHTML = '';
    var err = h('div', { class: 'err' });
    var identifier = h('input', { placeholder: 'username or email', autocomplete: 'username' });
    var password = h('input', { type: 'password', placeholder: 'password', autocomplete: 'current-password' });
    var submit = h('button', { class: 'btn primary', text: 'Sign in' });
    var form = h('form', { class: 'card', style: 'max-width:360px;margin:60px auto 16px' }, [
      h('h2', { text: 'Sign in' }),
      para('Sign in with an Alice account that has admin access.'),
      h('div', { class: 'field' }, [h('label', { text: 'Username or email' }), identifier]),
      h('div', { class: 'field' }, [h('label', { text: 'Password' }), password]),
      submit,
      err,
    ]);
    // First-run setup. It only appears when the credentials were correct but
    // the account is not an admin yet, so it never hints at a bootstrap
    // secret to someone who cannot even sign in.
    var secret = h('input', { type: 'password', placeholder: 'ADMIN_BOOTSTRAP_SECRET', autocomplete: 'off' });
    var claim = h('button', { class: 'btn primary', text: 'Claim admin access' });
    var setup = h('div', { class: 'card', style: 'max-width:360px;margin:0 auto 60px;display:none' }, [
      h('h2', { text: 'First-time setup' }),
      para('This account is not an admin yet. If you are setting Alice up for the first time, paste the ADMIN_BOOTSTRAP_SECRET you configured on the Worker. This works only once, while no admin exists.'),
      h('div', { class: 'field' }, [h('label', { text: 'Bootstrap secret' }), secret]),
      claim,
    ]);

    function enter(session) {
      state.role = session.role;
      loadHealth(true);
      render();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      setup.style.display = 'none';
      submit.disabled = true;
      fetch(API + '/auth/password/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.value, password: password.value }),
      }).then(function (res) { return res.json().then(function (b) { return { ok: res.ok, body: b }; }); })
        .then(function (r) {
          if (!r.ok) throw new Error((r.body.error && r.body.error.message) || 'Sign in failed');
          setToken(r.body.access_token);
          return api('/admin/api/session');
        })
        .then(enter)
        .catch(function (e) {
          // Keep the token: the credentials were fine, the role is what is
          // missing, and the bootstrap call below needs that session.
          if (state.token && /admin access is required/i.test(e.message)) {
            setup.style.display = 'block';
            secret.focus();
            return;
          }
          setToken(null);
          err.textContent = e.message;
        })
        .finally(function () { submit.disabled = false; });
    });

    claim.addEventListener('click', function () {
      err.textContent = '';
      claim.disabled = true;
      api('/admin/api/bootstrap', { method: 'POST', headers: { 'x-admin-bootstrap-secret': secret.value } })
        .then(function () { return api('/admin/api/session'); })
        .then(enter)
        .catch(function (e) { err.textContent = e.message; })
        .finally(function () { claim.disabled = false; });
    });

    app.appendChild(form);
    app.appendChild(setup);
  }

  // ---- Header and router ----

  var VIEWS = {
    glance: renderGlance, pulse: renderPulse, errors: renderErrors, infra: renderInfra, versions: renderVersions, notes: renderNotes,
    overview: renderOverview, activation: renderActivation, events: renderEvents,
    downloads: renderDownloads, site: renderSite,
    revenue: renderRevenue, subscriptions: renderSubscriptions, usage: renderUsage,
    venice: renderVenice, faucet: renderFaucet, promos: renderPromos,
    accounts: renderAccounts, audit: renderAudit, admins: renderAdmins,
  };

  function sectionOf(pageId) {
    if (pageId === 'account') pageId = 'accounts';
    for (var i = 0; i < SECTIONS.length; i += 1) {
      for (var j = 0; j < SECTIONS[i].pages.length; j += 1) {
        if (SECTIONS[i].pages[j][0] === pageId) return SECTIONS[i];
      }
    }
    return SECTIONS[0];
  }

  function go(pageId) {
    state.page = pageId;
    if (pageId !== 'account') { state.detail = null; store('alice_admin_page', pageId); }
    window.scrollTo(0, 0);
    render();
  }

  function paintChrome() {
    var current = state.page === 'account' ? 'accounts' : state.page;
    var section = sectionOf(current);
    sectionsEl.innerHTML = '';
    SECTIONS.forEach(function (s) {
      sectionsEl.appendChild(h('button', {
        class: s.id === section.id ? 'active' : '',
        text: s.label,
        onclick: function () { go(s.pages[0][0]); },
      }));
    });
    pagesEl.innerHTML = '';
    section.pages.forEach(function (p) {
      pagesEl.appendChild(h('button', {
        class: p[0] === current ? 'active' : '',
        text: p[1],
        onclick: function () { go(p[0]); },
      }));
    });
    var follows = PERIOD_PAGES.indexOf(current) >= 0;
    periodEl.className = 'seg' + (follows ? '' : ' off');
    periodEl.title = follows ? 'Period shown on this page' : 'This page does not follow the period';
    periodEl.innerHTML = '';
    PERIODS.forEach(function (p) {
      periodEl.appendChild(h('button', {
        class: p[0] === state.days ? 'active' : '',
        text: p[1],
        onclick: function () { state.days = p[0]; store('alice_admin_days', String(p[0])); render(); },
      }));
    });
    var roleEl = document.getElementById('role');
    roleEl.textContent = state.role || '';
    roleEl.className = 'pill ' + (state.role === 'admin' ? 'active' : '');
    paintLock();
  }

  function render() {
    var signedIn = Boolean(state.token);
    Array.prototype.forEach.call(document.querySelectorAll('.chrome'), function (el) {
      el.style.display = signedIn ? '' : 'none';
    });
    if (!signedIn) {
      alertsEl.innerHTML = '';
      unlockForm.classList.remove('show');
      renderLogin();
      return;
    }
    if (!VIEWS[state.page] && state.page !== 'account') state.page = 'glance';
    paintChrome();
    if (state.page === 'account') renderAccountDetail(state.detail);
    else VIEWS[state.page]();
  }

  document.getElementById('refresh').addEventListener('click', function () {
    githubCache = {};
    loadMarks(true);
    loadHealth(true);
    render();
  });
  document.getElementById('logout').addEventListener('click', function () {
    setToken(null);
    state.unlock = null;
    state.health = null;
    healthRequest = null;
    marksRequest = null;
    githubCache = {};
    state.marks = [];
    render();
  });

  // Alice defaults to dark; light is there for screenshots on a white page.
  function applyTheme(mode) {
    if (mode === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    store('alice_admin_theme', mode);
  }
  applyTheme(stored('alice_admin_theme', 'dark'));
  document.getElementById('theme').addEventListener('click', function () {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });

  if (state.token) {
    api('/admin/api/session').then(function (s) { state.role = s.role; loadHealth(true); render(); })
      .catch(function () { setToken(null); render(); });
  } else {
    render();
  }
})();
`;
