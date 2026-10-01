/* ==========================================================================
   Verras mij
   --------------------------------------------------------------------------
   Kiest willekeurig een beschikbare snack (niet dezelfde als net) en toont
   kort een 'bestelbonnetje' dat de bestelling klaarmaakt. Bij minder
   beweging verschijnt direct het resultaat.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { t, toast } = ns.ui;
  // Vertragende 'rol' langs de titels: samen ca. 1,2 seconde.
  const REEL_DELAYS = [70, 70, 75, 85, 95, 110, 130, 155, 185, 225];
  const HOLD_MS = 750;
  const HOLD_REDUCED_MS = 1000;

  let dialog = null;
  let ticket = null;
  let orderEl = null;
  let statusEl = null;
  let reelEl = null;
  let metaEl = null;
  let getSnacks = null;
  let onChosen = null;
  let busy = false;
  let timers = [];
  let orderNumber = 100 + Math.floor(Math.random() * 800);

  function init(options) {
    getSnacks = options.getSnacks;
    onChosen = options.onChosen;
    dialog = document.getElementById('surprise-dialog');
    ticket = document.getElementById('ticket');
    orderEl = document.getElementById('ticket-order');
    statusEl = document.getElementById('surprise-status');
    reelEl = document.getElementById('ticket-reel');
    metaEl = document.getElementById('ticket-meta');
    ticket.setAttribute('tabindex', '-1');
    ns.a11y.registerDialog(dialog, { closeOnBackdrop: false, onCancel: cancel });
  }

  function availableSnacks() {
    return getSnacks().filter((snack) => snack.available);
  }

  /** Kies een snack: niet de huidige en liefst niet de vorige verrassing. */
  function pick(excludeId) {
    const available = availableSnacks();
    if (!available.length) return null;
    const lastSurprise = ns.storage.get('lastSurprise', null);
    let pool = available.filter((snack) => snack.id !== excludeId && snack.id !== lastSurprise);
    if (!pool.length) pool = available.filter((snack) => snack.id !== excludeId);
    if (!pool.length) pool = available;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function start(options) {
    if (busy) return;
    const excludeId = options && options.excludeId;
    const target = pick(excludeId);
    if (!target) {
      toast(t('surpriseNone'), { tone: 'warning' });
      return;
    }
    busy = true;
    ns.storage.set('lastSurprise', target.id);
    ns.storage.recordSurprise();
    orderNumber += 1;

    ticket.classList.remove('is-running', 'is-done');
    orderEl.textContent = t('surpriseOrder', { number: String(orderNumber).padStart(4, '0') });
    statusEl.textContent = t('surprisePreparing');
    metaEl.textContent = '';
    reelEl.textContent = '…';
    ns.a11y.openDialog(dialog, { initialFocus: ticket });

    if (ns.a11y.prefersReducedMotion()) {
      showResult(target, HOLD_REDUCED_MS);
      return;
    }
    runReel(target);
  }

  function runReel(target) {
    const pool = availableSnacks();
    const total = REEL_DELAYS.reduce((sum, delay) => sum + delay, 0);
    ticket.style.setProperty('--ticket-duration', total + 'ms');
    ticket.classList.add('is-running');

    let previousId = null;
    let step = 0;
    const next = () => {
      if (step >= REEL_DELAYS.length) {
        showResult(target, HOLD_MS);
        return;
      }
      const isLast = step === REEL_DELAYS.length - 1;
      const snack = isLast ? target : randomOther(pool, previousId);
      previousId = snack.id;
      setReel(snack.title);
      schedule(next, REEL_DELAYS[step]);
      step += 1;
    };
    next();
  }

  function randomOther(pool, previousId) {
    const options = pool.length > 1 ? pool.filter((snack) => snack.id !== previousId) : pool;
    return options[Math.floor(Math.random() * options.length)];
  }

  function setReel(text) {
    reelEl.textContent = text;
    reelEl.classList.remove('is-ticking');
    void reelEl.offsetWidth; // herstart de korte tik-animatie
    reelEl.classList.add('is-ticking');
  }

  function showResult(target, holdMs) {
    ticket.classList.remove('is-running');
    ticket.classList.add('is-done');
    reelEl.classList.remove('is-ticking');
    reelEl.textContent = target.title;
    metaEl.textContent = [t('cardNumber', { number: target.number }), target.duration].filter(Boolean).join(' · ');
    statusEl.textContent = t('surpriseReady');
    schedule(() => finish(target), holdMs);
  }

  function finish(target) {
    clearTimers();
    busy = false;
    ns.a11y.closeDialog(dialog);
    onChosen(target);
  }

  /** Afbreken (Escape of kioskreset): er wordt niets geopend. */
  function cancel() {
    clearTimers();
    busy = false;
    ticket.classList.remove('is-running', 'is-done');
    ns.a11y.closeDialog(dialog);
  }

  function schedule(callback, delay) {
    timers.push(window.setTimeout(callback, delay));
  }

  function clearTimers() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  }

  ns.surprise = {
    init,
    start,
    cancel
  };
})(window.AISnackbar);
