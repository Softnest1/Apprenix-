INSERT INTO knowledge_base (subject, level, question_text, tags, answer_text, answer_steps, teacher_name, validated, quality_score) VALUES

-- ══ MATHS ══

('Maths','Primaire CE1',
 'Comment calculer une addition posée avec retenue (ex : 47 + 38) ?',
 ARRAY['addition','retenue','CE1','primaire'],
 'On pose l''addition en colonnes et on gère la retenue quand la somme dépasse 9.',
 '[{"step":1,"title":"Poser en colonnes","text":"Unités sous unités, dizaines sous dizaines. 47 + 38."},{"step":2,"title":"Additionner les unités","text":"7 + 8 = 15 → on écrit 5 et on retient 1."},{"step":3,"title":"Additionner les dizaines","text":"4 + 3 + 1 (retenue) = 8 → on écrit 8."},{"step":4,"title":"Résultat","text":"47 + 38 = 85. Vérification : 47 + 30 = 77, 77 + 8 = 85 ✓"}]',
 'Mme Dupuis — Professeure des écoles CE1', true, 5),

('Maths','Primaire CM2',
 'Comment calculer le périmètre et l''aire d''un rectangle ?',
 ARRAY['périmètre','aire','rectangle','CM2','géométrie'],
 'Le périmètre est la somme de tous les côtés. L''aire est la surface intérieure.',
 '[{"step":1,"title":"Périmètre","text":"P = 2 × (longueur + largeur). Ex : 8 cm × 5 cm → P = 2 × (8+5) = 26 cm."},{"step":2,"title":"Aire","text":"A = longueur × largeur. Ex : 8 × 5 = 40 cm²."},{"step":3,"title":"Unités","text":"Périmètre en cm, m. Aire en cm², m². Ne jamais confondre !"},{"step":4,"title":"Astuce","text":"Périmètre = faire le tour. Aire = remplir l''intérieur."}]',
 'M. Renard — Professeur des écoles CM2', true, 5),

('Maths','Collège 5e',
 'Comment calculer avec les fractions : addition, soustraction, multiplication ?',
 ARRAY['fractions','5e','collège','calcul'],
 'Pour additionner des fractions on met au même dénominateur. Pour multiplier on multiplie numérateur par numérateur.',
 '[{"step":1,"title":"Addition/Soustraction — même dénominateur","text":"1/4 + 2/4 = 3/4. On additionne seulement les numérateurs."},{"step":2,"title":"Addition — dénominateurs différents","text":"1/3 + 1/4 : PPCM(3,4)=12. → 4/12 + 3/12 = 7/12."},{"step":3,"title":"Multiplication","text":"(2/3) × (3/5) = (2×3)/(3×5) = 6/15 = 2/5."},{"step":4,"title":"Division","text":"(2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6."}]',
 'Mme Colin — Professeure de Maths 5e', true, 5),

('Maths','Collège 6e',
 'Qu''est-ce qu''un nombre premier ? Comment trouver les premiers nombres premiers ?',
 ARRAY['nombre premier','6e','collège','arithmétique'],
 'Un nombre premier est un entier ≥ 2 qui n''a que deux diviseurs : 1 et lui-même.',
 '[{"step":1,"title":"Définition","text":"Un nombre premier n''est divisible que par 1 et par lui-même."},{"step":2,"title":"Exemples","text":"2, 3, 5, 7, 11, 13, 17, 19, 23... Attention : 1 n''est PAS premier."},{"step":3,"title":"Test de primalité simple","text":"Pour tester n, diviser par tous les entiers jusqu''à √n. Si aucun ne divise n → premier."},{"step":4,"title":"Crible d''Ératosthène","text":"Liste les entiers, barre les multiples de 2, puis 3, puis 5... Les nombres restants sont premiers."}]',
 'M. Fabre — Professeur de Maths 6e', true, 5),

('Maths','Lycée 2nde',
 'Comment résoudre une inéquation du premier degré (ex : 3x − 5 > 7) ?',
 ARRAY['inéquation','1er degré','2nde','algèbre'],
 'On résout une inéquation comme une équation, SAUF qu''on inverse le signe quand on multiplie/divise par un négatif.',
 '[{"step":1,"title":"Isoler x","text":"3x − 5 > 7 → 3x > 12 → x > 4."},{"step":2,"title":"Règle clé","text":"Si on multiplie ou divise par un nombre NÉGATIF, on inverse le signe : > devient <."},{"step":3,"title":"Ex avec négatif","text":"−2x + 1 < 5 → −2x < 4 → x > −2 (signe inversé car ÷ par −2)."},{"step":4,"title":"Notation de l''ensemble solution","text":"x > 4 → S = ]4 ; +∞[. Représenter sur une droite numérique."}]',
 'Mme Berger — Professeure de Maths 2nde', true, 5),

