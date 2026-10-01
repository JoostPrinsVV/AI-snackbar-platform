/* ==========================================================================
   AI SNACKBAR — DE SNACKKAART
   --------------------------------------------------------------------------
   Snack 1 is de eerste echte snack (met video en poster).
   Snack 2 t/m 6 zijn nog neutrale placeholders; die inhoud volgt later.

   Zo werkt het:
   - Iedere snack staat tussen { en }, gescheiden door een komma.
   - De volgorde hier is de volgorde op de snackkaart.
   - 2 tot 12 snacks werkt zonder verdere aanpassingen.
   - Een snack kopiëren? Kopieer een compleet blok { ... }, en geef het
     een nieuwe, unieke id.

   Velden (* = verplicht):
     id*          Unieke code, alleen kleine letters, cijfers en '-'.
     title*       Korte titel (max. ca. 30 tekens).
     subtitle     Eén korte zin onder de titel (max. ca. 60 tekens).
     category     Label, bijv. 'Quick win'.
     level        'Starter', 'Gevorderd' of 'Koploper'.
     duration     Geschatte duur, bijv. '2 min'.
     icon         Pad naar een icoon (zie assets/icons/).
     accent       Kleur: 'teal', 'crimson', 'steel', 'rose', 'deepteal' of 'navy'.
     available    true = te kiezen, false = 'Binnenkort'.
     featured     true = label 'Specialiteit' op de kaart.
     intro        Korte introductie op de detailpagina (2-3 zinnen).
     video        Pad naar de MP4-video (zie assets/videos/). De standaard: pauzeren en spoelen.
     demo         Optioneel: pad naar een HTML-demo (zie assets/demos/). Heeft dan voorrang op
                  de video (scherper op telefoons); werkt die niet, dan speelt de video.
     poster       Pad naar de afbeelding vóór het afspelen (zie assets/posters/).
     captions     Pad naar een ondertitelbestand (.vtt), mag leeg blijven.
     prompt       De voorbeeldprompt om te kopiëren.
     promptNote   Korte toelichting onder de prompt.
     qrCode       Pad naar de QR-code-afbeelding (zie assets/qr/).
     qrLabel      Tekst naast de QR-code, mag leeg blijven.
     tip          Praktische tip.
     audience     Voor wie handig, bijv. ['Administratie', 'Advies'].

   Uitgebreide schrijf- en bestandsrichtlijnen: docs/CONTENT-GUIDE.md
   ========================================================================== */

window.AISnackbar = window.AISnackbar || {};

