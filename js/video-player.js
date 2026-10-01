/* ==========================================================================
   Videospeler
   --------------------------------------------------------------------------
   Eén herbruikbare speler voor alle snacks, zodat er nooit twee video's
   tegelijk spelen. Eigen bediening met grote aanraakdoelen.

   Toestanden (data-state):
     idle        video gevonden, nog niet gestart (poster + afspeelknop)
     playing     speelt af
     paused      gepauzeerd
     ended       afgelopen (vervolgstap tonen)
     unavailable video ontbreekt of kan niet worden afgespeeld
     demo        demomodus: verzorgde placeholder, er wordt niets afgespeeld

   Schermvullend (class is-theater): de speler bedekt het hele venster, binnen
   de app en zonder de Fullscreen-API. Dat werkt overal hetzelfde, ook in de
   Edge-kioskweergave, en meldingen en dialogen blijven erboven zichtbaar.

   Twee soorten demo (data-media):
     video   MP4 in een <video>-element
     demo    HTML-demo (veld 'demo' in snacks.js) in een afgeschermd iframe
             (sandbox, geen toegang tot de app). Bediening via postMessage:
               app  -> demo : { source: 'ai-snackbar', command: 'play' | 'pause' | 'restart' }
               demo -> app  : { source: 'ai-snackbar-demo', event: 'ready' | 'playing' | 'paused' | 'ended' | 'activity' }
             Meldt de demo zich niet op tijd, dan valt de speler terug op de
             video (als die er is).
   ========================================================================== */
