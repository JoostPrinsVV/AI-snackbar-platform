/* ==========================================================================
   Promptpagina (prompts/index.html)
   --------------------------------------------------------------------------
   Een lichte, losse pagina voor de QR-codes op de kaartjes bij de stand:
     prompts/             alle prompts
     prompts/#snack-01    één prompt; vast adres per snack (het id uit
                          data/snacks.js). Verander een id niet meer nadat de
                          QR-codes gedrukt zijn.
   Leest dezelfde instellingen, teksten en snacks als de snackbar, met dezelfde
   controle (js/content.js). Geen opslag, geen tellers, geen verbindingen.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, setIcon, t, toast } = ns.ui;
  const COPIED_MS = 2400;

  let snacks = [];
  let current = null;
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
    // Snacks die op 'binnenkort' staan, horen nog niet op de promptpagina.
    snacks = ns.content.normalizeSnacks(ns.snacks).snacks.filter((snack) => snack.available);

    const byId = (id) => document.getElementById(id);
    Object.assign(refs, {
      list: byId('pp-list'),
      listTitle: byId('pp-list-title'),
      items: byId('pp-items'),
      empty: byId('pp-empty'),
      detail: byId('pp-detail'),
      number: byId('pp-number'),
      category: byId('pp-category'),
      title: byId('pp-title'),
      subtitle: byId('pp-subtitle'),
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
    byId('pp-event').textContent = config.eventName ? t('eventLabel').replace(/\s*·\s*$/, '') : '';
    ns.ui.applyStaticTexts(document);

    refs.copy.addEventListener('click', copyPrompt);
    refs.share.addEventListener('click', sharePrompt);
    renderList();
    window.addEventListener('hashchange', route);
    route();
    document.documentElement.classList.remove('no-js');
  }

  /* ---- Routes ------------------------------------------------------------- */
  function route() {
    const id = decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).trim();
    const snack = id ? snacks.find((item) => item.id === id) : null;
    if (id && !snack) {
      toast(t('promptsNotFound'), { tone: 'warning' });
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (snack) showDetail(snack);
    else showList();
    // Bij het openen via een QR-code de focus laten staan (de voorleesvolgorde klopt al);
    // daarna bij iedere wissel naar de kop van het nieuwe scherm.
    if (!firstRoute) {
      const heading = snack ? refs.title : refs.listTitle;
      heading.focus({ preventScroll: true });
    }
    firstRoute = false;
    window.scrollTo(0, 0);
  }

  /* ---- Alle prompts ------------------------------------------------------- */
  function renderList() {
    refs.items.replaceChildren(
      ...snacks.map((snack) =>
        el(
          'li',
          {},
          el('a', { className: 'prompts-item accent-' + snack.accent, attrs: { href: '#' + snack.id } }, [
            el('span', { className: 'prompts-item__number', text: snack.number }),
            el('span', { className: 'prompts-item__body' }, [
              el('span', { className: 'prompts-item__title', text: snack.title }),
              snack.subtitle ? el('span', { className: 'prompts-item__subtitle', text: snack.subtitle }) : null
            ]),
            icon('arrow-right')
          ])
        )
      )
    );
    refs.empty.hidden = snacks.length > 0;
  }

  function showList() {
    current = null;
    resetCopyButton();
    refs.detail.hidden = true;
    refs.list.hidden = false;
    document.title = t('promptsDocumentTitle').replace(/\s+/g, ' ').trim();
  }

  /* ---- Eén prompt --------------------------------------------------------- */
  function showDetail(snack) {
    current = snack;
    resetCopyButton();
    refs.detail.className = 'prompts__view prompts-detail accent-' + snack.accent;
    refs.number.textContent = t('cardNumber', { number: snack.number });
    refs.category.textContent = snack.category ? '· ' + snack.category : '';
    refs.title.textContent = snack.title;
    refs.subtitle.textContent = snack.subtitle;
    refs.subtitle.hidden = !snack.subtitle;

    const hasPrompt = Boolean(snack.prompt);
    refs.prompt.textContent = hasPrompt ? snack.prompt : t('promptMissing');
    refs.prompt.classList.toggle('is-placeholder', !hasPrompt);
    refs.note.textContent = snack.promptNote;
    refs.note.hidden = !snack.promptNote;
    refs.copy.hidden = !hasPrompt;
    refs.share.hidden = !hasPrompt || typeof navigator.share !== 'function';
    refs.tip.textContent = snack.tip;
    refs.tipBlock.hidden = !snack.tip;

    // Naar de snackbar, direct bij deze snack (alleen als er een demo is)
    refs.demo.href = '../#/snack/' + encodeURIComponent(snack.id);
    refs.demo.hidden = !snack.video && !snack.demo;

    refs.list.hidden = true;
    refs.detail.hidden = false;
    document.title = `${snack.title} · ${t('promptsDocumentTitle')}`.replace(/\s+/g, ' ').trim();
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
