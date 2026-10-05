/* ==========================================================================
   AI SNACKBAR — DE SNACKKAART
   --------------------------------------------------------------------------
   Zes snacks, elk een korte demo (1-3 min). Vier werken met de gratis
   Copilot Chat (2, 3, 5, 6: zelf een bestand toevoegen of tekst plakken),
   twee laten zien wat een licentie extra geeft (1: je eigen mailbox en
   agenda, 4: Copilot in PowerPoint). Snack 1 heeft al een video; voor snack 2 t/m 6 toont de
   app 'Deze demo wordt binnenkort toegevoegd' tot de video er staat
   (assets/videos/snack-0X.mp4). Nog niet klaar voor het evenement? Zet die
   snack dan op available: false ('Binnenkort').

   Zo werkt het:
   - Iedere snack staat tussen { en }, gescheiden door een komma.
   - De volgorde hier is de volgorde op de snackkaart.
   - 2 tot 12 snacks werkt zonder verdere aanpassingen.
   - Een snack kopiëren? Kopieer een compleet blok { ... }, en geef het
     een nieuwe, unieke id. Verander een id niet meer nadat de QR-codes
     gedrukt zijn (het adres is prompts/#<id>).
   - De prompt staat tussen backticks (` ... `): zo kun je gewoon regels
     typen. Gebruik binnen de prompt zelf geen backtick.

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
     prompt       De voorbeeldprompt om te kopiëren (meerdere stappen: 'Daarna:').
     promptNote   Korte toelichting onder de prompt.
     qrCode       Pad naar de QR-code-afbeelding (zie assets/qr/).
     qrLabel      Tekst naast de QR-code, mag leeg blijven.
     tip          Praktische tip.
     audience     Voor wie handig, bijv. ['Administratie', 'Advies'].
     license      true = Microsoft 365 Copilot-licentie nodig (eigen mail, Teams,
                  agenda, bestanden of Copilot in Word/Excel/PowerPoint): badge
                  'Licentie' op de kaart. false = kan ook met de gratis Copilot Chat.

   Uitgebreide schrijf- en bestandsrichtlijnen: docs/CONTENT-GUIDE.md
   ========================================================================== */

window.AISnackbar = window.AISnackbar || {};

