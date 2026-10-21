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
    enableLicenseRequests: false,
    licenseRequestDomains: [],
    licenseMinWords: 50,
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
    commentMaxLength: [50, 1000],
    licenseMinWords: [10, 300]
  };
  const DOMAIN_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

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
      if (key === 'licenseRequestDomains') {
        config[key] = normalizeDomains(value, issues);
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

  /** Toegestane e-maildomeinen voor licentieaanvragen: kleine letters, zonder '@'. Leeg = ieder domein. */
  function normalizeDomains(value, issues) {
    const list = Array.isArray(value) ? value : [];
    const domains = list
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim().toLowerCase().replace(/^@/, ''))
      .filter((item) => DOMAIN_PATTERN.test(item));
    if (!Array.isArray(value) || domains.length !== list.length) {
      issues.push(issue('warning', "Instelling 'licenseRequestDomains' moet een lijst met domeinen zijn, zoals ['organisatie.nl']; ongeldige waarden genegeerd."));
    }
    return Object.freeze(domains);
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
    const valid = [];
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
      valid.push({ item, id, title });
    });

    const links = linkProVersions(valid, issues);
    // Nummers alleen voor de snacks op de kaart; een pro-versie krijgt het nummer van haar basissnack.
    const numbers = new Map();
    valid.filter((entry) => !links.proOf.has(entry.id)).forEach((entry, index) => numbers.set(entry.id, String(index + 1).padStart(2, '0')));
    const byId = new Map(valid.map((entry) => [entry.id, entry]));
    const snacks = valid.map((entry) => {
      const proId = links.pro.get(entry.id) || '';
      return normalizeSnack(entry.item, entry.id, entry.title, numbers.get(links.proOf.get(entry.id) || entry.id), issues, {
        proOf: links.proOf.get(entry.id) || '',
        pro: proId,
        // De basissnack toont de knop naar de pro-versie met de tekst uit teaser van die pro-versie.
        proTeaser: proId ? text(byId.get(proId).item.teaser) : ''
      });
    });

    const onMenu = snacks.filter((snack) => !snack.proOf).length;
    if (onMenu > 12) issues.push(issue('warning', `Er staan ${onMenu} snacks op de kaart; de indeling is getest tot 12.`));
    if (snacks.length > 0 && snacks.every((snack) => !snack.available)) {
      issues.push(issue('warning', 'Geen enkele snack staat op beschikbaar (available: true).'));
    }
    return { snacks, loadFailed: false, issues };
  }

  /**
   * Pro-versies: een snack met proOf: '<id>' hoort bij die basissnack. Ze staat niet op de kaart,
   * maar is te openen via de basissnack (eindscherm en detailpagina). Eén pro-versie per basissnack.
   * @returns {{ proOf: Map<string, string>, pro: Map<string, string> }} proOf: pro → basis, pro: basis → pro
   */
  function linkProVersions(valid, issues) {
    const proOf = new Map();
    const pro = new Map();
    const ids = new Set(valid.map((entry) => entry.id));
    const declared = new Set(valid.filter((entry) => text(entry.item.proOf)).map((entry) => entry.id));
    valid.forEach(({ item, id }) => {
      const parent = text(item.proOf);
      if (!parent) return;
      let problem = '';
      if (!ids.has(parent) || parent === id) problem = `proOf verwijst naar '${parent}', maar die snack bestaat niet`;
      else if (declared.has(parent)) problem = `proOf verwijst naar '${parent}', en die is zelf een pro-versie`;
      else if (pro.has(parent)) problem = `'${parent}' heeft al een pro-versie (${pro.get(parent)})`;
      if (problem) {
        issues.push(issue('warning', `Snack '${id}': ${problem}; staat nu als gewone snack op de kaart.`, id));
        return;
      }
      proOf.set(id, parent);
      pro.set(parent, id);
    });
    return { proOf, pro };
  }

  function normalizeSnack(item, id, title, number, issues, links) {
    const steps = normalizePromptSteps(item.prompts, id, issues);
    const snack = {
      id,
      number,
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
      // Met prompts (stappen) is prompt de hele reeks achter elkaar: voor 'Mail mij', de export en delen.
      prompt: steps.length ? joinPromptSteps(steps) : text(item.prompt, true),
      promptSteps: steps,
      promptNote: text(item.promptNote),
      qrCode: path(item.qrCode, 'qrCode', id, issues),
      qrLabel: text(item.qrLabel),
      tip: text(item.tip),
      audience: normalizeAudience(item.audience),
      download: path(item.download, 'download', id, issues),
      downloadLabel: text(item.downloadLabel),
      guide: normalizeGuide(item.guide, id, issues),
      license: normalizeLicense(item.license, `Snack '${id}'`, id, issues),
      // Pro-versie (zie linkProVersions): proOf = id van de basissnack, pro = id van de pro-versie.
      proOf: links.proOf,
      pro: links.pro,
      proTeaser: links.proTeaser,
      teaser: text(item.teaser)
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

  /**
   * Prompt in stappen: prompts: [{ title, hint, text }, ...] (max. 8). Iedere stap krijgt
   * een eigen blok met kopieerknop. Ongeldige stappen worden overgeslagen met een melding.
   */
  function normalizePromptSteps(value, id, issues) {
    if (value === undefined || value === null || value === '') return [];
    if (!Array.isArray(value)) {
      issues.push(issue('warning', `Snack '${id}': prompts moet een lijst zijn ([{ title, hint, text }, ...]); niet getoond.`, id));
      return [];
    }
    const steps = [];
    value.forEach((step, index) => {
      const body = step && typeof step === 'object' ? text(step.text, true) : '';
      if (!body) {
        issues.push(issue('warning', `Snack '${id}': prompt ${index + 1} in prompts heeft geen text; overgeslagen.`, id));
        return;
      }
      steps.push(Object.freeze({ title: text(step.title) || 'Stap ' + (index + 1), hint: text(step.hint), text: body }));
    });
    if (steps.length > 8) issues.push(issue('warning', `Snack '${id}': meer dan 8 prompts; alleen de eerste 8 worden getoond.`, id));
    return Object.freeze(steps.slice(0, 8));
  }

  function joinPromptSteps(steps) {
    return steps.map((step) => step.title.toUpperCase() + (step.hint ? ' (' + step.hint + ')' : '') + '\n' + step.text).join('\n\n');
  }

  /* ---- Inspiratieprompts (data/inspiration.js, alleen de promptpagina) ------- */
  // Deze woorden zijn adressen van de lijsten op de promptpagina (prompts/#inspiratie).
  const RESERVED_IDS = ['snacks', 'inspiratie'];
  // 'Mail mij' bij de versie zonder licentie: id + dit achtervoegsel (het dashboard zoekt de juiste tekst erbij).
  const BASIC_SUFFIX = '-zonder-licentie';

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
      if (!ID_PATTERN.test(id) || RESERVED_IDS.includes(id) || id.endsWith(BASIC_SUFFIX)) {
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
      const license = normalizeLicense(item.license, `Inspiratieprompt '${id}'`, id, issues);
      // Een versie zonder licentie heeft alleen zin naast een prompt mét licentie.
      const promptBasic = license === true ? text(item.promptBasic, true) : '';
      if (text(item.promptBasic) && license !== true) {
        issues.push(issue('warning', `Inspiratieprompt '${id}': promptBasic hoort bij license: true; niet getoond.`, id));
      }
      prompts.push(
        Object.freeze({
          id,
          title,
          category,
          impact,
          license,
          didYouKnow: text(item.didYouKnow),
          description: text(item.description),
          usefulFor: text(item.usefulFor),
          prompt: text(item.prompt, true),
          promptNote: text(item.promptNote),
          promptBasic,
          promptNoteBasic: promptBasic ? text(item.promptNoteBasic) : '',
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
   * Handleiding bij een snack: { label, title, basic: { steps, note }, licensed: { steps, note } }.
   * Minstens één versie met stappen; anders geen handleiding (en een melding).
   */
  function normalizeGuide(value, id, issues) {
    if (value === undefined || value === null) return null;
    const part = (raw) => {
      const steps = raw && Array.isArray(raw.steps) ? raw.steps.map((step) => text(step)).filter(Boolean) : [];
      return steps.length ? { steps, note: text(raw.note) } : null;
    };
    const guide = { label: text(value.label), title: text(value.title), basic: part(value.basic), licensed: part(value.licensed) };
    if (!guide.title || (!guide.basic && !guide.licensed)) {
      issues.push(issue('warning', `Snack '${id}': guide mist een titel of stappen; niet getoond.`, id));
      return null;
    }
    return guide;
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
    BASIC_SUFFIX,
    normalizeConfig,
    normalizeSnacks,
    normalizeInspiration
  };
})(window.AISnackbar);
