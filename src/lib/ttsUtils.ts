/**
 * ttsUtils.ts — Utilitaires audio/TTS multi-appareils
 *
 * Couverture :
 *  iOS Safari/Chrome    — gesture chain, keepalive 10 s, voix Amélie/Thomas
 *  iPadOS               — détecté via maxTouchPoints, traité comme iOS
 *  Android mobile       — voix async (onvoiceschanged), "Google français", retry 300 ms
 *  Android tablette     — idem Android + isTablet=true
 *  Windows Chrome/Edge  — Microsoft Hortense / Microsoft Paul / Google français
 *  Windows Firefox      — SAPI voix Windows, délai 100 ms avant speak()
 *  macOS Safari/Chrome  — Thomas, Amélie
 *  Samsung Internet     — TTS limité → détection + avertissement
 *  ChromeOS (Chromebook)— détecté via CrOS UA, délai 200 ms
 *  Linux desktop        — détecté via Linux UA non-Android/non-ChromeOS
 *  Smart TV             — Tizen (Samsung), webOS (LG), AndroidTV, FireTV, HbbTV, Chromecast
 *                         TTS souvent absent → message dédié, délai 500 ms si disponible
 *  Voiture (CarPlay/Android Auto) — UA spécifiques, délai 500 ms + retry
 *  Projecteur / HDMI    — Mode Classe : volume 1.0 + rate réduit
 *  Grand écran HD/4K    — détecté via screen.width ≥ 1920, conseils sortie audio
 */

// ─── Détection appareil ────────────────────────────────────────────────────────

export type DeviceType =
  | 'ios'       // iPhone, iPad, iPod
  | 'android'   // Android mobile ET tablette
  | 'windows'   // Windows desktop/laptop
  | 'mac'       // macOS desktop/laptop
  | 'chromeos'  // Chromebook (Chrome OS)
  | 'linux'     // Linux desktop
  | 'tv'        // Smart TV : Tizen, webOS, AndroidTV, FireTV, HbbTV, Chromecast
  | 'car'       // Voiture : CarPlay, Android Auto, navigateurs embarqués
  | 'other';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isTV: boolean;
  isCar: boolean;
  isLargeScreen: boolean; // écran ≥ 1920 px (HD/4K/cinéma)
  browser: string;
  hasTTS: boolean;
  hasAudioContext: boolean;
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    return {
      type: 'other', isMobile: false, isTablet: false,
      isTV: false, isCar: false, isLargeScreen: false,
      browser: 'unknown', hasTTS: false, hasAudioContext: false,
    };
  }
  const ua       = navigator.userAgent;
  const platform = navigator.platform ?? '';

  // ── Détection OS ──────────────────────────────────────────────────────────

  // Smart TV : Tizen (Samsung), webOS (LG), AndroidTV, FireTV, HbbTV, Chromecast
  const isTV =
    /Tizen|SMART-TV|SmartTV|webOS|Web0S|NetCast|BRAVIA|Philips|HbbTV/.test(ua) ||
    /CrKey/.test(ua) ||                                  // Chromecast
    (/Android/.test(ua) && /TV/.test(ua)) ||             // AndroidTV / FireTV "TV" token
    /AFT[A-Z]|FireTV|Fire TV|Amazon Fire/.test(ua);      // Amazon Fire TV sticks

  // Voiture : Android Auto (masqué derrière Chrome pour Android mais avec "wego" ou "AA")
  // iOS CarPlay est totalement masqué — on détecte via "CarBrowser" ou user-agent spécifiques
  const isCar =
    /CarBrowser|CarPlay|AndroidAuto|Android Auto|MIR|Revcent|HARMAN|QNX|AGL|MercedesBenz|BMW|Audi|Volkswagen|Renault|Peugeot|Stellantis/.test(ua) ||
    /CarMediaApp/.test(ua);

  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isChromeOS = /CrOS/.test(ua);
  const isAndroid  = /Android/.test(ua) && !isTV;
  const isLinux    = /Linux/.test(ua) && !isAndroid && !isChromeOS && !isTV;
  const isMac      = /Mac/.test(platform) && !isIOS;
  const isWindows  = /Win/.test(platform);

  const isMobile  = /Mobi|iPhone|iPod/.test(ua) || (isAndroid && /Mobi/.test(ua));
  const isTablet  =
    /iPad/.test(ua) ||
    (/Android/.test(ua) && !/Mobi/.test(ua) && !isTV);

  const isLargeScreen =
    typeof window !== 'undefined' &&
    (window.screen?.width ?? 0) >= 1920;

  // ── Détection navigateur ──────────────────────────────────────────────────
  let browser = 'unknown';
  if (/SamsungBrowser/.test(ua)) browser = 'samsung';
  else if (/OPR|Opera/.test(ua)) browser = 'opera';
  else if (/Edg\//.test(ua))     browser = 'edge';
  else if (/Firefox/.test(ua))   browser = 'firefox';
  else if (/Chrome/.test(ua))    browser = 'chrome';
  else if (/Safari/.test(ua))    browser = 'safari';

  // ── Type principal ────────────────────────────────────────────────────────
  let type: DeviceType = 'other';
  if (isCar)      type = 'car';
  else if (isTV)  type = 'tv';
  else if (isIOS) type = 'ios';
  else if (isAndroid)  type = 'android';
  else if (isChromeOS) type = 'chromeos';
  else if (isWindows)  type = 'windows';
  else if (isMac)      type = 'mac';
  else if (isLinux)    type = 'linux';

  return {
    type,
    isMobile,
    isTablet,
    isTV,
    isCar,
    isLargeScreen,
    browser,
    hasTTS:          typeof window !== 'undefined' && 'speechSynthesis' in window,
    hasAudioContext: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
  };
}