window.AISnackbar.snacks = [
  {
    // Demo (fictieve gegevens): Microsoft 365 Copilot Chat, drie prompts achter elkaar.
    id: 'snack-01',
    title: 'Van inbox naar weekplanning',
    subtitle: 'Copilot maakt van je mail een to-do-lijst én een planning',
    category: 'Quick win',
    level: 'Starter',
    duration: '1,5 min',
    icon: 'assets/icons/icon-mail.svg',
    accent: 'teal',
    available: true,
    featured: true,
    intro: 'Copilot leest de mails van de afgelopen week en zet alle acties en deadlines in een to-do-lijst met prioriteit. Daarna verdeelt Copilot de taken over je week, rond je bestaande afspraken, en zet een focusblok in je agenda. Drie prompts, en je week staat.',
    video: 'assets/videos/snack-01.mp4',
    poster: 'assets/posters/snack-01.jpg',
    captions: '',
    prompt: 'Bekijk alle e-mails in mijn Postvak IN van de afgelopen 7 dagen. Haal daaruit alle acties, verzoeken en deadlines die op mij betrekking hebben. Maak een to-do lijst in een tabel met de kolommen: Taak, Afzender, Datum e-mail, Deadline (indien genoemd), Prioriteit (Hoog/Middel/Laag). Sorteer op prioriteit en deadline. Sla nieuwsbrieven en automatische meldingen over. Zet onderaan een korte lijst van e-mails die nog op mijn antwoord wachten.\n\nDaarna:\nZet deze actielijst om in een planning voor de rest van deze week. Houd rekening met mijn bestaande afspraken in mijn agenda en geef per taak een tijdsinschatting.',
    promptNote: 'Gebruik deze prompts in Microsoft 365 Copilot Chat en controleer deadlines altijd even in de mail zelf.',
    qrCode: 'assets/qr/snack-01.png',
    qrLabel: '',
    tip: 'Zet het grootste blok direct vast: "Plan een focusblok in op [dag] van [tijd] tot [tijd] met de titel: [taak]".',
    audience: ['Iedereen met een volle inbox']
  },
  {
    id: 'snack-02',
    title: 'Snack 2',
    subtitle: 'Hier komt later een korte uitleg',
    category: 'Slimmer werken',
    level: 'Starter',
    duration: '1 min',
    icon: 'assets/icons/icon-chat.svg',
    accent: 'crimson',
    available: true,
    featured: false,
    intro: 'Hier komt een korte introductie van deze AI-snack: wat laat de demo zien en waarom is het handig? De definitieve tekst volgt.',
    video: 'assets/videos/snack-02.mp4',
    poster: 'assets/posters/snack-02.jpg',
    captions: '',
    prompt: 'De definitieve prompt wordt later toegevoegd.',
    promptNote: 'Korte toelichting bij de prompt volgt.',
    qrCode: 'assets/qr/snack-02.png',
    qrLabel: '',
    tip: 'Praktische tip volgt.',
    audience: ['Administratie', 'Samenstellen']
  },
  {
    id: 'snack-03',
    title: 'Snack 3',
    subtitle: 'Hier komt later een korte uitleg',
    category: 'Inspiratie',
    level: 'Gevorderd',
    duration: '3 min',
    icon: 'assets/icons/icon-document.svg',
    accent: 'steel',
    available: true,
    featured: false,
    intro: 'Hier komt een korte introductie van deze AI-snack: wat laat de demo zien en waarom is het handig? De definitieve tekst volgt.',
    video: 'assets/videos/snack-03.mp4',
    poster: 'assets/posters/snack-03.jpg',
    captions: '',
    prompt: 'De definitieve prompt wordt later toegevoegd.',
    promptNote: 'Korte toelichting bij de prompt volgt.',
    qrCode: 'assets/qr/snack-03.png',
    qrLabel: '',
    tip: 'Praktische tip volgt.',
    audience: ['Advies']
  },
  {
    id: 'snack-04',
    title: 'Snack 4',
    subtitle: 'Hier komt later een korte uitleg',
    category: 'Quick win',
    level: 'Starter',
    duration: '2 min',
    icon: 'assets/icons/icon-checklist.svg',
    accent: 'rose',
    available: true,
    featured: false,
    intro: 'Hier komt een korte introductie van deze AI-snack: wat laat de demo zien en waarom is het handig? De definitieve tekst volgt.',
    video: 'assets/videos/snack-04.mp4',
    poster: 'assets/posters/snack-04.jpg',
    captions: '',
    prompt: 'De definitieve prompt wordt later toegevoegd.',
    promptNote: 'Korte toelichting bij de prompt volgt.',
    qrCode: 'assets/qr/snack-04.png',
    qrLabel: '',
    tip: 'Praktische tip volgt.',
    audience: ['Administratie', 'Samenstellen', 'Advies']
  },
  {
    id: 'snack-05',
    title: 'Snack 5',
    subtitle: 'Hier komt later een korte uitleg',
    category: 'Slimmer werken',
    level: 'Gevorderd',
    duration: '3 min',
    icon: 'assets/icons/icon-search.svg',
    accent: 'deepteal',
    available: true,
    featured: false,
    intro: 'Hier komt een korte introductie van deze AI-snack: wat laat de demo zien en waarom is het handig? De definitieve tekst volgt.',
    video: 'assets/videos/snack-05.mp4',
    poster: 'assets/posters/snack-05.jpg',
    captions: '',
    prompt: 'De definitieve prompt wordt later toegevoegd.',
    promptNote: 'Korte toelichting bij de prompt volgt.',
    qrCode: 'assets/qr/snack-05.png',
    qrLabel: '',
    tip: 'Praktische tip volgt.',
    audience: ['Samenstellen', 'Advies']
  },
  {
    // Voorbeeld van een snack die nog niet klaar is: available: false
    id: 'snack-06',
    title: 'Snack 6',
    subtitle: 'Hier komt later een korte uitleg',
    category: 'Inspiratie',
    level: 'Koploper',
    duration: '1 min',
    icon: 'assets/icons/icon-calendar.svg',
    accent: 'navy',
    available: false,
    featured: false,
    intro: 'Hier komt een korte introductie van deze AI-snack: wat laat de demo zien en waarom is het handig? De definitieve tekst volgt.',
    video: 'assets/videos/snack-06.mp4',
    poster: 'assets/posters/snack-06.jpg',
    captions: '',
    prompt: 'De definitieve prompt wordt later toegevoegd.',
    promptNote: 'Korte toelichting bij de prompt volgt.',
    qrCode: 'assets/qr/snack-06.png',
    qrLabel: '',
    tip: 'Praktische tip volgt.',
    audience: ['Administratie']
  }
];
