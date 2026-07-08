// Share Target API — récupère le contenu partagé depuis d'autres apps
// Quand l'utilisateur partage un texte/lien vers Apprenix depuis son téléphone,
// ce hook retourne les paramètres de partage et nettoie l'URL.
import { useEffect, useState } from 'react';

export interface SharedContent {
  title: string;
  text: string;
  url: string;
}

/**
 * Retourne le contenu partagé si la page a été ouverte via share_target.
 * Les paramètres GET (title, text, url) sont lus puis retirés de l'URL.
 */
export function useShareTarget(): SharedContent | null {
  const [shared, setShared] = useState<SharedContent | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') ?? '';
    const text  = params.get('text')  ?? '';
    const url   = params.get('url')   ?? '';

    if (!title && !text && !url) return;

    setShared({ title, text, url });

    // Retirer les paramètres de partage de l'URL sans rechargement
    params.delete('title');
    params.delete('text');
    params.delete('url');
    const clean = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', clean);
  }, []);

  return shared;
}