(function (ns) {
  'use strict';

  const { el, icon, setIcon, t, toast, formatTime, formatSpokenTime } = ns.ui;
  const PROGRESS_STEPS = 1000;
  const DEMO_READY_TIMEOUT = 6000;

  class VideoPlayer {
    /**
     * @param {HTMLElement} root   Leeg element waarin de speler wordt opgebouwd.
     * @param {object} options     { volume, muted, fullscreenOnPlay, onStateChange, onEndAction, onVolumeChange, onActivity }
     */
    constructor(root, options) {
      this.root = root;
      this.options = options || {};
      this.state = 'idle';
      this.snack = null;
      this.loadToken = 0;
      this.isScrubbing = false;
      this.frame = 0;
      this.duration = NaN;
      this.releaseIsolation = null;
      this.mode = 'video';
      this.demoFrame = null;
      this.demoReady = false;
      this.demoPendingPlay = false;
      this.demoTimer = 0;
      this.build();
      this.bindEvents();
    }

    /* ---- Opbouw ---------------------------------------------------------- */
    build() {
      this.root.classList.add('on-dark');
      this.root.setAttribute('role', 'region');
      this.root.setAttribute('aria-label', t('playerRegion'));

      this.video = el('video', {
        className: 'player__video',
        attrs: { playsinline: true, preload: 'metadata', disablepictureinpicture: true, controlslist: 'nodownload noplaybackrate noremoteplayback', tabindex: '-1' }
      });

      // Plek voor een HTML-demo (iframe); leeg bij een video.
      this.demoHost = el('div', { className: 'player__demo' });

      this.posterImg = el('img', { className: 'player__poster-img', attrs: { alt: '', hidden: true, draggable: 'false' } });
      this.art = el('div', { className: 'art', attrs: { 'aria-hidden': 'true' } });
      this.poster = el('div', { className: 'player__poster' }, [this.art, this.posterImg]);
      this.scrim = el('div', { className: 'player__scrim', attrs: { 'aria-hidden': 'true' } });

      this.bigPlayLabel = el('span', { className: 'player__bigplay-label' });
      this.bigPlay = el('button', { className: 'player__bigplay', attrs: { type: 'button' } }, [
        el('span', { className: 'player__bigplay-circle' }, icon('play')),
        this.bigPlayLabel
      ]);

      this.noticeRing = el('span', { className: 'player__notice-ring' }, icon('play'));
      this.noticeHint = el('span', { className: 'player__notice-hint' });
      this.noticeTitle = el('p', { className: 'player__notice-title' });
      this.noticeText = el('p', { className: 'player__notice-text' });
      this.notice = el('div', { className: 'player__notice', attrs: { role: 'status' } }, [this.noticeRing, this.noticeHint, this.noticeTitle, this.noticeText]);

      this.spinner = el('div', { className: 'player__spinner', attrs: { 'aria-hidden': 'true' } });

      this.endReplay = this.actionButton('replay', t('playerEndReplay'), 'btn btn--ghost-dark');
      this.endTakeaway = this.actionButton('bag', t('playerEndTakeaway'), 'btn btn--primary');
      this.endOther = this.actionButton('grid', t('playerEndOther'), 'btn btn--ghost-dark');
      this.endTitle = el('p', { className: 'player__endcard-title', text: t('playerEndTitle') });
      this.endText = el('p', { className: 'player__endcard-text', text: t('playerEndText') });
      this.endExtra = el('div', { className: 'player__endcard-extra', attrs: { hidden: true } });
      this.endcard = el('div', { className: 'player__endcard', attrs: { 'aria-hidden': 'true' } }, [
        el('span', { className: 'player__endcard-icon' }, icon('check')),
        this.endTitle,
        this.endText,
        this.endExtra,
        el('div', { className: 'player__endcard-actions' }, [this.endReplay, this.endTakeaway, this.endOther])
      ]);

      // Alleen zichtbaar als de speler het hele scherm vult: duidelijk de weg terug naar de pagina.
      this.shrinkButton = el('button', { className: 'player__shrink', attrs: { type: 'button' } }, [icon('fullscreen-exit'), el('span', { text: t('playerShrink') })]);
      // Video schermvullend op een staande telefoon: liggend is het beeld groter (alleen via CSS zichtbaar).
      this.rotateHint = el('p', { className: 'player__rotate', attrs: { 'aria-hidden': 'true' }, text: t('playerRotateHint') });

      this.stage = el('div', { className: 'player__stage' }, [this.video, this.demoHost, this.poster, this.scrim, this.bigPlay, this.notice, this.spinner, this.endcard, this.rotateHint, this.shrinkButton]);

      this.toggleButton = this.controlButton('play', t('playerPlay'), 'player__btn player__btn--primary');
      this.restartButton = this.controlButton('replay', t('playerRestart'), 'player__btn player__restart');
      this.timeCurrent = el('span', { className: 'player__time player__time--current', text: '0:00', attrs: { 'aria-hidden': 'true' } });
      this.timeTotal = el('span', { className: 'player__time player__time--total', text: '–:––', attrs: { 'aria-hidden': 'true' } });
      this.progress = el('input', {
        className: 'player__progress',
        attrs: { type: 'range', min: 0, max: PROGRESS_STEPS, step: 1, value: 0, 'aria-label': t('playerProgress') }
      });
      this.captionsButton = this.controlButton('captions', t('playerCaptionsOn'), 'player__btn player__captions', { hidden: true, 'aria-pressed': 'false' });
      this.muteButton = this.controlButton('volume', t('playerMute'), 'player__btn player__mute');
      this.fullscreenButton = this.controlButton('fullscreen', t('playerFullscreen'), 'player__btn player__fullscreen');

      this.controls = el('div', { className: 'player__controls' }, [
        this.toggleButton,
        this.restartButton,
        this.timeCurrent,
        this.progress,
        this.timeTotal,
        this.captionsButton,
        this.muteButton,
        this.fullscreenButton
      ]);

      this.root.replaceChildren(this.stage, this.controls);
    }

    controlButton(iconName, label, className, extraAttrs) {
      return el('button', { className, attrs: Object.assign({ type: 'button', 'aria-label': label, title: label }, extraAttrs) }, icon(iconName));
    }

    actionButton(iconName, label, className) {
      return el('button', { className, attrs: { type: 'button', tabindex: '-1' } }, [icon(iconName), el('span', { text: label })]);
    }

    bindEvents() {
      const video = this.video;

      this.bigPlay.addEventListener('click', (event) => {
        event.stopPropagation();
        this.play();
      });
      this.stage.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        if (this.state === 'demo' || this.state === 'unavailable') return;
        this.toggle();
      });
      this.toggleButton.addEventListener('click', () => this.toggle());
      this.restartButton.addEventListener('click', () => this.restart());
      this.muteButton.addEventListener('click', () => this.setMuted(!video.muted));
      this.fullscreenButton.addEventListener('click', () => this.setTheater(!this.isTheater(), { animate: true }));
      this.shrinkButton.addEventListener('click', () => this.setTheater(false, { animate: true }));
      this.captionsButton.addEventListener('click', () => this.toggleCaptions());

      this.endReplay.addEventListener('click', () => this.restart());
      this.endTakeaway.addEventListener('click', () => this.emitEndAction('takeaway'));
      this.endOther.addEventListener('click', () => this.emitEndAction('other'));

      // Voortgangsbalk: tijdens het slepen niet laten terugspringen.
      this.progress.addEventListener('input', () => {
        this.isScrubbing = true;
        const target = this.progressToTime(Number(this.progress.value));
        this.renderTime(target);
      });
      this.progress.addEventListener('change', () => {
        const target = this.progressToTime(Number(this.progress.value));
        if (Number.isFinite(target)) video.currentTime = target;
        this.isScrubbing = false;
        if (this.state === 'ended') this.setState('paused');
      });

      video.addEventListener('loadedmetadata', () => {
        this.duration = video.duration;
        this.renderTime(video.currentTime);
      });
      video.addEventListener('durationchange', () => {
        this.duration = video.duration;
        this.renderTime(video.currentTime);
      });
      video.addEventListener('play', () => this.setState('playing'));
      video.addEventListener('playing', () => this.setBuffering(false));
      video.addEventListener('waiting', () => this.setBuffering(true));
      video.addEventListener('pause', () => {
        if (!video.ended && this.state === 'playing') this.setState('paused');
      });
      video.addEventListener('ended', () => {
        this.setBuffering(false);
        this.setState('ended');
      });
      video.addEventListener('timeupdate', () => {
        if (this.state !== 'playing') this.renderTime(video.currentTime);
      });
      video.addEventListener('volumechange', () => this.renderVolume());
      video.addEventListener('error', () => this.handleMediaError());

      // Escape verlaat eerst het schermvullende beeld; app.js gaat pas daarna terug naar de snackkaart.
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || event.defaultPrevented || !this.isTheater() || ns.a11y.isAnyDialogOpen()) return;
        event.preventDefault();
        this.setTheater(false, { animate: true });
      });

      window.addEventListener('message', (event) => this.handleDemoMessage(event));

      // Scherm op de achtergrond (bijv. tablet in slaapstand): pauzeren.
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.pause();
      });
    }

    /* ---- Laden ------------------------------------------------------------- */
    /**
     * Laadt een snack in de speler.
     * @param {object} snack
     * @param {{ demoMode: boolean }} options
     */
    load(snack, options) {
      this.unload();
      const token = ++this.loadToken;
      this.snack = snack;
      this.duration = NaN;
      this.root.className = 'player on-dark accent-' + snack.accent;
      this.renderArt(snack);
      this.bigPlayLabel.textContent = t('playerBigPlay') + (snack.duration ? ' · ' + snack.duration : '');
      this.setMode('video');

      if (options && options.demoMode) {
        // Demomodus: altijd de verzorgde placeholder, er wordt niets geladen.
        this.renderPoster('', token);
        this.showPlaceholder('demo');
        return;
      }
      this.renderPoster(snack.poster, token);
      if (snack.demo) {
        this.loadDemo(snack, token);
        return;
      }
      this.loadVideo(snack);
    }

    loadVideo(snack) {
      if (!snack.video) {
        this.showPlaceholder('unavailable');
        return;
      }
      this.setMode('video');
      this.video.volume = clamp(this.options.volume, 0, 1);
      this.video.muted = Boolean(this.options.muted);
      this.video.src = snack.video;
      this.addCaptions(snack);
      this.setControlsEnabled(true);
      this.setState('idle');
      this.renderTime(0);
      this.video.load();
    }

    /* ---- HTML-demo ------------------------------------------------------------ */
    setMode(mode) {
      this.mode = mode;
      this.root.dataset.media = mode;
    }

    loadDemo(snack, token) {
      this.setMode('demo');
      this.demoReady = false;
      this.demoPendingPlay = false;
      // sandbox zonder allow-same-origin: de demo kan niet bij de app, de opslag of andere pagina's.
      this.demoFrame = el('iframe', {
        className: 'player__demo-frame',
        attrs: { src: snack.demo, title: t('playerDemoFrame', { title: snack.title }), sandbox: 'allow-scripts', referrerpolicy: 'no-referrer' }
      });
      this.demoHost.replaceChildren(this.demoFrame);
      this.captionsButton.hidden = true;
      this.setControlsEnabled(true);
      this.setState('idle');
      window.clearTimeout(this.demoTimer);
      this.demoTimer = window.setTimeout(() => {
        if (token === this.loadToken && !this.demoReady) this.demoFailed(snack);
      }, DEMO_READY_TIMEOUT);
    }

    /** Demo meldt zich niet (bestand ontbreekt of zonder koppeling): dan de video als reserve. */
    demoFailed(snack) {
      console.warn('[AI Snackbar] HTML-demo reageert niet' + (snack.video ? ', we tonen de video:' : ':'), snack.demo);
      const wantedPlay = this.demoPendingPlay;
      this.unloadDemo();
      this.setBuffering(false);
      this.loadVideo(snack);
      if (wantedPlay && this.isPlayable()) this.play();
    }

    unloadDemo() {
      window.clearTimeout(this.demoTimer);
      this.demoFrame = null;
      this.demoReady = false;
      this.demoPendingPlay = false;
      this.demoHost.replaceChildren();
    }

    postDemo(command) {
      if (this.demoFrame && this.demoFrame.contentWindow) {
        this.demoFrame.contentWindow.postMessage({ source: 'ai-snackbar', command }, '*');
      }
    }

    handleDemoMessage(event) {
      // Alleen berichten van ons eigen iframe, in de afgesproken vorm.
      if (!this.demoFrame || event.source !== this.demoFrame.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'ai-snackbar-demo' || typeof data.event !== 'string') return;
      switch (data.event) {
        case 'ready':
          this.demoReady = true;
          window.clearTimeout(this.demoTimer);
          if (this.demoPendingPlay) this.postDemo('play');
          break;
        case 'playing':
          this.demoPendingPlay = false;
          this.setBuffering(false);
          this.setState('playing');
          break;
        case 'paused':
          if (this.state === 'playing') this.setState('paused');
          break;
        case 'ended':
          this.setBuffering(false);
          this.setState('ended');
          break;
        case 'activity':
          if (typeof this.options.onActivity === 'function') this.options.onActivity();
          break;
        default:
          break;
      }
    }

    /** Stopt en ontkoppelt de huidige demo (bij verlaten van de detailpagina). */
    unload() {
      this.loadToken += 1;
      this.stopProgressLoop();
      this.setBuffering(false);
      this.setTheater(false);
      this.unloadDemo();
      try {
        this.video.pause();
      } catch (error) {
        /* niets aan de hand */
      }
      this.video.removeAttribute('src');
      this.video.querySelectorAll('track').forEach((track) => track.remove());
      this.video.load();
      this.captionsButton.hidden = true;
      this.progress.value = 0;
      this.progress.style.setProperty('--progress', '0%');
      this.setEndcardFocusable(false);
      if (this.state === 'playing') this.setState('paused');
    }

    renderArt(snack) {
      const iconImg = ns.ui.imageWithFallback(snack.icon, '', () => icon('cloche'));
      this.art.replaceChildren(
        el('div', { className: 'art__stripes' }),
        el('div', { className: 'art__glow' }),
        el('div', { className: 'art__glow art__glow--soft' }),
        el('div', { className: 'art__header' }, [
          el('span', { className: 'art__icon' }, iconImg),
          el('span', { className: 'art__number', text: t('cardNumber', { number: snack.number }) })
        ]),
        el('div', { className: 'art__footer' }, [
          el('p', { className: 'art__title', text: snack.title }),
          snack.subtitle ? el('p', { className: 'art__subtitle', text: snack.subtitle }) : null
        ])
      );
    }

    renderPoster(src, token) {
      this.posterImg.hidden = true;
      this.posterImg.removeAttribute('src');
      if (!src) return;
      const img = this.posterImg;
      img.onload = () => {
        if (token === this.loadToken) img.hidden = false;
      };
      img.onerror = () => {
        // Geen poster? Dan blijft de verzorgde placeholder zichtbaar.
        if (token === this.loadToken) console.info('[AI Snackbar] Poster niet gevonden, placeholder getoond:', src);
      };
      img.src = src;
    }

    addCaptions(snack) {
      if (!snack.captions) return;
      const track = el('track', { attrs: { kind: 'subtitles', srclang: 'nl', label: 'Nederlands', src: snack.captions, default: true } });
      track.addEventListener('load', () => {
        this.captionsButton.hidden = false;
        this.renderCaptions();
      });
      track.addEventListener('error', () => {
        console.info('[AI Snackbar] Ondertitels niet geladen (ontbreekt, of geblokkeerd via file:// — gebruik dan de lokale server):', snack.captions);
      });
      this.video.append(track);
    }

    showPlaceholder(kind) {
      const isDemo = kind === 'demo';
      setIcon(this.noticeRing.querySelector('svg'), isDemo ? 'play' : 'film');
      this.noticeHint.textContent = isDemo ? t('playerDemoPlayHint') : '';
      this.noticeHint.hidden = !isDemo;
      this.noticeTitle.textContent = isDemo ? t('playerDemoTitle') : t('playerMissingTitle');
      this.noticeText.textContent = isDemo ? t('playerDemoText') : t('playerMissingText');
      this.setTheater(false);
      this.setControlsEnabled(false);
      this.timeCurrent.textContent = '–:––';
      this.timeTotal.textContent = '–:––';
      this.setState(kind);
    }

    handleMediaError() {
      // Na unload() vuurt ook een fout zonder bron; die negeren we.
      if (!this.video.getAttribute('src') || this.state === 'demo') return;
      const error = this.video.error;
      console.warn('[AI Snackbar] Video kan niet worden geladen:', this.snack && this.snack.video, error ? 'code ' + error.code : '');
      this.stopProgressLoop();
      this.setBuffering(false);
      this.showPlaceholder('unavailable');
    }

    /* ---- Bediening ---------------------------------------------------------- */
    isPlayable() {
      return this.state !== 'demo' && this.state !== 'unavailable';
    }

    notifyUnavailable() {
      toast(this.state === 'demo' ? t('playerDemoTitle') : t('playerUnavailableToast'), { icon: 'film' });
    }

    play() {
      if (!this.isPlayable()) {
        this.notifyUnavailable();
        return;
      }
      if (this.mode === 'demo') {
        if (this.state === 'ended') {
          this.postDemo('restart');
          return;
        }
        // Nog niet klaar? Dan starten zodra de demo zich meldt.
        this.demoPendingPlay = true;
        this.setBuffering(!this.demoReady);
        if (this.demoReady) this.postDemo('play');
        return;
      }
      if (this.state === 'ended') this.video.currentTime = 0;
      this.setBuffering(this.video.readyState < 3);
      const attempt = this.video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch((error) => {
          this.setBuffering(false);
          if (error && error.name === 'AbortError') return;
          console.warn('[AI Snackbar] Afspelen mislukt:', error);
          if (this.state !== 'unavailable') {
            toast(t('playerPlayFailed'), { tone: 'warning' });
            this.setState(this.video.currentTime > 0 ? 'paused' : 'idle');
          }
        });
      }
    }

    pause() {
      if (this.state !== 'playing') return;
      if (this.mode === 'demo') this.postDemo('pause');
      else this.video.pause();
    }

    toggle() {
      if (this.state === 'playing') this.pause();
      else this.play();
    }

    restart() {
      if (!this.isPlayable()) {
        this.notifyUnavailable();
        return;
      }
      if (this.mode === 'demo') {
        if (!this.demoReady) {
          this.play();
          return;
        }
        this.postDemo('restart');
        return;
      }
      this.video.currentTime = 0;
      this.renderTime(0);
      this.play();
    }

    setMuted(muted) {
      this.video.muted = muted;
      if (!muted && this.video.volume === 0) this.video.volume = clamp(this.options.volume || 0.8, 0.1, 1);
      if (typeof this.options.onVolumeChange === 'function') {
        this.options.onVolumeChange({ muted: this.video.muted, volume: this.video.volume });
      }
    }

    toggleCaptions() {
      const track = this.video.textTracks && this.video.textTracks[0];
      if (!track) return;
      track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
      this.renderCaptions();
    }

    /* ---- Schermvullend -------------------------------------------------------- */
    isTheater() {
      return this.root.classList.contains('is-theater');
    }

    /**
     * Speler schermvullend aan/uit. animate: de speler groeit vloeiend mee
     * (View Transition). Nooit animeren tijdens een schermwissel (unload).
     */
    setTheater(on, options) {
      if (on === this.isTheater()) return;
      const apply = () => {
        if (on === this.isTheater()) return; // bijv. twee keer snel getikt tijdens de overgang
        const focusWasInside = this.root.contains(document.activeElement);
        this.root.classList.toggle('is-theater', on);
        document.documentElement.classList.toggle('has-theater', on);
        if (on) {
          this.releaseIsolation = ns.a11y.isolate(this.root);
          // De rest van de pagina is nu inert: focus hoort in de speler.
          if (!focusWasInside) this.toggleButton.focus({ preventScroll: true });
        } else {
          if (this.releaseIsolation) this.releaseIsolation();
          this.releaseIsolation = null;
          if (document.activeElement === this.shrinkButton) this.fullscreenButton.focus({ preventScroll: true });
        }
        this.renderFullscreen();
      };
      if (options && options.animate) ns.navigation.transition(apply, { direction: 'theater' });
      else apply();
    }

    /* ---- Weergave ------------------------------------------------------------- */
    setState(state) {
      const previous = this.state;
      this.state = state;
      this.root.dataset.state = state;
      const playing = state === 'playing';
      setIcon(this.toggleButton.querySelector('svg'), playing ? 'pause' : 'play');
      const label = playing ? t('playerPause') : t('playerPlay');
      this.toggleButton.setAttribute('aria-label', label);
      this.toggleButton.title = label;
      this.bigPlayLabel.textContent = state === 'paused' ? t('playerResume') : t('playerBigPlay') + (this.snack && this.snack.duration ? ' · ' + this.snack.duration : '');
      this.bigPlay.setAttribute('aria-label', state === 'paused' ? t('playerResume') : t('playerBigPlay'));
      // De grote knop is alleen zichtbaar (en dus focusbaar) vóór het afspelen en bij pauze.
      const bigPlayVisible = state === 'idle' || state === 'paused';
      if (!bigPlayVisible && document.activeElement === this.bigPlay) this.toggleButton.focus({ preventScroll: true });
      this.bigPlay.tabIndex = bigPlayVisible ? 0 : -1;
      this.bigPlay.setAttribute('aria-hidden', String(!bigPlayVisible));

      const showEndcard = state === 'ended';
      // Bijv. 'Nog een keer': de knop verdwijnt, de focus blijft in de speler.
      if (!showEndcard && this.endcard.contains(document.activeElement)) this.toggleButton.focus({ preventScroll: true });
      this.endcard.setAttribute('aria-hidden', String(!showEndcard));
      this.setEndcardFocusable(showEndcard);
      if (showEndcard && this.root.contains(document.activeElement)) this.endcardFocusTarget().focus({ preventScroll: true });

      if (playing && this.mode === 'video') this.startProgressLoop();
      else this.stopProgressLoop();
      if (state === 'ended') this.renderTime(this.duration);

      if (previous !== state) {
        // Een nieuwe kijkbeurt (niet hervatten na pauze): schermvullend, zodat de tekst in de demo leesbaar is.
        if (playing && (previous === 'idle' || previous === 'ended') && this.options.fullscreenOnPlay) this.setTheater(true, { animate: true });
        if (state === 'playing') ns.a11y.announce(t('playerStatusPlaying'));
        if (state === 'paused') ns.a11y.announce(t('playerStatusPaused'));
        if (state === 'ended') ns.a11y.announce(t('playerStatusEnded'));
        if (typeof this.options.onStateChange === 'function') this.options.onStateChange(state, previous);
      }
    }

    setBuffering(isBuffering) {
      this.root.dataset.buffering = String(Boolean(isBuffering));
    }

    setControlsEnabled(enabled) {
      [this.toggleButton, this.restartButton, this.progress, this.muteButton, this.captionsButton, this.fullscreenButton].forEach((control) => {
        control.disabled = !enabled;
      });
      this.renderVolume();
    }

    setEndcardFocusable(focusable) {
      this.endcard.querySelectorAll('button').forEach((button) => {
        button.tabIndex = focusable ? 0 : -1;
      });
    }

    /** Waar de focus heen gaat als het eindscherm verschijnt: de extra inhoud (de vraag), anders 'Naar de prompt'. */
    endcardFocusTarget() {
      return (!this.endExtra.hidden && this.endExtra.querySelector('[data-endcard-focus]')) || this.endTakeaway;
    }

    /**
     * Extra inhoud op het eindscherm (de smileybeoordeling). Die wordt dan de
     * hoofdzaak: de eigen titel en tekst maken plaats en het vinkje verdwijnt.
     */
    setEndcardExtra(node) {
      this.endExtra.replaceChildren(node);
      this.endExtra.hidden = false;
      this.endTitle.hidden = true;
      this.endText.hidden = true;
      this.endcard.classList.add('player__endcard--rating');
      this.setEndcardFocusable(this.state === 'ended');
    }

    progressToTime(value) {
      return Number.isFinite(this.duration) ? (value / PROGRESS_STEPS) * this.duration : NaN;
    }

    renderTime(time) {
      const duration = this.duration;
      const hasDuration = Number.isFinite(duration) && duration > 0;
      const safeTime = Number.isFinite(time) ? Math.min(Math.max(time, 0), hasDuration ? duration : time) : 0;
      this.timeCurrent.textContent = formatTime(safeTime);
      this.timeTotal.textContent = hasDuration ? formatTime(duration) : '–:––';
      const ratio = hasDuration ? safeTime / duration : 0;
      if (!this.isScrubbing) this.progress.value = String(Math.round(ratio * PROGRESS_STEPS));
      this.progress.style.setProperty('--progress', (ratio * 100).toFixed(2) + '%');
      this.progress.setAttribute(
        'aria-valuetext',
        hasDuration ? t('playerProgressValue', { current: formatSpokenTime(safeTime), total: formatSpokenTime(duration) }) : t('playerLoading')
      );
    }

    renderVolume() {
      const muted = this.video.muted || this.video.volume === 0;
      setIcon(this.muteButton.querySelector('svg'), muted ? 'mute' : 'volume');
      const label = muted ? t('playerUnmute') : t('playerMute');
      this.muteButton.setAttribute('aria-label', label);
      this.muteButton.title = label;
    }

    renderCaptions() {
      const track = this.video.textTracks && this.video.textTracks[0];
      const showing = Boolean(track && track.mode === 'showing');
      this.captionsButton.setAttribute('aria-pressed', String(showing));
      const label = showing ? t('playerCaptionsOff') : t('playerCaptionsOn');
      this.captionsButton.setAttribute('aria-label', label);
      this.captionsButton.title = label;
    }

    renderFullscreen() {
      const active = this.isTheater();
      setIcon(this.fullscreenButton.querySelector('svg'), active ? 'fullscreen-exit' : 'fullscreen');
      const label = active ? t('playerExitFullscreen') : t('playerFullscreen');
      this.fullscreenButton.setAttribute('aria-label', label);
      this.fullscreenButton.title = label;
    }

    /* Vloeiende voortgangsbalk tijdens het afspelen (alleen dan actief). */
    startProgressLoop() {
      if (this.frame) return;
      const tick = () => {
        this.renderTime(this.video.currentTime);
        this.frame = window.requestAnimationFrame(tick);
      };
      this.frame = window.requestAnimationFrame(tick);
    }

    stopProgressLoop() {
      if (this.frame) window.cancelAnimationFrame(this.frame);
      this.frame = 0;
    }

    emitEndAction(action) {
      // Naar de prompt of een andere snack: eerst terug naar de gewone pagina.
      this.setTheater(false);
      if (typeof this.options.onEndAction === 'function') this.options.onEndAction(action);
    }
  }

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return max;
    return Math.min(Math.max(number, min), max);
  }

  ns.VideoPlayer = VideoPlayer;
})(window.AISnackbar);
