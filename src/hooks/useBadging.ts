// App Badging API — affiche le nombre de flashcards à réviser sur l'icône PWA
// Support : Chrome 81+ Android/Desktop, Edge 81+ ; ignoré silencieusement ailleurs.
import { useEffect } from 'react';

type NavigatorBadge = {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

/**
 * Met à jour le badge de l'icône d'application avec un compteur.
 * - count > 0 → affiche le chiffre
 * - count === 0 → efface le badge
 * - API indisponible → no-op silencieux
 */
export function useBadging(count: number): void {
  useEffect(() => {
    const nav = navigator as NavigatorBadge;
    if (!nav.setAppBadge || !nav.clearAppBadge) return;

    if (count > 0) {
      nav.setAppBadge(count).catch(() => {/* permission refusée — silencieux */});
    } else {
      nav.clearAppBadge().catch(() => {});
    }
  }, [count]);
}
