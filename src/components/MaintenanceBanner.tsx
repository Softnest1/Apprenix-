/**
 * MaintenanceBanner — bandeau de maintenance configurable
 *
 * Activé automatiquement si VITE_MAINTENANCE_MSG est défini dans .env
 * Exemple : VITE_MAINTENANCE_MSG="Maintenance prévue ce soir 22h–23h"
 *
 * Aucune intervention dans le code nécessaire — juste définir la variable
 * et redéployer. Le bandeau disparaît dès que la variable est supprimée.
 */

import { X, Wrench } from 'lucide-react';
import React, { useState } from 'react';

const MSG = import.meta.env.VITE_MAINTENANCE_MSG as string | undefined;

const MaintenanceBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (!MSG || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Avis de maintenance"
      className="relative z-[9100] flex items-center justify-between gap-3 px-4 py-2.5 md:px-6 bg-warning text-warning-foreground"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Wrench className="w-4 h-4 shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium text-pretty min-w-0">{MSG}</p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Fermer le bandeau de maintenance"
        className="shrink-0 rounded p-0.5 opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-foreground"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MaintenanceBanner;
