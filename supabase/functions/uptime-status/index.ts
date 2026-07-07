/**
 * uptime-status — Edge Function proxy vers UptimeRobot API
 *
 * Expose les données UptimeRobot sans exposer la clé API côté client.
 * Retourne : statut des moniteurs, uptime global, temps de réponse, logs d'incidents.
 *
 * GET /functions/v1/uptime-status
 */

import { corsHeaders } from '../_shared/cors.ts';

const UPTIMEROBOT_API = 'https://api.uptimerobot.com/v2/getMonitors';

// Codes de statut UptimeRobot → lisible
const STATUS_LABEL: Record<number, string> = {
  0: 'paused',
  1: 'not_checked',
  2: 'up',
  8: 'seems_down',
  9: 'down',
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('UPTIMEROBOT_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'UPTIMEROBOT_API_KEY non configuré' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = new URLSearchParams({
      api_key:           apiKey,
      format:            'json',
      response_times:    '1',
      response_times_limit: '10',
      logs:              '1',
      logs_limit:        '5',
      all_time_uptime_ratio: '1',
      custom_uptime_ratios: '7-30',
    });

    const resp = await fetch(UPTIMEROBOT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
      body: body.toString(),
    });

    if (!resp.ok) throw new Error(`UptimeRobot HTTP ${resp.status}`);

    const raw = await resp.json() as {
      stat: string;
      monitors?: Array<{
        id: number;
        friendly_name: string;
        url: string;
        type: number;
        status: number;
        interval: number;
        all_time_uptime_ratio: string;
        custom_uptime_ratio: string;
        average_response_time: string;
        response_times?: Array<{ value: number; datetime: number }>;
        logs?: Array<{ type: number; datetime: number; duration: number; reason?: { code: string; detail: string } }>;
      }>;
    };

    if (raw.stat !== 'ok') throw new Error('UptimeRobot stat !== ok');

    // Transformer en format propre
    const monitors = (raw.monitors ?? []).map(m => {
      const uptimeRatios = (m.custom_uptime_ratio ?? '').split('-');
      return {
        id:            m.id,
        name:          m.friendly_name,
        url:           m.url,
        status:        STATUS_LABEL[m.status] ?? 'unknown',
        statusCode:    m.status,
        interval:      m.interval,
        uptime: {
          allTime: parseFloat(m.all_time_uptime_ratio ?? '0'),
          last7d:  parseFloat(uptimeRatios[0] ?? '0'),
          last30d: parseFloat(uptimeRatios[1] ?? '0'),
        },
        avgResponseMs: parseFloat(m.average_response_time ?? '0'),
        responseTimes: (m.response_times ?? []).map(rt => ({
          value:    rt.value,
          datetime: rt.datetime,
        })),
        recentLogs: (m.logs ?? []).map(log => ({
          type:     log.type === 1 ? 'down' : log.type === 2 ? 'up' : 'other',
          datetime: log.datetime,
          duration: log.duration,
          reason:   log.reason,
        })),
      };
    });

    const hasDown     = monitors.some(m => m.statusCode === 9);
    const hasSeemDown = monitors.some(m => m.statusCode === 8);
    const globalStatus = hasDown ? 'down' : hasSeemDown ? 'degraded' : 'up';

    return new Response(
      JSON.stringify({
        status:    globalStatus,
        monitors,
        fetchedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30', // Cache 30 s côté CDN
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
