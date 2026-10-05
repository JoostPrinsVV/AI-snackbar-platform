/* ==========================================================================
   Promptpagina (prompts/index.html)
   --------------------------------------------------------------------------
   Een lichte, losse pagina voor de QR-codes op de kaartjes bij de stand:
     prompts/                 alle prompts (snacks eerst)
     prompts/#snacks          de prompts uit de snackbar
     prompts/#inspiratie      de inspiratieprompts, per thema
     prompts/#<id>            één prompt; vast adres per prompt (het id uit
                              data/snacks.js of data/inspiration.js).
                              Verander een id niet meer nadat de QR-codes
                              gedrukt zijn.
   Leest dezelfde instellingen, teksten en snacks als de snackbar, met dezelfde
   controle (js/content.js). Geen opslag en geen tellers. Alleen 'Mail mij deze
   prompt' maakt verbinding met de centrale opslag (als die aan staat); het
   e-mailadres gaat daar direct heen en blijft niet op de telefoon.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, setIcon, t, toast, levelDots } = ns.ui;
  const COPIED_MS = 2400;
  const KINDS = ['snacks', 'inspiratie'];
  const ALL_THEMES = 'all';

  const entries = new Map();
  const lists = { snacks: [], inspiratie: [] };
  let categories = [];
  let kind = 'snacks';
  let theme = ALL_THEMES;
  let current = null;
  let lastId = '';
  let copiedTimer = 0;
  let firstRoute = true;
  const refs = {};

  function boot() {
    const texts = ns.texts && typeof ns.texts === 'object' ? ns.texts : {};
    const config = ns.content.normalizeConfig(ns.config, Object.keys(texts).length ? Object.keys(texts) : ['nl']).config;
    ns.ui.setTexts(
      texts[config.language] || texts.nl || {},
      {
        title: config.applicationTitle,
        discipline: config.discipline,
        organization: config.organizationName,
        audience: config.audienceName,
        eventName: config.eventName,
        eventDates: config.eventDates
      },
      config.debugMode
    );
    document.documentElement.lang = config.language;
    document.documentElement.dataset.theme = config.theme;
    // Wie hier komt, scande een QR-code met de eigen telefoon: altijd 'eigen apparaat', nooit kiosk.
    const deviceConfig = Object.freeze(Object.assign({}, config, { kioskMode: false }));
    ns.central.init({ config: deviceConfig, queue: false });
    loadEntries();

    const byId = (id) => document.getElementById(id);
    Object.assign(refs, {
      list: byId('pp-list'),
      listTitle: byId('pp-list-title'),
      kinds: byId('pp-kinds'),
      snacks: byId('pp-snacks'),
      items: byId('pp-items'),
      inspiration: byId('pp-inspiration'),
      themes: byId('pp-themes'),
      groups: byId('pp-groups'),
      empty: byId('pp-empty'),
      detail: byId('pp-detail'),
      back: byId('pp-back'),
      number: byId('pp-number'),
      category: byId('pp-category'),
      title: byId('pp-title'),
      subtitle: byId('pp-subtitle'),
      meta: byId('pp-meta'),
      prompt: byId('pp-prompt'),
      note: byId('pp-note'),
      copy: byId('pp-copy'),
      copyLabel: byId('pp-copy-label'),
      tipBlock: byId('pp-tip-block'),
      tip: byId('pp-tip'),
      share: byId('pp-share'),
      demo: byId('pp-demo')
    });

    byId('pp-org').textContent = config.organizationName || config.applicationTitle;
    byId('pp-event').textContent = config.eventName ? t('eventLabel') : '';
    byId('pp-app').href = appHref() + '#/';
    ns.ui.applyStaticTexts(document);

    ns.promptMail.init({ config: deviceConfig });
    refs.copy.addEventListener('click', copyPrompt);
    refs.share.addEventListener('click', sharePrompt);
    refs.kinds.addEventListener('click', onKindClick);
    refs.themes.addEventListener('click', onThemeClick);
    renderSnacks();
    renderInspiration();
    window.addEventListener('hashchange', route);
    route();
    document.documentElement.classList.remove('no-js');
  }

  /** Snacks en inspiratieprompts in één vorm, zodat de detailweergave ze gelijk behandelt. */
  function loadEntries() {
    const allSnacks = ns.content.normalizeSnacks(ns.snacks).snacks;
    const inspiration = ns.content.normalizeInspiration(
      ns.inspiration,
      allSnacks.map((snack) => snack.id)
    );
    inspiration.issues.forEach((entry) => console.warn('[AI Snackbar] ' + entry.message));
    categories = inspiration.categories;

    // Snacks die op 'binnenkort' staan, horen nog niet op de promptpagina.
    lists.snacks = allSnacks
      .filter((snack) => snack.available)
      .map((snack) => ({
        id: snack.id,
        kind: 'snacks',
        number: snack.number,
        title: snack.title,
        subtitle: snack.subtitle,
        listSubtitle: snack.subtitle,
        usefulFor: snack.audience.join(' · '),
        eyebrow: t('cardNumber', { number: snack.number }),
        label: snack.category,
        accent: snack.accent,
        impact: 0,
        license: snack.license,
        prompt: snack.prompt,
        promptNote: snack.promptNote,
        tip: snack.tip,
        // Naar de snackbar, direct bij deze snack (alleen als er een demo is)
        demoHref: snack.video || snack.demo ? appHref() + '#/snack/' + encodeURIComponent(snack.id) : ''
      }));
    lists.inspiratie = inspiration.prompts.map((item) => ({
      id: item.id,
      kind: 'inspiratie',
      title: item.title,
      // Lijst: de korte omschrijving; bij de prompt zelf: de 'Wist je dat'-zin (zoals op het kaartje)
      subtitle: item.didYouKnow,
      listSubtitle: item.description,
      usefulFor: item.usefulFor,
      eyebrow: t('promptsInspirationEyebrow'),
      label: item.category.label,
      category: item.category,
      accent: item.category.accent,
      impact: item.impact,
      license: item.license,
      prompt: item.prompt,
      promptNote: item.promptNote,
      tip: item.tip,
      demoHref: ''
    }));
    KINDS.forEach((key) => lists[key].forEach((entry) => entries.set(entry.id, entry)));
  }

  /**
   * De snackbar zelf; vanaf een lokaal bestand opent '../' een mapoverzicht in plaats van de app.
   * '?kiosk=0' (lokaal testen als eigen apparaat) gaat mee, anders wordt de snackbar op localhost een kiosk.
   */
  function appHref() {
    return (window.location.protocol === 'file:' ? '../index.html' : '../') + window.location.search;
  }

  /* ---- Routes ------------------------------------------------------------- */
  function route() {
    const id = decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).trim();
    const entry = entries.get(id);
    if (entry) {
      showDetail(entry);
    } else {
      if (id && !KINDS.includes(id)) {
        toast(t('promptsNotFound'), { tone: 'warning' });
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      showList(KINDS.includes(id) ? id : defaultKind());
    }
    firstRoute = false;
  }

  function defaultKind() {
    return lists.snacks.length || !lists.inspiratie.length ? 'snacks' : 'inspiratie';
  }

  /* ---- Lijsten ------------------------------------------------------------ */
  function renderSnacks() {
    refs.items.replaceChildren(
      ...lists.snacks.map((entry) =>
        el(
          'li',
          {},
          el('a', { className: 'prompts-item accent-' + entry.accent, attrs: { href: '#' + entry.id } }, [
            el('span', { className: 'prompts-item__number', text: entry.number }),
            itemBody(entry),
            icon('arrow-right')
          ])
        )
      )
    );
    refs.kinds.hidden = !lists.snacks.length || !lists.inspiratie.length;
    document.getElementById('pp-count-snacks').textContent = String(lists.snacks.length);
    document.getElementById('pp-count-inspiration').textContent = String(lists.inspiratie.length);
  }

  function renderInspiration() {
    const total = lists.inspiratie.length;
    refs.themes.replaceChildren(
      themeButton(ALL_THEMES, t('promptsThemeAll'), total, ''),
      ...categories.map((category) =>
        themeButton(category.id, category.label, countIn(category), 'accent-' + category.accent)
      )
    );
    refs.groups.replaceChildren(
      ...categories.map((category) =>
        el('section', { className: 'prompts-group accent-' + category.accent, dataset: { category: category.id } }, [
          el('h2', { className: 'prompts-group__title', text: category.label }),
          el(
            'ul',
            { className: 'prompts__list', attrs: { role: 'list' } },
            lists.inspiratie
              .filter((entry) => entry.category === category)
              .map((entry) =>
                el(
                  'li',
                  {},
                  el('a', { className: 'prompts-item prompts-item--inspiration', attrs: { href: '#' + entry.id } }, [
                    el('span', { className: 'prompts-item__mark' }, icon('bulb')),
                    itemBody(entry),
                    icon('arrow-right')
                  ])
                )
              )
          )
        ])
      )
    );
  }

  /** Titel, eventueel een korte omschrijving, en een regel met impact en (alleen als die nodig is) 'Licentie'. */
  function itemBody(entry) {
    const meta = [
      entry.impact ? el('span', { className: 'prompts-impact' }, impactNodes(entry.impact)) : null,
      entry.license
        ? el('span', { className: 'badge badge--license' }, [
            icon('key'),
            t('cardLicense'),
            el('span', { className: 'sr-only', text: ' ' + t('cardLicenseSr') })
          ])
        : null
    ].filter(Boolean);
    return el('span', { className: 'prompts-item__body' }, [
      el('span', { className: 'prompts-item__title', text: entry.title }),
      entry.listSubtitle ? el('span', { className: 'prompts-item__subtitle', text: entry.listSubtitle }) : null,
      meta.length ? el('span', { className: 'prompts-item__meta' }, meta) : null
    ]);
  }

  /** Detail: licentie altijd uitgeschreven, ook als die níet nodig is. */
  function licenseLine(required) {
    return el('span', { className: 'prompts-license' }, [
      icon(required ? 'key' : 'check'),
      el('span', { className: 'sr-only', text: t('licenseLabel') + ': ' }),
      t(required ? 'licenseRequired' : 'licenseBasic')
    ]);
  }

  /** 'Impact' met drie stippen (gevuld = niveau), plus de waarde voor schermlezers. */
  function impactNodes(rank) {
    return [
      el('span', { text: t('promptsImpactLabel') }),
      levelDots(rank),
      el('span', { className: 'sr-only', text: ' ' + t('promptsImpactValue', { level: rank }) })
    ];
  }

  function themeButton(id, label, count, accentClass) {
    return el(
      'button',
      {
        className: ('prompts__theme ' + accentClass).trim(),
        attrs: { type: 'button', 'aria-pressed': String(id === theme) },
        dataset: { category: id }
      },
      [el('span', { text: label }), el('span', { className: 'prompts__count', text: String(count) })]
    );
  }

  function countIn(category) {
    return lists.inspiratie.filter((entry) => entry.category === category).length;
  }

  function onKindClick(event) {
    const button = event.target.closest('button[data-kind]');
    if (!button || button.dataset.kind === kind) return;
    window.history.replaceState(null, '', '#' + button.dataset.kind);
    setKind(button.dataset.kind);
  }

  function onThemeClick(event) {
    const button = event.target.closest('button[data-category]');
    if (button) setTheme(button.dataset.category);
  }

  function setKind(value) {
    kind = lists[value] && lists[value].length ? value : defaultKind();
    refs.kinds.querySelectorAll('[data-kind]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.kind === kind));
    });
    refs.snacks.hidden = kind !== 'snacks';
    refs.inspiration.hidden = kind !== 'inspiratie';
    refs.empty.hidden = lists.snacks.length + lists.inspiratie.length > 0;
  }

  function setTheme(value) {
    theme = value === ALL_THEMES || categories.some((category) => category.id === value) ? value : ALL_THEMES;
    refs.themes.querySelectorAll('button[data-category]').forEach((button) => {
      const pressed = button.dataset.category === theme;
      button.setAttribute('aria-pressed', String(pressed));
      if (pressed) revealInRow(button);
    });
    refs.groups.querySelectorAll('.prompts-group').forEach((group) => {
      group.hidden = theme !== ALL_THEMES && group.dataset.category !== theme;
    });
  }

  /** Telefoon: de gekozen themaknop in de veegbare rij in beeld houden (alleen opzij, niet de pagina). */
  function revealInRow(button) {
    const row = refs.themes;
    const rowBox = row.getBoundingClientRect();
    const box = button.getBoundingClientRect();
    if (box.left >= rowBox.left && box.right <= rowBox.right) return;
    row.scrollLeft += box.left - rowBox.left - parseFloat(window.getComputedStyle(row).paddingLeft || '0');
  }

  function showList(value) {
    current = null;
    ns.promptMail.unmount();
    resetCopyButton();
    setKind(value);
    // Terug van een prompt: die prompt moet in de lijst te zien zijn.
    const origin = entries.get(lastId);
    if (origin && origin.category && theme !== ALL_THEMES && theme !== origin.category.id) setTheme(ALL_THEMES);
    refs.detail.hidden = true;
    refs.list.hidden = false;
    document.title = t('promptsDocumentTitle').replace(/\s+/g, ' ').trim();

    const originLink = origin && origin.kind === kind ? refs.list.querySelector(`a[href="#${origin.id}"]`) : null;
    if (firstRoute) {
      window.scrollTo(0, 0);
    } else if (originLink) {
      // Terug naar de prompt van herkomst
      originLink.focus({ preventScroll: true });
      originLink.scrollIntoView({ block: 'center' });
    } else {
      window.scrollTo(0, 0);
      refs.listTitle.focus({ preventScroll: true });
    }
  }

  /* ---- Eén prompt --------------------------------------------------------- */
  function showDetail(entry) {
    current = entry;
    lastId = entry.id;
    resetCopyButton();
    refs.detail.className = 'prompts__view prompts-detail accent-' + entry.accent;
    refs.back.href = '#' + entry.kind;
    refs.number.textContent = entry.eyebrow;
    refs.category.textContent = entry.label ? '· ' + entry.label : '';
    refs.title.textContent = entry.title;
    refs.subtitle.textContent = entry.subtitle;
    refs.subtitle.hidden = !entry.subtitle;
    const meta = [
      entry.impact ? el('span', { className: 'prompts-impact' }, impactNodes(entry.impact)) : null,
      entry.license === null ? null : licenseLine(entry.license),
      entry.usefulFor
        ? el('span', { className: 'prompts-useful' }, [el('strong', { text: t('promptsUsefulFor') }), ' ' + entry.usefulFor])
        : null
    ].filter(Boolean);
    refs.meta.replaceChildren(...meta);
    refs.meta.hidden = !meta.length;

    const hasPrompt = Boolean(entry.prompt);
    refs.prompt.textContent = hasPrompt ? entry.prompt : t('promptsPromptMissing');
    refs.prompt.classList.toggle('is-placeholder', !hasPrompt);
    refs.note.textContent = entry.promptNote;
    refs.note.hidden = !entry.promptNote;
    refs.copy.hidden = !hasPrompt;
    refs.share.hidden = !hasPrompt || typeof navigator.share !== 'function';
    refs.tip.textContent = entry.tip;
    refs.tipBlock.hidden = !entry.tip;
    ns.promptMail.mount(entry);
    refs.demo.href = entry.demoHref || '../';
    refs.demo.hidden = !entry.demoHref;

    refs.list.hidden = true;
    refs.detail.hidden = false;
    document.title = `${entry.title} · ${t('promptsDocumentTitle')}`.replace(/\s+/g, ' ').trim();
    window.scrollTo(0, 0);
    // Bij het openen via een QR-code de focus laten staan (de voorleesvolgorde klopt al).
    if (!firstRoute) refs.title.focus({ preventScroll: true });
  }

  /* ---- Kopiëren en delen ---------------------------------------------------- */
  async function copyPrompt() {
    if (!current || !current.prompt) return;
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(current.prompt);
        copied = true;
      }
    } catch (error) {
      console.info('[AI Snackbar] Clipboard-API geweigerd.', error);
    }
    if (!copied) {
      selectPrompt();
      toast(t('copyFailed'), { tone: 'warning', icon: 'copy', duration: 6000 });
      return;
    }
    window.clearTimeout(copiedTimer);
    refs.copy.classList.add('is-copied');
    setIcon(refs.copy.querySelector('svg'), 'check');
    refs.copyLabel.textContent = t('copied');
    copiedTimer = window.setTimeout(resetCopyButton, COPIED_MS);
  }

  function resetCopyButton() {
    window.clearTimeout(copiedTimer);
    refs.copy.classList.remove('is-copied');
    setIcon(refs.copy.querySelector('svg'), 'copy');
    refs.copyLabel.textContent = t('copyPrompt');
  }

  function selectPrompt() {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(refs.prompt);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /** Telefoon: via het deelmenu naar je eigen mail, notities of chat. */
  async function sharePrompt() {
    if (!current || typeof navigator.share !== 'function') return;
    try {
      await navigator.share({ title: current.title, text: current.prompt, url: window.location.href });
    } catch (error) {
      // Geannuleerd: niets aan de hand.
    }
  }

  try {
    boot();
  } catch (error) {
    console.error('[AI Snackbar] Promptpagina kon niet starten:', error);
  }
})(window.AISnackbar);
