/* ==========================================================================
   Toegankelijkheid: minder beweging, schermlezermeldingen, focus en dialogen.
   ========================================================================== */
(function (ns) {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let forceReducedMotion = false;

  function setForceReducedMotion(value) {
    forceReducedMotion = Boolean(value);
    document.documentElement.classList.toggle('reduce-motion', forceReducedMotion);
  }

  function prefersReducedMotion() {
    return forceReducedMotion || reducedMotionQuery.matches;
  }

  /** Meldt een korte tekst aan schermlezers (zonder visuele verandering). */
  function announce(message) {
    const region = document.getElementById('announcer');
    if (!region) return;
    region.textContent = '';
    // Kleine vertraging zodat dezelfde tekst ook een tweede keer wordt voorgelezen.
    window.setTimeout(() => {
      region.textContent = message;
    }, 80);
  }

  /** Zet focus op een element, ook als het van nature niet focusbaar is. */
  function focusElement(node) {
    if (!node) return;
    if (!node.matches('a[href], button, input, select, textarea, [tabindex]')) {
      node.setAttribute('tabindex', '-1');
    }
    node.focus({ preventScroll: true });
  }

  /* ---- Dialogen -------------------------------------------------------------
     We gebruiken het native <dialog>-element met showModal(): de browser
     regelt dan de focusval, maakt de rest van de pagina inert en sluit met
     Escape. Hier voegen we een consistente open/sluit-afhandeling aan toe. */
  const dialogHandlers = new WeakMap();

  /**
   * Registreert een dialoog.
   * - onCancel: wat Escape (of een klik op de achtergrond) doet. Standaard: sluiten.
   * - closeOnBackdrop: klik naast het paneel sluit de dialoog.
   */
  function registerDialog(dialog, options) {
    const opts = Object.assign({ closeOnBackdrop: true, onCancel: null, onClose: null }, options);
    dialogHandlers.set(dialog, opts);

    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      if (opts.onCancel) opts.onCancel();
      else closeDialog(dialog);
    });

    dialog.addEventListener('close', () => {
      if (opts.onClose) opts.onClose();
    });

    if (opts.closeOnBackdrop) {
      dialog.addEventListener('click', (event) => {
        // Een klik op de achtergrond heeft het dialoogelement zelf als doel.
        if (event.target !== dialog) return;
        if (opts.onCancel) opts.onCancel();
        else closeDialog(dialog);
      });
    }

    dialog.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', () => closeDialog(dialog));
    });
  }

  function openDialog(dialog, options) {
    if (!dialog || dialog.open) return;
    const opts = options || {};
    try {
      dialog.showModal();
    } catch (error) {
      // Bijvoorbeeld als de dialoog (nog) niet in het document staat.
      console.error('[AI Snackbar] Dialoog kon niet openen:', error);
      return;
    }
    const target = opts.initialFocus || dialog.querySelector('[autofocus]') || dialog.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
    if (target) target.focus({ preventScroll: true });
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }

  function isAnyDialogOpen() {
    return Boolean(document.querySelector('dialog[open]'));
  }

  /**
   * Maakt alles naast `element` inert (niet bereikbaar met tab, aanraking of
   * schermlezer), bijv. zolang de videospeler het hele scherm vult. Dialogen,
   * meldingen en de schermlezerregio blijven werken. Geeft een functie terug
   * die alles herstelt.
   */
  function isolate(element) {
    const changed = [];
    let node = element;
    while (node.parentElement && node !== document.body) {
      Array.from(node.parentElement.children).forEach((sibling) => {
        if (sibling === node || sibling.inert || keepsActive(sibling)) return;
        sibling.inert = true;
        changed.push(sibling);
      });
      node = node.parentElement;
    }
    return () => changed.forEach((sibling) => {
      sibling.inert = false;
    });
  }

  function keepsActive(node) {
    return node.matches('dialog, script, [aria-live], .kiosk-pill');
  }

  /* ---- Lang indrukken (verborgen toegang tot beheer) ---------------------- */
  function onLongPress(target, durationMs, onComplete) {
    let timer = null;
    let startX = 0;
    let startY = 0;
    const MOVE_TOLERANCE = 12;

    target.style.setProperty('--press-duration', durationMs + 'ms');

    function cancel() {
      window.clearTimeout(timer);
      timer = null;
      target.classList.remove('is-pressing');
    }

    target.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      startX = event.clientX;
      startY = event.clientY;
      target.classList.add('is-pressing');
      timer = window.setTimeout(() => {
        cancel();
        onComplete();
      }, durationMs);
    });

    target.addEventListener('pointermove', (event) => {
      if (!timer) return;
      if (Math.abs(event.clientX - startX) > MOVE_TOLERANCE || Math.abs(event.clientY - startY) > MOVE_TOLERANCE) cancel();
    });

    ['pointerup', 'pointerleave', 'pointercancel'].forEach((type) => target.addEventListener(type, cancel));
    // Geen contextmenu of tekstselectie tijdens het ingedrukt houden (touch).
    target.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  ns.a11y = {
    setForceReducedMotion,
    prefersReducedMotion,
    announce,
    focusElement,
    registerDialog,
    openDialog,
    closeDialog,
    isAnyDialogOpen,
    isolate,
    onLongPress
  };
})(window.AISnackbar);
