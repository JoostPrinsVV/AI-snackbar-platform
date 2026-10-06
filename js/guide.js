/* ==========================================================================
   Handleiding bij een snack (veld guide in data/snacks.js)
   --------------------------------------------------------------------------
   Een knop onder de prompt opent een korte stap-voor-stap-handleiding in een
   dialoog, met een keuze 'Zonder licentie' (standaard) / 'Met licentie'.
   Gebruikt door de snackbar (index.html) én de promptpagina (prompts/), die
   allebei dezelfde dialoog-markup hebben (#guide-dialog).
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, t } = ns.ui;

  let current = null;
  let variant = 'basic';
  const refs = {};

  function init() {
    const byId = (id) => document.getElementById(id);
    Object.assign(refs, {
      dialog: byId('guide-dialog'),
      title: byId('guide-title'),
      switcher: byId('guide-switch'),
      steps: byId('guide-steps'),
      note: byId('guide-note')
    });
    if (!refs.dialog) return;
    if (ns.a11y) {
      ns.a11y.registerDialog(refs.dialog);
    } else {
      // Promptpagina: geen accessibility.js geladen; sluiten via de knoppen (Escape doet de browser zelf).
      refs.dialog.querySelectorAll('[data-close]').forEach((button) => {
        button.addEventListener('click', () => refs.dialog.close());
      });
    }
    refs.switcher.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-variant]');
      if (!button || !current) return;
      variant = button.dataset.variant;
      render();
    });
  }

  /** @param {{ title: string, basic: object|null, licensed: object|null }} guide */
  function open(guide) {
    if (!refs.dialog || !guide) return;
    current = guide;
    // Zonder licentie is de standaard; heeft de handleiding maar één versie, dan die.
    if (!guide.basic) variant = 'licensed';
    else if (!guide.licensed) variant = 'basic';
    refs.switcher.hidden = !guide.basic || !guide.licensed;
    render();
    if (ns.a11y) ns.a11y.openDialog(refs.dialog, { initialFocus: refs.title });
    else {
      refs.dialog.showModal();
      refs.title.focus({ preventScroll: true });
    }
  }

  function render() {
    const part = current[variant] || current.basic || current.licensed;
    refs.title.textContent = current.title;
    refs.switcher.querySelectorAll('button[data-variant]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.variant === variant));
    });
    refs.steps.replaceChildren(...part.steps.map((step) => el('li', { text: step })));
    refs.note.textContent = part.note;
    refs.note.hidden = !part.note;
  }

  /** Tekst op de knop onder de prompt. */
  function buttonLabel(guide) {
    return guide.label || t('guideDefaultLabel');
  }

  ns.guide = {
    init,
    open,
    buttonLabel
  };
})(window.AISnackbar);
