
-- Educational content tables (prefixed edu_ to avoid conflicts)
CREATE TABLE edu_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  reponse text NOT NULL,
  matiere text NOT NULL,
  niveau text NOT NULL DEFAULT 'Lycée',
  set_label text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_edu_quiz_matiere ON edu_quiz_questions(matiere);
CREATE INDEX idx_edu_quiz_niveau ON edu_quiz_questions(niveau);
CREATE INDEX idx_edu_quiz_set ON edu_quiz_questions(set_label);

CREATE TABLE edu_flashcard_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  matiere text NOT NULL,
  niveau text NOT NULL DEFAULT 'Lycée',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_edu_fp_matiere ON edu_flashcard_packs(matiere);
CREATE INDEX idx_edu_fp_niveau ON edu_flashcard_packs(niveau);

CREATE TABLE edu_flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  reponse text NOT NULL,
  pack_id uuid NOT NULL REFERENCES edu_flashcard_packs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_edu_fc_pack ON edu_flashcards(pack_id);

CREATE TABLE edu_fiches_methode (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  matiere text NOT NULL,
  niveau text NOT NULL DEFAULT 'Lycée',
  etapes jsonb NOT NULL DEFAULT '[]',
  conseil text,
  exemple text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_edu_fm_matiere ON edu_fiches_methode(matiere);
CREATE INDEX idx_edu_fm_niveau ON edu_fiches_methode(niveau);

-- RLS
ALTER TABLE edu_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_flashcard_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_fiches_methode ENABLE ROW LEVEL SECURITY;

-- Public read for all
CREATE POLICY "pub_read_quiz" ON edu_quiz_questions FOR SELECT USING (true);
CREATE POLICY "pub_read_fp" ON edu_flashcard_packs FOR SELECT USING (true);
CREATE POLICY "pub_read_fc" ON edu_flashcards FOR SELECT USING (true);
CREATE POLICY "pub_read_fm" ON edu_fiches_methode FOR SELECT USING (true);

-- Authenticated insert
CREATE POLICY "auth_ins_quiz" ON edu_quiz_questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_ins_fp" ON edu_flashcard_packs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_ins_fc" ON edu_flashcards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_ins_fm" ON edu_fiches_methode FOR INSERT TO authenticated WITH CHECK (true);
