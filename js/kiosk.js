/* ==========================================================================
   Kioskmodus
   --------------------------------------------------------------------------
   Na een periode zonder aanraking gaat de app terug naar het begin, zodat
   de volgende collega op een schone snackkaart begint. Vlak daarvoor
   verschijnt 'Ben je er nog?'. Een afspelende video telt als activiteit.
   Staat de app al in de begintoestand, dan resetten we stil (zonder
   waarschuwing): er gaat dan niets verloren.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { t, toast } = ns.ui;
  const RING_LENGTH = 326.73; // 2 * pi * r (r = 52, zie index.html)
  const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'scroll'];

  let config = null;
  let onReset = null;
  let needsWarning = null;
  let dialog = null;
  let secondsEl = null;
  let ringEl = null;
  let pill = null;
  let intervalId = 0;
  let lastActivity = Date.now();
  let warningVisible = false;
  let forceWarning = false;
  let adminSuspended = false;
  const pauseReasons = new Set();

  function init(options) {
    config = options.config;
    onReset = options.onReset;
    needsWarning = options.needsWarning;
    dialog = document.getElementById('idle-dialog');
    secondsEl = document.getElementById('idle-seconds');
    ringEl = document.getElementById('idle-ring');
    pill = document.getElementById('kiosk-pill');

    ns.a11y.registerDialog(dialog, { onCancel: stay });
    document.getElementById('idle-stay').addEventListener('click', stay);
    document.getElementById('idle-reset').addEventListener('click', () => resetNow('knop'));
    pill.addEventListener('click', () => {
      setSuspended(false);
      toast(t('kioskResumed'), { tone: 'success' });
    });

    if (!config.kioskMode) return;
    document.documentElement.classList.add('is-kiosk');
    ACTIVITY_EVENTS.forEach((type) => window.addEventListener(type, markActivity, { passive: true, capture: true }));
    intervalId = window.setInterval(tick, 1000);
  }

  function markActivity(event) {
    // Tijdens de waarschuwing telt alleen een bewuste actie (tik, toets, scroll),
    // niet een toevallig bewegende muis.
    if (warningVisible && event.type === 'pointermove') return;
    lastActivity = Date.now();
    if (warningVisible) hideWarning();
  }

  function tick() {
    if (adminSuspended || pauseReasons.size) {
      lastActivity = Date.now();
      forceWarning = false;
      if (warningVisible) hideWarning();
      return;
    }
    const idleSeconds = (Date.now() - lastActivity) / 1000;
    const timeout = config.inactivityTimeout;
    const warningAt = timeout - config.inactivityWarningDuration;

    if (idleSeconds >= timeout) {
      resetNow('inactiviteit');
      return;
    }
    if (idleSeconds >= warningAt && (forceWarning || needsWarning())) {
      showWarning(timeout - idleSeconds);
    }
  }

  function showWarning(remaining) {
    const total = config.inactivityWarningDuration;
    const seconds = Math.max(0, Math.ceil(remaining));
    secondsEl.textContent = String(seconds);
    ringEl.style.strokeDashoffset = String(RING_LENGTH * (1 - Math.max(0, remaining - 1) / total));
    if (warningVisible) return;
    warningVisible = true;
    ns.a11y.openDialog(dialog);
  }

  function hideWarning() {
    warningVisible = false;
    forceWarning = false;
    ringEl.style.strokeDashoffset = '0';
    ns.a11y.closeDialog(dialog);
  }

  function stay() {
    lastActivity = Date.now();
    hideWarning();
  }

  function resetNow(reason) {
    hideWarning();
    lastActivity = Date.now();
    onReset(reason);
  }

  /** Activiteit die de pagina zelf niet ziet (bijv. scrollen in een HTML-demo). */
  function touch() {
    lastActivity = Date.now();
    if (warningVisible) hideWarning();
  }

  /** Tijdelijk niet resetten, bijv. zolang een video speelt of beheer open is. */
  function pause(reason) {
    pauseReasons.add(reason);
  }

  function resume(reason) {
    // Alleen opnieuw beginnen met tellen als deze reden echt actief was.
    if (pauseReasons.delete(reason)) lastActivity = Date.now();
  }

  /** Beheer: automatische reset uitzetten tot herladen (met zichtbaar label). */
  function setSuspended(value) {
    adminSuspended = Boolean(value) && config.kioskMode;
    pill.hidden = !adminSuspended;
    lastActivity = Date.now();
  }

  /** Beheer: laat de waarschuwing direct zien, ongeacht de begintoestand. */
  function testWarning() {
    if (!config.kioskMode) return false;
    forceWarning = true;
    lastActivity = Date.now() - (config.inactivityTimeout - config.inactivityWarningDuration) * 1000;
    tick();
    return true;
  }

  function status() {
    return {
      enabled: Boolean(config && config.kioskMode),
      running: Boolean(intervalId),
      suspended: adminSuspended,
      pausedBy: Array.from(pauseReasons),
      idleSeconds: Math.round((Date.now() - lastActivity) / 1000)
    };
  }

  ns.kiosk = {
    init,
    touch,
    pause,
    resume,
    setSuspended,
    testWarning,
    resetNow,
    status
  };
})(window.AISnackbar);
