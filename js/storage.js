/* ==========================================================================
   Lokale opslag
   --------------------------------------------------------------------------
   Uitsluitend niet-persoonlijke instellingen, anonieme tellers en anonieme
   feedback, alleen op dit apparaat (localStorage). Geen namen of accounts.
   Alles werkt ook als localStorage uit staat of niet beschikbaar is: dan
   valt de app terug op geheugen dat bij herladen verdwijnt.

   Opgeslagen sleutels (voorvoegsel = storageNamespace uit config.js):
     volume          number    0-1
     muted           boolean
     lastSurprise    snack-id  laatst gekozen door 'Verras mij'
     stats           object    anonieme tellers (zie emptyStats hieronder)
     ratings         object    { snack-id: { happy, neutral, sad } }  (aantallen)
     comments        array     [{ snackId, text, at }]  anonieme opmerking/vraag,
                               max. 1000 tekens per stuk en max. 1000 stuks
     deviceId        string    willekeurige code van deze tablet, alleen om
                               exports van verschillende tablets samen te voegen
     deviceLabel     string    naam van deze tablet (door beheer ingevuld)
     outbox          array     alleen met centrale opslag: anonieme tellers, smileys en
                               opmerkingen die nog naar Supabase moeten (max. 500).
                               Nooit een e-mailadres: dat wordt hier geweigerd.
   ========================================================================== */