// ─── Sélection de la meilleure voix française ─────────────────────────────────

const FR_VOICE_PRIORITIES = [
  // macOS / iOS
  'Amélie', 'Thomas', 'Aurelie',
  // Windows
  'Microsoft Hortense', 'Microsoft Paul',
  // Google (Chrome / Android)
  'Google français', 'Google French',
  // Générique
  'fr-FR', 'fr_FR', 'fr',
];

let cachedVoice: SpeechSynthesisVoice | null = null;

/** Retourne la meilleure voix française disponible, ou null si aucune. */
export function getBestFrenchVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;

  // Retourne le cache si disponible et toujours dans la liste
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;

  // Priorité 1 : nom exact
  for (const name of FR_VOICE_PRIORITIES) {
    const match = voices.find(v => v.name === name);
    if (match) { cachedVoice = match; return match; }
  }

  // Priorité 2 : lang fr-* ou fr_*
  const frVoice = voices.find(v => v.lang.startsWith('fr'));
  if (frVoice) { cachedVoice = frVoice; return frVoice; }

  return null;
}

/** Liste toutes les voix françaises disponibles (pour le sélecteur UI). */
export function getFrenchVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('fr'));
}

// ─── Chargement asynchrone des voix (Android Chrome / Firefox) ────────────────

/**
 * Attend que les voix soient chargées (Android / Firefox les charge de façon async).
 * Résout après 4 s max pour ne pas bloquer l'UI.
 * Android Chrome peut prendre jusqu'à 3 s au premier chargement.
 */
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) { resolve([]); return; }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }

    // Timeout étendu à 4 s pour les Android lents
    const timeout = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 4000);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

// ─── Déblocage AudioContext (Chrome/Safari politique autoplay) ─────────────────

let audioContextUnlocked = false;

/**
 * Débloque l'AudioContext du navigateur lors du premier clic utilisateur.
 * Nécessaire sur certains navigateurs (Safari, Chrome mobile) qui suspendent
 * l'audio tant qu'aucun geste n'a eu lieu.
 */
export function unlockAudioContext(): void {
  if (audioContextUnlocked) return;
  try {
    const AudioCtx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    audioContextUnlocked = true;
  } catch {
    // AudioContext non supporté — silencieux
  }
}

// ─── Construction d'une utterance optimisée ────────────────────────────────────

export interface TTSOptions {
  rate?: number;    // 0.6–1.3 (défaut 0.85)
  pitch?: number;   // 0.8–1.2 (défaut 1.05)
  volume?: number;  // 0–1     (défaut 1.0)
  voice?: SpeechSynthesisVoice | null;
}

export function buildUtterance(text: string, opts: TTSOptions = {}): SpeechSynthesisUtterance {
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang   = 'fr-FR';
  utt.rate   = opts.rate   ?? 0.85;
  utt.pitch  = opts.pitch  ?? 1.05;
  utt.volume = opts.volume ?? 1.0;
  const voice = opts.voice ?? getBestFrenchVoice();
  if (voice) utt.voice = voice;
  return utt;
}

// ─── Durée estimée (fallback onend) ───────────────────────────────────────────

export function estimateDuration(text: string, rate: number): number {
  const baseSecs = (text.length * 0.07) / rate;
  return Math.max(2000, baseSecs * 1000 + 1500);
}

// ─── Stop global ──────────────────────────────────────────────────────────────