window.AISnackbar.snacks = [
  {
    // Demo (fictieve gegevens): Microsoft 365 Copilot Chat, drie prompts achter elkaar.
    // Let op: de prompt hoort bij de opgenomen video; pas hem alleen samen met de video aan.
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
    prompt: `Bekijk alle e-mails in mijn Postvak IN van de afgelopen 7 dagen. Haal daaruit alle acties, verzoeken en deadlines die op mij betrekking hebben. Maak een to-do lijst in een tabel met de kolommen: Taak, Afzender, Datum e-mail, Deadline (indien genoemd), Prioriteit (Hoog/Middel/Laag). Sorteer op prioriteit en deadline. Sla nieuwsbrieven en automatische meldingen over. Zet onderaan een korte lijst van e-mails die nog op mijn antwoord wachten.

Daarna:
Zet deze actielijst om in een planning voor de rest van deze week. Houd rekening met mijn bestaande afspraken in mijn agenda en geef per taak een tijdsinschatting.`,
    promptNote: 'Gebruik deze prompts in Microsoft 365 Copilot Chat en controleer deadlines altijd even in de mail zelf.',
    qrCode: 'assets/qr/snack-01.png',
    qrLabel: '',
    tip: 'Zet het grootste blok direct vast: "Plan een focusblok in op [dag] van [tijd] tot [tijd] met de titel: [taak]".',
    audience: ['Iedereen met een volle inbox'],
    license: true                       // leest je eigen mailbox en agenda
  },
  {
    // Demo (fictieve jaarrekening): Copilot Chat met het bestand als bijlage, twee prompts.
    id: 'snack-02',
    title: 'Jaarrekening kritisch nalopen',
    subtitle: 'Copilot checkt het concept op aansluitingen en vragen',
    category: 'Slimmer werken',
    level: 'Gevorderd',
    duration: '2,5 min',
    icon: 'assets/icons/icon-checklist.svg',
    accent: 'crimson',
    available: true,
    featured: false,
    intro: 'Copilot leest een fictieve concept jaarrekening als kritische tweede lezer. Sluiten balans, winst-en-verliesrekening en toelichting op elkaar aan? Daarna vergelijkt Copilot met vorig jaar en maakt een lijst met vragen voor het dossier of de klant.',
    video: 'assets/videos/snack-02.mp4',
    poster: 'assets/posters/snack-02.jpg',
    captions: '',
    prompt: `Je bent een kritische tweede lezer van een concept jaarrekening. Analyseer het bijgevoegde bestand [BESTANDSNAAM].

Controleer of deze onderdelen op elkaar aansluiten:
1. Balans en toelichting op de balans
2. Winst-en-verliesrekening en toelichting
3. Eigen vermogen: beginstand, resultaat en overige mutaties
4. Bedragen in de tekst en in de tabellen
5. Vergelijkende cijfers van vorig jaar

Maak een tabel met: Onderdeel, Bevinding, Pagina, Belang (hoog/middel/laag) en Vraag voor het team of de klant.

Reken na waar dat kan en laat je berekening zien. Geef geen oordeel over de juistheid van de jaarrekening; benoem alleen signalen voor nader onderzoek.

Daarna:
Vergelijk de belangrijkste posten met vorig jaar. Noem mutaties groter dan [BEDRAG] of [PERCENTAGE]% en formuleer per mutatie één neutrale vraag.`,
    promptNote: 'Werkt met de gratis Copilot Chat: voeg de jaarrekening toe met de paperclip. Gebruik voor de demo een fictieve jaarrekening; Copilot vervangt de review niet.',
    qrCode: 'assets/qr/snack-02.png',
    qrLabel: '',
    tip: 'Vraag daarna: "Zet de vragen voor de klant in een korte, vriendelijke e-mail." Dan heb je meteen je vragenlijst.',
    audience: ['Samenstellen', 'Kwaliteit'],
    license: false                      // bestand toevoegen kan ook in de gratis Copilot Chat
  },
  {
    // Demo (fictief klantoverleg): transcriptie uit Teams als bijlage in Copilot Chat, twee prompts.
    id: 'snack-03',
    title: 'Van overleg naar actielijst',
    subtitle: 'Notulen, acties en een vervolgmail uit je transcriptie',
    category: 'Quick win',
    level: 'Starter',
    duration: '2 min',
    icon: 'assets/icons/icon-people.svg',
    accent: 'steel',
    available: true,
    featured: false,
    intro: 'Je downloadt de transcriptie van een fictief klantoverleg uit Teams en geeft die aan Copilot Chat. Copilot maakt er notulen en een actielijst met eigenaren en deadlines van, en schrijft een mail waarmee je de afspraken met de klant bevestigt.',
    video: 'assets/videos/snack-03.mp4',
    poster: 'assets/posters/snack-03.jpg',
    captions: '',
    prompt: `Ik voeg de transcriptie toe van ons overleg met [KLANTNAAM] op [DATUM].

Vat het overleg samen met:
1. De belangrijkste besproken onderwerpen
2. Genomen besluiten
3. Actiepunten in een tabel met Actie, Eigenaar en Deadline
4. Openstaande vragen

Gebruik alleen wat in de transcriptie staat. Presenteer een voorstel niet als besluit. Vermeld "Niet benoemd" als een eigenaar of deadline ontbreekt.

Daarna:
Schrijf een korte, vriendelijke e-mail aan [KLANTNAAM] waarin je de besluiten en de acties van beide kanten bevestigt. Maximaal 150 woorden.`,
    promptNote: 'Werkt met de gratis Copilot Chat: download de transcriptie uit Teams en voeg die toe met de paperclip.',
    qrCode: 'assets/qr/snack-03.png',
    qrLabel: '',
    tip: 'Geen transcriptie? Plak je eigen aantekeningen van het overleg; dezelfde prompt werkt dan ook.',
    audience: ['Iedereen die vergadert'],
    license: false                      // transcriptie zelf toevoegen kan in de gratis Copilot Chat
  },
  {
    // Demo (fictieve adviesnotitie): Copilot in PowerPoint, twee prompts.
    id: 'snack-04',
    title: 'Van notitie naar presentatie',
    subtitle: 'Copilot maakt van je Word-notitie een klantpresentatie',
    category: 'Inspiratie',
    level: 'Gevorderd',
    duration: '2 min',
    icon: 'assets/icons/icon-document.svg',
    accent: 'rose',
    available: true,
    featured: false,
    intro: 'Copilot in PowerPoint zet een fictieve adviesnotitie om in een presentatie voor het klantgesprek. Met een tweede prompt maak je de dia’s korter en krijg je sprekersnotities, zodat je het verhaal zo kunt vertellen.',
    video: 'assets/videos/snack-04.mp4',
    poster: 'assets/posters/snack-04.jpg',
    captions: '',
    prompt: `Maak een presentatie van /[BESTANDSNAAM] voor een gesprek met [KLANTNAAM].

Gebruik maximaal 8 dia's:
1. Titel en doel van het gesprek
2. Samenvatting in drie punten
3. tot en met 6. De belangrijkste bevindingen, met één boodschap per dia
7. Advies en keuzes voor de klant
8. Vervolgstappen en planning

Schrijf korte bullets in begrijpelijke taal, zonder vakjargon. Neem alleen bedragen en feiten op die in het document staan.

Daarna:
Maak de tekst op iedere dia korter: maximaal vier bullets van tien woorden. Zet de uitleg in de sprekersnotities.`,
    promptNote: 'Gebruik in PowerPoint via Copilot (presentatie maken van een bestand). Controleer cijfers en opmaak voordat je presenteert.',
    qrCode: 'assets/qr/snack-04.png',
    qrLabel: '',
    tip: 'Start vanuit een lege presentatie in de kantoorhuisstijl; Copilot bouwt de dia’s dan in die opmaak.',
    audience: ['Advies', 'Samenstellen'],
    license: true                       // Copilot in PowerPoint
  },
  {
    // Demo (fictieve grootboekexport): Excelbestand als bijlage in Copilot Chat, twee prompts.
    id: 'snack-05',
    title: 'Van export naar overzicht',
    subtitle: 'Copilot Chat analyseert je export en geeft de formules erbij',
    category: 'Slimmer werken',
    level: 'Gevorderd',
    duration: '2,5 min',
    icon: 'assets/icons/icon-table.svg',
    accent: 'deepteal',
    available: true,
    featured: false,
    intro: 'Je geeft Copilot Chat een fictieve export met grootboekmutaties. Copilot spoort dubbele regels en lege velden op, maakt een overzicht per maand en noemt de uitschieters. Daarna krijg je de Excel-formules om het zelf na te rekenen.',
    video: 'assets/videos/snack-05.mp4',
    poster: 'assets/posters/snack-05.jpg',
    captions: '',
    prompt: `Het bijgevoegde Excelbestand [BESTANDSNAAM] bevat grootboekmutaties van [PERIODE].

Stap 1:
Controleer de gegevens op dubbele regels, lege verplichte velden en ongeldige datums. Geef per soort probleem het aantal en de betrokken regels.

Stap 2:
Maak een overzicht met per maand de totalen per [GROOTBOEKREKENING OF CATEGORIE].

Stap 3:
Noem de vijf grootste afwijkingen ten opzichte van het maandgemiddelde, met per afwijking één neutrale vraag.

Daarna:
Geef de Excel-formules waarmee ik stap 2 en 3 zelf in mijn bestand kan narekenen, met een korte uitleg per formule.`,
    promptNote: 'Werkt met de gratis Copilot Chat: voeg het Excelbestand toe met de paperclip. Copilot past je bestand niet aan; met de formules reken je het zelf na.',
    qrCode: 'assets/qr/snack-05.png',
    qrLabel: '',
    tip: 'Werk je in een Nederlandse Excel? Vraag om formules met puntkomma’s, dan kun je ze direct plakken.',
    audience: ['Administratie', 'Samenstellen'],
    license: false                      // bestand toevoegen kan in de gratis Copilot Chat
  },
  {
    // Demo (verzonnen situatie): rollenspel in Copilot Chat, met feedback als afsluiting.
    // Nog niet klaar voor het evenement? Zet available op false: de kaart toont dan 'Binnenkort'.
    id: 'snack-06',
    title: 'Oefen een lastig klantgesprek',
    subtitle: 'Copilot speelt de klant en geeft je daarna feedback',
    category: 'Inspiratie',
    level: 'Koploper',
    duration: '3 min',
    icon: 'assets/icons/icon-chat.svg',
    accent: 'navy',
    available: true,
    featured: false,
    intro: 'Copilot speelt een fictieve klant die niet blij is met een hogere factuur. Jij oefent het gesprek in een paar berichten heen en weer. Daarna krijg je feedback: wat ging goed, wat kan beter en welke zin had je anders kunnen zeggen.',
    video: 'assets/videos/snack-06.mp4',
    poster: 'assets/posters/snack-06.jpg',
    captions: '',
    prompt: `Je speelt een rollenspel. Jij bent [NAAM], eigenaar van een fictief [TYPE BEDRIJF]. Je bent ontevreden omdat [SITUATIE, bijv. de factuur voor de jaarrekening 20% hoger is dan vorig jaar]. Ik ben je accountant.

Regels:
- Blijf in je rol en reageer zoals een echte klant: kritisch, maar redelijk.
- Gebruik per bericht maximaal drie zinnen.
- Laat mij het gesprek leiden en geef zelf geen oplossingen.
- Stop met het rollenspel zodra ik "feedback" typ.

Begin het gesprek met je eerste reactie als klant.

Daarna (als ik "feedback" typ):
Geef feedback op mijn gespreksvoering met:
1. Drie dingen die goed gingen
2. Drie verbeterpunten
3. Eén zin die ik beter anders had kunnen zeggen, met een betere versie`,
    promptNote: 'Werkt met de gratis Copilot Chat. Gebruik een verzonnen situatie en noem geen echte klanten.',
    qrCode: 'assets/qr/snack-06.png',
    qrLabel: '',
    tip: 'Maak het spannender: vraag Copilot om de klant na drie berichten nog wat bozer te laten reageren.',
    audience: ['Advies', 'Klantcontact'],
    license: false                      // geen eigen gegevens nodig: gratis Copilot Chat
  }
];
