/* ==========================================================================
   Admin: dashboard + beheer & test
   --------------------------------------------------------------------------
   De tablets staan standaard in de rol 'Collega' (geen login nodig).
   Admin openen: het tandwiel (Instellingen) in de kopbalk, het woord uit
   adminKeySequence typen, het logo lang indrukken of #/beheer.
   Daarna vraagt de app de toegangscode (adminCode, standaard 1234).
   Let op: de code staat leesbaar in js/config.js. Het is een drempel voor
   bezoekers, geen echte beveiliging. Na ontgrendelen blijft admin open tot
   'Vergrendelen', herladen of een kioskreset.

   De teksten in dit bestand zijn alleen voor de organisatie bedoeld en
   staan daarom niet in data/texts.js.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, toast, formatTime, probeImage, probeVideo, probeDemo, probeTrack } = ns.ui;
  const TOUR_STEP_MS = 3000;
  const CONFIRM_MS = 4000;
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 60000;

  let ctx = null;
  let dialog = null;
  let panel = null;
  let typed = '';
  let tourTimer = 0;
  let tourStopper = null;
  let checkToken = 0;
  let unlocked = false;
  let activeTab = 'dashboard';
  let failedAttempts = 0;
  let resetAttempts = 0;
  let lockedUntil = 0;
  let lockTimer = 0;
  const live = {};
  const code = {};

  /**
   * @param {object} context { config, getSnacks, getInspiration, getIssues, openSnack, goToMenu, version }
   */
  function init(context) {
    ctx = context;
    if (!ctx.config.enableAdmin) return;
    dialog = document.getElementById('admin-dialog');
    panel = document.getElementById('admin-panel');
    ns.a11y.registerDialog(dialog, { onClose: handleClose });
    initCodeDialog();

    document.getElementById('admin-button').addEventListener('click', requestAccess);
    document.addEventListener('keydown', handleKeySequence);
    ns.a11y.onLongPress(document.getElementById('brand'), ctx.config.adminLongPressSeconds * 1000, requestAccess);
  }

  function isEnabled() {
    return Boolean(ctx && ctx.config.enableAdmin);
  }

  function handleKeySequence(event) {
    const target = ctx.config.adminKeySequence;
    if (!target || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target && event.target.closest && event.target.closest('input, textarea, [contenteditable="true"]')) return;
    if (!event.key || event.key.length !== 1) return;
    typed = (typed + event.key.toLowerCase()).slice(-target.length);
    if (typed === target) {
      typed = '';
      requestAccess();
    }
  }

  /** Eén ingang voor alle manieren om admin te openen: eerst de code, dan het scherm. */
  function requestAccess() {
    if (!isEnabled() || dialog.open || code.dialog.open) return;
    if (unlocked || !ctx.config.adminCode) {
      open();
      return;
    }
    openCodeDialog();
  }

  /* ---- Toegangscode ---------------------------------------------------------- */
  function initCodeDialog() {
    Object.assign(code, {
      dialog: document.getElementById('code-dialog'),
      panel: document.getElementById('code-panel'),
      form: document.getElementById('code-form'),
      input: document.getElementById('code-input'),
      dots: document.getElementById('code-dots'),
      error: document.getElementById('code-error'),
      keys: Array.from(document.querySelectorAll('#code-dialog [data-key]'))
    });
    ns.a11y.registerDialog(code.dialog, { onClose: resetCodeInput });
    code.input.maxLength = String(ctx.config.adminCode).length;
    code.input.addEventListener('input', () => {
      code.input.value = code.input.value.replace(/\D/g, '');
      renderDots();
      autoSubmit();
    });
    code.form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitCode();
    });
    code.keys.forEach((key) => {
      key.addEventListener('click', () => {
        if (isLockedOut()) return;
        const value = key.dataset.key;
        if (value === 'back') code.input.value = code.input.value.slice(0, -1);
        else if (value === 'ok') {
          submitCode();
          return;
        } else if (code.input.value.length < code.input.maxLength) code.input.value += value;
        renderDots();
        autoSubmit();
      });
    });
  }

  function openCodeDialog() {
    resetCodeInput();
    renderLockout();
    ns.a11y.openDialog(code.dialog, { initialFocus: code.input });
  }

  function resetCodeInput() {
    code.input.value = '';
    if (!isLockedOut()) code.error.textContent = '';
    renderDots();
  }

  function renderDots() {
    const length = String(ctx.config.adminCode).length;
    const filled = code.input.value.length;
    code.dots.replaceChildren(...Array.from({ length }, (_, index) => el('span', { className: 'code__dot' + (index < filled ? ' is-filled' : '') })));
  }

  function autoSubmit() {
    if (code.input.value.length === String(ctx.config.adminCode).length) submitCode();
  }

  function isLockedOut() {
    return Date.now() < lockedUntil;
  }

  function submitCode() {
    if (isLockedOut()) return;
    if (code.input.value === String(ctx.config.adminCode)) {
      unlocked = true;
      failedAttempts = 0;
      ns.a11y.closeDialog(code.dialog);
      open();
      return;
    }
    failedAttempts += 1;
    code.input.value = '';
    renderDots();
    code.panel.classList.remove('is-shaking');
    void code.panel.offsetWidth; // herstart de schudanimatie
    code.panel.classList.add('is-shaking');
    if (failedAttempts >= MAX_ATTEMPTS) {
      failedAttempts = 0;
      lockedUntil = Date.now() + LOCKOUT_MS;
      renderLockout();
    } else {
      code.error.textContent = `Onjuiste code. Nog ${MAX_ATTEMPTS - failedAttempts} poging(en).`;
    }
  }

  function renderLockout() {
    window.clearTimeout(lockTimer);
    const locked = isLockedOut();
    code.keys.forEach((key) => {
      key.disabled = locked;
    });
    code.input.disabled = locked;
    if (!locked) return;
    code.error.textContent = `Te vaak een onjuiste code. Probeer het over ${Math.ceil((lockedUntil - Date.now()) / 1000)} seconden opnieuw.`;
    lockTimer = window.setTimeout(() => {
      renderLockout();
      if (!isLockedOut()) {
        code.error.textContent = '';
        code.input.focus();
      }
    }, 1000);
  }

  /** Vergrendelen: bij de knop, een kioskreset of herladen. */
  function lock() {
    unlocked = false;
    activeTab = 'dashboard';
    resetAttempts = 0;
    ns.central.signOut();
    ns.dashboard.forget();
    if (dialog && dialog.open) ns.a11y.closeDialog(dialog);
    if (code.dialog && code.dialog.open) ns.a11y.closeDialog(code.dialog);
  }

  function open() {
    if (!isEnabled() || dialog.open) return;
    stopTour();
    ns.kiosk.pause('admin');
    render();
    ns.a11y.openDialog(dialog, { initialFocus: panel.querySelector('[role="tab"][aria-selected="true"]') });
    window.addEventListener('resize', updateLive);
    window.addEventListener('online', updateLive);
    window.addEventListener('offline', updateLive);
  }

  function close() {
    ns.a11y.closeDialog(dialog);
  }

  function handleClose() {
    checkToken += 1;
    window.removeEventListener('resize', updateLive);
    window.removeEventListener('online', updateLive);
    window.removeEventListener('offline', updateLive);
    ns.kiosk.resume('admin');
  }

  /* ---- Opbouw ------------------------------------------------------------ */
  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'beheer', label: 'Beheer & test', icon: 'settings' }
  ];

  function render() {
    const tabButtons = TABS.map((tab) =>
      el(
        'button',
        {
          className: 'admin-tab',
          attrs: { type: 'button', role: 'tab', id: 'admin-tab-' + tab.id, 'aria-controls': 'admin-panel-' + tab.id, 'aria-selected': String(tab.id === activeTab), tabindex: tab.id === activeTab ? '0' : '-1' },
          on: { click: () => selectTab(tab.id) }
        },
        [icon(tab.icon), el('span', { text: tab.label })]
      )
    );
    const tablist = el('div', { className: 'admin-tabs', attrs: { role: 'tablist', 'aria-label': 'Admin' } }, tabButtons);
    tablist.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const index = TABS.findIndex((tab) => tab.id === activeTab);
      const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
      selectTab(next.id);
      panel.querySelector('#admin-tab-' + next.id).focus();
    });

    const panels = TABS.map((tab) => el('div', { className: 'admin-tabpanel', attrs: { role: 'tabpanel', id: 'admin-panel-' + tab.id, 'aria-labelledby': 'admin-tab-' + tab.id, hidden: tab.id !== activeTab, tabindex: '-1' } }));

    panel.replaceChildren(
      el('button', { className: 'btn btn--icon btn--quiet modal__close', attrs: { type: 'button', 'aria-label': 'Admin sluiten' }, on: { click: close } }, icon('close')),
      el('div', { className: 'admin__header' }, [
        el('span', { className: 'modal__mark', attrs: { 'aria-hidden': 'true' } }, icon('settings')),
        el('div', {}, [
          el('h2', { className: 'modal__title', attrs: { id: 'admin-title' }, text: 'Admin' }),
          el('p', { className: 'admin__intro', text: 'Alleen voor de organisatie. Instellingen hier gelden tot de pagina opnieuw wordt geladen; blijvende wijzigingen maak je in js/config.js en data/snacks.js.' })
        ])
      ]),
      el('div', { className: 'admin__bar' }, [
        tablist,
        ctx.config.adminCode ? el('button', { className: 'btn btn--secondary btn--sm', attrs: { type: 'button' }, on: { click: lockAndNotify } }, [icon('lock'), el('span', { text: 'Vergrendelen' })]) : null
      ]),
      ...panels
    );
    fillTab(activeTab);
    updateLive();
  }

  function selectTab(id) {
    if (id === activeTab) return;
    activeTab = id;
    panel.querySelectorAll('[role="tab"]').forEach((tab) => {
      const selected = tab.id === 'admin-tab-' + id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.querySelectorAll('[role="tabpanel"]').forEach((tabpanel) => {
      tabpanel.hidden = tabpanel.id !== 'admin-panel-' + id;
    });
    fillTab(id);
  }

  function fillTab(id) {
    const container = panel.querySelector('#admin-panel-' + id);
    if (id === 'dashboard') {
      ns.dashboard.render(container, ctx);
      return;
    }
    const snacks = ctx.getSnacks();
    container.replaceChildren(
      el('div', { className: 'admin__grid' }, [
        renderContentSection(snacks),
        renderKioskSection(),
        renderMediaSection(snacks),
        renderQuickOpenSection(snacks),
        renderStorageSection(),
        renderDeviceSection(),
        renderResetSection()
      ].filter(Boolean))
    );
    updateLive();
    runMediaCheck();
  }

  function lockAndNotify() {
    lock();
    toast('Admin is vergrendeld.', { tone: 'success', icon: 'lock' });
  }

  function section(title, iconName, children, full) {
    return el('section', { className: 'admin__section' + (full ? ' admin__section--full' : '') }, [el('h3', {}, [icon(iconName), title])].concat(children));
  }

  function kv(pairs) {
    const list = el('dl', { className: 'kv' });
    pairs.forEach(([label, value]) => {
      list.append(el('dt', { text: label }), el('dd', {}, value instanceof Node ? value : String(value)));
    });
    return list;
  }

  function status(kind, text) {
    const icons = { ok: 'check-circle', bad: 'alert', warn: 'alert', muted: 'info' };
    return el('span', { className: 'status status--' + kind }, [icon(icons[kind] || 'info'), text]);
  }

  function onOff(value) {
    return value ? status('ok', 'aan') : status('muted', 'uit');
  }

  function renderContentSection(snacks) {
    const available = snacks.filter((snack) => snack.available).length;
    const issues = ctx.getIssues();
    const issueList = issues.length
      ? el(
          'ul',
          { className: 'admin__issues', attrs: { role: 'list' } },
          issues.map((item) => el('li', {}, status(item.level === 'error' ? 'bad' : 'warn', item.message)))
        )
      : el('p', {}, status('ok', 'Geen meldingen: configuratie en snackkaart zijn in orde.'));

    return section('Snackkaart en instellingen', 'grid', [
      kv([
        ['Snacks gevonden', `${snacks.length} (${available} beschikbaar, ${snacks.length - available} binnenkort)`],
        ['Demomodus', ctx.config.demoMode ? status('warn', 'aan: video’s worden niet afgespeeld') : status('ok', 'uit')],
        ['Schermvullend afspelen', ctx.config.fullscreenOnPlay ? 'automatisch bij het starten van een demo' : 'alleen via de knop in de speler'],
        ['Centrale opslag', centralStatus()],
        ['Kopiëren / Mail mij', `${ctx.config.enablePromptCopy && !ctx.config.kioskMode ? 'aan' : 'uit'} / ${ns.promptMail.isEnabled() ? 'aan' : 'uit'}`],
        ['Thema / taal', `${ctx.config.theme} / ${ctx.config.language}`],
        ['Verras mij', onOff(ctx.config.showSurpriseButton)],
        ['Welkomstscherm', onOff(ctx.config.showIntro)],
        ['QR-code bij de prompt', ctx.config.enableQrCodes && ctx.config.kioskMode ? 'aan' : 'uit (alleen op een gedeelde tablet)'],
        ['Beoordeling / opmerkingen', `${ctx.config.enableRatings ? 'aan' : 'uit'} / ${ctx.config.enableComments ? 'aan' : 'uit'}`],
        ['Versie', ctx.version]
      ]),
      el('h3', { className: 'admin__subhead' }, [icon('alert'), 'Meldingen']),
      issueList
    ]);
  }

  function centralStatus() {
    const central = ns.central.status();
    if (!central.enabled) return status('muted', 'uit (alleen op dit apparaat; zie docs/SUPABASE.md)');
    if (central.lastError) return status('warn', `${central.url} · ${central.pending} wachtend · ${central.lastError}`);
    return status('ok', `${central.url} · ${central.pending ? central.pending + ' wachtend' : 'alles verstuurd'}`);
  }

  function kioskReason() {
    if (/[?&]kiosk\b/.test(window.location.search)) return 'via ?kiosk in het adres';
    if (ctx.config.kioskModeSetting !== 'auto') return 'vast ingesteld in js/config.js';
    return ctx.config.kioskMode ? 'automatisch: lokale kopie, dus tablet bij de stand' : 'automatisch: online adres, dus eigen telefoon of laptop';
  }

  function renderKioskSection() {
    const kiosk = ns.kiosk.status();
    const toggle = el('input', { attrs: { type: 'checkbox' } });
    toggle.checked = kiosk.suspended;
    toggle.disabled = !kiosk.enabled;
    toggle.addEventListener('change', () => {
      ns.kiosk.setSuspended(toggle.checked);
      toast(toggle.checked ? 'Automatische reset staat uit tot herladen.' : 'Automatische reset staat weer aan.', { tone: 'success' });
    });

    return section('Kioskmodus', 'refresh', [
      kv([
        ['Kioskmodus', kiosk.enabled ? status('ok', 'aan, ' + kioskReason()) : status('muted', 'uit, ' + kioskReason())],
        ['Reset na', `${ctx.config.inactivityTimeout} s zonder aanraking`],
        ['Waarschuwing', `${ctx.config.inactivityWarningDuration} s vooraf`],
        ['Welkom na reset', onOff(ctx.config.showIntroAfterReset)],
        ['Reset bij herladen', onOff(ctx.config.resetOnPageReload)]
      ]),
      el('label', { className: 'toggle' }, [toggle, 'Automatische reset tijdelijk uitzetten (tot herladen)']),
      el('div', { className: 'admin__buttons' }, [
        button('Test waarschuwing', 'clock', () => {
          close();
          ns.kiosk.resume('admin');
          if (!ns.kiosk.testWarning()) toast('Kioskmodus staat uit in js/config.js.', { tone: 'warning' });
        }, !kiosk.enabled),
        button('Nu resetten', 'refresh', () => {
          close();
          ns.kiosk.resume('admin');
          ns.kiosk.resetNow('beheer');
        })
      ])
    ]);
  }

  /** Knop die pas bij de tweede klik (binnen enkele seconden) uitvoert. */
  function confirmButton(label, confirmLabel, onConfirm) {
    let armed = false;
    let timer = 0;
    const node = button(label, 'trash', () => {
      const text = node.querySelector('span');
      if (!armed) {
        armed = true;
        text.textContent = confirmLabel;
        timer = window.setTimeout(() => {
          armed = false;
          text.textContent = label;
        }, CONFIRM_MS);
        return;
      }
      window.clearTimeout(timer);
      onConfirm();
    });
    node.classList.add('btn--danger');
    return node;
  }

  function renderMediaSection(snacks) {
    live.mediaSummary = el('p', { className: 'admin__intro', text: 'Bezig met controleren…' });
    live.mediaBody = el('tbody');
    const table = el('table', { className: 'admin-table' }, [
      el('thead', {}, el('tr', {}, ['Snack', 'HTML-demo', 'Video', 'Poster', 'Icoon', 'QR-code', 'Ondertitels'].map((label) => el('th', { attrs: { scope: 'col' }, text: label })))),
      live.mediaBody
    ]);
    snacks.forEach((snack) => {
      live.mediaBody.append(
        el('tr', { dataset: { snackId: snack.id } }, [
          el('th', { attrs: { scope: 'row' }, text: `${snack.number} ${snack.title}` }),
          ...['demo', 'video', 'poster', 'icon', 'qrCode', 'captions'].map((field) => el('td', { dataset: { field }, text: '…' }))
        ])
      );
    });
    return section(
      'Mediabestanden',
      'film',
      [live.mediaSummary, el('div', { className: 'admin-table-wrap' }, table), el('div', { className: 'admin__buttons' }, [button('Opnieuw controleren', 'refresh', runMediaCheck)])],
      true
    );
  }

  function renderQuickOpenSection(snacks) {
    const buttons = snacks.map((snack) =>
      button(`${snack.number} ${snack.title}`, snack.available ? 'arrow-right' : 'hourglass', () => {
        close();
        ctx.openSnack(snack.id, { force: true });
      })
    );
    return section('Snel openen', 'arrow-right', [
      el('p', { className: 'admin__intro', text: 'Opent ook snacks die op ‘binnenkort’ staan, om ze vooraf te bekijken.' }),
      el('div', { className: 'admin__buttons' }, buttons),
      el('div', { className: 'admin__buttons' }, [button(`Rondgang langs alle snacks (${TOUR_STEP_MS / 1000} s per snack)`, 'play', startTour, !snacks.length)])
    ]);
  }

  function renderStorageSection() {
    const info = ns.storage.status();
    const device = ns.storage.deviceInfo();
    const clearButton = confirmButton('Wis alle gegevens van deze tablet', 'Klik nogmaals: tellers, beoordelingen en vragen wissen', () => {
      ns.storage.clearAll();
      ns.feedback.clearSession();
      toast('Alle lokale gegevens van deze snackbar zijn gewist.', { tone: 'success' });
      render();
    });

    return section('Lokale opslag', 'shield', [
      kv([
        ['localStorage', info.persistent ? status('ok', info.reason) : status('warn', info.reason + ' (tijdelijk geheugen: gegevens verdwijnen bij herladen)')],
        ['Voorvoegsel', info.prefix],
        ['Anonieme statistiek', onOff(info.analyticsEnabled)],
        ['Tablet', `${device.deviceLabel || 'geen naam'} (code ${device.deviceId.slice(0, 8)})`],
        ['Opgeslagen sleutels', info.storedKeys.length ? info.storedKeys.join(', ') : 'geen'],
        ['Deze sessie bekeken', info.sessionViewed.length ? info.sessionViewed.join(', ') : 'nog niets']
      ]),
      el('p', { className: 'admin__intro', text: 'Exporteer eerst via het Dashboard als je de gegevens wilt bewaren.' }),
      el('div', { className: 'admin__buttons' }, [clearButton])
    ]);
  }

  /**
   * Alles resetten (vlak voor het evenement de testgegevens wissen): centraal alle
   * telefoons en tablets (alleen als beheerder ingelogd) plus dit apparaat. Met een
   * eigen pincode (resetCode) als extra slot tegen per ongeluk wissen.
   */
  function renderResetSection() {
    if (!ctx.config.resetCode) return null;
    const central = ns.central.isEnabled();
    const signedIn = central && Boolean(ns.central.signedIn());
    const blocked = resetAttempts >= MAX_ATTEMPTS;

    const pin = el('input', { className: 'dash__label-input admin__pin', attrs: { id: 'admin-reset-pin', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: 8, 'aria-describedby': 'admin-reset-error', disabled: blocked || (central && !signedIn) } });
    const submit = el('button', { className: 'btn btn--danger btn--sm', attrs: { type: 'submit', disabled: blocked || (central && !signedIn) } }, [icon('trash'), el('span', { text: 'Wis alles' })]);
    const error = el('p', { className: 'code__error', attrs: { id: 'admin-reset-error', role: 'alert' }, text: blocked ? 'Te vaak een onjuiste pincode. Vergrendel admin en probeer het later opnieuw.' : '' });
    const form = el('form', { className: 'dash__label-form', attrs: { novalidate: true } }, [
      el('label', { className: 'dash__label-caption', attrs: { for: 'admin-reset-pin' }, text: 'Pincode voor resetten' }),
      pin,
      submit
    ]);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pin.value !== ctx.config.resetCode) {
        resetAttempts += 1;
        pin.value = '';
        if (resetAttempts >= MAX_ATTEMPTS) {
          error.textContent = 'Te vaak een onjuiste pincode. Vergrendel admin en probeer het later opnieuw.';
          pin.disabled = true;
          submit.disabled = true;
        } else {
          error.textContent = `Onjuiste pincode (nog ${MAX_ATTEMPTS - resetAttempts} ${MAX_ATTEMPTS - resetAttempts === 1 ? 'poging' : 'pogingen'}).`;
          pin.focus();
        }
        return;
      }
      resetAttempts = 0;
      submit.disabled = true;
      error.textContent = '';
      let message = 'Alle gegevens op dit apparaat zijn gewist.';
      try {
        if (central) {
          const n = await ns.central.resetAll();
          const count = (value, one, many) => `${value} ${value === 1 ? one : many}`;
          message = `Alles gewist. Centraal: ${count(n.events, 'teller', 'tellers')}, ${count(n.ratings, 'smiley', 'smileys')}, ${count(n.comments, 'vraag', 'vragen')} en ${count(n.requests, 'e-mailadres', 'e-mailadressen')}; plus dit apparaat.`;
        }
      } catch (problem) {
        submit.disabled = false;
        pin.value = '';
        error.textContent = 'Centraal wissen mislukt: ' + problem.message + '. Er is nog niets gewist.';
        return;
      }
      ns.storage.clearAll();
      ns.feedback.clearSession();
      ns.central.newSession();
      ns.dashboard.forget();
      toast(message, { tone: 'success', icon: 'trash', duration: 8000 });
      render();
    });

    const scope = central
      ? 'centraal alle tellers, smileys, vragen en e-mailadressen van álle telefoons en tablets, plus de gegevens op dit apparaat'
      : 'de tellers, smileys en vragen op dit apparaat';
    return section(
      'Alles resetten (testgegevens wissen)',
      'trash',
      [
        el('p', { className: 'admin__intro', text: `Vlak voor het evenement: wist ${scope}. Dit kan niet ongedaan worden gemaakt; exporteer eerst als je iets wilt bewaren.` }),
        central && !signedIn ? el('p', {}, status('warn', 'Log eerst in via het tabblad Dashboard (Inloggen); daarna kun je hier alles wissen.')) : null,
        form,
        error,
        el('p', { className: 'admin__intro', text: 'Andere tablets houden hun eigen lokale tellers. Wis die op die tablet zelf met "Wis alle gegevens van deze tablet" (of doe daar deze reset).' })
      ].filter(Boolean),
      true
    );
  }

  function renderDeviceSection() {
    live.viewport = el('span');
    live.online = el('span');
    return section('Apparaat en browser', 'info', [
      kv([
        ['Venster', live.viewport],
        ['Browser', browserName()],
        ['Geopend via', protocolLabel()],
        ['Netwerk', live.online],
        ['Aanraakscherm', navigator.maxTouchPoints > 0 ? `ja (${navigator.maxTouchPoints} punten)` : 'nee'],
        ['Minder beweging', ns.a11y.prefersReducedMotion() ? 'aan' : 'uit'],
        ['Klembord', navigator.clipboard && window.isSecureContext ? 'ondersteund' : 'alleen via terugvaloptie'],
        ['Overgangen', typeof document.startViewTransition === 'function' ? 'View Transitions' : 'eenvoudige animatie']
      ])
    ]);
  }

  function button(label, iconName, onClick, disabled) {
    return el('button', { className: 'btn btn--secondary btn--sm', attrs: { type: 'button', disabled: Boolean(disabled) }, on: { click: onClick } }, [icon(iconName), el('span', { text: label })]);
  }

  function updateLive() {
    if (live.viewport) {
      const orientation = window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
      live.viewport.textContent = `${window.innerWidth} × ${window.innerHeight} px (${orientation}, pixelratio ${window.devicePixelRatio || 1})`;
    }
    if (live.online) {
      live.online.replaceChildren(navigator.onLine ? status('muted', 'online (niet nodig)') : status('ok', 'offline: prima, de app heeft geen internet nodig'));
    }
  }

  function browserName() {
    const ua = navigator.userAgent;
    const match = ua.match(/Edg\/(\d+)/) || ua.match(/(Firefox)\/(\d+)/) || ua.match(/Chrome\/(\d+)/) || ua.match(/Version\/(\d+).*Safari/);
    if (/Edg\//.test(ua)) return `Microsoft Edge ${match[1]}`;
    if (/Firefox\//.test(ua)) return `Firefox ${match[2]}`;
    if (/Chrome\//.test(ua)) return `Google Chrome ${match[1]}`;
    if (/Safari\//.test(ua) && match) return `Safari ${match[1]}`;
    return ua;
  }

  function protocolLabel() {
    if (window.location.protocol === 'file:') return 'bestand (file://), optie A';
    return `${window.location.protocol}//${window.location.host}, optie B`;
  }

  /* ---- Mediacheck --------------------------------------------------------- */
  async function runMediaCheck() {
    const token = ++checkToken;
    const snacks = ctx.getSnacks();
    let missing = 0;
    let checked = 0;
    if (live.mediaSummary) live.mediaSummary.textContent = 'Bezig met controleren…';

    for (const snack of snacks) {
      const row = live.mediaBody && live.mediaBody.querySelector(`tr[data-snack-id="${CSS.escape(snack.id)}"]`);
      const probes = {
        demo: probeDemo(snack.demo),
        video: probeVideo(snack.video),
        poster: probeImage(snack.poster),
        icon: probeImage(snack.icon),
        qrCode: ctx.config.enableQrCodes && ctx.config.kioskMode ? probeImage(snack.qrCode) : Promise.resolve({ status: 'off' }),
        captions: probeTrack(snack.captions)
      };
      const results = await Promise.all(Object.values(probes));
      if (token !== checkToken || !row) return;
      Object.keys(probes).forEach((field, index) => {
        const result = results[index];
        if (result.status === 'missing' && field === 'captions' && window.location.protocol === 'file:') {
          result.status = 'blocked';
        }
        if (result.status === 'missing') missing += 1;
        if (result.status !== 'empty' && result.status !== 'off') checked += 1;
        const cell = row.querySelector(`td[data-field="${field}"]`);
        cell.replaceChildren(resultCell(result, snack[field], field));
      });
    }
    if (token !== checkToken || !live.mediaSummary) return;
    live.mediaSummary.replaceChildren(
      missing
        ? status('warn', `${missing} van ${checked} ingestelde bestanden ontbreken. Ontbrekende bestanden krijgen automatisch een placeholder.`)
        : status('ok', `Alle ${checked} ingestelde bestanden zijn gevonden.`)
    );
  }

  function resultCell(result, path, field) {
    const wrap = el('div');
    switch (result.status) {
      case 'ok':
        wrap.append(status('ok', field === 'video' && Number.isFinite(result.duration) ? `gevonden (${formatTime(result.duration)})` : 'gevonden'));
        break;
      case 'missing':
        wrap.append(status('bad', 'ontbreekt'), el('br'), el('code', { text: path }));
        break;
      case 'blocked':
        wrap.append(status('warn', 'alleen te testen via de lokale server'));
        break;
      case 'timeout':
        wrap.append(status('warn', field === 'demo' ? 'reageert niet (ontbreekt, of mist de koppeling)' : 'geen reactie'), el('br'), el('code', { text: path }));
        break;
      case 'off':
        wrap.append(status('muted', 'uitgeschakeld'));
        break;
      default:
        wrap.append(status('muted', 'niet ingesteld'));
    }
    return wrap;
  }

  /* ---- Rondgang ----------------------------------------------------------- */
  function startTour() {
    const snacks = ctx.getSnacks();
    if (!snacks.length) return;
    close();
    ns.kiosk.pause('tour');
    let index = 0;
    const step = () => {
      if (index >= snacks.length) {
        stopTour();
        ctx.goToMenu();
        toast('Rondgang klaar.', { tone: 'success' });
        return;
      }
      ctx.openSnack(snacks[index].id, { force: true });
      index += 1;
      tourTimer = window.setTimeout(step, TOUR_STEP_MS);
    };
    // Elke aanraking of toets stopt de rondgang.
    tourStopper = () => {
      stopTour();
      toast('Rondgang gestopt.');
    };
    window.setTimeout(() => {
      window.addEventListener('pointerdown', tourStopper, { once: true, capture: true });
      window.addEventListener('keydown', tourStopper, { once: true, capture: true });
    }, 50);
    step();
  }

  function stopTour() {
    window.clearTimeout(tourTimer);
    tourTimer = 0;
    if (tourStopper) {
      window.removeEventListener('pointerdown', tourStopper, { capture: true });
      window.removeEventListener('keydown', tourStopper, { capture: true });
      tourStopper = null;
    }
    ns.kiosk.resume('tour');
  }

  ns.admin = {
    init,
    requestAccess,
    lock,
    stopTour,
    isEnabled
  };
})(window.AISnackbar);