export function stopSpeech(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ─── Détection iOS (utilitaire rapide) ────────────────────────────────────────

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// ─── Conseil audio par appareil (affiché dans l'UI) ──────────────────────────

export interface AudioTip {
  icon: string;
  titre: string;
  desc: string;
}

export function getAudioTips(info: DeviceInfo): AudioTip[] {
  const tips: AudioTip[] = [];

  // ── iOS (iPhone / iPad) ──────────────────────────────────────────────────
  if (info.type === 'ios') {
    tips.push({
      icon: '🔕',
      titre: 'Bouton silencieux iPhone/iPad',
      desc: 'Le petit interrupteur sur le côté droit met l\'appareil en mode silencieux. Assurez-vous qu\'il est bien sur la position sonore (pas de ligne orange visible).',
    });
    tips.push({
      icon: '🔊',
      titre: 'Volume média iOS',
      desc: 'Utilisez les boutons Volume + et Volume − sur le côté de l\'appareil pendant la lecture. Le volume de sonnerie et le volume média sont séparés sur iOS.',
    });
    if (info.isTablet) {
      tips.push({
        icon: '📱',
        titre: 'iPad — sortie audio',
        desc: 'Sur iPad, si vous utilisez un écran externe via USB-C ou HDMI, le son peut sortir par l\'adaptateur. Vérifiez dans Réglages → Son.',
      });
    }
  }

  // ── Android (mobile + tablette) ──────────────────────────────────────────
  if (info.type === 'android') {
    tips.push({
      icon: '🔊',
      titre: info.isTablet ? 'Volume média tablette Android' : 'Volume média Android',
      desc: 'Appuyez sur Volume + pendant la lecture vocale. Certains Android ont un volume « Média » séparé du volume d\'appel — vérifiez dans Paramètres → Sons.',
    });
    if (info.browser === 'samsung') {
      tips.push({
        icon: '⚠️',
        titre: 'Samsung Internet — voix limitée',
        desc: 'Samsung Internet peut bloquer la synthèse vocale. Ouvrez cette page dans Chrome ou Firefox pour une meilleure expérience vocale.',
      });
    }
    if (info.isTablet) {
      tips.push({
        icon: '📺',
        titre: 'Tablette Android sur TV / projecteur',
        desc: 'Si vous avez branché la tablette à un écran externe (HDMI/DisplayPort), allez dans Paramètres → Son et sélectionnez la sortie audio HDMI.',
      });
    }
  }

  // ── Windows ──────────────────────────────────────────────────────────────
  if (info.type === 'windows') {
    tips.push({
      icon: '🖥️',
      titre: 'Projecteur / écran externe (Windows)',
      desc: 'Si le son ne sort pas par le projecteur, allez dans Paramètres → Système → Son → et sélectionnez le périphérique de sortie HDMI/DisplayPort. Vérifiez aussi que le volume du mixeur Windows n\'est pas coupé pour ce navigateur.',
    });
    tips.push({
      icon: '🔇',
      titre: 'Son coupé dans le navigateur',
      desc: 'Cliquez droit sur l\'onglet dans Chrome/Edge → vérifiez que « Réactiver le son » est disponible. Certains onglets sont mis en sourdine automatiquement.',
    });
    if (info.isLargeScreen) {
      tips.push({
        icon: '📺',
        titre: 'TV HD / 4K connectée (Windows)',
        desc: 'Sur un grand écran HD ou 4K connecté en HDMI/ARC, allez dans Paramètres → Son → Sortie et choisissez votre TV. Si le son est muet sur la TV, désactivez et réactivez le câble HDMI.',
      });
    }
  }

  // ── macOS ─────────────────────────────────────────────────────────────────
  if (info.type === 'mac') {
    tips.push({
      icon: '🖥️',
      titre: 'Projecteur / HDMI (Mac)',
      desc: 'Allez dans Préférences Système → Son → Sortie, et sélectionnez votre écran ou projecteur HDMI. Sur macOS Ventura+ : Réglages Système → Son → Sortie.',
    });
    tips.push({
      icon: '🍎',
      titre: 'Safari — autorisation audio',
      desc: 'Si la synthèse vocale ne démarre pas sur Safari, allez dans Safari → Réglages pour ce site → Lecture automatique → Autoriser tout le contenu automatique.',
    });
    if (info.isLargeScreen) {
      tips.push({
        icon: '📺',
        titre: 'TV 4K / écran cinéma (Mac)',
        desc: 'Sur un Apple Studio Display ou une TV 4K connectée, le son peut être redirigé. Allez dans Réglages Système → Son → Sortie → sélectionnez votre écran ou TV.',
      });
    }
  }

  // ── ChromeOS (Chromebook) ─────────────────────────────────────────────────
  if (info.type === 'chromeos') {
    tips.push({
      icon: '💻',
      titre: 'Chromebook — volume système',
      desc: 'Utilisez les touches de volume sur le clavier (ou la barre de tâches) pour régler le volume. Si le son ne sort pas, cliquez sur l\'icône son en bas à droite et vérifiez le périphérique sélectionné.',
    });
    tips.push({
      icon: '🖥️',
      titre: 'Chromebook sur projecteur',
      desc: 'Appuyez sur Maj + Recherche + Volume pour afficher les options audio. Si vous utilisez un projecteur HDMI, sélectionnez « HDMI » dans les paramètres son.',
    });
  }

  // ── Linux desktop ─────────────────────────────────────────────────────────
  if (info.type === 'linux') {
    tips.push({
      icon: '🐧',
      titre: 'Linux — TTS et voix françaises',
      desc: 'La synthèse vocale sur Linux nécessite espeak-ng ou festival avec les voix françaises. Installez : sudo apt install espeak-ng language-pack-fr (Ubuntu/Debian). Firefox utilise les voix système.',
    });
    tips.push({
      icon: '🔊',
      titre: 'Linux — sortie audio',
      desc: 'Si le son ne sort pas, vérifiez PulseAudio ou PipeWire : ouvrez pavucontrol et vérifiez que le bon périphérique est sélectionné et non muté.',
    });
  }

  // ── Smart TV ──────────────────────────────────────────────────────────────
  if (info.type === 'tv') {
    tips.push({
      icon: '📺',
      titre: 'Smart TV — synthèse vocale limitée',
      desc: 'La plupart des Smart TV (Samsung Tizen, LG webOS, AndroidTV, FireTV) ont une synthèse vocale très limitée ou absente dans le navigateur. Si la voix ne fonctionne pas, désactivez le son dans les paramètres et utilisez les boutons ◀ ▶ pour avancer manuellement.',
    });
    tips.push({
      icon: '🔊',
      titre: 'TV — volume et sortie audio',
      desc: 'Utilisez la télécommande pour régler le volume. Si vous avez une barre de son ou un ampli home cinéma branché en HDMI ARC/eARC, assurez-vous qu\'il est allumé et que l\'entrée correcte est sélectionnée.',
    });
    tips.push({
      icon: '🎬',
      titre: 'TV 4K / HDR / Home cinéma',
      desc: 'Sur un écran 4K ou un système home cinéma, le signal audio passe par HDMI ARC (port marqué ARC sur la TV). Si le son sort par les haut-parleurs TV au lieu du home cinéma, allez dans Paramètres → Son → Sortie audio → Système home cinéma.',
    });
  }

  // ── Voiture (CarPlay / Android Auto) ──────────────────────────────────────
  if (info.type === 'car') {
    tips.push({
      icon: '🚗',
      titre: 'Voiture — CarPlay / Android Auto',
      desc: 'Dans un véhicule, la synthèse vocale du navigateur peut être bloquée par le système audio de la voiture. Utilisez les boutons du volant ou de l\'écran central pour régler le volume multimédia (distinct du volume d\'appel).',
    });
    tips.push({
      icon: '🔇',
      titre: 'Voiture — micro et assistant vocal',
      desc: 'Sur certains véhicules, l\'assistant vocal intégré (Siri/Google Assistant via CarPlay/Android Auto) peut entrer en conflit avec la lecture vocale. Désactivez l\'assistant ou baissez le volume du micro.',
    });
  }

  // ── Grand écran universel (HD/4K/cinéma) ──────────────────────────────────
  if (info.isLargeScreen && info.type !== 'tv' && info.type !== 'windows' && info.type !== 'mac') {
    tips.push({
      icon: '🖥️',
      titre: 'Grand écran HD / 4K',
      desc: 'Sur un écran de grande taille, vérifiez que la sortie audio est bien redirigée vers les haut-parleurs actifs (système home cinéma, barre de son, ou haut-parleurs du moniteur).',
    });
  }

  // ── Conseil universel haut-parleurs Bluetooth ─────────────────────────────
  tips.push({
    icon: '📡',
    titre: 'Haut-parleur Bluetooth',
    desc: 'Si vous utilisez une enceinte Bluetooth, assurez-vous qu\'elle est bien connectée AVANT d\'ouvrir la page. Reconnecter en cours de lecture peut couper le son.',
  });

  // ── Conseil projecteur universel ──────────────────────────────────────────
  if (info.type !== 'tv' && info.type !== 'car') {
    tips.push({
      icon: '📽️',
      titre: 'Utilisation en classe avec projecteur',
      desc: 'Branchez le câble HDMI avant de lancer la lecture. Réglez le volume du navigateur au maximum et ajustez ensuite sur le projecteur/ampli de la salle. Le Mode Classe agrandit le texte et monte le volume pour une meilleure lisibilité.',
    });
  }

  return tips;
}