('Maths','Lycée 1ère',
 'Comment calculer la dérivée d''une fonction composée f(g(x)) ?',
 ARRAY['dérivée','fonction composée','1ère','analyse'],
 'La dérivée d''une composée est (f∘g)''(x) = g''(x) × f''(g(x)).',
 '[{"step":1,"title":"Formule","text":"Si h(x) = f(g(x)), alors h''(x) = g''(x) × f''(g(x))."},{"step":2,"title":"Exemple : h(x) = (3x+1)⁵","text":"g(x) = 3x+1, f(u) = u⁵. g''=3, f''(u)=5u⁴. → h''(x) = 3 × 5(3x+1)⁴ = 15(3x+1)⁴."},{"step":3,"title":"Exemple : h(x) = sin(2x)","text":"g(x)=2x, f(u)=sin(u). g''=2, f''(u)=cos(u). → h''=2cos(2x)."},{"step":4,"title":"Exemple : h(x) = e^(x²)","text":"g(x)=x², f(u)=eᵘ. → h''(x)=2x·e^(x²)."}]',
 'M. Vidal — Professeur de Maths 1ère', true, 5),

('Maths','Supérieur Licence 2',
 'Qu''est-ce qu''une suite de Cauchy et pourquoi est-elle importante ?',
 ARRAY['suite Cauchy','convergence','analyse','licence'],
 'Une suite est de Cauchy si ses termes deviennent arbitrairement proches les uns des autres, indépendamment de la limite.',
 '[{"step":1,"title":"Définition","text":"(uₙ) est de Cauchy si : ∀ε>0, ∃N, ∀p,q≥N : |uₚ−uq|<ε."},{"step":2,"title":"Lien avec convergence","text":"Dans ℝ (ou tout espace complet) : suite convergente ⟺ suite de Cauchy."},{"step":3,"title":"Importance","text":"Permet de prouver qu''une suite converge SANS connaître sa limite a priori."},{"step":4,"title":"Contre-exemple dans ℚ","text":"La suite des décimales de √2 est de Cauchy dans ℚ, mais ne converge pas dans ℚ (√2 ∉ ℚ). → ℚ n''est pas complet."}]',
 'Prof. Moreau — MCF Maths Analyse', true, 5),

-- ══ FRANÇAIS ══

('Français','Primaire CM1',
 'Qu''est-ce qu''un adjectif qualificatif et comment l''accorder ?',
 ARRAY['adjectif','accord','CM1','grammaire','primaire'],
 'L''adjectif qualificatif s''accorde en genre et en nombre avec le nom qu''il accompagne.',
 '[{"step":1,"title":"Définition","text":"L''adjectif décrit le nom : une robe ROUGE, un chat NOIR."},{"step":2,"title":"Accord en genre","text":"Masculin → Féminin : on ajoute généralement un -e. Grand → grande. Beau → belle."},{"step":3,"title":"Accord en nombre","text":"Singulier → Pluriel : on ajoute -s. Petit → petits. Petite → petites."},{"step":4,"title":"Cas particuliers","text":"Adjectifs en -eux : heureux → heureuse. En -al : national → nationaux. En -eau : beau → belle → belles."}]',
 'Mme Simon — Professeure des écoles CM1', true, 5),

('Français','Collège 6e',
 'Qu''est-ce qu''un verbe à l''imparfait et comment le conjuguer (groupe 1) ?',
 ARRAY['conjugaison','imparfait','6e','collège','groupe 1'],
 'L''imparfait exprime une action passée qui durait. Terminaisons du 1er groupe : -ais, -ais, -ait, -ions, -iez, -aient.',
 '[{"step":1,"title":"Formation","text":"Radical de la 1ère pers. pluriel au présent + terminaisons imparfait."},{"step":2,"title":"Terminaisons","text":"je -ais, tu -ais, il/elle -ait, nous -ions, vous -iez, ils/elles -aient."},{"step":3,"title":"Exemple : chanter","text":"je chantais, tu chantais, il chantait, nous chantions, vous chantiez, ils chantaient."},{"step":4,"title":"Astuce","text":"TOUS les verbes ont les mêmes terminaisons à l''imparfait, même être et avoir."}]',
 'Mme Aubert — Professeure de Français 6e', true, 5),

('Français','Collège 4e',
 'Qu''est-ce que le subjonctif et quand l''utiliser ?',
 ARRAY['subjonctif','4e','collège','conjugaison','mode'],
 'Le subjonctif exprime le doute, le souhait, la nécessité. Il s''emploie principalement dans les subordonnées après certains verbes.',
 '[{"step":1,"title":"Quand l''utiliser","text":"Après : vouloir que, souhaiter que, falloir que, douter que, bien que, pour que, afin que, avant que."},{"step":2,"title":"Formation","text":"Radical de la 3e pers. pluriel présent + terminaisons -e, -es, -e, -ions, -iez, -ent."},{"step":3,"title":"Exemple : finir","text":"qu''il finisse (présent), que nous finissions."},{"step":4,"title":"Pièges","text":"''Il faut que tu VIENNES'' (pas viens). ''Bien qu''il SOIT'' (pas est). Être et avoir sont irréguliers."}]',
 'M. Lebeau — Professeur de Français 4e', true, 5),

