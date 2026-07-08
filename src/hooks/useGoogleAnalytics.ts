/**
 * useGoogleAnalytics — chargement GA4 respectueux du consentement RGPD/CNIL
 *
 * - Ne charge gtag.js QUE si l'utilisateur a accepté les cookies analytics
 * - Écoute les changements de consentement en temps réel (accept / refuse)
 * - Respecte la recommandation CNIL : pas de tracking avant consentement explicite
 *
 * Usage : appelé une seule fois dans App.tsx
 */

import { useEffect } from 'react';
import { loadConsent } from '@/hooks/useCookieConsent';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function loadGtag(measurementId: string): void {
  if (document.getElementById('gtag-script')) return; // déjà chargé
  const script = document.createElement('script');
  script.id = 'gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,         // conformité RGPD
    allow_google_signals: false, // pas de publicité croisée
    allow_ad_personalization_signals: false,
  });
}

function disableGtag(measurementId: string): void {
  // Désactive la collecte sans retirer le script (évite les erreurs)
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = true;
}

export function useGoogleAnalytics(): void {
  useEffect(() => {
    if (!GA_ID) return; // pas de mesure configurée

    const consent = loadConsent();
    if (consent.categories.analytics) {
      loadGtag(GA_ID);
    }

    // Écoute les changements de consentement (acceptation / refus ultérieur)
    const handler = () => {
      const updated = loadConsent();
      if (updated.categories.analytics) {
        loadGtag(GA_ID!);
      } else {
        disableGtag(GA_ID!);
      }
    };

    window.addEventListener('apprenix:consent-updated', handler);
    return () => window.removeEventListener('apprenix:consent-updated', handler);
  }, []);
}
