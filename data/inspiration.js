/* ==========================================================================
   AI SNACKBAR — INSPIRATIEPROMPTS
   --------------------------------------------------------------------------
   Losse prompts zonder demo, voor de promptpagina (prompts/) en de
   QR-codes op de kaartjes. Ze staan níet op de snackkaart van de tablet.

   CONCEPT (2 oktober 2026): nr. 1-25 overgenomen uit de conceptlijst
   (titels, thema's, impact en 'Wist je dat'); de prompts zelf volgen nog.
   Nr. 26-30 zijn nieuwe voorstellen, al met prompt, toelichting en tip.

   Zo werkt het:
   - Iedere prompt staat tussen { en }, gescheiden door een komma.
   - De volgorde hier is de volgorde op de promptpagina.
   - De thema's (category) verschijnen in de volgorde waarin ze hier
     voor het eerst voorkomen, ieder met een eigen kleur. Schrijf een
     thema overal precies hetzelfde.
   - Adres per prompt: prompts/#<id>, bijv. prompts/#inspiratie-01.
     Verander een id niet meer nadat de QR-codes gedrukt zijn; titel,
     tekst en volgorde mag je altijd aanpassen.

   Velden (* = verplicht):
     id*          Unieke code, alleen kleine letters, cijfers en '-'.
                  Niet gelijk aan een snack-id, en niet 'snacks' of 'inspiratie'.
     category*    Thema, bijv. 'E-mail en werkvoorraad'.
     title*       Korte titel (max. ca. 50 tekens).
     didYouKnow   De 'Wist je dat …?'-zin, als hele zin.
     prompt       De prompt om te kopiëren. Leeg = 'De prompt volgt.'
     promptNote   Korte toelichting onder de prompt.
     tip          Praktische tip.
     impact       1, 2 of 3: getoond als stippen met het woord 'Impact'.
     license      true = Microsoft 365 Copilot-licentie nodig (Copilot gebruikt je
                  eigen mail, Teams, agenda of bestanden): badge 'Licentie'.
                  false = kan ook met de gratis Copilot Chat (tekst plakken of
                  bestand toevoegen). Weglaten = niets tonen.
   ========================================================================== */

window.AISnackbar = window.AISnackbar || {};