('Français','Lycée 2nde',
 'Comment analyser le registre d''un texte littéraire (lyrique, épique, comique…) ?',
 ARRAY['registre','2nde','lycée','analyse littéraire'],
 'Le registre définit l''effet dominant qu''un texte cherche à produire sur le lecteur.',
 '[{"step":1,"title":"Registre lyrique","text":"Expression des sentiments, émotions personnelles. Indices : 1ère pers., exclamations, apostrophes, champs lexicaux du sentiment."},{"step":2,"title":"Registre épique","text":"Grandeur, héroïsme, combat. Indices : superlatifs, hyperboles, termes guerriers, rythme ample."},{"step":3,"title":"Registre comique","text":"Faire rire. Types : comique de mots (jeux de langage), de gestes, de situation, de caractère."},{"step":4,"title":"Registre tragique","text":"Fatalité, mort, destin inévitable. Indices : champ lexical de la mort, impuissance du héros."},{"step":5,"title":"Méthode","text":"1) Identifier le registre dominant 2) Citer des indices précis 3) Expliquer l''effet produit."}]',
 'Mme Noel — Professeure de Français 2nde', true, 5),

('Français','Lycée Terminale',
 'Comment réussir l''épreuve de Français écrit au baccalauréat (commentaire) ?',
 ARRAY['bac','commentaire','terminale','méthode'],
 'Le commentaire de texte au bac évalue ta capacité à analyser un texte avec des axes cohérents et des citations bien intégrées.',
 '[{"step":1,"title":"Lire activement","text":"Identifier genre, époque, auteur, registre. Annoter figures de style, tonalité, mouvements du texte."},{"step":2,"title":"Trouver les axes","text":"2 axes thématiques (jamais linéaires). Chaque axe répond à une dimension du texte."},{"step":3,"title":"Rédiger l''introduction","text":"Présentation → situation du passage → problématique → annonce des 2 axes. ~10 lignes."},{"step":4,"title":"Développement","text":"Chaque sous-partie : idée directrice → citation → analyse du procédé → effet. Mini-conclusion."},{"step":5,"title":"Conclusion","text":"Réponse à la problématique + ouverture. ≤ 6 lignes. Jamais de nouvelle idée."}]',
 'M. Jacquet — Professeur de Français Terminale', true, 5),

-- ══ HISTOIRE ══

('Histoire','Primaire CM2',
 'Qui était Vercingétorix et pourquoi est-il important dans l''histoire de France ?',
 ARRAY['Vercingétorix','Gaulois','CM2','histoire','primaire'],
 'Vercingétorix était un chef gaulois qui a uni les tribus gauloises contre Jules César lors de la Guerre des Gaules.',
 '[{"step":1,"title":"Qui était-il ?","text":"Chef de la tribu des Arvernes (Auvergne actuelle), né vers -72 av. J.-C."},{"step":2,"title":"La révolte gauloise","text":"En -52 av. J.-C., il rassemble les tribus gauloises et remporte la victoire de Gergovie contre César."},{"step":3,"title":"La défaite","text":"Assiégé à Alésia, il se rend à César pour sauver ses hommes. Emmené à Rome, exécuté en -46."},{"step":4,"title":"Son importance","text":"Symbole de la résistance nationale française. Napoléon III fit ériger sa statue à Alésia au XIXe siècle."}]',
 'M. Girard — Professeur des écoles CM2', true, 5),

('Histoire','Collège 5e',
 'Qu''est-ce que la féodalité au Moyen Âge ?',
 ARRAY['féodalité','Moyen Âge','5e','collège','seigneurs'],
 'La féodalité est un système politique et social basé sur des liens de vassalité entre seigneurs et sur l''exploitation des paysans (serfs).',
 '[{"step":1,"title":"La pyramide féodale","text":"Roi → Grands seigneurs (ducs, comtes) → Chevaliers → Paysans (serfs/vilains)."},{"step":2,"title":"Le lien de vassalité","text":"Le vassal rend hommage au seigneur, qui lui donne un fief (terre). Le vassal doit service militaire et loyauté."},{"step":3,"title":"Les paysans","text":"Serfs : liés à la terre, doivent corvées et redevances. Vilains : libres mais payent taxes."},{"step":4,"title":"L''Église","text":"3e pilier de la société médiévale. Possède 1/3 des terres. Assure hôpitaux, écoles, refuges."}]',
 'Mme Hubert — Professeure d''Histoire 5e', true, 5),

