/* ==========================================================================
   Feedback: 'Hoe smaakte deze snack?' en een anonieme opmerking of vraag
   --------------------------------------------------------------------------
   - Beoordeling met drie smileys. Per bezoeker (sessie) telt één stem per
     snack; een andere smiley kiezen verplaatst die stem.
   - Opmerking of vraag: anoniem, maximaal commentMaxLength tekens.
   Alles wordt op dit apparaat bewaard (js/storage.js) en, als de centrale
   opslag is ingesteld, ook anoniem naar Supabase gestuurd (js/central.js).
   Het admin-dashboard (js/dashboard.js) toont het en exporteert het.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, t, toast } = ns.ui;

  const RATINGS = [
    { value: 'happy', icon: 'face-happy', label: 'ratingHappy' },
    { value: 'neutral', icon: 'face-neutral', label: 'ratingNeutral' },
    { value: 'sad', icon: 'face-sad', label: 'ratingSad' }
  ];
  // Stuurtekens (behalve regeleinde en tab) horen niet in een opmerking.
  const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

  let config = null;
  let current = null;
  const refs = {};
  const widgets = [];
  const sessionRatings = new Map();

  function init(options) {
    config = options.config;
    const byId = (id) => document.getElementById(id);
    Object.assign(refs, {
      section: byId('feedback'),
      ratingBlock: byId('feedback-rating-block'),
      rating: byId('feedback-rating'),
      form: byId('feedback-form'),
      text: byId('feedback-text'),
      counter: byId('feedback-counter')
    });

    refs.section.hidden = !config.enableRatings && !config.enableComments;
    refs.ratingBlock.hidden = !config.enableRatings;
    refs.form.hidden = !config.enableComments;

    if (config.enableRatings) renderRating(refs.rating, false);
    if (config.enableComments) {
      refs.text.maxLength = maxLength();
      refs.text.addEventListener('input', updateCounter);
      refs.form.addEventListener('submit', submitComment);
      updateCounter();
    }
  }

  function maxLength() {
    return Math.floor(config.commentMaxLength);
  }

  function isRatingEnabled() {
    return Boolean(config && config.enableRatings);
  }

  /* ---- Beoordeling --------------------------------------------------------- */
  /**
   * Bouwt drie smileyknoppen. Op het eindscherm van de video (thanks gegeven)
   * komen ze groot in beeld, met een bedankje eronder.
   */
  function renderRating(container, thanks) {
    const onEndcard = Boolean(thanks);
    const buttons = RATINGS.map((option) => {
      const button = el(
        'button',
        {
          className: 'rating__option rating__option--' + option.value,
          attrs: { type: 'button', 'aria-pressed': 'false' },
          dataset: { value: option.value },
          on: { click: () => rate(option.value, onEndcard) }
        },
        [icon(option.icon), el('span', { className: 'rating__label', text: t(option.label) }), el('span', { className: 'rating__check', attrs: { 'aria-hidden': 'true' } }, icon('check'))]
      );
      return button;
    });
    container.classList.add('rating');
    container.classList.toggle('rating--endcard', onEndcard);
    container.replaceChildren(...buttons);
    widgets.push({ container, buttons, thanks: thanks || null });
    return container;
  }

  /** Beoordeling op het eindscherm van de video: vraag, grote smileys en een bedankje. */
  function createEndcardRating() {
    const row = el('div', { attrs: { role: 'group', 'aria-label': t('feedbackTitle') } });
    // Bedankje in beeld: de gewone meldingen onderin zijn bij volledig scherm niet te zien.
    const thanks = el('p', { className: 'player__endcard-thanks', attrs: { role: 'status' } });
    renderRating(row, thanks);
    // De vraag krijgt de focus als de video klaar is: zo lijkt geen smiley al gekozen.
    const question = el('p', { className: 'player__endcard-question', text: t('endcardQuestion'), attrs: { tabindex: '-1' }, dataset: { endcardFocus: '' } });
    return el('div', { className: 'player__endcard-rating' }, [question, row, thanks]);
  }

  function rate(value, fromEndcard) {
    if (!current || !config.enableRatings) return;
    const snackId = current.id;
    const previous = sessionRatings.get(snackId);
    if (previous !== value) {
      const all = ns.storage.get('ratings', {});
      const entry = all[snackId] || { happy: 0, neutral: 0, sad: 0 };
      if (previous && entry[previous] > 0) entry[previous] -= 1;
      entry[value] += 1;
      all[snackId] = entry;
      ns.storage.set('ratings', all);
      sessionRatings.set(snackId, value);
      // Centraal telt per bezoeker de laatste keuze (zelfde sessie = verplaatste stem).
      ns.central.rate(snackId, value);
      refresh();
    }
    // Het eindscherm bedankt zelf (in beeld); onder de video volstaat een melding.
    if (!fromEndcard) toast(t('ratingThanks'), { tone: 'success', icon: 'face-happy' });
  }

  function refresh() {
    const selected = current ? sessionRatings.get(current.id) : null;
    widgets.forEach((widget) => {
      widget.buttons.forEach((button) => {
        const isSelected = button.dataset.value === selected;
        button.setAttribute('aria-pressed', String(isSelected));
        button.classList.toggle('is-selected', isSelected);
      });
      if (widget.thanks) widget.thanks.textContent = selected ? t('endcardThanks') : '';
    });
  }

  /* ---- Opmerking of vraag -------------------------------------------------- */
  function cleanText(value) {
    return String(value || '')
      .replace(/\r\n?/g, '\n')
      .replace(CONTROL_CHARS, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, maxLength());
  }

  /** Lokale tijd, op de minuut nauwkeurig (zegt iets over de pauze, niet over de persoon). */
  function timestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function submitComment(event) {
    event.preventDefault();
    if (!current) return;
    const text = cleanText(refs.text.value);
    if (!text) {
      toast(t('commentEmpty'), { tone: 'warning', icon: 'info' });
      refs.text.focus();
      return;
    }
    const list = ns.storage.get('comments', []);
    list.push({ snackId: current.id, text, at: timestamp() });
    while (list.length > ns.storage.MAX_COMMENTS) list.shift();
    ns.storage.set('comments', list);
    ns.central.comment(current.id, text);
    resetForm();
    // Schermtoetsenbord van de tablet weer laten verdwijnen.
    refs.text.blur();
    toast(t('commentThanks'), { tone: 'success' });
  }

  function updateCounter() {
    refs.counter.textContent = t('commentCounter', { count: refs.text.value.length, max: maxLength() });
  }

  function resetForm() {
    refs.text.value = '';
    updateCounter();
  }

  /* ---- Koppeling met de detailpagina en de kiosk --------------------------- */
  function mount(snack) {
    current = snack;
    resetForm();
    refresh();
  }

  /** Bij verlaten van de snack: niet-verstuurde tekst verdwijnt (privacy volgende bezoeker). */
  function unmount() {
    current = null;
    resetForm();
    refresh();
  }

  /** Nieuwe bezoeker (kioskreset): mag opnieuw beoordelen. */
  function clearSession() {
    sessionRatings.clear();
    refresh();
  }

  ns.feedback = {
    RATINGS,
    init,
    isRatingEnabled,
    createEndcardRating,
    mount,
    unmount,
    clearSession
  };
})(window.AISnackbar);
