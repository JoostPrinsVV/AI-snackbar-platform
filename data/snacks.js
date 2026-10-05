/* ==========================================================================
   AI SNACKBAR — DE SNACKKAART
   --------------------------------------------------------------------------
   Zes snacks, elk een korte demo (1-3 min) van een ander stuk Copilot:
   Outlook, een jaarrekening in Copilot Chat, Teams, PowerPoint, Excel en
   een eigen agent. Snack 1 heeft al een video; voor snack 2 t/m 6 toont de
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
    // Demo (fictief klantoverleg): Copilot in Teams bij een getranscribeerde vergadering, twee prompts.
    id: 'snack-03',
    title: 'Van overleg naar actielijst',
    subtitle: 'Notulen, acties en een vervolgmail direct na de meeting',
    category: 'Quick win',
    level: 'Starter',
    duration: '2 min',
    icon: 'assets/icons/icon-people.svg',
    accent: 'steel',
    available: true,
    featured: false,
    intro: 'Na een fictief klantoverleg in Teams vat Copilot samen wat er is besproken en besloten. Je krijgt een actielijst met eigenaren en deadlines, en een conceptmail waarmee je de afspraken met de klant bevestigt.',
    video: 'assets/videos/snack-03.mp4',
    poster: 'assets/posters/snack-03.jpg',
    captions: '',
    prompt: `Vat de vergadering "[NAAM VERGADERING]" van [DATUM] samen op basis van de transcriptie.

Geef:
1. De belangrijkste besproken onderwerpen
2. Genomen besluiten
3. Actiepunten in een tabel met Actie, Eigenaar en Deadline
4. Openstaande vragen

Presenteer een voorstel niet als besluit. Vermeld "Niet benoemd" als een eigenaar of deadline ontbreekt.

Daarna:
Schrijf een korte, vriendelijke e-mail aan [KLANTNAAM] waarin je de besluiten en de acties van beide kanten bevestigt. Maximaal 150 woorden.`,
    promptNote: 'Gebruik in Teams bij de vergadering of in Microsoft 365 Copilot Chat (tabblad Werk). De vergadering moet zijn getranscribeerd.',
    qrCode: 'assets/qr/snack-03.png',
    qrLabel: '',
    tip: 'Zet de transcriptie aan zodra de vergadering begint. Zonder transcriptie heeft Copilot niets om samen te vatten.',
    audience: ['Iedereen die vergadert'],
    license: true                       // leest de vergadering en transcriptie in Teams
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
    // Demo (fictieve grootboekexport): Copilot in Excel, drie stappen in één prompt.
    id: 'snack-05',
    title: 'Van export naar overzicht',
    subtitle: 'Copilot in Excel spoort fouten op en maakt een draaitabel',
    category: 'Slimmer werken',
    level: 'Gevorderd',
    duration: '2,5 min',
    icon: 'assets/icons/icon-table.svg',
    accent: 'deepteal',
    available: true,
    featured: false,
    intro: 'Een fictieve export met grootboekmutaties staat vol dubbele regels en lege velden. Copilot in Excel spoort ze op, maakt een draaitabel per maand en zet de grootste uitschieters in een grafiek. Zonder één formule te typen.',
    video: 'assets/videos/snack-05.mp4',
    poster: 'assets/posters/snack-05.jpg',
    captions: '',
    prompt: `Deze tabel bevat grootboekmutaties van [PERIODE].

Stap 1:
Controleer de tabel op dubbele regels, lege verplichte velden en ongeldige datums. Maak een overzicht van wat je vindt, maar verwijder of wijzig nog niets.

Stap 2:
Maak een draaitabel met per maand de totalen per [GROOTBOEKREKENING OF CATEGORIE].

Stap 3:
Markeer de vijf grootste afwijkingen ten opzichte van het maandgemiddelde en zet ze in een grafiek.

Leg bij iedere stap kort uit wat je hebt gedaan.`,
    promptNote: 'Gebruik in Excel met Copilot. Maak er eerst een tabel van (Ctrl+T), sla het bestand op in OneDrive en werk in een kopie.',
    qrCode: 'assets/qr/snack-05.png',
    qrLabel: '',
    tip: 'Vraag na stap 1: "Verwijder nu alleen de exacte dubbelen." Zo houd je zelf de regie over wat er verandert.',
    audience: ['Administratie', 'Samenstellen'],
    license: true                       // Copilot in Excel
  },
  {
    // Demo: een eigen agent in Copilot Chat met een fictief kantoorhandboek als bron.
    // Nog niet klaar voor het evenement? Zet available op false: de kaart toont dan 'Binnenkort'.
    id: 'snack-06',
    title: 'Je eigen Copilot-assistent',
    subtitle: 'Een agent die vragen beantwoordt uit het kantoorhandboek',
    category: 'Inspiratie',
    level: 'Koploper',
    duration: '3 min',
    icon: 'assets/icons/icon-spark.svg',
    accent: 'navy',
    available: true,
    featured: false,
    intro: 'In een paar minuten bouw je in Copilot Chat een eigen agent met vaste instructies en een fictief kantoorhandboek als bron. Collega’s stellen daarna hun vraag en krijgen een kort antwoord met een verwijzing naar het juiste hoofdstuk.',
    video: 'assets/videos/snack-06.mp4',
    poster: 'assets/posters/snack-06.jpg',
    captions: '',
    prompt: `Je bent de kantoorassistent van [KANTOOR OF TEAM]. Je beantwoordt vragen van collega's over werkafspraken en procedures.

Werkwijze:
- Gebruik uitsluitend de toegevoegde bronnen, zoals het kantoorhandboek.
- Noem bij ieder antwoord het hoofdstuk of de paragraaf waar het staat.
- Staat het antwoord niet in de bronnen? Zeg dat dan eerlijk en verwijs naar [CONTACTPERSOON OF AFDELING].
- Antwoord kort, in de je-vorm, in maximaal vijf zinnen.
- Geef geen fiscaal, juridisch of vaktechnisch advies.

Begin ieder gesprek met de vraag waarmee je kunt helpen.`,
    promptNote: 'Plak deze tekst bij "Instructies" als je in Copilot Chat een nieuwe agent maakt. Voeg als bron alleen documenten toe die iedereen mag zien.',
    qrCode: 'assets/qr/snack-06.png',
    qrLabel: '',
    tip: 'Test je agent met vijf echte vragen van collega’s voordat je hem deelt. Mist er iets, vul dan eerst de bron aan.',
    audience: ['Koplopers', 'Kwaliteit'],
    license: true                       // agent met kantoordocumenten als bron
  }
];
