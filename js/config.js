/* ==========================================================================
   AI SNACKBAR — INSTELLINGEN
   --------------------------------------------------------------------------
   Dit is het centrale instellingenbestand. Pas alleen de waarden aan
   (de tekst achter de dubbele punt), niet de namen ervoor.

   - Tekst staat tussen enkele aanhalingstekens:   'zoals dit'
   - Aan/uit is true (aan) of false (uit)
   - Getallen staan zonder aanhalingstekens:        90
   - Vergeet de komma aan het eind van de regel niet.

   Na het opslaan: herlaad de pagina (F5) om de wijziging te zien.
   Uitleg per instelling: docs/CUSTOMIZATION.md
   ========================================================================== */

window.AISnackbar = window.AISnackbar || {};

window.AISnackbar.config = {

  /* ---- Titel en evenement ---------------------------------------------- */
  applicationTitle: 'AI Snackbar',
  discipline: 'Accountancy',            // Verschijnt in turquoise achter de titel
  applicationSubtitle: '',              // Zin onder de titel; leeg = niet tonen
  instruction: 'Kies een snack en bekijk hoe AI je morgen al kan helpen.',
  organizationName: 'Visser & Visser',
  audienceName: 'Accountants B.V.',
  eventName: 'Boost & Learn',
  eventDates: '26 & 27 oktober 2026',

  /* ---- Taal, thema en logo -------------------------------------------- */
  language: 'nl',                       // Teksten staan in data/texts.js
  theme: 'licht',                       // 'licht' of 'donker'
  logoPath: 'assets/branding/logo.svg', // Witte (negatieve) logovariant. Ontbreekt het bestand, dan tonen we de naam als tekst.
  logoAlt: 'Visser & Visser',

  /* ---- Functies aan/uit ------------------------------------------------ */
  showIntro: true,                      // Welkomstscherm bij de start
  showSurpriseButton: true,             // Knop 'Verras mij'
  enablePromptCopy: true,               // Knop 'Kopieer prompt' (alleen op eigen telefoon/laptop, niet op een gedeelde tablet)
  enablePromptMail: true,               // 'Mail mij deze prompt': e-mailadres achterlaten (werkt alleen met centrale opslag, zie onder)
  enableQrCodes: true,                  // QR-codeblok bij iedere snack (alleen op een gedeelde tablet; op een telefoon heeft het geen zin)
  enableRatings: true,                  // Smileys 'Hoe smaakte deze snack?' (anoniem, lokaal geteld)
  enableComments: true,                 // Veld voor een anonieme opmerking of vraag (lokaal bewaard, export via beheer)
  commentMaxLength: 280,                // Maximaal aantal tekens per opmerking
  demoMode: false,                      // true = nette placeholders i.p.v. video's (ook voor snacks mét video)
  reduceMotion: false,                  // true = animaties altijd minimaliseren (bijv. op trage tablets)

  /* ---- Kioskmodus (onbeheerde tablets) --------------------------------- */
  // 'auto' = kiosk op een tablet bij de stand (lokale kopie: index.html of start-windows.bat),
  // géén kiosk op het online adres (eigen telefoon of laptop). Een tablet die het online adres
  // gebruikt, open je met ?kiosk achter het adres. true/false = altijd aan/uit.
  kioskMode: 'auto',                    // Automatisch terug naar het begin na inactiviteit
  inactivityTimeout: 90,                // Seconden zonder aanraking tot de reset (video's die afspelen tellen niet mee)
  inactivityWarningDuration: 15,        // Seconden vooraf tonen we 'Ben je er nog?'
  showIntroAfterReset: true,            // Na een reset het welkomstscherm opnieuw tonen
  resetOnPageReload: true,              // Na herladen altijd starten op de snackkaart

  /* ---- Video ----------------------------------------------------------- */
  defaultVolume: 0.8,                   // 0 = stil, 1 = maximaal
  startMuted: false,                    // true = video's starten zonder geluid
  fullscreenOnPlay: true,               // Video vult het hele scherm zodra hij start (beter leesbaar op tablets)

  /* ---- Lokale opslag (alleen op dit apparaat, nooit persoonsgegevens) -- */
  enableLocalStorage: true,             // false = niets opslaan, alles vergeten bij herladen
  enableLocalAnalytics: true,           // Anoniem tellen hoe vaak snacks worden geopend (zichtbaar in beheer)
  storageNamespace: 'ai-snackbar-accountancy', // Uniek per discipline als meerdere snackbars op één apparaat staan

  /* ---- Centrale opslag (Supabase) -------------------------------------- */
  // Smileys, opmerkingen, anonieme tellers en 'Mail mij'-verzoeken van álle telefoons en tablets
  // komen samen in jouw Supabase-project. Leeg = alles blijft lokaal (export per tablet).
  // Instellen: zie docs/SUPABASE.md. De sleutel is de publieke 'anon'/'publishable' key, nooit de service_role key.
  centralUrl: '',                       // bijv. 'https://abcdefghijklmnop.supabase.co'
  centralKey: '',                       // bijv. 'sb_publishable_...' of de lange 'anon public' key

  /* ---- Admin (dashboard en beheer) ------------------------------------- */
  // Tablets staan standaard in de rol 'Collega'. Admin opent via 'Beheer' onderaan
  // 'Over de AI Snackbar' (of door 'beheer' te typen / het logo lang in te drukken).
  enableAdmin: true,                    // Admin (dashboard + beheer) beschikbaar
  adminCode: '1234',                    // Toegangscode, 4-8 cijfers. Let op: leesbaar in dit bestand, dus een drempel, geen beveiliging
  adminKeySequence: 'beheer',           // Typ dit woord op het toetsenbord om de codevraag te openen
  adminLongPressSeconds: 3,             // ...of houd het logo zo lang ingedrukt
  debugMode: false                      // true = extra technische meldingen in de console en op het scherm
};