('Histoire','Collège 4e',
 'Qu''est-ce que la Révolution française de 1789 et ses causes principales ?',
 ARRAY['Révolution française','1789','4e','collège','causes'],
 'La Révolution française renverse la monarchie absolue de Louis XVI et proclame les droits de l''homme, fondant la République.',
 '[{"step":1,"title":"Causes sociales","text":"La société est divisée en 3 ordres inégaux : Clergé (1%), Noblesse (2%), Tiers-état (97%) qui paie tous les impôts."},{"step":2,"title":"Causes économiques","text":"Crise agricole 1788, famines, banqueroute de l''État due aux guerres et aux dépenses de la cour."},{"step":3,"title":"Causes politiques","text":"Idées des Lumières (Voltaire, Rousseau, Montesquieu) remettent en question l''absolutisme royal."},{"step":4,"title":"Le déclenchement","text":"États généraux de mai 1789 → Tiers-état se proclame Assemblée nationale → Prise de la Bastille le 14 juillet 1789."}]',
 'M. Renaud — Professeur d''Histoire 4e', true, 5),

('Histoire','Lycée 2nde',
 'Quelles sont les caractéristiques de la démocratie athénienne au Ve siècle av. J.-C. ?',
 ARRAY['démocratie athénienne','Grèce antique','2nde','lycée','Périclès'],
 'La démocratie athénienne est le premier régime démocratique de l''Histoire, mais très limité : seuls les citoyens mâles libres participent.',
 '[{"step":1,"title":"L''Ecclésia","text":"Assemblée de tous les citoyens : vote les lois, déclare la guerre, élit les stratèges. Se réunit 40 fois/an."},{"step":2,"title":"La Boulè","text":"Conseil des 500, tiré au sort, prépare les décisions de l''Ecclésia."},{"step":3,"title":"L''Héliée","text":"Tribunal populaire : 6000 juges tirés au sort jugeant les affaires importantes."},{"step":4,"title":"Les exclus","text":"Femmes, esclaves (1/3 de la population), métèques (étrangers) = exclus. La démocratie athénienne est très restrictive."},{"step":5,"title":"L''Âge de Périclès","text":"~450-429 av. J.-C. : apogée — construction du Parthénon, essor culturel, empire maritime."}]',
 'Mme Blanc — Professeure d''Histoire 2nde', true, 5),

('Histoire','Supérieur Licence 1',
 'Qu''est-ce que l''historiographie et pourquoi est-elle indispensable en histoire ?',
 ARRAY['historiographie','épistémologie','licence','méthode historique'],
 'L''historiographie est l''étude de la façon dont l''histoire a été écrite. Elle analyse les courants historiographiques et leurs présupposés.',
 '[{"step":1,"title":"Définition","text":"Histoire de l''histoire : comment les historiens ont-ils construit et réinterprété le passé selon leur époque ?"},{"step":2,"title":"Pourquoi c''est crucial","text":"Toute œuvre historique porte les marques de son contexte (idéologie, nationalisme, sources disponibles). En être conscient = condition de scientificité."},{"step":3,"title":"Les grandes écoles","text":"École des Annales (Bloch, Febvre) — histoire totale et longue durée. Histoire marxiste — luttes de classes. Histoire culturelle — représentations et imaginaires."},{"step":4,"title":"Méthode","text":"Pour tout livre d''histoire : identifier l''auteur, son époque, sa méthode, ses sources, sa thèse, ses silences."}]',
 'Prof. Moreau — MCF Histoire moderne', true, 5),

-- ══ PHYSIQUE ══

('Physique','Collège 5e',
 'Qu''est-ce que la lumière blanche et comment se décompose-t-elle ?',
 ARRAY['lumière','spectre','5e','collège','optique'],
 'La lumière blanche est un mélange de toutes les couleurs de l''arc-en-ciel. Un prisme la décompose en spectre visible.',
 '[{"step":1,"title":"La lumière blanche","text":"Émise par le Soleil ou une ampoule à incandescence. Elle contient toutes les longueurs d''onde du visible."},{"step":2,"title":"Décomposition par un prisme","text":"Le prisme réfracte chaque couleur différemment → spectre : rouge, orange, jaune, vert, bleu, indigo, violet."},{"step":3,"title":"L''arc-en-ciel","text":"Les gouttes de pluie jouent le rôle de prismes. La lumière se décompose et se réfléchit."},{"step":4,"title":"Longueurs d''onde","text":"Rouge ≈ 700 nm (le plus long). Violet ≈ 400 nm (le plus court). L''œil voit de 380 à 780 nm."}]',
 'M. Thomas — Professeur de Physique 5e', true, 5),

