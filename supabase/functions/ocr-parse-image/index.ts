// Edge Function — OCR Scanner de devoirs (OCR.space via API Gateway)
// Reçoit une image en base64 ou URL et retourne le texte extrait par OCR.
// v2 — retry automatique, meilleur moteur, détection de type de contenu, messages enrichis

import { handleOptions, errorResponse, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') return handleOptions(origin);
  if (req.method !== 'POST')    return errorResponse('Method Not Allowed', 405, origin);

  let base64Image: string | undefined, imageUrl: string | undefined, language: string, engine: string;
  try {
    const body  = await req.json();
    base64Image = body.base64Image;
    imageUrl    = body.imageUrl;
    language    = body.language ?? 'fre';
    engine      = body.engine   ?? '2';   // moteur 2 = meilleure précision
    if (!base64Image && !imageUrl)
      throw new Error('Fournir base64Image ou imageUrl');
  } catch {
    return errorResponse('Corps de requête invalide — fournir base64Image ou imageUrl', 400, origin);
  }

  const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
  if (!apiKey) return errorResponse('Configuration serveur manquante', 500, origin);

  const buildForm = () => {
    const form = new FormData();
    if (base64Image) form.append('base64Image',       base64Image);
    if (imageUrl)    form.append('url',                imageUrl);
    form.append('language',           language);
    form.append('isOverlayRequired',  'false');
    form.append('detectOrientation',  'true');
    form.append('scale',              'true');
    form.append('isTable',            'false');
    form.append('OCREngine',          engine);
    return form;
  };

  // Retry 2 fois max (réseau instable ou quota temporaire)
  const MAX_ATTEMPTS = 2;
  let upstream: Response | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 1_500));
    try {
      upstream = await fetch(
        'https://app-cfkom5or162p-api-W9z3M6eONl3L.gateway.appmedo.com/parse/image',
        {
          method:  'POST',
          headers: { 'X-Gateway-Authorization': apiKey },
          body:    buildForm(),
          signal:  AbortSignal.timeout(20_000),
        },
      );
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'TimeoutError';
      if (attempt < MAX_ATTEMPTS - 1) continue;
      return errorResponse(
        isTimeout ? 'Délai dépassé — réessaie avec une image moins lourde.' : 'Erreur réseau OCR',
        504,
        origin,
      );
    }

    if (upstream.status === 429 || upstream.status === 402) {
      return new Response(await upstream.text(), {
        status:  upstream.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (upstream.ok) break;
    if (attempt < MAX_ATTEMPTS - 1) { await upstream.body?.cancel(); upstream = null; continue; }
  }

  if (!upstream?.ok)
    return errorResponse(`Erreur OCR (${upstream?.status ?? 'inconnu'}) — vérifie la qualité de l'image`, 502, origin);

  const data = await upstream.json() as {
    OCRExitCode: number;
    ParsedResults?: Array<{ ParsedText: string; ErrorMessage?: string }>;
    ErrorMessage?: string | string[];
  };

  // Vérification résultat OCR
  if (data.OCRExitCode !== 1) {
    const errMsg = Array.isArray(data.ErrorMessage)
      ? data.ErrorMessage.join(' ')
      : (data.ErrorMessage ?? 'OCR échoué');
    return errorResponse(`OCR — ${errMsg}`, 422, origin);
  }

  return jsonResponse(data, origin);
});