window.AISnackbar.inspiration = [
  /* ---- E-mail en werkvoorraad ------------------------------------------ */
  {
    id: 'inspiratie-01',
    category: 'E-mail en werkvoorraad',
    impact: 2,
    license: true,
    title: 'Start je dag met een mailboxoverzicht',
    didYouKnow: 'Wist je dat Copilot je e-mails van de afgelopen dagen kan doorzoeken op acties, verzoeken en deadlines?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-02',
    category: 'E-mail en werkvoorraad',
    impact: 2,
    license: true,
    title: 'Alle recente e-mails over één klant',
    didYouKnow: 'Wist je dat Copilot alle recente e-mails over één specifieke klant voor je kan samenbrengen?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-03',
    category: 'E-mail en werkvoorraad',
    impact: 2,
    license: true,
    title: 'Welke klantmails wachten nog op antwoord?',
    didYouKnow: 'Wist je dat Copilot kan uitzoeken welke klanten waarschijnlijk nog op jouw antwoord wachten?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-04',
    category: 'E-mail en werkvoorraad',
    impact: 1,
    license: false,
    title: 'Van één e-mailthread naar een volledig overzicht',
    didYouKnow: 'Wist je dat Copilot een lange e-mailwisseling kan terugbrengen tot afspraken, acties en openstaande vragen?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-05',
    category: 'E-mail en werkvoorraad',
    impact: 2,
    license: false,
    title: 'Beantwoord een uitgebreide klantmail punt voor punt',
    didYouKnow: 'Wist je dat Copilot een uitgebreide klantmail punt voor punt kan beantwoorden zonder vragen over te slaan?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-06',
    category: 'E-mail en werkvoorraad',
    impact: 1,
    license: false,
    title: 'Maak een klantmail korter en duidelijker',
    didYouKnow: 'Wist je dat Copilot van jouw kladversie een professionele en klantvriendelijke e-mail kan maken?',
    prompt: '',
    promptNote: '',
    tip: ''
  },

  /* ---- Teams, vergaderingen en afspraken ------------------------------- */
  {
    id: 'inspiratie-07',
    category: 'Teams, vergaderingen en afspraken',
    impact: 2,
    license: true,
    title: 'Mijn Teams-acties van de afgelopen week',
    didYouKnow: 'Wist je dat Copilot in Teams kan terugvinden wat aan jou is gevraagd en wat je zelf hebt toegezegd?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-08',
    category: 'Teams, vergaderingen en afspraken',
    impact: 1,
    license: true,
    title: 'Eén projectchat omzetten naar een actielijst',
    didYouKnow: 'Wist je dat Copilot een drukke projectchat kan omzetten in acties, verantwoordelijken en deadlines?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-09',
    category: 'Teams, vergaderingen en afspraken',
    impact: 1,
    license: true,
    title: 'Eén vergadering samenvatten',
    didYouKnow: 'Wist je dat Copilot uit een vergadering kan halen wat is besproken, besloten en afgesproken?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-10',
    category: 'Teams, vergaderingen en afspraken',
    impact: 3,
    license: true,
    title: 'Bereid mij voor op mijn volgende klantafspraak',
    didYouKnow: 'Wist je dat Copilot je kan voorbereiden op een klantafspraak met recente ontwikkelingen, afspraken en openstaande acties?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-11',
    category: 'Teams, vergaderingen en afspraken',
    impact: 2,
    license: true,
    title: 'Maak een agenda vanuit eerdere communicatie',
    didYouKnow: 'Wist je dat Copilot op basis van eerdere communicatie een doelgerichte agenda voor je volgende overleg kan maken?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-12',
    category: 'Teams, vergaderingen en afspraken',
    impact: 2,
    license: false,
    title: 'Verander transcriptie in nette notulen',
    didYouKnow: 'Wist je dat Copilot een vergadertranscriptie kan omzetten in professionele notulen met besluiten en actiepunten?',
    prompt: '',
    promptNote: '',
    tip: ''
  },

  /* ---- Klant en advies -------------------------------------------------- */
  {
    id: 'inspiratie-13',
    category: 'Klant en advies',
    impact: 3,
    license: true,
    title: 'Maak een klantoverzicht uit Microsoft 365',
    didYouKnow: 'Wist je dat Copilot recente klantcommunicatie, afspraken, documenten en deadlines kan samenbrengen tot één actueel klantbeeld?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-14',
    category: 'Klant en advies',
    impact: 3,
    license: false,
    title: 'Bereid een eerste gesprek met een nieuwe klant voor',
    didYouKnow: 'Wist je dat Copilot je kan helpen een nieuwe klant te onderzoeken en relevante vragen voor een kennismakingsgesprek te bedenken?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-15',
    category: 'Klant en advies',
    impact: 3,
    license: true,
    title: 'Signaleer adviesmogelijkheden uit klantcontact',
    didYouKnow: 'Wist je dat Copilot in klantcontact mogelijke signalen voor aanvullende adviesvragen kan herkennen?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    // Nieuw voorstel (aanvulling tot 30)
    id: 'inspiratie-27',
    category: 'Klant en advies',
    impact: 2,
    license: false,
    title: 'Leg het uit in begrijpelijke taal',
    didYouKnow: 'Wist je dat Copilot een technische uitleg kan herschrijven in heldere taal op B1-niveau, zonder dat de inhoud verandert?',
    prompt: 'Herschrijf de tekst hieronder voor een ondernemer zonder financiële achtergrond. Gebruik taalniveau B1, korte zinnen en één concreet voorbeeld. Laat alle bedragen, data en conclusies precies zoals ze zijn. Sluit af met maximaal drie punten: wat moet de klant doen of beslissen, en wanneer?\n\nTekst:\n[plak hier je uitleg]',
    promptNote: 'Controleer altijd of de vakinhoud nog klopt voordat je de tekst naar een klant stuurt.',
    tip: 'Vraag daarna: "Welke vragen zal de klant hier waarschijnlijk over stellen?" Dan ben je voorbereid.'
  },

  /* ---- Documenten en rapportages --------------------------------------- */
  {
    id: 'inspiratie-16',
    category: 'Documenten en rapportages',
    impact: 2,
    license: false,
    title: 'Verken één omvangrijk document',
    didYouKnow: 'Wist je dat Copilot een uitgebreid document kan terugbrengen tot de belangrijkste feiten, bedragen en aandachtspunten?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-17',
    category: 'Documenten en rapportages',
    impact: 3,
    license: false,
    title: 'Vergelijk concept en definitieve versie',
    didYouKnow: 'Wist je dat Copilot twee versies van een document kan vergelijken op inhoudelijke wijzigingen, bedragen en voorwaarden?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-18',
    category: 'Documenten en rapportages',
    impact: 3,
    license: false,
    title: 'Contract samenvatten voor dossiergebruik',
    didYouKnow: 'Wist je dat Copilot belangrijke afspraken, bedragen, verplichtingen en bijzondere voorwaarden uit een contract kan halen?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-19',
    category: 'Documenten en rapportages',
    impact: 3,
    license: false,
    title: 'Maak een conceptprocesbeschrijving',
    didYouKnow: 'Wist je dat Copilot losse interviewnotities kan omzetten in een logisch opgebouwde procesbeschrijving?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-20',
    category: 'Documenten en rapportages',
    impact: 2,
    license: false,
    title: 'Review een conceptverslag',
    didYouKnow: 'Wist je dat Copilot onduidelijkheden, tegenstrijdigheden en ontbrekende onderbouwing in jouw conceptverslag kan signaleren?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    // Nieuw voorstel (aanvulling tot 30)
    id: 'inspiratie-26',
    category: 'Documenten en rapportages',
    impact: 1,
    license: true,
    title: 'Vind dat ene document of besluit terug',
    didYouKnow: 'Wist je dat Copilot in je mail, Teams-chats en bestanden dat ene document of besluit kan terugvinden, ook als je de bestandsnaam niet meer weet?',
    prompt: 'Zoek in mijn e-mails, Teams-chats en bestanden van de afgelopen [3 maanden] naar [onderwerp, bijv. de afspraken over de nieuwe werkwijze voor urenregistratie]. Geef de vijf meest relevante resultaten. Vermeld per resultaat het onderwerp of de bestandsnaam, de datum, wie het heeft gestuurd of gemaakt, en in één zin waarom het relevant is. Zet de link naar het bericht of bestand erbij.',
    promptNote: 'Gebruik deze prompt in Microsoft 365 Copilot Chat. Hoe specifieker het onderwerp, hoe beter het resultaat.',
    tip: 'Weet je nog ongeveer wie het stuurde? Voeg dan toe: "van [naam collega]". Dat scheelt veel zoekwerk.'
  },

  /* ---- Excel en financiële informatie ---------------------------------- */
  {
    id: 'inspiratie-21',
    category: 'Excel en financiële informatie',
    impact: 1,
    license: false,
    title: 'Formule maken voor een concrete Excel-tabel',
    didYouKnow: 'Wist je dat Copilot een Excel-formule kan maken én stap voor stap kan uitleggen hoe deze werkt?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-22',
    category: 'Excel en financiële informatie',
    impact: 3,
    license: false,
    title: 'Vergelijk twee financiële perioden',
    didYouKnow: 'Wist je dat Copilot de grootste en opvallendste verschillen tussen twee financiële perioden kan signaleren?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-23',
    category: 'Excel en financiële informatie',
    impact: 3,
    license: false,
    title: 'Openstaande posten prioriteren',
    didYouKnow: 'Wist je dat Copilot openstaande posten kan prioriteren op basis van bedrag, ouderdom en afwijkende kenmerken?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    id: 'inspiratie-24',
    category: 'Excel en financiële informatie',
    impact: 3,
    license: false,
    title: 'Databestand controleren op afwijkingen',
    didYouKnow: 'Wist je dat Copilot dubbele, ontbrekende en opvallende transacties in een gegevensbestand kan signaleren?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    // Nieuw voorstel (aanvulling tot 30)
    id: 'inspiratie-28',
    category: 'Excel en financiële informatie',
    impact: 2,
    license: false,
    title: 'Schrijf een toelichting bij de cijfers',
    didYouKnow: 'Wist je dat Copilot bij een tabel met cijfers een heldere toelichting kan schrijven voor je rapportage of klantmail?',
    prompt: 'Bekijk de tabel in dit bestand. Schrijf een toelichting van maximaal 150 woorden voor de klant. Beschrijf de drie belangrijkste ontwikkelingen, de oorzaak voor zover die uit de cijfers blijkt, en waar de klant op moet letten. Gebruik alleen bedragen en percentages die in de tabel staan. Laat bij iedere berekening zien hoe je eraan komt.',
    promptNote: 'Gebruik deze prompt in Copilot in Excel, of voeg het bestand toe in Copilot Chat. Controleer de bedragen altijd zelf.',
    tip: 'Te formeel? Vraag: "Maak het korter en persoonlijker, als alinea in een e-mail."'
  },

  /* ---- Planning en kwaliteitsverbetering -------------------------------- */
  {
    id: 'inspiratie-25',
    category: 'Planning en kwaliteitsverbetering',
    impact: 3,
    license: true,
    title: 'Maak een persoonlijke weekplanning uit werkgegevens',
    didYouKnow: 'Wist je dat Copilot afspraken, e-mailacties en deadlines kan samenbrengen tot een voorstel voor je werkweek?',
    prompt: '',
    promptNote: '',
    tip: ''
  },
  {
    // Nieuw voorstel (aanvulling tot 30)
    id: 'inspiratie-29',
    category: 'Planning en kwaliteitsverbetering',
    impact: 2,
    license: true,
    title: 'Plan terug vanaf een deadline',
    didYouKnow: 'Wist je dat Copilot vanaf een harde deadline een terugrekenplanning kan maken, met tussenstappen, buffer en rekening houdend met je agenda?',
    prompt: 'Ik moet [opdracht, bijv. een conceptjaarrekening] uiterlijk [datum] opleveren. Maak een terugrekenplanning vanaf die deadline. Verdeel het werk in logische stappen en geef per stap een tijdsinschatting en de datum waarop die stap uiterlijk klaar moet zijn. Plan minimaal twee werkdagen buffer in en houd rekening met de afspraken die al in mijn agenda staan. Zet het in een tabel met de kolommen: Stap, Tijd, Uiterlijk klaar, Wat ik nodig heb van anderen.',
    promptNote: 'Gebruik deze prompt in Microsoft 365 Copilot Chat. Controleer de planning en zet de blokken daarna zelf in je agenda.',
    tip: 'Werk je samen? Vraag daarna: "Maak hier een korte mail van met wat ik van wie nodig heb, en wanneer."'
  },
  {
    // Nieuw voorstel (aanvulling tot 30)
    id: 'inspiratie-30',
    category: 'Planning en kwaliteitsverbetering',
    impact: 2,
    license: false,
    title: 'Maak een checklist van een terugkerende taak',
    didYouKnow: 'Wist je dat Copilot van jouw aantekeningen of werkinstructie een heldere checklist kan maken, zodat je niets meer over het hoofd ziet?',
    prompt: 'Ik voer deze taak regelmatig uit: [beschrijf de taak, bijv. het afronden van een btw-aangifte]. Hieronder staan mijn aantekeningen over hoe ik het nu doe. Maak hiervan een afvinkbare checklist in een logische volgorde. Zet bij iedere stap wat ik controleer en wat ik vastleg. Markeer de stappen waar vaak iets misgaat en stel voor hoe ik dat voorkom. Is iets onduidelijk, stel me dan eerst een vraag.\n\nAantekeningen:\n[plak hier je aantekeningen of werkinstructie]',
    promptNote: 'Gebruik je eigen werkwijze als basis en leg de checklist naast de kantoorrichtlijnen.',
    tip: 'Bewaar de checklist in OneNote of Loop. Dan vink je hem iedere keer af en verbeter je hem samen met je team.'
  }
];
