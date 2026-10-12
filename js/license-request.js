/* ==========================================================================
   Copilot-licentie aanvragen
   --------------------------------------------------------------------------
   Dialoog #license-dialog: eerst wat een licentie toevoegt, dan naam,
   zakelijk e-mailadres en een verplichte toelichting (businesscase) van
   minimaal licenseMinWords woorden.
   - Alleen op een eigen apparaat (niet op de kiosk) en alleen met centrale
     opslag: de aanvraag gaat direct naar Supabase (js/central.js) en wordt
     nooit op het apparaat bewaard. Lezen en wissen: alleen de beheerder.
   - Gebruikt door de snackbar (index.html) én de promptpagina (prompts/),
     die allebei dezelfde dialoog-markup hebben. Knoppen die de dialoog
     openen dragen het attribuut data-license-request.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { t } = ns.ui;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MAX_NAME = 100;
  const MAX_EMAIL = 254;
  const MAX_MOTIVATION = 4000;

  let config = null;
  let busy = false;
  const refs = {};

  function init(options) {
    config = options.config;
    const byId = (id) => document.getElementById(id);
    Object.assign(refs, {
      dialog: byId('license-dialog'),
      title: byId('license-title'),
      form: byId('license-form'),
      name: byId('license-name'),
      email: byId('license-email'),
      motivation: byId('license-motivation'),
      counter: byId('license-counter'),
      error: byId('license-error'),
      submit: byId('license-submit'),
      done: byId('license-done'),
      doneText: byId('license-done-text')
    });
    const triggers = document.querySelectorAll('[data-license-request]');
    triggers.forEach((node) => {
      node.hidden = !isEnabled();
    });
    if (!refs.dialog || !isEnabled()) return;

    if (ns.a11y) {
      // Niet sluiten bij een tik naast het venster: dan ben je je getypte toelichting kwijt.
      ns.a11y.registerDialog(refs.dialog, { closeOnBackdrop: false });
    } else {
      // Promptpagina: geen accessibility.js geladen; sluiten via de knoppen (Escape doet de browser zelf).
      refs.dialog.querySelectorAll('[data-close]').forEach((button) => {
        button.addEventListener('click', () => refs.dialog.close());
      });
    }
    refs.email.placeholder = config.licenseRequestDomains.length ? 'naam@' + config.licenseRequestDomains[0] : t('promptMailPlaceholder');
    refs.motivation.maxLength = MAX_MOTIVATION;
    refs.form.addEventListener('submit', submit);
    refs.motivation.addEventListener('input', updateCounter);
    [refs.name, refs.email, refs.motivation].forEach((input) => {
      input.addEventListener('input', () => showError('', input));
    });
    // Knoppen die later worden gebouwd (bijv. per snack) werken ook: één luisteraar op het document.
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-license-request]');
      if (!trigger) return;
      event.preventDefault();
      // Vanuit een ander venster (bijv. Over de AI Snackbar): dat eerst sluiten.
      const parent = trigger.closest('dialog');
      if (parent && parent !== refs.dialog) parent.close();
      open();
    });
    // Sluiten = niets laten staan (ook geen half ingevulde toelichting).
    refs.dialog.addEventListener('close', clear);
  }

  /** Op de kiosk nooit: daar zou de volgende bezoeker iemands naam en toelichting kunnen zien. */
  function isEnabled() {
    return Boolean(config && config.enableLicenseRequests && config.kioskMode === false && ns.central.isEnabled());
  }

  function open() {
    if (!isEnabled()) return;
    clear();
    if (ns.a11y) ns.a11y.openDialog(refs.dialog, { initialFocus: refs.title });
    else {
      refs.dialog.showModal();
      refs.title.focus({ preventScroll: true });
    }
    refs.dialog.querySelector('.modal__panel').scrollTop = 0; // weer bovenaan beginnen
  }

  function countWords(text) {
    const words = text.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
    return words ? words.length : 0;
  }

  function wordsLeft() {
    return Math.max(0, config.licenseMinWords - countWords(refs.motivation.value));
  }

  function updateCounter() {
    const left = wordsLeft();
    const count = countWords(refs.motivation.value);
    refs.counter.textContent = left ? t('licenseWordsLeft', { count: left, min: config.licenseMinWords }) : t('licenseWordsOk', { count });
    refs.counter.classList.toggle('is-ok', !left);
  }

  function showError(message, input) {
    refs.error.textContent = message;
    refs.error.hidden = !message;
    [refs.name, refs.email, refs.motivation].forEach((node) => {
      if (message && node === input) node.setAttribute('aria-invalid', 'true');
      else node.removeAttribute('aria-invalid');
    });
  }

  function domainAllowed(email) {
    const domains = config.licenseRequestDomains;
    return !domains.length || domains.some((domain) => email.endsWith('@' + domain));
  }

  /** @returns {{ message: string, input: HTMLElement }|null} */
  function validate(name, email) {
    if (name.length < 2 || name.length > MAX_NAME) return { message: t('licenseNameInvalid'), input: refs.name };
    if (!email || email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email)) return { message: t('licenseEmailInvalid'), input: refs.email };
    if (!domainAllowed(email)) {
      const domains = config.licenseRequestDomains.map((domain) => '@' + domain).join(' of ');
      return { message: t('licenseEmailDomain', { domains }), input: refs.email };
    }
    const left = wordsLeft();
    if (left) return { message: t('licenseMotivationShort', { count: left }), input: refs.motivation };
    return null;
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const name = refs.name.value.trim().replace(/\s+/g, ' ');
    const email = refs.email.value.trim().toLowerCase();
    const motivation = refs.motivation.value.trim();
    const problem = validate(name, email);
    if (problem) {
      showError(problem.message, problem.input);
      problem.input.focus();
      return;
    }
    busy = true;
    refs.submit.disabled = true;
    showError('');
    const result = await ns.central.requestLicense(name, email, motivation);
    busy = false;
    refs.submit.disabled = false;
    if (!refs.dialog.open) return;
    if (result !== 'ok') {
      showError(t(result === 'missing' ? 'licenseUnavailable' : 'licenseFailed'));
      return;
    }
    refs.form.hidden = true;
    refs.doneText.textContent = t('licenseDone', { name: name.split(' ')[0], email });
    refs.done.hidden = false;
    refs.done.focus({ preventScroll: true });
  }

  /** Formulier leeg en terug in de beginstand (bij openen en sluiten). */
  function clear() {
    if (!refs.form) return;
    refs.form.reset();
    refs.form.hidden = false;
    refs.done.hidden = true;
    showError('');
    updateCounter();
  }

  ns.licenseRequest = {
    init,
    isEnabled
  };
})(window.AISnackbar);
