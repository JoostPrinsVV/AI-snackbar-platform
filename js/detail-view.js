/* ==========================================================================
   Snackdetail
   --------------------------------------------------------------------------
   Vult het vaste detailsjabloon uit index.html met de gekozen snack en
   koppelt de speler (video of HTML-demo), de prompt (kopiëren, 'Mail mij')
   en de QR-code.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, setIcon, t, toast, levelDots, imageWithFallback } = ns.ui;
  const COPIED_MS = 2400;

  let config = null;
  let handlers = null;
  let player = null;
  let current = null;
  let copiedTimer = 0;
  let copyBusy = false;
  const refs = {};

  function init(options) {
    config = options.config;
    handlers = options;

    const byId = (id) => document.getElementById(id);
    Object.assign(refs, {
      detail: byId('detail'),
      number: byId('detail-number'),
      category: byId('detail-category'),
      title: byId('detail-title'),
      meta: byId('detail-meta'),
      intro: byId('detail-intro'),
      audience: byId('detail-audience'),
      player: byId('player'),
      play: byId('detail-play'),
      playLabel: byId('detail-play-label'),
      restart: byId('detail-restart'),
      back: byId('detail-back'),
      other: byId('detail-other'),
      surprise: byId('detail-surprise'),
      takeawayTitle: byId('takeaway-title'),
      promptBox: byId('prompt-box'),
      promptText: byId('prompt-text'),
      promptNote: byId('prompt-note'),
      copy: byId('copy-prompt'),
      copyLabel: byId('copy-prompt-label'),
      qrBlock: byId('qr-block'),
      qrCode: byId('qr-code'),
      qrLabel: byId('qr-label'),
      tipBlock: byId('tip-block'),
      tipText: byId('tip-text')
    });

    player = new ns.VideoPlayer(refs.player, {
      volume: options.volume,
      muted: options.muted,
      fullscreenOnPlay: config.fullscreenOnPlay,
      onStateChange: (state, previous) => {
        renderPlayButton(state);
        if (typeof options.onPlayerState === 'function') options.onPlayerState(state, previous);
      },
      onEndAction: (action) => {
        if (action === 'takeaway') focusTakeaway();
        if (action === 'other') handlers.onBack();
      },
      onVolumeChange: options.onVolumeChange,
      onActivity: options.onActivity
    });
    // Direct na het kijken is hét moment om te vragen hoe de snack smaakte.
    if (ns.feedback.isRatingEnabled()) player.setEndcardExtra(ns.feedback.createEndcardRating());

    refs.play.addEventListener('click', () => {
      if (player.state === 'playing') {
        player.pause();
        return;
      }
      refs.player.scrollIntoView({ block: 'nearest', behavior: ns.a11y.prefersReducedMotion() ? 'auto' : 'smooth' });
      player.play();
    });
    refs.restart.addEventListener('click', () => player.restart());
    refs.back.addEventListener('click', () => handlers.onBack());
    refs.other.addEventListener('click', () => handlers.onBack());
    refs.surprise.addEventListener('click', () => handlers.onSurprise(current && current.id));
    refs.copy.addEventListener('click', copyPrompt);

    refs.copy.hidden = !canCopy();
    refs.qrBlock.hidden = !showQr();
  }

  /** Kopiëren heeft alleen zin op een eigen telefoon of laptop, niet op een gedeelde tablet. */
  function canCopy() {
    return config.enablePromptCopy && !config.kioskMode;
  }

  /** De QR-code is juist voor de gedeelde tablet: op je eigen telefoon heb je de prompt al. */
  function showQr() {
    return config.enableQrCodes && config.kioskMode;
  }

  /* ---- Tonen / verbergen --------------------------------------------------- */
  function show(snack) {
    current = snack;
    refs.detail.className = 'detail container accent-' + snack.accent;
    refs.number.textContent = t('cardNumber', { number: snack.number });
    refs.category.textContent = snack.category;
    refs.title.textContent = snack.title;
    refs.intro.textContent = snack.intro;
    refs.intro.hidden = !snack.intro;

    renderMeta(snack);
    renderTakeaway(snack);
    resetCopyButton();
    ns.feedback.mount(snack);
    ns.promptMail.mount(snack);

    player.load(snack, { demoMode: config.demoMode });
    renderPlayButton(player.state);
  }

  function hide() {
    player.unload();
    resetCopyButton();
    ns.feedback.unmount();
    ns.promptMail.unmount();
    current = null;
  }

  function currentId() {
    return current ? current.id : null;
  }

  function renderMeta(snack) {
    const items = [];
    if (snack.duration) {
      items.push(el('li', { className: 'meta' }, [icon('clock'), el('span', { className: 'sr-only', text: t('durationLabel') + ': ' }), snack.duration]));
    }
    if (snack.level) {
      items.push(el('li', { className: 'meta' }, [levelDots(snack.levelRank), el('span', { className: 'sr-only', text: t('levelLabel') + ': ' }), snack.level]));
    }
    refs.meta.replaceChildren(...items);
    refs.meta.hidden = !items.length;

    refs.audience.replaceChildren(icon('users'), el('strong', { text: t('audienceLabel') }), ' ', snack.audience.join(' · '));
    refs.audience.hidden = !snack.audience.length;
  }

  function renderTakeaway(snack) {
    const hasPrompt = Boolean(snack.prompt);
    refs.promptText.textContent = hasPrompt ? snack.prompt : t('promptMissing');
    refs.promptText.classList.toggle('is-placeholder', !hasPrompt);
    refs.promptNote.textContent = snack.promptNote;
    refs.promptNote.hidden = !snack.promptNote;
    refs.copy.hidden = !canCopy() || !hasPrompt;
    refs.promptText.scrollTop = 0;

    if (showQr()) {
      refs.qrCode.replaceChildren(imageWithFallback(snack.qrCode, t('qrAlt', { title: snack.title }), qrPlaceholder));
      refs.qrLabel.textContent = snack.qrLabel || t('qrLabelDefault');
    }

    refs.tipText.textContent = snack.tip;
    refs.tipBlock.hidden = !snack.tip;
  }

  function qrPlaceholder() {
    return el('div', { className: 'qr-placeholder' }, [icon('qr'), el('span', { text: t('qrPlaceholder') })]);
  }

  function renderPlayButton(state) {
    const unavailable = state === 'demo' || state === 'unavailable';
    const svg = refs.play.querySelector('svg');
    if (state === 'playing') {
      setIcon(svg, 'pause');
      refs.playLabel.textContent = t('detailPause');
    } else {
      setIcon(svg, 'play');
      refs.playLabel.textContent = state === 'paused' ? t('detailResume') : t('detailPlay');
    }
    // Blijft klikbaar (geeft dan een vriendelijke melding), maar oogt uitgeschakeld.
    refs.play.setAttribute('aria-disabled', String(unavailable));
    refs.restart.setAttribute('aria-disabled', String(unavailable));
  }

  function focusTakeaway() {
    const reduced = ns.a11y.prefersReducedMotion();
    refs.takeawayTitle.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    ns.a11y.focusElement(refs.takeawayTitle);
  }

  /* ---- Prompt kopiëren ------------------------------------------------------ */
  async function copyPrompt() {
    if (!current || !current.prompt || copyBusy) return;
    copyBusy = true;
    const text = current.prompt;
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (error) {
      console.info('[AI Snackbar] Clipboard-API geweigerd, probeer alternatief.', error);
    }
    if (!copied) copied = legacyCopy(text);

    if (copied) {
      showCopied();
    } else {
      selectPromptText();
      toast(t('copyFailed'), { tone: 'warning', icon: 'copy', duration: 6000 });
    }
    copyBusy = false;
  }

  function legacyCopy(text) {
    const area = el('textarea', { className: 'sr-only', attrs: { readonly: true, 'aria-hidden': 'true', tabindex: '-1' } });
    area.value = text;
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (error) {
      ok = false;
    }
    area.remove();
    refs.copy.focus({ preventScroll: true });
    return ok;
  }

  function selectPromptText() {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(refs.promptText);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function showCopied() {
    window.clearTimeout(copiedTimer);
    refs.copy.classList.remove('is-copied');
    void refs.copy.offsetWidth; // herstart de korte bevestigingsanimatie
    refs.copy.classList.add('is-copied');
    setIcon(refs.copy.querySelector('svg'), 'check');
    refs.copyLabel.textContent = t('copied');
    ns.a11y.announce(t('copied'));
    copiedTimer = window.setTimeout(resetCopyButton, COPIED_MS);
  }

  function resetCopyButton() {
    window.clearTimeout(copiedTimer);
    refs.copy.classList.remove('is-copied');
    setIcon(refs.copy.querySelector('svg'), 'copy');
    refs.copyLabel.textContent = t('copyPrompt');
  }

  ns.detailView = {
    init,
    show,
    hide,
    currentId
  };
})(window.AISnackbar);