(function (ns) {
  'use strict';

  const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/i;
  const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  const HOUR_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}$/;
  const DEVICE_ID_PATTERN = /^[a-z0-9-]{8,40}$/;
  const RATING_KEYS = ['happy', 'neutral', 'sad'];
  const MAX_COMMENTS = 1000;
  const MAX_COMMENT_LENGTH = 1000;
  const MAX_HOURS = 2000;
  const MAX_LABEL_LENGTH = 30;
  const MAX_OUTBOX = 500;
  const OUTBOX_TABLES = ['snack_events', 'snack_ratings', 'snack_comments'];

  // Toegestane sleutels met validatie; al het andere wordt geweigerd.
  const SCHEMA = {
    volume: (value) => typeof value === 'number' && value >= 0 && value <= 1,
    muted: (value) => typeof value === 'boolean',
    lastSurprise: (value) => typeof value === 'string' && ID_PATTERN.test(value),
    stats: isValidStats,
    ratings: isValidRatings,
    comments: isValidComments,
    deviceId: (value) => typeof value === 'string' && DEVICE_ID_PATTERN.test(value),
    deviceLabel: isValidLabel,
    outbox: isValidOutbox
  };

  /* ---- Validatie (ook gebruikt bij het importeren van exports) ------------- */
  function isCount(value) {
    return Number.isInteger(value) && value >= 0;
  }

  function isCountMap(value, keyPattern, maxKeys) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const keys = Object.keys(value);
    return (!maxKeys || keys.length <= maxKeys) && keys.every((key) => keyPattern.test(key) && isCount(value[key]));
  }

  /** Oudere versies bewaarden alleen total/opens/lastOpened; de rest is optioneel. */
  function isValidStats(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    if (!isCount(value.total) || !isCountMap(value.opens, ID_PATTERN)) return false;
    if (value.lastOpened != null && !(typeof value.lastOpened === 'string' && ID_PATTERN.test(value.lastOpened))) return false;
    if (value.plays != null && !isCountMap(value.plays, ID_PATTERN)) return false;
    if (value.completions != null && !isCountMap(value.completions, ID_PATTERN)) return false;
    if (value.visits != null && !isCount(value.visits)) return false;
    if (value.surprises != null && !isCount(value.surprises)) return false;
    if (value.hourly != null && !isCountMap(value.hourly, HOUR_PATTERN, MAX_HOURS)) return false;
    return true;
  }

  function isValidRatings(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    return Object.keys(value).every((id) => {
      const entry = value[id];
      return ID_PATTERN.test(id) && entry && typeof entry === 'object' && RATING_KEYS.every((key) => isCount(entry[key]));
    });
  }

  function isValidComments(value) {
    if (!Array.isArray(value) || value.length > MAX_COMMENTS) return false;
    return value.every(
      (item) =>
        item &&
        typeof item.snackId === 'string' &&
        ID_PATTERN.test(item.snackId) &&
        typeof item.text === 'string' &&
        item.text.length > 0 &&
        item.text.length <= MAX_COMMENT_LENGTH &&
        typeof item.at === 'string' &&
        TIMESTAMP_PATTERN.test(item.at)
    );
  }

  function isValidLabel(value) {
    return typeof value === 'string' && value.length <= MAX_LABEL_LENGTH && /^[\p{L}\p{N} ._-]*$/u.test(value);
  }

  /** Wachtrij voor de centrale opslag: alleen anonieme regels met eenvoudige waarden. */
  function isValidOutbox(value) {
    if (!Array.isArray(value) || value.length > MAX_OUTBOX) return false;
    return value.every((item) => {
      if (!item || !OUTBOX_TABLES.includes(item.t) || !item.r || typeof item.r !== 'object' || Array.isArray(item.r)) return false;
      const keys = Object.keys(item.r);
      if (keys.length > 12 || keys.includes('email')) return false;
      return keys.every((key) => item.r[key] === null || ['string', 'number', 'boolean'].includes(typeof item.r[key])) && JSON.stringify(item.r).length <= 2400;
    });
  }

  function emptyStats() {
    return { total: 0, opens: {}, lastOpened: null, plays: {}, completions: {}, visits: 0, surprises: 0, hourly: {} };
  }

  /** Vult ontbrekende velden aan, zodat oudere of geïmporteerde tellers altijd dezelfde vorm hebben. */
  function normalizeStats(value) {
    return Object.assign(emptyStats(), value || {}, {
      plays: Object.assign({}, value && value.plays),
      completions: Object.assign({}, value && value.completions),
      hourly: Object.assign({}, value && value.hourly),
      opens: Object.assign({}, value && value.opens)
    });
  }

  /* ---- Toestand ------------------------------------------------------------- */
  let prefix = 'ai-snackbar.';
  let persistent = false;
  let reason = 'niet gestart';
  let analyticsEnabled = false;
  const memory = new Map();
  const sessionViewed = new Set();

  function init(config) {
    prefix = String(config.storageNamespace || 'ai-snackbar').replace(/[^a-z0-9-]/gi, '') + '.';
    analyticsEnabled = Boolean(config.enableLocalAnalytics);
    memory.clear();

    if (!config.enableLocalStorage) {
      persistent = false;
      reason = 'uitgeschakeld in config.js';
    } else {
      try {
        const probe = prefix + '__test';
        window.localStorage.setItem(probe, '1');
        window.localStorage.removeItem(probe);
        persistent = true;
        reason = 'beschikbaar';
      } catch (error) {
        // Bijv. privévenster, geblokkeerde opslag of een volle schijf.
        persistent = false;
        reason = 'niet beschikbaar in deze browser';
        console.warn('[AI Snackbar] localStorage niet beschikbaar, we gebruiken tijdelijk geheugen.', error);
      }
    }
    ensureDeviceId();
  }

  function get(key, fallback) {
    if (!SCHEMA[key]) return fallback;
    let value;
    if (persistent) {
      try {
        const raw = window.localStorage.getItem(prefix + key);
        value = raw == null ? undefined : JSON.parse(raw);
      } catch (error) {
        value = undefined;
      }
    } else {
      value = memory.get(key);
    }
    return value !== undefined && SCHEMA[key](value) ? value : fallback;
  }

  function set(key, value) {
    const validate = SCHEMA[key];
    if (!validate || !validate(value)) {
      console.warn('[AI Snackbar] Opslag geweigerd voor', key);
      return false;
    }
    if (!persistent) {
      memory.set(key, value);
      return true;
    }
    try {
      window.localStorage.setItem(prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      memory.set(key, value);
      return false;
    }
  }

  /**
   * Wist alle gegevens van deze snackbar (en alleen deze) op dit apparaat.
   * De naam van de tablet blijft staan; de apparaatcode wordt vernieuwd, zodat
   * een oude en een nieuwe export van dezelfde tablet los worden opgeteld.
   */
  function clearAll() {
    const label = get('deviceLabel', '');
    memory.clear();
    sessionViewed.clear();
    if (persistent) {
      try {
        Object.keys(window.localStorage)
          .filter((name) => name.startsWith(prefix))
          .forEach((name) => window.localStorage.removeItem(name));
      } catch (error) {
        console.warn('[AI Snackbar] Wissen van lokale opslag mislukt.', error);
      }
    }
    if (label) set('deviceLabel', label);
    ensureDeviceId();
  }

  /* ---- Apparaat --------------------------------------------------------------- */
  function ensureDeviceId() {
    if (get('deviceId')) return;
    const random = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    set('deviceId', random.toLowerCase());
  }

  function deviceInfo() {
    // Opslag tussendoor gewist (bijv. door de browser)? Dan direct een nieuwe code.
    if (!get('deviceId')) ensureDeviceId();
    return { deviceId: get('deviceId', 'onbekend'), deviceLabel: get('deviceLabel', '') };
  }

  function setDeviceLabel(label) {
    const clean = String(label || '').trim().slice(0, MAX_LABEL_LENGTH);
    return isValidLabel(clean) && set('deviceLabel', clean);
  }

  /* ---- Anonieme tellers ------------------------------------------------------- */
  function hourKey() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}`;
  }

  function updateStats(change) {
    if (!analyticsEnabled) return;
    const stats = getStats();
    change(stats);
    set('stats', stats);
  }

  /** Ook naar de centrale opslag (als die is ingesteld; js/central.js controleert dat zelf). */
  function track(kind, snackId) {
    if (analyticsEnabled && ns.central) ns.central.track(kind, snackId);
  }

  /** Snack geopend. De eerste snack na een reset telt als nieuwe bezoeker. */
  function recordOpen(snackId) {
    const isNewVisit = sessionViewed.size === 0;
    sessionViewed.add(snackId);
    updateStats((stats) => {
      stats.total += 1;
      stats.opens[snackId] = (stats.opens[snackId] || 0) + 1;
      stats.lastOpened = snackId;
      if (isNewVisit) stats.visits += 1;
      const key = hourKey();
      stats.hourly[key] = (stats.hourly[key] || 0) + 1;
    });
    if (isNewVisit) track('visit', null);
    track('open', snackId);
  }

  function recordPlay(snackId) {
    updateStats((stats) => {
      stats.plays[snackId] = (stats.plays[snackId] || 0) + 1;
    });
    track('play', snackId);
  }

  function recordCompletion(snackId) {
    updateStats((stats) => {
      stats.completions[snackId] = (stats.completions[snackId] || 0) + 1;
    });
    track('complete', snackId);
  }

  function recordSurprise() {
    updateStats((stats) => {
      stats.surprises += 1;
    });
    track('surprise', null);
  }

  function getStats() {
    return normalizeStats(get('stats'));
  }

  /* ---- Sessie (huidige bezoeker, alleen in het geheugen) ---------------------- */
  function isViewedThisSession(snackId) {
    return sessionViewed.has(snackId);
  }

  function clearSession() {
    sessionViewed.clear();
  }

  function status() {
    const keys = Object.keys(SCHEMA).filter((key) => get(key) !== undefined);
    return {
      persistent,
      reason,
      prefix,
      analyticsEnabled,
      storedKeys: keys,
      sessionViewed: Array.from(sessionViewed)
    };
  }

  ns.storage = {
    MAX_COMMENTS,
    validators: { stats: isValidStats, ratings: isValidRatings, comments: isValidComments, deviceId: SCHEMA.deviceId, deviceLabel: isValidLabel },
    normalizeStats,
    init,
    get,
    set,
    clearAll,
    deviceInfo,
    setDeviceLabel,
    recordOpen,
    recordPlay,
    recordCompletion,
    recordSurprise,
    getStats,
    isViewedThisSession,
    clearSession,
    status
  };
})(window.AISnackbar);
