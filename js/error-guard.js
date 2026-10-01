/* ==========================================================================
   Vangnet voor opstartfouten
   --------------------------------------------------------------------------
   Wordt als eerste en zonder 'defer' geladen. Registreert fouten (ook een
   typefout in data/snacks.js) en toont een nette melding als de app niet
   binnen enkele seconden gestart is. Zo ontstaat nooit een wit scherm.
   ========================================================================== */
(function () {
  'use strict';

  var ns = (window.AISnackbar = window.AISnackbar || {});
  var root = document.documentElement;
  var BOOT_TIMEOUT_MS = 5000;

  root.classList.remove('no-js');
  root.classList.add('js');
  ns.bootErrors = [];

  function shortFileName(url) {
    if (!url) return null;
    var parts = String(url).split(/[\\/]/);
    return parts.slice(-2).join('/');
  }

  function record(entry) {
    ns.bootErrors.push(entry);
    // Technische details alleen in de console.
    console.error('[AI Snackbar]', entry.message, entry.file ? '(' + entry.file + (entry.line ? ':' + entry.line : '') + ')' : '');
    if (typeof ns.onRuntimeError === 'function') ns.onRuntimeError(entry);
  }

  window.addEventListener('error', function (event) {
    // Alleen scriptfouten; ontbrekende afbeeldingen/video's worden per element afgehandeld.
    if (event.target && event.target !== window) return;
    record({ message: event.message || 'Onbekende fout', file: shortFileName(event.filename), line: event.lineno || null });
  });

  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    // Een afgebroken video.play() (bijv. door snel wisselen) is onschuldig.
    if (reason && reason.name === 'AbortError') {
      event.preventDefault();
      return;
    }
    record({ message: String((reason && reason.message) || reason), file: null, line: null });
  });

  function showFatal() {
    var fatal = document.getElementById('fatal');
    if (!fatal) return;
    var detail = document.getElementById('fatal-detail');
    var first = ns.bootErrors[0];
    if (detail && first) {
      detail.textContent = first.file ? first.file + (first.line ? ', regel ' + first.line : '') : first.message;
    }
    fatal.hidden = false;
    var reload = document.getElementById('fatal-reload');
    if (reload) {
      reload.addEventListener('click', function () {
        window.location.reload();
      });
      reload.focus();
    }
  }

  ns.showFatal = showFatal;

  // Waakhond: als app.js niet op tijd 'klaar' meldt, tonen we het vangnet.
  window.setTimeout(function () {
    if (!root.classList.contains('is-ready')) showFatal();
  }, BOOT_TIMEOUT_MS);
})();
