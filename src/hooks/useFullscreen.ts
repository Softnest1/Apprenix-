/**
 * useFullscreen — hook unifié plein écran
 *
 * Navigateurs supportés :
 *   ✅ Chrome / Edge / Opera (desktop + Android) — API standard + navigationUI:'hide'
 *   ✅ Firefox (desktop + Android) — API standard + préfixe moz (ancien Firefox)
 *   ✅ Safari macOS 16.4+ — API standard
 *   ✅ Samsung Internet — préfixe webkit
 *   ✅ Mi Browser (Xiaomi) — préfixe webkit / Blink
 *   ✅ UC Browser — préfixe webkit
 *   ✅ iOS Safari — CSS fallback (fixed inset-0 z-[9999])
 *   ✅ Projecteurs / TV 4K / grands écrans — document.documentElement fullscreen
 *   ✅ Mode sombre Tailwind (class-based) — .dark reste sur <html>, toujours ancêtre
 *
 * Stratégie :
 *   1. Fullscreen TOUJOURS sur document.documentElement → pas de fond noir, thème OK
 *   2. navigationUI:'hide' → masque l'UI du navigateur sur mobile/tablette
 *   3. Fallback CSS (iOS/iframe sans permission) → fixed inset-0, géré dans le composant
 *   4. Sync via fullscreenchange + Échap
 */

import { RefObject, useCallback, useEffect, useState } from 'react';

type FullscreenElement = Element & {
  webkitRequestFullscreen?: (options?: { navigationUI?: 'hide' | 'show' | 'auto' }) => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
};

/** Retourne true si le navigateur supporte l'API native Fullscreen */
function supportsNativeFullscreen(): boolean {
  const doc = document as FullscreenDocument;
  const el  = document.documentElement as FullscreenElement;
  const hasRequest = !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  );
  const hasExit = !!(
    typeof doc.exitFullscreen === 'function' ||
    typeof doc.webkitExitFullscreen === 'function' ||
    typeof doc.mozCancelFullScreen === 'function' ||
    typeof doc.msExitFullscreen === 'function'
  );
  return hasRequest && hasExit;
}

/** Retourne l'élément actuellement en plein écran (cross-browser) */
function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

/** Demande le plein écran natif sur un élément (cross-browser + navigationUI) */
async function requestNativeFullscreen(el: FullscreenElement): Promise<void> {
  // navigationUI:'hide' masque la barre du navigateur sur mobile/tablette
  // (Android Chrome, Samsung Internet, Mi Browser, Firefox Android…)
  const opts = { navigationUI: 'hide' as const };
  if (el.requestFullscreen) {
    await el.requestFullscreen(opts);
  } else if (el.webkitRequestFullscreen) {
    // Safari macOS, Samsung Internet, Mi/UC Browser, anciens Chrome
    await el.webkitRequestFullscreen(opts);
  } else if (el.mozRequestFullScreen) {
    // Firefox < 64
    await el.mozRequestFullScreen();
  } else if (el.msRequestFullscreen) {
    // IE 11 / Edge Legacy
    await el.msRequestFullscreen();
  }
}

/** Quitte le plein écran natif (cross-browser) */
async function exitNativeFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (doc.exitFullscreen) {
    await doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    await doc.mozCancelFullScreen();
  } else if (doc.msExitFullscreen) {
    await doc.msExitFullscreen();
  }
}

interface UseFullscreenOptions {
  /** Élément cible pour requestFullscreen — défaut : document.documentElement */
  targetRef?: RefObject<Element | null>;
  /** Callback appelé quand l'état change */
  onChange?: (isFullscreen: boolean) => void;
}

interface UseFullscreenReturn {
  isFullscreen: boolean;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
  /** true si le navigateur supporte l'API native (false sur iOS Safari) */
  nativeSupported: boolean;
}

export function useFullscreen(options: UseFullscreenOptions = {}): UseFullscreenReturn {
  const { targetRef, onChange } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const nativeSupported = supportsNativeFullscreen();

  // Synchronise l'état avec l'événement fullscreenchange du navigateur
  // (ex : l'utilisateur presse Échap → le navigateur quitte le plein écran natif)
  useEffect(() => {
    const handleChange = () => {
      const active = !!getFullscreenElement();
      setIsFullscreen(active);
      onChange?.(active);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    document.addEventListener('mozfullscreenchange', handleChange);
    document.addEventListener('MSFullscreenChange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
      document.removeEventListener('mozfullscreenchange', handleChange);
      document.removeEventListener('MSFullscreenChange', handleChange);
    };
  }, [onChange]);

  // Touche Échap : quitter le plein écran CSS (fallback iOS / sans API native)
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        onChange?.(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onChange]);

  const enterFullscreen = useCallback(() => {
    // Toujours fullscreener document.documentElement — pas le container div.
    // Raisons :
    //   1. Évite le fond noir du navigateur mobile (Android Chrome) autour
    //      d'un élément partiel mis en plein écran.
    //   2. Garde la classe `.dark` sur <html> comme ancêtre → Tailwind OK.
    //   3. Compatible avec tous les navigateurs desktop et mobile.
    const target = document.documentElement;
    if (nativeSupported) {
      requestNativeFullscreen(target as FullscreenElement).catch(() => {
        // Fallback CSS si l'API est bloquée (ex : iframe sans permission)
        setIsFullscreen(true);
        onChange?.(true);
      });
    } else {
      // iOS Safari : CSS uniquement
      setIsFullscreen(true);
      onChange?.(true);
    }
  }, [nativeSupported, onChange]);

  const exitFullscreen = useCallback(() => {
    if (nativeSupported && getFullscreenElement()) {
      exitNativeFullscreen().catch(() => {
        setIsFullscreen(false);
        onChange?.(false);
      });
    } else {
      setIsFullscreen(false);
      onChange?.(false);
    }
  }, [nativeSupported, onChange]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen, nativeSupported };
}