('Physique','Collège 3e',
 'Qu''est-ce que la tension électrique et comment la mesurer ?',
 ARRAY['tension','volt','3e','collège','électricité'],
 'La tension électrique (ou différence de potentiel) est la ''pression'' qui pousse les électrons dans un circuit. Elle se mesure en Volts avec un voltmètre.',
 '[{"step":1,"title":"Définition","text":"Tension = différence de potentiel entre deux points. Symbole U, unité : Volt (V)."},{"step":2,"title":"Mesurer avec un voltmètre","text":"Le voltmètre se branche EN DÉRIVATION (en parallèle) aux bornes du dipôle à mesurer. Jamais en série !"},{"step":3,"title":"Loi des tensions","text":"Dans un circuit série : U_total = U₁ + U₂ + … En dérivation : la tension est la même pour tous les dipôles."},{"step":4,"title":"Valeurs usuelles","text":"Pile AA : 1,5 V. Batterie smartphone : 3,7 V. Prise secteur : 230 V. Ligne THT : 400 000 V."}]',
 'Mme Roy — Professeure de Physique 3e', true, 5),

('Physique','Lycée 1ère',
 'Comment utiliser la loi d''Ohm et calculer résistances en série et en parallèle ?',
 ARRAY['loi Ohm','résistance','1ère','lycée','électricité'],
 'La loi d''Ohm : U = R × I. Résistances en série s''additionnent. En parallèle, les inverses s''additionnent.',
 '[{"step":1,"title":"Loi d''Ohm","text":"U = R × I. U en Volts, R en Ohms (Ω), I en Ampères. Retenir : U = RI comme URIn."},{"step":2,"title":"Résistances en série","text":"R_éq = R₁ + R₂ + R₃. Ex : 10Ω + 20Ω = 30Ω."},{"step":3,"title":"Résistances en parallèle","text":"1/R_éq = 1/R₁ + 1/R₂. Pour 2 résistances : R_éq = (R₁×R₂)/(R₁+R₂). Ex : 10Ω ∥ 10Ω = 5Ω."},{"step":4,"title":"Application","text":"Circuit série 12V avec R₁=3Ω et R₂=9Ω → R_éq=12Ω → I=1A → U₁=3V, U₂=9V."}]',
 'M. Perrin — Professeur de Physique 1ère', true, 5),

('Physique','Lycée Terminale',
 'Comment fonctionne la radioactivité et quels sont ses types (α, β, γ) ?',
 ARRAY['radioactivité','noyau','terminale','physique nucléaire'],
 'La radioactivité est l''émission spontanée de rayonnements par un noyau instable. Il existe 3 types : α (hélium), β (électron) et γ (photon).',
 '[{"step":1,"title":"Radioactivité α","text":"Le noyau émet un noyau d''hélium ⁴He (2 protons + 2 neutrons). Pénétration faible (arrêtée par une feuille de papier)."},{"step":2,"title":"Radioactivité β⁻","text":"Émission d''un électron (un neutron → proton + électron). Pénétration moyenne (arrêtée par aluminium)."},{"step":3,"title":"Radioactivité γ","text":"Émission d''un photon très énergétique (rayonnement électromagnétique). Très pénétrant (plomb ou béton épais)."},{"step":4,"title":"Loi de décroissance","text":"N(t) = N₀ × (1/2)^(t/t₁/₂). t₁/₂ = demi-vie = temps pour que la moitié des noyaux se désintègre."}]',
 'Mme Dumont — Professeure de Physique Terminale', true, 5),

('Physique','Supérieur Licence 1',
 'Qu''est-ce que le principe de superposition des forces et comment l''appliquer ?',
 ARRAY['superposition','forces','mécanique','licence','Newton'],
 'Le principe de superposition dit que la force résultante sur un objet est la somme vectorielle de toutes les forces qui lui sont appliquées.',
 '[{"step":1,"title":"Énoncé","text":"F⃗_résultante = ΣF⃗ᵢ (somme vectorielle de toutes les forces)."},{"step":2,"title":"Décomposition sur les axes","text":"On projette chaque force sur x et y : Fₓ = F·cos(θ), Fᵧ = F·sin(θ). Puis Rₓ = ΣFᵢₓ, Rᵧ = ΣFᵢᵧ."},{"step":3,"title":"Norme de la résultante","text":"||F⃗_res|| = √(Rₓ² + Rᵧ²)."},{"step":4,"title":"Application : objet sur plan incliné","text":"Poids P vers le bas, Normale N perpendiculaire au plan, Frottement f. Décomposer P en P∥ et P⊥. Équilibre si N=P⊥ et f=P∥."}]',
 'Prof. Lemaire — MCF Mécanique', true, 5),

-- ══ SVT ══

('SVT','Primaire CE2',
 'Qu''est-ce que le cycle de l''eau ?',
 ARRAY['cycle eau','CE2','primaire','sciences','évaporation'],
 'L''eau circule en permanence entre la mer, l''atmosphère et la terre grâce à l''évaporation, la condensation et les précipitations.',
 '[{"step":1,"title":"Évaporation","text":"Le soleil chauffe l''eau des mers, lacs, rivières → l''eau se transforme en vapeur et monte dans l''air."},{"step":2,"title":"Condensation","text":"En altitude il fait froid → la vapeur redevient gouttelettes → formation des nuages."},{"step":3,"title":"Précipitations","text":"Les gouttelettes grossissent → trop lourdes → tombent en pluie, neige ou grêle."},{"step":4,"title":"Ruissellement et infiltration","text":"L''eau coule vers les rivières et la mer, ou s''infiltre dans le sol → nappes phréatiques."}]',
 'Mme Dupont — Professeure des écoles CE2', true, 5),

