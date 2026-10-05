/* ==========================================================================
   Centrale opslag (Supabase, optioneel)
   --------------------------------------------------------------------------
   Staat centralUrl + centralKey in js/config.js ingevuld, dan gaan anonieme
   tellers, smileys en opmerkingen van álle apparaten naar één Supabase-
   project, en kan iemand zijn of haar e-mailadres achterlaten voor een prompt.
   Zonder die instellingen doet dit onderdeel niets.

   - Anonieme gegevens (tellers, smileys, opmerkingen) gaan via een wachtrij
     ('outbox' in js/storage.js): even geen internet kost niets, ze worden
     later alsnog verstuurd.
   - Een e-mailadres gaat nooit in de wachtrij en wordt nooit op het apparaat
     bewaard: direct versturen, of het lukt niet (dan een nette melding).
   - Iedereen mag alleen tóévoegen (Row Level Security, zie
     tools/supabase-setup.sql). Lezen kan alleen een beheerder die inlogt;
     dat inloggen loopt via Supabase Auth en de sessie staat alleen in het
     geheugen (weg na vergrendelen of herladen).
   Geen bibliotheek: alleen fetch() naar de REST- en Auth-adressen van Supabase.
   ========================================================================== */
(function (ns) {
  'use strict';

  const TABLES = {
    event: 'snack_events',
    rating: 'snack_ratings',
    comment: 'snack_comments',
    request: 'prompt_requests'
  };
  const QUEUED_TABLES = [TABLES.event, TABLES.rating, TABLES.comment];
  const OUTBOX_LIMIT = 500;
  const BATCH_SIZE = 100;
  const PAGE_SIZE = 1000;
  const RETRY_MS = 30000;
  const REJECTED_STATUS = [400, 409, 413, 422];

  let config = null;
  let base = '';
  let key = '';
  let enabled = false;
  let session = randomId();
  let flushTimer = 0;
  let flushing = false;
  let lastError = '';
  let lastSent = null;
  let admin = null; // { token, email, expiresAt }

  /**
   * @param {object} options { config, queue } — queue: false voor de promptpagina: alleen 'Mail mij',
   *   geen wachtrij en geen tellers (die pagina laadt js/storage.js niet).
   */
  function init(options) {
    config = options.config;
    base = config.centralUrl;
    key = config.centralKey;
    enabled = Boolean(base && key);
    if (!enabled || options.queue === false) return;
    window.addEventListener('online', () => scheduleFlush(0));
    // Telefoon weggelegd of tabblad dicht: nog snel versturen wat klaarstaat.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) flush();
    });
    window.setInterval(() => {
      if (pending().length) scheduleFlush(0);
    }, RETRY_MS);
    scheduleFlush(1500);
  }

  function isEnabled() {
    return enabled;
  }

  function randomId() {
    const raw = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    return raw.toLowerCase();
  }

  /** Nieuwe bezoeker (kioskreset): smileys tellen weer als nieuwe stem. */
  function newSession() {
    session = randomId();
  }

  /* ---- Verzoeken ------------------------------------------------------------ */
  function headers(token, extra) {
    const result = Object.assign({ apikey: key, 'Content-Type': 'application/json' }, extra);
    // Oude 'anon'-sleutels zijn een JWT en horen ook in Authorization; nieuwe 'publishable' sleutels niet.
    const bearer = token || (key.split('.').length === 3 ? key : '');
    if (bearer) result.Authorization = 'Bearer ' + bearer;
    return result;
  }

  async function request(path, init) {
    const response = await fetch(base + path, Object.assign({ cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' }, init));
    if (response.status === 401 && admin && init && init.headers && init.headers.Authorization === 'Bearer ' + admin.token) admin = null;
    return response;
  }

  function insert(table, rows) {
    return request('/rest/v1/' + table, {
      method: 'POST',
      headers: headers(null, { Prefer: 'return=minimal' }),
      body: JSON.stringify(rows),
      keepalive: JSON.stringify(rows).length < 60000
    });
  }

  /* ---- Wachtrij voor anonieme gegevens ---------------------------------------- */
  function pending() {
    return ns.storage.get('outbox', []);
  }

  function common() {
    const device = ns.storage.deviceInfo();
    return {
      namespace: config.storageNamespace,
      device_id: device.deviceId,
      device_kind: config.kioskMode ? 'kiosk' : 'persoonlijk',
      device_label: device.deviceLabel || '',
      occurred_at: new Date().toISOString()
    };
  }

  function enqueue(table, row) {
    if (!enabled) return;
    const box = pending();
    box.push({ t: table, r: row });
    while (box.length > OUTBOX_LIMIT) box.shift();
    ns.storage.set('outbox', box);
    scheduleFlush(800);
  }

  function scheduleFlush(delay) {
    if (!enabled) return;
    window.clearTimeout(flushTimer);
    flushTimer = window.setTimeout(flush, delay);
  }

  async function flush() {
    if (!enabled || flushing) return;
    if (navigator.onLine === false) return;
    flushing = true;
    try {
      for (const table of QUEUED_TABLES) {
        const items = pending().filter((item) => item.t === table).slice(0, BATCH_SIZE);
        if (!items.length) continue;
        let drop = false;
        try {
          const response = await insert(table, items.map((item) => item.r));
          if (response.ok) {
            drop = true;
            lastSent = new Date();
            lastError = '';
          } else if (REJECTED_STATUS.includes(response.status)) {
            // Afgewezen om de inhoud (bijv. ongeldige waarde): niet eindeloos opnieuw proberen.
            // Ontbreekt de tabel of het recht (404/401/403: instellingen nog niet klaar), dan blijft alles in de wachtrij.
            drop = true;
            lastError = `Supabase weigerde ${items.length} regel(s) voor ${table} (${response.status}).`;
            console.warn('[AI Snackbar]', lastError, await response.text());
          } else if (response.status === 404) {
            lastError = `Tabel ${table} ontbreekt in Supabase: voer tools/supabase-setup.sql uit (alles blijft in de wachtrij).`;
          } else {
            lastError = `Supabase gaf ${response.status} bij ${table}; later opnieuw.`;
          }
        } catch (error) {
          lastError = 'Geen verbinding met de centrale opslag; later opnieuw.';
        }
        if (drop) removeSent(items);
      }
    } finally {
      flushing = false;
    }
    if (pending().length && !lastError) scheduleFlush(300);
  }

  /** Haalt precies de verstuurde regels uit de wachtrij (er kan intussen iets bij zijn gekomen). */
  function removeSent(items) {
    const remaining = pending();
    items.forEach((done) => {
      const index = remaining.findIndex((item) => item.t === done.t && JSON.stringify(item.r) === JSON.stringify(done.r));
      if (index !== -1) remaining.splice(index, 1);
    });
    ns.storage.set('outbox', remaining);
  }

  /* ---- Wat de app meldt --------------------------------------------------------- */
  function track(kind, snackId) {
    if (!enabled || !config.enableLocalAnalytics) return;
    enqueue(TABLES.event, Object.assign(common(), { kind, snack_id: snackId || null }));
  }

  function rate(snackId, value) {
    if (!enabled) return;
    enqueue(TABLES.rating, Object.assign(common(), { session_id: session, snack_id: snackId, value }));
  }

  function comment(snackId, text) {
    if (!enabled) return;
    enqueue(TABLES.comment, Object.assign(common(), { snack_id: snackId, text }));
  }

  /**
   * 'Mail mij deze prompt': direct versturen, nooit via de wachtrij.
   * Dubbel aanvragen (zelfde adres, zelfde snack) telt als gelukt.
   * @returns {Promise<boolean>}
   */
  async function requestPrompt(snackId, email) {
    if (!enabled) return false;
    const rows = [{ namespace: config.storageNamespace, snack_id: snackId, email, device_kind: config.kioskMode ? 'kiosk' : 'persoonlijk' }];
    try {
      // Gewoon toevoegen. Hetzelfde adres voor dezelfde snack staat er al? Dan antwoordt Supabase 409: ook goed.
      // (Dubbel negeren met on_conflict vraagt leesrecht, en dat krijgen bezoekers bewust niet.)
      const response = await insert(TABLES.request, rows);
      if (response.ok || response.status === 409) return true;
      console.warn('[AI Snackbar] Mail-verzoek geweigerd:', response.status, await response.text());
      return false;
    } catch (error) {
      console.warn('[AI Snackbar] Mail-verzoek niet verstuurd (geen verbinding).');
      return false;
    }
  }

  /* ---- Beheer: inloggen en lezen ------------------------------------------------- */
  async function signIn(email, password) {
    const response = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: headers(null),
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      admin = null;
      return false;
    }
    const data = await response.json();
    admin = { token: data.access_token, email: (data.user && data.user.email) || email, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
    return true;
  }

  function signOut() {
    admin = null;
  }

  function signedIn() {
    if (admin && Date.now() > admin.expiresAt - 30000) admin = null;
    return admin ? admin.email : '';
  }

  async function readAll(table) {
    const rows = [];
    for (let offset = 0; offset < 200000; offset += PAGE_SIZE) {
      const query = `?select=*&namespace=eq.${encodeURIComponent(config.storageNamespace)}&order=id.asc&limit=${PAGE_SIZE}&offset=${offset}`;
      const response = await request('/rest/v1/' + table + query, { headers: headers(admin.token) });
      if (!response.ok) throw new Error(response.status === 401 ? 'opnieuw inloggen nodig' : `lezen van ${table} mislukt (${response.status})`);
      const page = await response.json();
      rows.push(...page);
      if (page.length < PAGE_SIZE) break;
    }
    return rows;
  }

  /** Alle centrale gegevens van deze snackbar (namespace). Alleen voor een ingelogde beheerder. */
  async function fetchAll() {
    if (!signedIn()) throw new Error('niet ingelogd');
    const [events, ratings, comments, requests] = await Promise.all([readAll(TABLES.event), readAll(TABLES.rating), readAll(TABLES.comment), readAll(TABLES.request)]);
    return { events, ratings, comments, requests, fetchedAt: new Date() };
  }

  /** Na het mailen: alle e-mailadressen van deze snackbar wissen. */
  async function deletePromptRequests() {
    if (!signedIn()) throw new Error('niet ingelogd');
    const query = `?namespace=eq.${encodeURIComponent(config.storageNamespace)}`;
    const response = await request('/rest/v1/' + TABLES.request + query, { method: 'DELETE', headers: headers(admin.token, { Prefer: 'return=minimal' }) });
    if (!response.ok) throw new Error(`wissen mislukt (${response.status})`);
    return true;
  }

  /**
   * Alles van deze snackbar (namespace) centraal wissen: tellers, smileys, vragen en
   * e-mailadressen. Alleen voor een ingelogde beheerder (functie snackbar_reset in Supabase).
   * @returns {Promise<{ events: number, ratings: number, comments: number, requests: number }>}
   */
  async function resetAll() {
    if (!signedIn()) throw new Error('niet ingelogd');
    const response = await request('/rest/v1/rpc/snackbar_reset', {
      method: 'POST',
      headers: headers(admin.token),
      body: JSON.stringify({ p_namespace: config.storageNamespace })
    });
    if (response.status === 404) throw new Error('de resetfunctie ontbreekt nog in Supabase: voer tools/supabase-update-reset.sql uit');
    if (response.status === 401 || response.status === 403) throw new Error('geen beheerdersrechten (log opnieuw in)');
    if (!response.ok) throw new Error(`wissen mislukt (${response.status})`);
    return response.json();
  }

  function status() {
    return {
      enabled,
      url: base,
      pending: enabled ? pending().length : 0,
      lastSent,
      lastError,
      signedIn: signedIn()
    };
  }

  ns.central = {
    QUEUED_TABLES,
    init,
    isEnabled,
    newSession,
    track,
    rate,
    comment,
    requestPrompt,
    flush,
    signIn,
    signOut,
    signedIn,
    fetchAll,
    deletePromptRequests,
    resetAll,
    status
  };
})(window.AISnackbar);
