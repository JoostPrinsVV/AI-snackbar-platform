/* ==========================================================================
   AI Snackbar — opstarten en samenwerking tussen de onderdelen
   --------------------------------------------------------------------------
   Volgorde: instellingen en inhoud valideren → teksten en thema toepassen →
   schermen opbouwen → navigatie starten → kiosk en beheer activeren.
   ========================================================================== */
(function (ns) {
  'use strict';

  const VERSION = '1.2.0 (telefoons, HTML-demo, centrale opslag, Mail mij)';

  const state = {
    config: null,
    snacks: [],
    inspiration: [],
    byId: new Map(),
    issues: [],
    view: 'menu',
    instantNextRoute: false,
    allowUnavailableId: null
  };

  const dom = {};

  /* ---- Opstarten ----------------------------------------------------------- */
  function boot() {
    const texts = ns.texts && typeof ns.texts === 'object' ? ns.texts : {};
    const languages = Object.keys(texts);
    const configResult = ns.content.normalizeConfig(ns.config, languages.length ? languages : ['nl']);
    // Kiosk of eigen apparaat: vanaf hier is kioskMode altijd true of false.
    const config = Object.freeze(Object.assign({}, configResult.config, { kioskMode: resolveKiosk(configResult.config.kioskMode), kioskModeSetting: configResult.config.kioskMode }));
    state.config = config;

    const snackResult = ns.content.normalizeSnacks(ns.snacks);
    state.snacks = snackResult.snacks;
    state.snacks.forEach((snack) => state.byId.set(snack.id, snack));
    // Inspiratieprompts staan alleen op de promptpagina; hier voor de controle en de 'Mail mij'-lijst in het dashboard.
    const inspirationResult = ns.content.normalizeInspiration(ns.inspiration, state.snacks.map((snack) => snack.id));
    state.inspiration = inspirationResult.prompts;
    state.issues = configResult.issues.concat(snackResult.issues, inspirationResult.issues);
    if (!ns.texts) state.issues.unshift({ level: 'error', message: 'data/texts.js kon niet worden gelezen; standaardteksten uit index.html worden gebruikt.', snackId: null });

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

    cacheDom();
    applyDocumentSettings(config);
    ns.storage.init(config);
    ns.central.init({ config });
    ns.ui.applyStaticTexts(document);
    renderBrand(config);
    renderHero(config);

    ns.menuView.init({ grid: dom.grid, stateBox: dom.menuState, onSelect: selectSnack });
    ns.menuView.render(state.snacks, { loadFailed: snackResult.loadFailed, detail: snacksErrorDetail() });

    ns.feedback.init({ config });
    ns.promptMail.init({ config });
    ns.detailView.init({
      config,
      volume: ns.storage.get('volume', config.defaultVolume),
      muted: ns.storage.get('muted', config.startMuted),
      onBack: () => ns.navigation.toMenu(),
      onSurprise: (currentId) => ns.surprise.start({ excludeId: currentId }),
      onPlayerState: handlePlayerState,
      // Tikken en scrollen ín een HTML-demo ziet de pagina zelf niet: de demo meldt het.
      onActivity: () => ns.kiosk.touch(),
      onVolumeChange: ({ muted, volume }) => {
        ns.storage.set('muted', muted);
        ns.storage.set('volume', Math.round(volume * 100) / 100);
      }
    });

    ns.surprise.init({ getSnacks: () => state.snacks, onChosen: (snack) => openSnack(snack.id) });
    ns.intro.init({ config });
    ns.kiosk.init({ config, onReset: resetToStart, needsWarning });
    ns.admin.init({
      config,
      version: VERSION,
      getSnacks: () => state.snacks,
      getInspiration: () => state.inspiration,
      getIssues: () => state.issues,
      openSnack,
      goToMenu: () => ns.navigation.toMenu()
    });

    bindGlobalEvents(config);
    reportIssues();

    // Kiosk: na herladen altijd terug naar de snackkaart. Eigen apparaat: een directe link naar de snackkaart
    // of een snack (bijv. 'Naar de snackbar' of 'Bekijk de demo' op de promptpagina) gaat meteen door,
    // zonder welkomstscherm. Het kale adres (zonder #) toont het welkomstscherm wel.
    const deepLink = !config.kioskMode && /^#\/(snack\/|$)/.test(window.location.hash);
    ns.navigation.start(handleRoute, { resetOnLoad: config.resetOnPageReload && config.kioskMode });
    if (!deepLink) ns.intro.showIntro();

    ns.onRuntimeError = (entry) => {
      if (state.config.debugMode) ns.ui.toast('Technische fout: ' + entry.message, { tone: 'warning', duration: 6000 });
    };
    document.documentElement.classList.add('is-ready');
  }

  function cacheDom() {
    const byId = (id) => document.getElementById(id);
    Object.assign(dom, {
      menuView: byId('view-menu'),
      detailView: byId('view-detail'),
      grid: byId('snack-grid'),
      menuState: byId('menu-state'),
      menuTitle: byId('menu-title'),
      detailTitle: byId('detail-title'),
      homeButton: byId('home-button'),
      aboutButton: byId('about-button'),
      adminButton: byId('admin-button'),
      surpriseButton: byId('surprise-button'),
      surpriseHint: byId('surprise-hint'),
      promptsButton: byId('prompts-button'),
      heroCta: byId('hero-cta')
    });
  }

  /**
   * Gedeelde tablet bij de stand (kiosk) of eigen telefoon/laptop?
   * ?kiosk / ?kiosk=0 in het adres beslist altijd. Anders bij 'auto': een lokale
   * kopie (bestand of eigen server op dit apparaat) is de stand, het online adres
   * is een eigen apparaat.
   */
  function resolveKiosk(setting) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('kiosk')) return params.get('kiosk') !== '0';
    if (setting !== 'auto') return Boolean(setting);
    return window.location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
  }

  function applyDocumentSettings(config) {
    const root = document.documentElement;
    root.lang = config.language;
    root.dataset.theme = config.theme;
    root.classList.toggle('is-personal', !config.kioskMode);
    ns.a11y.setForceReducedMotion(config.reduceMotion);
    document.title = ns.ui.t('documentTitle').replace(/\s+/g, ' ').trim() || [config.applicationTitle, config.discipline].join(' ').trim();
    document.body.dataset.view = 'menu';
  }

  function renderBrand(config) {
    const logo = document.getElementById('brand-logo');
    const wordmark = document.getElementById('brand-wordmark');
    wordmark.textContent = config.organizationName || config.applicationTitle;
    if (!config.logoPath) return;
    logo.alt = config.logoAlt || config.organizationName;
    logo.addEventListener('load', () => {
      logo.hidden = false;
      wordmark.hidden = true;
    });
    logo.addEventListener('error', () => {
      // Nog geen logo aanwezig: de tekstuele placeholder blijft staan.
      console.info('[AI Snackbar] Logo niet gevonden (' + config.logoPath + '), tekstlogo getoond.');
    });
    logo.src = config.logoPath;
  }

  function renderHero(config) {
    const t = ns.ui.t;
    document.getElementById('hero-eyebrow').textContent = config.audienceName || config.eventName ? t('heroEyebrow').replace(/^\s*·\s*|\s*·\s*$/g, '') : '';
    document.getElementById('app-title').textContent = config.applicationTitle;
    const discipline = document.getElementById('app-discipline');
    discipline.textContent = config.discipline;
    discipline.hidden = !config.discipline;
    const subtitle = document.getElementById('app-subtitle');
    subtitle.textContent = config.applicationSubtitle;
    subtitle.hidden = !config.applicationSubtitle;
    document.getElementById('menu-instruction').textContent = config.instruction;
    const eventLabel = document.getElementById('event-label');
    eventLabel.textContent = config.eventName ? t('eventLabel').replace(/\s*·\s*$/, '') : '';
    eventLabel.hidden = !config.eventName;
    // 'Verras mij' alleen als er iets te kiezen valt.
    const availableCount = state.snacks.filter((snack) => snack.available).length;
    const surprise = config.showSurpriseButton && availableCount > 0;
    // 'Alle prompts' alleen op een eigen apparaat: de promptpagina heeft geen kioskreset en
    // gaat uit van een eigen telefoon (onthoudt bijv. het e-mailadres voor een tweede prompt).
    const prompts = !config.kioskMode;
    dom.surpriseButton.hidden = !surprise;
    dom.promptsButton.hidden = !prompts;
    // Bij twee knoppen is 'Wij kiezen een snack voor je' niet meer eenduidig.
    dom.surpriseHint.hidden = !surprise || prompts;
    dom.heroCta.hidden = !surprise && !prompts;
    // Vanaf een lokaal bestand opent 'prompts/' een mapoverzicht in plaats van de pagina.
    // '?kiosk=0' (lokaal testen als eigen apparaat) gaat mee, zodat je ook zo terugkomt.
    dom.promptsButton.href = (window.location.protocol === 'file:' ? 'prompts/index.html' : 'prompts/') + window.location.search;
    document.getElementById('detail-surprise').hidden = !config.showSurpriseButton || availableCount < 2;
  }

  function bindGlobalEvents(config) {
    dom.surpriseButton.addEventListener('click', () => ns.surprise.start());
    dom.homeButton.addEventListener('click', (event) => {
      event.preventDefault();
      ns.navigation.toMenu();
    });

    // Escape op de detailpagina = terug naar de snackkaart (als er geen dialoog open is).
    // Bij een schermvullende video handelt de speler Escape eerst af (defaultPrevented).
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented || ns.a11y.isAnyDialogOpen()) return;
      // Niet weg-navigeren terwijl iemand een opmerking typt.
      if (event.target.closest && event.target.closest('textarea, input')) return;
      if (state.view === 'detail') ns.navigation.toMenu();
    });

    if (config.kioskMode) {
      // Kiosk: geen contextmenu bij lang indrukken, behalve in de prompttekst.
      document.addEventListener('contextmenu', (event) => {
        if (!event.target.closest('.is-selectable')) event.preventDefault();
      });
    }
  }

  function snacksErrorDetail() {
    const error = (ns.bootErrors || []).find((entry) => entry.file && /snacks\.js$/.test(entry.file));
    if (!error) return '';
    return error.file + (error.line ? ', regel ' + error.line : '') + ': ' + error.message;
  }

  function reportIssues() {
    if (!state.issues.length) return;
    const errors = state.issues.filter((item) => item.level === 'error');
    const log = errors.length ? console.error : console.warn;
    log.call(console, `[AI Snackbar] ${state.issues.length} melding(en) bij het laden van de inhoud:`);
    state.issues.forEach((item) => console.warn(' - ' + item.message));
  }

  /* ---- Routes --------------------------------------------------------------- */
  function handleRoute(route) {
    if (route.name === 'unknown') {
      console.warn('[AI Snackbar] Onbekend adres, terug naar de snackkaart:', route.hash);
      ns.navigation.toMenu({ replace: true });
      return;
    }
    if (route.name === 'admin') {
      ns.navigation.toMenu({ replace: true });
      if (ns.admin.isEnabled()) window.setTimeout(() => ns.admin.requestAccess(), 0);
      return;
    }
    if (route.name === 'snack') {
      const snack = state.byId.get(route.id);
      const forced = state.allowUnavailableId === route.id;
      state.allowUnavailableId = null;
      if (!snack) {
        ns.ui.toast(ns.ui.t('unknownSnackToast'), { tone: 'warning' });
        ns.navigation.toMenu({ replace: true });
        return;
      }
      if (!snack.available && !forced) {
        ns.ui.toast(ns.ui.t('soonToast', { title: snack.title }), { icon: 'hourglass' });
        ns.navigation.toMenu({ replace: true });
        return;
      }
      showDetail(snack);
      return;
    }
    showMenu();
  }

  function selectSnack(snack) {
    if (!snack.available) {
      ns.ui.toast(ns.ui.t('soonToast', { title: snack.title }), { icon: 'hourglass' });
      return;
    }
    openSnack(snack.id);
  }

  /** Opent een snack. force: ook als die op 'binnenkort' staat (beheer). */
  function openSnack(id, options) {
    if (options && options.force) state.allowUnavailableId = id;
    ns.navigation.toSnack(id, { replace: state.view === 'detail' });
  }

  function showDetail(snack) {
    if (state.view === 'detail' && ns.detailView.currentId() === snack.id) return;
    const fromMenu = state.view === 'menu';
    const card = fromMenu ? ns.menuView.cardFor(snack.id) : null;
    if (fromMenu) ns.menuView.saveScroll();
    // De gekozen kaart 'groeit' uit tot de videospeler (View Transitions).
    ns.menuView.clearTransitionNames();
    if (card) card.style.setProperty('view-transition-name', 'snack-media');

    runViewChange(
      () => {
        if (card) card.style.removeProperty('view-transition-name');
        ns.detailView.show(snack);
        setView('detail');
        window.scrollTo(0, 0);
        ns.a11y.focusElement(dom.detailTitle);
      },
      'forward'
    );
    ns.storage.recordOpen(snack.id);
  }

  function showMenu() {
    if (state.view === 'menu') return;
    const lastId = ns.detailView.currentId();
    let card = null;
    runViewChange(
      () => {
        ns.detailView.hide();
        setView('menu');
        ns.menuView.refreshBadges();
        ns.menuView.restoreScroll();
        ns.menuView.clearTransitionNames();
        card = ns.menuView.cardFor(lastId);
        if (card) {
          card.style.setProperty('view-transition-name', 'snack-media');
          card.focus({ preventScroll: true });
        } else {
          ns.a11y.focusElement(dom.menuTitle);
        }
      },
      'back'
    ).then(() => {
      if (card) card.style.removeProperty('view-transition-name');
    });
  }

  function runViewChange(update, direction) {
    if (state.instantNextRoute) {
      state.instantNextRoute = false;
      update();
      return Promise.resolve();
    }
    return ns.navigation.transition(update, { direction });
  }

  function setView(name) {
    state.view = name;
    document.body.dataset.view = name;
    dom.menuView.hidden = name !== 'menu';
    dom.detailView.hidden = name !== 'detail';
    dom.homeButton.hidden = name === 'menu';
    dom.aboutButton.hidden = name !== 'menu';
    dom.adminButton.hidden = name !== 'menu' || !state.config.enableAdmin;
    if (name === 'menu') ns.menuView.updateColumns();

    // Zonder View Transitions: een eenvoudige CSS-overgang.
    if (typeof document.startViewTransition !== 'function' && !ns.a11y.prefersReducedMotion()) {
      const section = name === 'menu' ? dom.menuView : dom.detailView;
      section.classList.remove('is-entering');
      void section.offsetWidth;
      section.classList.add('is-entering');
      section.addEventListener('animationend', () => section.classList.remove('is-entering'), { once: true });
    }
  }

  /* ---- Video en kiosk --------------------------------------------------------- */
  function handlePlayerState(playerState, previous) {
    if (playerState === 'playing') ns.kiosk.pause('video');
    else ns.kiosk.resume('video');

    // Anonieme tellers: gestart (vanaf het begin of opnieuw na afloop) en helemaal bekeken.
    const snackId = ns.detailView.currentId();
    if (!snackId) return;
    if (playerState === 'playing' && (previous === 'idle' || previous === 'ended')) ns.storage.recordPlay(snackId);
    if (playerState === 'ended') ns.storage.recordCompletion(snackId);
  }

  /** Moet de kiosk eerst 'Ben je er nog?' vragen? Niet als er niets te verliezen valt. */
  function needsWarning() {
    const openDialogs = Array.from(document.querySelectorAll('dialog[open]')).filter((dialog) => dialog.id !== 'intro-dialog');
    return state.view !== 'menu' || window.scrollY > 40 || openDialogs.length > 0;
  }

  /** Terug naar de begintoestand voor de volgende bezoeker. */
  function resetToStart(reason) {
    const config = state.config;
    const introWasOpen = ns.intro.isIntroOpen();
    ns.surprise.cancel();
    ns.admin.stopTour();
    ns.admin.lock();
    document.querySelectorAll('dialog[open]').forEach((dialog) => {
      if (!(introWasOpen && dialog.id === 'intro-dialog')) dialog.close();
    });
    ns.ui.clearToasts();
    ns.storage.clearSession();
    ns.feedback.clearSession();
    ns.promptMail.clearSession();
    ns.central.newSession();
    ns.menuView.resetScroll();

    if (state.view !== 'menu') {
      state.instantNextRoute = true;
      ns.navigation.toMenu({ immediate: true });
    }
    window.scrollTo(0, 0);
    ns.menuView.refreshBadges();

    if (config.showIntro && config.showIntroAfterReset) {
      if (!introWasOpen) ns.intro.showIntro();
    } else {
      ns.a11y.focusElement(dom.menuTitle);
      if (reason !== 'inactiviteit') ns.menuView.playEntrance();
    }
    console.info('[AI Snackbar] Terug naar het begin (' + reason + ').');
  }

  /* ---- Start ---------------------------------------------------------------- */
  try {
    boot();
  } catch (error) {
    console.error('[AI Snackbar] Opstarten mislukt:', error);
    ns.bootErrors.push({ message: error.message, file: 'js/app.js', line: null });
    if (typeof ns.showFatal === 'function') ns.showFatal();
  }
})(window.AISnackbar);
