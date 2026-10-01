/* ==========================================================================
   Snackkaart (hoofdscherm)
   --------------------------------------------------------------------------
   Bouwt de kaarten op uit data/snacks.js. Het aantal kolommen wordt
   automatisch gekozen: zo min mogelijk rijen, zo min mogelijk lege plekken,
   en nooit smaller dan --card-min-width (zie css/variables.css).
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, t, levelDots, imageWithFallback } = ns.ui;
  const MAX_COLUMNS = 4;
  const ENTRANCE_MS = 1400;

  let grid = null;
  let stateBox = null;
  let onSelect = null;
  let savedScroll = 0;
  let entranceTimer = 0;
  let layoutFrame = 0;
  let lastLayoutKey = '';

  function init(options) {
    grid = options.grid;
    stateBox = options.stateBox;
    onSelect = options.onSelect;
    // Opnieuw indelen bij draaien van de tablet of wijzigen van het venster.
    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('orientationchange', scheduleLayout);
    // Zodra de lokale fonts geladen zijn, kan de kop iets van hoogte veranderen.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleLayout);
  }

  /** Eén keer per frame, zodat snel achter elkaar komende resize-events geen werk opstapelen. */
  function scheduleLayout() {
    if (layoutFrame) return;
    layoutFrame = window.requestAnimationFrame(() => {
      layoutFrame = 0;
      updateColumns();
    });
  }

  /**
   * @param {Array} snacks          Gevalideerde snacks
   * @param {{loadFailed:boolean, detail:string}} status
   */
  function render(snacks, status) {
    grid.replaceChildren();
    lastLayoutKey = '';
    if (!snacks.length) {
      renderState(status && status.loadFailed ? 'error' : 'empty', status && status.detail);
      return;
    }
    stateBox.hidden = true;
    grid.hidden = false;
    snacks.forEach((snack, index) => grid.append(renderCard(snack, index)));
    updateColumns();
    playEntrance();
  }

  function renderCard(snack, index) {
    const item = el('li', { className: 'snack-grid__item' });
    item.style.setProperty('--i', String(index));

    const card = el('a', {
      className: 'snack-card accent-' + snack.accent + (snack.available ? '' : ' is-soon'),
      attrs: {
        href: ns.navigation.hrefForSnack(snack.id),
        draggable: 'false',
        'aria-disabled': snack.available ? null : 'true'
      },
      dataset: { snackId: snack.id }
    });

    const top = el('div', { className: 'snack-card__top' }, [
      el('span', { className: 'snack-card__icon', attrs: { 'aria-hidden': 'true' } }, imageWithFallback(snack.icon, '', () => icon('cloche'))),
      el('span', { className: 'snack-card__badges' }, [
        snack.featured ? badge('featured', 'sparkle', t('cardFeatured')) : null,
        snack.available ? null : badge('soon', 'hourglass', t('cardSoon')),
        badge('viewed', 'check', t('cardViewed'), true)
      ]),
      el('span', { className: 'snack-card__number', attrs: { 'aria-hidden': 'true' } }, [
        el('small', { text: t('cardNumberLabel') }),
        el('strong', { text: snack.number })
      ])
    ]);

    const heading = el('div', { className: 'snack-card__heading' }, [
      el('h3', { className: 'snack-card__title', text: snack.title }),
      el('span', { className: 'snack-card__leader', attrs: { 'aria-hidden': 'true' } }),
      snack.duration ? el('span', { className: 'snack-card__duration' }, [icon('clock'), snack.duration]) : null
    ]);

    const body = el('div', { className: 'snack-card__body' }, [
      heading,
      snack.subtitle ? el('p', { className: 'snack-card__subtitle', text: snack.subtitle }) : null,
      snack.available ? null : el('span', { className: 'sr-only', text: t('cardSoonSr') })
    ]);

    const chips = el('ul', { className: 'chips', attrs: { role: 'list' } }, [
      snack.category ? el('li', { className: 'chip chip--accent', text: snack.category }) : null,
      snack.level ? el('li', { className: 'chip' }, [levelDots(snack.levelRank), snack.level]) : null
    ]);

    const footer = el('div', { className: 'snack-card__footer' }, [
      chips,
      el('span', { className: 'snack-card__go', attrs: { 'aria-hidden': 'true' } }, icon(snack.available ? 'arrow-right' : 'hourglass'))
    ]);

    card.append(top, body, footer);
    card.addEventListener('click', (event) => {
      // Via JS navigeren, zodat 'terug' de geschiedenis netjes opruimt.
      event.preventDefault();
      onSelect(snack);
    });
    // Geen contextmenu bij lang indrukken op touch.
    card.addEventListener('contextmenu', (event) => event.preventDefault());

    item.append(card);
    return item;
  }

  function badge(kind, iconName, label, hidden) {
    return el('span', { className: 'badge badge--' + kind, attrs: { hidden: Boolean(hidden) } }, [icon(iconName), label]);
  }

  function renderState(kind, detail) {
    grid.hidden = true;
    stateBox.hidden = false;
    const isError = kind === 'error';
    const parts = [
      el('span', { className: 'menu-state__icon', attrs: { 'aria-hidden': 'true' } }, icon(isError ? 'alert' : 'cloche')),
      el('h3', { className: 'menu-state__title', text: t(isError ? 'loadErrorTitle' : 'emptyTitle') }),
      el('p', { text: t(isError ? 'loadErrorText' : 'emptyText') }),
      detail ? el('p', { className: 'menu-state__detail', text: detail }) : null
    ];
    // replaceChildren zou null als tekst "null" tonen
    stateBox.replaceChildren(...parts.filter(Boolean));
  }

  /* ---- Kolommen en rijhoogte ----------------------------------------------
     1. Kolommen: zo min mogelijk rijen, zo min mogelijk lege plekken.
     2. Rijhoogte: de kaarten vullen samen precies de rest van het scherm
        (--fit-row-height), zodat alle snacks in één oogopslag zichtbaar zijn.
        Past het niet, dan bepaalt de inhoud de hoogte en kan de pagina scrollen. */
  function updateColumns() {
    if (!grid || grid.hidden) return;
    const count = grid.children.length;
    if (!count) return;
    const width = grid.clientWidth;
    if (!width) return;
    const rootStyle = getComputedStyle(document.documentElement);
    const gridStyle = getComputedStyle(grid);
    const minWidth = parseFloat(rootStyle.getPropertyValue('--card-min-width')) || 300;
    const columnGap = parseFloat(gridStyle.columnGap) || 16;
    const rowGap = parseFloat(gridStyle.rowGap) || columnGap;
    const maxColumns = Math.max(1, Math.min(MAX_COLUMNS, Math.floor((width + columnGap) / (minWidth + columnGap))));
    const columns = bestColumns(count, maxColumns);
    const rows = Math.ceil(count / columns);

    const menu = grid.closest('.menu');
    const bottomSpace = menu ? parseFloat(getComputedStyle(menu).paddingBottom) || 0 : 0;
    const gridTop = grid.getBoundingClientRect().top + window.scrollY;
    const available = window.innerHeight - gridTop - bottomSpace;
    const rowHeight = Math.floor((available - rowGap * (rows - 1)) / rows);

    const layoutKey = [columns, rowHeight].join('|');
    if (layoutKey === lastLayoutKey) return;
    lastLayoutKey = layoutKey;
    grid.style.setProperty('--cols', String(columns));
    grid.style.setProperty('--fit-row-height', Math.max(0, rowHeight) + 'px');
  }

  /** Kiest het aantal kolommen met de minste rijen en daarna de minste lege plekken. */
  function bestColumns(count, maxColumns) {
    let best = 1;
    let bestRows = Infinity;
    let bestEmpty = Infinity;
    for (let columns = 1; columns <= Math.min(maxColumns, count); columns += 1) {
      const rows = Math.ceil(count / columns);
      const empty = rows * columns - count;
      if (rows < bestRows || (rows === bestRows && empty < bestEmpty)) {
        best = columns;
        bestRows = rows;
        bestEmpty = empty;
      }
    }
    return best;
  }

  /* ---- Status en positie --------------------------------------------------- */
  function refreshBadges() {
    grid.querySelectorAll('.snack-card').forEach((card) => {
      const viewed = ns.storage.isViewedThisSession(card.dataset.snackId);
      const viewedBadge = card.querySelector('.badge--viewed');
      if (viewedBadge) viewedBadge.hidden = !viewed;
    });
  }

  function playEntrance() {
    window.clearTimeout(entranceTimer);
    grid.classList.remove('is-entering');
    void grid.offsetWidth; // herstart de animatie
    grid.classList.add('is-entering');
    entranceTimer = window.setTimeout(() => grid.classList.remove('is-entering'), ENTRANCE_MS);
  }

  function cardFor(snackId) {
    if (!snackId) return null;
    return grid.querySelector('[data-snack-id="' + CSS.escape(snackId) + '"]');
  }

  /** Een overgangsnaam mag maar op één element tegelijk staan (bijv. bij snel tikken). */
  function clearTransitionNames() {
    grid.querySelectorAll('.snack-card').forEach((card) => card.style.removeProperty('view-transition-name'));
  }

  function saveScroll() {
    savedScroll = window.scrollY;
  }

  function restoreScroll() {
    window.scrollTo(0, savedScroll);
  }

  function resetScroll() {
    savedScroll = 0;
  }

  ns.menuView = {
    init,
    render,
    refreshBadges,
    playEntrance,
    cardFor,
    clearTransitionNames,
    saveScroll,
    restoreScroll,
    resetScroll,
    updateColumns
  };
})(window.AISnackbar);
