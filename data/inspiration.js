/* ==========================================================================
   AI SNACKBAR — INSPIRATIEPROMPTS
   --------------------------------------------------------------------------
   Losse prompts zonder demo, voor de promptpagina (prompts/) en de
   QR-codes op de kaartjes. Ze staan níet op de snackkaart van de tablet.

   Stand 5 oktober 2026: nr. 1-25 uit de lijst van de organisatie (beoordeeld
   en waar nodig aangescherpt), nr. 26-30 aanvullende voorstellen. 17 prompts
   met licentie hebben ook een versie zonder licentie (promptBasic).

   Zo werkt het:
   - Iedere prompt staat tussen { en }, gescheiden door een komma.
   - De volgorde hier is de volgorde op de promptpagina.
   - De thema's (category) verschijnen in de volgorde waarin ze hier
     voor het eerst voorkomen, ieder met een eigen kleur. Schrijf een
     thema overal precies hetzelfde.
   - Adres per prompt: prompts/#<id>, bijv. prompts/#inspiratie-01.
     Verander een id niet meer nadat de QR-codes gedrukt zijn; titel,
     tekst en volgorde mag je altijd aanpassen.
   - De prompt staat tussen backticks (` ... `): zo kun je gewoon regels
     typen. Gebruik binnen de prompt zelf geen backtick.

   Velden (* = verplicht):
     id*          Unieke code, alleen kleine letters, cijfers en '-'.
                  Niet gelijk aan een snack-id, en niet 'snacks' of 'inspiratie'.
     category*    Thema, bijv. 'E-mail en werkvoorraad'.
     title*       Korte titel (max. ca. 50 tekens).
     didYouKnow   De 'Wist je dat …?'-zin, als hele zin (bij de prompt, onder de titel).
     description  Korte omschrijving (in de lijst, onder de titel).
     usefulFor    'Handig bij', bijv. 'Drukke inbox' (bij de prompt).
     prompt       De prompt om te kopiëren. Leeg = 'De prompt volgt.'
     promptNote   Korte toelichting onder de prompt: waar gebruik je hem?
     tip          Praktische tip.
     impact       1, 2 of 3: getoond als stippen met het woord 'Impact'.
     license      true = de prompt gebruikt een Microsoft 365 Copilot-licentie (Copilot
                  haalt zelf je mail, Teams, agenda of bestanden op).
                  false = kan met de gratis Copilot Chat (tekst plakken of bestand
                  toevoegen). Weglaten = niets tonen.
     promptBasic  Optioneel, alleen bij license: true: dezelfde prompt zonder licentie
                  (je plakt de tekst zelf of voegt het bestand toe). Dan staat bij de
                  prompt een schakelaar 'Met licentie / Zonder licentie'. Zonder
                  promptBasic krijgt de prompt de badge 'Licentie' (licentie nodig).
     promptNoteBasic  Toelichting bij de versie zonder licentie.
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
    description: 'Laat Copilot je acties, deadlines en openstaande verzoeken uit recente e-mails verzamelen.',
    usefulFor: 'Drukke inbox',
    prompt: `Analyseer de e-mails die ik in de afgelopen [AANTAL] dagen heb ontvangen.

Neem uitsluitend e-mails op waarin:
- een actie of reactie van mij wordt gevraagd;
- een deadline wordt genoemd;
- ik een document moet beoordelen of aanleveren;
- een afspraak of toezegging aan mij is gekoppeld;
- een klant of collega op mijn reactie wacht.

Maak een tabel met:
1. Afzender
2. Onderwerp
3. Ontvangstdatum
4. Gevraagde actie
5. Deadline
6. Betrokken klant
7. Urgentie: hoog, middel of laag
8. Aanbevolen eerstvolgende stap

Sorteer eerst op verstreken deadlines, daarna op urgentie en vervolgens op ontvangstdatum.

Neem informatieve nieuwsbrieven, automatische notificaties en e-mails zonder actie voor mij niet op. Als een actie, deadline of klant niet expliciet uit de e-mail blijkt, vermeld dan "Niet benoemd".`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Controleer deadlines altijd even in de mail zelf.',
    tip: ''
  },
  {
    id: 'inspiratie-02',
    category: 'E-mail en werkvoorraad',
    impact: 2,
    license: true,
    title: 'Alle recente e-mails over één klant',
    didYouKnow: 'Wist je dat Copilot alle recente e-mails over één specifieke klant voor je kan samenbrengen?',
    description: 'Breng recente klantmails, afspraken en openstaande vragen samen in één overzicht.',
    usefulFor: 'Klantoverzicht',
    prompt: `Zoek in mijn ontvangen en verzonden e-mails van de afgelopen [AANTAL] dagen naar berichten die betrekking hebben op [KLANTNAAM].

Maak een chronologisch overzicht van:
1. De belangrijkste besproken onderwerpen
2. Door de klant gestelde vragen
3. Door ons gestelde vragen
4. Toegezegde documenten of informatie
5. Openstaande acties voor mij
6. Openstaande acties voor de klant
7. Genoemde deadlines
8. Punten waarover nog geen overeenstemming bestaat

Vermeld per onderwerp:
- datum van het meest recente bericht;
- afzender;
- e-mailonderwerp;
- huidige stand van zaken.

Gebruik uitsluitend informatie die expliciet in de e-mails staat. Presenteer aannames niet als feiten en markeer onduidelijke punten als "Nog te verifiëren".`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Schrijf de klantnaam zoals die in de mails staat.',
    tip: ''
  },
  {
    id: 'inspiratie-03',
    category: 'E-mail en werkvoorraad',
    impact: 2,
    license: true,
    title: 'Welke klantmails wachten nog op antwoord?',
    didYouKnow: 'Wist je dat Copilot kan uitzoeken welke klanten waarschijnlijk nog op jouw antwoord wachten?',
    description: 'Vind klantmails waarop je waarschijnlijk nog moet reageren.',
    usefulFor: 'Mailopvolging',
    prompt: `Analyseer mijn ontvangen e-mails van de afgelopen [AANTAL] werkdagen.

Identificeer uitsluitend e-mails van klanten waarop naar verwachting nog een reactie van mij nodig is.

Controleer daarbij:
- of de afzender een vraag stelt;
- of om documenten, bevestiging of advies wordt gevraagd;
- of een beslissing of goedkeuring van mij wordt verwacht;
- of ik na ontvangst al een inhoudelijke reactie heb verzonden;
- of in een vervolgmail blijkt dat het verzoek inmiddels is afgehandeld.

Maak een tabel met:
1. Klant
2. Afzender
3. Onderwerp
4. Ontvangstdatum
5. Gevraagde reactie
6. Eventuele deadline
7. Reden waarom de e-mail nog open lijkt te staan
8. Concept voor de eerstvolgende actie

Neem een e-mail niet op als je niet kunt vaststellen dat een reactie nodig is. Benoem eventuele onzekerheid expliciet.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Een antwoord buiten de mail om, zoals telefonisch, ziet Copilot niet.',
    tip: ''
  },
  {
    id: 'inspiratie-04',
    category: 'E-mail en werkvoorraad',
    impact: 1,
    license: true,
    title: 'Van één e-mailthread naar een volledig overzicht',
    didYouKnow: 'Wist je dat Copilot een lange e-mailwisseling kan terugbrengen tot afspraken, acties en openstaande vragen?',
    description: 'Laat een lange e-mailwisseling terugbrengen tot hoofdlijnen, afspraken en acties.',
    usefulFor: 'Lange mailthreads',
    prompt: `Analyseer de volledige e-mailthread met als onderwerp "[ONDERWERP]".

Geef uitsluitend:
1. Aanleiding van de correspondentie
2. Belangrijkste feiten
3. Standpunten of vragen per betrokken partij
4. Gemaakte afspraken
5. Toegezegde documenten
6. Openstaande acties met verantwoordelijke
7. Genoemde deadlines
8. Punten waarover nog onduidelijkheid bestaat

Sluit af met een samenvatting van maximaal vijf zinnen waarin je de actuele status van de e-mailwisseling beschrijft.

Baseer je uitsluitend op deze e-mailthread. Voeg geen informatie uit andere e-mails of documenten toe.`,
    promptNote: 'Gebruik in Copilot Chat (tabblad Werk) of in Outlook met de mailwisseling geopend.',
    promptBasic: `Analyseer de e-mailwisseling die ik hieronder plak.

Geef uitsluitend:
1. Aanleiding van de correspondentie
2. Belangrijkste feiten
3. Standpunten of vragen per betrokken partij
4. Gemaakte afspraken
5. Toegezegde documenten
6. Openstaande acties met verantwoordelijke
7. Genoemde deadlines
8. Punten waarover nog onduidelijkheid bestaat

Sluit af met een samenvatting van maximaal vijf zinnen waarin je de actuele status van de e-mailwisseling beschrijft.

Baseer je uitsluitend op deze e-mailwisseling. Voeg geen andere informatie toe.

E-mailwisseling:
[PLAK HIER DE VOLLEDIGE E-MAILWISSELING]`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: kopieer de mailwisseling uit Outlook en plak die onderaan de prompt.',
    tip: ''
  },
  {
    id: 'inspiratie-05',
    category: 'E-mail en werkvoorraad',
    impact: 2,
    license: true,
    title: 'Beantwoord een uitgebreide klantmail punt voor punt',
    didYouKnow: 'Wist je dat Copilot een uitgebreide klantmail punt voor punt kan beantwoorden zonder vragen over te slaan?',
    description: 'Laat Copilot een uitgebreide klantmail opsplitsen en punt voor punt beantwoorden.',
    usefulFor: 'Klantvragen',
    prompt: `Analyseer de e-mail van [NAAM AFZENDER] over [ONDERWERP] van [DATUM].

Voer de opdracht in twee stappen uit.

Stap 1:
Maak een genummerde lijst van iedere afzonderlijke:
- vraag;
- verzoek;
- deadline;
- toezegging;
- bijlage waarnaar wordt verwezen.

Stap 2:
Schrijf een professioneel conceptantwoord waarin ieder punt in dezelfde volgorde wordt behandeld.

Gebruik een vriendelijke en zakelijke toon. Houd het antwoord beknopt, maar volledig. Voeg geen feiten, toezeggingen of deadlines toe die niet uit de e-mail of mijn onderstaande instructies blijken.

Aanvullende informatie voor het antwoord:
[VOEG HIER EVENTUELE INFORMATIE TOE]

Markeer ontbrekende informatie met [AANVULLEN] in plaats van deze zelf in te vullen.`,
    promptNote: 'Gebruik in Copilot Chat (tabblad Werk) of in Outlook met de e-mail geopend. Lees het concept altijd na voordat je het verstuurt.',
    promptBasic: `Analyseer de klantmail die ik hieronder plak.

Voer de opdracht in twee stappen uit.

Stap 1:
Maak een genummerde lijst van iedere afzonderlijke:
- vraag;
- verzoek;
- deadline;
- toezegging;
- bijlage waarnaar wordt verwezen.

Stap 2:
Schrijf een professioneel conceptantwoord waarin ieder punt in dezelfde volgorde wordt behandeld.

Gebruik een vriendelijke en zakelijke toon. Houd het antwoord beknopt, maar volledig. Voeg geen feiten, toezeggingen of deadlines toe die niet uit de e-mail of mijn onderstaande instructies blijken.

Aanvullende informatie voor het antwoord:
[VOEG HIER EVENTUELE INFORMATIE TOE]

Markeer ontbrekende informatie met [AANVULLEN] in plaats van deze zelf in te vullen.

E-mail:
[PLAK HIER DE E-MAIL]`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: plak de e-mail onderaan de prompt. Lees het concept altijd na voordat je het verstuurt.',
    tip: ''
  },
  {
    id: 'inspiratie-06',
    category: 'E-mail en werkvoorraad',
    impact: 1,
    license: false,
    title: 'Maak een klantmail korter en duidelijker',
    didYouKnow: 'Wist je dat Copilot van jouw kladversie een professionele en klantvriendelijke e-mail kan maken?',
    description: 'Herschrijf je boodschap professioneel, vriendelijk en concreet.',
    usefulFor: 'Klantcommunicatie',
    prompt: `Herschrijf onderstaande conceptmail aan [KLANT OF ONTVANGER].

Doel van de mail:
[DOEL]

Gewenste actie van de ontvanger:
[ACTIE]

Gewenste deadline:
[DEADLINE]

Maak de mail:
- professioneel;
- vriendelijk;
- concreet;
- maximaal [AANTAL] woorden;
- voorzien van een duidelijke onderwerpregel;
- afgesloten met één concrete call-to-action.

Behoud alle feiten en inhoudelijke nuances. Voeg geen nieuwe toezeggingen of informatie toe. Vermijd lange inleidingen, herhaling en onnodig formele taal.

Conceptmail:
[PLAK CONCEPTMAIL]`,
    promptNote: 'Werkt ook met de gratis Copilot Chat: plak je conceptmail onderaan de prompt.',
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
    description: 'Vind terug wat aan jou is gevraagd en wat je zelf hebt toegezegd.',
    usefulFor: 'Teams-opvolging',
    prompt: `Analyseer mijn Teams-chats en Teams-kanaalberichten van de afgelopen [AANTAL] dagen.

Zoek uitsluitend naar berichten waarin:
- ik rechtstreeks word genoemd;
- een vraag aan mij wordt gesteld;
- een actie aan mij wordt toegewezen;
- ik zelf een toezegging doe;
- een deadline voor mij wordt genoemd;
- iemand op mijn reactie wacht.

Maak een tabel met:
1. Datum
2. Chat of kanaal
3. Betrokken personen
4. Actie voor mij
5. Deadline
6. Status voor zover uit de berichten blijkt
7. Link of duidelijke verwijzing naar het bronbericht

Sorteer op deadline en daarna op datum. Neem sociale berichten, algemene mededelingen en acties voor andere personen niet op. Als een deadline ontbreekt, vermeld dan "Niet benoemd".`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk).',
    tip: ''
  },
  {
    id: 'inspiratie-08',
    category: 'Teams, vergaderingen en afspraken',
    impact: 1,
    license: true,
    title: 'Eén projectchat omzetten naar een actielijst',
    didYouKnow: 'Wist je dat Copilot een drukke projectchat kan omzetten in acties, verantwoordelijken en deadlines?',
    description: 'Zet een drukke projectchat om in acties, eigenaren en deadlines.',
    usefulFor: 'Projectoverleg',
    prompt: `Analyseer de Teams-chat met de naam "[NAAM VAN DE CHAT]" over de periode [STARTDATUM] tot en met [EINDDATUM].

Maak een actielijst met:
1. Actie
2. Verantwoordelijke
3. Deadline
4. Huidige status
5. Datum waarop de actie is genoemd
6. Korte verwijzing naar het relevante bericht

Neem alleen acties op die expliciet zijn gevraagd, toegewezen of toegezegd.

Maak daarnaast afzonderlijke lijsten van:
- genomen besluiten;
- openstaande vragen;
- onderwerpen die nog moeten worden besproken.

Als verantwoordelijke, deadline of status niet duidelijk is, vermeld dan "Niet benoemd". Leid deze informatie niet zelf af.`,
    promptNote: 'Gebruik in Copilot Chat (tabblad Werk) of in Teams, in de chat zelf.',
    promptBasic: `Analyseer de berichten uit een Teams-chat die ik hieronder plak.

Maak een actielijst met:
1. Actie
2. Verantwoordelijke
3. Deadline
4. Huidige status
5. Datum waarop de actie is genoemd
6. Korte verwijzing naar het relevante bericht

Neem alleen acties op die expliciet zijn gevraagd, toegewezen of toegezegd.

Maak daarnaast afzonderlijke lijsten van:
- genomen besluiten;
- openstaande vragen;
- onderwerpen die nog moeten worden besproken.

Als verantwoordelijke, deadline of status niet duidelijk is, vermeld dan "Niet benoemd". Leid deze informatie niet zelf af.

Chatberichten:
[PLAK HIER DE BERICHTEN UIT DE CHAT]`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: selecteer de berichten in Teams, kopieer ze en plak ze onderaan de prompt.',
    tip: ''
  },
  {
    id: 'inspiratie-09',
    category: 'Teams, vergaderingen en afspraken',
    impact: 1,
    license: true,
    title: 'Eén vergadering samenvatten',
    didYouKnow: 'Wist je dat Copilot uit een vergadering kan halen wat is besproken, besloten en afgesproken?',
    description: 'Laat Copilot besluiten, acties en openstaande vragen uit een vergadering halen.',
    usefulFor: 'Vergaderingen',
    prompt: `Maak een samenvatting van de vergadering "[NAAM VERGADERING]" op [DATUM].

Gebruik uitsluitend:
- de beschikbare transcriptie;
- de vergaderchat;
- gedeelde vergadernotities.

Structureer de uitkomst als volgt:
1. Doel van de vergadering
2. Belangrijkste besproken onderwerpen
3. Definitief genomen besluiten
4. Actiepunten met verantwoordelijke en deadline
5. Openstaande vragen
6. Verschillen van inzicht
7. Afgesproken vervolg

Maak duidelijk of informatie afkomstig is uit de transcriptie, vergaderchat of notities.

Presenteer een voorstel of discussiepunt niet als besluit. Vermeld "Niet benoemd" wanneer een verantwoordelijke of deadline ontbreekt.`,
    promptNote: 'Werkt alleen als de vergadering is opgenomen of getranscribeerd. Ook te gebruiken in Teams, bij de vergadering zelf.',
    promptBasic: `Maak een samenvatting van de vergadering "[NAAM VERGADERING]" op [DATUM].

Gebruik uitsluitend de transcriptie of notities die ik toevoeg.

Structureer de uitkomst als volgt:
1. Doel van de vergadering
2. Belangrijkste besproken onderwerpen
3. Definitief genomen besluiten
4. Actiepunten met verantwoordelijke en deadline
5. Openstaande vragen
6. Verschillen van inzicht
7. Afgesproken vervolg

Presenteer een voorstel of discussiepunt niet als besluit. Vermeld "Niet benoemd" wanneer een verantwoordelijke of deadline ontbreekt.

Transcriptie of notities:
[PLAK HIER DE TEKST, OF VOEG HET BESTAND TOE]`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: download de transcriptie uit Teams en voeg die toe, of plak je eigen notities.',
    tip: ''
  },
  {
    id: 'inspiratie-10',
    category: 'Teams, vergaderingen en afspraken',
    impact: 3,
    license: true,
    title: 'Bereid mij voor op mijn volgende klantafspraak',
    didYouKnow: 'Wist je dat Copilot je kan voorbereiden op een klantafspraak met recente ontwikkelingen, afspraken en openstaande acties?',
    description: 'Verzamel vooraf de laatste ontwikkelingen, afspraken en openstaande acties.',
    usefulFor: 'Klantgesprekken',
    prompt: `Bereid mij voor op mijn eerstvolgende vergadering met [KLANTNAAM].

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

Vermeld bij ieder feit de gebruikte bron. Maak onderscheid tussen bevestigde informatie en jouw suggesties voor gesprekspunten.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk), bijvoorbeeld een dag voor de afspraak.',
    promptBasic: `Bereid mij voor op mijn afspraak met [KLANTNAAM] op [DATUM] over [ONDERWERP].

Gebruik uitsluitend de informatie die ik hieronder toevoeg:
- recente e-mails met [KLANTNAAM];
- notities van eerdere gesprekken;
- relevante documenten (als bijlage).

Geef:
1. Doel van de afspraak
2. Belangrijkste ontwikkelingen sinds het vorige overleg
3. Eerder gemaakte afspraken
4. Openstaande acties voor ons
5. Openstaande acties voor de klant
6. Mogelijke knelpunten of onduidelijkheden
7. Vijf concrete vragen die ik tijdens de afspraak kan stellen
8. Een voorgestelde agenda voor het gesprek

Vermeld bij ieder feit de gebruikte bron. Maak onderscheid tussen bevestigde informatie en jouw suggesties voor gesprekspunten.

Informatie:
[PLAK HIER DE E-MAILS EN NOTITIES]`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: plak de laatste mails en je notities, of voeg ze toe als bestand.',
    tip: ''
  },
  {
    id: 'inspiratie-11',
    category: 'Teams, vergaderingen en afspraken',
    impact: 2,
    license: true,
    title: 'Maak een agenda vanuit eerdere communicatie',
    didYouKnow: 'Wist je dat Copilot op basis van eerdere communicatie een doelgerichte agenda voor je volgende overleg kan maken?',
    description: 'Maak van eerdere communicatie een doelgerichte agenda voor het volgende overleg.',
    usefulFor: 'Overlegvoorbereiding',
    prompt: `Stel een agenda op voor de komende vergadering "[NAAM VERGADERING]" met [KLANT OF DEELNEMERS] op [DATUM].

Gebruik:
- de agenda-uitnodiging;
- relevante e-mails uit de afgelopen [AANTAL] weken;
- openstaande acties uit de vorige vergadering;
- documenten die expliciet voor deze vergadering zijn gedeeld.

Maak een agenda voor maximaal [DUUR] minuten, als tabel met:
1. Onderwerp
2. Doel van het agendapunt
3. Benodigde voorbereiding
4. Gewenste beslissing of uitkomst
5. Beschikbare tijd

Neem alleen onderwerpen op die uit de beschikbare informatie volgen. Plaats openstaande acties en beslispunten vooraan.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Deel de agenda daarna met de deelnemers.',
    promptBasic: `Stel een agenda op voor de vergadering "[NAAM VERGADERING]" met [KLANT OF DEELNEMERS] op [DATUM].

Gebruik uitsluitend de informatie die ik hieronder toevoeg:
- relevante e-mails;
- openstaande acties uit de vorige vergadering;
- documenten die voor deze vergadering zijn gedeeld (als bijlage).

Maak een agenda voor maximaal [DUUR] minuten, als tabel met:
1. Onderwerp
2. Doel van het agendapunt
3. Benodigde voorbereiding
4. Gewenste beslissing of uitkomst
5. Beschikbare tijd

Neem alleen onderwerpen op die uit de informatie volgen. Plaats openstaande acties en beslispunten vooraan.

Informatie:
[PLAK HIER DE E-MAILS EN ACTIEPUNTEN]`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: plak de mails en actiepunten onderaan de prompt.',
    tip: ''
  },
  {
    id: 'inspiratie-12',
    category: 'Teams, vergaderingen en afspraken',
    impact: 2,
    license: true,
    title: 'Verander transcriptie in nette notulen',
    didYouKnow: 'Wist je dat Copilot een vergadertranscriptie kan omzetten in professionele notulen met besluiten en actiepunten?',
    description: 'Zet een transcriptie om in professionele notulen met besluiten en actiepunten.',
    usefulFor: 'Notuleren',
    prompt: `Zet de transcriptie van de vergadering "[NAAM VERGADERING]" op [DATUM] om in professionele notulen.

Gebruik de volgende structuur:
1. Datum en onderwerp
2. Doel van de vergadering
3. Besproken onderwerpen in logische volgorde
4. Besluiten
5. Actiepunten
6. Openstaande vragen
7. Vervolgafspraak

Gebruik voor de actielijst een tabel met:
- Actie
- Verantwoordelijke
- Deadline
- Bronpassage of tijdstip

Verwijder herhalingen, stopwoorden en technische transcriptiefouten. Verander de inhoudelijke betekenis niet. Neem uitsluitend informatie op die uit de transcriptie blijkt.`,
    promptNote: 'Werkt alleen als de vergadering is getranscribeerd. Controleer namen en besluiten voordat je de notulen deelt.',
    promptBasic: `Zet de bijgevoegde transcriptie van de vergadering "[NAAM VERGADERING]" op [DATUM] om in professionele notulen.

Gebruik de volgende structuur:
1. Datum en onderwerp
2. Doel van de vergadering
3. Besproken onderwerpen in logische volgorde
4. Besluiten
5. Actiepunten
6. Openstaande vragen
7. Vervolgafspraak

Gebruik voor de actielijst een tabel met:
- Actie
- Verantwoordelijke
- Deadline
- Bronpassage of tijdstip

Verwijder herhalingen, stopwoorden en technische transcriptiefouten. Verander de inhoudelijke betekenis niet. Neem uitsluitend informatie op die uit de transcriptie blijkt.`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: download de transcriptie uit Teams en voeg die toe met de paperclip.',
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
    description: 'Breng recente communicatie, afspraken, documenten en deadlines samen.',
    usefulFor: 'Klantvoorbereiding',
    prompt: `Maak een actueel klantoverzicht voor [KLANTNAAM].

Gebruik relevante informatie uit de afgelopen [AANTAL] maanden uit:
- e-mails;
- Teams-chats;
- vergaderingen;
- Word-, Excel-, PowerPoint- en PDF-bestanden.

Structureer het overzicht als volgt:
1. Kernactiviteiten van de klant
2. Belangrijkste contactpersonen en hun rol
3. Lopende opdrachten
4. Recente ontwikkelingen
5. Openstaande vragen en acties
6. Belangrijke deadlines
7. Genoemde risico’s of knelpunten
8. Mogelijke advies- of gespreksonderwerpen
9. Documenten die waarschijnlijk relevant zijn voor vervolgwerkzaamheden

Vermeld per onderdeel de gebruikte bron en datum. Presenteer mogelijke adviesonderwerpen uitsluitend als suggesties. Neem geen informatie op waarvan de relatie met [KLANTNAAM] onzeker is.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Copilot gebruikt alleen berichten en bestanden waar jij toegang toe hebt.',
    tip: ''
  },
  {
    id: 'inspiratie-14',
    category: 'Klant en advies',
    impact: 3,
    license: false,
    title: 'Bereid een eerste gesprek met een nieuwe klant voor',
    didYouKnow: 'Wist je dat Copilot je kan helpen een nieuwe klant te onderzoeken en relevante vragen voor een kennismakingsgesprek te bedenken?',
    description: 'Bereid een kennismakingsgesprek voor met bedrijfsinformatie en slimme vragen.',
    usefulFor: 'Nieuwe klanten',
    prompt: `Bereid een eerste kennismakingsgesprek voor met [BEDRIJFSNAAM].

Gebruik uitsluitend:
- de website van [BEDRIJFSNAAM];
- openbare informatie uit betrouwbare bronnen;
- documenten die ik in deze chat toevoeg.

Geef:
1. Korte beschrijving van de onderneming
2. Verdienmodel
3. Producten en diensten
4. Belangrijkste markten en klantgroepen
5. Recente publiek beschikbare ontwikkelingen
6. Mogelijke financiële en operationele aandachtspunten
7. Vijf branchespecifieke vragen
8. Vijf vragen over de administratie en financiële rapportage
9. Vijf vragen over toekomstplannen en adviesbehoeften

Vermeld voor iedere feitelijke constatering de bron. Maak duidelijk onderscheid tussen feiten, mogelijke aandachtspunten en vragen voor het gesprek.`,
    promptNote: 'Werkt ook met de gratis Copilot Chat, met zoeken op internet aan. Controleer bedrijfsgegevens bij de bron, bijvoorbeeld de KvK.',
    tip: ''
  },
  {
    id: 'inspiratie-15',
    category: 'Klant en advies',
    impact: 3,
    license: true,
    title: 'Signaleer adviesmogelijkheden uit klantcontact',
    didYouKnow: 'Wist je dat Copilot in klantcontact mogelijke signalen voor aanvullende adviesvragen kan herkennen?',
    description: 'Herken in klantcontact mogelijke signalen voor aanvullende dienstverlening.',
    usefulFor: 'Advieskansen',
    prompt: `Analyseer mijn e-mails en vergaderingen met [KLANTNAAM] uit de afgelopen [AANTAL] maanden.

Zoek naar expliciete signalen over:
- groei of krimp;
- financieringsbehoefte;
- liquiditeitsproblemen;
- personeelsgroei;
- investeringsplannen;
- bedrijfsopvolging;
- internationalisering;
- automatisering;
- veranderende rapportagebehoeften;
- fiscale of juridische vraagstukken;
- behoefte aan tussentijdse stuurinformatie.

Maak een tabel met:
1. Signaal
2. Letterlijke of zakelijke bronverwijzing
3. Datum
4. Mogelijke adviesvraag
5. Aanbevolen vervolgvraag aan de klant
6. Betrokken discipline

Presenteer dit als mogelijke gespreksonderwerpen, niet als vastgestelde commerciële kansen. Neem alleen signalen op die aantoonbaar uit de bronnen volgen.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Let bij controleklanten op de onafhankelijkheidsregels voordat je aanvullend advies bespreekt.',
    promptBasic: `Analyseer de e-mails en gespreksnotities over [KLANTNAAM] die ik hieronder plak.

Zoek naar expliciete signalen over:
- groei of krimp;
- financieringsbehoefte;
- liquiditeitsproblemen;
- personeelsgroei;
- investeringsplannen;
- bedrijfsopvolging;
- internationalisering;
- automatisering;
- veranderende rapportagebehoeften;
- fiscale of juridische vraagstukken;
- behoefte aan tussentijdse stuurinformatie.

Maak een tabel met:
1. Signaal
2. Letterlijke of zakelijke bronverwijzing
3. Datum
4. Mogelijke adviesvraag
5. Aanbevolen vervolgvraag aan de klant
6. Betrokken discipline

Presenteer dit als mogelijke gespreksonderwerpen, niet als vastgestelde commerciÃ«le kansen. Neem alleen signalen op die aantoonbaar uit de tekst volgen.

E-mails en notities:
[PLAK HIER DE TEKST]`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: plak de mails en notities onderaan. Let bij controleklanten op de onafhankelijkheidsregels.',
    tip: ''
  },
  {
    // Aanvullend voorstel
    id: 'inspiratie-27',
    category: 'Klant en advies',
    impact: 2,
    license: false,
    title: 'Leg het uit in begrijpelijke taal',
    didYouKnow: 'Wist je dat Copilot een technische uitleg kan herschrijven in heldere taal op B1-niveau, zonder dat de inhoud verandert?',
    description: 'Herschrijf een technische uitleg naar heldere taal voor je klant.',
    usefulFor: 'Klantuitleg',
    prompt: `Herschrijf de tekst hieronder voor een ondernemer zonder financiële achtergrond.

Gebruik:
- taalniveau B1;
- korte zinnen;
- één concreet voorbeeld.

Laat alle bedragen, data en conclusies precies zoals ze zijn. Sluit af met maximaal drie punten: wat moet de klant doen of beslissen, en wanneer?

Tekst:
[PLAK HIER JE UITLEG]`,
    promptNote: 'Werkt ook met de gratis Copilot Chat. Controleer altijd of de vakinhoud nog klopt voordat je de tekst naar een klant stuurt.',
    tip: 'Vraag daarna: "Welke vragen zal de klant hier waarschijnlijk over stellen?" Dan ben je voorbereid.'
  },

  /* ---- Documenten en rapportages --------------------------------------- */
  {
    id: 'inspiratie-16',
    category: 'Documenten en rapportages',
    impact: 2,
    license: true,
    title: 'Verken één omvangrijk document',
    didYouKnow: 'Wist je dat Copilot een uitgebreid document kan terugbrengen tot de belangrijkste feiten, bedragen en aandachtspunten?',
    description: 'Haal de belangrijkste feiten, bedragen en aandachtspunten uit een omvangrijk document.',
    usefulFor: 'Lange documenten',
    prompt: `Analyseer het bestand /[BESTANDSNAAM].

Maak een eerste verkenning met:
1. Doel en type document
2. Periode waarop het document betrekking heeft
3. Managementsamenvatting van maximaal 150 woorden
4. Belangrijkste bedragen
5. Belangrijkste data en deadlines
6. Verplichtingen per betrokken partij
7. Genoemde risico’s en onzekerheden
8. Onderdelen die financiële verwerking kunnen beïnvloeden
9. Vijf vragen voor nadere beoordeling
10. Relevante pagina- of paragraafverwijzingen

Gebruik uitsluitend dit bestand. Maak onderscheid tussen letterlijke documentinhoud en jouw interpretatie. Vermeld expliciet wanneer informatie niet in het document staat.`,
    promptNote: 'Typ / in Copilot Chat (tabblad Werk) en kies het bestand.',
    promptBasic: `Analyseer het bijgevoegde bestand [BESTANDSNAAM].

Maak een eerste verkenning met:
1. Doel en type document
2. Periode waarop het document betrekking heeft
3. Managementsamenvatting van maximaal 150 woorden
4. Belangrijkste bedragen
5. Belangrijkste data en deadlines
6. Verplichtingen per betrokken partij
7. Genoemde risicoâ€™s en onzekerheden
8. Onderdelen die financiÃ«le verwerking kunnen beÃ¯nvloeden
9. Vijf vragen voor nadere beoordeling
10. Relevante pagina- of paragraafverwijzingen

Gebruik uitsluitend dit bestand. Maak onderscheid tussen letterlijke documentinhoud en jouw interpretatie. Vermeld expliciet wanneer informatie niet in het document staat.`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: voeg het bestand toe met de paperclip.',
    tip: ''
  },
  {
    id: 'inspiratie-17',
    category: 'Documenten en rapportages',
    impact: 3,
    license: true,
    title: 'Vergelijk concept en definitieve versie',
    didYouKnow: 'Wist je dat Copilot twee versies van een document kan vergelijken op inhoudelijke wijzigingen, bedragen en voorwaarden?',
    description: 'Vergelijk twee documentversies op bedragen, voorwaarden en inhoudelijke wijzigingen.',
    usefulFor: 'Versiebeoordeling',
    prompt: `Vergelijk /[CONCEPTBESTAND] met /[DEFINITIEF BESTAND].

Identificeer alle inhoudelijk relevante wijzigingen in:
- bedragen;
- percentages;
- data;
- contractvoorwaarden;
- verantwoordelijkheden;
- conclusies;
- risico’s;
- toelichtingen;
- opgenomen of verwijderde paragrafen.

Presenteer de uitkomst in een tabel met:
1. Onderwerp
2. Tekst of informatie in de conceptversie
3. Tekst of informatie in de definitieve versie
4. Type wijziging
5. Mogelijke betekenis van de wijziging
6. Pagina of paragraaf in beide bestanden

Negeer wijzigingen die alleen opmaak, spelling of witruimte betreffen. Geef aan wanneer de mogelijke betekenis nader door een medewerker moet worden beoordeeld.`,
    promptNote: 'Typ / in Copilot Chat (tabblad Werk) en kies beide bestanden.',
    promptBasic: `Vergelijk de twee bijgevoegde bestanden: [CONCEPTBESTAND] (concept) en [DEFINITIEF BESTAND] (definitief).

Identificeer alle inhoudelijk relevante wijzigingen in:
- bedragen;
- percentages;
- data;
- contractvoorwaarden;
- verantwoordelijkheden;
- conclusies;
- risicoâ€™s;
- toelichtingen;
- opgenomen of verwijderde paragrafen.

Presenteer de uitkomst in een tabel met:
1. Onderwerp
2. Tekst of informatie in de conceptversie
3. Tekst of informatie in de definitieve versie
4. Type wijziging
5. Mogelijke betekenis van de wijziging
6. Pagina of paragraaf in beide bestanden

Negeer wijzigingen die alleen opmaak, spelling of witruimte betreffen. Geef aan wanneer de mogelijke betekenis nader door een medewerker moet worden beoordeeld.`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: voeg beide bestanden toe met de paperclip.',
    tip: ''
  },
  {
    id: 'inspiratie-18',
    category: 'Documenten en rapportages',
    impact: 3,
    license: true,
    title: 'Contract samenvatten voor dossiergebruik',
    didYouKnow: 'Wist je dat Copilot belangrijke afspraken, bedragen, verplichtingen en bijzondere voorwaarden uit een contract kan halen?',
    description: 'Breng verplichtingen, vergoedingen en bijzondere contractvoorwaarden snel in beeld.',
    usefulFor: 'Contractbeoordeling',
    prompt: `Analyseer het contract /[BESTANDSNAAM] voor [KLANTNAAM].

Maak een zakelijke samenvatting met:
1. Contractpartijen
2. Ingangsdatum
3. Looptijd
4. Verlengingsvoorwaarden
5. Opzegvoorwaarden
6. Producten of diensten
7. Vergoedingen en betalingsmomenten
8. Prestatieverplichtingen
9. Kortingen, bonussen of variabele vergoedingen
10. Garanties
11. Boetes en aansprakelijkheid
12. Bijzondere of afwijkende voorwaarden
13. Financieel relevante bepalingen
14. Vragen voor nadere beoordeling

Verwijs per onderdeel naar het relevante artikel of paginanummer. Gebruik uitsluitend het contract. Geef geen juridische of verslaggevingstechnische conclusie zonder een afzonderlijke bronbeoordeling.`,
    promptNote: 'Typ / in Copilot Chat (tabblad Werk) en kies het contract. Gebruik de uitkomst als werkdocument, niet als juridisch oordeel.',
    promptBasic: `Analyseer het bijgevoegde contract [BESTANDSNAAM] voor [KLANTNAAM].

Maak een zakelijke samenvatting met:
1. Contractpartijen
2. Ingangsdatum
3. Looptijd
4. Verlengingsvoorwaarden
5. Opzegvoorwaarden
6. Producten of diensten
7. Vergoedingen en betalingsmomenten
8. Prestatieverplichtingen
9. Kortingen, bonussen of variabele vergoedingen
10. Garanties
11. Boetes en aansprakelijkheid
12. Bijzondere of afwijkende voorwaarden
13. Financieel relevante bepalingen
14. Vragen voor nadere beoordeling

Verwijs per onderdeel naar het relevante artikel of paginanummer. Gebruik uitsluitend het contract. Geef geen juridische of verslaggevingstechnische conclusie zonder een afzonderlijke bronbeoordeling.`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: voeg het contract toe met de paperclip. Gebruik de uitkomst als werkdocument, niet als juridisch oordeel.',
    tip: ''
  },
  {
    id: 'inspiratie-19',
    category: 'Documenten en rapportages',
    impact: 3,
    license: true,
    title: 'Maak een conceptprocesbeschrijving',
    didYouKnow: 'Wist je dat Copilot losse interviewnotities kan omzetten in een logisch opgebouwde procesbeschrijving?',
    description: 'Zet interviewnotities om in een eerste, logisch opgebouwde procesbeschrijving.',
    usefulFor: 'Procesinterviews',
    prompt: `Zet de notities in /[BESTANDSNAAM] om in een conceptprocesbeschrijving van het proces [PROCESNAAM] bij [KLANTNAAM].

Gebruik de structuur:
1. Doel en afbakening
2. Startpunt van het proces
3. Betrokken functies
4. Gebruikte systemen
5. Chronologische processtappen
6. Invoer en bewijsstukken
7. Registraties en boekingen
8. Controles en reviews
9. Afhandeling van uitzonderingen
10. Rapportages
11. Einde van het proces
12. Ontbrekende of onduidelijke informatie

Beschrijf per beheersingsmaatregel:
- wie de controle uitvoert;
- wat wordt gecontroleerd;
- wanneer en hoe vaak;
- welke documentatie ontstaat;
- wie afwijkingen opvolgt.

Voeg geen processtappen of beheersingsmaatregelen toe die niet uit de bron blijken. Markeer ontbrekende informatie met [NADER UITVRAGEN].`,
    promptNote: 'Typ / in Copilot Chat (tabblad Werk) en kies het bestand met je notities. Laat de beschrijving daarna bevestigen door de klant.',
    promptBasic: `Zet de notities in het bijgevoegde bestand [BESTANDSNAAM] om in een conceptprocesbeschrijving van het proces [PROCESNAAM] bij [KLANTNAAM].

Gebruik de structuur:
1. Doel en afbakening
2. Startpunt van het proces
3. Betrokken functies
4. Gebruikte systemen
5. Chronologische processtappen
6. Invoer en bewijsstukken
7. Registraties en boekingen
8. Controles en reviews
9. Afhandeling van uitzonderingen
10. Rapportages
11. Einde van het proces
12. Ontbrekende of onduidelijke informatie

Beschrijf per beheersingsmaatregel:
- wie de controle uitvoert;
- wat wordt gecontroleerd;
- wanneer en hoe vaak;
- welke documentatie ontstaat;
- wie afwijkingen opvolgt.

Voeg geen processtappen of beheersingsmaatregelen toe die niet uit de bron blijken. Markeer ontbrekende informatie met [NADER UITVRAGEN].`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: voeg het bestand met je notities toe met de paperclip.',
    tip: ''
  },
  {
    id: 'inspiratie-20',
    category: 'Documenten en rapportages',
    impact: 2,
    license: true,
    title: 'Review een conceptverslag',
    didYouKnow: 'Wist je dat Copilot onduidelijkheden, tegenstrijdigheden en ontbrekende onderbouwing in jouw conceptverslag kan signaleren?',
    description: 'Laat zwakke redeneringen, onduidelijkheden en ontbrekende onderbouwing vooraf signaleren.',
    usefulFor: 'Zelfreview',
    prompt: `Review /[BESTANDSNAAM] als kritische vakinhoudelijke tweede lezer.

Beoordeel het document op:
- logische opbouw;
- duidelijkheid;
- volledigheid;
- tegenstrijdigheden;
- ononderbouwde aannames;
- conclusies die niet aansluiten op de beschreven feiten;
- ontbrekende bronverwijzingen;
- te stellige formuleringen;
- onduidelijke acties of verantwoordelijkheden;
- taal en professionaliteit.

Maak een tabel met:
1. Pagina of paragraaf
2. Oorspronkelijke passage
3. Type verbeterpunt
4. Waarom dit aandacht vraagt
5. Voorstel voor verbetering

Maak daarna uitsluitend een herschreven versie van passages waarvoor aanpassing nodig is. Wijzig geen feiten of vaktechnische conclusies.`,
    promptNote: 'Typ / in Copilot Chat (tabblad Werk) en kies je conceptverslag. Jij beslist welke verbeteringen je overneemt.',
    promptBasic: `Review het bijgevoegde bestand [BESTANDSNAAM] als kritische vakinhoudelijke tweede lezer.

Beoordeel het document op:
- logische opbouw;
- duidelijkheid;
- volledigheid;
- tegenstrijdigheden;
- ononderbouwde aannames;
- conclusies die niet aansluiten op de beschreven feiten;
- ontbrekende bronverwijzingen;
- te stellige formuleringen;
- onduidelijke acties of verantwoordelijkheden;
- taal en professionaliteit.

Maak een tabel met:
1. Pagina of paragraaf
2. Oorspronkelijke passage
3. Type verbeterpunt
4. Waarom dit aandacht vraagt
5. Voorstel voor verbetering

Maak daarna uitsluitend een herschreven versie van passages waarvoor aanpassing nodig is. Wijzig geen feiten of vaktechnische conclusies.`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: voeg je conceptverslag toe met de paperclip.',
    tip: ''
  },
  {
    // Aanvullend voorstel
    id: 'inspiratie-26',
    category: 'Documenten en rapportages',
    impact: 1,
    license: true,
    title: 'Vind dat ene document of besluit terug',
    didYouKnow: 'Wist je dat Copilot in je mail, Teams-chats en bestanden dat ene document of besluit kan terugvinden, ook als je de bestandsnaam niet meer weet?',
    description: 'Laat Copilot dat ene document, besluit of bericht terugvinden in je mail, Teams en bestanden.',
    usefulFor: 'Terugzoeken',
    prompt: `Zoek in mijn e-mails, Teams-chats en bestanden van de afgelopen [AANTAL] maanden naar [ONDERWERP, bijv. de afspraken over de nieuwe werkwijze voor urenregistratie].

Geef de vijf meest relevante resultaten, met per resultaat:
1. Onderwerp of bestandsnaam
2. Datum
3. Afzender of maker
4. In één zin waarom het relevant is
5. Link naar het bericht of bestand

Neem alleen resultaten op die aantoonbaar over [ONDERWERP] gaan. Vind je niets, zeg dat dan in plaats van iets te benaderen.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Hoe specifieker het onderwerp, hoe beter het resultaat.',
    tip: 'Weet je nog ongeveer wie het stuurde? Voeg dan toe: "van [NAAM COLLEGA]". Dat scheelt veel zoekwerk.'
  },

  /* ---- Excel en financiële informatie ---------------------------------- */
  {
    id: 'inspiratie-21',
    category: 'Excel en financiële informatie',
    impact: 1,
    license: false,
    title: 'Formule maken voor een concrete Excel-tabel',
    didYouKnow: 'Wist je dat Copilot een Excel-formule kan maken én stap voor stap kan uitleggen hoe deze werkt?',
    description: 'Laat Copilot de formule maken, uitleggen en voorzien van een controle.',
    usefulFor: 'Excel-vragen',
    prompt: `Ik werk in Excel met een tabel genaamd [TABELNAAM].

De relevante kolommen zijn:
- [KOLOM 1]
- [KOLOM 2]
- [KOLOM 3]

Ik wil per regel het volgende berekenen:
[GEWENSTE BEREKENING]

Schrijf:
1. De exacte Excel-formule met gestructureerde tabelverwijzingen
2. Een versie met normale celverwijzingen
3. Een korte uitleg van ieder onderdeel
4. Een fictief rekenvoorbeeld
5. Een controle waarmee ik kan vaststellen dat de formule correct werkt
6. Een oplossing voor lege cellen en foutmeldingen

Gebruik functienamen en scheidingstekens die passen bij mijn [NEDERLANDSE/ENGELSE] Excel-versie (bij Nederlandse instellingen een puntkomma tussen de argumenten).`,
    promptNote: 'Werkt in elke Copilot Chat, ook de gratis versie, of in Copilot in Excel met de tabel geopend.',
    tip: ''
  },
  {
    id: 'inspiratie-22',
    category: 'Excel en financiële informatie',
    impact: 3,
    license: true,
    title: 'Vergelijk twee financiële perioden',
    didYouKnow: 'Wist je dat Copilot de grootste en opvallendste verschillen tussen twee financiële perioden kan signaleren?',
    description: 'Vergelijk twee perioden en laat de grootste en opvallendste verschillen signaleren.',
    usefulFor: 'Cijferanalyse',
    prompt: `Analyseer de tabel in /[EXCELBESTAND].

Vergelijk [PERIODE A] met [PERIODE B] op basis van de kolommen:
- [REKENING OF CATEGORIE]
- [BEDRAG PERIODE A]
- [BEDRAG PERIODE B]

Bereken per regel:
1. Absoluut verschil
2. Procentueel verschil
3. Aandeel in het totaal van beide perioden

Identificeer vervolgens:
- de tien grootste absolute mutaties;
- mutaties groter dan [BEDRAG];
- mutaties groter dan [PERCENTAGE]%;
- nieuwe posten;
- verdwenen posten;
- tekenwisselingen;
- ontbrekende of ongeldige waarden.

Maak een tabel met de resultaten en formuleer per opvallende mutatie één neutrale onderzoeksvraag. Presenteer geen verklaringen als feit; noem een mogelijke verklaring alleen als hypothese die nog moet worden geverifieerd.`,
    promptNote: 'Typ / in Copilot Chat (tabblad Werk) en kies het Excelbestand. Controleer enkele berekeningen zelf.',
    promptBasic: `Analyseer de tabel in het bijgevoegde bestand [EXCELBESTAND].

Vergelijk [PERIODE A] met [PERIODE B] op basis van de kolommen:
- [REKENING OF CATEGORIE]
- [BEDRAG PERIODE A]
- [BEDRAG PERIODE B]

Bereken per regel:
1. Absoluut verschil
2. Procentueel verschil
3. Aandeel in het totaal van beide perioden

Identificeer vervolgens:
- de tien grootste absolute mutaties;
- mutaties groter dan [BEDRAG];
- mutaties groter dan [PERCENTAGE]%;
- nieuwe posten;
- verdwenen posten;
- tekenwisselingen;
- ontbrekende of ongeldige waarden.

Maak een tabel met de resultaten en formuleer per opvallende mutatie Ã©Ã©n neutrale onderzoeksvraag. Presenteer geen verklaringen als feit; noem een mogelijke verklaring alleen als hypothese die nog moet worden geverifieerd.`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: voeg het Excelbestand toe met de paperclip. Controleer enkele berekeningen zelf.',
    tip: ''
  },
  {
    id: 'inspiratie-23',
    category: 'Excel en financiële informatie',
    impact: 3,
    license: true,
    title: 'Openstaande posten prioriteren',
    didYouKnow: 'Wist je dat Copilot openstaande posten kan prioriteren op basis van bedrag, ouderdom en afwijkende kenmerken?',
    description: 'Prioriteer openstaande posten op bedrag, ouderdom en afwijkende kenmerken.',
    usefulFor: 'Debiteurenbeheer',
    prompt: `Analyseer de openstaande-postenlijst in /[EXCELBESTAND] per [PEILDATUM].

Gebruik minimaal de kolommen:
- Relatie
- Factuurnummer
- Factuurdatum
- Vervaldatum
- Openstaand bedrag

Bereken per post:
1. Aantal dagen openstaand
2. Aantal dagen na vervaldatum
3. Ouderdomscategorie: niet vervallen, 1 tot 30, 31 tot 60, 61 tot 90 of meer dan 90 dagen
4. Totaal openstaand per relatie

Signaleer:
- posten ouder dan [AANTAL] dagen;
- posten groter dan [BEDRAG];
- creditbedragen;
- dubbele factuurnummers;
- relaties met meerdere oude posten;
- ontbrekende factuur- of vervaldata.

Maak drie categorieën:
1. Direct opvolgen
2. Nader beoordelen
3. Reguliere opvolging

Leg de indelingscriteria uit. Trek geen conclusie over inbaarheid zonder aanvullende informatie.`,
    promptNote: 'Typ / in Copilot Chat (tabblad Werk) en kies de openstaande-postenlijst. Controleer enkele uitkomsten zelf.',
    promptBasic: `Analyseer de openstaande-postenlijst in het bijgevoegde bestand [EXCELBESTAND] per [PEILDATUM].

Gebruik minimaal de kolommen:
- Relatie
- Factuurnummer
- Factuurdatum
- Vervaldatum
- Openstaand bedrag

Bereken per post:
1. Aantal dagen openstaand
2. Aantal dagen na vervaldatum
3. Ouderdomscategorie: niet vervallen, 1 tot 30, 31 tot 60, 61 tot 90 of meer dan 90 dagen
4. Totaal openstaand per relatie

Signaleer:
- posten ouder dan [AANTAL] dagen;
- posten groter dan [BEDRAG];
- creditbedragen;
- dubbele factuurnummers;
- relaties met meerdere oude posten;
- ontbrekende factuur- of vervaldata.

Maak drie categorieÃ«n:
1. Direct opvolgen
2. Nader beoordelen
3. Reguliere opvolging

Leg de indelingscriteria uit. Trek geen conclusie over inbaarheid zonder aanvullende informatie.`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: voeg de openstaande-postenlijst toe met de paperclip. Controleer enkele uitkomsten zelf.',
    tip: ''
  },
  {
    id: 'inspiratie-24',
    category: 'Excel en financiële informatie',
    impact: 3,
    license: true,
    title: 'Databestand controleren op afwijkingen',
    didYouKnow: 'Wist je dat Copilot dubbele, ontbrekende en opvallende transacties in een gegevensbestand kan signaleren?',
    description: 'Signaleer dubbele, ontbrekende en opvallende transacties in een gegevensbestand.',
    usefulFor: 'Data-analyse',
    prompt: `Controleer de tabel in /[EXCELBESTAND] op mogelijke datakwaliteitsproblemen en afwijkende transacties.

Gebruik de volgende kolommen:
[NOEM DE RELEVANTE KOLOMMEN]

Controleer specifiek op:
- exacte dubbelen;
- dubbele document- of factuurnummers;
- ontbrekende waarden;
- ongeldige datums;
- boekingen buiten de periode [STARTDATUM] tot en met [EINDDATUM];
- negatieve bedragen;
- ronde bedragen vanaf [BEDRAG];
- bedragen groter dan [GRENSBEDRAG];
- ongebruikelijke boekingstijdstippen;
- afwijkende of lege omschrijvingen;
- inconsistente namen of coderingen;
- onverwachte combinaties van rekening en omschrijving.

Maak een overzicht per type signaal met:
1. Aantal signalen
2. Betrokken regels
3. Waarom het signaal opvalt
4. Aanbevolen vervolgstap

Noem dit uitsluitend signalen voor nader onderzoek. Trek geen conclusie over fouten of fraude.`,
    promptNote: 'Typ / in Copilot Chat (tabblad Werk) en kies het Excelbestand. Signalen zijn een startpunt voor onderzoek, geen bevinding.',
    promptBasic: `Controleer de tabel in het bijgevoegde bestand [EXCELBESTAND] op mogelijke datakwaliteitsproblemen en afwijkende transacties.

Gebruik de volgende kolommen:
[NOEM DE RELEVANTE KOLOMMEN]

Controleer specifiek op:
- exacte dubbelen;
- dubbele document- of factuurnummers;
- ontbrekende waarden;
- ongeldige datums;
- boekingen buiten de periode [STARTDATUM] tot en met [EINDDATUM];
- negatieve bedragen;
- ronde bedragen vanaf [BEDRAG];
- bedragen groter dan [GRENSBEDRAG];
- ongebruikelijke boekingstijdstippen;
- afwijkende of lege omschrijvingen;
- inconsistente namen of coderingen;
- onverwachte combinaties van rekening en omschrijving.

Maak een overzicht per type signaal met:
1. Aantal signalen
2. Betrokken regels
3. Waarom het signaal opvalt
4. Aanbevolen vervolgstap

Noem dit uitsluitend signalen voor nader onderzoek. Trek geen conclusie over fouten of fraude.`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: voeg het Excelbestand toe met de paperclip. Signalen zijn een startpunt voor onderzoek, geen bevinding.',
    tip: ''
  },
  {
    // Aanvullend voorstel
    id: 'inspiratie-28',
    category: 'Excel en financiële informatie',
    impact: 2,
    license: false,
    title: 'Schrijf een toelichting bij de cijfers',
    didYouKnow: 'Wist je dat Copilot bij een tabel met cijfers een heldere toelichting kan schrijven voor je rapportage of klantmail?',
    description: 'Laat Copilot een korte, heldere toelichting schrijven bij een tabel met cijfers.',
    usefulFor: 'Rapportages',
    prompt: `Analyseer de tabel in het bijgevoegde bestand [EXCELBESTAND].

Schrijf een toelichting van maximaal 150 woorden voor de klant, met:
1. De drie belangrijkste ontwikkelingen
2. De oorzaak, voor zover die uit de cijfers blijkt
3. Waar de klant op moet letten

Gebruik alleen bedragen en percentages die in de tabel staan. Laat bij iedere berekening zien hoe je eraan komt. Presenteer een mogelijke oorzaak die niet uit de cijfers blijkt als vraag, niet als feit.`,
    promptNote: 'Werkt ook met de gratis Copilot Chat: voeg het bestand toe met de paperclip. Controleer de bedragen altijd zelf.',
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
    description: 'Breng afspraken, acties en deadlines samen in een haalbaar weekvoorstel.',
    usefulFor: 'Weekplanning',
    prompt: `Maak een conceptplanning voor mijn komende werkweek van [STARTDATUM] tot en met [EINDDATUM].

Gebruik:
- mijn agenda voor deze periode;
- acties uit mijn ontvangen e-mails van de afgelopen [AANTAL] dagen;
- acties die in mijn Teams-chats aan mij zijn toegewezen;
- expliciet genoemde deadlines;
- openstaande toezeggingen die ik zelf heb gedaan.

Maak eerst een tabel met:
1. Taak
2. Herkomst: e-mail, Teams of vergadering
3. Betrokken klant of project
4. Deadline
5. Verwachte duur, alleen wanneer deze expliciet beschikbaar is
6. Urgentie
7. Bronverwijzing

Maak daarna een voorstel per werkdag.

Plan:
- taken met een harde deadline eerst;
- voorbereiding vóór de relevante vergadering;
- voldoende ruimte tussen afspraken;
- geen werkzaamheden op reeds bezette momenten.

Als de benodigde duur niet bekend is, vermeld dan "Zelf inschatten". Presenteer de planning als voorstel en verander geen afspraken in mijn agenda.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Zet de blokken daarna zelf in je agenda.',
    tip: ''
  },
  {
    // Aanvullend voorstel
    id: 'inspiratie-29',
    category: 'Planning en kwaliteitsverbetering',
    impact: 2,
    license: true,
    title: 'Plan terug vanaf een deadline',
    didYouKnow: 'Wist je dat Copilot vanaf een harde deadline een terugrekenplanning kan maken, met tussenstappen, buffer en rekening houdend met je agenda?',
    description: 'Maak vanaf een harde deadline een haalbare terugrekenplanning met buffer.',
    usefulFor: 'Deadlines',
    prompt: `Ik moet [OPDRACHT, bijv. een conceptjaarrekening] uiterlijk [DATUM] opleveren.

Maak een terugrekenplanning vanaf die deadline:
- verdeel het werk in logische stappen;
- geef per stap een tijdsinschatting en de datum waarop die stap uiterlijk klaar moet zijn;
- plan minimaal twee werkdagen buffer in;
- houd rekening met de afspraken die al in mijn agenda staan.

Zet het in een tabel met:
1. Stap
2. Tijd
3. Uiterlijk klaar
4. Wat ik nodig heb van anderen

Presenteer de planning als voorstel en verander geen afspraken in mijn agenda.`,
    promptNote: 'Gebruik in Microsoft 365 Copilot Chat (tabblad Werk). Controleer de planning en zet de blokken daarna zelf in je agenda.',
    promptBasic: `Ik moet [OPDRACHT, bijv. een conceptjaarrekening] uiterlijk [DATUM] opleveren.

Maak een terugrekenplanning vanaf die deadline:
- verdeel het werk in logische stappen;
- geef per stap een tijdsinschatting en de datum waarop die stap uiterlijk klaar moet zijn;
- plan minimaal twee werkdagen buffer in;
- houd rekening met mijn vaste afspraken hieronder.

Zet het in een tabel met:
1. Stap
2. Tijd
3. Uiterlijk klaar
4. Wat ik nodig heb van anderen

Presenteer de planning als voorstel.

Mijn vaste afspraken in deze periode:
[NOEM PER AFSPRAAK DE DATUM, TIJD EN OMSCHRIJVING]`,
    promptNoteBasic: 'Werkt met de gratis Copilot Chat: noem zelf je vaste afspraken. Copilot kijkt dan niet in je agenda en plant niets in.',
    tip: 'Werk je samen? Vraag daarna: "Maak hier een korte mail van met wat ik van wie nodig heb, en wanneer."'
  },
  {
    // Aanvullend voorstel
    id: 'inspiratie-30',
    category: 'Planning en kwaliteitsverbetering',
    impact: 2,
    license: false,
    title: 'Maak een checklist van een terugkerende taak',
    didYouKnow: 'Wist je dat Copilot van jouw aantekeningen of werkinstructie een heldere checklist kan maken, zodat je niets meer over het hoofd ziet?',
    description: 'Zet je eigen werkwijze om in een afvinkbare checklist, zodat je niets vergeet.',
    usefulFor: 'Terugkerend werk',
    prompt: `Ik voer deze taak regelmatig uit: [BESCHRIJF DE TAAK, bijv. het afronden van een btw-aangifte].

Maak van mijn aantekeningen hieronder een afvinkbare checklist in een logische volgorde. Zet bij iedere stap:
- wat ik controleer;
- wat ik vastleg.

Markeer de stappen waar vaak iets misgaat en stel voor hoe ik dat voorkom. Is iets onduidelijk, stel me dan eerst een vraag.

Aantekeningen:
[PLAK HIER JE AANTEKENINGEN OF WERKINSTRUCTIE]`,
    promptNote: 'Werkt ook met de gratis Copilot Chat. Leg de checklist daarna naast de kantoorrichtlijnen.',
    tip: 'Bewaar de checklist in OneNote of Loop. Dan vink je hem iedere keer af en verbeter je hem samen met je team.'
  }
];
