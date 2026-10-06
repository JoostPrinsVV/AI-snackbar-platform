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
     download     Optioneel: bijlage om te downloaden, bijv. een template
                  (zie assets/downloads/). Alleen op een eigen apparaat en op de promptpagina.
     downloadLabel  Tekst op de downloadknop, bijv. 'Download de PowerPoint-template'.
     guide        Optioneel: korte handleiding achter een knop onder de prompt, met een keuze
                  'Zonder licentie' (standaard) / 'Met licentie':
                  { label, title, basic: { steps: [...], note }, licensed: { steps: [...], note } }.
                  Eén van de twee versies mag ontbreken; dan is er geen keuze.
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
    // Demo (fictieve jaarrekening): uitgebreide ICBO in Copilot Chat met het bestand als bijlage, twee prompts.
    id: 'snack-02',
    title: 'ICBO op een jaarrekening',
    subtitle: 'Copilot loopt het concept uitgebreid na vóór afgifte',
    category: 'Slimmer werken',
    level: 'Gevorderd',
    duration: '3 min',
    icon: 'assets/icons/icon-checklist.svg',
    accent: 'crimson',
    available: true,
    featured: false,
    intro: 'Copilot doet als ervaren auditor een uitgebreide ICBO op een fictieve concept jaarrekening: volledigheid, aansluitingen, grondslagen en toelichting, analyse met de materialiteit, continuïteit en presentatie. Je krijgt een samenvatting, een bevindingentabel en vragen voor klant en team.',
    video: 'assets/videos/snack-02.mp4',
    poster: 'assets/posters/snack-02.jpg',
    captions: '',
    prompt: `Je bent een ervaren auditor met veel MKB-kennis en voert een ICBO uit op de bijgevoegde concept jaarrekening [BESTANDSNAAM] van [ONDERNEMING], [RECHTSVORM], boekjaar [JAAR]. De jaarrekening is opgesteld volgens [BW2 TITEL 9 EN RJ / RJK / FISCALE GRONDSLAGEN] voor een [MICRO / KLEINE / MIDDELGROTE] rechtspersoon.

Beoordeel de jaarrekening op de volgende onderdelen.

A. Volledigheid en opbouw
- Zijn balans, winst-en-verliesrekening, grondslagen, toelichting, overige gegevens, etc. aanwezig?
- Kloppen naam, rechtsvorm, vestigingsplaats, KvK-nummer, boekjaar en data overal?

B. Cijfermatige aansluitingen
- Kloppen de balanstotalen, subtotalen en de tabellen in de toelichting?
- Sluit het resultaat uit de winst-en-verliesrekening aan op het verloop van het eigen vermogen?
- Sluiten de toelichtingen aan op de posten in de balans en de winst-en-verliesrekening?
- Komen bedragen in de tekst overeen met de tabellen?

C. Grondslagen en toelichting
- Zijn er grondslagen voor alle materiële posten, en zijn die gelijk aan vorig jaar?
- Ontbreken toelichtingen die voor dit regime gebruikelijk of vereist zijn, zoals niet in de balans opgenomen verplichtingen, gebeurtenissen na balansdatum en het gemiddeld aantal werknemers?

D. Analyse ten opzichte van vorig jaar & materialiteit
- De materialiteit bedraagt [MATERIALITEIT] voor [JAAR] en de uitvoeringsmaterialiteit [UITVOERINGSMATERIALITEIT].
- Analyseer posten en mutaties groter dan de uitvoeringsmaterialiteit.
- Bereken de solvabiliteit, de current ratio en de brutomarge voor beide jaren en laat de berekening zien.

E. Continuïteit
- Zijn er signalen zoals een negatief eigen vermogen, structurele verliezen of een krappe liquiditeit? Wordt dit in de toelichting besproken?

F. Presentatie
- Inconsistente termen, tik- of afrondingsverschillen, ontbrekende eenheden en verkeerde verwijzingen.

Lever op:
1. Een samenvatting van maximaal vijf zinnen met de belangrijkste aandachtspunten.
2. Een bevindingentabel met: Nr., Onderdeel (A tot en met F), Bevinding, Pagina, Berekening of bron, Belang (hoog/middel/laag) en Voorgestelde actie.
3. Een lijst met vragen voor de klant en een lijst met vragen voor het opdrachtteam.

Werkwijze:
- Gebruik uitsluitend de bijgevoegde stukken.
- Reken na waar dat kan en laat je berekening zien.
- Noem een wettelijke eis alleen met het artikel of het RJ-hoofdstuk als je daar zeker van bent; markeer het anders als "Nagaan".
- Geef geen oordeel over de jaarrekening als geheel; benoem alleen bevindingen en vragen.

Daarna:
Zet de bevindingen met belang "hoog" om in een korte reviewnotitie voor de opdrachtverantwoordelijke, met per punt de voorgestelde actie.`,
    promptNote: 'Werkt met de gratis Copilot Chat: voeg de concept jaarrekening (en die van vorig jaar) toe met de paperclip en vul de materialiteit uit het dossier in. Gebruik voor de demo een fictieve jaarrekening; Copilot ondersteunt de ICBO, maar vervangt jouw oordeel niet.',
    qrCode: 'assets/qr/snack-02.png',
    qrLabel: '',
    tip: 'Voeg ook de jaarrekening van vorig jaar toe. Dan kan Copilot de vergelijkende cijfers en grondslagen naast elkaar leggen.',
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
    prompt: `Ik voeg de transcriptie toe van ons overleg met [KLANTNAAM] op [DATUM]. Vanuit ons kantoor waren aanwezig: [NAMEN]. Vanuit de klant: [NAMEN].

Vat het overleg samen met:
1. De belangrijkste besproken onderwerpen, per onderwerp in 1 à 2 zinnen
2. Genomen besluiten
3. Voorstellen en ideeën waarover nog geen besluit is genomen
4. Actiepunten in een tabel met: Actie, Eigenaar, Organisatie (wij/klant), Deadline en Fragment uit de transcriptie
5. Openstaande vragen, met per vraag wie het antwoord moet geven

Regels:
- Gebruik alleen wat in de transcriptie staat en vul niets aan.
- Iets is pas een besluit als het expliciet is afgesproken. Twijfel je, zet het dan onder voorstellen.
- Vermeld "Niet benoemd" als een eigenaar of deadline ontbreekt. Neem relatieve deadlines zoals "volgende week" letterlijk over.
- Is niet duidelijk wie iets zei, markeer dat dan met "Spreker onduidelijk".
- Zet alles wat besproken is zonder de klant erbij onder een apart kopje "Intern".

Daarna:
Schrijf een korte, vriendelijke e-mail aan [KLANTNAAM] waarin je de besluiten en de acties van beide kanten bevestigt. Maximaal 150 woorden. Noem alleen besluiten en acties uit de samenvatting, doe geen nieuwe toezeggingen en laat alles onder "Intern" weg. Vraag de klant te laten weten als iets niet klopt. Onderteken met [NAAM].`,
    promptNote: 'Werkt met de gratis Copilot Chat: download de transcriptie uit Teams en voeg die toe met de paperclip.',
    qrCode: 'assets/qr/snack-03.png',
    qrLabel: '',
    tip: 'Geen transcriptie? Plak je eigen aantekeningen van het overleg; dezelfde prompt werkt dan ook.',
    audience: ['Iedereen die vergadert'],
    // Knop 'Zo transcribeer je een Teams-vergadering' onder de prompt. Menunamen kunnen per Teams-versie iets verschillen.
    guide: {
      label: 'Zo transcribeer je een Teams-vergadering',
      title: 'Een Teams-vergadering transcriberen',
      basic: {
        steps: [
          'Vertel aan het begin van het overleg dat je de vergadering transcribeert. Iedereen ziet daar ook een melding van in Teams.',
          'Kies in de vergadering bovenin Meer (…) → Opnemen en transcriberen → Transcriptie starten.',
          'Kies als gesproken taal Nederlands. Dan wordt de transcriptie een stuk beter.',
          'Klaar? Kies in hetzelfde menu Transcriptie stoppen, of beëindig de vergadering.',
          'Open na afloop de vergadering in je agenda of de vergaderchat, ga naar Samenvatting → Transcriptie en kies Downloaden (.docx).',
          'Voeg dat bestand in Copilot Chat toe met de paperclip en gebruik de prompt van deze snack.'
        ],
        note: 'Downloaden kan de organisator van de vergadering. Zie je de optie om te transcriberen niet? Dan staat die mogelijk uit; vraag het na bij ICT.'
      },
      licensed: {
        steps: [
          'Vertel aan het begin van het overleg dat Copilot meeluistert en notities maakt.',
          'Zet in de vergadering Facilitator aan, via Meer (…) of het Copilot-menu. Facilitator gebruikt de transcriptie; zet die aan als Teams erom vraagt.',
          'Tijdens het overleg houdt Facilitator gedeelde notities bij: onderwerpen, besluiten en actiepunten. Iedereen in de vergadering kijkt mee.',
          'Stel tussendoor vragen in de vergaderchat, bijvoorbeeld: "Welke acties hebben we tot nu toe afgesproken?"',
          'Na afloop vind je de notities en de transcriptie bij de vergadering (Samenvatting). Gebruik de prompt van deze snack om er de samenvatting en de bevestigingsmail van te maken.'
        ],
        note: 'Facilitator werkt met een Microsoft 365 Copilot-licentie. De namen in het menu kunnen per Teams-versie iets verschillen.'
      }
    },
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
    intro: 'Copilot zet een fictieve adviesnotitie om in een klantpresentatie in de huisstijl van Visser & Visser. Elke dia krijgt één boodschap, korte bullets en sprekersnotities met de onderbouwing, zodat je het verhaal zo kunt vertellen.',
    video: 'assets/videos/snack-04.mp4',
    poster: 'assets/posters/snack-04.jpg',
    captions: '',
    prompt: `Je bent een ervaren accountant bij Visser & Visser. Je bereidt een presentatie voor op een gesprek met [KLANTNAAM]. Het doel van het gesprek is [DOEL, bijv. "de uitkomsten van de jaarrekeningcontrole bespreken"].

BRONNEN
- Inhoud: [BESTANDSNAAM]. Gebruik alleen feiten, bedragen en conclusies die in dit document staan.
- Opmaak: de bijgevoegde template Template_PowerPoint_VV_leeg.pptx. Gebruik deze als basis voor het eindbestand.

OPBOUW (maximaal 8 dia's)
1. Titel en doel van het gesprek (titeldia van de template)
2. Samenvatting in drie punten
3-6. De belangrijkste bevindingen, één boodschap per dia
7. Advies en keuzes voor de klant
8. Vervolgstappen en planning

Heeft het document minder dan vier belangrijke bevindingen? Maak dan minder bevindingendia's. Vul niet aan met minder relevante punten.

SCHRIJFREGELS
- De diatitel is de boodschap zelf, in één zin. Dus "Voorraadwaardering vraagt aanpassing" en niet "Voorraad".
- Maximaal vier bullets per dia, elk maximaal tien woorden.
- Begrijpelijke taal voor een ondernemer, zonder vakjargon. Is een vakterm onvermijdelijk? Leg die dan uit in de sprekersnotities.
- Zet de uitleg, onderbouwing en bronverwijzing (paginanummer of paragraaf in het document) in de sprekersnotities.
- Verzin geen bedragen, data of namen. Staat iets niet in het document, schrijf dan [ONTBREEKT: wat er mist] op de dia.

GEBRUIK VAN DE TEMPLATE
- Kies per dia de layout uit de template die het best past bij de inhoud. Bijvoorbeeld een kaartlayout voor bevindingen, een tabel voor bedragen en een tijdlijn of roadmap voor de planning.
- Vervang alle placeholdertekst ("Titel van de dia", "Kop van het blok", "LABEL", "00" en dergelijke). Verander geen kleuren, lettertypes, vormen of posities.
- Blijven er in een layout vakken leeg? Verwijder dan die vakken. Laat geen placeholders staan.
- Vul de hoofdstukken in de zijbalk met de onderwerpen van deze presentatie en verwijder de overige hoofdstukken.
- Verwijder alle dia's uit de template die je niet gebruikt.

CONTROLE VOOR OPLEVERING
Controleer voordat je het bestand oplevert:
1. Er staat nergens nog placeholdertekst.
2. Geen enkele dia heeft meer dan vier bullets van tien woorden.
3. Ieder bedrag en feit is terug te vinden in het document.
4. Elke dia heeft sprekersnotities.

Lever het resultaat op als .pptx-bestand.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat: voeg je document en de PowerPoint-template (hieronder te downloaden) toe. Controleer cijfers en opmaak voordat je presenteert.',
    qrCode: 'assets/qr/snack-04.png',
    qrLabel: '',
    tip: 'Lees de sprekersnotities na: daar staan de bronverwijzingen, zodat je ieder bedrag snel kunt controleren.',
    audience: ['Advies', 'Samenstellen'],
    download: 'assets/downloads/Template_PowerPoint_VV_leeg.pptx',
    downloadLabel: 'Download de PowerPoint-template',
    license: true                       // Microsoft 365 Copilot (bestand als PowerPoint opleveren)
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
