/* ==========================================================================
   Inhoud valideren
   --------------------------------------------------------------------------
   Controleert js/config.js, data/snacks.js en (voor de promptpagina)
   data/inspiration.js, vult ontbrekende waarden aan
   met veilige standaarden en verzamelt meldingen voor de console en het
   beheerscherm. Een fout in één snack blokkeert nooit de rest.
   ========================================================================== */
(function (ns) {
  'use strict';

  const CONFIG_DEFAULTS = {
    applicationTitle: 'AI Snackbar',
    discipline: '',
    applicationSubtitle: '',
    instruction: '',
    organizationName: '',
    audienceName: '',
    eventName: '',
    eventDates: '',
    language: 'nl',
    theme: 'licht',
    logoPath: '',
    logoAlt: '',
    showIntro: true,
    showSurpriseButton: true,
    enablePromptCopy: true,
    enablePromptMail: true,
    enableQrCodes: true,
    enableRatings: true,
    enableComments: true,
    commentMaxLength: 280,
    demoMode: false,
    reduceMotion: false,
    kioskMode: 'auto',
    inactivityTimeout: 90,
    inactivityWarningDuration: 15,
    showIntroAfterReset: true,
    resetOnPageReload: true,
    defaultVolume: 0.8,
    startMuted: false,
    fullscreenOnPlay: true,
    enableLocalStorage: true,
    enableLocalAnalytics: true,
    storageNamespace: 'ai-snackbar',
    centralUrl: '',
    centralKey: '',
    enableAdmin: true,
    adminCode: '1234',
    resetCode: '',
    adminKeySequence: 'beheer',
    adminLongPressSeconds: 3,
    debugMode: false
  };

  const NUMBER_RANGES = {
    inactivityTimeout: [20, 3600],
    inactivityWarningDuration: [3, 120],
    defaultVolume: [0, 1],
    adminLongPressSeconds: [1, 10],
    commentMaxLength: [50, 1000]
  };

  const THEMES = ['licht', 'donker'];

  const ACCENTS = ['teal', 'crimson', 'steel', 'rose', 'deepteal', 'navy'];
  const ACCENT_ALIASES = {
    turquoise: 'teal',
    groen: 'teal',
    magenta: 'crimson',
    roze: 'crimson',
    rood: 'crimson',
    pink: 'crimson',
    petrol: 'steel',
    blauw: 'steel',
    'deep-teal': 'deepteal',
    donkerblauw: 'navy',
    marine: 'navy'
  };

  const LEVELS = { starter: 1, beginner: 1, gevorderd: 2, ervaren: 2, koploper: 3, expert: 3 };

  const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
  const DEFAULT_ICON = 'assets/icons/icon-cloche.svg';
  const RECOMMENDED = { title: 40, subtitle: 80, intro: 320 };

  /* ---- Instellingen ---------------------------------------------------------- */
  function normalizeConfig(raw, availableLanguages) {
    const issues = [];
    const source = raw && typeof raw === 'object' ? raw : {};
    if (!raw) issues.push(issue('error', 'js/config.js is niet geladen; standaardinstellingen worden gebruikt.'));

    const config = {};
    Object.keys(CONFIG_DEFAULTS).forEach((key) => {
      const fallback = CONFIG_DEFAULTS[key];
      const value = source[key];
      if (value === undefined) {
        config[key] = fallback;
        return;
      }
      if (key === 'kioskMode') {
        const valid = value === true || value === false || value === 'auto';
        if (!valid) issues.push(issue('warning', "Instelling 'kioskMode' moet true, false of 'auto' zijn; 'auto' gebruikt."));
        config[key] = valid ? value : fallback;
        return;
      }
      if (typeof value !== typeof fallback) {
        issues.push(issue('warning', `Instelling '${key}' heeft een ongeldige waarde; standaard (${JSON.stringify(fallback)}) gebruikt.`));
        config[key] = fallback;
        return;
      }
      if (typeof value === 'number') {
        const range = NUMBER_RANGES[key];
        if (!Number.isFinite(value) || (range && (value < range[0] || value > range[1]))) {
          issues.push(issue('warning', `Instelling '${key}' valt buiten het bereik ${range ? range.join('–') : ''}; standaard gebruikt.`));
          config[key] = fallback;
          return;
        }
      }
      config[key] = typeof value === 'string' ? value.trim() : value;
    });

    Object.keys(source).forEach((key) => {
      if (!(key in CONFIG_DEFAULTS)) issues.push(issue('warning', `Onbekende instelling '${key}' wordt genegeerd.`));
    });

    if (!THEMES.includes(config.theme)) {
      issues.push(issue('warning', `Onbekend thema '${config.theme}'; 'licht' gebruikt.`));
      config.theme = 'licht';
    }
    if (!availableLanguages.includes(config.language)) {
      issues.push(issue('warning', `Taal '${config.language}' staat niet in data/texts.js; 'nl' gebruikt.`));
      config.language = 'nl';
    }
    if (config.inactivityWarningDuration >= config.inactivityTimeout) {
      issues.push(issue('warning', 'inactivityWarningDuration moet korter zijn dan inactivityTimeout; aangepast.'));
      config.inactivityWarningDuration = Math.max(3, Math.floor(config.inactivityTimeout / 4));
    }
    if (config.logoPath && isExternal(config.logoPath)) {
      issues.push(issue('warning', 'logoPath verwijst naar internet; alleen lokale bestanden zijn toegestaan.'));
      config.logoPath = '';
    }
    config.adminKeySequence = config.adminKeySequence.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!/^\d{4,8}$/.test(config.adminCode)) {
      issues.push(issue('warning', "adminCode moet uit 4 tot 8 cijfers bestaan; standaard '1234' gebruikt."));
      config.adminCode = CONFIG_DEFAULTS.adminCode;
    }
    if (config.resetCode && !/^\d{4,8}$/.test(config.resetCode)) {
      issues.push(issue('warning', "resetCode moet uit 4 tot 8 cijfers bestaan; de knop 'Alles resetten' staat uit."));
      config.resetCode = '';
    }
    normalizeCentral(config, issues);
    return { config: Object.freeze(config), issues };
  }

  /** Centrale opslag: alleen een Supabase-adres (dat staat de CSP toe) en nooit een geheime sleutel. */
  function normalizeCentral(config, issues) {
    config.centralUrl = config.centralUrl.replace(/\/+$/, '');
    if (!config.centralUrl && !config.centralKey) return;
    let problem = '';
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.centralUrl)) problem = 'centralUrl moet een Supabase-adres zijn (https://<project>.supabase.co)';
    else if (config.centralKey.length < 20) problem = 'centralKey ontbreekt of is te kort';
    else if (isSecretKey(config.centralKey)) problem = 'centralKey is een GEHEIME sleutel (service_role/secret). Gebruik de publieke anon/publishable key en vervang de geheime sleutel in Supabase';
    if (!problem) return;
    issues.push(issue(isSecretKey(config.centralKey) ? 'error' : 'warning', problem + '; centrale opslag staat uit.'));
    config.centralUrl = '';
    config.centralKey = '';
  }

  function isSecretKey(key) {
    if (/^sb_secret_/i.test(key)) return true;
    const parts = key.split('.');
    if (parts.length !== 3) return false;
    try {
      const payload = JSON.parse(window.atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload && payload.role === 'service_role';
    } catch (error) {
      return false;
    }
  }

  /* ---- Snacks ---------------------------------------------------------------- */
  function normalizeSnacks(raw) {
    const issues = [];
    if (raw === undefined) {
      return {
        snacks: [],
        loadFailed: true,
        issues: [issue('error', 'data/snacks.js kon niet worden gelezen. Controleer het bestand op typefouten (komma’s, aanhalingstekens, haakjes).')]
      };
    }
    if (!Array.isArray(raw)) {
      return { snacks: [], loadFailed: true, issues: [issue('error', 'data/snacks.js bevat geen lijst met snacks ([ ... ]).')] };
    }

    const seen = new Set();
    const snacks = [];
    raw.forEach((item, index) => {
      const position = index + 1;
      if (!item || typeof item !== 'object') {
        issues.push(issue('error', `Snack op positie ${position} is geen geldig blok { ... } en wordt overgeslagen.`));
        return;
      }
      const id = typeof item.id === 'string' ? item.id.trim() : '';
      if (!ID_PATTERN.test(id)) {
        issues.push(issue('error', `Snack op positie ${position} heeft geen geldige id (alleen kleine letters, cijfers en '-'); overgeslagen.`));
        return;
      }
      if (seen.has(id)) {
        issues.push(issue('error', `De id '${id}' komt twee keer voor; de tweede wordt overgeslagen.`, id));
        return;
      }
      const title = text(item.title);
      if (!title) {
        issues.push(issue('error', `Snack '${id}' heeft geen titel en wordt overgeslagen.`, id));
        return;
      }
      seen.add(id);
      snacks.push(normalizeSnack(item, id, title, snacks.length + 1, issues));
    });

    if (snacks.length > 12) issues.push(issue('warning', `Er staan ${snacks.length} snacks op de kaart; de indeling is getest tot 12.`));
    if (snacks.length > 0 && snacks.every((snack) => !snack.available)) {
      issues.push(issue('warning', 'Geen enkele snack staat op beschikbaar (available: true).'));
    }
    return { snacks, loadFailed: false, issues };
  }

  function normalizeSnack(item, id, title, number, issues) {
    const snack = {
      id,
      number: String(number).padStart(2, '0'),
      title,
      subtitle: text(item.subtitle),
      category: text(item.category),
      level: text(item.level),
      levelRank: LEVELS[text(item.level).toLowerCase()] || 0,
      duration: normalizeDuration(item.duration),
      icon: path(item.icon, 'icon', id, issues) || DEFAULT_ICON,
      accent: normalizeAccent(item.accent, id, issues),
      available: item.available !== false,
      featured: item.featured === true,
      intro: text(item.intro),
      demo: path(item.demo, 'demo', id, issues),
      video: path(item.video, 'video', id, issues),
      poster: path(item.poster, 'poster', id, issues),
      captions: path(item.captions, 'captions', id, issues),
      prompt: text(item.prompt, true),
      promptNote: text(item.promptNote),
      qrCode: path(item.qrCode, 'qrCode', id, issues),
      qrLabel: text(item.qrLabel),
      tip: text(item.tip),
      audience: normalizeAudience(item.audience),
      license: normalizeLicense(item.license, `Snack '${id}'`, id, issues)
    };

    Object.keys(RECOMMENDED).forEach((field) => {
      if (snack[field].length > RECOMMENDED[field]) {
        issues.push(issue('warning', `Snack '${id}': ${field} is langer dan aanbevolen (${RECOMMENDED[field]} tekens).`, id));
      }
    });
    if (snack.level && !snack.levelRank) {
      issues.push(issue('warning', `Snack '${id}': onbekend niveau '${snack.level}' (gebruik Starter, Gevorderd of Koploper).`, id));
    }
    return Object.freeze(snack);
  }

  /* ---- Inspiratieprompts (data/inspiration.js, alleen de promptpagina) ------- */
  // Deze woorden zijn adressen van de lijsten op de promptpagina (prompts/#inspiratie).
  const RESERVED_IDS = ['snacks', 'inspiratie'];

  function normalizeInspiration(raw, takenIds) {
    const issues = [];
    if (raw === undefined) return { prompts: [], categories: [], issues };
    if (!Array.isArray(raw)) {
      return { prompts: [], categories: [], issues: [issue('error', 'data/inspiration.js bevat geen lijst met prompts ([ ... ]).')] };
    }

    const seen = new Set(takenIds || []);
    const categories = [];
    const prompts = [];
    raw.forEach((item, index) => {
      const position = index + 1;
      const id = item && typeof item.id === 'string' ? item.id.trim() : '';
      if (!ID_PATTERN.test(id) || RESERVED_IDS.includes(id)) {
        issues.push(issue('error', `Inspiratieprompt op positie ${position} heeft geen geldige id; overgeslagen.`));
        return;
      }
      if (seen.has(id)) {
        issues.push(issue('error', `De id '${id}' bestaat al (bij een snack of een andere prompt); overgeslagen.`, id));
        return;
      }
      const title = text(item.title);
      const label = text(item.category);
      if (!title || !label) {
        issues.push(issue('error', `Inspiratieprompt '${id}' mist een titel of thema en wordt overgeslagen.`, id));
        return;
      }
      seen.add(id);
      let category = categories.find((entry) => entry.label === label);
      if (!category) {
        category = { id: 'thema-' + (categories.length + 1), label, accent: ACCENTS[categories.length % ACCENTS.length] };
        categories.push(category);
      }
      const impact = [1, 2, 3].includes(Number(item.impact)) ? Number(item.impact) : 0;
      if (item.impact !== undefined && item.impact !== '' && !impact) {
        issues.push(issue('warning', `Inspiratieprompt '${id}': impact moet 1, 2 of 3 zijn; niet getoond.`, id));
      }
      prompts.push(
        Object.freeze({
          id,
          title,
          category,
          impact,
          license: normalizeLicense(item.license, `Inspiratieprompt '${id}'`, id, issues),
          didYouKnow: text(item.didYouKnow),
          description: text(item.description),
          usefulFor: text(item.usefulFor),
          prompt: text(item.prompt, true),
          promptNote: text(item.promptNote),
          tip: text(item.tip)
        })
      );
    });

    if (categories.length > ACCENTS.length) {
      issues.push(issue('warning', `Er zijn ${categories.length} thema's; vanaf het ${ACCENTS.length + 1}e worden de kleuren herhaald.`));
    }
    return { prompts, categories: categories.map((entry) => Object.freeze(entry)), issues };
  }

  /* ---- Hulpfuncties ---------------------------------------------------------- */
  function issue(level, message, snackId) {
    return { level, message, snackId: snackId || null };
  }

  function text(value, keepLineBreaks) {
    if (typeof value === 'number') return String(value);
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    return keepLineBreaks ? trimmed.replace(/\r\n/g, '\n') : trimmed.replace(/\s+/g, ' ');
  }

  function isExternal(value) {
    return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(value) || /^(data|javascript):/i.test(value);
  }

  function path(value, field, id, issues) {
    const clean = text(value);
    if (!clean) return '';
    if (isExternal(clean)) {
      issues.push(issue('warning', `Snack '${id}': ${field} verwijst naar internet; alleen lokale bestanden zijn toegestaan.`, id));
      return '';
    }
    return clean.replace(/\\/g, '/');
  }

  function normalizeDuration(value) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value + ' min';
    return text(value);
  }

  function normalizeAccent(value, id, issues) {
    const key = text(value).toLowerCase();
    if (!key) return ACCENTS[0];
    if (ACCENTS.includes(key)) return key;
    if (ACCENT_ALIASES[key]) return ACCENT_ALIASES[key];
    issues.push(issue('warning', `Snack '${id}': onbekende accentkleur '${value}'; 'teal' gebruikt.`, id));
    return ACCENTS[0];
  }

  /**
   * Copilot-licentie: true = Microsoft 365 Copilot-licentie nodig (werkt met je eigen mail, Teams,
   * agenda of bestanden), false = kan ook met de gratis Copilot Chat. Weggelaten = niets tonen.
   */
  function normalizeLicense(value, label, id, issues) {
    if (value === true || value === false) return value;
    if (value !== undefined && value !== null && value !== '') {
      issues.push(issue('warning', `${label}: license moet true of false zijn; niet getoond.`, id));
    }
    return null;
  }

  function normalizeAudience(value) {
    const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
    return list.map((entry) => text(entry)).filter(Boolean);
  }

  ns.content = {
    normalizeConfig,
    normalizeSnacks,
    normalizeInspiration
  };
})(window.AISnackbar);