('SVT','Collège 4e',
 'Comment fonctionne la respiration cellulaire ?',
 ARRAY['respiration cellulaire','4e','SVT','mitochondrie','ATP'],
 'La respiration cellulaire transforme le glucose en énergie (ATP) en utilisant l''oxygène et en rejetant du CO₂.',
 '[{"step":1,"title":"Équation bilan","text":"Glucose + O₂ → CO₂ + H₂O + énergie (ATP). C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP."},{"step":2,"title":"Lieu","text":"La mitochondrie = ''centrale énergétique'' de la cellule. Elle réalise la majeure partie de la respiration."},{"step":3,"title":"L''ATP","text":"Adénosine triphosphate : monnaie énergétique universelle de la cellule. Toutes les réactions cellulaires l''utilisent."},{"step":4,"title":"Différence fermentation","text":"Sans O₂ : fermentation lactique (muscles) ou alcoolique (levures). Moins efficace : 2 ATP au lieu de 36 ATP."}]',
 'M. Auber — Professeur de SVT 4e', true, 5),

('SVT','Lycée 1ère',
 'Comment fonctionne la mitose (division cellulaire) ?',
 ARRAY['mitose','division cellulaire','1ère','SVT','chromosome'],
 'La mitose est la division cellulaire qui produit 2 cellules filles génétiquement identiques à la cellule mère.',
 '[{"step":1,"title":"Interphase","text":"Avant la mitose : duplication de l''ADN. Chaque chromosome devient 2 chromatides sœurs reliées au centromère."},{"step":2,"title":"Prophase","text":"La chromatine se condense en chromosomes visibles. L''enveloppe nucléaire disparaît. Fuseau mitotique se forme."},{"step":3,"title":"Métaphase","text":"Les chromosomes s''alignent au plan équatorial de la cellule (plaque métaphasique)."},{"step":4,"title":"Anaphase","text":"Les chromatides sœurs se séparent → migrent vers les pôles opposés de la cellule."},{"step":5,"title":"Télophase + cytocinèse","text":"2 noyaux se reforment. La cellule se divise en 2 cellules filles identiques (2n chromosomes chacune)."}]',
 'Mme Dumas — Professeure de SVT 1ère', true, 5),

('SVT','Lycée Terminale',
 'Comment fonctionne le système immunitaire et quelle est la réponse adaptative ?',
 ARRAY['immunité','lymphocytes','terminale','SVT','anticorps'],
 'La réponse immunitaire adaptative est spécifique à chaque pathogène. Elle implique lymphocytes B (anticorps) et T (cytotoxiques).',
 '[{"step":1,"title":"Immunité innée (1ère ligne)","text":"Rapide, non spécifique. Phagocytes (macrophages, neutrophiles) détruisent les pathogènes. Inflammation."},{"step":2,"title":"Présentation antigénique","text":"Les cellules dendritiques présentent les antigènes aux lymphocytes T via les molécules CMH."},{"step":3,"title":"Réponse humorale (Lymphocytes B)","text":"Les LB reconnaissent l''antigène → se différencient en plasmocytes → sécrètent des anticorps spécifiques."},{"step":4,"title":"Réponse cellulaire (Lymphocytes T)","text":"LT4 (helper) : coordonnent la réponse. LT8 (cytotoxiques) : détruisent les cellules infectées."},{"step":5,"title":"Mémoire immunitaire","text":"Des cellules mémoire persistent → réponse plus rapide et forte lors d''une 2ème infection. Base des vaccins."}]',
 'M. Gros — Professeur de SVT Terminale', true, 5),

-- ══ ANGLAIS ══

('Anglais','Primaire CM1',
 'Comment construire une phrase affirmative, négative et interrogative en anglais ?',
 ARRAY['anglais','phrase','CM1','primaire','grammaire de base'],
 'En anglais, la structure de base est Sujet + Verbe + Complément. La négative utilise do not, l''interrogative inverse sujet et auxiliaire.',
 '[{"step":1,"title":"Phrase affirmative","text":"S + V + C. Ex : I like chocolate. She plays football."},{"step":2,"title":"Phrase négative","text":"S + do not/does not + V base. Ex : I do not like coffee. She does not play tennis."},{"step":3,"title":"Phrase interrogative","text":"Do/Does + S + V base + ? Ex : Do you like music? Does he go to school?"},{"step":4,"title":"Avec BE","text":"Affirmative : She is happy. Négative : She is not happy. Interrogative : Is she happy?"}]',
 'Mme Martin — Professeure d''Anglais CM1', true, 5),

