/* ==========================================================================
   Rapport: het dashboard als één A4-pagina in de huisstijl (alleen admin)
   --------------------------------------------------------------------------
   Knop 'Rapport (pdf)' in het Dashboard. Bouwt een pagina met de actuele
   cijfers (dezelfde bron als het dashboard: centraal, dit apparaat of de
   samengevoegde exports) en opent het afdrukvenster; daar kies je 'Opslaan
   als PDF'. Geen bibliotheek, geen internet: werkt ook op de tablets.

   Alleen anonieme aantallen: geen e-mailadressen, namen of de tekst van
   opmerkingen. Bij 'Mail mij' en licentieaanvragen alleen hoeveel en hoeveel
   nog open staan.

   Invoer (ns.report.print):
     { title, subtitle, source, generatedAt: Date, logoSrc,
       tiles: [[label, waarde, toelichting]],
       rows: [{ label, opens, plays, completions, rating: { happy, neutral, sad }, ratingTotal, comments }],
       hourly: { 'JJJJ-MM-DDTUU': aantal },
       requests: { people, prompts, open } | null,   open: null zonder statuskolom
       licenses: { total, open } | null,
       ratingLabels: { happy, neutral, sad } }
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el } = ns.ui;
  const RATING_KEYS = ['happy', 'neutral', 'sad'];
  const RATING_CLASS = { happy: 'positive', neutral: 'neutral', sad: 'negative' };
  const MIN_VOTES = 3; // 'best beoordeeld' en 'meest uitgekeken' pas vanaf zoveel stemmen of starts

  const number = (value) => Number(value || 0).toLocaleString('nl-NL');
  const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) + '%' : '–');

  /* ---- Opbouw ------------------------------------------------------------------ */
  function build(data) {
    return el('article', { className: 'report', attrs: { id: 'print-report', 'aria-hidden': 'true' } }, [
      header(data),
      el('div', { className: 'report__body' }, [
        el('div', { className: 'report__intro' }, [
          el('h1', { className: 'report__title', text: data.title }),
          el('p', { className: 'report__meta', text: [data.subtitle, data.source].filter(Boolean).join(' · ') })
        ]),
        tiles(data.tiles),
        el('div', { className: 'report__columns' }, [highlights(data), followUp(data) || hourlyBlock(data.hourly)]),
        perSnack(data.rows, data.ratingLabels),
        data.requests || data.licenses ? hourlyBlock(data.hourly) : null
      ]),
      footer()
    ]);
  }

  /** Donkerblauwe kop: logo (diapositief) of de naam als tekst, en rechts soort en moment. */
  function header(data) {
    const brand = data.logoSrc
      ? el('img', { className: 'report__logo', attrs: { src: data.logoSrc, alt: data.logoAlt || '' } })
      : el('span', { className: 'report__wordmark', text: data.organization || '' });
    return el('header', { className: 'report__header' }, [
      brand,
      el('div', { className: 'report__stamp' }, [
        el('span', { className: 'report__kind', text: 'Rapport' }),
        el('span', { text: 'Stand ' + data.generatedAt.toLocaleString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) })
      ])
    ]);
  }

  function section(title, children, extraClass) {
    return el('section', { className: 'report__section' + (extraClass ? ' ' + extraClass : '') }, [el('h2', { className: 'report__heading', text: title })].concat(children));
  }

  function tiles(list) {
    return el('div', { className: 'report__tiles' }, list.map(([label, value, note]) => el('div', { className: 'report__tile' }, [
      el('p', { className: 'report__tile-value', text: number(value) }),
      el('p', { className: 'report__tile-label', text: label }),
      el('p', { className: 'report__tile-note', text: note })
    ])));
  }

  /* In het kort: wat opvalt, alleen als er genoeg is om iets te zeggen */
  function highlights(data) {
    const rows = data.rows;
    const items = [];
    const opened = rows.filter((row) => row.opens > 0).sort((a, b) => b.opens - a.opens);
    if (opened.length) items.push(`Meest geopend: ${opened[0].label} (${number(opened[0].opens)}×).`);
    const rated = rows.filter((row) => row.ratingTotal >= MIN_VOTES).sort((a, b) => b.rating.happy / b.ratingTotal - a.rating.happy / a.ratingTotal);
    if (rated.length) items.push(`Best beoordeeld: ${rated[0].label}, ${percent(rated[0].rating.happy, rated[0].ratingTotal)} ${data.ratingLabels.happy.toLowerCase()} (${number(rated[0].ratingTotal)} stemmen).`);
    const watched = rows.filter((row) => row.plays >= MIN_VOTES).sort((a, b) => b.completions / b.plays - a.completions / a.plays);
    if (watched.length) items.push(`Vaakst helemaal uitgekeken: ${watched[0].label} (${percent(watched[0].completions, watched[0].plays)} van de starts).`);
    const peak = busiest(data.hourly);
    if (peak) items.push(`Drukste uur: ${peak.day}, ${peak.hour}:00–${peak.hour + 1}:00 (${number(peak.value)}× een snack geopend).`);
    if (!items.length) items.push('Nog te weinig gebruik om iets over te zeggen.');
    return section('In het kort', [el('ul', { className: 'report__bullets' }, items.map((text) => el('li', { text })))]);
  }

  function busiest(hourly) {
    const keys = Object.keys(hourly || {});
    if (!keys.length) return null;
    const key = keys.reduce((best, item) => (hourly[item] > hourly[best] ? item : best));
    const [y, m, d] = key.slice(0, 10).split('-').map(Number);
    return { day: new Date(y, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }), hour: Number(key.slice(11, 13)), value: hourly[key] };
  }

  /* Opvolging: 'Mail mij' en licentieaanvragen (alleen met centrale gegevens; alleen aantallen) */
  function followUp(data) {
    if (!data.requests && !data.licenses) return null;
    const status = (open) => (open == null ? 'status nog niet bijgehouden' : `${number(open)} nog niet gereageerd`);
    const line = (total, label, note) => el('div', { className: 'report__follow' }, [
      el('p', { className: 'report__follow-value', text: number(total) }),
      el('p', { className: 'report__follow-label', text: label }),
      el('p', { className: 'report__tile-note', text: note })
    ]);
    const { requests, licenses } = data;
    return section('Opvolging', [
      el('div', { className: 'report__follow-grid' }, [
        requests ? line(requests.people, `${requests.people === 1 ? 'persoon vroeg' : 'personen vroegen'} om een prompt per mail`, `${number(requests.prompts)} prompts · ${status(requests.open)}`) : null,
        licenses ? line(licenses.total, licenses.total === 1 ? 'licentieaanvraag' : 'licentieaanvragen', status(licenses.open)) : null
      ])
    ]);
  }

  /**
   * Per snack: tabel met een balk voor 'geopend' en de verdeling van de beoordelingen.
   * limit: hooguit zoveel rijen (de meest geopende, in de volgorde van de kaart) plus een regel voor de rest.
   */
  function perSnack(rows, labels, limit) {
    const max = Math.max(1, ...rows.map((row) => row.opens));
    const kept = limit && limit < rows.length ? new Set(rows.slice().sort((a, b) => b.opens - a.opens).slice(0, limit)) : null;
    const shown = kept ? rows.filter((row) => kept.has(row)) : rows;
    const rest = rows.filter((row) => !shown.includes(row));
    const legend = el('ul', { className: 'report__legend' }, RATING_KEYS.map((key) => el('li', {}, [el('span', { className: 'report__swatch report__swatch--' + RATING_CLASS[key] }), labels[key]])));
    const head = el('tr', {}, ['Snack', 'Geopend', 'Gestart', 'Uitgekeken', 'Beoordeling', 'Vragen'].map((text, index) => el('th', { className: index && index !== 1 && index !== 4 ? 'num' : '', text })));
    const body = shown.map((row) => el('tr', {}, [
      el('th', { text: row.label }),
      el('td', {}, el('span', { className: 'report__bar' }, [scaled(el('span', { className: 'report__bar-fill' }), row.opens / max), el('span', { text: number(row.opens) })])),
      el('td', { className: 'num', text: number(row.plays) }),
      el('td', { className: 'num', text: row.plays ? `${number(row.completions)} (${percent(row.completions, row.plays)})` : number(row.completions) }),
      el('td', {}, ratingCell(row)),
      el('td', { className: 'num', text: number(row.comments) })
    ]));
    if (rest.length) {
      const opens = rest.reduce((sum, row) => sum + row.opens, 0);
      body.push(el('tr', { className: 'report__rest' }, [el('td', { attrs: { colspan: '6' }, text: `En nog ${rest.length} ${rest.length === 1 ? 'andere snack' : 'andere snacks'}, samen ${number(opens)}× geopend (alle cijfers staan in het dashboard).` })]));
    }
    return section('Per snack', [legend, el('table', { className: 'report__table' }, [el('thead', {}, head), el('tbody', {}, body)])], 'report__section--table');
  }

  /**
   * Alles op één pagina: meet het rapport (onzichtbaar), maak het zo nodig compacter en toon
   * anders minder snacks in de tabel. Werkt op het rapport dat al in de pagina staat.
   */
  function fit(node, data) {
    const body = node.querySelector('.report__body');
    const overflows = () => body.scrollHeight > body.clientHeight + 1;
    node.classList.add('report--measure');
    if (overflows()) node.classList.add('report--dense');
    for (let limit = data.rows.length - 1; overflows() && limit >= 3; limit -= 1) {
      node.querySelector('.report__section--table').replaceWith(perSnack(data.rows, data.ratingLabels, limit));
    }
    node.classList.remove('report--measure');
  }

  function ratingCell(row) {
    if (!row.ratingTotal) return el('span', { className: 'report__empty', text: 'nog geen' });
    return el('span', { className: 'report__rating' }, [
      el('span', { className: 'report__stack' }, RATING_KEYS.filter((key) => row.rating[key] > 0).map((key) => scaled(el('span', { className: 'report__stack-part report__swatch--' + RATING_CLASS[key] }), row.rating[key] / row.ratingTotal))),
      el('span', { text: `${percent(row.rating.happy, row.ratingTotal)} (${number(row.ratingTotal)})` })
    ]);
  }

  /** Breedte via CSSOM (de CSP staat geen style-attributen toe). */
  function scaled(node, share) {
    node.style.setProperty('--share', String(Math.max(0, Math.min(1, share))));
    return node;
  }

  /* Drukte per uur van de dag, opgeteld over alle dagen */
  function hourlyBlock(hourly) {
    const keys = Object.keys(hourly || {});
    if (!keys.length) return section('Drukte per uur', [el('p', { className: 'report__empty', text: 'Nog geen activiteit gemeten.' })]);
    const days = new Set(keys.map((key) => key.slice(0, 10))).size;
    const byHour = {};
    keys.forEach((key) => {
      const hour = Number(key.slice(11, 13));
      byHour[hour] = (byHour[hour] || 0) + hourly[key];
    });
    const hours = Object.keys(byHour).map(Number);
    const first = Math.min(...hours);
    const last = Math.max(...hours);
    const max = Math.max(...Object.values(byHour));
    const peak = hours.find((hour) => byHour[hour] === max); // alleen het drukste uur krijgt een getal
    const columns = [];
    for (let hour = first; hour <= last; hour += 1) {
      const value = byHour[hour] || 0;
      columns.push(el('div', { className: 'report__col' }, [
        el('span', { className: 'report__col-value', text: hour === peak ? number(value) : '' }),
        scaled(el('span', { className: 'report__col-bar' }), value / max),
        el('span', { className: 'report__col-tick', text: String(hour) })
      ]));
    }
    return section('Drukte per uur', [
      el('p', { className: 'report__note', text: `Keer een snack geopend per uur van de dag${days > 1 ? `, opgeteld over ${days} dagen` : ''}.` }),
      el('div', { className: 'report__cols' }, columns)
    ]);
  }

  /** Drie merkpilaren als beeld onderaan (rood onderop, de andere twee erover in multiply). */
  function footer() {
    return el('footer', { className: 'report__footer' }, [
      el('p', { text: 'Anonieme cijfers uit de AI Snackbar: geen namen, e-mailadressen of andere persoonsgegevens.' }),
      el('span', { className: 'report__pillars', attrs: { 'aria-hidden': 'true' } }, ['rood', 'turquoise', 'petrol'].map((name) => el('span', { className: 'report__pillar report__pillar--' + name })))
    ]);
  }

  /* ---- Afdrukken -------------------------------------------------------------------- */
  /** Zet het rapport klaar en open het afdrukvenster ('Opslaan als PDF'). Daarna weer weg. */
  function print(data) {
    const previous = document.getElementById('print-report');
    if (previous) previous.remove();
    const node = build(data);
    document.body.append(node);
    fit(node, data);
    const html = document.documentElement;
    const title = document.title;
    // De naam van het pdf-bestand komt uit de titel van de pagina
    document.title = `${data.title} rapport ${data.generatedAt.toISOString().slice(0, 10)}`;
    html.classList.add('is-printing');
    const cleanup = () => {
      window.removeEventListener('afterprint', cleanup);
      html.classList.remove('is-printing');
      document.title = title;
      node.remove();
    };
    window.addEventListener('afterprint', cleanup);
    const logo = node.querySelector('.report__logo');
    const ready = [document.fonts ? document.fonts.ready : null, logo && !logo.complete ? new Promise((resolve) => {
      logo.addEventListener('load', resolve, { once: true });
      logo.addEventListener('error', resolve, { once: true });
    }) : null].filter(Boolean);
    return Promise.all(ready).then(() => window.print());
  }

  ns.report = { print };
})(window.AISnackbar);
