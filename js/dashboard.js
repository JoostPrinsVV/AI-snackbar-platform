/* ==========================================================================
   Dashboard (alleen voor admin)
   --------------------------------------------------------------------------
   Drie bronnen:
   - Centraal (Supabase, als ingesteld): na inloggen de cijfers van álle
     telefoons en tablets, plus de 'Mail mij'-aanvragen. Alleen in het
     geheugen; weg na vergrendelen.
   - Dit apparaat.
   - Samengevoegde exports (zonder internet): exporteer op iedere tablet één
     bestand en importeer die hier. Per tablet telt alleen de nieuwste export
     mee, zodat niets dubbel wordt geteld.

   Exportformaat (JSON, ook bruikbaar voor een latere koppeling):
     { type: 'ai-snackbar-export', version: 1, namespace, deviceId, deviceLabel,
       exportedAt: 'JJJJ-MM-DDTUU:MM', snacks: [{ id, title }],
       stats, ratings, comments }
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, toast } = ns.ui;
  const EXPORT_TYPE = 'ai-snackbar-export';
  const EXPORT_VERSION = 1;
  const RATING_KEYS = ['happy', 'neutral', 'sad'];
  const RATING_CLASS = { happy: 'positive', neutral: 'neutral', sad: 'negative' };
  const COMMENT_LIMIT = 100;

  let ctx = null;
  let root = null;
  let tooltip = null;
  let imports = [];
  let centralData = null; // { events, ratings, comments, requests, fetchedAt }
  let showCentral = true;
  let centralBusy = false;

  /* ---- Gegevens --------------------------------------------------------------- */
  function stamp(date) {
    const d = date || new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function localDataset() {
    const device = ns.storage.deviceInfo();
    return {
      type: EXPORT_TYPE,
      version: EXPORT_VERSION,
      namespace: ctx.config.storageNamespace,
      deviceId: device.deviceId,
      deviceLabel: device.deviceLabel,
      exportedAt: stamp(),
      snacks: ctx.getSnacks().map((snack) => ({ id: snack.id, title: snack.title })),
      stats: ns.storage.getStats(),
      ratings: ns.storage.get('ratings', {}),
      comments: ns.storage.get('comments', []),
      isLocal: true
    };
  }

  function isEmpty(set) {
    return !set.stats.total && !Object.keys(set.ratings).length && !set.comments.length;
  }

  /**
   * Per tablet alleen de nieuwste gegevens. Een lege eigen dataset (bijv. de
   * admin-laptop die alleen importeert) telt niet mee zodra er imports zijn.
   */
  function currentDatasets() {
    const byDevice = new Map();
    const local = localDataset();
    const sources = imports.length && isEmpty(local) ? imports : [local].concat(imports);
    sources.forEach((set) => {
      const previous = byDevice.get(set.deviceId);
      if (!previous || set.exportedAt > previous.exportedAt || (set.isLocal && set.exportedAt === previous.exportedAt)) byDevice.set(set.deviceId, set);
    });
    return Array.from(byDevice.values());
  }

  /* ---- Centrale gegevens -> dezelfde vorm als een export per apparaat --------- */
  function localParts(iso) {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return { hour: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}`, minute: stamp(d) };
  }

  function centralDatasets(data) {
    const byDevice = new Map();
    const setFor = (row) => {
      let set = byDevice.get(row.device_id);
      if (!set) {
        set = { deviceId: row.device_id, deviceLabel: '', deviceKind: row.device_kind, exportedAt: '', snacks: [], stats: ns.storage.normalizeStats(null), ratings: {}, comments: [], isCentral: true };
        byDevice.set(row.device_id, set);
      }
      if (row.device_label && !set.deviceLabel) set.deviceLabel = row.device_label;
      return set;
    };
    const bump = (map, id) => {
      map[id] = (map[id] || 0) + 1;
    };

    data.events.forEach((row) => {
      const stats = setFor(row).stats;
      if (row.kind === 'visit') stats.visits += 1;
      if (row.kind === 'surprise') stats.surprises += 1;
      if (!row.snack_id) return;
      if (row.kind === 'open') {
        stats.total += 1;
        bump(stats.opens, row.snack_id);
        bump(stats.hourly, localParts(row.occurred_at || row.created_at).hour);
      }
      if (row.kind === 'play') bump(stats.plays, row.snack_id);
      if (row.kind === 'complete') bump(stats.completions, row.snack_id);
    });

    // Smileys: per bezoek en snack telt de laatste keuze (de rijen komen op volgorde binnen).
    const latest = new Map();
    data.ratings.forEach((row) => latest.set(row.session_id + '|' + row.snack_id, row));
    latest.forEach((row) => {
      const ratings = setFor(row).ratings;
      ratings[row.snack_id] = ratings[row.snack_id] || { happy: 0, neutral: 0, sad: 0 };
      if (RATING_KEYS.includes(row.value)) ratings[row.snack_id][row.value] += 1;
    });

    data.comments.forEach((row) => setFor(row).comments.push({ snackId: row.snack_id, text: row.text, at: localParts(row.occurred_at || row.created_at).minute }));

    // Apparaten zonder naam: Tablet 1, 2 ... en Telefoon/laptop 1, 2 ...
    const counters = { kiosk: 0, persoonlijk: 0 };
    byDevice.forEach((set) => {
      if (set.deviceLabel) return;
      const kind = set.deviceKind === 'kiosk' ? 'kiosk' : 'persoonlijk';
      counters[kind] += 1;
      set.deviceLabel = kind === 'kiosk' ? `Tablet ${counters.kiosk}` : `Telefoon/laptop ${counters.persoonlijk}`;
    });
    return Array.from(byDevice.values());
  }

  function usingCentral() {
    return Boolean(centralData && showCentral && ns.central.signedIn());
  }

  async function loadCentral() {
    centralBusy = true;
    draw();
    try {
      centralData = await ns.central.fetchAll();
      showCentral = true;
    } catch (error) {
      toast('Centrale gegevens ophalen mislukt: ' + error.message, { tone: 'warning', duration: 6000 });
      if (!ns.central.signedIn()) centralData = null;
    }
    centralBusy = false;
    draw();
  }

  /** Vergrendelen: centrale gegevens (met e-mailadressen) uit het geheugen. */
  function forget() {
    centralData = null;
    showCentral = true;
    centralBusy = false;
  }

  function addCounts(target, source) {
    Object.keys(source || {}).forEach((key) => {
      target[key] = (target[key] || 0) + source[key];
    });
  }

  function deviceName(set, index) {
    return set.deviceLabel || (set.isLocal ? 'Deze tablet' : `Tablet ${index + 1}`);
  }

  function aggregate(sets) {
    const total = { visits: 0, opensTotal: 0, surprises: 0, opens: {}, plays: {}, completions: {}, hourly: {}, ratings: {}, comments: [] };
    sets.forEach((set, index) => {
      const stats = ns.storage.normalizeStats(set.stats);
      total.visits += stats.visits;
      total.opensTotal += stats.total;
      total.surprises += stats.surprises;
      addCounts(total.opens, stats.opens);
      addCounts(total.plays, stats.plays);
      addCounts(total.completions, stats.completions);
      addCounts(total.hourly, stats.hourly);
      Object.keys(set.ratings || {}).forEach((id) => {
        total.ratings[id] = total.ratings[id] || { happy: 0, neutral: 0, sad: 0 };
        RATING_KEYS.forEach((key) => {
          total.ratings[id][key] += set.ratings[id][key];
        });
      });
      (set.comments || []).forEach((item) => total.comments.push(Object.assign({ device: deviceName(set, index) }, item)));
    });
    total.comments.sort((a, b) => (a.at < b.at ? 1 : -1));
    return total;
  }

  /** Alle snacks uit de kaart, plus snacks die alleen in (oudere) exports voorkomen. */
  function snackRows(sets, data) {
    const rows = ctx.getSnacks().map((snack) => ({ id: snack.id, label: `${snack.number} ${snack.title}` }));
    const known = new Set(rows.map((row) => row.id));
    const titles = new Map();
    sets.forEach((set) => (set.snacks || []).forEach((snack) => titles.set(snack.id, snack.title)));
    Object.keys(Object.assign({}, data.opens, data.ratings)).forEach((id) => {
      if (!known.has(id)) rows.push({ id, label: titles.get(id) || id });
    });
    return rows.map((row) => {
      const rating = data.ratings[row.id] || { happy: 0, neutral: 0, sad: 0 };
      return Object.assign(row, {
        opens: data.opens[row.id] || 0,
        plays: data.plays[row.id] || 0,
        completions: data.completions[row.id] || 0,
        rating,
        ratingTotal: rating.happy + rating.neutral + rating.sad,
        comments: data.comments.filter((item) => item.snackId === row.id).length
      });
    });
  }

  /* ---- Opbouw ---------------------------------------------------------------- */
  function render(container, context) {
    ctx = context;
    root = container;
    draw();
  }

  function draw() {
    const central = usingCentral();
    const sets = central ? centralDatasets(centralData) : currentDatasets();
    const data = aggregate(sets);
    const rows = snackRows(sets, data);
    tooltip = el('div', { className: 'dash-tooltip', attrs: { role: 'tooltip', hidden: true } });
    const parts = [
      renderCentral(sets),
      renderSource(sets, central),
      ctx.config.enableLocalAnalytics ? null : el('p', { className: 'admin__intro' }, 'Let op: anonieme statistiek staat uit (enableLocalAnalytics), dus geopend/gestart/bezoekers worden niet geteld.'),
      renderTiles(data, rows),
      central ? renderRequests(centralData.requests, rows) : null,
      renderPerDemo(rows),
      renderHourly(data.hourly),
      renderComments(data.comments, rows),
      tooltip
    ];
    // replaceChildren zou null als tekst "null" tonen
    root.replaceChildren(...parts.filter(Boolean));
    bindTooltips();
  }

  function number(value) {
    return Number(value || 0).toLocaleString('nl-NL');
  }

  function plural(count, one, many) {
    return `${number(count)} ${count === 1 ? one : many}`;
  }

  function percent(part, whole) {
    return whole ? Math.round((part / whole) * 100) + '%' : '–';
  }

  function section(title, iconName, children, extraClass) {
    return el('section', { className: 'dash__section' + (extraClass ? ' ' + extraClass : '') }, [el('h3', { className: 'dash__title' }, [icon(iconName), title])].concat(children));
  }

  function actionButton(label, iconName, onClick) {
    return el('button', { className: 'btn btn--secondary btn--sm', attrs: { type: 'button' }, on: { click: onClick } }, [icon(iconName), el('span', { text: label })]);
  }

  /* Centrale gegevens: inloggen, of de stand van zaken plus vernieuwen/uitloggen */
  function renderCentral(sets) {
    if (!ns.central.isEnabled()) return null;
    const signedIn = ns.central.signedIn();

    if (!signedIn) {
      const email = el('input', { className: 'dash__label-input', attrs: { id: 'dash-central-email', type: 'email', autocomplete: 'username', inputmode: 'email', autocapitalize: 'off', spellcheck: 'false', required: true } });
      const password = el('input', { className: 'dash__label-input', attrs: { id: 'dash-central-password', type: 'password', autocomplete: 'current-password', required: true } });
      const submit = el('button', { className: 'btn btn--primary btn--sm', attrs: { type: 'submit' } }, [icon('lock'), el('span', { text: 'Inloggen' })]);
      const form = el('form', { className: 'dash__login', attrs: { novalidate: true } }, [
        el('label', { className: 'dash__label-caption', attrs: { for: 'dash-central-email' }, text: 'E-mailadres (beheerder)' }),
        email,
        el('label', { className: 'dash__label-caption', attrs: { for: 'dash-central-password' }, text: 'Wachtwoord' }),
        password,
        submit
      ]);
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!email.value.trim() || !password.value) return;
        submit.disabled = true;
        let ok = false;
        try {
          ok = await ns.central.signIn(email.value.trim(), password.value);
        } catch (error) {
          ok = false;
        }
        password.value = '';
        submit.disabled = false;
        if (!ok) {
          toast('Inloggen mislukt. Controleer e-mailadres en wachtwoord (en of je als beheerder in Supabase staat).', { tone: 'warning', duration: 6000 });
          return;
        }
        loadCentral();
      });
      return el('div', { className: 'dash__source dash__central' }, [
        el('div', { className: 'dash__source-main' }, [
          el('p', { className: 'dash__source-summary' }, [icon('lock'), 'Centrale gegevens van alle telefoons en tablets']),
          el('p', { className: 'admin__intro', text: 'Log in met je beheerdersaccount uit Supabase (zie docs/SUPABASE.md). Je blijft ingelogd tot je vergrendelt of de pagina herlaadt.' })
        ]),
        form
      ]);
    }

    const kinds = { kiosk: 0, persoonlijk: 0 };
    sets.forEach((set) => {
      kinds[set.deviceKind === 'kiosk' ? 'kiosk' : 'persoonlijk'] += 1;
    });
    let summary = 'Centrale gegevens worden opgehaald…';
    if (!centralBusy && centralData) {
      summary = usingCentral()
        ? `Centraal: ${plural(sets.length, 'apparaat', 'apparaten')} (${plural(kinds.kiosk, 'tablet', 'tablets')}, ${plural(kinds.persoonlijk, 'telefoon/laptop', 'telefoons/laptops')}) · bijgewerkt ${centralData.fetchedAt.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
        : 'Je bekijkt nu alleen dit apparaat (of de geïmporteerde exports).';
    }
    const buttons = [
      actionButton(centralData ? 'Vernieuwen' : 'Gegevens ophalen', 'refresh', loadCentral),
      centralData ? actionButton(showCentral ? 'Alleen dit apparaat' : 'Centraal tonen', 'grid', () => {
        showCentral = !showCentral;
        draw();
      }) : null,
      actionButton('Uitloggen', 'close', () => {
        ns.central.signOut();
        forget();
        draw();
      })
    ].filter(Boolean);
    return el('div', { className: 'dash__source dash__central' }, [
      el('div', { className: 'dash__source-main' }, [
        el('p', { className: 'dash__source-summary' }, [icon(usingCentral() ? 'check-circle' : 'info'), summary]),
        el('p', { className: 'admin__intro', text: `Ingelogd als ${signedIn}.` })
      ]),
      el('div', { className: 'admin__buttons' }, buttons)
    ]);
  }

  /* 'Mail mij deze prompt': wie wil welke prompt, plus export en wissen na het mailen */
  function renderRequests(requests, rows) {
    // Aanvragen komen uit de snackbar én van de promptpagina (snacks en inspiratieprompts).
    const inspiration = ctx.getInspiration ? ctx.getInspiration() : [];
    const labels = new Map(rows.map((row) => [row.id, row.label]));
    const prompts = new Map(ctx.getSnacks().concat(inspiration).map((item) => [item.id, item]));
    inspiration.forEach((item) => {
      labels.set(item.id, 'Inspiratie: ' + item.title);
      if (!item.promptBasic) return;
      // Aangevraagd bij de versie zonder licentie: die tekst mailen.
      const basicId = item.id + ns.content.BASIC_SUFFIX;
      const title = item.title + ' (zonder licentie)';
      labels.set(basicId, 'Inspiratie: ' + title);
      prompts.set(basicId, { title, prompt: item.promptBasic });
    });
    const people = new Map();
    requests.forEach((row) => {
      const list = people.get(row.email) || [];
      list.push(row);
      people.set(row.email, list);
    });
    const sorted = Array.from(people.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    const list = sorted.length
      ? el(
          'ul',
          { className: 'admin__comments', attrs: { role: 'list' } },
          sorted.map(([email, items]) =>
            el('li', {}, [
              el('span', { className: 'admin__comment-meta', text: items.map((item) => labels.get(item.snack_id) || item.snack_id).join(' · ') }),
              el('span', { className: 'admin__comment-text', text: email })
            ])
          )
        )
      : el('p', { className: 'admin__intro', text: 'Nog niemand heeft om een prompt gevraagd.' });

    const mailingCsv = () => {
      const lines = [['E-mailadres', 'Titels', 'Prompts']];
      sorted.forEach(([email, items]) => {
        const snacks = items.map((item) => prompts.get(item.snack_id)).filter(Boolean);
        lines.push([email, snacks.map((snack) => snack.title).join(', '), snacks.map((snack) => `${snack.title}:\n${snack.prompt}`).join('\n\n')]);
      });
      return toCsv(lines);
    };
    const requestsCsv = () => {
      const lines = [['E-mailadres', 'Titel', 'Prompt', 'Aangevraagd op']];
      requests.forEach((row) => {
        const snack = prompts.get(row.snack_id);
        lines.push([row.email, snack ? snack.title : row.snack_id, snack ? snack.prompt : '', localParts(row.created_at).minute.replace('T', ' ')]);
      });
      return toCsv(lines);
    };

    let armed = false;
    const wipe = actionButton('Wis alle e-mailadressen', 'trash', async () => {
      if (!armed) {
        armed = true;
        wipe.querySelector('span').textContent = 'Zeker weten? Tik nogmaals om te wissen';
        wipe.classList.add('btn--danger');
        return;
      }
      wipe.disabled = true;
      try {
        await ns.central.deletePromptRequests();
        toast('Alle e-mailadressen zijn gewist.', { tone: 'success', icon: 'trash' });
        await loadCentral();
      } catch (error) {
        wipe.disabled = false;
        toast('Wissen mislukt: ' + error.message, { tone: 'warning', duration: 6000 });
      }
    });

    return section(`Mail mij deze prompt (${plural(people.size, 'persoon', 'personen')}, ${plural(requests.length, 'prompt', 'prompts')})`, 'mail', [
      el('p', { className: 'admin__intro', text: 'Mail na afloop iedereen de gevraagde prompt(s) en wis daarna de adressen; dat is wat we bij het invullen beloven.' }),
      list,
      el('div', { className: 'admin__buttons' }, [
        actionButton('Mailinglijst per persoon (CSV)', 'download', () => downloadFile(`mailinglijst-${fileStamp()}.csv`, mailingCsv(), 'text/csv')),
        actionButton('Per aanvraag (CSV)', 'download', () => downloadFile(`mail-aanvragen-${fileStamp()}.csv`, requestsCsv(), 'text/csv')),
        requests.length ? wipe : null
      ].filter(Boolean))
    ]);
  }

  /* Bron: deze tablet of samengevoegd, plus export/import */
  function renderSource(sets, central) {
    const device = ns.storage.deviceInfo();
    const names = sets.map((set, index) => deviceName(set, index));
    const summary = imports.length
      ? `Samengevoegd: ${sets.length} ${sets.length === 1 ? 'tablet' : 'tablets'} (${names.join(', ')})`
      : `Bron: ${device.deviceLabel ? 'deze tablet (' + device.deviceLabel + ')' : 'deze tablet'}`;

    const fileInput = el('input', { className: 'sr-only', attrs: { type: 'file', accept: '.json,application/json', multiple: true, tabindex: '-1', 'aria-hidden': 'true' } });
    fileInput.addEventListener('change', () => {
      importFiles(Array.from(fileInput.files || []));
      fileInput.value = '';
    });

    const labelInput = el('input', { className: 'dash__label-input', attrs: { id: 'dash-device-label', type: 'text', maxlength: 30, value: device.deviceLabel, placeholder: 'bijv. Tablet 1', autocomplete: 'off' } });
    const labelForm = el('form', { className: 'dash__label-form', attrs: { novalidate: true } }, [
      el('label', { className: 'dash__label-caption', text: 'Naam van deze tablet', attrs: { for: 'dash-device-label' } }),
      labelInput,
      el('button', { className: 'btn btn--secondary btn--sm', attrs: { type: 'submit' } }, [icon('check'), el('span', { text: 'Opslaan' })])
    ]);
    labelForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (ns.storage.setDeviceLabel(labelInput.value)) {
        toast('Naam van deze tablet opgeslagen.', { tone: 'success' });
        draw();
      } else {
        toast('Gebruik maximaal 30 letters, cijfers, spaties of streepjes.', { tone: 'warning' });
      }
    });

    const buttons = [
      actionButton('Exporteer deze tablet', 'download', exportLocal),
      actionButton('Importeer exports', 'grid', () => fileInput.click())
    ];
    if (imports.length) {
      buttons.push(
        actionButton('Alleen deze tablet', 'close', () => {
          imports = [];
          draw();
        })
      );
    }

    const block = el('div', { className: 'dash__source' }, [
      el('div', { className: 'dash__source-main' }, [
        central ? null : el('p', { className: 'dash__source-summary' }, [icon(imports.length ? 'grid' : 'info'), summary]),
        el('p', { className: 'admin__intro', text: 'Samenvoegen zonder internet: maak op iedere tablet een export en importeer die bestanden hier (bijvoorbeeld op je eigen laptop).' })
      ].filter(Boolean)),
      labelForm,
      el('div', { className: 'admin__buttons' }, buttons),
      fileInput
    ]);
    if (!ns.central.isEnabled()) return block;
    // Met centrale opslag is dit de reserve: ingeklapt, maar de naam van een tablet blijft handig.
    return el('details', { className: 'dash-details dash__local' }, [el('summary', { text: 'Dit apparaat: naam, export en import (zonder internet)' }), block]);
  }

  /* Kerncijfers */
  function renderTiles(data, rows) {
    const plays = rows.reduce((sum, row) => sum + row.plays, 0);
    const completions = rows.reduce((sum, row) => sum + row.completions, 0);
    const ratingTotal = rows.reduce((sum, row) => sum + row.ratingTotal, 0);
    const happy = rows.reduce((sum, row) => sum + row.rating.happy, 0);
    const tiles = [
      ['Bezoekers', data.visits, 'Bezoeken waarin minstens één snack is geopend'],
      ['Snacks geopend', data.opensTotal, `Verras mij ${number(data.surprises)}× gebruikt`],
      ["Demo's gestart", plays, 'Demo vanaf het begin gestart'],
      ["Demo's uitgekeken", completions, `${percent(completions, plays)} van de gestarte demo's`],
      ['Beoordelingen', ratingTotal, `${percent(happy, ratingTotal)} ${ns.ui.t('ratingHappy').replace(/!$/, '')}`],
      ['Vragen & opmerkingen', data.comments.length, `bij ${new Set(data.comments.map((item) => item.snackId)).size} snack(s)`]
    ];
    return el(
      'div',
      { className: 'dash__tiles' },
      tiles.map(([label, value, note]) =>
        el('div', { className: 'stat-tile' }, [
          el('p', { className: 'stat-tile__label', text: label }),
          el('p', { className: 'stat-tile__value', text: number(value) }),
          el('p', { className: 'stat-tile__note', text: note })
        ])
      )
    );
  }

  /* Per demo: tabel met balken (de tabel is meteen de toegankelijke weergave) */
  function renderPerDemo(rows) {
    const maxOpens = Math.max(1, ...rows.map((row) => row.opens));
    const labels = ns.feedback.RATINGS.reduce((map, option) => Object.assign(map, { [option.value]: ns.ui.t(option.label).replace(/!$/, '') }), {});

    const legend = el(
      'ul',
      { className: 'dash-legend', attrs: { role: 'list', 'aria-label': 'Legenda beoordelingen' } },
      RATING_KEYS.map((key) => el('li', {}, [el('span', { className: 'dash-legend__swatch dash-legend__swatch--' + RATING_CLASS[key], attrs: { 'aria-hidden': 'true' } }), labels[key]]))
    );

    const head = el('tr', {}, [
      el('th', { attrs: { scope: 'col' }, text: 'Snack' }),
      el('th', { attrs: { scope: 'col' }, text: 'Geopend' }),
      el('th', { className: 'num', attrs: { scope: 'col' }, text: 'Gestart' }),
      el('th', { className: 'num', attrs: { scope: 'col' }, text: 'Uitgekeken' }),
      el('th', { attrs: { scope: 'col' }, text: 'Beoordeling' }),
      ...RATING_KEYS.map((key) => el('th', { className: 'num', attrs: { scope: 'col' } }, [el('span', { className: 'dash-legend__swatch dash-legend__swatch--' + RATING_CLASS[key], attrs: { 'aria-hidden': 'true' } }), labels[key]])),
      el('th', { className: 'num', attrs: { scope: 'col' }, text: 'Vragen' })
    ]);

    const body = rows.map((row) =>
      el('tr', {}, [
        el('th', { attrs: { scope: 'row' }, text: row.label }),
        el('td', {}, barCell(row, maxOpens)),
        el('td', { className: 'num', text: number(row.plays) }),
        el('td', { className: 'num', text: number(row.completions) }),
        el('td', {}, stackedCell(row, labels)),
        ...RATING_KEYS.map((key) => el('td', { className: 'num', text: number(row.rating[key]) })),
        el('td', { className: 'num', text: number(row.comments) })
      ])
    );

    return section('Per demo', 'grid', [
      legend,
      el('div', { className: 'admin-table-wrap' }, el('table', { className: 'admin-table dash-table' }, [el('thead', {}, head), el('tbody', {}, body)])),
      el('div', { className: 'admin__buttons' }, [actionButton('Overzicht per demo (CSV)', 'download', () => downloadFile(`overzicht-per-demo-${fileStamp()}.csv`, summaryCsv(rows), 'text/csv'))])
    ]);
  }

  function tipAttrs(value, label) {
    return { tabindex: '0', 'data-tip-value': value, 'data-tip-label': label };
  }

  function barCell(row, max) {
    const width = (row.opens / max) * 100;
    return el('div', { className: 'dash-bar', attrs: tipAttrs(`${number(row.opens)}× geopend`, row.label) }, [
      el('span', { className: 'dash-bar__track' }, row.opens ? el('span', { className: 'dash-bar__fill', dataset: { width: width.toFixed(1) } }) : null),
      el('span', { className: 'dash-bar__value', text: number(row.opens) })
    ]);
  }

  function stackedCell(row, labels) {
    if (!row.ratingTotal) return el('span', { className: 'dash-empty', text: 'nog geen' });
    const segments = RATING_KEYS.filter((key) => row.rating[key] > 0).map((key) => {
      const share = row.rating[key] / row.ratingTotal;
      return el('span', {
        className: 'dash-stack__segment dash-stack__segment--' + RATING_CLASS[key],
        dataset: { width: (share * 100).toFixed(2) },
        attrs: tipAttrs(`${number(row.rating[key])} (${Math.round(share * 100)}%)`, `${row.label} · ${labels[key]}`)
      });
    });
    return el('div', { className: 'dash-stack', attrs: { 'aria-label': `${labels.happy} ${row.rating.happy}, ${labels.neutral} ${row.rating.neutral}, ${labels.sad} ${row.rating.sad}` } }, segments);
  }

  /* Drukte per uur: per dag één kolomdiagram (kleine veelvouden, zelfde schaal) */
  function renderHourly(hourly) {
    const keys = Object.keys(hourly).sort();
    if (!keys.length) {
      return section('Drukte per uur', 'clock', [el('p', { className: 'admin__intro', text: 'Nog geen activiteit gemeten.' })]);
    }
    const days = Array.from(new Set(keys.map((key) => key.slice(0, 10))));
    const hours = keys.map((key) => Number(key.slice(11, 13)));
    const first = Math.min(...hours);
    const last = Math.max(...hours);
    const max = niceMax(Math.max(...keys.map((key) => hourly[key])));

    const charts = days.map((day) => {
      const columns = [];
      for (let hour = first; hour <= last; hour += 1) {
        const key = `${day}T${String(hour).padStart(2, '0')}`;
        const value = hourly[key] || 0;
        columns.push(
          el('div', { className: 'dash-cols__slot', attrs: tipAttrs(`${number(value)}× geopend`, `${dayLabel(day)} · ${hour}:00–${hour + 1}:00`) }, [
            el('span', { className: 'dash-cols__bar', dataset: { height: ((value / max) * 100).toFixed(1) } }),
            el('span', { className: 'dash-cols__tick', text: String(hour) })
          ])
        );
      }
      return el('figure', { className: 'dash-cols' }, [
        el('figcaption', { className: 'dash-cols__caption', text: dayLabel(day) }),
        el('div', { className: 'dash-cols__plot' }, [
          el('div', { className: 'dash-cols__axis', attrs: { 'aria-hidden': 'true' } }, [el('span', { text: number(max) }), el('span', { text: number(max / 2) }), el('span', { text: '0' })]),
          el('div', { className: 'dash-cols__bars' }, columns)
        ])
      ]);
    });

    // Tabelweergave als toegankelijk alternatief voor de kolommen
    const table = el('table', { className: 'admin-table' }, [
      el('thead', {}, el('tr', {}, [el('th', { text: 'Dag' }), el('th', { text: 'Uur' }), el('th', { className: 'num', text: 'Keer geopend' })])),
      el('tbody', {}, keys.map((key) => el('tr', {}, [el('td', { text: dayLabel(key.slice(0, 10)) }), el('td', { text: `${Number(key.slice(11, 13))}:00` }), el('td', { className: 'num', text: number(hourly[key]) })])))
    ]);

    return section('Drukte per uur', 'clock', [
      el('p', { className: 'admin__intro', text: 'Aantal keer dat een snack is geopend, per uur.' }),
      el('div', { className: 'dash-cols__grid' }, charts),
      el('details', { className: 'dash-details' }, [el('summary', { text: 'Toon als tabel' }), el('div', { className: 'admin-table-wrap' }, table)])
    ]);
  }

  /** Ronde bovengrens waarvan ook de helft een heel getal is (aantallen, geen fracties). */
  function niceMax(value) {
    if (value <= 10) return Math.max(2, Math.ceil(value / 2) * 2);
    const power = Math.pow(10, Math.floor(Math.log10(value)));
    const steps = [1, 2, 3, 4, 5, 6, 8, 10];
    for (const step of steps) {
      if (value <= step * power) return step * power;
    }
    return 10 * power;
  }

  function dayLabel(day) {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  /* Vragen en opmerkingen */
  function renderComments(comments, rows) {
    const labels = new Map(rows.map((row) => [row.id, row.label]));
    const shown = comments.slice(0, COMMENT_LIMIT);
    const list = shown.length
      ? el(
          'ul',
          { className: 'admin__comments', attrs: { role: 'list' } },
          shown.map((item) =>
            el('li', {}, [
              el('span', { className: 'admin__comment-meta', text: `${item.at.replace('T', ' ')} · ${labels.get(item.snackId) || item.snackId} · ${item.device}` }),
              el('span', { className: 'admin__comment-text', text: item.text })
            ])
          )
        )
      : el('p', { className: 'admin__intro', text: 'Nog geen vragen of opmerkingen.' });

    return section(`Vragen en opmerkingen (${number(comments.length)})`, 'info', [
      list,
      comments.length > shown.length ? el('p', { className: 'admin__intro', text: `De ${shown.length} nieuwste worden getoond; de export bevat ze allemaal.` }) : null,
      el('div', { className: 'admin__buttons' }, [
        actionButton('Vragen en opmerkingen (CSV)', 'download', () => downloadFile(`vragen-en-opmerkingen-${fileStamp()}.csv`, commentsCsv(comments, labels), 'text/csv')),
        actionButton('Kopieer als tekst', 'copy', () => copyText(commentsCsv(comments, labels)))
      ])
    ]);
  }

  /* ---- Tooltips (verrijken, de waarden staan ook in de tabellen) ------------- */
  const boundRoots = new WeakSet();

  function bindTooltips() {
    // Breedtes/hoogtes via CSSOM (CSP staat geen inline style-attributen toe).
    root.querySelectorAll('[data-width]').forEach((node) => {
      node.style.setProperty('--w', node.dataset.width + '%');
      node.style.setProperty('--g', node.dataset.width); // flex-verhouding voor gestapelde balken
    });
    root.querySelectorAll('[data-height]').forEach((node) => node.style.setProperty('--h', node.dataset.height + '%'));

    if (boundRoots.has(root)) return;
    boundRoots.add(root);
    const show = (target, x, y) => {
      tooltip.replaceChildren(el('strong', { text: target.dataset.tipValue }), el('span', { text: target.dataset.tipLabel }));
      tooltip.hidden = false;
      const box = root.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const left = (x != null ? x : rect.left + rect.width / 2) - box.left;
      const top = (y != null ? y : rect.top) - box.top;
      tooltip.style.setProperty('--x', left + 'px');
      tooltip.style.setProperty('--y', top + 'px');
    };
    const hide = () => {
      tooltip.hidden = true;
    };
    root.addEventListener('pointermove', (event) => {
      const target = event.target.closest && event.target.closest('[data-tip-value]');
      if (target) show(target, event.clientX, event.clientY);
      else hide();
    });
    root.addEventListener('pointerleave', hide);
    root.addEventListener('focusin', (event) => {
      if (event.target.dataset && event.target.dataset.tipValue) show(event.target);
    });
    root.addEventListener('focusout', hide);
  }

  /* ---- Export / import ------------------------------------------------------- */
  function fileStamp() {
    return `${ctx.config.storageNamespace}-${stamp().replace(/[:T]/g, '-')}`;
  }

  function exportLocal() {
    const data = localDataset();
    delete data.isLocal;
    const name = (data.deviceLabel || 'tablet').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadFile(`snackbar-export-${name}-${fileStamp()}.json`, JSON.stringify(data, null, 2), 'application/json');
  }

  function parseExport(json) {
    const v = ns.storage.validators;
    if (!json || json.type !== EXPORT_TYPE || json.version !== EXPORT_VERSION) throw new Error('geen exportbestand van de AI Snackbar');
    if (json.namespace !== ctx.config.storageNamespace) throw new Error(`hoort bij een andere snackbar (${json.namespace})`);
    if (!v.deviceId(json.deviceId)) throw new Error('ongeldige apparaatcode');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(json.exportedAt || '')) throw new Error('ongeldige exportdatum');
    if (!v.stats(json.stats) || !v.ratings(json.ratings) || !v.comments(json.comments)) throw new Error('de gegevens zijn beschadigd of aangepast');
    return {
      deviceId: json.deviceId,
      deviceLabel: v.deviceLabel(json.deviceLabel || '') ? json.deviceLabel || '' : '',
      exportedAt: json.exportedAt,
      snacks: Array.isArray(json.snacks) ? json.snacks.filter((s) => s && typeof s.id === 'string' && typeof s.title === 'string').slice(0, 50) : [],
      stats: ns.storage.normalizeStats(json.stats),
      ratings: json.ratings,
      comments: json.comments
    };
  }

  function importFiles(files) {
    if (!files.length) return;
    let done = 0;
    let added = 0;
    const problems = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const set = parseExport(JSON.parse(String(reader.result)));
          const existing = imports.findIndex((item) => item.deviceId === set.deviceId);
          if (existing === -1) imports.push(set);
          else if (set.exportedAt >= imports[existing].exportedAt) imports[existing] = set;
          added += 1;
        } catch (error) {
          problems.push(`${file.name}: ${error.message}`);
        }
        finish();
      };
      reader.onerror = () => {
        problems.push(`${file.name}: kon niet worden gelezen`);
        finish();
      };
      reader.readAsText(file);
    });
    function finish() {
      done += 1;
      if (done < files.length) return;
      draw();
      if (added) toast(`${added} exportbestand(en) ingelezen. Per tablet telt de nieuwste export.`, { tone: 'success' });
      problems.forEach((problem) => {
        console.warn('[AI Snackbar] Import overgeslagen:', problem);
        toast('Overgeslagen: ' + problem, { tone: 'warning', duration: 6000 });
      });
    }
  }

  /** Downloadt tekst als bestand. CSV krijgt een BOM, zodat Excel é/ë goed toont. */
  function downloadFile(filename, text, mime) {
    const content = mime === 'text/csv' ? '﻿' + text : text;
    const blob = new Blob([content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    // In de (modale) dialoog plaatsen: de rest van de pagina is dan inert.
    const link = el('a', { attrs: { href: url, download: filename, hidden: true } });
    root.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`Download gestart: ${filename}`, { tone: 'success', icon: 'download' });
  }

  /** Terugvaloptie als downloaden in de kioskweergave niet lukt. */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('Gekopieerd. Plak het in Excel of Kladblok (Ctrl+V).', { tone: 'success', icon: 'copy' });
    } catch (error) {
      toast('Kopiëren lukt hier niet. Gebruik de downloadknop.', { tone: 'warning' });
    }
  }

  /** Excel-veilig CSV-veld: puntkomma als scheidingsteken, geen formules. */
  function csvCell(value) {
    let text = value == null ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    if (/[;"\n\r]/.test(text)) text = '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function toCsv(rows) {
    return rows.map((row) => row.map(csvCell).join(';')).join('\r\n') + '\r\n';
  }

  function summaryCsv(rows) {
    const labels = ns.feedback.RATINGS.map((option) => ns.ui.t(option.label).replace(/!$/, ''));
    const lines = [['Snack', 'Geopend', 'Gestart', 'Uitgekeken', ...labels, 'Beoordelingen totaal', 'Vragen en opmerkingen']];
    rows.forEach((row) => lines.push([row.label, row.opens, row.plays, row.completions, row.rating.happy, row.rating.neutral, row.rating.sad, row.ratingTotal, row.comments]));
    return toCsv(lines);
  }

  function commentsCsv(comments, labels) {
    const lines = [['Datum', 'Tijd', 'Snack', 'Apparaat', 'Vraag of opmerking']];
    comments.forEach((item) => {
      const [date, time] = item.at.split('T');
      lines.push([date, time, labels.get(item.snackId) || item.snackId, item.device, item.text]);
    });
    return toCsv(lines);
  }

  ns.dashboard = {
    render,
    forget
  };
})(window.AISnackbar);
