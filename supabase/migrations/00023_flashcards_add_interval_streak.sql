
-- Ajouter interval_days et streak aux flashcards si manquants
ALTER TABLE flashcards
  ADD COLUMN IF NOT EXISTS interval_days integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak        integer NOT NULL DEFAULT 0;

-- Commentaires
COMMENT ON COLUMN flashcards.interval_days IS 'Intervalle SM-2 actuel en jours';
COMMENT ON COLUMN flashcards.streak        IS 'Nombre de bonnes réponses consécutives';
