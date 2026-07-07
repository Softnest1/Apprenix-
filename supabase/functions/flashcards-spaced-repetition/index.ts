// Edge Function — flashcards-spaced-repetition
// Calcule la prochaine date de révision selon l'algorithme SM-2 (corrigé v2)
// + streak de bonnes réponses + données enrichies retournées.
// Body: { flashcard_id: string, grade: 0|1|2|3|4|5 }

import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleOptions, errorResponse, jsonResponse } from '../_shared/cors.ts';

/**
 * Algorithme SM-2 — formule officielle corrigée
 * interval dépend du reviewCount APRÈS cette révision, pas avant.
 */
function sm2(
  grade: number,
  easeFactor: number,
  reviewCount: number,
  prevInterval: number,
): { interval: number; easeFactor: number } {
  let ef = easeFactor;
  let interval: number;

  if (grade < 3) {
    // Réponse incorrecte → recommencer depuis 1 jour, EF diminue
    interval = 1;
    ef = Math.max(1.3, ef - 0.2);
  } else {
    // Réponse correcte → EF ajusté selon la qualité
    ef = Math.max(1.3, ef + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (reviewCount === 0)      interval = 1;
    else if (reviewCount === 1) interval = 6;
    else                        interval = Math.round(prevInterval * ef);
  }

  return { interval, easeFactor: Math.round(ef * 100) / 100 };
}

/** Emoji de performance basé sur la note */
function perfEmoji(grade: number): string {
  if (grade === 5) return '🏆';
  if (grade === 4) return '⭐';
  if (grade === 3) return '✅';
  if (grade === 2) return '🔄';
  return '❌';
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') return handleOptions(origin);
  if (req.method !== 'POST')    return errorResponse('Méthode non autorisée', 405, origin);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer '))
    return errorResponse('Non autorisé', 401, origin);

  const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
  const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnon    = Deno.env.get('SUPABASE_ANON_KEY')!;
  const token           = authHeader.replace('Bearer ', '');

  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return errorResponse('Token invalide', 401, origin);

  try {
    const { flashcard_id, grade } = await req.json();
    if (!flashcard_id || grade === undefined) throw new Error('Paramètres manquants');
    if (grade < 0 || grade > 5)              throw new Error('Grade doit être entre 0 et 5');

    const adminClient = createClient(supabaseUrl, supabaseService);

    const { data: card, error: fetchErr } = await adminClient
      .from('flashcards')
      .select('review_count, ease_factor, interval_days, streak, user_id')
      .eq('id', flashcard_id)
      .maybeSingle();

    if (fetchErr || !card) throw new Error('Flashcard introuvable');
    if (card.user_id !== user.id) throw new Error('Accès refusé');

    const prevInterval = Number(card.interval_days ?? 1);
    const { interval, easeFactor } = sm2(
      grade,
      Number(card.ease_factor),
      card.review_count,
      prevInterval,
    );

    // Streak : +1 si grade ≥ 3, reset à 0 sinon
    const newStreak = grade >= 3 ? (Number(card.streak ?? 0) + 1) : 0;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    const nextReviewStr = nextReview.toISOString().split('T')[0];

    await adminClient.from('flashcards').update({
      ease_factor:   easeFactor,
      review_count:  card.review_count + 1,
      interval_days: interval,
      streak:        newStreak,
      next_review:   nextReviewStr,
    }).eq('id', flashcard_id);

    return jsonResponse({
      success:            true,
      next_review:        nextReviewStr,
      interval_days:      interval,
      ease_factor:        easeFactor,
      streak:             newStreak,
      performance_emoji:  perfEmoji(grade),
      message:            grade >= 3
        ? `Bravo ! Prochaine révision dans ${interval} jour${interval > 1 ? 's' : ''}.`
        : `Continue ! On va revoir ça demain pour mieux mémoriser.`,
    }, origin);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return errorResponse(msg, 500, origin);
  }
});
