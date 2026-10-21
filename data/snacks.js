/* ==========================================================================
   AI SNACKBAR — DE SNACKKAART
   --------------------------------------------------------------------------
   Zes snacks, elk een korte demo (1-3 min). Drie werken met de gratis
   Copilot Chat (2, 3, 6: zelf een bestand toevoegen), drie laten zien wat
   een licentie extra geeft (1: je mailbox en agenda, 4: een presentatie in
   de huisstijl, 5: alles over je klant uit Microsoft 365). Snack 1 heeft al een video; voor snack 2 t/m 6 toont de
   app 'Deze demo wordt binnenkort toegevoegd' tot de video er staat
   (assets/videos/snack-0X.mp4). Nog niet klaar voor het evenement? Zet die
   snack dan op available: false ('Binnenkort').
   Snack 4 heeft een pro-versie (snack-04-pro, veld proOf): anoniem maken in Copilot,
   bouwen in Claude, terugzetten in Copilot. Die staat niet op de kaart; video:
   assets/videos/snack-04-pro.mp4.

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
     prompts      Optioneel, in plaats van prompt: meerdere prompts, ieder in een eigen
                  blok dat je openklapt en apart kopieert (max. 8):
                  [{ title: 'Stap 1 · ...', hint: 'Waar en met welke bestanden', text: `...` }, ...]
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
     proOf        Optioneel: maakt van deze snack de pro-versie van een andere snack,
                  bijv. proOf: 'snack-04'. Staat dan niet op de kaart en niet in Verras mij,
                  maar is te openen via het eindscherm en de detailpagina van die snack
                  (en staat wel op de promptpagina). Eén pro-versie per snack.
     teaser       Alleen bij een pro-versie: tekst op de knop bij de basissnack,
                  bijv. 'Bekijk ook de pro-versie met Claude!'.

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
    // Knop 'Geen licentie?' onder de prompt: instructiekaart voor de gratis Copilot Chat (geen aparte demo).
    guide: {
      label: 'Geen licentie?',
      title: 'Zonder licentie: zo werkt het met de gratis Copilot Chat',
      basic: {
        steps: [
          'Open de gratis Copilot Chat (m365.cloud.microsoft/chat, of het Copilot-paneel in Outlook).',
          'Geef Copilot je mails. Zonder licentie kan Copilot niet zelf in je mailbox zoeken. Kopieer daarom de tekst van je mails van deze week en plak die in het chatvenster. Een paar mails tegelijk mag, met per mail een regel --- MAIL --- ertussen.',
          'Gebruik dezelfde prompt, met als begin: "Hieronder staan mijn e-mails van deze week. Maak hiervan…".',
          'Agendablokken zet je zelf in je agenda. Zonder licentie maakt Copilot geen afspraken aan, maar het geeft je wel de weekplanning als lijst.'
        ]
      }
    },
    license: true                       // leest je eigen mailbox en agenda
  },
  {
    // Demo (fictieve concept-jaarrekening Amstelveen Sport B.V. 2024): ICBO in Copilot Chat met de PDF als bijlage, drie prompts.
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
    intro: 'Copilot voert als samenstellend accountant een uitgebreide ICBO uit op de fictieve concept-jaarrekening van Amstelveen Sport B.V.: volledigheid, aansluitingen, grondslagen, analyse, continuïteit en presentatie. Daarna reviewt Copilot het eigen werk kritisch en maakt een reviewnotitie.',
    video: 'assets/videos/snack-02.mp4',
    poster: 'assets/posters/snack-02.jpg',
    captions: '',
    // Drie prompts na elkaar in dezelfde chat, ieder in een eigen blok met kopieerknop (veld prompts).
    prompts: [
      {
        title: 'Stap 1 · ICBO uitvoeren',
        hint: 'In Copilot Chat. Voeg de concept-jaarrekening (PDF) toe.',
        text: `Je bent een ervaren samenstellend accountant met veel MKB-kennis. Je hebt de bijgevoegde concept-jaarrekening Jaarverslag-AmstelveenSport-2024-BV-Concept.pdf van Amstelveen Sport B.V., boekjaar 2024, samengesteld. Voer vóór oplevering aan de klant een ICBO uit. De jaarrekening is opgesteld volgens BW2 Titel 9 en RJ voor een middelgrote rechtspersoon.

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
- Zijn er grondslagen voor alle belangrijke posten, en zijn die gelijk aan vorig jaar?
- Ontbreken toelichtingen die voor dit regime gebruikelijk of vereist zijn, zoals niet in de balans opgenomen verplichtingen, gebeurtenissen na balansdatum en het gemiddeld aantal werknemers?

D. Analyse ten opzichte van vorig jaar
- Analyseer posten en mutaties groter dan € 195.000 of 10% ten opzichte van vorig jaar.
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
- Geef geen oordeel over de jaarrekening als geheel; benoem alleen bevindingen en vragen.`
      },
      {
        title: 'Stap 2 · Kritische review van de eigen ICBO',
        hint: 'In dezelfde chat, direct na stap 1.',
        text: `Review nu je eigen ICBO-uitkomst kritisch, alsof je de manager bent die het werk van een junior nakijkt. Ga ervan uit dat er fouten in zitten. Gebruik opnieuw uitsluitend de bijgevoegde stukken en lees de bronbedragen opnieuw uit de PDF, niet uit je eerdere antwoord.

Werk deze stappen een voor een af:

1. Opdracht versus oplevering
- Leg de oorspronkelijke opdracht naast je antwoord. Is ieder gevraagd onderdeel, iedere gevraagde kolom en iedere gevraagde lijst aanwezig?
- Heb je ergens iets gedaan dat de opdracht uitdrukkelijk uitsloot?

2. Interne consistentie
- Vergelijk ieder bedrag, ieder verschil en iedere ratio in je samenvatting met de bevindingentabel en de ratio-analyse.
- Gaat het overal om hetzelfde bedrag, hetzelfde boekjaar en dezelfde twee bronnen?

3. Herberekening
- Reken iedere berekening opnieuw na vanuit de bronbedragen.
- Toon per berekening: bronbedragen met pagina, de berekening, de uitkomst en of die afwijkt van je eerdere uitkomst.

4. Aansluitingen tussen onderdelen
- Zoek ieder bedrag dat op meer dan één plek voorkomt (balans, winst-en-verliesrekening, kasstroomoverzicht, verloopoverzichten, toelichtingstabellen en lopende tekst) en kijk of het overal gelijk is, ook voor de vergelijkende cijfers.
- Noem bij een verschil beide bedragen, beide pagina's en het verschil.

5. Bevindingen dat iets ontbreekt
- Doorzoek voor iedere bevinding waarin je stelt dat iets ontbreekt of alleen elders staat de volledige jaarrekening opnieuw: bestuursverslag, grondslagen, toelichting op de balans en toelichting op de winst-en-verliesrekening.
- Staat het er toch, pas de bevinding dan aan of laat deze vervallen.

6. Datums en perioden
- Kijk of alle datums en perioden in de tekst logisch zijn ten opzichte van het boekjaar en de balansdatum, en of ze in het juiste onderdeel van de jaarrekening staan.

7. Kwaliteit van de bevindingen
- Haal punten die alleen bevestigen dat iets klopt uit de bevindingentabel en zet ze onder "Uitgevoerde checks zonder bevinding".
- Ga na of het toegekende belang past bij de omvang ten opzichte van de analysegrens van € 195.000 en bij de aard van het punt.

8. Oordeel
- Ga na of je ergens een oordeel over de jaarrekening als geheel geeft, en verwijder dat.

Lever op:
1. Een correctielijst met per punt: wat er eerder stond, wat het moet zijn, de pagina en de berekening.
2. Nieuwe bevindingen die je bij deze review hebt gevonden.
3. De gecorrigeerde bevindingentabel met alle gevraagde kolommen.

Vind je bij een stap geen fout, zeg dat dan expliciet. Verzin geen correcties.`
      },
      {
        title: 'Stap 3 · Reviewnotitie voor de opdrachtverantwoordelijke',
        hint: 'In dezelfde chat, na de review.',
        text: `Zet de bevindingen met belang "hoog" om in een korte reviewnotitie voor de opdrachtverantwoordelijke, met per punt de voorgestelde actie.`
      }
    ],
    promptNote: 'Werkt met de gratis Copilot Chat: voeg de concept-jaarrekening toe met de paperclip en gebruik de drie prompts na elkaar in dezelfde chat. Eigen dossier? Pas bestandsnaam, klant, boekjaar en analysegrens aan. Copilot ondersteunt de ICBO, maar vervangt jouw oordeel niet.',
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
    // Twee prompts na elkaar in dezelfde chat, ieder in een eigen blok met kopieerknop (veld prompts).
    prompts: [
      {
        title: 'Stap 1 · Overleg samenvatten',
        hint: 'In Copilot Chat. Voeg de transcriptie uit Teams toe.',
        text: `Ik voeg de transcriptie toe van ons overleg met Nordhaven B.V. op 5 oktober 2026. Vanuit ons kantoor waren aanwezig: Sanne de Wit en Thomas Bakker. Vanuit de klant: Marieke Vos en Henk Brouwer.

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
- Is niet duidelijk wie iets zei, markeer dat dan met "Spreker onduidelijk".`
      },
      {
        title: 'Stap 2 · Bevestigingsmail aan de klant',
        hint: 'In dezelfde chat, na de samenvatting.',
        text: `Schrijf een korte, vriendelijke e-mail aan Nordhaven B.V. waarin je de besluiten en de acties van beide kanten bevestigt. Maximaal 150 woorden. Noem alleen besluiten en acties uit de samenvatting, doe geen nieuwe toezeggingen en laat interne opmerkingen weg. Vraag de klant te laten weten als iets niet klopt. Onderteken met Sanne de Wit.`
      }
    ],
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
    // Demo (fictieve jaarrekening 2025 van Nordhaven B.V.): Copilot in PowerPoint met de V&V-template.
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
    intro: 'Copilot maakt in de huisstijl van Visser & Visser een presentatie voor het jaarrekeninggesprek met de directie van het fictieve Nordhaven B.V. Elke dia krijgt één boodschap in begrijpelijke taal. De uitleg en bronverwijzing staan in de sprekersnotities, zodat je het gesprek zo kunt voeren.',
    video: 'assets/videos/snack-04.mp4',
    poster: 'assets/posters/snack-04.jpg',
    captions: '',
    prompt: `Je bent een ervaren samenstellend accountant bij Visser & Visser. Maak in deze template een presentatie van maximaal 8 dia's voor het jaarrekeninggesprek met de directie van Nordhaven B.V.

DOEL: de jaarrekening 2025 toelichten, de belangrijkste bespreekpunten en adviezen bespreken en afspraken maken over de vervolgstappen.
PUBLIEK: de directeur-grootaandeelhouder en de financieel directeur. Zij zijn ondernemers, geen accountants.
BRON: gebruik alleen het bijgevoegde document.

OPBOUW
1. Titel en doel van het gesprek
2. Samenvatting: de jaarrekening in drie punten, met de kerncijfers
3-6. De vier belangrijkste bespreekpunten, één per dia
7. Advies en keuzes voor de directie
8. Vervolgstappen en planning

SCHRIJFREGELS
- De diatitel is de boodschap in één zin.
- Maximaal vier bullets per blok, van maximaal tien woorden.
- Schrijf in begrijpelijke taal zonder vakjargon. Leg onvermijdelijke termen uit in de sprekersnotities.
- Dit is een samenstellingsopdracht, geen controle. Gebruik geen woorden als "controle", "controleverklaring" of "goedgekeurd".
- Zet uitleg en bronverwijzing (paragraaf) in de sprekersnotities.
- Gebruik alleen feiten en bedragen uit het document. Ontbreekt iets, zet dan [ONTBREEKT: wat er mist] op de dia.

OPMAAK
- Gebruik de huidige template en behoud logo, kleuren, lettertypen en zijbalk.
- Vul de zijbalk met de onderwerpen van deze presentatie.`,
    promptNote: 'Open de PowerPoint-template (hieronder te downloaden) in PowerPoint, start Copilot en voeg je document toe als bron. Controleer cijfers en opmaak voordat je presenteert.',
    qrCode: 'assets/qr/snack-04.png',
    qrLabel: '',
    tip: 'Lees de sprekersnotities na: daar staan de bronverwijzingen, zodat je ieder bedrag snel kunt controleren.',
    audience: ['Advies', 'Samenstellen'],
    download: 'assets/downloads/Template_PowerPoint_VV_leeg.pptx',
    downloadLabel: 'Download de PowerPoint-template',
    license: true                       // Microsoft 365 Copilot (bestand als PowerPoint opleveren)
  },
  {
    // Pro-versie van snack 4 (staat niet op de kaart): anonimiseren in Copilot, bouwen in Claude,
    // echte gegevens terugzetten in Copilot. Claude krijgt alleen nepdata en de lege template.
    id: 'snack-04-pro',
    proOf: 'snack-04',
    teaser: 'Bekijk ook de pro-versie met Claude!',
    title: 'Pro: presentatie met Claude',
    subtitle: 'Anoniem maken in Copilot, bouwen in Claude, terugzetten in Copilot',
    category: 'Pro-versie',
    level: 'Koploper',
    duration: '3 min',
    icon: 'assets/icons/icon-document.svg',
    accent: 'navy',
    available: true,
    featured: false,
    intro: 'Copilot maakt het document eerst anoniem: namen, bedragen en datums worden placeholders zoals [KLANT] en [BEDRAG 1], met een aparte sleuteltabel. Claude bouwt daarmee in de V&V-template de presentatie. Daarna zet Copilot de echte gegevens terug. Zo komt er geen klantgegeven bij Claude.',
    video: 'assets/videos/snack-04-pro.mp4',
    poster: 'assets/posters/snack-04-pro.jpg',
    captions: '',
    // Vier prompts, ieder in een eigen blok met kopieerknop (veld prompts).
    prompts: [
      {
        title: 'Stap 1 · Anonimiseren in Copilot',
        hint: 'Met je V&V-account. Voeg het document toe.',
        text: `Anonimiseer het bijgevoegde document, zodat het buiten onze organisatie gedeeld kan worden.

Vervang:
- de naam van de klant door [KLANT]
- namen van personen door [PERSOON 1], [PERSOON 2], enzovoort
- plaatsnamen en adressen door [PLAATS 1], [PLAATS 2], enzovoort
- ieder bedrag door [BEDRAG 1], [BEDRAG 2], enzovoort, en ieder percentage door [PERCENTAGE 1], [PERCENTAGE 2], enzovoort
- concrete datums en weeknummers door [DATUM 1], [DATUM 2], enzovoort (losse jaartallen mogen blijven staan)
- omschrijvingen waarmee de klant herkenbaar is, zoals de precieze branche, door een algemene omschrijving

Regels:
- Gebruik voor hetzelfde gegeven steeds dezelfde placeholder.
- Verander verder niets aan de tekst, de opbouw en de koppen.
- Geef iedere placeholder in de sleuteltabel precies één waarde. Gebruikt het document twee vormen van een naam (zoals de volledige naam met B.V. en een korte naam), maak dan twee placeholders.

Lever twee bestanden op:
1. Het geanonimiseerde document als .docx.
2. Een sleuteltabel als .docx, met twee kolommen: placeholder en originele waarde.

Controleer tot slot het geanonimiseerde document op gegevens die nog herleidbaar zijn. Noem die in je antwoord.`
      },
      {
        title: 'Stap 2 · Presentatie bouwen in Claude',
        hint: 'Voeg alleen het geanonimiseerde document en de template toe, nooit de sleuteltabel.',
        text: `Je bent een ervaren samenstellend accountant. Bouw in de bijgevoegde template een presentatie van maximaal 8 dia's op basis van het geanonimiseerde document, voor het jaarrekeninggesprek met de directie.
- Dit is een samenstellingsopdracht, geen controle. Gebruik geen woorden als "controle" of "goedgekeurd".
- Kies per dia een passende indeling uit de template.
- Laat alle placeholders tussen [ ] exact staan.
- De diatitel is de boodschap; maximaal vier korte punten per blok.
- Leg vaktermen uit in de sprekersnotities, met bron (§).
- Ontbreekt iets, zet dan [ONTBREEKT: wat er mist].`
      },
      {
        title: 'Stap 3 · Terugzetten in Copilot',
        hint: 'Voeg de presentatie uit Claude en de sleuteltabel toe.',
        text: `Vervang in deze presentatie iedere placeholder tussen vierkante haken, zoals [KLANT], [KLANT KORT] en [BEDRAG 1], door de originele waarde uit de bijgevoegde sleuteltabel. Doe dit op de dia's, in de tabellen, in de sprekersnotities en in de sectienaam.

Regels:
- Wijzig alleen de placeholders. Laat alle andere tekst, de opmaak, de vormen en de volgorde ongewijzigd.
- Laat [ONTBREEKT: …] staan; dat is geen placeholder uit de sleuteltabel.
- Noem in je antwoord placeholders die je niet in de sleuteltabel kon vinden.`
      },
      {
        title: 'Stap 3b · Optioneel: wat ontbreekt er nog?',
        hint: 'In dezelfde Copilot-chat als stap 3.',
        text: `Welke dingen ontbreken nog?`
      }
    ],
    promptNote: 'Nodig: Copilot met je V&V-account en toegang tot Claude. Bestanden laten opleveren (stap 1 en 3) kan met een Copilot-licentie; zonder licentie vraag je om de tekst en de vervanglijst, en gebruik je Zoeken en vervangen (Ctrl+H) in PowerPoint.',
    qrCode: 'assets/qr/snack-04-pro.png',
    qrLabel: '',
    tip: 'Bewaar de sleuteltabel alleen in je V&V-omgeving en verwijder hem als de presentatie klaar is: daarmee is alles weer herleidbaar.',
    audience: ['Advies', 'Samenstellen'],
    download: 'assets/downloads/Template_PowerPoint_VV_leeg.pptx',
    downloadLabel: 'Download de PowerPoint-template',
    guide: {
      label: 'Zo werkt de pro-versie',
      title: 'Pro-versie: van document naar presentatie met Claude',
      basic: {
        steps: [
          'Open Copilot met je V&V-account, voeg het document toe en gebruik stap 1. Je krijgt twee bestanden: het geanonimiseerde document en de sleuteltabel.',
          'Lees het geanonimiseerde document na, en de gegevens die Copilot nog herleidbaar noemt. Pas die zelf aan. Bewaar de sleuteltabel alleen in je V&V-omgeving.',
          'Open Claude en voeg alleen het geanonimiseerde document en de lege V&V-template toe. Gebruik stap 2 en download de presentatie.',
          'Ga terug naar Copilot, voeg de presentatie uit Claude en de sleuteltabel toe en gebruik stap 3. Vraag daarna eventueel welke dingen nog ontbreken (stap 3b).',
          'Controleer de presentatie, vooral de bedragen en de punten met [ONTBREEKT], voordat je hem aan de klant laat zien.'
        ],
        note: 'Claude krijgt alleen het geanonimiseerde document en de lege template, nooit de sleuteltabel of het originele document.'
      }
    },
    license: false                      // stap 1 kan in de gratis Copilot Chat; Claude is een aparte tool
  },
  {
    // Demo (fictieve klant): Microsoft 365 Copilot Chat zoekt in agenda, mail, Teams en bestanden, twee prompts.
    id: 'snack-05',
    title: 'Klaar voor je klantgesprek',
    subtitle: 'Copilot zet alles over je klant op een rij vóór de afspraak',
    category: 'Slimmer werken',
    level: 'Starter',
    duration: '2 min',
    icon: 'assets/icons/icon-calendar.svg',
    accent: 'deepteal',
    available: true,
    featured: false,
    intro: 'Morgen een afspraak met een fictieve klant? Copilot zoekt in je agenda, mails, Teams en bestanden wat er speelt: ontwikkelingen, eerdere afspraken en openstaande acties. Je krijgt vijf goede vragen en een voorstel voor de gespreksagenda.',
    video: 'assets/videos/snack-05.mp4',
    poster: 'assets/posters/snack-05.jpg',
    captions: '',
    // Twee prompts na elkaar in dezelfde chat, ieder in een eigen blok met kopieerknop (veld prompts).
    prompts: [
      {
        title: 'Stap 1 · Gesprek voorbereiden',
        hint: 'In Copilot Chat (tabblad Werk), bijvoorbeeld een dag voor de afspraak.',
        text: `Bereid mij voor op mijn eerstvolgende vergadering met [KLANTNAAM].

Gebruik relevante informatie uit:
- de agenda-uitnodiging;
- e-mails met [KLANTNAAM] uit de afgelopen [AANTAL] dagen;
- eerdere vergaderingen met [KLANTNAAM] uit de afgelopen [AANTAL] maanden;
- relevante bestanden waarin [KLANTNAAM] wordt genoemd.

Geef:
1. Datum, tijd en onderwerp van de afspraak
2. Doel van de afspraak
3. Belangrijkste ontwikkelingen sinds het vorige overleg
4. Eerder gemaakte afspraken
5. Openstaande acties voor ons
6. Openstaande acties voor de klant
7. Mogelijke knelpunten of onduidelijkheden
8. Vijf concrete vragen die ik tijdens de afspraak kan stellen
9. Een voorgestelde agenda voor het gesprek

Vermeld bij ieder feit de gebruikte bron. Maak onderscheid tussen bevestigde informatie en jouw suggesties voor gesprekspunten.`
      },
      {
        title: 'Stap 2 · Agendamail aan de klant',
        hint: 'In dezelfde chat, na de voorbereiding.',
        text: `Schrijf een korte, vriendelijke e-mail aan [KLANTNAAM] met de voorgestelde agenda, zodat de klant zich ook kan voorbereiden. Maximaal 120 woorden. Onderteken met [NAAM].`
      }
    ],
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk), bijvoorbeeld een dag voor de afspraak. Copilot gebruikt alleen berichten en bestanden waar jij toegang toe hebt.',
    qrCode: 'assets/qr/snack-05.png',
    qrLabel: '',
    tip: 'Typ / en kies de afspraak uit je agenda. Dan weet Copilot precies welk gesprek je bedoelt.',
    audience: ['Advies', 'Samenstellen'],
    license: true                       // zoekt in je eigen agenda, mail, Teams en bestanden
  },
  {
    // Demo (fictief Frans contract): bestand als bijlage in Copilot Chat, twee prompts.
    // Nog niet klaar voor het evenement? Zet available op false: de kaart toont dan 'Binnenkort'.
    id: 'snack-06',
    title: 'Contract in een andere taal',
    subtitle: 'Copilot vat een Frans contract samen in helder Nederlands',
    category: 'Inspiratie',
    level: 'Gevorderd',
    duration: '2 min',
    icon: 'assets/icons/icon-search.svg',
    accent: 'navy',
    available: true,
    featured: false,
    intro: 'Een klant stuurt een fictief contract in het Frans. Copilot vat het samen in helder Nederlands: partijen, looptijd, vergoedingen, verplichtingen en wat financieel relevant is, met per onderdeel het artikel en de originele tekst erbij. Daarna krijg je de vragen die je nog moet stellen.',
    video: 'assets/videos/snack-06.mp4',
    poster: 'assets/posters/snack-06.jpg',
    captions: '',
    // Twee prompts na elkaar in dezelfde chat, ieder in een eigen blok met kopieerknop (veld prompts).
    prompts: [
      {
        title: 'Stap 1 · Contract samenvatten',
        hint: 'In Copilot Chat. Voeg het contract toe.',
        text: `Je bent een ervaren accountant met kennis van contracten. Het bijgevoegde contract [BESTANDSNAAM] is opgesteld in het [TAAL, bijv. Frans]. Ik spreek die taal niet goed genoeg om het zelf te beoordelen.

Vat het contract in het Nederlands samen met:
1. Contractpartijen en hun rol
2. Onderwerp van het contract
3. Ingangsdatum, looptijd, verlenging en opzegging
4. Vergoedingen, betalingstermijnen en eventuele indexatie
5. Belangrijkste verplichtingen per partij
6. Aansprakelijkheid, boetes en garanties
7. Toepasselijk recht en bevoegde rechter
8. Bepalingen die financieel of fiscaal relevant kunnen zijn

Regels:
- Verwijs per onderdeel naar het artikel in het originele contract.
- Neem bij belangrijke bepalingen de oorspronkelijke tekst op, met je Nederlandse vertaling eronder.
- Is een term lastig te vertalen? Noem dan de originele term en leg uit wat die betekent.
- Staat iets niet in het contract, schrijf dan "Niet geregeld".
- Geef geen juridisch oordeel; markeer onduidelijkheden als vraag.`
      },
      {
        title: 'Stap 2 · Vragen voor klant of jurist',
        hint: 'In dezelfde chat, na de samenvatting.',
        text: `Maak een lijst met maximaal vijf vragen die ik aan de klant of een jurist moet stellen voordat we dit contract verwerken.`
      }
    ],
    promptNote: 'Werkt met de gratis Copilot Chat: voeg het contract toe met de paperclip. Gebruik voor de demo een fictief contract en laat belangrijke conclusies altijd controleren.',
    qrCode: 'assets/qr/snack-06.png',
    qrLabel: '',
    tip: 'Vraag daarna: "Vertaal artikel [NUMMER] volledig naar het Nederlands." Zo lees je het belangrijkste artikel helemaal.',
    audience: ['Internationale klanten', 'Advies'],
    license: false                      // bestand toevoegen kan in de gratis Copilot Chat
  }
];
