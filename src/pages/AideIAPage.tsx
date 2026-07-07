import { AlertCircle, BarChart2, BookMarked, BookOpen, Calculator, ChevronDown, ChevronRight, Code, ExternalLink, FlaskConical, Globe, Heart, Languages, Lightbulb, Loader2, MessageCircle, Pencil, RotateCcw, Search, Send, Target, UserCheck, Volume2, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import LectureGuideeModal from '@/components/ui/LectureGuideeModal';
import { buildUtterance, unlockAudioContext } from '@/lib/ttsUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
// v1626 — static ttsUtils import (no dynamic import)
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import type { ExportContent } from '@/components/ui/ExportButton';
import ExportButton from '@/components/ui/ExportButton';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/ui/PageHero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/db/supabase';
import { useApp } from '@/contexts/AppContext';
import { createStudentQuestion } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step { label: string; detail: string; }
interface FicheMethode {
  id: string;
  subject: string;
  niveau: string[];
  titre: string;
  type: string;
  steps: Step[];
  conseil: string;
  exemple?: string;
}
interface Ressource {
  label: string;
  url: string;
  desc: string;
  tag: string;
}

// ─── Fiches méthode rédigées manuellement ─────────────────────────────────────
const FICHES = [
  // ── Maths ──
  {
    id: 'm1', subject: 'Maths', niveau: ['Lycée', 'Collège'], titre: 'Résoudre une équation du 2nd degré', type: 'Algèbre',
    steps: [
      { label: 'Mettre sous forme ax² + bx + c = 0', detail: 'Développe, réduis, puis déplace tous les termes à gauche du signe =.' },
      { label: 'Identifier a, b et c', detail: 'a = coefficient de x², b = coefficient de x, c = terme constant.' },
      { label: 'Calculer le discriminant Δ', detail: 'Δ = b² − 4ac. C\'est la clé pour savoir combien de solutions existe.' },
      { label: 'Interpréter Δ', detail: 'Δ > 0 → 2 solutions réelles. Δ = 0 → 1 solution double. Δ < 0 → pas de solution réelle.' },
      { label: 'Calculer les solutions', detail: 'x₁ = (−b + √Δ) / 2a  et  x₂ = (−b − √Δ) / 2a' },
    ],
    conseil: 'Commence TOUJOURS par vérifier que l\'équation est bien = 0 avant de chercher a, b, c.',
    exemple: 'x² − 5x + 6 = 0 → a=1, b=−5, c=6 → Δ = 25−24 = 1 → x₁ = 3, x₂ = 2',
  },
  {
    id: 'm2', subject: 'Maths', niveau: ['Lycée', 'Collège'], titre: 'Calculer la dérivée d\'une fonction', type: 'Analyse',
    steps: [
      { label: 'Identifier le type de fonction', detail: 'Constante, polynôme, racine, fraction, produit, quotient ou composée ?' },
      { label: 'Appliquer les formules de base', detail: '(xⁿ)\' = n·xⁿ⁻¹ | (√x)\' = 1/(2√x) | (eˣ)\' = eˣ | (ln x)\' = 1/x' },
      { label: 'Pour un produit u·v', detail: '(u·v)\' = u\'·v + u·v\'' },
      { label: 'Pour un quotient u/v', detail: '(u/v)\' = (u\'·v − u·v\') / v²' },
      { label: 'Simplifier le résultat', detail: 'Factorise si possible pour trouver les zéros de f\' plus facilement.' },
    ],
    conseil: 'Dresse un tableau de signe de f\'(x) pour déterminer les variations de f sans oublier aucun intervalle.',
    exemple: 'f(x) = 3x² − 2x + 1 → f\'(x) = 6x − 2',
  },
  {
    id: 'm3', subject: 'Maths', niveau: ['Collège'], titre: 'Résoudre un système de 2 équations', type: 'Algèbre',
    steps: [
      { label: 'Choisir une méthode', detail: 'Substitution (isoler une variable), ou combinaison linéaire (addition/soustraction).' },
      { label: 'Substitution : isoler x ou y', detail: 'Dans l\'équation la plus simple, isole x (ou y) puis remplace dans l\'autre.' },
      { label: 'Résoudre l\'équation restante', detail: 'Tu obtiens une équation à une seule inconnue — résous-la normalement.' },
      { label: 'Trouver la 2ᵉ inconnue', detail: 'Réinjecte la valeur trouvée dans l\'une des équations originales.' },
      { label: 'Vérification', detail: 'Substitue le couple (x, y) dans LES DEUX équations pour confirmer.' },
    ],
    conseil: 'La vérification est obligatoire en contrôle. Elle te rapporte des points même si tu t\'es trompé en route.',
    exemple: 'x + y = 5 et 2x − y = 1 → additionner : 3x = 6 → x = 2 → y = 3',
  },
  {
    id: 'm4', subject: 'Maths', niveau: ['Collège', 'Lycée'], titre: 'Utiliser le théorème de Thalès', type: 'Géométrie',
    steps: [
      { label: 'Vérifier les conditions', detail: 'Deux droites parallèles coupant deux sécantes passant par un même point.' },
      { label: 'Identifier les points homologues', detail: 'Repère quels points se correspondent sur chaque sécante depuis le point commun.' },
      { label: 'Écrire les égalités de rapports', detail: 'AM/AB = AN/AC = MN/BC (avec A le point commun aux sécantes).' },
      { label: 'Substituer les valeurs connues', detail: 'Remplace les longueurs connues dans le rapport et résous l\'équation.' },
      { label: 'Conclure et préciser l\'unité', detail: 'Annonce clairement la valeur trouvée avec son unité.' },
    ],
    conseil: 'Thalès s\'applique UNIQUEMENT si les droites sont bien parallèles — toujours le vérifier ou le justifier.',
    exemple: 'AM = 3, AB = 9, AC = 6 → AN = AM × AC / AB = 3 × 6 / 9 = 2',
  },
  // ── Français ──
  {
    id: 'f1', subject: 'Français', niveau: ['Lycée'], titre: 'Rédiger une introduction de dissertation', type: 'Méthode rédac.',
    steps: [
      { label: 'Accroche (2–3 lignes)', detail: 'Citation, fait d\'actualité, paradoxe ou question rhétorique en lien avec le sujet.' },
      { label: 'Présentation du sujet', detail: 'Reformule le sujet avec tes propres mots. Définis les termes-clés.' },
      { label: 'Problématique', detail: 'Une question précise qui montre la tension du sujet. Évite les questions fermées (oui/non).' },
      { label: 'Annonce du plan', detail: 'Énonce clairement tes 2 ou 3 parties : "Dans un premier temps… puis… enfin…".' },
    ],
    conseil: 'L\'introduction représente environ 10 % de la copie. Rédige-la au propre EN DERNIER, une fois le plan clair.',
    exemple: 'Sujet : "La liberté est-elle une illusion ?" → accroche Rousseau → définir liberté/illusion → problématique → annonce plan.',
  },
  {
    id: 'f2', subject: 'Français', niveau: ['Lycée', 'Collège'], titre: 'Analyser un poème (explication linéaire)', type: 'Lecture',
    steps: [
      { label: 'Lire le poème deux fois', detail: 'La 1ère fois globalement. La 2ème en relevant les images, sons et structures qui t\'interpellent.' },
      { label: 'Identifier la forme', detail: 'Nombre de strophes, de vers. Métrique (alexandrin = 12 syllabes). Type de rimes (croisées, embrassées, suivies).' },
      { label: 'Relever les figures de style', detail: 'Métaphore, comparaison, hyperbole, anaphore, oxymore, personnification, allitération, assonance.' },
      { label: 'Relier forme et sens', detail: 'Pour chaque figure repérée, explique l\'effet produit sur le lecteur : "cela crée une impression de…".' },
      { label: 'Formuler le mouvement du texte', detail: 'Comment le sens évolue-t-il du début à la fin ? Quelle est la progression du propos du poète ?' },
    ],
    conseil: 'Ne jamais NOMMER une figure de style sans EXPLIQUER son effet. "Il y a une métaphore" ≠ analyse.',
    exemple: 'Baudelaire — "Spleen" : anaphore de "Quand" → accumulation écrasante du temps → sentiment d\'enfermement.',
  },
  {
    id: 'f3', subject: 'Français', niveau: ['Collège', 'Lycée'], titre: 'Accord du participe passé', type: 'Grammaire',
    steps: [
      { label: 'Avec ÊTRE', detail: 'Le PP s\'accorde en genre et nombre avec le SUJET du verbe. Ex : Elles sont arrivées.' },
      { label: 'Avec AVOIR — chercher le COD', detail: 'Pose la question "quoi ?" ou "qui ?" après le verbe. Si le COD est AVANT, accord ; si après, pas d\'accord.' },
      { label: 'Verbes pronominaux (se/s\')', detail: 'Se conjuguent avec ÊTRE. Accord avec le sujet SAUF si le pronom est COI.' },
      { label: 'Cas particuliers : laisser + inf.', detail: '"Laisser" suivi d\'un infinitif est invariable depuis la réforme orthographique de 1990.' },
    ],
    conseil: 'Pour AVOIR, toujours repérer où se trouve le COD. Si le COD est placé AVANT le verbe (pronom "l\', les, la"), le PP s\'accorde.',
    exemple: 'La lettre que j\'ai écrite (COD "que" = "la lettre" → féminin singulier → "écrite").',
  },
  // ── Histoire ──
  {
    id: 'h1', subject: 'Histoire', niveau: ['Lycée', 'Collège'], titre: 'Rédiger une composition d\'histoire', type: 'Méthode rédac.',
    steps: [
      { label: 'Analyser le sujet', detail: 'Surligne les mots-clés. Définis les bornes chronologiques et le cadre géographique.' },
      { label: 'Mobiliser le cours', detail: 'Rappelle-toi les grandes dates, acteurs, événements et notions liés au sujet.' },
      { label: 'Construire le plan', detail: 'Plan thématique ou chronologique selon le sujet. 2 ou 3 parties, chacune avec 2–3 sous-parties.' },
      { label: 'Rédiger avec des connecteurs logiques', detail: '"En effet… De plus… Cependant… En conclusion…" — montrent la logique du raisonnement.' },
      { label: 'Conclure avec un bilan et ouverture', detail: 'Réponds à la problématique et ouvre sur une question plus large liée au sujet.' },
    ],
    conseil: 'Chaque paragraphe = 1 idée + 1 exemple + 1 analyse. Ne jamais énoncer un fait sans l\'expliquer.',
    exemple: 'Sujet "Les causes de la 1ère GM" : I. Tensions européennes (nationalisme, alliances) II. L\'étincelle de Sarajevo III. L\'engrenage militaire.',
  },
  // ── SVT ──
  {
    id: 's1', subject: 'SVT', niveau: ['Lycée', 'Collège'], titre: 'Rédiger une synthèse SVT à partir de documents', type: 'Méthode',
    steps: [
      { label: 'Lire tous les documents', detail: 'Identifie la nature de chaque doc (graphique, schéma, texte, tableau) et sa donnée principale.' },
      { label: 'Formuler une problématique', detail: 'À partir du titre de l\'exercice, formule la question à laquelle tu dois répondre.' },
      { label: 'Extraire et relier les informations', detail: 'Pour chaque document, note l\'information utile (avec référence "Doc 1…"). Cherche les liens entre docs.' },
      { label: 'Rédiger en paragraphes logiques', detail: 'Structure : idée → preuve tirée du/des doc(s) → interprétation biologique.' },
      { label: 'Conclure avec un schéma bilan si demandé', detail: 'Représente les mécanismes décrits de façon synthétique et légendée.' },
    ],
    conseil: 'Cite TOUJOURS le document utilisé (ex : "Le graphique du doc 2 montre que…"). Ça prouve que tu argumentes.',
    exemple: 'Exercice photosynthèse : Doc1 (courbe absorption lumière) + Doc2 (schéma chloroplaste) → montrer lien lumière/glucose.',
  },
  // ── Physique ──
  {
    id: 'p1', subject: 'Physique', niveau: ['Lycée', 'Collège'], titre: 'Résoudre un exercice de physique (méthode générale)', type: 'Méthode',
    steps: [
      { label: 'Identifier le système et la situation', detail: 'Quel objet étudie-t-on ? Quel type de problème (mécanique, optique, électricité…) ?' },
      { label: 'Lister les données et inconnues', detail: 'Encadre ou note toutes les valeurs numériques données et ce que tu cherches.' },
      { label: 'Choisir la loi ou formule applicable', detail: 'F = ma ? Loi d\'Ohm ? Conservation d\'énergie ? Snell-Descartes ? Identifie quelle loi s\'applique.' },
      { label: 'Appliquer numériquement', detail: 'Remplace les symboles par les valeurs. Calcule pas à pas. Garde les unités à chaque étape.' },
      { label: 'Vérifier cohérence et unités', detail: 'Le résultat est-il raisonnable ? Les unités s\'annulent-elles bien ? (analyse dimensionnelle)' },
    ],
    conseil: 'Fais TOUJOURS le calcul littéral (avec les lettres) AVANT de remplacer par les chiffres. Tu repères mieux les erreurs.',
    exemple: 'U = 12 V, R = 4 Ω → I = U/R = 12/4 = 3 A',
  },
  // ── Anglais ──
  {
    id: 'a1', subject: 'Anglais', niveau: ['Lycée', 'Collège'], titre: 'Utiliser le présent parfait vs prétérit', type: 'Grammaire',
    steps: [
      { label: 'Present Perfect → lien avec le présent', detail: 'Utilise HAVE + participe passé quand l\'action passée a un effet maintenant. "I have lost my keys" (je ne les ai toujours pas).' },
      { label: 'Simple Past → date/moment précis', detail: 'Utilise la forme en -ed/-ed irrégulier quand tu précises QUAND. "I lost my keys yesterday".' },
      { label: 'Marqueurs du Present Perfect', detail: '"already, just, yet, ever, never, since, for, recently, so far" → signal = Present Perfect.' },
      { label: 'Marqueurs du Simple Past', detail: '"yesterday, last week, in 2010, ago, when I was young" → signal = Simple Past.' },
    ],
    conseil: 'Si tu hésites : est-ce qu\'on précise QUAND ? → Simple Past. Est-ce que ça a un effet MAINTENANT ? → Present Perfect.',
    exemple: '"She has finished her homework" (elle peut jouer maintenant) vs "She finished at 6pm" (heure précise).',
  },
  // ── Espagnol ──
  {
    id: 'e1', subject: 'Espagnol', niveau: ['Lycée', 'Collège'], titre: 'Ser vs Estar — règles complètes', type: 'Grammaire',
    steps: [
      { label: 'SER → identité permanente', detail: 'Nationalité, profession, origine, caractère, matière, heure, relations. "Soy francés. Es médico. Es de madera."' },
      { label: 'ESTAR → état temporaire / localisation', detail: '"Estoy cansado" (je suis fatigué en ce moment). "El libro está en la mesa" (position).' },
      { label: 'Cas particuliers', detail: '"Estar" pour les états civils temporaires (separado, muerto en contexte). "Ser" pour les heures et les événements localisés.' },
      { label: 'Adjectifs qui changent de sens', detail: '"Ser aburrido" = être ennuyeux (caractère) / "Estar aburrido" = s\'ennuyer (état). Listo, malo, bueno → même logique.' },
    ],
    conseil: 'Demande-toi : est-ce une caractéristique ESSENTIELLE (SER) ou une situation MOMENTANÉE (ESTAR) ?',
    exemple: 'Juan es alto (caractère permanent) / Juan está enfermo hoy (état temporaire du jour).',
  },
  // ── Philosophie ──
  {
    id: 'ph1', subject: 'Philosophie', niveau: ['Lycée'], titre: 'Analyser un texte philosophique', type: 'Méthode lecture',
    steps: [
      { label: 'Première lecture globale', detail: 'Identifie le sujet traité, le mouvement général du texte et la thèse de l\'auteur.' },
      { label: 'Dégager la thèse', detail: 'En une phrase : "L\'auteur soutient que…". La thèse répond à une question philosophique précise.' },
      { label: 'Identifier la structure argumentative', detail: 'Comment l\'auteur construit-il son raisonnement ? Déduction ? Exemple ? Réfutation d\'une objection ?' },
      { label: 'Analyser les concepts-clés', detail: 'Définis précisément chaque notion importante du texte. "Qu\'entend l\'auteur par X ?".' },
      { label: 'Discussion critique', detail: 'Peux-tu objecter un argument ? Quel autre philosophe pense différemment ? Quelle est la portée de la thèse ?' },
    ],
    conseil: 'L\'explication de texte ne consiste pas à paraphraser mais à JUSTIFIER chaque affirmation de l\'auteur en montrant le raisonnement.',
    exemple: 'Texte Descartes cogito : thèse = le doute prouve l\'existence du sujet pensant → analyser "je pense donc je suis".',
  },
  // ── NSI ──
  {
    id: 'n1', subject: 'NSI/Informatique', niveau: ['Lycée'], titre: 'Comprendre et écrire une fonction récursive', type: 'Algorithmique',
    steps: [
      { label: 'Identifier le cas de base', detail: 'Quel est le cas SIMPLE qui ne nécessite pas d\'appel récursif ? Sans lui, la fonction boucle indéfiniment.' },
      { label: 'Définir l\'appel récursif', detail: 'Comment la fonction s\'appelle-t-elle elle-même avec un paramètre PLUS PETIT (ou plus proche du cas de base) ?' },
      { label: 'Vérifier la terminaison', detail: 'À chaque appel, le paramètre doit se rapprocher du cas de base. Sinon → récursion infinie.' },
      { label: 'Dérouler sur un exemple', detail: 'Trace l\'exécution à la main pour n=3 ou n=4. C\'est le meilleur moyen de comprendre.' },
      { label: 'Analyser la complexité', detail: 'Compte le nombre d\'appels récursifs. Fibonacci naïf = O(2ⁿ). Factorielle = O(n).' },
    ],
    conseil: 'Commence TOUJOURS par écrire le cas de base. Un étudiant sur deux oublie cette étape et obtient une erreur de dépassement de pile.',
    exemple: 'fact(n): si n==0 → retourne 1, sinon → retourne n × fact(n−1). fact(4) = 4×3×2×1 = 24.',
  },
  // ── Économie ──
  {
    id: 'ec1', subject: 'Économie/SES', niveau: ['Lycée'], titre: 'Construire une réponse structurée en SES', type: 'Méthode',
    steps: [
      { label: 'Décoder la question', detail: 'Identifie les mots-clés : "expliquer", "analyser", "montrer". Chaque verbe demande un niveau d\'analyse différent.' },
      { label: 'Mobiliser le cours', detail: 'Quelles notions, mécanismes, auteurs (Marx, Keynes, Bourdieu…) sont liés au sujet ?' },
      { label: 'Exploiter les documents', detail: 'Pour chaque doc, extrais UNE information précise avec les chiffres ou données exactes.' },
      { label: 'Articuler cours et documents', detail: 'Chaque paragraphe = notion du cours + illustration tirée des docs + analyse du lien.' },
      { label: 'Nuancer et conclure', detail: 'Montre les limites ou les cas contraires. Conclure en répondant directement à la question.' },
    ],
    conseil: 'En SES, "expliquer" = montrer le MÉCANISME causal. Pas juste décrire le phénomène : dire POURQUOI et COMMENT il se produit.',
    exemple: '"Expliquer la hausse du chômage" → mécanisme offre/demande de travail + données du doc + nuance cycle économique.',
  },,

  // ── Maths Collège ──────────────────────────────────────────────────────────
  { id: 'm5', subject: 'Maths', niveau: ['Collège'], titre: 'Calculer avec des fractions', type: 'Arithmétique',
    steps: [
      { label: 'Additionner / Soustraire', detail: 'Réduire au même dénominateur, puis additionner les numérateurs.' },
      { label: 'Multiplier', detail: 'Numérateur × numérateur, dénominateur × dénominateur, puis simplifier.' },
      { label: 'Diviser', detail: 'Multiplier par l\'inverse de la fraction diviseur.' },
      { label: 'Simplifier', detail: 'Diviser numérateur et dénominateur par leur PGCD.' },
    ],
    conseil: "Toujours simplifier en cherchant le PGCD avant de calculer pour éviter des fractions énormes.",
    exemple: '3/4 + 1/6 = 9/12 + 2/12 = 11/12' },
  { id: 'm6', subject: 'Maths', niveau: ['Collège'], titre: 'Calculer avec des puissances', type: 'Arithmétique',
    steps: [
      { label: 'Règle du produit', detail: 'aⁿ × aᵐ = aⁿ⁺ᵐ — même base, on additionne les exposants.' },
      { label: 'Règle du quotient', detail: 'aⁿ / aᵐ = aⁿ⁻ᵐ — même base, on soustrait les exposants.' },
      { label: 'Puissance de puissance', detail: '(aⁿ)ᵐ = aⁿˣᵐ — on multiplie les exposants.' },
      { label: 'Puissance négative', detail: 'a⁻ⁿ = 1/aⁿ' },
    ],
    conseil: "Ne jamais confondre a^n × a^m (additionner) et (a^n)^m (multiplier) les exposants.",
    exemple: '2³ × 2⁴ = 2⁷ = 128' },
  { id: 'm7', subject: 'Maths', niveau: ['Collège'], titre: 'Résoudre une équation du 1er degré', type: 'Algèbre',
    steps: [
      { label: 'Isoler l\'inconnue', detail: 'Passer tous les termes en x d\'un côté, les nombres de l\'autre.' },
      { label: 'Effectuer les mêmes opérations', detail: 'Ce qu\'on fait d\'un côté, on le fait de l\'autre.' },
      { label: 'Simplifier', detail: 'Diviser les deux membres par le coefficient de x.' },
      { label: 'Vérifier', detail: 'Remplacer x dans l\'équation initiale pour contrôler.' },
    ],
    conseil: "La vérification finale en substituant x est obligatoire pour valider le résultat.",
    exemple: '3x + 5 = 14 → 3x = 9 → x = 3' },
  { id: 'm8', subject: 'Maths', niveau: ['Collège'], titre: 'Calculer une probabilité simple', type: 'Probabilités',
    steps: [
      { label: 'Identifier l\'expérience', detail: 'Comprendre ce qu\'on fait (lancer un dé, tirer une boule...).' },
      { label: 'Compter les cas favorables', detail: 'Cas qui réalisent l\'événement voulu.' },
      { label: 'Compter les cas possibles', detail: 'Toutes les issues équiprobables.' },
      { label: 'Calculer', detail: 'P(A) = nombre de cas favorables / nombre de cas possibles.' },
    ],
    conseil: "Toujours vérifier que la somme de toutes les probabilités vaut 1.",
    exemple: 'Dé à 6 faces → P(pair) = 3/6 = 1/2' },
  { id: 'm9', subject: 'Maths', niveau: ['Collège'], titre: 'Utiliser le théorème de Pythagore', type: 'Géométrie',
    steps: [
      { label: 'Identifier l\'angle droit', detail: 'Repérer l\'angle droit et l\'hypoténuse (côté en face).' },
      { label: 'Écrire la relation', detail: 'hypoténuse² = côté1² + côté2²' },
      { label: 'Appliquer', detail: 'Substituer les valeurs connues, résoudre pour l\'inconnue.' },
      { label: 'Conclure', detail: 'Prendre la racine carrée si nécessaire, vérifier l\'unité.' },
    ],
    conseil: "Identifier l'hypoténuse AVANT d'écrire la formule — c'est le côté opposé à l'angle droit.",
    exemple: 'AB=3, AC=4 → BC² = 9+16 = 25 → BC = 5 cm' },
  { id: 'm10', subject: 'Maths', niveau: ['Collège', 'Lycée'], titre: 'Lire et analyser un graphique statistique', type: 'Statistiques',
    steps: [
      { label: 'Lire le titre et les axes', detail: 'Comprendre ce que représente chaque axe (unité, variable).' },
      { label: 'Calculer la moyenne', detail: 'Somme des valeurs / nombre de valeurs.' },
      { label: 'Trouver la médiane', detail: 'Classer les valeurs en ordre, trouver la valeur centrale.' },
      { label: 'Calculer l\'étendue', detail: 'Valeur max − valeur min.' },
      { label: 'Interpréter', detail: 'Rédiger une phrase de conclusion en lien avec le contexte.' },
    ],
    conseil: "Ne pas confondre moyenne et médiane : la moyenne est sensible aux valeurs extrêmes.",
    exemple: 'Notes : 8,10,12,14,16 → moyenne = 12, médiane = 12, étendue = 8' },
  // ── Maths Lycée ─────────────────────────────────────────────────────────────
  { id: 'm11', subject: 'Maths', niveau: ['Lycée'], titre: 'Étudier les variations d\'une fonction', type: 'Analyse',
    steps: [
      { label: 'Calculer la dérivée f\'(x)', detail: 'Appliquer les règles de dérivation selon la forme de f.' },
      { label: 'Résoudre f\'(x) = 0', detail: 'Trouver les valeurs annulant la dérivée.' },
      { label: 'Étudier le signe de f\'(x)', detail: 'Tableau de signes : f\'> 0 → croissante, f\'< 0 → décroissante.' },
      { label: 'Dresser le tableau de variations', detail: 'Inclure les extrema locaux.' },
    ],
    conseil: "Un tableau de variations complet avec les extrema vaut plusieurs points au bac.",
    exemple: 'f(x) = x² − 4x → f\'(x) = 2x−4 = 0 → x=2 (minimum)' },
  { id: 'm12', subject: 'Maths', niveau: ['Lycée'], titre: 'Calculer une limite de fonction', type: 'Analyse',
    steps: [
      { label: 'Substitution directe', detail: 'Essayer de remplacer x par la valeur cible.' },
      { label: 'Forme indéterminée', detail: 'Si 0/0 ou ∞/∞ : factoriser, conjuguer, ou règle de L\'Hôpital.' },
      { label: 'Factoriser', detail: 'Mettre en facteur le terme dominant pour les limites en ±∞.' },
      { label: 'Conclure', detail: 'Écrire lim f(x) = valeur ou ±∞.' },
    ],
    conseil: "Toujours lever une forme indéterminée avant de conclure — ne jamais écrire ∞/∞ = 1.",
    exemple: 'lim (x²−1)/(x−1) en x→1 = lim (x+1) = 2' },
  { id: 'm13', subject: 'Maths', niveau: ['Lycée'], titre: 'Calculer une intégrale définie', type: 'Analyse',
    steps: [
      { label: 'Trouver une primitive F(x)', detail: 'Règles inverses de la dérivation : ∫xⁿ = xⁿ⁺¹/(n+1).' },
      { label: 'Appliquer le théorème fondamental', detail: '∫[a,b] f(x)dx = F(b) − F(a).' },
      { label: 'Calculer', detail: 'Substituer les bornes et soustraire.' },
      { label: 'Interpréter', detail: 'Aire algébrique entre la courbe et l\'axe des abscisses.' },
    ],
    conseil: "Vérifier le signe de f(x) sur l'intervalle pour calculer l'aire géométrique correctement.",
    exemple: '∫[0,2] x²dx = [x³/3]₀² = 8/3 − 0 = 8/3' },
  { id: 'm14', subject: 'Maths', niveau: ['Lycée'], titre: 'Utiliser la loi binomiale', type: 'Probabilités',
    steps: [
      { label: 'Vérifier les conditions', detail: 'n essais indépendants, succès/échec, probabilité p constante.' },
      { label: 'Identifier n et p', detail: 'n = nombre d\'essais, p = probabilité de succès.' },
      { label: 'Calculer P(X = k)', detail: 'P(X=k) = C(n,k) × pᵏ × (1−p)ⁿ⁻ᵏ' },
      { label: 'Espérance et variance', detail: 'E(X) = np, V(X) = np(1−p).' },
    ],
    conseil: "Vérifier les 4 conditions Bernoulli avant d'appliquer la formule.",
    exemple: 'n=5, p=0.3 → P(X=2) = C(5,2)×0.3²×0.7³ ≈ 0.309' },
  { id: 'm15', subject: 'Maths', niveau: ['Lycée'], titre: 'Raisonner par récurrence', type: 'Démonstration',
    steps: [
      { label: 'Initialisation', detail: 'Vérifier que la propriété est vraie pour n = 0 (ou n = 1).' },
      { label: 'Hypothèse de récurrence', detail: 'Supposer la propriété vraie pour un certain rang n.' },
      { label: 'Hérédité', detail: 'Montrer qu\'elle est alors vraie pour n+1.' },
      { label: 'Conclusion', detail: 'Conclure que la propriété est vraie pour tout entier ≥ rang de départ.' },
    ],
    conseil: "La phrase 'Par le principe de récurrence, P(n) est vraie pour tout n ≥...' est indispensable.",
    exemple: 'Somme 1+2+...+n = n(n+1)/2 → vérifier pour n=1, puis supposer vrai au rang n, montrer au rang n+1.' },
  { id: 'm16', subject: 'Maths', niveau: ['Lycée'], titre: 'Résoudre un problème de géométrie dans l\'espace', type: 'Géométrie',
    steps: [
      { label: 'Mettre en place un repère', detail: 'Choisir O, i, j, k et exprimer les coordonnées des points.' },
      { label: 'Calculer les vecteurs', detail: 'Vecteur AB = B − A (soustraction des coordonnées).' },
      { label: 'Equation de plan ou droite', detail: 'Plan : ax+by+cz+d=0 ; droite : point + direction.' },
      { label: 'Appliquer le produit scalaire', detail: 'u·v = x₁x₂ + y₁y₂ + z₁z₂ ; perpendiculaire si u·v = 0.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Distance de A(1,0,0) au plan x+y+z=6 : d = |1+0+0−6|/√3 = 5/√3' },
  // ── Physique ─────────────────────────────────────────────────────────────────
  { id: 'p2', subject: 'Physique', niveau: ['Lycée', 'Collège'], titre: 'Analyser un circuit électrique', type: 'Électricité',
    steps: [
      { label: 'Identifier série ou parallèle', detail: 'Série : même courant. Parallèle : même tension.' },
      { label: 'Résistances en série', detail: 'Req = R1 + R2 + ...' },
      { label: 'Résistances en parallèle', detail: '1/Req = 1/R1 + 1/R2 + ...' },
      { label: 'Appliquer la loi d\'Ohm', detail: 'U = R × I — unités : V, Ω, A.' },
      { label: 'Loi des nœuds / mailles', detail: 'Nœud : ΣI entrants = ΣI sortants. Maille : ΣU = 0.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'R1=10Ω et R2=20Ω en série → Req=30Ω. Si U=12V → I=0.4A' },
  { id: 'p3', subject: 'Physique', niveau: ['Lycée'], titre: 'Étudier un mouvement mécanique', type: 'Mécanique',
    steps: [
      { label: 'Définir le système et le référentiel', detail: 'Quel objet ? Dans quel référentiel (terrestre, géocentrique) ?' },
      { label: 'Bilan des forces', detail: 'Lister poids, réaction normale, frottements, tension...' },
      { label: 'Appliquer la 2e loi de Newton', detail: 'ΣF = ma — vecteur. Projeter sur les axes.' },
      { label: 'Intégrer pour trouver v(t) et x(t)', detail: 'a → v(t) par intégration, v(t) → x(t).' },
      { label: 'Conclure', detail: 'Analyser le type de mouvement (uniforme, uniformément varié...).' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Chute libre : a = −g = −9.8 m/s², v(t) = −gt, z(t) = −½gt²+h₀' },
  { id: 'p4', subject: 'Physique', niveau: ['Lycée'], titre: 'Analyser des ondes et signaux', type: 'Ondes',
    steps: [
      { label: 'Identifier période et fréquence', detail: 'T = période (s), f = 1/T (Hz).' },
      { label: 'Calculer la célérité', detail: 'v = λ × f (λ = longueur d\'onde en m).' },
      { label: 'Retard temporel', detail: 'Δt = d / v — distance parcourue sur célérité.' },
      { label: 'Diffraction et interférences', detail: 'Interférences constructives : δ = kλ ; destructives : δ = (k+½)λ.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Son, f=440Hz, v=340m/s → λ = 340/440 ≈ 0.77m' },
  { id: 'p5', subject: 'Physique', niveau: ['Lycée'], titre: 'Résoudre un problème d\'optique géométrique', type: 'Optique',
    steps: [
      { label: 'Identifier la lentille', detail: 'Convergente (biconvexe) ou divergente (biconcave).' },
      { label: 'Repérer foyer et distance focale', detail: 'f = distance algébrique OF\' (positive si convergente).' },
      { label: 'Construire l\'image (3 rayons)', detail: 'Rayon parallèle → passe par F\'. Rayon par O → non dévié. Rayon par F → ressort parallèle.' },
      { label: 'Appliquer la relation conjuguée', detail: '1/OA\' − 1/OA = 1/f\'' },
      { label: 'Calculer le grandissement', detail: 'g = OA\'/OA = taille image / taille objet.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'f=20cm, OA=−30cm → 1/OA\' = 1/20 + 1/(−30)⁻¹ … → OA\'=60cm, g=−2' },
  { id: 'p6', subject: 'Physique', niveau: ['Lycée'], titre: 'Étudier une réaction nucléaire', type: 'Nucléaire',
    steps: [
      { label: 'Identifier les nucléons', detail: 'Z = numéro atomique (protons), A = nombre de masse (protons + neutrons).' },
      { label: 'Vérifier la conservation', detail: 'Conservation de A et de Z des deux côtés de la réaction.' },
      { label: 'Calculer le défaut de masse', detail: 'Δm = masse réactifs − masse produits.' },
      { label: 'Énergie libérée', detail: 'E = Δm × c² (en joules) ou Δm × 931.5 MeV/uma.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Fission de U-235 : 235+1 → 139+95+2 (vérifier A et Z).' },
  // ── Chimie ───────────────────────────────────────────────────────────────────
  { id: 'ch1', subject: 'Chimie', niveau: ['Lycée'], titre: 'Équilibrer une équation de réaction chimique', type: 'Méthode',
    steps: [
      { label: 'Écrire les formules brutes', detail: 'Réactifs à gauche, produits à droite de la flèche.' },
      { label: 'Compter les atomes de chaque élément', detail: 'Tableau des atomes avant/après.' },
      { label: 'Ajouter des coefficients stœchiométriques', detail: 'Ajuster devant les formules sans les modifier.' },
      { label: 'Vérifier l\'équilibre', detail: 'Chaque élément doit avoir le même nombre d\'atomes des deux côtés.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'CH₄ + O₂ → CO₂ + H₂O → CH₄ + 2O₂ → CO₂ + 2H₂O' },
  { id: 'ch2', subject: 'Chimie', niveau: ['Lycée'], titre: 'Calculer un pH et analyser une solution', type: 'Acides-Bases',
    steps: [
      { label: 'Identifier acide ou base', detail: 'Acide : donne H⁺. Base : accepte H⁺ (Brønsted).' },
      { label: 'Calculer la concentration en H₃O⁺', detail: 'Acide fort : [H₃O⁺] = Ca. Acide faible : Ka à utiliser.' },
      { label: 'Calculer le pH', detail: 'pH = −log([H₃O⁺]).' },
      { label: 'Interpréter', detail: 'pH < 7 : acide. pH = 7 : neutre. pH > 7 : basique.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'HCl 0.01 mol/L → [H₃O⁺]=0.01 → pH = −log(0.01) = 2' },
  { id: 'ch3', subject: 'Chimie', niveau: ['Lycée'], titre: 'Réaliser une synthèse organique', type: 'Chimie organique',
    steps: [
      { label: 'Identifier les groupes fonctionnels', detail: 'Alcool (−OH), ester (−COO−), acide carboxylique (−COOH), etc.' },
      { label: 'Écrire la réaction', detail: 'Identifier réactifs, conditions (catalyseur, température, solvant).' },
      { label: 'Calculer le rendement', detail: 'η = (quantité obtenue / quantité théorique) × 100 %.' },
      { label: 'Contrôler la pureté', detail: 'CCM, point de fusion, spectroscopie IR/RMN.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Estérification : alcool + acide carboxylique → ester + eau (catalyseur H⁺, chauffage).' },
  { id: 'ch4', subject: 'Chimie', niveau: ['Lycée'], titre: 'Utiliser la spectroscopie IR et RMN', type: 'Analyse',
    steps: [
      { label: 'Spectre IR — identifier les bandes', detail: 'O−H large ~3200-3600. C=O sharp ~1700-1750. N−H ~3300.' },
      { label: 'Déduire les groupes fonctionnels', detail: 'Chaque bande caractéristique = groupe fonctionnel potentiel.' },
      { label: 'Spectre RMN — compter les signaux', detail: 'Chaque signal = groupe de H équivalents (environnement identique).' },
      { label: 'Déplacements chimiques', detail: 'δ (ppm) : CH₃ ~0.9, CH₂ ~1.3, ArH ~7, CHO ~9-10.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Signal RMN à δ≈2 + bande IR à 1715 cm⁻¹ → cétone probable.' },
  // ── SVT ──────────────────────────────────────────────────────────────────────
  { id: 's2', subject: 'SVT', niveau: ['Lycée', 'Collège'], titre: 'Analyser une expérience scientifique (démarche)', type: 'Méthode',
    steps: [
      { label: 'Formuler le problème', detail: 'Quelle question l\'expérience cherche-t-elle à répondre ?' },
      { label: 'Émettre une hypothèse', detail: 'Proposition testable, formulée clairement.' },
      { label: 'Décrire le protocole', detail: 'Témoin vs expérimental ; variable testée et variables contrôlées.' },
      { label: 'Analyser les résultats', detail: 'Comparer témoin et expérimental, quantifier si possible.' },
      { label: 'Conclure', detail: 'L\'hypothèse est-elle confirmée ou infirmée ? Limites ?' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Effet de la lumière sur la photosynthèse : témoin obscurité, expérimental lumière → comparer production O₂.' },
  { id: 's3', subject: 'SVT', niveau: ['Lycée'], titre: 'Comprendre la division cellulaire (mitose)', type: 'Génétique',
    steps: [
      { label: 'Interphase', detail: 'La cellule duplique son ADN : 2n → 4n (chromatides sœurs formées).' },
      { label: 'Prophase', detail: 'Condensation des chromosomes, disparition de l\'enveloppe nucléaire.' },
      { label: 'Métaphase', detail: 'Chromosomes alignés sur la plaque équatoriale.' },
      { label: 'Anaphase', detail: 'Séparation des chromatides sœurs vers les pôles.' },
      { label: 'Télophase', detail: 'Reconstitution des noyaux, division du cytoplasme → 2 cellules filles 2n identiques.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: '2n=46 chez l\'humain → mitose → 2 cellules à 46 chromosomes.' },
  { id: 's4', subject: 'SVT', niveau: ['Lycée'], titre: 'Expliquer la transmission héréditaire (lois de Mendel)', type: 'Génétique',
    steps: [
      { label: 'Identifier les allèles', detail: 'Dominants (A) / récessifs (a). Phénotype lié au génotype.' },
      { label: 'Croiser les génotypes (grille de Punnett)', detail: 'Écrire les gamètes, remplir la grille.' },
      { label: 'Calculer les proportions', detail: 'Lire les génotypes et phénotypes obtenus dans la grille.' },
      { label: 'Interpréter', detail: 'Loi de ségrégation : chaque gamète ne porte qu\'un allèle de chaque paire.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Aa × Aa → 1/4 AA, 2/4 Aa, 1/4 aa → 3/4 phénotype dominant.' },
  { id: 's5', subject: 'SVT', niveau: ['Lycée'], titre: 'Analyser un argument de tectonique des plaques', type: 'Géologie',
    steps: [
      { label: 'Identifier le type de limite', detail: 'Divergente (dorsale), convergente (subduction/collision), transformante.' },
      { label: 'Utiliser les arguments', detail: 'Âge du plancher océanique, anomalies magnétiques, sismicité, volcanisme.' },
      { label: 'Décrire le mouvement', detail: 'Vitesse en cm/an, direction, conséquences géologiques.' },
      { label: 'Relier à la surface', detail: 'Chaînes de montagnes = convergence continentale. Rift = divergence.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Dorsale médio-atlantique : âge 0 au centre, augmente vers les bords → expansion des fonds océaniques.' },
  { id: 's6', subject: 'SVT', niveau: ['Lycée'], titre: 'Expliquer le fonctionnement du système immunitaire', type: 'Immunologie',
    steps: [
      { label: 'Immunité innée (non spécifique)', detail: 'Phagocytose par macrophages et neutrophiles — réaction rapide.' },
      { label: 'Présentation de l\'antigène', detail: 'Les cellules dendritiques présentent l\'antigène aux lymphocytes T.' },
      { label: 'Réponse humorale', detail: 'Lymphocytes B → plasmocytes → anticorps spécifiques de l\'antigène.' },
      { label: 'Réponse cellulaire', detail: 'Lymphocytes T cytotoxiques détruisent les cellules infectées.' },
      { label: 'Mémoire immunitaire', detail: 'Cellules mémoire : réponse secondaire plus rapide et plus forte.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Vaccin = injecter antigène inactivé → mémoire immunitaire → protection durable.' },
  // ── Histoire ─────────────────────────────────────────────────────────────────
  { id: 'h2', subject: 'Histoire', niveau: ['Lycée', 'Collège'], titre: 'Analyser un document historique', type: 'Méthode',
    steps: [
      { label: 'Présenter le document', detail: 'Nature, auteur, date, contexte de production.' },
      { label: 'Identifier l\'idée directrice', detail: 'Quel est le message principal ?' },
      { label: 'Extraire les informations clés', detail: 'Citer le document, analyser chaque argument.' },
      { label: 'Confronter à vos connaissances', detail: 'Compléter, nuancer ou contredire avec le cours.' },
      { label: 'Porter un regard critique', detail: 'Biais de l\'auteur, limites, portée du document.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Discours de De Gaulle (18 juin 1940) : nature=discours radio, contexte=défaite France, idée=continuer la résistance.' },
  { id: 'h3', subject: 'Histoire', niveau: ['Lycée'], titre: 'Expliquer la Guerre Froide (1947–1991)', type: 'Cours',
    steps: [
      { label: 'Contexte de départ', detail: 'Après 1945 : monde bipolaire USA (capitalisme) vs URSS (communisme).' },
      { label: 'Les phases clés', detail: 'Blocus Berlin 1948, guerre de Corée 1950-53, crise des missiles 1962, détente 1970s, fin 1989-91.' },
      { label: 'Les moyens', detail: 'Course aux armements, conquête spatiale, idéologie, guerres par procuration.' },
      { label: 'La fin', detail: 'Chute du mur de Berlin (1989), dissolution URSS (1991).' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Crise des missiles de Cuba (1962) = point le plus proche d\'une guerre nucléaire directe.' },
  { id: 'h4', subject: 'Histoire', niveau: ['Lycée', 'Collège'], titre: 'Rédiger un paragraphe argumenté en histoire', type: 'Méthode rédac.',
    steps: [
      { label: 'Énoncé de l\'argument', detail: 'Commencer par une phrase affirmant clairement votre idée.' },
      { label: 'Preuve / exemple', detail: 'Citer un fait historique précis (date, événement, acteur).' },
      { label: 'Explication', detail: 'Expliquer pourquoi cet exemple prouve votre argument.' },
      { label: 'Lien', detail: 'Phrase de transition vers le paragraphe suivant.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Idée : la Révolution industrielle transforme les sociétés. Preuve : développement des villes entre 1800-1850. Explication : exode rural, prolétariat urbain...' },
  // ── Géographie ───────────────────────────────────────────────────────────────
  { id: 'geo1', subject: 'Géographie', niveau: ['Lycée', 'Collège'], titre: 'Réaliser un croquis de géographie', type: 'Méthode',
    steps: [
      { label: 'Lire le sujet et dégager le thème', detail: 'Mondialisation ? Développement ? Urbanisation ? Environnement ?' },
      { label: 'Concevoir la légende', detail: 'Organiser en parties (I, II, III), choisir figurés (couleurs, hachures, flèches, points).' },
      { label: 'Reporter sur le fond de carte', detail: 'Tracer les éléments du plus général au plus précis.' },
      { label: 'Titrer et légender', detail: 'Titre clair, légende complète et organisée sous le croquis.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Croquis mondialisation : pôles de la triade (couleur), flux commerciaux (flèches), périphéries intégrées/marginalisées.' },
  { id: 'geo2', subject: 'Géographie', niveau: ['Lycée'], titre: 'Analyser un espace géographique (composition)', type: 'Méthode',
    steps: [
      { label: 'Définir l\'espace étudié', detail: 'Délimiter, situer à différentes échelles (local, national, mondial).' },
      { label: 'Identifier les acteurs', detail: 'États, FMN, ONG, populations locales...' },
      { label: 'Analyser les dynamiques', detail: 'Évolution, flux, inégalités, aménagements.' },
      { label: 'Problématiser', detail: 'Tensions, enjeux, perspectives.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'L\'Asie orientale : façade maritime, hub mondial, inégalités Nord-Sud (Japon vs pays émergents).' },
  // ── Français Lycée ───────────────────────────────────────────────────────────
  { id: 'f4', subject: 'Français', niveau: ['Lycée'], titre: 'Rédiger un commentaire composé', type: 'Méthode rédac.',
    steps: [
      { label: 'Lire attentivement le texte', detail: 'Identifier genre, mouvement, registre, procédés stylistiques.' },
      { label: 'Trouver 2 axes d\'analyse', detail: 'Chaque axe = angle d\'interprétation (thème, forme, effet).' },
      { label: 'Construire le plan', detail: 'Introduction (texte, axes) + 2 parties (2-3 sous-parties chacune) + conclusion.' },
      { label: 'Rédiger avec citations', detail: 'Chaque analyse appuyée par une citation du texte entre guillemets.' },
      { label: 'Introduction et conclusion', detail: 'Intro : auteur/œuvre/contexte/problématique. Conclusion : bilan + ouverture.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Poème de Baudelaire : axe 1 = la beauté mélancolique, axe 2 = la tension spleen/idéal.' },
  { id: 'f5', subject: 'Français', niveau: ['Lycée'], titre: 'Réaliser une contraction de texte', type: 'Méthode',
    steps: [
      { label: 'Lire le texte entier', detail: 'Identifier le type de texte et le thème général.' },
      { label: 'Découper en paragraphes', detail: 'Résumer l\'idée essentielle de chaque paragraphe en 1 phrase.' },
      { label: 'Calculer le taux de réduction', detail: 'Généralement 1/4 ou 1/3 du texte original (compter les mots).' },
      { label: 'Rédiger', detail: 'Phrases courtes, style neutre, pas de guillemets, pas d\'opinion personnelle.' },
      { label: 'Vérifier le compte de mots', detail: 'Indiquer le nombre de mots à la fin (±10 %).' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Texte de 400 mots → contraction de 100 mots (±10 mots).' },
  { id: 'f6', subject: 'Français', niveau: ['Lycée', 'Collège'], titre: 'Identifier et analyser les figures de style', type: 'Stylistique',
    steps: [
      { label: 'Métaphore / Comparaison', detail: 'Comparaison : "comme". Métaphore : identification directe sans outil.' },
      { label: 'Anaphore / Épiphore', detail: 'Anaphore : répétition en début de vers/phrase. Épiphore : en fin.' },
      { label: 'Hyperbole / Litote / Euphémisme', detail: 'Hyperbole : exagération. Litote : dire moins pour suggérer plus. Euphémisme : adoucir.' },
      { label: 'Antithèse / Oxymore / Paradoxe', detail: 'Antithèse : opposés dans une structure. Oxymore : opposés fusionnés. Paradoxe : contradiction apparente.' },
      { label: 'Interpréter l\'effet', detail: 'Pourquoi l\'auteur utilise-t-il cette figure ? Quel effet produit-elle sur le lecteur ?' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: '"Cette obscure clarté qui tombe des étoiles" (Corneille) → oxymore : tension poétique nuit/lumière.' },
  { id: 'f7', subject: 'Français', niveau: ['Collège', 'Lycée'], titre: 'Maîtriser la conjugaison des temps', type: 'Grammaire',
    steps: [
      { label: 'Présent de l\'indicatif', detail: 'Action en cours / vérité générale. Terminaisons : −e/−es/−e/−ons/−ez/−ent (1er groupe).' },
      { label: 'Imparfait', detail: 'Description ou action répétée dans le passé. Terminaisons : −ais/−ais/−ait/−ions/−iez/−aient.' },
      { label: 'Passé composé', detail: 'Action achevée avec lien présent. Auxiliaire avoir/être + participe passé.' },
      { label: 'Passé simple', detail: 'Action passée ponctuelle (écrit littéraire). −ai/−as/−a/−âmes/−âtes/−èrent.' },
      { label: 'Subjonctif présent', detail: 'Après que + verbe de doute/volonté/sentiment : que je sois, que tu aies...' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Il faut que tu ailles → subjonctif présent de "aller".' },
  { id: 'f8', subject: 'Français', niveau: ['Collège'], titre: 'Construire un texte argumentatif', type: 'Méthode rédac.',
    steps: [
      { label: 'Thèse et antithèse', detail: 'Identifier la position défendue (thèse) et les objections (antithèse).' },
      { label: 'Trouver des arguments', detail: 'Au moins 2 arguments solides avec exemples précis.' },
      { label: 'Plan dialectique ou thématique', detail: 'Dialectique : thèse / antithèse / synthèse. Thématique : 3 aspects du sujet.' },
      { label: 'Connecteurs logiques', detail: 'Ajout : de plus, en outre. Opposition : cependant, néanmoins. Cause : car, puisque. Conséquence : donc, ainsi.' },
      { label: 'Conclusion', detail: 'Résumer la position défendue, ouvrir sur une question plus large.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Sujet : les réseaux sociaux sont-ils bénéfiques ? Thèse (oui) : lien social, info. Antithèse (non) : addiction, désinformation.' },
  // ── Anglais ──────────────────────────────────────────────────────────────────
  { id: 'a2', subject: 'Anglais', niveau: ['Lycée', 'Collège'], titre: 'Utiliser les modaux anglais', type: 'Grammaire',
    steps: [
      { label: 'Can / Could', detail: 'Can = capacité présente. Could = capacité passée ou possibilité polie.' },
      { label: 'Must / Have to', detail: 'Must = obligation interne. Have to = obligation externe (règle).' },
      { label: 'Should / Ought to', detail: 'Conseil ou recommandation.' },
      { label: 'May / Might', detail: 'Possibilité (may = plus probable, might = moins probable).' },
      { label: 'Will / Would', detail: 'Will = futur certain. Would = conditionnel ou passé de politesse.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: '"You should study more" = conseil. "You must wear a helmet" = règle.' },
  { id: 'a3', subject: 'Anglais', niveau: ['Lycée'], titre: 'Utiliser la voix passive en anglais', type: 'Grammaire',
    steps: [
      { label: 'Structure de base', detail: 'Sujet + be (conjugué) + participe passé + (by + agent).' },
      { label: 'Transformation actif → passif', detail: 'Le COD actif devient sujet du passif. Le sujet actif devient "by + agent" (optionnel).' },
      { label: 'Temps au passif', detail: 'Présent simple : is/are done. Passé : was/were done. Futur : will be done.' },
      { label: 'Quand l\'utiliser', detail: 'Quand l\'agent est inconnu, non important ou évident.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: '"The police arrested the thief" → "The thief was arrested (by the police)".' },
  { id: 'a4', subject: 'Anglais', niveau: ['Lycée', 'Collège'], titre: 'Rédiger un essai argumentatif en anglais', type: 'Méthode rédac.',
    steps: [
      { label: 'Introduction', detail: 'Hook + contexte + thesis statement (position claire en 1 phrase).' },
      { label: 'Corps 1 — argument principal', detail: 'Topic sentence + développement + exemple + lien.' },
      { label: 'Corps 2 — argument/contrargument', detail: 'Nuancer ou opposer avec concession (Although, However...).' },
      { label: 'Conclusion', detail: 'Restate thesis + résumé des arguments + broader point.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Thesis: "Social media has more benefits than drawbacks" → argue both sides, conclude with nuanced position.' },
  { id: 'a5', subject: 'Anglais', niveau: ['Lycée', 'Collège'], titre: 'Utiliser les conditionnels anglais', type: 'Grammaire',
    steps: [
      { label: 'Type 0 — vérité générale', detail: 'If + présent, présent. "If you heat water, it boils."' },
      { label: 'Type 1 — possible dans le futur', detail: 'If + présent, will + base verbale. "If it rains, I will stay home."' },
      { label: 'Type 2 — hypothétique présent', detail: 'If + prétérit, would + base. "If I were rich, I would travel."' },
      { label: 'Type 3 — hypothétique passé', detail: 'If + past perfect, would have + PP. "If I had studied, I would have passed."' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Type 3 : "If she had left earlier, she wouldn\'t have missed the train."' },
  // ── Espagnol ─────────────────────────────────────────────────────────────────
  { id: 'e2', subject: 'Espagnol', niveau: ['Lycée', 'Collège'], titre: 'Utiliser le passé en espagnol (pretérito vs imperfecto)', type: 'Grammaire',
    steps: [
      { label: 'Pretérito indefinido', detail: 'Action poncuelle, terminée, avec date/durée précise. Terminaisons : -é/-aste/-ó/-amos/-asteis/-aron.' },
      { label: 'Pretérito imperfecto', detail: 'Description, habitude passée, action en cours interrompue. Terminaisons : -aba/-abas/-aba/-ábamos/-abais/-aban.' },
      { label: 'Choisir le bon temps', detail: 'Action unique et terminée → indefinido. Arrière-plan, description → imperfecto.' },
      { label: 'Verbes irréguliers clés', detail: 'Ser/ir: fui, fuiste, fue... Tener: tuve. Hacer: hice.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Mientras (yo) estudiaba (imperfecto), sonó (indefinido) el teléfono.' },
  { id: 'e3', subject: 'Espagnol', niveau: ['Lycée'], titre: 'Utiliser le subjonctif espagnol', type: 'Grammaire',
    steps: [
      { label: 'Quand utiliser le subjonctif', detail: 'Après : querer que, esperar que, es importante que, dudar que, para que...' },
      { label: 'Formation', detail: 'Base de la 1ère pers. sing. + terminaisons opposées : -AR → -e/-es/-e/-emos/-éis/-en.' },
      { label: 'Verbes irréguliers', detail: 'Ser: sea. Ir: vaya. Tener: tenga. Hacer: haga.' },
      { label: 'Subjonctif passé', detail: 'Auxiliaire haber au subjonctif + participe passé : que haya hablado.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Es necesario que estudies (subjonctif présent). Me alegra que hayas venido (subjonctif passé).' },
  // ── Allemand ─────────────────────────────────────────────────────────────────
  { id: 'all1', subject: 'Allemand', niveau: ['Lycée', 'Collège'], titre: 'Maîtriser les cas allemands (Kasus)', type: 'Grammaire',
    steps: [
      { label: 'Nominatif (Wer?)', detail: 'Sujet de la phrase. Der/die/das. Exemple : Der Mann schläft.' },
      { label: 'Accusatif (Wen?/Was?)', detail: 'COD de la phrase. Den/die/das. Exemple : Ich sehe den Mann.' },
      { label: 'Datif (Wem?)', detail: 'COI (avec à). Dem/der/dem/den. Exemple : Ich helfe dem Mann.' },
      { label: 'Génitif (Wessen?)', detail: 'Possession. Des/der/des/der. Exemple : Das Auto des Mannes.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Der Lehrer (nom.) gibt dem Schüler (dat.) das Buch (acc.).' },
  { id: 'all2', subject: 'Allemand', niveau: ['Lycée', 'Collège'], titre: 'Construire des phrases avec les verbes de modalité', type: 'Grammaire',
    steps: [
      { label: 'Les 6 Modalverben', detail: 'können (pouvoir), müssen (devoir), wollen (vouloir), dürfen (avoir la permission), sollen (devoir selon autre), möchten (vouloir poliment).' },
      { label: 'Structure de la phrase', detail: 'Modal conjugué en 2e position + infinitif en FIN de phrase.' },
      { label: 'Conjugaison irrégulière', detail: 'können : ich kann, du kannst, er kann. müssen : ich muss, du musst.' },
      { label: 'Passé des modaux', detail: 'Parfait avec "haben" + infinitif double : Er hat kommen müssen.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Ich muss morgen früh aufstehen. — Ich möchte einen Kaffee trinken.' },
  // ── Philosophie ──────────────────────────────────────────────────────────────
  { id: 'ph2', subject: 'Philosophie', niveau: ['Lycée'], titre: 'Rédiger une dissertation philosophique', type: 'Méthode',
    steps: [
      { label: 'Analyser le sujet', detail: 'Définir chaque terme du sujet. Repérer la tension, le paradoxe ou le problème.' },
      { label: 'Formuler la problématique', detail: 'Question précise qui exprime la tension entre deux positions défendables.' },
      { label: 'Construire le plan dialectique', detail: 'I : thèse (position 1). II : antithèse (objection). III : synthèse (dépassement).' },
      { label: 'Mobiliser les auteurs', detail: 'Au moins 2 auteurs avec œuvre et concept précis par partie.' },
      { label: 'Introduction et conclusion', detail: 'Intro : accroche → analyse → problématique → annonce du plan. Conclusion : bilan + ouverture.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Sujet "La liberté est-elle une illusion ?" → tension déterminisme / libre-arbitre → Sartre vs Spinoza.' },
  { id: 'ph3', subject: 'Philosophie', niveau: ['Lycée'], titre: 'Grands auteurs et concepts essentiels', type: 'Cours',
    steps: [
      { label: 'Platon', detail: 'Allégorie de la caverne — distinction monde sensible / monde des idées. République, Phédon.' },
      { label: 'Descartes', detail: '"Je pense donc je suis" — cogito. Dualisme corps/âme. Méditations Métaphysiques.' },
      { label: 'Kant', detail: 'Impératif catégorique — agis selon une maxime universalisable. Critique de la raison pure.' },
      { label: 'Nietzsche', detail: 'Mort de Dieu, volonté de puissance, éternel retour. Ainsi parlait Zarathoustra.' },
      { label: 'Sartre', detail: '"L\'existence précède l\'essence" — liberté radicale, mauvaise foi. L\'Être et le Néant.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Sur la liberté : Sartre (liberté absolue) vs Spinoza (tout est déterminé) → débat profond.' },
  // ── NSI / Informatique ───────────────────────────────────────────────────────
  { id: 'n2', subject: 'NSI/Informatique', niveau: ['Lycée'], titre: 'Trier une liste avec les algorithmes de tri', type: 'Algorithmique',
    steps: [
      { label: 'Tri par sélection', detail: 'Chercher le minimum, le placer en tête, répéter. Complexité O(n²).' },
      { label: 'Tri par insertion', detail: 'Insérer chaque élément à la bonne place dans la partie déjà triée. O(n²) pire cas, O(n) meilleur.' },
      { label: 'Tri fusion (Merge Sort)', detail: 'Diviser en 2 moitiés, trier récursivement, fusionner. O(n log n).' },
      { label: 'Comparer les complexités', detail: 'O(n²) : lent sur grands tableaux. O(n log n) : efficace. Choisir selon la taille des données.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Trier [5,3,1,4,2] par sélection : min=1 → [1,3,5,4,2] → min=2 → [1,2,5,4,3]...' },
  { id: 'n3', subject: 'NSI/Informatique', niveau: ['Lycée'], titre: 'Manipuler une base de données SQL', type: 'Base de données',
    steps: [
      { label: 'SELECT — requête de base', detail: 'SELECT colonnes FROM table WHERE condition ORDER BY colonne.' },
      { label: 'Jointures (JOIN)', detail: 'INNER JOIN : lignes communes. LEFT JOIN : tout de gauche + correspondances.' },
      { label: 'Agrégation', detail: 'COUNT(), SUM(), AVG(), MAX(), MIN() — avec GROUP BY pour grouper.' },
      { label: 'Modification des données', detail: 'INSERT INTO, UPDATE ... SET ... WHERE, DELETE FROM ... WHERE.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'SELECT nom, COUNT(*) FROM eleves GROUP BY classe HAVING COUNT(*) > 20;' },
  { id: 'n4', subject: 'NSI/Informatique', niveau: ['Lycée'], titre: 'Comprendre les structures de données (listes, arbres, graphes)', type: 'Structures',
    steps: [
      { label: 'Listes et piles/files', detail: 'Liste : accès par indice. Pile (LIFO) : push/pop. File (FIFO) : enqueue/dequeue.' },
      { label: 'Arbres binaires', detail: 'Nœud racine, nœuds internes, feuilles. Hauteur, parcours (préfixe, infixe, postfixe).' },
      { label: 'Graphes', detail: 'Sommets + arêtes. Orienté/non-orienté. Pondéré/non-pondéré.' },
      { label: 'Parcours de graphes', detail: 'BFS (largeur, file) pour le chemin le plus court. DFS (profondeur, récursif/pile).' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'BFS sur graphe : file = [A] → visite A, ajoute B,C → file=[B,C] → visite B...' },
  { id: 'n5', subject: 'NSI/Informatique', niveau: ['Lycée'], titre: 'Comprendre les réseaux informatiques', type: 'Réseaux',
    steps: [
      { label: 'Modèle OSI / TCP-IP', detail: '7 couches OSI : physique, liaison, réseau, transport, session, présentation, application.' },
      { label: 'Protocoles clés', detail: 'IP : adressage. TCP : fiabilité. UDP : rapidité. HTTP/HTTPS : web. DNS : noms → IP.' },
      { label: 'Adressage IP', detail: 'IPv4 : 4 octets (ex: 192.168.1.1). Masque réseau. Sous-réseaux.' },
      { label: 'Routage', detail: 'Les routeurs acheminent les paquets en utilisant des tables de routage.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Taper "google.com" → DNS résout en IP → TCP connexion → HTTP GET → réponse HTML.' },
  // ── SES / Économie ────────────────────────────────────────────────────────────
  { id: 'ses1', subject: 'Économie/SES', niveau: ['Lycée'], titre: 'Analyser la croissance économique et le PIB', type: 'Économie',
    steps: [
      { label: 'Définir le PIB', detail: 'Produit Intérieur Brut = somme des valeurs ajoutées sur un territoire sur une période.' },
      { label: 'Calculer le taux de croissance', detail: '[(PIBt − PIBt-1) / PIBt-1] × 100.' },
      { label: 'Facteurs de croissance', detail: 'Travail (quantité et qualité), capital physique, progrès technique (PTF).' },
      { label: 'Limites du PIB', detail: 'Ne mesure pas le bonheur, les inégalités, l\'environnement → IDH, BIB.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'PIB 2023 = 2800 Md€, PIB 2022 = 2750 Md€ → taux = (50/2750)×100 ≈ 1.8%' },
  { id: 'ses2', subject: 'Économie/SES', niveau: ['Lycée'], titre: 'Comprendre le fonctionnement d\'un marché', type: 'Microéconomie',
    steps: [
      { label: 'Offre et demande', detail: 'Loi de la demande : prix ↑ → demande ↓. Loi de l\'offre : prix ↑ → offre ↑.' },
      { label: 'Prix d\'équilibre', detail: 'Point où offre = demande. Toute déviation crée surplus ou pénurie.' },
      { label: 'Défaillances du marché', detail: 'Externalités (pollution), biens publics, asymétries d\'information, monopoles.' },
      { label: 'Rôle de l\'État', detail: 'Régulation, taxation, subventions, législation anti-trust.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Marché du travail : offre (employeurs) + demande (salariés) → salaire d\'équilibre.' },
  { id: 'ses3', subject: 'Économie/SES', niveau: ['Lycée'], titre: 'Analyser les inégalités et la mobilité sociale', type: 'Sociologie',
    steps: [
      { label: 'Mesurer les inégalités', detail: 'Rapport interdécile (D9/D1), coefficient de Gini, courbe de Lorenz.' },
      { label: 'Types d\'inégalités', detail: 'Économiques (revenus, patrimoine), sociales (éducation, santé, logement), de genre.' },
      { label: 'Mobilité sociale', detail: 'Intergénérationnelle (enfant vs parent) : ascendante, descendante ou immobilité.' },
      { label: 'Facteurs de mobilité', detail: 'École (méritocratie), capital social, conjoncture économique, politiques redistributives.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Table de mobilité : fils d\'ouvrier devenu cadre = mobilité ascendante intergénérationnelle.' },
  // ── Primaire ─────────────────────────────────────────────────────────────────
  { id: 'prim1', subject: 'Maths', niveau: ['Primaire'], titre: 'Apprendre les tables de multiplication', type: 'Calcul',
    steps: [
      { label: 'Comprendre le sens', detail: '3 × 4 = 3 groupes de 4 = 4 + 4 + 4 = 12.' },
      { label: 'Table par table', detail: 'Commencer par ×2, ×5, ×10 (plus faciles), puis ×3, ×4, ×6, ×7, ×8, ×9.' },
      { label: 'Trucs mnémotechniques', detail: '×9 : chiffres des dizaines montent, chiffres des unités descendent (09, 18, 27, 36...).' },
      { label: 'Pratiquer quotidiennement', detail: 'Flashcards, récitation, jeux en ligne — 10 min par jour suffit !' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: '7 × 8 = 56. Astuce : 7×8 = 56 → retenir "5, 6, 7, 8" — cinq-six-sept-huit !' },
  { id: 'prim2', subject: 'Français', niveau: ['Primaire'], titre: 'Lire et comprendre un texte (cycle 2 et 3)', type: 'Lecture',
    steps: [
      { label: 'Lire une première fois', detail: 'Lire en entier sans s\'arrêter pour comprendre le sens global.' },
      { label: 'Identifier les personnages', detail: 'Qui parle ? Qui sont les personnages principaux ? Que font-ils ?' },
      { label: 'Repérer le lieu et le temps', detail: 'Où se passe l\'histoire ? À quelle époque ?' },
      { label: 'Trouver l\'idée principale', detail: 'En 1 ou 2 phrases, de quoi parle ce texte ?' },
      { label: 'Répondre aux questions', detail: 'Aller chercher la réponse dans le texte, surligner si possible.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Texte sur les abeilles → personnage : l\'abeille reine → lieu : la ruche → idée : les abeilles fabriquent du miel.' },
  { id: 'prim3', subject: 'Maths', niveau: ['Primaire'], titre: 'Poser et calculer une addition ou soustraction', type: 'Calcul',
    steps: [
      { label: 'Aligner les unités', detail: 'Unités sous unités, dizaines sous dizaines, centaines sous centaines.' },
      { label: 'Commencer par les unités', detail: 'Additionner (ou soustraire) de droite à gauche.' },
      { label: 'Gérer la retenue', detail: 'Addition : si somme ≥ 10, écrire les unités, retenir 1 dizaine. Soustraction : si besoin, emprunter.' },
      { label: 'Vérifier', detail: 'Addition : résultat − l\'un des termes = l\'autre terme. Soustraction : vérifier par addition.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: '347 + 256 : 7+6=13 (écrire 3, retenir 1) ; 4+5+1=10 (écrire 0, retenir 1) ; 3+2+1=6 → 603.' },
  { id: 'prim4', subject: 'Français', niveau: ['Primaire'], titre: 'Accorder les noms et adjectifs en genre et nombre', type: 'Grammaire',
    steps: [
      { label: 'Identifier le nom', detail: 'Trouver le nom principal du groupe nominal.' },
      { label: 'Genre : masculin ou féminin', detail: 'Féminin : souvent −e à l\'adjectif. Attention aux irréguliers (beau/belle, vieux/vieille).' },
      { label: 'Nombre : singulier ou pluriel', detail: 'Pluriel : généralement −s. Attention : −al → −aux (cheval → chevaux).' },
      { label: 'Chaîne d\'accord', detail: 'Déterminant + nom + adjectif → tout s\'accorde ensemble.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'Une belle fleur rouge → fleur (féminin singulier) → belle (fém. sing.), rouge (invariable en genre mais prend -s au pluriel).' },
  { id: 'prim5', subject: 'Maths', niveau: ['Primaire'], titre: 'Comparer et ordonner des nombres entiers', type: 'Numération',
    steps: [
      { label: 'Compter les chiffres', detail: 'Le nombre avec le plus de chiffres est toujours le plus grand.' },
      { label: 'Comparer chiffre par chiffre', detail: 'Commencer par la gauche (le plus grand rang).' },
      { label: 'Utiliser les signes', detail: '< (inférieur à), > (supérieur à), = (égal à).' },
      { label: 'Ranger sur une droite numérique', detail: 'Plus on va à droite, plus le nombre est grand.' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: '4572 vs 4389 → même nombre de chiffres → comparer milliers : 4=4 → comparer centaines : 5 > 3 → 4572 > 4389.' },
  { id: 'prim6', subject: 'Sciences', niveau: ['Primaire'], titre: 'Observer et classer les animaux', type: 'Sciences',
    steps: [
      { label: 'Mammifères', detail: 'Ont des poils, allaitent leurs petits. Ex : chien, baleine, chauve-souris.' },
      { label: 'Oiseaux', detail: 'Ont des plumes, pondent des œufs, ont un bec. Ex : aigle, pingouin.' },
      { label: 'Reptiles', detail: 'Ont des écailles, sang froid, pondent des œufs. Ex : serpent, crocodile.' },
      { label: 'Amphibiens', detail: 'Vivent sur terre et dans l\'eau, peau nue. Ex : grenouille, salamandre.' },
      { label: 'Poissons et invertébrés', detail: 'Poissons : nageoires, branchies. Invertébrés : insectes (6 pattes), araignées (8 pattes)...' },
    ],
    conseil: "Relire les étapes à voix haute pour repérer les erreurs de logique avant de rendre la copie.",
    exemple: 'La baleine → mammifère (allaite, sang chaud, poumons) malgré sa vie aquatique.' },

] as FicheMethode[];

// ─── Ressources pédagogiques vérifiées (sans IA) ──────────────────────────────
const RESSOURCES: Record<string, Ressource[]> = {
  'Maths': [
    { label: 'Maths et Tiques — Yvan Monka', url: 'https://www.maths-et-tiques.fr', desc: 'Cours vidéo + exercices corrigés, du collège à la terminale.', tag: 'Lycée & Sup' },
    { label: 'Lelivrescolaire.fr — Maths', url: 'https://www.lelivrescolaire.fr/matiere/mathematiques', desc: 'Cours et exercices conformes aux programmes, gratuits.', tag: 'Cours' },
  ],
  'Physique': [
    { label: 'Lumni — Physique-Chimie', url: 'https://www.lumni.fr/lycee', desc: 'Vidéos pédagogiques officielles, niveau lycée.', tag: 'Vidéos' },
  ],
  'Chimie': [
    { label: 'Chimie — EduMedia Sciences', url: 'https://www.edumedia-sciences.com/fr/', desc: 'Animations interactives de chimie et de physique, lycée/prépa.', tag: 'Interactif' },
  ],
  'SVT': [
    { label: 'Lumni — SVT', url: 'https://www.lumni.fr/lycee', desc: 'Vidéos documentaires SVT, programmes lycée officiels.', tag: 'Vidéos' },
    { label: 'Futura Sciences — Planète & Vie', url: 'https://www.futura-sciences.com/planete/', desc: 'Articles scientifiques vulgarisés + glossaire précis.', tag: 'Vulgarisation' },
  ],
  'Français': [
    { label: 'Projet Voltaire', url: 'https://www.projet-voltaire.fr', desc: 'Entraînement à l\'orthographe et à la grammaire avec explications.', tag: 'Orthographe' },
    { label: 'Bac de Français', url: 'https://www.bacdefrancais.net', desc: 'Fiches méthode bac français, explications linéaires, dissertations.', tag: 'Méthode Bac' },
    { label: 'Bescherelle', url: 'https://bescherelle.com', desc: 'Conjugueur de référence : tous les verbes, tous les temps.', tag: 'Conjugaison' },
  ],
  'Histoire': [
    { label: 'Lumni — Histoire', url: 'https://www.lumni.fr/college', desc: 'Vidéos pédagogiques de l\'INA, programmes collège et lycée.', tag: 'Vidéos' },
    { label: 'Herodote.net', url: 'https://www.herodote.net', desc: 'Encyclopédie d\'histoire fiable avec chronologies détaillées.', tag: 'Encyclopédie' },
    { label: 'Vie publique — Dossiers Hist.', url: 'https://www.vie-publique.fr', desc: 'Dossiers thématiques officiels sur l\'histoire et la société française.', tag: 'Dossiers' },
  ],
  'Géographie': [
    { label: 'Géoconfluences ENS Lyon', url: 'https://geoconfluences.ens-lyon.fr', desc: 'Ressources de géographie validées par des enseignants-chercheurs.', tag: 'Référence' },
    { label: 'Lumni — Géographie', url: 'https://www.lumni.fr/college', desc: 'Vidéos documentaires programmes officiels.', tag: 'Vidéos' },
  ],
  'Anglais': [
    { label: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish', desc: 'Grammaire, vocabulaire, podcasts et quiz par la BBC.', tag: 'Grammaire & Écoute' },
    { label: 'Perfect English Grammar', url: 'https://www.perfect-english-grammar.com', desc: 'Exercices de grammaire anglaise, tous niveaux, gratuit.', tag: 'Exercices' },
    { label: 'WordReference', url: 'https://www.wordreference.com/fr/en/', desc: 'Dictionnaire bilingue + forum de questions de traduction.', tag: 'Dictionnaire' },
  ],
  'Espagnol': [
    { label: 'Cervantes Virtual', url: 'https://www.cervantes.es', desc: 'Institut Cervantes : grammaire et ressources officielles en espagnol.', tag: 'Référence' },
    { label: 'WordReference ES-FR', url: 'https://www.wordreference.com/esfr/', desc: 'Dictionnaire espagnol-français avec exemples.', tag: 'Dictionnaire' },
  ],
  'Philosophie': [
    { label: 'La Philosophie.com', url: 'https://la-philosophie.com', desc: 'Définitions, notions et auteurs — cours de philo lycée.', tag: 'Notions' },
    { label: 'Les Philosophes.fr', url: 'https://les-philosophes.fr', desc: 'Présentation des grands philosophes et de leurs thèses.', tag: 'Auteurs' },
  ],
  'Économie/SES': [
    { label: 'SES-ENS Lyon', url: 'https://ses.ens-lyon.fr', desc: 'Ressources SES validées pour lycée et prépa, rigoureuses.', tag: 'Référence' },
    { label: 'INSEE — Statistiques', url: 'https://www.insee.fr/fr/statistiques', desc: 'Données statistiques officielles pour illustrer les dissertations.', tag: 'Données' },
  ],
  'NSI/Informatique': [
    { label: 'France-ioi', url: 'https://www.france-ioi.org', desc: 'Exercices d\'algorithmique progressifs, du débutant au concours.', tag: 'Algorithmique' },
    { label: 'OpenClassrooms — Python', url: 'https://openclassrooms.com/fr/courses/7168871', desc: 'Cours Python gratuit, structuré et certifiable.', tag: 'Python' },
    { label: 'NSI Lycée', url: 'https://pixees.fr/informatiquelycee/', desc: 'Cours officiels NSI complets par David Roche, alignés sur le programme.', tag: 'Cours NSI' },
  ],
  'Allemand': [
    { label: 'Deutsche Welle — Apprendre', url: 'https://www.dw.com/fr/', desc: 'Cours et actualités en allemand, tous niveaux, par la DW.', tag: 'Cours' },
    { label: 'PONS Dictionnaire', url: 'https://fr.pons.com', desc: 'Dictionnaire allemand-français fiable, avec exemples.', tag: 'Dictionnaire' },
  ],
};

// ─── Données de navigation ────────────────────────────────────────────────────
const SUBJECTS_LIST = [
  { id: 'Maths',            icon: Calculator, color: 'text-chart-1' },
  { id: 'Physique',         icon: FlaskConical, color: 'text-chart-2' },
  { id: 'Chimie',           icon: FlaskConical, color: 'text-chart-2' },
  { id: 'SVT',              icon: BookOpen, color: 'text-success' },
  { id: 'Histoire',         icon: Globe, color: 'text-chart-3' },
  { id: 'Géographie',       icon: Globe, color: 'text-chart-4' },
  { id: 'Français',         icon: Pencil, color: 'text-primary' },
  { id: 'Anglais',          icon: Languages, color: 'text-chart-1' },
  { id: 'Espagnol',         icon: Languages, color: 'text-chart-3' },
  { id: 'Allemand',         icon: Languages, color: 'text-chart-4' },
  { id: 'Philosophie',      icon: BookMarked, color: 'text-chart-2' },
  { id: 'Économie/SES',     icon: BarChart2, color: 'text-chart-3' },
  { id: 'NSI/Informatique', icon: Code, color: 'text-primary' },
];

const ULIS_FICHES: FicheMethode[] = [
  // ── Vie quotidienne ──────────────────────────────────────────────────────────
  {
    id: 'u1', subject: 'Vie quotidienne', niveau: ['ULIS/SEGPA'], titre: 'Lire l\'heure sur une horloge', type: 'Vie pratique',
    steps: [
      { label: 'Regarde la petite aiguille', detail: 'La PETITE aiguille indique les HEURES. Elle est plus courte.' },
      { label: 'Regarde la grande aiguille', detail: 'La GRANDE aiguille indique les MINUTES. Elle tourne plus vite.' },
      { label: 'Si la grande aiguille est sur 12', detail: 'Il est pile l\'heure. Exemple : petite sur 3 + grande sur 12 = 3 heures.' },
      { label: 'Si la grande aiguille est sur 6', detail: 'Il est "et demie" (30 minutes). Petite entre 4 et 5 + grande sur 6 = 4h30.' },
      { label: 'Compter par 5 pour les minutes', detail: 'Chaque chiffre du cadran = 5 minutes. Chiffre 1 = 5 min, chiffre 2 = 10 min…' },
    ],
    conseil: '🎯 Entraîne-toi avec une vraie horloge ou ton réveil. 5 minutes chaque matin et tu mémoriseras vite !',
    exemple: 'Petite aiguille sur 7, grande aiguille sur 3 → 7 heures et quart (7h15) ⏰',
  },
  {
    id: 'u4', subject: 'Vie quotidienne', niveau: ['ULIS/SEGPA'], titre: 'Lire un emploi du temps', type: 'Vie pratique',
    steps: [
      { label: 'Trouve le jour d\'aujourd\'hui', detail: 'Regarde en haut de la colonne : Lundi, Mardi, Mercredi… Trouve le jour où tu es.' },
      { label: 'Lis la ligne de l\'heure', detail: 'Sur la gauche tu vois les heures (8h, 9h, 10h…). Cherche l\'heure actuelle.' },
      { label: 'Croise colonne + ligne', detail: 'La case où la colonne (jour) et la ligne (heure) se croisent = ton cours en ce moment.' },
      { label: 'Prépare le matériel pour le cours suivant', detail: 'Regarde la case juste en dessous pour savoir ce qui vient après la récré.' },
    ],
    conseil: '📅 Colle une photo de ton emploi du temps dans ton agenda ou sur ton téléphone pour l\'avoir toujours avec toi.',
    exemple: 'Mardi à 10h → case "Mardi / 10h" = Mathématiques → je prends mon cahier de maths 📐',
  },
  {
    id: 'u5', subject: 'Vie quotidienne', niveau: ['ULIS/SEGPA'], titre: 'Préparer son cartable', type: 'Vie pratique',
    steps: [
      { label: 'Regarde ton emploi du temps du lendemain', detail: 'Lis chaque matière inscrite pour la journée de demain.' },
      { label: 'Prends le cahier de chaque matière', detail: 'Pour chaque matière, mets dans le cartable : le cahier ET le livre si tu en as un.' },
      { label: 'Vérifie les affaires communes', detail: 'Règle, crayon, gomme, stylo → ils doivent être dans ton plumier CHAQUE jour.' },
      { label: 'Referme et soulève le cartable', detail: 'S\'il est trop lourd, enlève ce qui n\'est pas pour demain.' },
    ],
    conseil: '✅ Fais-le le soir avant, jamais le matin en vitesse. Tu risques d\'oublier quelque chose si tu es fatigué.',
    exemple: 'Demain : maths + français + EPS → cahier maths, cahier français, affaires de sport 🎒',
  },
  // ── Calcul ───────────────────────────────────────────────────────────────────
  {
    id: 'u2', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Faire une addition avec des dizaines', type: 'Calcul',
    steps: [
      { label: 'Écris les chiffres en colonnes', detail: 'Unités sous unités, dizaines sous dizaines. Sers-toi de papier quadrillé !' },
      { label: 'Commence par les unités (à droite)', detail: 'Additionne les chiffres de droite d\'abord. Si le résultat est ≥ 10, tu "retiens" 1.' },
      { label: 'Note la retenue au-dessus', detail: 'Écris le petit "1" au-dessus de la colonne des dizaines pour ne pas l\'oublier.' },
      { label: 'Additionne les dizaines', detail: 'N\'oublie pas d\'ajouter la retenue ! Additionne les trois chiffres si besoin.' },
      { label: 'Lis le résultat', detail: 'Lis le nombre de gauche à droite. C\'est ta réponse !' },
    ],
    conseil: '✅ Tu peux utiliser tes doigts pour les unités. Il n\'y a aucune honte — c\'est une stratégie, pas une faiblesse.',
    exemple: '47 + 35 → unités : 7+5=12 → pose 2, retiens 1 → dizaines : 4+3+1=8 → résultat : 82',
  },
  {
    id: 'u6', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Faire une soustraction simple', type: 'Calcul',
    steps: [
      { label: 'Écris le grand nombre en haut', detail: 'Le plus grand chiffre va toujours EN HAUT. L\'autre va en dessous.' },
      { label: 'Commence par les unités (à droite)', detail: 'Soustrait le chiffre du bas au chiffre du haut. Si c\'est impossible, "emprunte" 1 dizaine.' },
      { label: 'Si tu empruntes', detail: 'Raye la dizaine du haut, mets-en une de moins et ajoute 10 aux unités du haut.' },
      { label: 'Calcule les dizaines', detail: 'Retire maintenant les dizaines. N\'oublie pas d\'enlever 1 si tu avais emprunté.' },
      { label: 'Vérifie par addition', detail: 'Pour vérifier : résultat + chiffre du bas = chiffre du haut ? Si oui, c\'est bon !' },
    ],
    conseil: '🔢 Utilise une frise numérique ou tes doigts. Dessine des bâtons si besoin — tous les moyens sont bons.',
    exemple: '53 − 27 → unités : 3 < 7, j\'emprunte → 13−7=6 → dizaines : 4−2=2 → résultat : 26 ✓ (26+27=53 ✓)',
  },
  {
    id: 'u7', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Mémoriser la table de multiplication par 2', type: 'Calcul',
    steps: [
      { label: 'Comprends ce que ça veut dire', detail: '2 × 3 = ajouter 2 trois fois → 2 + 2 + 2 = 6. Multiplier par 2 = doubler.' },
      { label: 'Apprends avec les doigts', detail: 'Compte de 2 en 2 sur tes doigts : 2, 4, 6, 8, 10, 12, 14, 16, 18, 20.' },
      { label: 'Fais des flashcards', detail: 'Écris "2×6 = ?" d\'un côté, "12" de l\'autre. Joue au quiz avec toi-même ou un ami.' },
      { label: 'Répète 5 minutes par jour', detail: 'Chaque soir avant de dormir, récite la table de 2 à voix haute ou en chantant.' },
    ],
    conseil: '🎵 Mets la table en chanson sur un air que tu aimes. La musique aide beaucoup à mémoriser !',
    exemple: '2×1=2 · 2×2=4 · 2×3=6 · 2×4=8 · 2×5=10 · 2×6=12 · 2×7=14 · 2×8=16 · 2×9=18 · 2×10=20',
  },
  // ── Lecture & Français ───────────────────────────────────────────────────────
  {
    id: 'u3', subject: 'Lecture', niveau: ['ULIS/SEGPA'], titre: 'Trouver l\'idée principale d\'un texte', type: 'Lecture',
    steps: [
      { label: 'Lis le titre', detail: 'Le titre dit souvent DE QUOI parle le texte. C\'est ton premier indice !' },
      { label: 'Lis la 1ère et la dernière phrase', detail: 'L\'idée principale est souvent au début ou à la fin du texte.' },
      { label: 'Demande-toi : "De quoi ça parle ?"', detail: 'En UNE phrase simple, dis le sujet du texte. "Ce texte parle de…"' },
      { label: 'Cherche les mots qui reviennent souvent', detail: 'Les mots répétés sont importants. Ce sont les mots-clés du texte.' },
      { label: 'Écris ta réponse', detail: 'Commence ta phrase par "L\'idée principale de ce texte est…"' },
    ],
    conseil: '💡 Si tu ne comprends pas un mot, saute-le et continue. Tu comprendras souvent le sens grâce au reste.',
    exemple: 'Un texte où "lion", "savane", "chasse" reviennent souvent → idée principale : la vie du lion en Afrique 🦁',
  },
  {
    id: 'u8', subject: 'Français', niveau: ['ULIS/SEGPA'], titre: 'Comprendre une consigne d\'exercice', type: 'Méthode',
    steps: [
      { label: 'Lis la consigne deux fois', detail: 'Lis d\'abord vite, puis lis lentement en t\'arrêtant sur chaque mot important.' },
      { label: 'Souligne le verbe d\'action', detail: 'Cherche le mot qui dit QUOI FAIRE : "entoure", "recopie", "relie", "calcule", "colorie"…' },
      { label: 'Souligne l\'objet de l\'action', detail: 'Sur QUOI tu dois faire l\'action ? "les verbes", "les mots en gras", "les nombres pairs"…' },
      { label: 'Reformule avec tes mots', detail: 'Dis à voix basse : "Je dois ___ les ___". Si tu n\'y arrives pas, demande à l\'enseignant.' },
      { label: 'Commence par un exemple', detail: 'Fais d\'abord le 1er élément pour vérifier que tu as bien compris avant de continuer.' },
    ],
    conseil: '🙋 Demander de l\'aide quand on ne comprend pas une consigne, c\'est intelligent, pas une faiblesse.',
    exemple: '"Entoure les verbes conjugués" → verbe d\'action = entoure · objet = verbes conjugués → je cherche les verbes ✏️',
  },
  {
    id: 'u9', subject: 'Français', niveau: ['ULIS/SEGPA'], titre: 'Écrire une phrase complète', type: 'Écriture',
    steps: [
      { label: 'Commence par un sujet (QUI ?)', detail: 'Le sujet = la personne ou la chose dont tu parles. Ex : "Le chien", "Ma sœur", "Je".' },
      { label: 'Ajoute un verbe (FAIT QUOI ?)', detail: 'Le verbe = l\'action. Ex : "mange", "court", "aime", "est".' },
      { label: 'Complète si besoin (QUOI / OÙ / QUAND ?)', detail: 'Ajoute des informations : "mange une pomme", "court dans le jardin".' },
      { label: 'Commence par une majuscule', detail: 'Le 1er mot de la phrase prend TOUJOURS une majuscule.' },
      { label: 'Termine par un point', detail: 'Chaque phrase se termine par . (point) ou ? (question) ou ! (exclamation).' },
    ],
    conseil: '✍️ Si tu veux écrire mais les lettres sont dures, essaie de dicter à voix haute d\'abord, puis recopie.',
    exemple: '"Le chien mange son repas dans la cuisine." → Sujet : Le chien · Verbe : mange · Complément : son repas dans la cuisine 🐶',
  },
  // ── SEGPA — Orientation professionnelle ──────────────────────────────────────
  {
    id: 'u10', subject: 'Orientation', niveau: ['ULIS/SEGPA'], titre: 'Découvrir les métiers qui m\'intéressent', type: 'Orientation',
    steps: [
      { label: 'Fais la liste de ce que tu aimes faire', detail: 'Cuisiner ? Réparer des trucs ? Aider les gens ? Travailler dehors ? Tout noter, même si ça semble petit.' },
      { label: 'Cherche les métiers liés à tes goûts', detail: 'Aimes les animaux → soigneur animalier, vétérinaire, eleveur. Aimes cuisiner → cuisinier, boulanger, pâtissier.' },
      { label: 'Explore sur l\'ONISEP', detail: 'Va sur onisep.fr → "Découvrir les métiers" → tape un mot-clé. Tu verras le salaire, la formation, les débouchés.' },
      { label: 'Demande un stage d\'observation', detail: 'En SEGPA dès la 5e, tu peux visiter des entreprises. Parle-en à ton professeur principal.' },
    ],
    conseil: '🔍 Il n\'y a pas de mauvais métier. Un métier qui te plaît vraiment = tu seras meilleur et plus heureux.',
    exemple: 'J\'aime cuisiner → recherche "cuisinier" sur ONISEP → CAP Cuisine en 2 ans après le collège → plusieurs débouchés 🍳',
  },
  {
    id: 'u11', subject: 'Orientation', niveau: ['ULIS/SEGPA'], titre: 'Comprendre les diplômes après la SEGPA', type: 'Orientation',
    steps: [
      { label: 'La SEGPA mène au lycée professionnel', detail: 'Après le collège SEGPA, la plupart des élèves entrent en lycée professionnel (LP) pour préparer un CAP ou un Bac Pro.' },
      { label: 'Le CAP en 2 ans', detail: 'CAP = Certificat d\'Aptitude Professionnelle. 2 ans en lycée pro. Beaucoup de pratique. Tu sors avec un vrai diplôme métier.' },
      { label: 'Le Bac Pro en 3 ans', detail: 'Après un CAP (ou directement), tu peux faire un Bac Professionnel en 3 ans. Il ouvre des portes vers des postes plus élevés.' },
      { label: 'Les métiers SEGPA les plus courants', detail: 'Cuisine, boulangerie, coiffure, maçonnerie, menuiserie, mécanique auto, vente, aide à la personne, horticulture…' },
    ],
    conseil: 'Des élèves SEGPA deviennent chefs cuisinier, artisans, entrepreneurs. Le diplôme professionnel, c\'est un vrai tremplin.',
    exemple: 'SEGPA → lycée pro → CAP Boulangerie (2 ans) → Bac Pro Boulanger-Pâtissier (3 ans) → emploi ou BTS 🎓',
  },
  {
    id: 'u12', subject: 'Vie sociale', niveau: ['ULIS/SEGPA'], titre: 'Demander de l\'aide à un adulte', type: 'Vie pratique',
    steps: [
      { label: 'Identifie ce que tu ne comprends pas', detail: 'Dis-toi d\'abord ce qui est dur. "Je ne comprends pas la consigne." ou "Je n\'arrive pas à lire ce mot."' },
      { label: 'Choisit le bon moment', detail: 'Attends que le prof soit disponible (pas quand il explique à la classe). Lève la main ou attends la fin de la question.' },
      { label: 'Utilise une phrase simple', detail: '"Excusez-moi, je n\'ai pas compris…" ou "Je peux avoir de l\'aide pour…?" C\'est suffisant.' },
      { label: 'Écoute la réponse', detail: 'Regarde la personne qui t\'explique. Dis "merci" après. Si tu n\'as toujours pas compris, tu peux redemander.' },
    ],
    conseil: '🤝 Les adultes VEULENT t\'aider. Demander de l\'aide, c\'est ce que font les personnes intelligentes — pas les faibles.',
    exemple: '"Excusez-moi madame, je n\'ai pas compris la question 3. Est-ce que vous pouvez m\'expliquer ?" ✋',
  },

  // ── ULIS/SEGPA : mathématiques supplémentaires ─────────────────────────────
  { id: 'u13', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Reconnaître les formes géométriques', type: 'Géométrie',
    steps: [
      { label: 'Le carré', detail: '4 côtés égaux + 4 angles droits. Ex : une feuille carrée.' },
      { label: 'Le rectangle', detail: '4 angles droits, côtés opposés égaux. Ex : une porte.' },
      { label: 'Le triangle', detail: '3 côtés, 3 angles. Ex : un toit de maison.' },
      { label: 'Le cercle', detail: 'Forme ronde, tous les points sont à égale distance du centre.' },
    ], conseil: '🔷 Touche les objets autour de toi pour reconnaître les formes dans la vie réelle.',
    exemple: 'Une fenêtre = rectangle. Une pizza = cercle. Un panneau routier attention = triangle.' },
  { id: 'u14', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Faire une multiplication simple', type: 'Calcul',
    steps: [
      { label: 'Comprendre le sens', detail: '3 × 2 = 3 fois le nombre 2 = 2 + 2 + 2 = 6.' },
      { label: 'Utiliser ses doigts', detail: 'Poser 3 doigts → compter 2 pour chaque doigt → 6 en tout.' },
      { label: 'Apprendre ×2 et ×5 d\'abord', detail: '×2 : doubler le nombre. ×5 : les résultats finissent en 0 ou 5.' },
      { label: 'Vérifier avec l\'addition', detail: 'Si 3×4 → 4+4+4 = 12 → OK !' },
    ], conseil: "🔢 Répète la table de multiplication en la chantant ou en l'écrivant chaque jour.",
    exemple: '5 × 3 = 15. Vérifier : 5+5+5 = 15. Correct !' },
  { id: 'u15', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Lire et écrire les nombres jusqu\'à 1000', type: 'Numération',
    steps: [
      { label: 'Les unités (0 à 9)', detail: 'zéro, un, deux, trois, quatre, cinq, six, sept, huit, neuf.' },
      { label: 'Les dizaines', detail: 'dix, vingt, trente, quarante, cinquante, soixante, soixante-dix, quatre-vingt, quatre-vingt-dix.' },
      { label: 'Les centaines', detail: 'cent, deux cents, trois cents... neuf cents.' },
      { label: 'Composer un nombre', detail: '534 = 5 centaines + 3 dizaines + 4 unités = cinq cent trente-quatre.' },
    ], conseil: "📝 Dis le nombre à voix haute avant de l'écrire pour éviter les erreurs.",
    exemple: '247 = deux cent quarante-sept. Lire de gauche à droite : centaines d\'abord.' },
  // ── ULIS/SEGPA : français supplémentaires ───────────────────────────────────
  { id: 'u16', subject: 'Lecture', niveau: ['ULIS/SEGPA'], titre: 'Lire un texte étape par étape', type: 'Lecture',
    steps: [
      { label: 'Lire le titre', detail: 'De quoi parle probablement ce texte ?' },
      { label: 'Regarder les images si il y en a', detail: 'Les images donnent des indices sur le sujet.' },
      { label: 'Lire phrase par phrase', detail: 'Si un mot est inconnu → regarder les mots autour pour deviner.' },
      { label: 'Reformuler avec ses mots', detail: 'Qu\'est-ce que tu viens de lire ? Dis-le à voix haute.' },
    ], conseil: "📖 Relis chaque phrase à voix haute — si ça ne sonne pas bien, c'est qu'il y a peut-être une erreur.",
    exemple: 'Texte sur les dauphins → titre "Le dauphin, ami de l\'homme" → images de dauphins → lire chaque phrase tranquillement.' },
  { id: 'u17', subject: 'Français', niveau: ['ULIS/SEGPA'], titre: 'Écrire un petit texte (3 phrases minimum)', type: 'Écriture',
    steps: [
      { label: 'Choisir le sujet', detail: 'Qu\'est-ce que tu veux raconter ou décrire ?' },
      { label: 'Écrire 1 phrase sur le début', detail: 'Qui ? Quoi ? Exemple : "Il était une fois un petit chat."' },
      { label: 'Écrire 1 phrase sur le milieu', detail: 'Que se passe-t-il ? Exemple : "Le chat voulait attraper une souris."' },
      { label: 'Écrire 1 phrase sur la fin', detail: 'Comment ça se termine ? Exemple : "Mais la souris était trop rapide !"' },
      { label: 'Vérifier la ponctuation', detail: 'Majuscule au début, point à la fin de chaque phrase.' },
    ], conseil: "✏️ Écris d'abord au brouillon sans te soucier des fautes, puis relis et corrige.",
    exemple: 'Mon chat / il court / fin → "Mon chat s\'appelle Minou. Il court après les papillons. Il est très agile."' },
  { id: 'u18', subject: 'Vie quotidienne', niveau: ['ULIS/SEGPA'], titre: 'Gérer son argent de poche', type: 'Vie pratique',
    steps: [
      { label: 'Connaître les pièces et billets', detail: '1ct, 2ct, 5ct, 10ct, 20ct, 50ct, 1€, 2€ — billets : 5€, 10€, 20€, 50€.' },
      { label: 'Calculer le total d\'un achat', detail: 'Additionner les prix de chaque article.' },
      { label: 'Calculer la monnaie', detail: 'Monnaie = somme donnée − prix total.' },
      { label: 'Savoir si on a assez d\'argent', detail: 'Comparer le prix total avec son argent disponible.' },
    ], conseil: "💶 Entraîne-toi avec de vraies pièces et billets (ou en papier) pour mieux mémoriser.",
    exemple: 'Pain = 1.20€, eau = 0.80€ → total = 2€. Tu donnes 5€ → monnaie = 3€.' },
  { id: 'u19', subject: 'Vie sociale', niveau: ['ULIS/SEGPA'], titre: 'Comprendre et exprimer ses émotions', type: 'Vie pratique',
    steps: [
      { label: 'Reconnaître ses émotions', detail: 'Joie, tristesse, peur, colère, surprise, dégoût — ce sont les 6 émotions de base.' },
      { label: 'Mettre des mots', detail: '"Je me sens..." + émotion. "Je suis triste parce que..."' },
      { label: 'Exprimer sans blesser', detail: 'Dire "je" plutôt que "tu" pour ne pas accuser. "Je suis en colère" ≠ "Tu me mets en colère."' },
      { label: 'Gérer une émotion forte', detail: 'Respirer profondément 3 fois. Compter jusqu\'à 10. S\'éloigner si besoin.' },
    ], conseil: "😊 Nommer ses émotions aide à les contrôler — c'est une compétence très utile.",
    exemple: 'Quelqu\'un te prend ton stylo → tu te sens en colère → dire "Je suis en colère, j\'ai besoin de mon stylo" → calme !' },
  { id: 'u20', subject: 'Orientation', niveau: ['ULIS/SEGPA'], titre: 'Comprendre un bulletin scolaire', type: 'Orientation',
    steps: [
      { label: 'Lire les notes', detail: 'Chaque matière a une note sur 20. 10/20 = moyen, 15/20 = bien.' },
      { label: 'Lire les appréciations', detail: 'Le professeur écrit un commentaire sur tes efforts et progrès.' },
      { label: 'Repérer tes points forts', detail: 'Dans quelles matières as-tu les meilleures notes ?' },
      { label: 'Repérer ce à améliorer', detail: 'Dans quelles matières peux-tu progresser ?' },
      { label: 'Parler avec tes parents', detail: 'Montrer le bulletin, expliquer tes efforts, fixer un objectif.' },
    ], conseil: "📋 Demande à un adulte de t'expliquer le bulletin ensemble — c'est fait pour être compris.",
    exemple: 'Note Maths 14/20 "Très bien" → point fort. Note Français 8/20 "Des efforts à faire" → axe de progrès.' },

];

// ─── Composants ───────────────────────────────────────────────────────────────
const FicheCard: React.FC<{ fiche: FicheMethode }> = ({ fiche }) => {
  const [open, setOpen] = useState(false);
  const [lectureOpen, setLectureOpen] = useState(false);
  const isUlis = fiche.niveau.includes('ULIS/SEGPA');

  return (<>
    <Card className={`h-full flex flex-col ${isUlis ? 'border-success/30' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-balance leading-snug flex-1 min-w-0">
            {fiche.titre}
          </CardTitle>
          <Badge variant="outline" className={`text-xs shrink-0 whitespace-nowrap ${isUlis ? 'border-success/40 text-success' : 'border-primary/30 text-primary'}`}>
            {fiche.type}
          </Badge>
        </div>
        <div className="flex gap-1 flex-wrap mt-1">
          {fiche.niveau.map(n => (
            <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        {/* Aperçu condensé — étape 1 */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">1</span>
          <p className="text-pretty leading-snug">{fiche.steps[0].label}</p>
        </div>

        {/* Détail dépliable */}
        {open && (
          <div className="space-y-2 text-sm">
            {fiche.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{step.label}</p>
                  <p className="text-muted-foreground text-pretty leading-snug">{step.detail}</p>
                </div>
              </div>
            ))}
            {fiche.exemple && (
              <div className="mt-2 p-2.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono leading-relaxed">
                <span className="font-semibold text-primary mr-1">Ex :</span>{fiche.exemple}
              </div>
            )}
            <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-warning/5 border border-warning/20 text-xs">
              <Lightbulb className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-muted-foreground text-pretty">{fiche.conseil}</p>
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 flex-wrap">
          {/* 🔊 Bouton Lecture Guidée — toujours visible */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
            onClick={() => setLectureOpen(true)}
            aria-label="Écouter les étapes à voix haute"
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            🔊 Écouter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
          >
            {open
              ? <><ChevronDown className="w-3.5 h-3.5 mr-1" aria-hidden="true" />Réduire</>
              : <><ChevronRight className="w-3.5 h-3.5 mr-1" aria-hidden="true" />Voir toutes les étapes ({fiche.steps.length})</>}
          </Button>
          {open && (
            <ExportButton
              fileName={`fiche-${fiche.id}`}
              variant="ghost"
              size="sm"
              label="Télécharger"
              getContent={(): ExportContent => ({
                title: fiche.titre,
                subtitle: `Matière : ${fiche.subject} · ${fiche.niveau.join(', ')} · Type : ${fiche.type}`,
                sections: [
                  ...fiche.steps.map((s, i) => ({
                    heading: `Étape ${i + 1} — ${s.label}`,
                    body: s.detail,
                  })),
                  { heading: 'Conseil', body: fiche.conseil },
                  ...(fiche.exemple ? [{ heading: 'Exemple', body: fiche.exemple }] : []),
                ],
              })}
            />
          )}
        </div>
      </CardContent>
    </Card>

    {/* Mode Lecture Guidée plein écran */}
    {lectureOpen && (
      <LectureGuideeModal fiche={fiche} onClose={() => setLectureOpen(false)} />
    )}
  </>);
};

// ─── Page principale ──────────────────────────────────────────────────────────
const AideIAPage: React.FC = () => {
  const navigate = useNavigate();
  const { addActivity, addXp, level } = useApp();

  // ── État fiches / ressources ─────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  // Auto-activé si le niveau du profil est ULIS ou SEGPA
  const [ulisMode, setUlisMode] = useState(() =>
    level === 'ULIS' || level === 'SEGPA'
  );
  const [activeTab, setActiveTab] = useState<'fiches' | 'ressources'>('fiches');

  // Synchronise ulisMode si l'utilisateur change de niveau depuis son profil
  useEffect(() => {
    setUlisMode(level === 'ULIS' || level === 'SEGPA');
  }, [level]);

  // ── État formulaire question → enseignant ────────────────────────────────
  const [question, setQuestion] = useState('');
  const [qSubject, setQSubject] = useState<string>('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendQuestion = async () => {
    const q = question.trim();
    if (!q) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Connecte-toi pour envoyer une question à un enseignant.', {
        action: { label: 'Se connecter', onClick: () => navigate('/connexion') },
      });
      return;
    }
    setSending(true);
    try {
      await createStudentQuestion({
        subject: qSubject !== 'all' ? qSubject : 'Général',
        level: 'Tous niveaux',
        title: q.length > 80 ? q.slice(0, 80) + '…' : q,
        body: q,
        attachments: null,
        status: 'open',
      });
      toast.success('Question envoyée ! Un enseignant répondra bientôt.', { duration: 4000 });
      setSent(true);
      setQuestion('');
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessaie.');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setSent(false);
  };

  const fichesSource = ulisMode ? ULIS_FICHES : FICHES;

  const filtered = useMemo(() => {
    return fichesSource.filter(f => {
      const matchSubject = selectedSubject === 'all' || f.subject === selectedSubject;
      const q = search.toLowerCase();
      const matchSearch = !q || f.titre.toLowerCase().includes(q) || f.type.toLowerCase().includes(q) || f.subject.toLowerCase().includes(q) || f.steps.some(s => s.label.toLowerCase().includes(q));
      return matchSubject && matchSearch;
    });
  }, [fichesSource, selectedSubject, search]);

  const ressourcesList: Ressource[] = selectedSubject === 'all'
    ? Object.values(RESSOURCES).flat()
    : (RESSOURCES[selectedSubject] ?? []);

  return (
    <div className="min-w-0 space-y-4 w-full max-w-5xl mx-auto px-4 md:px-5 py-4 md:py-6">
    <h1 className="sr-only">Aide aux devoirs gratuite</h1>
      <SEO
        title="Aide aux devoirs gratuite — Fiches méthode & Ressources vérifiées | Apprenix"
        description="Fiches méthode, exercices résolus et ressources pédagogiques pour toutes les matières. Collège, Lycée, ULIS/SEGPA. Gratuit, zéro génération automatique."
        canonical="/aide-ia"
        keywords="aide devoirs gratuite, fiches méthode scolaire, exercices résolus, ressources pédagogiques vérifiées, aide collège lycée, méthode dissertation, grammaire français, Khan Academy, Sésamath, aide ULIS SEGPA"
        dateModified="2026-06-20"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          "name": "Aide aux devoirs — Fiches méthode & Ressources | Apprenix",
          "description": "Fiches méthode pas-à-pas et ressources vérifiées pour toutes les matières scolaires.",
          "url": "https://apprenix.xyz/aide-ia",
          "inLanguage": "fr-FR",
          "isAccessibleForFree": true,
          "educationalLevel": "Collège, Lycée, ULIS, SEGPA"
        }}
      />

      {/* Hero */}
      <PageHero
        variant="tool"
        icon={BookOpen}
        badge={<>📚 Aide aux devoirs</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Aide aux devoirs — Méthodes & Fiches"
        subtitle="Des fiches méthode rédigées avec soin, des exercices commentés étape par étape, des ressources pédagogiques vérifiées — pour vraiment comprendre, pas juste copier."
        stats={[
          { value: String(FICHES.length + ULIS_FICHES.length), label: 'Fiches méthode' },
          { value: String(Object.values(RESSOURCES).flat().length), label: 'Ressources vérifiées' },
          { value: 'ULIS', label: 'Mode adapté inclus' },
        ]}
      >
        <ENBadge />
      </PageHero>

      {/* ── BLOC BASE DE RÉPONSES — mise en avant prioritaire ─────────────────── */}
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/8 via-primary/4 to-transparent overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-foreground text-balance leading-snug">
                Cherche d'abord dans notre base de 100 000 réponses
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
                Vérifiées par des enseignants certifiés · Maths, Français, SVT, Philo, Histoire, Anglais…
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/base-reponses')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity min-h-[40px] whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              Chercher une réponse
            </button>
          </div>
        </div>
      </div>

      {/* ── POSER UNE QUESTION À UN ENSEIGNANT ───────────────────────────────── */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-balance">
            <UserCheck className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Pose ta question à un enseignant
          </CardTitle>
          <p className="text-sm text-muted-foreground text-pretty">
            Décris ton exercice ou ta difficulté — un enseignant te répondra personnellement.
            <span className="ml-1 font-medium text-primary">Réponse humaine garantie.</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {sent ? (
            /* Confirmation envoi */
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center">
                <Send className="w-6 h-6 text-success" aria-hidden="true" />
              </div>
              <p className="font-semibold text-foreground">Question envoyée !</p>
              <p className="text-sm text-muted-foreground text-pretty">Un enseignant te répondra bientôt dans <strong>Mes Questions</strong>.</p>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Nouvelle question
                </Button>
                <Button size="sm" onClick={() => navigate('/mes-questions')} className="gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" /> Voir mes questions
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Ligne matière */}
              <Select value={qSubject} onValueChange={setQSubject}>
                <SelectTrigger className="w-full md:w-52" aria-label="Choisir une matière">
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {SUBJECTS_LIST.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Zone saisie */}
              <Textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ex : Je n'arrive pas à résoudre cette équation du 2nd degré : 2x² − 5x + 2 = 0. Peux-tu m\'expliquer chaque étape ?"
                className="min-h-[120px] resize-none text-sm"
                aria-label="Saisir ta question"
                disabled={sending}
              />

              {/* Bouton principal */}
              <Button
                onClick={handleSendQuestion}
                disabled={sending || !question.trim()}
                className="w-full gap-2"
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Envoi en cours…</>
                  : <><Send className="w-4 h-4" aria-hidden="true" />Envoyer ma question à un enseignant</>
                }
              </Button>

              {/* Garantie humain */}
              <p className="text-sm text-muted-foreground text-pretty">
                <Lightbulb className="w-3 h-3 inline mr-1 text-primary" aria-hidden="true" />
                Toutes les réponses sont rédigées par de vraies personnes — zéro génération automatique, zéro contenu inventé.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bandeau mode ULIS/SEGPA */}
      <div className={`rounded-xl border-2 transition-colors duration-200 ${ulisMode ? 'border-success/40 bg-success/5' : 'border-border bg-muted/30'}`}>
        <button type="button"
          onClick={() => { setUlisMode(v => !v); setSelectedSubject('all'); }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
          aria-pressed={ulisMode}
          aria-label="Activer ou désactiver le mode ULIS / SEGPA"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ulisMode ? 'bg-success/15' : 'bg-muted'}`}>
              <Heart className={`w-4 h-4 ${ulisMode ? 'text-success' : 'text-muted-foreground'}`} aria-hidden="true" />
            </div>
            <div className="text-left min-w-0">
              <p className={`text-sm font-semibold ${ulisMode ? 'text-success' : 'text-foreground'}`}>Mode ULIS / SEGPA</p>
              <p className="text-sm text-muted-foreground text-pretty">Mots simples · Étapes courtes · Exemples du quotidien</p>
            </div>
          </div>
          <Badge className={`shrink-0 ml-3 text-xs ${ulisMode ? 'bg-success/15 text-success border-success/30' : 'bg-secondary text-muted-foreground border-border'}`}>
            {ulisMode ? 'Activé ✓' : 'Désactivé'}
          </Badge>
        </button>
      </div>

      {/* Onglets Fiches / Ressources */}
      <div className="flex rounded-xl border border-border overflow-hidden" role="tablist" aria-label="Type de contenu">
        {([
          { id: 'fiches', label: '📋 Fiches méthode' },
          { id: 'ressources', label: '🛠️ Outils Apprenix' },
        ] as const).map(tab => (
          <button type="button"
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs md:text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Rechercher une méthode, une notion…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Rechercher une fiche méthode"
            autoComplete="off"
          />
        </div>
        {!ulisMode && (
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-52" aria-label="Filtrer par matière">
              <SelectValue placeholder="Toutes les matières" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {SUBJECTS_LIST.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Panel : Fiches méthode */}
      {activeTab === 'fiches' && (
        <div id="panel-fiches" role="tabpanel" aria-label="Fiches méthode" className="space-y-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Aucune fiche ne correspond à cette recherche.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{filtered.length} fiche{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(f => <FicheCard key={f.id} fiche={f} />)}
              </div>
            </>
          )}

          {/* Encart méthode de travail */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 flex gap-4">
              <Target className="w-8 h-8 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground text-balance">La méthode, c\'est 80 % du travail</p>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  Comprendre <em>comment</em> résoudre un problème vaut bien plus que d\'en avoir la solution. Chaque fiche ici t\'apprend une démarche réutilisable dans tous tes exercices du même type.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Panel : Outils Apprenix */}
      {activeTab === 'ressources' && (
        <div id="panel-ressources" role="tabpanel" aria-label="Outils Apprenix" className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/25 bg-primary/5">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <p className="text-xs font-medium text-primary">100 % Apprenix — tout est intégré, rien à quitter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              { icon: '🃏', title: 'Flashcards', desc: 'Révise par répétition espacée — crée tes propres cartes ou utilise celles des enseignants', path: '/flashcards', cta: 'Ouvrir les flashcards' },
              { icon: '📝', title: 'Quiz & QCM', desc: 'Teste tes connaissances sur toutes les matières — corrigés instantanés', path: '/quiz', cta: 'Faire un quiz' },
              { icon: '📅', title: 'Planning de révision', desc: 'Organise tes révisions avec un planning personnalisé par matière et niveau', path: '/organisation', cta: 'Voir mon planning' },
              { icon: '📸', title: 'Scanner de devoirs', desc: 'Prends en photo ton exercice — notre enseignant te répond par message', path: '/scanner', cta: 'Scanner un devoir' },
              { icon: '📚', title: 'Fiches de révision', desc: 'Toutes les fiches méthode rédigées par nos enseignants, par matière et niveau', path: '/ressources', cta: 'Voir les fiches' },
              { icon: '🏆', title: 'Mes progrès', desc: 'Suis tes résultats, tes badges et ta progression semaine par semaine', path: '/profil', cta: 'Voir mes progrès' },
            ] as const).map(tool => (
              <button
                key={tool.path}
                type="button"
                onClick={() => { addActivity(`Outil → ${tool.title}`); navigate(tool.path); }}
                className="group text-left flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
              >
                <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{tool.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{tool.desc}</p>
                  <p className="text-xs text-primary font-medium mt-2">{tool.cta} →</p>
                </div>
              </button>
            ))}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex gap-3">
              <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-muted-foreground text-pretty">
                <strong className="text-foreground">Apprenix est 100 % indépendant.</strong> Tous les contenus, exercices et outils sont créés et vérifiés par nos enseignants — sans redirection vers des sites tiers.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── Carte ressource ──────────────────────────────────────────────────────────
const RessourceCard: React.FC<{ ressource: Ressource }> = ({ ressource: r }) => (
  <Card>
    <CardContent className="p-4 flex items-start gap-3">
      <ExternalLink className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{r.label}</p>
          <Badge variant="secondary" className="text-xs">{r.tag}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{r.desc}</p>
        <a
          href={r.url}
          target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          aria-label={`Ouvrir ${r.label} (nouvel onglet)`}
        >
          Ouvrir le site <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </CardContent>
  </Card>
);

export default AideIAPage;
