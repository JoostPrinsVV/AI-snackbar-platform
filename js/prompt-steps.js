/* ==========================================================================
   Prompt in stappen (veld prompts in data/snacks.js)
   --------------------------------------------------------------------------
   Een snack met meerdere prompts (bijv. stap 1 in Copilot, stap 2 in Claude)
   toont iedere prompt als een eigen blok dat je open- en dichtklapt, met een
   eigen kopieerknop. De eerste stap staat open.
   Gebruikt door de snackbar (index.html) én de promptpagina (prompts/).
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, setIcon, t, toast } = ns.ui;
  const COPIED_MS = 2400;

  /**
   * @param {HTMLElement} container
   * @param {Array<{ title: string, hint: string, text: string }>} steps
   * @param {{ canCopy: boolean }} options  canCopy: false op de gedeelde tablet
   */
  function render(container, steps, options) {
    container.replaceChildren(
      ...steps.map((step, index) =>
        el('li', { className: 'prompt-step' }, el('details', { className: 'prompt-step__details', attrs: { open: index === 0 } }, [
          el('summary', { className: 'prompt-step__summary' }, [
            el('span', { className: 'prompt-step__number', attrs: { 'aria-hidden': 'true' }, text: String(index + 1) }),
            el('span', { className: 'prompt-step__head' }, [
              el('span', { className: 'prompt-step__title', text: step.title }),
              step.hint ? el('span', { className: 'prompt-step__hint', text: step.hint }) : null
            ]),
            icon('arrow-right', { className: 'prompt-step__chevron' })
          ]),
          el('div', { className: 'prompt-step__body' }, [
            options.canCopy ? copyButton(step) : null,
            el('pre', { className: 'prompt-box__text prompt-step__text is-selectable', attrs: { tabindex: '0' }, text: step.text })
          ])
        ]))
      )
    );
    container.hidden = !steps.length;
  }

  function copyButton(step) {
    const label = el('span', { text: t('copyPrompt') });
    const button = el('button', { className: 'btn btn--copy prompt-step__copy', attrs: { type: 'button', 'aria-label': t('copyStepLabel', { title: step.title }) } }, [icon('copy'), label]);
    let timer = 0;
    button.addEventListener('click', async () => {
      const copied = await copyText(step.text);
      if (!copied) {
        selectText(button.parentElement.querySelector('pre'));
        toast(t('copyFailed'), { tone: 'warning', icon: 'copy', duration: 6000 });
        return;
      }
      window.clearTimeout(timer);
      button.classList.add('is-copied');
      setIcon(button.querySelector('svg'), 'check');
      label.textContent = t('copied');
      if (ns.a11y) ns.a11y.announce(t('copied'));
      timer = window.setTimeout(() => {
        button.classList.remove('is-copied');
        setIcon(button.querySelector('svg'), 'copy');
        label.textContent = t('copyPrompt');
      }, COPIED_MS);
    });
    return button;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.info('[AI Snackbar] Clipboard-API geweigerd, probeer alternatief.', error);
    }
    // Terugval (bijv. via file://): tijdelijk tekstveld selecteren en kopiëren.
    const area = el('textarea', { className: 'sr-only', attrs: { readonly: true, 'aria-hidden': 'true', tabindex: '-1' } });
    area.value = text;
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (error) {
      ok = false;
    }
    area.remove();
    return ok;
  }

  function selectText(node) {
    const selection = window.getSelection();
    if (!selection || !node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  ns.promptSteps = {
    render
  };
})(window.AISnackbar);