('Anglais','Collège 5e',
 'Qu''est-ce que le comparatif et le superlatif en anglais ?',
 ARRAY['comparatif','superlatif','5e','anglais','collège'],
 'Le comparatif compare deux éléments (more… than, -er than). Le superlatif désigne l''extrême dans un groupe (the most…, the -est).',
 '[{"step":1,"title":"Comparatif d''infériorité","text":"Less + adj + than. Ex : Maths is less fun than PE (pour moi)."},{"step":2,"title":"Comparatif de supériorité","text":"Adj courts + -er + than. Ex : taller than, faster than. Adj longs : more + adj + than. Ex : more interesting than."},{"step":3,"title":"Superlatif","text":"Adj courts : the + -est. Ex : the tallest. Adj longs : the most + adj. Ex : the most beautiful."},{"step":4,"title":"Irréguliers","text":"good → better → the best. bad → worse → the worst. far → further → the furthest."}]',
 'M. Dupré — Professeur d''Anglais 5e', true, 5),

('Anglais','Lycée 1ère',
 'Comment utiliser les modaux (can, must, should, might…) en anglais ?',
 ARRAY['modaux','can','must','should','1ère','anglais'],
 'Les modaux expriment la capacité, l''obligation, le conseil ou la possibilité. Ils sont suivis de l''infinitif sans TO.',
 '[{"step":1,"title":"CAN / COULD","text":"Capacité ou permission. I can swim (je sais nager). Could = passé ou politesse : Could you help me?"},{"step":2,"title":"MUST / HAVE TO","text":"Obligation. Must = obligation interne : You must study. Have to = obligation externe : I have to be at school at 8."},{"step":3,"title":"SHOULD / OUGHT TO","text":"Conseil, recommandation. You should eat less sugar. You ought to call her."},{"step":4,"title":"MIGHT / MAY","text":"Possibilité, incertitude. It might rain tomorrow. You may leave now (permission formelle)."},{"step":5,"title":"NEEDN''T / MUSTN''T","text":"Needn''t = pas obligé. Mustn''t = interdit. You needn''t hurry. You mustn''t smoke here."}]',
 'Mme Lefevre — Professeure d''Anglais 1ère', true, 5),

('Anglais','Lycée Terminale',
 'Comment réussir une synthèse de documents en anglais au baccalauréat ?',
 ARRAY['synthèse','bac','terminale','anglais','méthode'],
 'La synthèse de documents en anglais consiste à confronter 2-3 documents sur un même thème, en dégageant points communs, oppositions et nuances.',
 '[{"step":1,"title":"Analyser chaque document","text":"Nature (article, photo, texte littéraire...), source, date, idée principale, ton. 5 min minimum."},{"step":2,"title":"Trouver les points communs et tensions","text":"Regrouper les idées, pas les documents. Axe 1 = convergence. Axe 2 = divergence ou nuance."},{"step":3,"title":"Introduction","text":"Présenter le thème général + les documents + annoncer le plan."},{"step":4,"title":"Développement","text":"Citer et paraphraser les documents. Formules : According to Doc 1… / While Doc 2 argues… / In contrast…"},{"step":5,"title":"Conclusion","text":"Synthèse de la confrontation. Pas d''opinion personnelle dans une synthèse (contrairement au essay)."}]',
 'M. Bernard — Professeur d''Anglais Terminale', true, 5),

-- ══ PHILO ══

('Philo','Lycée Terminale',
 'Comment traiter un sujet de dissertation philosophique au baccalauréat ?',
 ARRAY['dissertation','bac','terminale','philosophie','méthode'],
 'La dissertation philo exige de problématiser le sujet, construire un plan dialectique et mobiliser des auteurs et concepts précis.',
 '[{"step":1,"title":"Analyser le sujet","text":"Définir chaque terme clé (au moins 2 sens par mot). Identifier la tension, le paradoxe, l''implicite."},{"step":2,"title":"La problématique","text":"Question qui fait voir que le sujet pose un problème véritable, non une réponse évidente. 2-3 lignes max."},{"step":3,"title":"Plan dialectique (le plus courant)","text":"Thèse : réponse intuitive. Antithèse : objection sérieuse. Synthèse/Dépassement : position nuancée qui dépasse le conflit."},{"step":4,"title":"Mobiliser les auteurs","text":"1-2 auteurs minimum par partie. Citer précisément l''œuvre. Ex : Kant (Critique de la raison pure), Descartes (Méditations), Nietzsche (Généalogie de la morale)."},{"step":5,"title":"Conclusion","text":"Répondre clairement à la problématique + ouvrir sur une question connexe. 10-15 lignes."}]',
 'Mme Petit — Professeure de Philosophie Terminale', true, 5),

