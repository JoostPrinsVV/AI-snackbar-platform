/* ==========================================================================
   Welkomstscherm en 'Over de AI Snackbar'
   --------------------------------------------------------------------------
   Het welkomstscherm verschijnt bij de start en (optioneel) na iedere
   kioskreset, als een soort lokscherm voor de volgende bezoeker.
   ========================================================================== */
(function (ns) {
  'use strict';

  const { t } = ns.ui;

  let config = null;
  let introDialog = null;
  let aboutDialog = null;

  function init(options) {
    config = options.config;
    introDialog = document.getElementById('intro-dialog');
    aboutDialog = document.getElementById('about-dialog');

    document.getElementById('intro-eyebrow').textContent = config.eventName ? t('introEyebrow') : '';
    document.getElementById('about-organizer').textContent = config.organizationName ? t('aboutOrganizer') : '';

    ns.a11y.registerDialog(introDialog, {
      closeOnBackdrop: true,
      // Focus naar de kop van het zichtbare scherm, zodat toetsenbord en schermlezer verder kunnen.
      onClose: () => ns.a11y.focusElement(document.querySelector('.view:not([hidden]) h1'))
    });
    ns.a11y.registerDialog(aboutDialog);

    document.getElementById('intro-open').addEventListener('click', closeIntro);
    document.getElementById('about-button').addEventListener('click', openAbout);
  }

  function showIntro() {
    if (!config.showIntro) return;
    // Focus op de titel (geen focusring op touch); met Tab kom je direct bij de knop.
    ns.a11y.openDialog(introDialog, { initialFocus: document.getElementById('intro-title') });
  }

  function closeIntro() {
    ns.a11y.closeDialog(introDialog);
  }

  function isIntroOpen() {
    return Boolean(introDialog && introDialog.open);
  }

  function openAbout() {
    ns.a11y.openDialog(aboutDialog);
  }

  ns.intro = {
    init,
    showIntro,
    isIntroOpen
  };
})(window.AISnackbar);
