/**
 * StatusPage — /status
 * Tableau de bord de santé : services internes + moniteur UptimeRobot en temps réel.
 */

import { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import {
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock,
  Wifi, WifiOff, TrendingUp, Activity, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceStatus = 'checking' | 'ok' | 'degraded' | 'down';

interface ServiceCheck {
  name: string;
  description: string;
  status: ServiceStatus;
  latency?: number;
  detail?: string;
}

interface UptimeMonitor {
  id: number;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded' | 'paused' | 'not_checked' | 'unknown';
  statusCode: number;
  interval: number;
  uptime: { allTime: number; last7d: number; last30d: number };
  avgResponseMs: number;
  responseTimes: Array<{ value: number; datetime: number }>;
  recentLogs: Array<{ type: string; datetime: number; duration: number }>;
}

interface UptimeData {
  status: 'up' | 'down' | 'degraded';
  monitors: UptimeMonitor[];
  fetchedAt: string;
}

// ─── Checks internes ──────────────────────────────────────────────────────────

async function checkSupabaseDB(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const latency = Date.now() - start;
    if (error) throw error;
    return { name: 'Base de données', description: 'Supabase PostgreSQL', status: latency < 800 ? 'ok' : 'degraded', latency };
  } catch {
    return { name: 'Base de données', description: 'Supabase PostgreSQL', status: 'down', detail: 'Connexion impossible' };
  }
}

async function checkSupabaseAuth(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latency = Date.now() - start;
    if (error) throw error;
    return { name: 'Authentification', description: 'Supabase Auth', status: latency < 800 ? 'ok' : 'degraded', latency };
  } catch {
    return { name: 'Authentification', description: 'Supabase Auth', status: 'down', detail: 'Service indisponible' };
  }
}

