/* ==========================================================================
   'Mail mij deze prompt'
   --------------------------------------------------------------------------
   Iemand laat een e-mailadres achter; de organisatie mailt de prompt na
   afloop (lijst en export in het admin-dashboard). Alleen beschikbaar met
   centrale opslag (js/central.js): het adres gaat direct naar Supabase en
   wordt nooit op het apparaat bewaard.
   - Gedeelde tablet (kiosk): geen automatisch invullen, het veld is na
     versturen meteen leeg en het adres verschijnt niet in beeld.
   - Eigen telefoon/laptop: het adres wordt voor deze sessie onthouden (alleen
     in het geheugen), zodat een tweede prompt één tik is.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { t } = ns.ui;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MAX_EMAIL_LENGTH = 254;

  let config = null;
  let current = null;
  let busy = false;
  let rememberedEmail = '';
  const refs = {};

  function init(options) {
    config = options.config;
    const byId = (id) => document.getElementById(id);
    Object.assign(refs, {
      box: byId('prompt-mail'),
      toggle: byId('prompt-mail-toggle'),
      form: byId('prompt-mail-form'),
      input: byId('prompt-mail-email'),
      submit: byId('prompt-mail-submit'),
      privacy: byId('prompt-mail-privacy-text'),
      error: byId('prompt-mail-error'),
      done: byId('prompt-mail-done')
    });

    refs.box.hidden = true;
    if (!isEnabled()) return;
    refs.privacy.textContent = t('promptMailPrivacy');
    refs.input.autocomplete = config.kioskMode ? 'off' : 'email';
    refs.toggle.addEventListener('click', () => setOpen(refs.form.hidden));
    refs.form.addEventListener('submit', submit);
    refs.input.addEventListener('input', () => showError(''));
  }

  function isEnabled() {
    return Boolean(config && config.enablePromptMail && ns.central.isEnabled());
  }

  function setOpen(open) {
    refs.form.hidden = !open;
    refs.toggle.setAttribute('aria-expanded', String(open));
    if (!open) return;
    refs.done.hidden = true;
    refs.input.value = rememberedEmail;
    refs.input.focus({ preventScroll: true });
  }

  function showError(message) {
    refs.error.textContent = message;
    refs.error.hidden = !message;
    if (message) refs.input.setAttribute('aria-invalid', 'true');
    else refs.input.removeAttribute('aria-invalid');
  }

  async function submit(event) {
    event.preventDefault();
    if (busy || !current) return;
    const email = refs.input.value.trim().toLowerCase();
    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
      showError(t('promptMailInvalid'));
      refs.input.focus();
      return;
    }
    const snack = current;
    busy = true;
    refs.submit.disabled = true;
    showError('');
    const ok = await ns.central.requestPrompt(snack.id, email);
    busy = false;
    refs.submit.disabled = false;
    // Intussen naar een andere snack of gereset? Dan niets meer tonen.
    if (current !== snack) return;
    if (!ok) {
      showError(t(config.kioskMode ? 'promptMailFailedKiosk' : 'promptMailFailed'));
      return;
    }
    if (!config.kioskMode) rememberedEmail = email;
    refs.input.value = '';
    refs.input.blur(); // schermtoetsenbord weg
    setOpen(false);
    refs.done.textContent = config.kioskMode ? t('promptMailDoneKiosk') : t('promptMailDone', { email });
    refs.done.hidden = false;
  }

  function reset() {
    if (!refs.box) return;
    refs.input.value = '';
    showError('');
    refs.done.hidden = true;
    refs.form.hidden = true;
    refs.toggle.setAttribute('aria-expanded', 'false');
  }

  function mount(snack) {
    current = snack;
    reset();
    refs.box.hidden = !isEnabled() || !snack.prompt;
  }

  /** Bij verlaten van de snack: niets laten staan voor de volgende bezoeker. */
  function unmount() {
    current = null;
    reset();
  }

  /** Nieuwe bezoeker (kioskreset). */
  function clearSession() {
    rememberedEmail = '';
    reset();
  }

  ns.promptMail = {
    init,
    isEnabled,
    mount,
    unmount,
    clearSession
  };
})(window.AISnackbar);
