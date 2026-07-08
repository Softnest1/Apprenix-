// Hook partagé — gère le prompt d'installation PWA + état "déjà installé"
import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua))           return 'android';
  if (/windows|macintosh|linux/i.test(ua)) return 'desktop';
  return 'unknown';
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const DISMISS_KEY = 'apprenix:pwa-install-dismissed';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled]     = useState(isStandalone);
  const [dismissed, setDismissed]         = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1',
  );
  const [platform] = useState<Platform>(detectPlatform);

  useEffect(() => {
    // Capturer le prompt d'installation natif (Chrome/Edge/Android)
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // Écouter l'installation effective
    const onInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      localStorage.removeItem(DISMISS_KEY);
    };
    window.addEventListener('appinstalled', onInstalled);

    // Surveiller les changements de display-mode (standalone/WCO)
    const mqStandalone = window.matchMedia('(display-mode: standalone)');
    const mqWCO        = window.matchMedia('(display-mode: window-controls-overlay)');
    const onMqChange   = (e: MediaQueryListEvent) => {
      if (e.matches) { setIsInstalled(true); setInstallPrompt(null); }
    };
    mqStandalone.addEventListener('change', onMqChange);
    mqWCO.addEventListener('change', onMqChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      mqStandalone.removeEventListener('change', onMqChange);
      mqWCO.removeEventListener('change', onMqChange);
    };
  }, []);

  const triggerInstall = useCallback(
    async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
      if (!installPrompt) return 'unavailable';
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setIsInstalled(true);
      }
      return outcome;
    },
    [installPrompt],
  );

  const dismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, '1');
  }, []);

  return {
    installPrompt,
    isInstalled,
    dismissed,
    platform,
    canInstall: !!installPrompt && !isInstalled,
    triggerInstall,
    dismiss,
  };
}