async function checkInternet(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const res = await fetch('https://dns.google/resolve?name=apprenix.xyz', { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    const latency = Date.now() - start;
    return { name: 'Connectivité réseau', description: 'Accès Internet', status: res.ok ? 'ok' : 'degraded', latency };
  } catch {
    return { name: 'Connectivité réseau', description: 'Accès Internet', status: 'down', detail: 'Hors ligne ou DNS inaccessible' };
  }
}

function checkBuild(): ServiceCheck {
  const version = import.meta.env.VITE_APP_VERSION as string | undefined;
  const appId   = import.meta.env.VITE_APP_ID as string | undefined;
  return {
    name: 'Application',
    description: 'Build React/Vite',
    status: 'ok',
    detail: [version && `v${version}`, appId].filter(Boolean).join(' · ') || 'Déployée',
  };
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  checking: { label: 'Vérification…', color: 'bg-muted text-muted-foreground',          icon: RefreshCw   },
  ok:       { label: 'Opérationnel',  color: 'bg-success/15 text-success',              icon: CheckCircle },
  degraded: { label: 'Ralenti',       color: 'bg-warning/15 text-warning',              icon: AlertTriangle },
  down:     { label: 'Hors service',  color: 'bg-destructive/15 text-destructive',      icon: XCircle     },
};

const UPTIME_STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  up:          { label: 'En ligne',      color: 'bg-success/15 text-success',         dot: 'bg-success'     },
  degraded:    { label: 'Ralenti',       color: 'bg-warning/15 text-warning',         dot: 'bg-warning'     },
  down:        { label: 'Hors ligne',    color: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
  paused:      { label: 'En pause',      color: 'bg-muted text-muted-foreground',     dot: 'bg-muted-foreground' },
  not_checked: { label: 'Non vérifié',   color: 'bg-muted text-muted-foreground',     dot: 'bg-muted-foreground' },
  unknown:     { label: 'Inconnu',       color: 'bg-muted text-muted-foreground',     dot: 'bg-muted-foreground' },
};

function globalStatus(checks: ServiceCheck[]): ServiceStatus {
  if (checks.some(c => c.status === 'checking')) return 'checking';
  if (checks.some(c => c.status === 'down'))     return 'down';
  if (checks.some(c => c.status === 'degraded')) return 'degraded';
  return 'ok';
}

const GLOBAL_LABELS: Record<ServiceStatus, { label: string; sub: string; bg: string }> = {
  checking: { label: 'Vérification en cours…',             sub: 'Connexion aux services…',                           bg: 'bg-muted'        },
  ok:       { label: 'Tous les systèmes sont opérationnels', sub: 'Apprenix fonctionne normalement 🎉',              bg: 'bg-success'      },
  degraded: { label: 'Performances dégradées',              sub: 'Certains services sont lents',                     bg: 'bg-warning'      },
  down:     { label: 'Incident en cours',                   sub: 'Un ou plusieurs services sont indisponibles',      bg: 'bg-destructive'  },
};

function UptimeBar({ pct }: { pct: number }) {
  const color = pct >= 99 ? 'bg-success' : pct >= 95 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums shrink-0 text-foreground">{pct.toFixed(2)}%</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
  return `${Math.round(seconds / 3600)}h`;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function StatusPage() {
  const [checks, setChecks]       = useState<ServiceCheck[]>([]);
  const [uptimeData, setUptimeData] = useState<UptimeData | null>(null);
  const [uptimeError, setUptimeError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [loading, setLoading]     = useState(false);
  const isOnline = navigator.onLine;

  const run = async () => {
    setLoading(true);
    setChecks([
      { name: 'Base de données',     description: 'Supabase PostgreSQL', status: 'checking' },
      { name: 'Authentification',    description: 'Supabase Auth',       status: 'checking' },
      { name: 'Connectivité réseau', description: 'Accès Internet',      status: 'checking' },
      { name: 'Application',         description: 'Build React/Vite',    status: 'checking' },
    ]);

    // Checks internes + UptimeRobot en parallèle
    const [db, auth, net, uptimeRes] = await Promise.all([
      checkSupabaseDB(),
      checkSupabaseAuth(),
      checkInternet(),
      supabase.functions.invoke<UptimeData>('uptime-status', { method: 'GET' }),
    ]);

    const build = checkBuild();
    setChecks([db, auth, net, build]);

    if (uptimeRes.error) {
      const msg = await uptimeRes.error?.context?.text().catch(() => null);
      setUptimeError(msg ?? uptimeRes.error.message);
    } else {
      setUptimeData(uptimeRes.data);
      setUptimeError(null);
    }

    setLastCheck(new Date());
    setLoading(false);
  };

  useEffect(() => {
    void run();
    const id = setInterval(() => { void run(); }, 60_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overall = globalStatus(checks);
  const { label: gLabel, sub: gSub, bg: gBg } = GLOBAL_LABELS[overall];

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-8 space-y-5">
      <SEO
        title="État des services Apprenix — Statut en temps réel"
        canonical="/status"
        noIndex
      />

      {/* ── En-tête global ── */}
      <div className={`rounded-xl p-5 md:p-6 text-white ${gBg} transition-colors duration-500`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg md:text-xl font-bold text-balance">{gLabel}</h1>
            <p className="text-sm opacity-90 text-pretty">{gSub}</p>
          </div>
          {isOnline
            ? <Wifi className="w-6 h-6 shrink-0 opacity-80" aria-label="En ligne" />
            : <WifiOff className="w-6 h-6 shrink-0 opacity-80" aria-label="Hors ligne" />}
        </div>
        {lastCheck && (
          <p className="text-xs opacity-70 mt-3 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Dernière vérification : {lastCheck.toLocaleTimeString('fr-FR')} · Actualisation toutes les 60 s
          </p>
        )}
      </div>

      {/* ── Moniteur UptimeRobot ── */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            <CardTitle className="text-base font-semibold text-balance">Surveillance externe</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">UptimeRobot</Badge>
        </CardHeader>
        <CardContent>
          {uptimeError && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              Données indisponibles : {uptimeError}
            </p>
          )}
          {!uptimeData && !uptimeError && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Chargement…
            </div>
          )}
          {uptimeData && (
            <div className="space-y-4">
              {uptimeData.monitors.map(m => {
                const cfg = UPTIME_STATUS_CONFIG[m.status] ?? UPTIME_STATUS_CONFIG.unknown;
                const lastIncident = m.recentLogs.find(l => l.type === 'down');
                return (
                  <div key={m.id} className="space-y-3">
                    {/* Nom + statut */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.url} · Intervalle {m.interval / 60} min</p>
                        </div>
                      </div>
                      <Badge className={`shrink-0 text-xs font-medium border-0 ${cfg.color}`}>{cfg.label}</Badge>
                    </div>

                    {/* Métriques uptime */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: '7 jours', value: m.uptime.last7d },
                        { label: '30 jours', value: m.uptime.last30d },
                        { label: 'Tout temps', value: m.uptime.allTime },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-muted/40 rounded-lg p-2.5 space-y-1">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className={`text-sm font-bold tabular-nums ${value >= 99 ? 'text-success' : value >= 95 ? 'text-warning' : 'text-destructive'}`}>
                            {value.toFixed(2)}%
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Barre uptime 30j + temps de réponse */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Disponibilité 30 jours
                        </span>
                      </div>
                      <UptimeBar pct={m.uptime.last30d} />
                    </div>

                    {/* Temps de réponse moyen */}
                    {m.avgResponseMs > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="w-3.5 h-3.5 shrink-0" />
                        Temps de réponse moyen : <span className="font-medium text-foreground">{Math.round(m.avgResponseMs)} ms</span>
                      </div>
                    )}

                    {/* Dernier incident */}
                    {lastIncident && (
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-xs space-y-0.5">
                        <p className="font-medium text-destructive">Dernier incident</p>
                        <p className="text-muted-foreground">
                          {new Date(lastIncident.datetime * 1000).toLocaleString('fr-FR')}
                          {lastIncident.duration > 0 && ` · Durée : ${formatDuration(lastIncident.duration)}`}
                        </p>
                      </div>
                    )}
                    {!lastIncident && m.status === 'up' && (
                      <p className="text-xs text-success flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        Aucun incident récent détecté
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Services internes ── */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-balance">Services internes</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { void run(); }}
            disabled={loading}
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((c) => {
            const cfg = STATUS_CONFIG[c.status];
            const Icon = cfg.icon;
            return (
              <div
                key={c.name}
                className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      c.status === 'checking'  ? 'animate-spin text-muted-foreground' :
                      c.status === 'ok'        ? 'text-success' :
                      c.status === 'degraded'  ? 'text-warning' :
                                                 'text-destructive'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.detail ?? c.description}
                      {c.latency !== undefined && ` · ${c.latency} ms`}
                    </p>
                  </div>
                </div>
                <Badge className={`shrink-0 text-xs font-medium border-0 ${cfg.color}`}>
                  {cfg.label}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Footer ── */}
      <p className="text-center text-xs text-muted-foreground">
        Apprenix · Plateforme éducative 100 % gratuite ·{' '}
        <a href="/" className="underline hover:text-foreground transition-colors">Retour à l'accueil</a>
      </p>
    </div>
  );
}

