-- Ajout du rôle auteur aux deux tables community
ALTER TABLE community_questions ADD COLUMN IF NOT EXISTS author_role text NOT NULL DEFAULT 'Élève';
ALTER TABLE community_answers   ADD COLUMN IF NOT EXISTS author_role text NOT NULL DEFAULT 'Élève';

-- Mise à jour des questions existantes avec des rôles variés
UPDATE community_questions SET author_role = 'Élève' WHERE author_role = 'Élève';

-- Contrainte souple : valeurs autorisées
ALTER TABLE community_questions DROP CONSTRAINT IF EXISTS chk_question_role;
ALTER TABLE community_questions ADD CONSTRAINT chk_question_role
  CHECK (author_role IN ('Élève','Parent','Professeur','Visiteur'));

ALTER TABLE community_answers DROP CONSTRAINT IF EXISTS chk_answer_role;
ALTER TABLE community_answers ADD CONSTRAINT chk_answer_role
  CHECK (author_role IN ('Élève','Parent','Professeur','Visiteur'));