-- Nettoyage et ré-insertion propre avec rôles
TRUNCATE community_answers;
TRUNCATE community_questions CASCADE;

INSERT INTO community_questions (title, description, subject, level, author_name, author_role, tags) VALUES
-- Élèves
('Comment mémoriser les tables de multiplication efficacement ?',
 'J''ai du mal à retenir les tables de 7 et de 8. Quelqu''un a une technique mnémotechnique ?',
 'Maths','Primaire CM2','Lucas M.','Élève',ARRAY['mémoire','tables','astuces']),

('La règle du participe passé avec avoir — je n''y comprends rien',
 'Quand est-ce qu''on accorde le participe passé avec l''auxiliaire avoir ? Mon prof dit "avec le COD placé avant" mais je ne comprends pas ce que ça veut dire concrètement.',
 'Français','Collège 3e','Emma D.','Élève',ARRAY['conjugaison','participe passé','accord']),

('Quelqu''un peut m''expliquer la photosynthèse simplement ?',
 'J''ai mon DS de SVT demain et je ne comprends pas pourquoi les plantes ont besoin de lumière.',
 'SVT','Collège 5e','Théo B.','Élève',ARRAY['photosynthèse','SVT','révision']),

('Comment trouver l''antécédent d''un pronom relatif ?',
 'Dans la phrase "Le livre que j''ai lu était fascinant", c''est quoi l''antécédent de "que" ?',
 'Français','Collège 4e','Chloé R.','Élève',ARRAY['grammaire','pronom relatif','antécédent']),

('Différence entre vitesse et accélération ?',
 'Je confonds toujours vitesse et accélération. En quoi sont-elles différentes ? Avec un exemple concret svp.',
 'Physique','Lycée 2nde','Nathan P.','Élève',ARRAY['cinématique','vitesse','accélération']),

('Comment rédiger une bonne intro de dissert philo ?',
 'Mon prof dit que mon accroche est trop banale. Comment trouver une bonne accroche pour une dissertation de philo ?',
 'Philosophie','Lycée Terminale','Sarah L.','Élève',ARRAY['dissertation','introduction','bac']),

('Conseils pour réviser le bac de Maths ?',
 'J''ai 6 semaines avant le bac de terminale spécialité Maths. Par quoi commencer ? Suites, intégrales, probabilités ?',
 'Maths','Lycée Terminale','Antoine V.','Élève',ARRAY['bac','révision','méthode']),

('Le preterit et le present perfect en anglais — différence ?',
 'Je n''arrive pas à choisir entre "I saw" et "I have seen". Comment savoir lequel utiliser ?',
 'Anglais','Lycée 1ère','Manon C.','Élève',ARRAY['grammaire anglaise','prétérit','present perfect']),

-- Professeurs
('Ressources pédagogiques pour enseigner la Révolution française au collège',
 'Bonjour à tous, je cherche des ressources interactives et des activités engageantes pour enseigner 1789 en 4e. Avez-vous des recommandations ?',
 'Histoire','Collège 4e','Prof. Arnaud G.','Professeur',ARRAY['pédagogie','ressources','Révolution française']),

('Comment motiver des élèves décrocheurs en Maths ?',
 'J''ai une classe de 3e avec plusieurs élèves en grande difficulté et démotivés. Quelles stratégies avez-vous testées ? La différenciation pédagogique, les groupes de niveau ?',
 'Maths','Collège 3e','Mme Fontaine','Professeur',ARRAY['motivation','décrochage','différenciation']),

('Partage de séquence pédagogique sur le roman policier (3e)',
 'Je partage ma séquence sur le roman policier avec Agatha Christie et Simenon. 8 séances, lecture analytique + écriture. Qui veut l''échanger contre une autre séquence ?',
 'Français','Collège 3e','M. Lecomte','Professeur',ARRAY['séquence','roman policier','partage']),

('Quels outils numériques utilisez-vous en classe ?',
 'Je cherche à intégrer plus d''outils numériques dans mes cours de Physique-Chimie. Vous utilisez quoi en dehors du tableau blanc interactif ?',
 'Physique','Lycée 1ère','Prof. Caron','Professeur',ARRAY['numérique','outils','classe']),

-- Parents
('Mon fils de CM2 refuse de faire ses devoirs — comment l''aider ?',
 'Mon fils de 10 ans fait une crise dès qu''il faut faire les devoirs. Il n''est pas en difficulté scolaire mais il dit que c''est "inutile". Comment créer une routine positive ?',
 'Autres','Primaire CM2','Marie-Hélène T.','Parent',ARRAY['devoirs','routine','motivation']),

('Accompagner son enfant dyslexique au collège — vos conseils ?',
 'Ma fille vient d''être diagnostiquée dyslexique en 6e. L''école propose un PAP mais je ne sais pas comment l''aider à la maison. Des parents avec expérience ?',
 'Français','Collège 6e','Patrick D.','Parent',ARRAY['dyslexie','PAP','accompagnement']),

('Quelle est la différence entre le Brevet et le DNB ?',
 'Mon fils passe ses examens en fin d''année. J''entends parler du Brevet et du DNB — c''est la même chose ou pas ?',
 'Autres','Collège 3e','Sylvie M.','Parent',ARRAY['brevet','DNB','examens']),

