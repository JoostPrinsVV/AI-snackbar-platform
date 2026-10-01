/* ==========================================================================
   Navigatie
   --------------------------------------------------------------------------
   Eenvoudige hash-routes, die ook via file:// werken:
     #/                 snackkaart
     #/snack/<id>       detailpagina van een snack
     #/beheer           opent het beheerscherm (voor testen)
   Alles wat niet herkend wordt, gaat netjes terug naar de snackkaart.
   ========================================================================== */
(function (ns) {
  'use strict';

  const SNACK_ROUTE = /^#\/snack\/([a-z0-9][a-z0-9-]*)\/?$/;
  const ADMIN_ROUTE = /^#\/beheer\/?$/;
  const MENU_HASH = '#/';

  let handler = null;
  let current = { name: 'menu' };
  // Houdt bij of de detailpagina via de snackkaart is geopend, zodat 'terug'
  // de browsergeschiedenis netjes opruimt (belangrijk bij veeggebaren op touch).
  let enteredFromMenu = false;

  function parse(hash) {
    if (!hash || hash === '#' || hash === MENU_HASH) return { name: 'menu' };
    const snackMatch = hash.match(SNACK_ROUTE);
    if (snackMatch) return { name: 'snack', id: snackMatch[1] };
    if (ADMIN_ROUTE.test(hash)) return { name: 'admin' };
    return { name: 'unknown', hash };
  }

  function dispatch() {
    const next = parse(window.location.hash);
    const previous = current;
    current = next;
    if (handler) handler(next, previous);
  }

  function start(onRoute, options) {
    handler = onRoute;
    window.addEventListener('hashchange', dispatch);
    const initial = parse(window.location.hash);
    if (options && options.resetOnLoad && initial.name === 'snack') {
      // Na herladen altijd beginnen op de snackkaart (kiosk).
      window.history.replaceState(null, '', MENU_HASH);
    }
    dispatch();
  }

  function toSnack(id, options) {
    const hash = '#/snack/' + id;
    if (window.location.hash === hash) return;
    if (options && options.replace) {
      window.location.replace(hash);
      return;
    }
    enteredFromMenu = current.name === 'menu';
    window.location.hash = hash;
  }

  /**
   * Terug naar de snackkaart.
   * immediate: direct (synchroon) tonen, bijv. bij een kioskreset.
   */
  function toMenu(options) {
    const opts = options || {};
    if (opts.immediate) {
      enteredFromMenu = false;
      window.history.replaceState(null, '', MENU_HASH);
      dispatch();
      return;
    }
    if (current.name === 'menu' && parse(window.location.hash).name === 'menu') return;
    if (current.name === 'snack' && enteredFromMenu && !opts.replace) {
      enteredFromMenu = false;
      window.history.back();
      return;
    }
    enteredFromMenu = false;
    window.location.replace(MENU_HASH);
  }

  /**
   * Voert een schermwissel uit met een vloeiende overgang (View Transitions),
   * als de browser dat ondersteunt en beweging niet beperkt is.
   * Geeft een Promise terug die klaar is als de overgang voorbij is.
   */
  function transition(update, options) {
    const direction = (options && options.direction) || 'forward';
    const root = document.documentElement;
    const canAnimate = typeof document.startViewTransition === 'function' && !ns.a11y.prefersReducedMotion();

    if (!canAnimate) {
      update();
      return Promise.resolve();
    }
    root.dataset.nav = direction;
    try {
      const viewTransition = document.startViewTransition(update);
      // Een overgang kan worden overgeslagen (bijv. snel achter elkaar tikken of
      // een tablet die net in slaapstand gaat). De schermwissel zelf gaat dan gewoon door.
      viewTransition.ready.catch(() => undefined);
      viewTransition.updateCallbackDone.catch((error) => console.error('[AI Snackbar] Schermwissel mislukt:', error));
      return viewTransition.finished
        .catch(() => undefined)
        .finally(() => {
          delete root.dataset.nav;
        });
    } catch (error) {
      console.warn('[AI Snackbar] Overgang overgeslagen:', error);
      delete root.dataset.nav;
      update();
      return Promise.resolve();
    }
  }

  function hrefForSnack(id) {
    return '#/snack/' + id;
  }

  ns.navigation = {
    start,
    toSnack,
    toMenu,
    transition,
    hrefForSnack
  };
})(window.AISnackbar);
