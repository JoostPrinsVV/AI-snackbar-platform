/* ==========================================================================
   AI SNACKBAR — INTERFACETEKSTEN
   --------------------------------------------------------------------------
   Alle vaste teksten van de interface (knoppen, meldingen, uitleg).
   Pas gerust de tekst tussen de aanhalingstekens aan.

   Woorden tussen {accolades} worden automatisch ingevuld vanuit
   js/config.js of de snack, bijvoorbeeld {eventName} of {title}.
   Laat die accolades intact.

   Wil je een andere taal toevoegen? Kopieer het blok 'nl' als 'en',
   vertaal de teksten en zet in js/config.js: language: 'en'.
   ========================================================================== */

window.AISnackbar = window.AISnackbar || {};

window.AISnackbar.texts = {
  nl: {
    /* ---- Algemeen ------------------------------------------------------ */
    documentTitle: '{title} {discipline} · {organization}',
    skipLink: 'Direct naar de inhoud',
    eventLabel: '{eventName} · {eventDates}',
    aboutButton: 'Over de AI Snackbar',   // i-knopje in de kopbalk (voor schermlezers)
    adminButton: 'Instellingen',          // tandwiel in de kopbalk (vraagt de toegangscode)
    homeButton: 'Terug naar de snackkaart',
    close: 'Sluiten',

    /* ---- Snackkaart (hoofdscherm) ------------------------------------- */
    heroEyebrow: '{audience} · {eventName}',
    surpriseButton: 'Verras mij',
    surpriseHint: 'Wij kiezen een snack voor je',
    promptsButton: 'Alle prompts',        // naar de promptpagina (alleen op een eigen apparaat)
    menuTitle: 'Vandaag op de kaart',   // alleen voor schermlezers
    menuHint: 'Raak een snack aan om te beginnen',
    cardNumber: 'Nr. {number}',
    cardNumberLabel: 'Nr.',
    cardFeatured: 'Specialiteit',
    cardViewed: 'Bekeken',
    cardSoon: 'Binnenkort',
    cardSoonLong: 'Nog in de keuken',
    cardSoonSr: '(nog niet beschikbaar)',
    cardLicense: 'Licentie',              // badge: Microsoft 365 Copilot-licentie nodig
    cardLicenseSr: 'nodig',               // alleen voor schermlezers, na 'Licentie'
    licenseLabel: 'Copilot',              // alleen voor schermlezers, vóór de licentietekst
    licenseRequired: 'Licentie nodig',
    licenseBasic: 'Kan zonder licentie',
    soonToast: '{title} staat nog in de keuken. Kies gerust een andere snack.',
    unknownSnackToast: 'Deze snack staat niet (meer) op de kaart.',
    emptyTitle: 'De snackkaart wordt nog gevuld',
    emptyText: 'Er staan nog geen snacks op de kaart. Kom straks nog eens kijken!',
    loadErrorTitle: 'De snackkaart kon niet worden geladen',
    loadErrorText: 'Er staat waarschijnlijk een typefout in data/snacks.js.',

    /* ---- Detailpagina -------------------------------------------------- */
    backButton: 'Snackkaart',
    backButtonLabel: 'Terug naar de snackkaart',
    detailPlay: 'Bekijk demo',
    detailResume: 'Verder kijken',
    detailPause: 'Pauzeer demo',
    detailRestart: 'Opnieuw afspelen',
    detailOther: 'Kies een andere snack',
    detailSurprise: 'Verras mij',
    levelLabel: 'Niveau',
    durationLabel: 'Duur',
    audienceLabel: 'Handig voor',

    /* ---- Take-away ----------------------------------------------------- */
    takeawayEyebrow: 'Om mee te nemen',
    takeawayTitle: 'Jouw AI-tip',
    promptLabel: 'Voorbeeldprompt',
    promptMissing: 'De prompt voor deze snack volgt.',
    copyPrompt: 'Kopieer prompt',
    copied: 'Prompt gekopieerd',
    copyFailed: 'Kopiëren lukt hier niet. De tekst is geselecteerd: houd hem ingedrukt en kies Kopiëren (of Ctrl+C).',
    downloadFallback: 'Download de bijlage',
    guideDefaultLabel: 'Bekijk de handleiding',
    guideVariantLabel: 'Versie van de handleiding',
    guideVariantBasic: 'Zonder licentie',
    guideVariantLicensed: 'Met licentie',   // knop bij een snack met bijlage (tekst uit downloadLabel heeft voorrang)
    promptMailButton: 'Mail mij deze prompt',
    promptMailLabel: 'Je e-mailadres',
    promptMailPlaceholder: 'naam@organisatie.nl',
    promptMailSubmit: 'Versturen',
    promptMailPrivacy: 'We mailen je deze prompt na de {eventName}. Je e-mailadres gebruiken we alleen daarvoor en daarna wissen we het.',
    promptMailInvalid: 'Vul een geldig e-mailadres in, bijvoorbeeld naam@organisatie.nl.',
    promptMailFailed: 'Versturen lukt nu niet. Probeer het zo nog eens, of kopieer de prompt.',
    promptMailFailedKiosk: 'Versturen lukt nu niet. Probeer het zo nog eens, of scan de QR-code.',
    promptMailDone: 'Gelukt! We mailen deze prompt na de {eventName} naar {email}.',
    promptMailDoneKiosk: 'Gelukt! We mailen je deze prompt na de {eventName}.',

    /* ---- Licentie aanvragen (js/license-request.js, alleen eigen apparaat) */
    licenseRequestButton: 'Licentie aanvragen',
    licenseRequestLink: 'Nog geen licentie? Vraag hem aan',
    licenseRequestTitle: 'Copilot-licentie aanvragen',
    licenseRequestLead: 'Iedereen heeft de gratis Copilot Chat. Een Microsoft 365 Copilot-licentie kost geld, dus we vragen je kort uit te leggen wat hij jou oplevert.',
    licenseCompareBasicTitle: 'Iedereen (Copilot Chat)',
    licenseCompareBasic1: 'Teksten schrijven, herschrijven, samenvatten en vertalen',
    licenseCompareBasic2: 'Werkt met wat je zelf plakt of als bestand toevoegt',
    licenseCompareBasic3: 'Zoekt op internet, veilig met je werkaccount',
    licenseCompareLicensedTitle: 'Extra met een licentie',
    licenseCompareLicensed1: 'Zoekt zelf in je mail, agenda, chats en bestanden',
    licenseCompareLicensed2: 'Teams: vergaderingen samenvatten met actiepunten',
    licenseCompareLicensed3: 'Outlook: lange mailwisselingen samenvatten en beantwoorden',
    licenseCompareLicensed4: 'Word, Excel en PowerPoint: van notitie naar presentatie of analyse',
    licenseNameLabel: 'Naam',
    licenseNamePlaceholder: 'Voor- en achternaam',
    licenseEmailLabel: 'Zakelijk e-mailadres',
    licenseMotivationLabel: 'Waarom wil je een licentie?',
    licenseMotivationHint: 'Beschrijf je businesscase: welke taken doe je ermee, hoeveel tijd bespaart het je (bijv. per week) en hoe verdien je de licentie zo terug?',
    licenseMotivationPlaceholder: 'Bijvoorbeeld: ik notuleer wekelijks drie klantoverleggen. Met Copilot in Teams…',
    licenseWordsLeft: 'Nog {count} woorden nodig (minimaal {min})',
    licenseWordsOk: '{count} woorden, voldoende',
    licensePrivacy: 'Je naam, e-mailadres en toelichting gaan alleen naar de beheerders van de AI Snackbar, voor de beoordeling van je aanvraag. Daarna wissen we ze.',
    licenseSubmit: 'Aanvraag versturen',
    licenseNameInvalid: 'Vul je naam in.',
    licenseEmailInvalid: 'Vul een geldig e-mailadres in, bijvoorbeeld naam@organisatie.nl.',
    licenseEmailDomain: 'Gebruik je zakelijke e-mailadres (eindigend op {domains}).',
    licenseMotivationShort: 'Je toelichting is nog te kort: nog {count} woorden nodig.',
    licenseFailed: 'Versturen lukt nu niet. Probeer het zo nog eens.',
    licenseUnavailable: 'Aanvragen kan op dit moment nog niet. Probeer het later nog eens.',
    licenseDoneTitle: 'Aanvraag verstuurd',
    licenseDone: 'Dank je, {name}! We beoordelen je aanvraag en laten het je weten via {email}.',
    qrLabelDefault: 'Scan met je telefoon en neem de prompt mee.',
    qrPlaceholder: 'QR-code volgt',
    qrAlt: 'QR-code bij {title}',
    tipLabel: 'Tip',

    /* ---- Feedback ------------------------------------------------------ */
    feedbackTitle: 'Hoe beviel deze snack?',
    ratingHappy: 'Lekker!',
    ratingNeutral: 'Gaat wel',
    ratingSad: 'Niet mijn smaak',
    ratingThanks: 'Dank je! Je beoordeling is opgeslagen.',
    endcardQuestion: 'Klaar! Hoe beviel deze snack?',
    endcardThanks: 'Dank je voor je beoordeling!',
    commentLabel: 'Opmerking of vraag?',
    commentOptional: '(optioneel)',
    commentPlaceholder: 'Bijvoorbeeld: werkt dit ook in Outlook?',
    commentPrivacy: 'Anoniem. Noem geen namen, klant- of dossiergegevens.',
    commentCounter: '{count}/{max}',
    commentSubmit: 'Versturen',
    commentThanks: 'Dank je! We nemen je opmerking of vraag mee.',
    commentEmpty: 'Typ eerst je opmerking of vraag.',

    /* ---- Promptpagina (prompts/, voor de QR-codes op de kaartjes) ------ */
    promptsDocumentTitle: 'Prompts · {title} {discipline}',
    promptsTitle: 'Alle prompts',
    promptsLead: 'Kopieer een prompt en probeer het zelf. Er zijn twee soorten:',
    promptsSnacksTerm: 'Snacks',
    promptsSnacksText: 'uitgebreidere prompts met een demo, zoals in de AI Snackbar.',
    promptsSidesTerm: 'Bijgerechtjes',
    promptsSidesText: 'korte inspiratieprompts voor dagelijks gebruik.',
    promptsKindLabel: 'Soort prompts',
    promptsKindSnacks: 'Snacks',
    promptsKindInspiration: 'Bijgerechtjes',
    promptsThemeLabel: 'Kies een thema',
    promptsLicenseLabel: 'Copilot-licentie',
    promptsLicenseAll: 'Alle',
    promptsLicenseYes: 'Licentie nodig',
    promptsLicenseNo: 'Zonder licentie',
    promptsVariantLabel: 'Versie van de prompt',
    promptsVariantLicensed: 'Met licentie',
    promptsVariantBasic: 'Zonder licentie',
    promptsVariantHintLicensed: 'Copilot haalt zelf je mails, chats of bestanden op.',
    promptsVariantHintBasic: 'Je plakt de tekst zelf of voegt het bestand toe. Werkt ook met de gratis Copilot Chat.',
    promptsNoMatch: 'Geen prompts voor deze keuze. Kies een ander thema of "Alle".',
    promptsThemeAll: 'Alle thema’s',
    promptsInspirationEyebrow: 'Bijgerecht',
    promptsUsefulFor: 'Handig bij',
    promptsImpactLabel: 'Impact',
    promptsImpactValue: '{level} van 3',   // alleen voor schermlezers, naast de stippen
    promptsPromptMissing: 'De prompt volgt.',
    promptsBack: 'Alle prompts',
    promptsToApp: 'Naar de snackbar',     // rechtsboven op de promptpagina
    promptsDemo: 'Bekijk de demo',
    promptsShare: 'Delen',
    promptsEmpty: 'Er staan nog geen prompts klaar. Kom straks nog eens kijken!',
    promptsNotFound: 'Deze prompt staat er niet (meer). Hier zijn alle prompts.',

    /* ---- Videospeler --------------------------------------------------- */
    playerRegion: 'Demovideo',
    playerPlay: 'Afspelen',
    playerPause: 'Pauzeren',
    playerRestart: 'Opnieuw afspelen',
    playerMute: 'Geluid uit',
    playerUnmute: 'Geluid aan',
    playerFullscreen: 'Volledig scherm',
    playerExitFullscreen: 'Volledig scherm sluiten',
    playerShrink: 'Verkleinen',
    playerRotateHint: 'Draai je telefoon voor een groter beeld',
    playerDemoFrame: 'Demo: {title}',
    playerCaptionsOn: 'Ondertiteling aan',
    playerCaptionsOff: 'Ondertiteling uit',
    playerProgress: 'Voortgang van de demo',
    playerProgressValue: '{current} van {total}',
    playerBigPlay: 'Bekijk demo',
    playerResume: 'Verder kijken',
    playerLoading: 'Demo wordt geladen…',
    playerMissingTitle: 'Deze demo wordt binnenkort toegevoegd.',
    playerMissingText: 'Bekijk intussen de tip en de prompt.',
    playerDemoTitle: 'Demo wordt later toegevoegd',
    playerDemoText: 'Op deze plek verschijnt straks de video.',
    playerDemoPlayHint: 'Hier komt de afspeelknop',
    playerUnavailableToast: 'Deze demo wordt binnenkort toegevoegd.',
    playerPlayFailed: 'De demo kan nu niet worden afgespeeld. Probeer het nog eens.',
    playerEndTitle: 'Klaar! Smakelijk.',
    playerEndText: 'Neem de prompt mee en probeer het morgen zelf.',
    playerEndReplay: 'Nog een keer',
    playerEndTakeaway: 'Naar de prompt',
    playerEndOther: 'Andere snack',
    playerStatusPlaying: 'De demo speelt af.',
    playerStatusPaused: 'De demo is gepauzeerd.',
    playerStatusEnded: 'De demo is afgelopen.',

    /* ---- Verras mij ---------------------------------------------------- */
    surpriseOrder: 'Bestelling #{number}',
    surprisePreparing: 'Je bestelling wordt klaargemaakt…',
    surpriseReady: 'Alsjeblieft, geniet ervan!',
    surpriseNone: 'Er zijn nog geen snacks beschikbaar.',

    /* ---- Welkomstscherm ------------------------------------------------ */
    introEyebrow: '{eventName} · {eventDates}',
    introTitle: 'Welkom bij de AI Snackbar',
    introText: 'Kies een snack, bekijk een korte demo en neem een praktische AI-tip mee.',
    introOpen: 'Open de snackkaart',
    stepOne: 'Kies je snack',
    stepTwo: 'Bekijk de demo',
    stepThree: 'Probeer het morgen zelf',

    /* ---- Over de AI Snackbar ------------------------------------------ */
    aboutTitle: 'Over de AI Snackbar',
    aboutLead: 'Geen training en geen presentatie: gewoon even snacken. Korte, praktische AI-toepassingen die je morgen direct kunt gebruiken.',
    aboutStepsTitle: 'Zo werkt het',
    aboutLicense: 'Staat er "Licentie" bij een snack of prompt? Dan heb je een Microsoft 365 Copilot-licentie nodig, omdat Copilot dan je eigen mail, Teams, agenda of bestanden gebruikt. De rest kan ook met de gratis Copilot Chat.',
    aboutHost:'Tijdens de lunches staat er een AI-koploper bij de kraam voor live demo’s en vragen.',
    aboutOrganizer: 'Een initiatief van {organization} voor {audience}.',

    /* ---- Inactiviteit (kiosk) ----------------------------------------- */
    idleTitle: 'Ben je er nog?',
    idleText: 'Zo meteen gaat de snackkaart terug naar het begin, zodat de volgende collega kan kiezen.',
    idleSecondsLabel: 'seconden',
    idleStay: 'Ik kijk nog even',
    idleReset: 'Terug naar het begin',
    kioskPaused: 'Automatische reset staat uit',
    kioskResumed: 'Automatische reset staat weer aan.',

    /* ---- Fouten -------------------------------------------------------- */
    fatalTitle: 'Er ging iets mis',
    fatalText: 'Herlaad de pagina om de AI Snackbar opnieuw te starten.',
    fatalReload: 'Opnieuw laden'
  }
};
