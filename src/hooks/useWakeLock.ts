// Screen Wake Lock API — empêche l'écran de s'éteindre pendant une session focus
// Support : Chrome 84+, Edge 84+, Safari 16.4+ ; ignoré silencieusement ailleurs.
import { useCallback, useEffect, useRef, useState } from 'react';

interface WakeLockSentinel {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

type NavigatorWakeLock = {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
};

export interface UseWakeLockReturn {
  /** true si le verrou écran est actif */
  isActive: boolean;
  /** true si l'API est supportée */
  isSupported: boolean;
  /** Acquérir le verrou écran */
  acquire: () => Promise<void>;
  /** Libérer le verrou écran */
  release: () => Promise<void>;
}

/**
 * Gère le Screen Wake Lock pour maintenir l'écran allumé.
 * Re-acquiert automatiquement le verrou si la page redevient visible
 * (ex : retour depuis l'onglet en arrière-plan) quand `active` est true.
 */
export function useWakeLock(): UseWakeLockReturn {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const [isActive, setIsActive] = useState(false);
  const nav = navigator as NavigatorWakeLock;
  const isSupported = !!nav.wakeLock;

  const acquire = useCallback(async () => {
    if (!nav.wakeLock) return;
    try {
      sentinelRef.current = await nav.wakeLock.request('screen');
      setIsActive(true);
      sentinelRef.current.addEventListener('release', () => {
        setIsActive(false);
        sentinelRef.current = null;
      });
    } catch {
      // Peut échouer si la page n'est pas visible ou si l'utilisateur refuse
    }
  }, [nav.wakeLock]);

  const release = useCallback(async () => {
    if (sentinelRef.current && !sentinelRef.current.released) {
      await sentinelRef.current.release();
      sentinelRef.current = null;
      setIsActive(false);
    }
  }, []);

  // Re-acquérir automatiquement quand la page redevient visible
  useEffect(() => {
    if (!isActive) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isActive, acquire]);

  // Libérer proprement au démontage
  useEffect(() => () => { release(); }, [release]);

  return { isActive, isSupported, acquire, release };
}