('Philo','Lycée Terminale',
 'Qu''est-ce que la conscience selon Descartes et Freud ?',
 ARRAY['conscience','Descartes','Freud','terminale','philo'],
 'Descartes fait de la conscience (cogito) le fondement de toute certitude. Freud révolutionne cette vision en postulant l''inconscient.',
 '[{"step":1,"title":"Descartes : le cogito","text":"''Je pense, donc je suis'' (Cogito ergo sum). La conscience est transparente à elle-même. Je sais tout ce qui se passe en moi."},{"step":2,"title":"La conscience chez Descartes","text":"Toute pensée est consciente. L''âme (res cogitans) est entièrement distincte du corps (res extensa)."},{"step":3,"title":"Freud : l''inconscient","text":"La majeure partie du psychisme est inconsciente (iceberg). La conscience = la pointe émergée."},{"step":4,"title":"Le ça, le moi, le surmoi","text":"Ça = pulsions inconscientes. Moi = instance consciente/médiatrice. Surmoi = intériorisation des normes sociales."},{"step":5,"title":"L''opposition fondamentale","text":"Descartes : ''Je me connais pleinement.'' Freud : ''Je suis étranger à moi-même.'' Freud renverse le sujet cartésien."}]',
 'M. Morel — Professeur de Philosophie Terminale', true, 5),

('Philo','Supérieur Licence 1',
 'Qu''est-ce que l''impératif catégorique de Kant ?',
 ARRAY['Kant','impératif catégorique','morale','licence','éthique'],
 'L''impératif catégorique est la loi morale universelle de Kant : agis uniquement selon la maxime dont tu pourrais vouloir qu''elle devienne une loi universelle.',
 '[{"step":1,"title":"Définition","text":"Formule universelle : ''Agis uniquement selon la maxime par laquelle tu peux vouloir en même temps qu''elle devienne une loi universelle.'' (Fondements de la métaphysique des mœurs)"},{"step":2,"title":"Vs l''impératif hypothétique","text":"Hypothétique : ''Si tu veux X, fais Y.'' Catégorique : ''Fais Y'' inconditionnellement, sans condition préalable."},{"step":3,"title":"2ème formulation","text":"''Agis de telle sorte que tu traites l''humanité, en toi et en autrui, toujours comme une fin, jamais seulement comme un moyen.''"},{"step":4,"title":"Application","text":"Mentir : peut-on universaliser le mensonge ? Non → tout le monde mentirait → le mensonge perdrait sa signification → maxime non universalisable → interdit moral."}]',
 'Dr. Chevalier — MCF Philosophie morale', true, 5),

-- ══ SUPÉRIEUR supplémentaire ══

('Maths','Supérieur Master 1',
 'Qu''est-ce qu''un espace vectoriel et quelles sont ses propriétés fondamentales ?',
 ARRAY['espace vectoriel','algèbre linéaire','master','maths'],
 'Un espace vectoriel est un ensemble muni de l''addition de vecteurs et de la multiplication par un scalaire, vérifiant 8 axiomes.',
 '[{"step":1,"title":"Définition","text":"(E, +, ·) est un espace vectoriel sur un corps K si l''addition est commutative, associative, possède un neutre (0) et des opposés ; et si la multiplication scalaire est distributive et compatible."},{"step":2,"title":"Les 8 axiomes","text":"1) u+v=v+u 2) (u+v)+w=u+(v+w) 3) ∃0:u+0=u 4) ∃-u 5) λ(u+v)=λu+λv 6) (λ+μ)u=λu+μu 7) (λμ)u=λ(μu) 8) 1·u=u"},{"step":3,"title":"Exemples","text":"ℝⁿ, les polynômes, les matrices Mₙₓₘ(ℝ), les suites convergentes, les fonctions continues C([a,b])."},{"step":4,"title":"Sous-espace vectoriel","text":"F ⊂ E est un SEV si : 0∈F, stable par addition, stable par multiplication scalaire. Vérifier ces 3 conditions."}]',
 'Prof. Fontaine — MCF Algèbre', true, 5),

('SVT','Supérieur Licence 1',
 'Qu''est-ce que la structure de l''ADN et comment l''information génétique est-elle codée ?',
 ARRAY['ADN','double hélice','code génétique','licence','biologie'],
 'L''ADN est une double hélice de nucléotides. L''information est codée dans la séquence des bases azotées A, T, G, C.',
 '[{"step":1,"title":"La double hélice (Watson & Crick, 1953)","text":"2 brins antiparallèles enroulés. Squelette sucre-phosphate à l''extérieur. Bases azotées à l''intérieur."},{"step":2,"title":"Appariement des bases","text":"A-T (2 liaisons H), G-C (3 liaisons H). Toujours une purine face à une pyrimidine."},{"step":3,"title":"Le code génétique","text":"3 bases consécutives = 1 codon = 1 acide aminé. 4³ = 64 codons possibles pour 20 acides aminés → le code est dégénéré."},{"step":4,"title":"Réplication","text":"Semi-conservative : chaque brin sert de matrice. ADN polymérase ajoute les nucléotides complémentaires. Fidélité > 99,9999%."}]',
 'Dr. Faure — MCF Biologie cellulaire', true, 5);