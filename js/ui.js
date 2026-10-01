/* ==========================================================================
   UI-hulpfuncties: DOM-opbouw, iconen, teksten, meldingen en mediaprobes.
   ========================================================================== */
(function (ns) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const TOAST_LIMIT = 2;

  /* ---- Teksten ----------------------------------------------------------- */
  let dictionary = {};
  let globalVars = {};
  let showMissingKeys = false;
  const reportedMissing = new Set();

  /**
   * @param {object} texts        Teksten voor de gekozen taal (data/texts.js)
   * @param {object} vars         Vaste invulwaarden, zoals {eventName}
   * @param {boolean} debugMode   Ontbrekende teksten zichtbaar maken als [sleutel]
   */
  function setTexts(texts, vars, debugMode) {
    dictionary = texts || {};
    globalVars = vars || {};
    showMissingKeys = Boolean(debugMode);
  }

  function hasText(key) {
    return Object.prototype.hasOwnProperty.call(dictionary, key) && dictionary[key] != null;
  }

  /**
   * Haalt een interfacetekst op en vult {plaatshouders} in.
   * Ontbreekt de tekst, dan blijft het veld leeg (in debugMode: [sleutel]),
   * zodat bezoekers nooit technische namen zien.
   */
  function t(key, vars) {
    if (!hasText(key)) {
      if (!reportedMissing.has(key)) {
        reportedMissing.add(key);
        console.warn('[AI Snackbar] Ontbrekende tekst in data/texts.js:', key);
      }
      return showMissingKeys ? '[' + key + ']' : '';
    }
    const all = Object.assign({}, globalVars, vars);
    return String(dictionary[key]).replace(/\{(\w+)\}/g, (match, name) => (all[name] != null ? String(all[name]) : match));
  }

  /**
   * Vult statische teksten in index.html: data-text (inhoud) en data-label
   * (aria-label). Ontbreekt een tekst, dan blijft de standaardtekst uit de HTML staan.
   */
  function applyStaticTexts(root) {
    root.querySelectorAll('[data-text]').forEach((node) => {
      if (hasText(node.dataset.text)) node.textContent = t(node.dataset.text);
    });
    root.querySelectorAll('[data-label]').forEach((node) => {
      if (hasText(node.dataset.label)) node.setAttribute('aria-label', t(node.dataset.label));
    });
    root.querySelectorAll('[data-placeholder]').forEach((node) => {
      if (hasText(node.dataset.placeholder)) node.setAttribute('placeholder', t(node.dataset.placeholder));
    });
  }

  /* ---- DOM ----------------------------------------------------------------- */
  /**
   * Maakt een element. Opties: className, text, attrs, dataset, on.
   * Kinderen mogen nodes of strings zijn; null/false wordt overgeslagen.
   */
  function el(tag, options, children) {
    const node = document.createElement(tag);
    const opts = options || {};
    if (opts.className) node.className = opts.className;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.attrs) {
      Object.entries(opts.attrs).forEach(([name, value]) => {
        if (value === false || value == null) return;
        node.setAttribute(name, value === true ? '' : String(value));
      });
    }
    if (opts.dataset) Object.assign(node.dataset, opts.dataset);
    if (opts.on) {
      Object.entries(opts.on).forEach(([type, handler]) => node.addEventListener(type, handler));
    }
    append(node, children);
    return node;
  }

  function append(parent, children) {
    if (children == null) return parent;
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return parent;
  }

  /** Inline SVG-icoon uit de sprite in index.html. */
  function icon(name, options) {
    const opts = options || {};
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', ('icon ' + (opts.className || '')).trim());
    svg.setAttribute('focusable', 'false');
    if (opts.label) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', opts.label);
    } else {
      svg.setAttribute('aria-hidden', 'true');
    }
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-' + name);
    svg.append(use);
    return svg;
  }

  function setIcon(svg, name) {
    const use = svg && svg.querySelector('use');
    if (use) use.setAttribute('href', '#i-' + name);
  }

  /** Drie stippen voor het niveau (1-3). Decoratief: het niveau staat er altijd als tekst naast. */
  function levelDots(rank) {
    if (!rank) return null;
    return el('span', { className: 'level-dots', attrs: { 'aria-hidden': 'true' }, dataset: { level: String(rank) } }, [el('i'), el('i'), el('i')]);
  }

  /**
   * Afbeelding met terugvaloptie: bij een ontbrekend bestand wordt de
   * afbeelding vervangen door `fallback()` (een node), zonder foutmelding voor de bezoeker.
   */
  function imageWithFallback(src, alt, fallback, className) {
    if (!src) return fallback();
    const img = el('img', { className: className || '', attrs: { src, alt: alt || '', draggable: 'false', decoding: 'async' } });
    img.addEventListener(
      'error',
      () => {
        console.info('[AI Snackbar] Afbeelding niet gevonden, placeholder getoond:', src);
        img.replaceWith(fallback());
      },
      { once: true }
    );
    return img;
  }

  /* ---- Mediaprobes (werken ook via file://, waar fetch() niet mag) -------- */
  function probeImage(src, timeoutMs) {
    return new Promise((resolve) => {
      if (!src) {
        resolve({ status: 'empty' });
        return;
      }
      const img = new Image();
      const timer = window.setTimeout(() => finish('timeout'), timeoutMs || 6000);
      function finish(status) {
        window.clearTimeout(timer);
        img.onload = img.onerror = null;
        resolve({ status });
      }
      img.onload = () => finish('ok');
      img.onerror = () => finish('missing');
      img.src = src;
    });
  }

  function probeVideo(src, timeoutMs) {
    return new Promise((resolve) => {
      if (!src) {
        resolve({ status: 'empty' });
        return;
      }
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      const timer = window.setTimeout(() => finish('timeout'), timeoutMs || 8000);
      function finish(status, duration) {
        window.clearTimeout(timer);
        video.removeAttribute('src');
        video.load();
        resolve({ status, duration });
      }
      video.addEventListener('loadedmetadata', () => finish('ok', video.duration), { once: true });
      video.addEventListener('error', () => finish('missing'), { once: true });
      video.src = src;
    });
  }

  /**
   * Controleert een HTML-demo: laadt hem verborgen (afgeschermd) en wacht tot
   * de demo zich meldt met { source: 'ai-snackbar-demo', event: 'ready' }.
   * 'timeout' = bestand ontbreekt, of de demo mist de koppeling met de snackbar.
   */
  function probeDemo(src, timeoutMs) {
    return new Promise((resolve) => {
      if (!src) {
        resolve({ status: 'empty' });
        return;
      }
      const frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      frame.className = 'probe-frame';
      const timer = window.setTimeout(() => finish('timeout'), timeoutMs || 6000);
      function onMessage(event) {
        if (event.source === frame.contentWindow && event.data && event.data.source === 'ai-snackbar-demo' && event.data.event === 'ready') finish('ok');
      }
      function finish(status) {
        window.clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        frame.remove();
        resolve({ status });
      }
      window.addEventListener('message', onMessage);
      frame.src = src;
      document.body.append(frame);
    });
  }

  /** Controleert een ondertitelbestand via een verborgen <track>. */
  function probeTrack(src, timeoutMs) {
    return new Promise((resolve) => {
      if (!src) {
        resolve({ status: 'empty' });
        return;
      }
      const video = document.createElement('video');
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = src;
      track.default = true;
      video.append(track);
      const timer = window.setTimeout(() => finish('timeout'), timeoutMs || 5000);
      function finish(status) {
        window.clearTimeout(timer);
        resolve({ status });
      }
      track.addEventListener('load', () => finish('ok'), { once: true });
      track.addEventListener('error', () => finish('missing'), { once: true });
      track.track.mode = 'hidden';
    });
  }

  /* ---- Tijd ---------------------------------------------------------------- */
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '–:––';
    const whole = Math.floor(seconds);
    const minutes = Math.floor(whole / 60);
    const rest = String(whole % 60).padStart(2, '0');
    return minutes + ':' + rest;
  }

  /** Uitgeschreven tijd voor schermlezers, bijv. '1 minuut 5 seconden'. */
  function formatSpokenTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '';
    const whole = Math.floor(seconds);
    const minutes = Math.floor(whole / 60);
    const rest = whole % 60;
    const parts = [];
    if (minutes) parts.push(minutes + (minutes === 1 ? ' minuut' : ' minuten'));
    if (rest || !minutes) parts.push(rest + (rest === 1 ? ' seconde' : ' seconden'));
    return parts.join(' ');
  }

  /* ---- Meldingen (toasts) --------------------------------------------------- */
  function toastRegion() {
    return document.getElementById('toast-region');
  }

  /**
   * Een modale dialoog staat in de 'top layer' en maakt de rest van de pagina
   * inert. Daarom verhuist de meldingenregio mee naar de bovenste open dialoog.
   */
  function placeToastRegion() {
    const region = toastRegion();
    if (!region) return null;
    const openDialogs = Array.from(document.querySelectorAll('dialog[open]'));
    const host = openDialogs.length ? openDialogs[openDialogs.length - 1] : document.body;
    if (region.parentElement !== host) host.append(region);
    return region;
  }

  function toast(message, options) {
    const opts = options || {};
    const region = placeToastRegion();
    if (!region) return;
    while (region.children.length >= TOAST_LIMIT) region.firstElementChild.remove();

    const tone = opts.tone || 'info';
    const iconName = opts.icon || (tone === 'success' ? 'check-circle' : tone === 'warning' ? 'alert' : 'info');
    const item = el('div', { className: 'toast toast--' + tone }, [icon(iconName), el('span', { text: message })]);
    region.append(item);

    window.setTimeout(() => {
      item.classList.add('is-leaving');
      item.addEventListener('animationend', () => item.remove(), { once: true });
      // Vangnet als animaties uit staan
      window.setTimeout(() => item.remove(), 600);
    }, opts.duration || 3400);
  }

  function clearToasts() {
    const region = toastRegion();
    if (!region) return;
    region.replaceChildren();
    if (region.parentElement !== document.body) document.body.append(region);
  }

  ns.ui = {
    setTexts,
    t,
    applyStaticTexts,
    el,
    icon,
    setIcon,
    levelDots,
    imageWithFallback,
    probeImage,
    probeVideo,
    probeDemo,
    probeTrack,
    formatTime,
    formatSpokenTime,
    toast,
    clearToasts
  };
})(window.AISnackbar);
