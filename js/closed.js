/* ==========================================================================
   Snackbar gesloten ('Even gesloten'-scherm)
   --------------------------------------------------------------------------
   Een beheerder sluit de snackbar in Admin → Beheer & test (centraal in
   Supabase, geldt meteen voor iedereen) of zet hem vast dicht met siteClosed
   in js/config.js. Op het online adres zien bezoekers dan alleen dit scherm,
   in de snackbar én op de promptpagina. Een lokale kopie (tablets bij de
   stand) blijft altijd open.

   Een beheerder komt erin door op het scherm in te loggen (Supabase Auth,
   hetzelfde account als het dashboard). Dat tabblad blijft daarna open tot
   het wordt gesloten: alleen een vlag in sessionStorage, geen persoonsgegevens.

   Let op: een drempel tegen doorsturen, geen beveiliging. Wie de losse
   bestanden op het online adres opvraagt, kan de inhoud nog steeds lezen.
   ========================================================================== */
(function (ns) {
  'use strict';

  const CHECK_TIMEOUT_MS = 3000;
  const root = document.documentElement;

  let ctx = null;
  let screen = null;
  let inertNodes = [];

  /**
   * Roep aan aan het eind van het opstarten (na eventuele dialogen zoals het welkomstscherm).
   * @param {object} context { config, onShow, onHide } — onShow/onHide: bijv. de kioskreset pauzeren
   */
  async function init(context) {
    ctx = context;
    if (isLocalCopy() || openedByAdmin()) return;
    if (ctx.config.siteClosed) {
      show(false);
      return;
    }
    if (!ns.central.isEnabled()) return;
    // Niets tonen tot we het weten (hooguit enkele seconden; geen antwoord = open).
    root.classList.add('is-closed-check');
    const state = await ns.central.readClosed(CHECK_TIMEOUT_MS);
    root.classList.remove('is-closed-check');
    if (state === 'closed') show(false);
  }

  function isLocalCopy() {
    return window.location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
  }

  function flagKey() {
    return ctx.config.storageNamespace + ':beheerder-open';
  }

  function openedByAdmin() {
    try {
      return window.sessionStorage.getItem(flagKey()) === '1';
    } catch (error) {
      return false;
    }
  }

  /** Dit tabblad blijft open: een beheerder logde in op het gesloten-scherm. */
  function rememberAdmin() {
    try {
      window.sessionStorage.setItem(flagKey(), '1');
    } catch (error) {
      // Opslag geblokkeerd: dan alleen tot herladen.
    }
  }

  function isShown() {
    return Boolean(screen);
  }

  /** preview: voorbeeld vanuit beheer, met een knop om het weer te sluiten in plaats van inloggen. */
  function show(preview) {
    if (screen) return;
    document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
    inertNodes = Array.from(document.body.children).filter((node) => !node.inert);
    inertNodes.forEach((node) => {
      node.inert = true;
    });
    screen = build(preview);
    document.body.append(screen);
    root.classList.add('is-closed');
    if (ctx.onShow) ctx.onShow();
    screen.querySelector('#closed-title').focus();
  }

  function hide() {
    if (!screen) return;
    screen.remove();
    screen = null;
    inertNodes.forEach((node) => {
      node.inert = false;
    });
    inertNodes = [];
    root.classList.remove('is-closed');
    if (ctx.onHide) ctx.onHide();
  }

  function build(preview) {
    const { el, t } = ns.ui;
    let action = null;
    if (preview) action = previewButton();
    else if (ns.central.isEnabled()) action = adminArea();
    return el('section', { className: 'closed on-dark', attrs: { 'aria-labelledby': 'closed-title', 'aria-describedby': 'closed-text' } }, [
      el('div', { className: 'closed__awning', attrs: { 'aria-hidden': 'true' } }, el('div', { className: 'awning-edge' })),
      el('div', { className: 'closed__content' }, [
        el('div', { className: 'closed__sign', attrs: { 'aria-hidden': 'true' } }, el('span', { className: 'closed__board', text: t('closedSign') })),
        el('p', { className: 'closed__eyebrow', text: t('closedEyebrow') }),
        el('h1', { className: 'closed__title', attrs: { id: 'closed-title', tabindex: '-1' }, text: t('closedTitle') }),
        el('p', { className: 'closed__text', attrs: { id: 'closed-text' }, text: t('closedText') }),
        el('p', { className: 'closed__footer', text: t('closedFooter') }),
        action
      ])
    ]);
  }

  function previewButton() {
    const { el, icon, t } = ns.ui;
    return el('button', { className: 'btn btn--surprise closed__preview', attrs: { type: 'button' }, on: { click: hide } }, [icon('close'), el('span', { text: t('closedPreviewClose') })]);
  }

  /* ---- Inloggen als beheerder ------------------------------------------------ */
  function adminArea() {
    const { el, icon, t } = ns.ui;
    const email = el('input', { className: 'license__input', attrs: { id: 'closed-email', type: 'email', autocomplete: 'username', spellcheck: 'false', 'aria-describedby': 'closed-error' } });
    const password = el('input', { className: 'license__input', attrs: { id: 'closed-password', type: 'password', autocomplete: 'current-password', 'aria-describedby': 'closed-error' } });
    const error = el('p', { className: 'code__error', attrs: { id: 'closed-error', role: 'alert' } });
    const submit = el('button', { className: 'btn btn--primary', attrs: { type: 'submit' } }, [icon('key'), el('span', { text: t('closedSubmit') })]);
    const form = el('form', { className: 'closed__form', attrs: { id: 'closed-form', novalidate: true, hidden: true } }, [
      el('p', { className: 'closed__hint', text: t('closedAdminHint') }),
      field(email, t('closedEmailLabel')),
      field(password, t('closedPasswordLabel')),
      error,
      submit
    ]);
    const toggle = el('button', { className: 'btn btn--ghost-dark btn--sm', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'closed-form' } }, [icon('key'), el('span', { text: t('closedAdminButton') })]);

    toggle.addEventListener('click', () => {
      form.hidden = !form.hidden;
      toggle.setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) email.focus();
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!email.value.trim() || !password.value) {
        error.textContent = t('closedMissing');
        return;
      }
      submit.disabled = true;
      error.textContent = '';
      const result = await signIn(email.value.trim(), password.value);
      submit.disabled = false;
      password.value = '';
      if (result !== 'ok') {
        error.textContent = t({ notAdmin: 'closedNotAdmin', offline: 'closedOffline' }[result] || 'closedLoginFailed');
        password.focus();
        return;
      }
      rememberAdmin();
      hide();
      ns.ui.toast(t('closedUnlockedToast'), { tone: 'success', duration: 7000 });
    });
    return el('div', { className: 'closed__admin' }, [toggle, form]);
  }

  function field(input, label) {
    const { el } = ns.ui;
    return el('div', { className: 'license__field' }, [el('label', { className: 'license__label', attrs: { for: input.id }, text: label }), input]);
  }

  /** @returns {Promise<'ok'|'failed'|'notAdmin'|'offline'>} */
  async function signIn(email, password) {
    try {
      if (!(await ns.central.signIn(email, password))) return 'failed';
      if (await ns.central.isAdmin()) return 'ok';
      ns.central.signOut();
      return 'notAdmin';
    } catch (error) {
      return 'offline';
    }
  }

  ns.closed = {
    init,
    isShown,
    preview: () => show(true)
  };
})(window.AISnackbar);