('Comment parler des réseaux sociaux avec son ado — conseils d''autres parents ?',
 'Ma fille de 14 ans passe beaucoup de temps sur TikTok au détriment de ses révisions. Comment gérez-vous ça chez vous ? Interdiction totale ou accord ?',
 'Autres','Lycée 2nde','Frédéric B.','Parent',ARRAY['réseaux sociaux','ado','écrans']),

-- Visiteurs
('Est-ce qu''Apprenix est vraiment gratuit ?',
 'Je découvre ce site. Est-ce que toutes les fonctionnalités sont gratuites ? Y a-t-il un abonnement caché ?',
 'Autres','Tous niveaux','Visiteur curieux','Visiteur',ARRAY['apprenix','gratuit','fonctionnalités']),

('Comment fonctionne la section "Aide IA" ?',
 'J''ai vu qu''il y a une IA pour les devoirs. Comment ça marche exactement ? C''est fiable ?',
 'Autres','Tous niveaux','Un parent','Visiteur',ARRAY['aide IA','devoirs','fonctionnement']);

-- Insertion des réponses
INSERT INTO community_answers (question_id, author_name, author_role, author_level, content, upvotes)
SELECT q.id,
       'Emma — CM2' as author_name,
       'Élève' as author_role,
       'Primaire CM2' as author_level,
       'La technique des doigts pour les tables de 9 marche super bien ! Pour les autres tables, j''utilise des chansons sur YouTube. La chaîne "Les Belles Histoires" a des comptines pour les tables.' as content,
       12 as upvotes
FROM community_questions q WHERE q.title ILIKE '%tables de multiplication%' LIMIT 1;

INSERT INTO community_answers (question_id, author_name, author_role, author_level, content, upvotes)
SELECT q.id, 'M. Lecomte', 'Professeur', 'Enseignant Français', 
'La règle est simple : si le COD est AVANT le verbe, on accorde. "Les livres que j''ai lus" → "lus" s''accorde avec "les livres" (COD placé avant). "J''ai lu des livres" → pas d''accord car le COD est après. Astuce : pose la question "quoi ?" avant le verbe. Si tu trouves une réponse, regarde si elle est avant → accord.',
18
FROM community_questions q WHERE q.title ILIKE '%participe passé%' LIMIT 1;

INSERT INTO community_answers (question_id, author_name, author_role, author_level, content, upvotes)
SELECT q.id, 'Mme Faure', 'Professeur', 'Enseignante SVT',
'La photosynthèse c''est simple : les plantes "mangent" la lumière du soleil ! Elles utilisent cette énergie lumineuse + l''eau des racines + le CO₂ de l''air pour fabriquer du sucre (leur nourriture) et rejettent de l''O₂. Sans lumière = pas d''énergie = pas de fabrication de sucre. C''est pour ça qu''une plante dans le noir finit par mourir.',
24
FROM community_questions q WHERE q.title ILIKE '%photosynthèse%' LIMIT 1;

INSERT INTO community_answers (question_id, author_name, author_role, author_level, content, upvotes)
SELECT q.id, 'Prof. Arnaud G.', 'Professeur', 'Enseignant Histoire-Géo',
'J''utilise Kahoot pour les quiz de révision, Padlet pour les travaux collaboratifs et Edpuzzle pour intégrer des questions dans des vidéos YouTube. Pour la Physique spécifiquement, PhET Interactive Simulations (Univ. Colorado) est excellent et gratuit.',
31
FROM community_questions q WHERE q.title ILIKE '%outils numériques%' LIMIT 1;

INSERT INTO community_answers (question_id, author_name, author_role, author_level, content, upvotes)
SELECT q.id, 'Caroline P.', 'Parent', 'Parent d''élève CM2',
'Ce qui a marché chez nous : heure fixe tous les jours (17h), même endroit, téléphone dans une autre pièce. On a aussi essayé le système de "devoirs d''abord, jeux après" avec un timer visible. La régularité est clé — au bout de 3 semaines c''est devenu une habitude.',
19
FROM community_questions q WHERE q.title ILIKE '%refuse de faire ses devoirs%' LIMIT 1;

INSERT INTO community_answers (question_id, author_name, author_role, author_level, content, upvotes)
SELECT q.id, 'Isabelle N.', 'Parent', 'Maman d''une ado dyslexique',
'Notre fille a eu un PAP en 6e aussi. Ce qui aide beaucoup : police OpenDyslexic sur l''ordinateur (disponible gratuitement), synthèse vocale pour les longs textes, et des cahiers avec interlignes larges. Les professeurs ont tous été compréhensifs une fois le PAP signé. Courage !',
27
FROM community_questions q WHERE q.title ILIKE '%dyslexique%' LIMIT 1;

INSERT INTO community_answers (question_id, author_name, author_role, author_level, content, upvotes)
SELECT q.id, 'L''équipe Apprenix', 'Professeur', 'Équipe Apprenix',
'Oui, Apprenix est 100% gratuit et sans pub ! Toutes les fonctionnalités — aide aux devoirs IA, flashcards, scanner, planning, communauté — sont accessibles sans abonnement. Notre mission est de rendre l''éducation accessible à tous.',
45
FROM community_questions q WHERE q.title ILIKE '%vraiment gratuit%' LIMIT 1;