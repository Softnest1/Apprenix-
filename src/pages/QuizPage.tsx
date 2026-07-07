import {
  BookOpen, Calculator, CheckCircle2,
  ChevronRight, FlaskConical, Globe2,
  GraduationCap, HelpCircle, Languages,
  Pencil, Play, Plus,
  RotateCcw, ScrollText, Trash2,
  Trophy, XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QA { id: string; question: string; answer: string; }

// ─── Banques de quiz — programme scolaire français ────────────────────────────
interface SampleSet { label: string; subject: string; items: Omit<QA, 'id'>[] }

const SAMPLE_SETS = [
  {
    subject: 'Histoire',
    label: '1ère Guerre mondiale',
    items: [
      { question: 'En quelle année débute la Première Guerre mondiale ?', answer: '1914' },
      { question: 'Quel événement déclenche la Première Guerre mondiale ?', answer: "L'assassinat de l\'archiduc François-Ferdinand à Sarajevo (28 juin 1914)" },
      { question: 'En quelle année se termine la Première Guerre mondiale ?', answer: '1918' },
      { question: 'Quel traité met fin à la Première Guerre mondiale ?', answer: 'Traité de Versailles (28 juin 1919)' },
      { question: 'Qu\'est-ce qu\'une tranchée ?', answer: "Fossé creusé pour abriter les soldats des tirs ennemis — symbole de la guerre de position (1914-1918)" },
    ],
  },
  {
    subject: 'Histoire',
    label: '2ème Guerre mondiale',
    items: [
      { question: 'Date d\'invasion de la Pologne par Hitler ?', answer: '1er septembre 1939' },
      { question: 'Que se passe-t-il le 18 juin 1940 ?', answer: "Appel du général de Gaulle à la BBC pour poursuivre la résistance contre l'occupant nazi" },
      { question: 'Qu\'est-ce que la Shoah ?', answer: "Extermination systématique de 6 millions de Juifs d'Europe par les nazis" },
      { question: 'Date du débarquement en Normandie ?', answer: '6 juin 1944 (Jour J — Opération Overlord)' },
      { question: 'Date de la capitulation de l\'Allemagne ?', answer: '8 mai 1945 (fin de la guerre en Europe)' },
    ],
  },
  {
    subject: 'Histoire',
    label: 'Révolution française',
    items: [
      { question: 'Date de la prise de la Bastille ?', answer: '14 juillet 1789' },
      { question: 'Devise de la République française ?', answer: 'Liberté, Égalité, Fraternité' },
      { question: 'Qui est Louis XVI ?', answer: 'Roi de France guillotiné le 21 janvier 1793' },
      { question: 'Qu\'est-ce que la Déclaration des droits de l\'homme (1789) ?', answer: 'Texte fondateur proclamant les droits naturels : liberté, propriété, sûreté, résistance à l\'oppression' },
      { question: 'Qu\'est-ce que la Terreur ?', answer: 'Période 1793-1794 de répression violente sous Robespierre' },
    ],
  },
  {
    subject: 'Maths',
    label: 'Théorèmes',
    items: [
      { question: 'Énoncer le théorème de Pythagore', answer: 'Dans un triangle rectangle : a² + b² = c² (c = hypoténuse)' },
      { question: 'Formule de la dérivée de xⁿ ?', answer: 'n · xⁿ⁻¹' },
      { question: 'Que vaut π (pi) arrondi à 4 décimales ?', answer: '3,1416' },
      { question: 'Formule du discriminant d\'un trinôme ax² + bx + c ?', answer: 'Δ = b² − 4ac' },
      { question: 'Somme des angles d\'un triangle ?', answer: '180° (ou π radians)' },
    ],
  },
  {
    subject: 'Maths',
    label: 'Algèbre',
    items: [
      { question: '(a + b)² = ?', answer: 'a² + 2ab + b²' },
      { question: '(a − b)² = ?', answer: 'a² − 2ab + b²' },
      { question: '(a + b)(a − b) = ?', answer: 'a² − b²' },
      { question: 'log(a × b) = ?', answer: 'log(a) + log(b)' },
      { question: 'log(aⁿ) = ?', answer: 'n · log(a)' },
    ],
  },
  {
    subject: 'Français',
    label: 'Figures de style',
    items: [
      { question: 'Définir la métaphore', answer: 'Comparaison implicite sans outil comparatif. Ex : "La vie est un voyage"' },
      { question: 'Définir l\'hyperbole', answer: 'Exagération pour accentuer un effet. Ex : "Je meurs de faim"' },
      { question: 'Définir l\'anaphore', answer: 'Répétition d\'un mot ou groupe en début de phrases successives' },
      { question: 'Définir l\'oxymore', answer: 'Association de deux mots contradictoires. Ex : "obscure clarté"' },
      { question: 'Définir la litote', answer: 'Dire moins pour suggérer plus. Ex : "Ce n\'est pas mal" = c\'est très bien' },
    ],
  },
  {
    subject: 'SVT',
    label: 'Génétique',
    items: [
      { question: 'Que signifie ADN ?', answer: 'Acide DésoxyriboNucléique — molécule portant l\'information génétique' },
      { question: 'Les 4 bases de l\'ADN ?', answer: 'Adénine (A), Thymine (T), Guanine (G), Cytosine (C)' },
      { question: 'Différence entre mitose et méiose ?', answer: 'Mitose : 2 cellules filles identiques. Méiose : 4 gamètes haploïdes avec brassage génétique' },
      { question: 'Définition d\'une mutation ?', answer: 'Modification permanente de la séquence d\'ADN' },
      { question: 'Qu\'est-ce que la transcription ?', answer: 'Synthèse d\'un ARNm à partir d\'un brin d\'ADN matrice dans le noyau' },
    ],
  },
  {
    subject: 'Physique',
    label: 'Formules clés',
    items: [
      { question: '2ème loi de Newton ?', answer: 'ΣF = m·a (somme des forces = masse × accélération)' },
      { question: 'Formule de l\'énergie cinétique ?', answer: 'Ec = ½·m·v²' },
      { question: 'Loi d\'Ohm ?', answer: 'U = R·I (tension = résistance × intensité)' },
      { question: 'Valeur de g sur Terre ?', answer: 'g ≈ 9,81 m/s²' },
      { question: 'Formule de la puissance électrique ?', answer: 'P = U·I = R·I²' },
    ],
  },
  {
    subject: 'Chimie',
    label: 'Bases',
    items: [
      { question: 'Loi de conservation de la masse ?', answer: '"Rien ne se perd, rien ne se crée, tout se transforme" (Lavoisier)' },
      { question: 'Formule du pH ?', answer: 'pH = −log[H₃O⁺]' },
      { question: 'Acide selon Brønsted ?', answer: 'Espèce chimique capable de donner un proton H⁺' },
      { question: 'Formule du CO₂ ?', answer: 'CO₂ — 1 carbone, 2 oxygènes' },
      { question: 'Réaction d\'oxydoréduction ?', answer: 'Transfert d\'électrons : réducteur perd des e⁻, oxydant en gagne' },
    ],
  },
  {
    subject: 'Géographie',
    label: 'Capitales du monde',
    items: [
      { question: 'Capitale de l\'Allemagne ?', answer: 'Berlin' },
      { question: 'Capitale du Brésil ?', answer: 'Brasília' },
      { question: 'Capitale de l\'Australie ?', answer: 'Canberra' },
      { question: 'Capitale du Japon ?', answer: 'Tokyo' },
      { question: 'Capitale du Canada ?', answer: 'Ottawa' },
      { question: 'Capitale de la Chine ?', answer: 'Pékin (Beijing)' },
    ],
  },
  {
    subject: 'Philosophie',
    label: 'Grands auteurs',
    items: [
      { question: 'Cogito de Descartes ?', answer: '"Je pense, donc je suis" — première certitude indubitable' },
      { question: 'Impératif catégorique de Kant ?', answer: '"Agis selon la maxime qui peut devenir loi universelle"' },
      { question: 'Platon — mythe de la caverne ?', answer: 'Les hommes confondent apparences et réalité. La philosophie mène vers la Vérité' },
      { question: 'Sartre — "l\'existence précède l\'essence" ?', answer: "L'homme se définit par ses actes, pas par une nature fixe (existentialisme)" },
      { question: 'Hobbes — état de nature ?', answer: '"L\'homme est un loup pour l\'homme" — d\'où la nécessité du contrat social' },
    ],
  },
  {
    subject: 'Anglais',
    label: 'Vocabulaire B1',
    items: [
      { question: '"to achieve" en français ?', answer: 'accomplir, réussir, atteindre un objectif' },
      { question: '"despite" en français ?', answer: 'malgré, en dépit de' },
      { question: '"whereas" en français ?', answer: 'alors que, tandis que (contraste/opposition)' },
      { question: '"therefore" en français ?', answer: 'donc, par conséquent' },
      { question: '"to deal with" en français ?', answer: 'faire face à, gérer, s\'occuper de' },
    ],
  },,

  // ── Maths Collège ───────────────────────────────────────────────────────────
  { subject: 'Maths', label: 'Maths — Collège (Brevet)', items: [
    { question: 'Résoudre : 2x + 6 = 14', answer: 'x = 4  (2x = 8 → x = 4)' },
    { question: 'Simplifier la fraction 18/24', answer: '3/4  (diviser par 6)' },
    { question: 'Calculer 3² + 4²', answer: '9 + 16 = 25' },
    { question: 'Périmètre d\'un rectangle 8cm × 5cm ?', answer: '2×(8+5) = 26 cm' },
    { question: 'Aire d\'un triangle base 10cm, hauteur 6cm ?', answer: '(10×6)/2 = 30 cm²' },
    { question: 'Périmètre d\'un cercle rayon 7cm ? (π≈3.14)', answer: '2×3.14×7 ≈ 43.96 cm' },
    { question: 'Factoriser : x² − 16', answer: '(x−4)(x+4)' },
    { question: 'Développer : (x+5)²', answer: 'x² + 10x + 25' },
    { question: 'Médiane de : 3, 5, 7, 9, 11', answer: '7 (valeur centrale, 5 valeurs)' },
    { question: 'Moyenne de : 4, 8, 12, 16', answer: '(4+8+12+16)/4 = 40/4 = 10' },
    { question: 'Dans un dé équilibré, P(obtenir 6) = ?', answer: '1/6 ≈ 0.167' },
    { question: 'Convertir 2.5 km en mètres', answer: '2500 m' },
    { question: 'Coefficient directeur de y = 3x − 7 ?', answer: '3' },
    { question: 'Résoudre : x/3 = 5', answer: 'x = 15' },
    { question: '7² − 3² = ?', answer: '49 − 9 = 40  OU par identité (7−3)(7+3) = 4×10 = 40' },
  ]},
  { subject: 'Maths', label: 'Maths — Lycée (Bac)', items: [
    { question: 'Dérivée de f(x) = 3x² − 5x + 2 ?', answer: 'f\'(x) = 6x − 5' },
    { question: 'f(x) = x² − 4x + 3 : valeur minimale et en quel x ?', answer: 'Minimum en x=2, f(2) = 4−8+3 = −1' },
    { question: 'Calculer ∫₀¹ 2x dx', answer: '[x²]₀¹ = 1 − 0 = 1' },
    { question: 'Limite de (x²−1)/(x−1) quand x→1 ?', answer: 'Factoriser : (x+1)(x−1)/(x−1) → x+1 → limite = 2' },
    { question: 'Equation de la tangente à f(x)=x² en x=2 ?', answer: 'f\'(2)=4, f(2)=4 → y = 4(x−2)+4 = 4x−4' },
    { question: 'Résoudre e^x = 5 ?', answer: 'x = ln(5) ≈ 1.609' },
    { question: 'Résoudre ln(x) = −1 ?', answer: 'x = e⁻¹ = 1/e ≈ 0.368' },
    { question: 'Signe de f\'(x) = (2x−4)(x+1) sur ℝ ?', answer: 'Racines : x=2 et x=−1 → f\'<0 sur ]−1,2[, f\'>0 ailleurs' },
    { question: 'P(X=3) pour X∼B(5, 0.4) ?', answer: 'C(5,3)×0.4³×0.6² = 10×0.064×0.36 ≈ 0.230' },
    { question: 'Intégrale de e^(2x) ?', answer: '(1/2)e^(2x) + C' },
    { question: 'Définition d\'une fonction impaire ?', answer: 'f(−x) = −f(x) pour tout x — courbe symétrique par rapport à l\'origine' },
    { question: 'Définition d\'une fonction paire ?', answer: 'f(−x) = f(x) — courbe symétrique par rapport à l\'axe y' },
    { question: 'Résoudre cos(x) = 1/2 sur [0, 2π]', answer: 'x = π/3 et x = 5π/3' },
    { question: 'sin(π/6) = ?', answer: '1/2' },
    { question: 'tan(π/4) = ?', answer: '1' },
  ]},
  // ── Physique-Chimie ──────────────────────────────────────────────────────────
  { subject: 'Physique', label: 'Physique — Mécanique', items: [
    { question: 'Unité de la force dans le SI ?', answer: 'Newton (N) = kg·m·s⁻²' },
    { question: 'Formule du poids sur Terre ?', answer: 'P = m × g  (g ≈ 9.8 m/s²)' },
    { question: 'Un objet de masse 5 kg a quel poids sur Terre ?', answer: '5 × 9.8 = 49 N' },
    { question: '2e loi de Newton (vecteur) ?', answer: 'ΣF⃗ = m × a⃗  (somme des forces = masse × accélération)' },
    { question: 'Énergie cinétique Ec ?', answer: 'Ec = (1/2)mv²  (en Joules)' },
    { question: 'Énergie potentielle de pesanteur Ep ?', answer: 'Ep = mgh  (h = hauteur, en Joules)' },
    { question: 'Conservation de l\'énergie mécanique (sans frottement) ?', answer: 'Ec + Ep = constante — Em = cst' },
    { question: 'Formule de la vitesse moyenne ?', answer: 'v = d/t  (distance / temps)' },
    { question: 'Formule de l\'accélération constante ?', answer: 'a = (vf − vi) / t' },
    { question: 'Distance parcourue en chute libre depuis le repos ?', answer: 'd = (1/2)gt²' },
    { question: 'Unité de la pression ?', answer: 'Pascal (Pa) = N/m²' },
    { question: 'Poussée d\'Archimède ?', answer: 'Fa = ρ_fluide × V_immergé × g' },
    { question: 'Principe d\'inertie (1e loi de Newton) ?', answer: 'Un corps reste en mouvement rectiligne uniforme si la résultante des forces est nulle' },
  ]},
  { subject: 'Physique', label: 'Physique — Ondes et lumière', items: [
    { question: 'Vitesse de la lumière dans le vide ?', answer: 'c = 3 × 10⁸ m/s' },
    { question: 'Relation célérité-longueur d\'onde-fréquence ?', answer: 'v = λ × f  (célérité = longueur d\'onde × fréquence)' },
    { question: 'Longueur d\'onde du visible (domaine) ?', answer: '400 nm (violet) à 800 nm (rouge)' },
    { question: 'Qu\'est-ce que la diffraction ?', answer: 'Étalement d\'une onde autour d\'un obstacle ou d\'une fente — d\'autant plus important que λ est grand' },
    { question: 'Condition d\'interférences constructives ?', answer: 'Différence de marche δ = k×λ  (k entier)' },
    { question: 'Condition d\'interférences destructives ?', answer: 'δ = (k + 1/2)×λ' },
    { question: 'Son : fréquence basse = son grave ou aigu ?', answer: 'Son grave (fréquence basse) — aigu (fréquence haute)' },
    { question: 'Fréquence audible par l\'humain ?', answer: '20 Hz à 20 000 Hz (20 kHz)' },
    { question: 'Effet Doppler ?', answer: 'Décalage de fréquence quand la source se rapproche (fréquence monte) ou s\'éloigne (fréquence baisse)' },
    { question: 'Domaine des rayons X dans le spectre électromagnétique ?', answer: 'Entre l\'ultraviolet et les rayons gamma — très courte longueur d\'onde (0.01 à 10 nm)' },
  ]},
  { subject: 'Chimie', label: 'Chimie — Réactions et solutions', items: [
    { question: 'Unité de la quantité de matière ?', answer: 'Mole (mol) — 1 mol = 6.022×10²³ entités (nombre d\'Avogadro)' },
    { question: 'Formule de la quantité de matière n ?', answer: 'n = m/M  (m = masse en g, M = masse molaire en g/mol)' },
    { question: 'Concentration molaire d\'une solution ?', answer: 'C = n/V  (mol/L, n = quantité de matière, V = volume en L)' },
    { question: 'Masse molaire de l\'eau H₂O ?', answer: '2×1 + 16 = 18 g/mol' },
    { question: 'Masse molaire de NaCl ?', answer: '23 + 35.5 = 58.5 g/mol' },
    { question: 'Qu\'est-ce qu\'une réaction de combustion ?', answer: 'Réaction d\'un combustible avec le dioxygène — produits : CO₂ et H₂O (combustion complète)' },
    { question: 'Équation de combustion du méthane CH₄ ?', answer: 'CH₄ + 2O₂ → CO₂ + 2H₂O' },
    { question: 'Qu\'est-ce qu\'une oxydoréduction ?', answer: 'Transfert d\'électrons : réducteur se oxyde (perd e⁻), oxydant se réduit (gagne e⁻)' },
    { question: 'Nombre de charges de l\'ion sodium Na⁺ ?', answer: '+1 (a perdu 1 électron)' },
    { question: 'Nombre de charges de l\'ion chlorure Cl⁻ ?', answer: '−1 (a gagné 1 électron)' },
  ]},
  // ── SVT ─────────────────────────────────────────────────────────────────────
  { subject: 'SVT', label: 'SVT — Biologie cellulaire', items: [
    { question: 'Organite où se produit la respiration cellulaire ?', answer: 'Mitochondrie' },
    { question: 'Organite où se produit la photosynthèse ?', answer: 'Chloroplaste (dans les cellules végétales)' },
    { question: 'Qu\'est-ce que l\'ADN (sigle) ?', answer: 'Acide DésoxyriboNucléique — support de l\'information génétique' },
    { question: 'Définition d\'un gène ?', answer: 'Séquence d\'ADN codant pour une protéine ou une molécule fonctionnelle' },
    { question: 'Qu\'est-ce que le phénotype ?', answer: 'Ensemble des caractères observables d\'un individu (morphologie, physiologie)' },
    { question: 'Qu\'est-ce que le génotype ?', answer: 'Ensemble des allèles portés par un individu (sa constitution génétique)' },
    { question: 'Définition d\'un allèle dominant ?', answer: 'Allèle qui s\'exprime dans le phénotype même en un seul exemplaire (hétérozygote)' },
    { question: 'Définition d\'un allèle récessif ?', answer: 'Allèle qui ne s\'exprime que si présent en deux exemplaires (homozygote)' },
    { question: 'Résultat de la méiose ?', answer: '4 cellules haploïdes (n) à partir d\'une cellule diploïde (2n) — gamètes' },
    { question: 'Qu\'est-ce que la fécondation ?', answer: 'Fusion d\'un ovule (n) et d\'un spermatozoïde (n) → zygote diploïde (2n)' },
    { question: 'Rôle de l\'ARN messager ?', answer: 'Transporte l\'information génétique du noyau vers les ribosomes pour la traduction' },
    { question: 'Qu\'est-ce qu\'une protéine ?', answer: 'Macromolécule formée d\'une chaîne d\'acides aminés repliée en 3D — nombreuses fonctions biologiques' },
  ]},
  { subject: 'SVT', label: 'SVT — Géologie & Environnement', items: [
    { question: 'Les 3 types de roches ?', answer: 'Magmatiques (ignées), sédimentaires, métamorphiques' },
    { question: 'Qu\'est-ce qu\'une roche sédimentaire ?', answer: 'Roche formée par dépôt et compaction de sédiments (grès, calcaire, argile)' },
    { question: 'Composition du manteau terrestre ?', answer: 'Roche silicatée semi-solide (péridotite) — convection thermique' },
    { question: 'Que mesure l\'échelle de Richter ?', answer: 'Magnitude d\'un séisme — énergie libérée. Chaque degré = 10x plus d\'amplitude' },
    { question: 'Qu\'est-ce que l\'érosion ?', answer: 'Dégradation et transport de roches par l\'eau, le vent, la glace et les êtres vivants' },
    { question: 'Effet de serre : mécanisme ?', answer: 'Les GES absorbent le rayonnement infrarouge réémis par la Terre et le renvoyent vers la surface' },
    { question: 'Les 3 principaux GES anthropiques ?', answer: 'CO₂, CH₄ (méthane), N₂O (protoxyde d\'azote)' },
    { question: 'Qu\'est-ce que la photosynthèse (équation) ?', answer: '6CO₂ + 6H₂O + lumière → C₆H₁₂O₆ + 6O₂' },
    { question: 'Qu\'est-ce que la respiration cellulaire (équation) ?', answer: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP (énergie)' },
    { question: 'Différence entre roches perméables et imperméables ?', answer: 'Perméables : laissent passer l\'eau (grès, calcaire fissuré). Imperméables : retiennent l\'eau (argile, granite)' },
  ]},
  // ── Histoire ─────────────────────────────────────────────────────────────────
  { subject: 'Histoire', label: 'Histoire — Collège (Brevet)', items: [
    { question: 'Qui a proclamé la République française pour la première fois ?', answer: 'La Convention nationale, le 21 septembre 1792' },
    { question: 'Quand a été signée la Déclaration d\'indépendance américaine ?', answer: '4 juillet 1776' },
    { question: 'Qu\'est-ce que l\'esclavage triangulaire ?', answer: 'Commerce entre Europe (marchandises) → Afrique (esclaves) → Amériques (matières premières)' },
    { question: 'Date de l\'abolition de l\'esclavage en France ?', answer: '1848 (décret Schœlcher, 27 avril 1848)' },
    { question: 'Qu\'est-ce que l\'industrialisation ?', answer: 'Développement de la production par les machines, usines et énergie — XIXe siècle' },
    { question: 'Qu\'est-ce que le colonialisme ?', answer: 'Domination politique, économique et culturelle d\'un pays sur d\'autres territoires' },
    { question: 'Date du débarquement en Normandie ?', answer: '6 juin 1944 — Opération Overlord (alliés contre nazis)' },
    { question: 'Qu\'est-ce que la résistance française ?', answer: 'Mouvement clandestin de lutte contre l\'occupation nazie et le régime de Vichy (1940–1944)' },
    { question: 'Date de la création de la 5e République ?', answer: '1958 — Constitution approuvée le 28 septembre 1958' },
    { question: 'Qu\'est-ce que la mondialisation ?', answer: 'Intensification des échanges économiques, culturels et humains à l\'échelle planétaire' },
    { question: 'Qu\'est-ce qu\'une démocratie ?', answer: 'Régime politique où le pouvoir appartient au peuple (souveraineté populaire), exprimé par le vote' },
    { question: 'Quand a été créée l\'ONU et pourquoi ?', answer: '1945 — pour maintenir la paix et la sécurité internationales après la 2e GM' },
  ]},
  { subject: 'Histoire', label: 'Histoire — La Première Guerre mondiale', items: [
    { question: 'Date de début de la 1ère Guerre mondiale ?', answer: '28 juillet 1914 (déclaration de guerre de l\'Autriche-Hongrie à la Serbie)' },
    { question: 'Attentat déclencheur de la 1ère GM ?', answer: 'Assassinat de l\'archiduc François-Ferdinand à Sarajevo, 28 juin 1914' },
    { question: 'Les deux camps dans la 1ère GM ?', answer: 'Triple Entente (France, Royaume-Uni, Russie) vs Triple Alliance/Puissances centrales (Allemagne, Autriche-Hongrie, Italie)' },
    { question: 'Qu\'est-ce que la guerre de tranchées ?', answer: 'Guerre de position sur le front ouest — soldats creusent des tranchées pour se protéger (1914–1918)' },
    { question: 'Bataille la plus meurtrière de la 1ère GM ?', answer: 'Bataille de Verdun (1916) — environ 700 000 victimes' },
    { question: 'Quand les États-Unis entrent-ils dans la 1ère GM ?', answer: 'Avril 1917' },
    { question: 'Date de l\'armistice de la 1ère GM ?', answer: '11 novembre 1918 (11h)' },
    { question: 'Nom du traité de paix de 1919 ?', answer: 'Traité de Versailles (28 juin 1919)' },
    { question: 'Qu\'est-ce que la SDN ?', answer: 'Société des Nations — organisation internationale créée après 1918 pour maintenir la paix (précurseur ONU)' },
    { question: 'Qu\'est-ce qu\'un poilu ?', answer: 'Surnom familier du soldat français combattant dans les tranchées (1914–1918)' },
  ]},
  // ── Géographie ───────────────────────────────────────────────────────────────
  { subject: 'Géographie', label: 'Géographie — Monde & Développement', items: [
    { question: 'Quel pays a le plus grand PIB mondial ?', answer: 'États-Unis (1er), suivi de la Chine' },
    { question: 'Pays le plus peuplé du monde ?', answer: 'Inde (a dépassé la Chine en 2023)' },
    { question: 'Continent le plus peuplé ?', answer: 'Asie (environ 4.7 milliards d\'habitants)' },
    { question: 'Capitale des États-Unis ?', answer: 'Washington D.C.' },
    { question: 'Capitale du Japon ?', answer: 'Tokyo' },
    { question: 'Capitale du Brésil ?', answer: 'Brasília' },
    { question: 'Capitale de la Chine ?', answer: 'Pékin (Beijing)' },
    { question: 'Capitale de la Russie ?', answer: 'Moscou' },
    { question: 'Fleuve le plus long du monde ?', answer: 'Le Nil ou l\'Amazone selon les mesures — environ 6600 km chacun' },
    { question: 'Plus haute montagne du monde ?', answer: 'L\'Everest — 8848 m (Himalaya, frontière Népal-Chine)' },
    { question: 'Qu\'est-ce que l\'IDH ?', answer: 'Indice de Développement Humain : espérance de vie + éducation + revenu/hab — de 0 à 1' },
    { question: 'Pays avec l\'IDH le plus élevé (2024) ?', answer: 'Suisse, Norvège, Islande (régulièrement en tête)' },
  ]},
  // ── Français ─────────────────────────────────────────────────────────────────
  { subject: 'Français', label: 'Français — Grammaire et orthographe', items: [
    { question: 'Accord : "Les fleurs sont ___" (beau) ?', answer: 'Belles (féminin pluriel)' },
    { question: 'Conjugaison : "Nous ___ hier" (aller, passé composé) ?', answer: 'Nous sommes allés' },
    { question: 'Orthographe : "on" ou "ont" dans "Ils ___ mangé" ?', answer: 'Ont (verbe avoir conjugué)' },
    { question: 'Orthographe : "a" ou "à" dans "Il ___ faim" ?', answer: 'a (verbe avoir — remplaçable par "avait")' },
    { question: 'Conjugaison "être" au présent — toutes les formes ?', answer: 'Je suis, tu es, il est, nous sommes, vous êtes, ils sont' },
    { question: 'Conjugaison "avoir" au présent — toutes les formes ?', answer: 'J\'ai, tu as, il a, nous avons, vous avez, ils ont' },
    { question: 'Accord du participe passé de "manger" avec "elles" ?', answer: 'Elles ont mangé (COD après = pas d\'accord avec avoir)' },
    { question: 'Pluriel de "bal" ?', answer: 'Bals (exception — ne prend pas -aux)' },
    { question: 'Féminin de "menteur" ?', answer: 'Menteuse' },
    { question: 'Nature de "rapidement" ?', answer: 'Adverbe (terminaison -ment, modifie un verbe)' },
    { question: 'Fonction de "le chat" dans "Je vois le chat" ?', answer: 'COD (complément d\'objet direct — répond à "je vois quoi ?")' },
    { question: 'Quelle est la nature d\'un article défini ?', answer: 'Déterminant — le, la, les, l\'' },
  ]},
  { subject: 'Français', label: 'Français — Littérature', items: [
    { question: 'Auteur de "Les Misérables" ?', answer: 'Victor Hugo (1862) — romantisme, critique sociale' },
    { question: 'Auteur de "Madame Bovary" ?', answer: 'Gustave Flaubert (1857) — réalisme' },
    { question: 'Auteur de "L\'Étranger" ?', answer: 'Albert Camus (1942) — absurde, existentialisme' },
    { question: 'Auteur de "Le Petit Prince" ?', answer: 'Antoine de Saint-Exupéry (1943)' },
    { question: 'Auteur de "Candide" ?', answer: 'Voltaire (1759) — Lumières, conte philosophique' },
    { question: 'Auteur de "Les Fleurs du Mal" ?', answer: 'Charles Baudelaire (1857) — symbolisme, spleen' },
    { question: 'Auteur de "Germinal" ?', answer: 'Émile Zola (1885) — naturalisme, monde ouvrier' },
    { question: 'Qu\'est-ce qu\'un apologue ?', answer: 'Récit court à visée moralisatrice — inclut fables, paraboles, contes philosophiques' },
    { question: 'Qu\'est-ce que l\'ironie ?', answer: 'Figure de style consistant à dire le contraire de ce qu\'on pense pour railler ou critiquer' },
    { question: 'Qu\'est-ce qu\'une allégorie ?', answer: 'Représentation d\'une idée abstraite par un être ou objet concret (La Justice = femme au bandeau)' },
    { question: 'Qu\'est-ce qu\'un monologue intérieur ?', answer: 'Technique narrative rendant les pensées d\'un personnage sans interlocuteur — stream of consciousness' },
  ]},
  // ── Anglais ──────────────────────────────────────────────────────────────────
  { subject: 'Anglais', label: 'Anglais — Civilisation anglosaxonne', items: [
    { question: 'Capital of the United Kingdom ?', answer: 'London' },
    { question: 'Capital of Australia ?', answer: 'Canberra (not Sydney!)' },
    { question: 'Capital of Canada ?', answer: 'Ottawa' },
    { question: 'What is the Magna Carta (1215) ?', answer: 'First document limiting royal power in England — foundation of constitutional law' },
    { question: 'When did the USA declare independence ?', answer: 'July 4, 1776' },
    { question: 'Who was the first US president ?', answer: 'George Washington (1789)' },
    { question: 'What is the "American Dream" ?', answer: 'The belief that anyone can succeed through hard work and determination in the USA' },
    { question: 'When was the civil rights movement in the USA ?', answer: '1950s–1960s — led by Martin Luther King Jr.' },
    { question: 'What is the Commonwealth ?', answer: 'Association of countries formerly part of the British Empire — 56 member states' },
    { question: 'Name 3 Shakespeare plays ?', answer: 'Hamlet, Romeo and Juliet, Macbeth, A Midsummer Night\'s Dream, Othello...' },
  ]},
  { subject: 'Anglais', label: 'Anglais — Grammaire', items: [
    { question: 'Traduire : "Il pleut depuis 3 heures" ?', answer: 'It has been raining for 3 hours  (present perfect continuous)' },
    { question: '"Used to + infinitive" signifie ?', answer: 'Habitude passée qui n\'existe plus : "I used to play football" = "Je jouais au foot (avant)"' },
    { question: 'Différence "some" / "any" ?', answer: 'Some : phrases affirmatives + offres/demandes polies. Any : phrases négatives et interrogatives.' },
    { question: 'Comment former le comparatif de supériorité d\'un long adjectif ?', answer: 'More + adjectif : "more beautiful", "more interesting"' },
    { question: 'Superlatif de "good" ?', answer: 'The best' },
    { question: 'Superlatif de "bad" ?', answer: 'The worst' },
    { question: '"I wish I were taller" — quel temps verbal ?', answer: 'Subjonctif passé (were pour tous les sujets) — souhait irréalisable présent' },
    { question: 'Traduire : "Je le ferai faire" (causatif) ?', answer: '"I will have it done" ou "I will get it done"' },
    { question: '"Despite" + quelle forme ?', answer: '"Despite" + nom ou gérondif : "Despite the rain" / "Despite raining"' },
    { question: 'Pronoms relatifs : who / which / that / whose ?', answer: 'Who : personnes. Which : choses. That : personnes et choses. Whose : possession.' },
  ]},
  // ── Philosophie ──────────────────────────────────────────────────────────────
  { subject: 'Philosophie', label: 'Philosophie — Citations et auteurs', items: [
    { question: '"Je pense donc je suis" — auteur et œuvre ?', answer: 'Descartes — Discours de la méthode (1637)' },
    { question: '"L\'homme est un animal politique" — auteur ?', answer: 'Aristote — La Politique' },
    { question: '"L\'enfer, c\'est les autres" — auteur et pièce ?', answer: 'Sartre — Huis Clos (1944)' },
    { question: '"La liberté des uns s\'arrête où commence celle des autres" — sens ?', answer: 'La liberté individuelle est limitée par celle d\'autrui — principe libéral fondateur' },
    { question: '"Agis seulement selon la maxime qui te permet de vouloir qu\'elle soit une loi universelle" — auteur ?', answer: 'Kant — Impératif catégorique — Fondements de la métaphysique des mœurs' },
    { question: '"Dieu est mort" — auteur et sens ?', answer: 'Nietzsche — la mort des valeurs morales absolues, fin des certitudes religieuses en Occident' },
    { question: '"Le doute est le commencement de la philosophie" — sens ?', answer: 'Douter de tout (scepticisme méthodique) permet de trouver des vérités solides' },
    { question: 'Qu\'est-ce que l\'allégorie de la caverne (Platon) ?', answer: 'Prisonniers ne voient que des ombres = monde sensible. Sortir de la caverne = accéder au monde des idées (vérité)' },
    { question: 'Qu\'est-ce que l\'utilitarisme (Mill, Bentham) ?', answer: 'Théorie morale : la bonne action est celle qui maximise le bonheur du plus grand nombre' },
    { question: 'Qu\'est-ce que le contrat social (Rousseau) ?', answer: 'Convention par laquelle les individus aliènent leur liberté naturelle pour obtenir liberté civile et protection' },
  ]},
  // ── NSI ──────────────────────────────────────────────────────────────────────
  { subject: 'NSI/Informatique', label: 'NSI — Algorithmique et Python', items: [
    { question: 'Complexité de la recherche linéaire dans une liste non triée ?', answer: 'O(n) — dans le pire cas on parcourt tous les éléments' },
    { question: 'Complexité de la recherche dichotomique dans une liste triée ?', answer: 'O(log n) — on divise par 2 à chaque étape' },
    { question: 'Complexité du tri fusion (Merge Sort) ?', answer: 'O(n log n) dans tous les cas' },
    { question: 'Qu\'est-ce qu\'un algorithme récursif ?', answer: 'Algorithme qui s\'appelle lui-même — nécessite un cas de base pour s\'arrêter' },
    { question: 'Résultat de sorted([3,1,4,1,5,9]) en Python ?', answer: '[1, 1, 3, 4, 5, 9]' },
    { question: '"Hello"[1:4] en Python ?', answer: '"ell" (indices 1, 2, 3 — le dernier exclu)' },
    { question: 'Opérateur modulo en Python ?', answer: '% — retourne le reste de la division entière (7 % 3 = 1)' },
    { question: 'Différence entre liste Python et tuple Python ?', answer: 'Liste []: mutable (modifiable). Tuple (): immutable (non modifiable)' },
    { question: 'Qu\'est-ce que le paradigme orienté objet ?', answer: 'Organisation du code en classes et objets — encapsulation, héritage, polymorphisme' },
    { question: 'Méthode pour trier une liste en place en Python ?', answer: 'ma_liste.sort()  (modifie la liste) vs sorted() (retourne une nouvelle liste)' },
    { question: 'Qu\'est-ce qu\'une assertion dans un algorithme ?', answer: 'Propriété vraie à un moment du programme — utilisée pour vérifier les invariants' },
  ]},
  // ── SES ──────────────────────────────────────────────────────────────────────
  { subject: 'SES/Économie', label: 'SES — Économie', items: [
    { question: 'Définition de l\'inflation ?', answer: 'Hausse générale et durable des prix — mesurée par l\'indice des prix à la consommation (IPC)' },
    { question: 'Définition du chômage (BIT) ?', answer: 'Personne sans emploi, disponible et en recherche active d\'emploi' },
    { question: 'Taux de chômage = ?', answer: '(Nombre de chômeurs / Population active) × 100' },
    { question: 'Qu\'est-ce que la politique monétaire ?', answer: 'Action de la banque centrale sur la masse monétaire et les taux d\'intérêt (BCE en zone euro)' },
    { question: 'Qu\'est-ce que la politique budgétaire ?', answer: 'Action de l\'État sur ses dépenses et recettes (fiscalité) pour influencer l\'économie' },
    { question: 'Définition du déficit public ?', answer: 'Excédent des dépenses publiques sur les recettes publiques sur un exercice' },
    { question: 'Définition de la dette publique ?', answer: 'Accumulation des déficits passés — total des emprunts de l\'État' },
    { question: 'Qu\'est-ce que le libre-échange ?', answer: 'Commerce international sans barrières douanières ni restrictions — préconisé par Ricardo (avantages comparatifs)' },
    { question: 'Définition du protectionnisme ?', answer: 'Protection de l\'économie nationale par des droits de douane, quotas ou subventions' },
    { question: 'Définition de l\'externalité négative ?', answer: 'Coût subi par un tiers non partie à la transaction — ex : pollution industrielle' },
  ]},


  // ── Maths Collège — Algèbre ──────────────────────────────────────────────────
  { subject: "Maths", label: "Maths — Algèbre Collège", items: [
    { question: "Développer (x+3)(x-2)", answer: "x² + x - 6" },
    { question: "Factoriser x² - 9", answer: "(x-3)(x+3)" },
    { question: "Résoudre 3x - 7 = 11", answer: "x = 6" },
    { question: "Résoudre 2(x+1) = 10", answer: "x = 4" },
    { question: "Simplifier 15x/25", answer: "3x/5" },
    { question: "Résoudre x² = 49", answer: "x = 7 ou x = -7" },
    { question: "Réduire 3x + 2y - x + 5y", answer: "2x + 7y" },
    { question: "Développer (2x-1)²", answer: "4x² - 4x + 1" },
    { question: "Résoudre x/4 + 1 = 3", answer: "x = 8" },
    { question: "Valeur de f(3) si f(x)=2x²-5", answer: "f(3) = 2×9-5 = 13" },
    { question: "Signe de -3x+6 pour x > 2 ?", answer: "Négatif (car -3x+6 < 0 quand x > 2)" },
    { question: "Résoudre 4x + 3 = 2x + 11", answer: "x = 4" },
    { question: "Que vaut (a+b)² - (a-b)² ?", answer: "4ab" },
    { question: "Résoudre |x| = 5", answer: "x = 5 ou x = -5" },
    { question: "Développer 3(2x² - x + 4)", answer: "6x² - 3x + 12" },
  ]},
  // ── Maths — Statistiques & Probabilités ──────────────────────────────────────
  { subject: "Maths", label: "Maths — Statistiques & Probabilités", items: [
    { question: "Définition de la médiane", answer: "Valeur qui partage la série en 2 moitiés égales" },
    { question: "Moyenne de 5, 10, 15, 20", answer: "(5+10+15+20)/4 = 50/4 = 12,5" },
    { question: "P(A) si A a 3 issues sur 12 équiprobables ?", answer: "P(A) = 3/12 = 1/4 = 0,25" },
    { question: "Que vaut P(A) + P(Ā) ?", answer: "1 (événements contraires)" },
    { question: "Étendue de : 4, 9, 2, 17, 11", answer: "17 - 2 = 15" },
    { question: "Mode de : 3, 5, 3, 8, 3, 7", answer: "3 (valeur la plus fréquente)" },
    { question: "P(pile) au lancer de pièce équilibrée ?", answer: "1/2 = 0,5" },
    { question: "Variable aléatoire X∼B(n,p) : E(X) = ?", answer: "np" },
    { question: "Variance d'une loi B(n,p) ?", answer: "np(1-p)" },
    { question: "Q1 de : 2, 4, 6, 8, 10, 12 ?", answer: "Q1 = 4 (25e percentile)" },
    { question: "Interpréter un écart-type élevé", answer: "Les données sont très dispersées autour de la moyenne" },
    { question: "P(X≥1) si P(X=0)=0,3 ?", answer: "1 - 0,3 = 0,7" },
    { question: "Un événement impossible a quelle probabilité ?", answer: "0" },
    { question: "Un événement certain a quelle probabilité ?", answer: "1" },
    { question: "Loi des grands nombres : que dit-elle ?", answer: "Plus on répète l'expérience, plus la fréquence converge vers la probabilité" },
  ]},
  // ── Physique — Électricité ────────────────────────────────────────────────────
  { subject: "Physique", label: "Physique — Électricité", items: [
    { question: "Loi d'Ohm : formule", answer: "U = R × I (tension = résistance × intensité)" },
    { question: "Unité de la résistance électrique ?", answer: "Ohm (Ω)" },
    { question: "Unité de la tension électrique ?", answer: "Volt (V)" },
    { question: "Unité de l'intensité électrique ?", answer: "Ampère (A)" },
    { question: "En série, la tension se... ?", answer: "Partage (U_total = U1 + U2 + ...)" },
    { question: "En parallèle, l'intensité se... ?", answer: "Partage (I_total = I1 + I2 + ...)" },
    { question: "Formule de la puissance électrique ?", answer: "P = U × I (en watts)" },
    { question: "Formule de l'énergie électrique ?", answer: "E = P × t (en joules ou watt-heure)" },
    { question: "Résistance équivalente en série ?", answer: "R_éq = R1 + R2 + R3..." },
    { question: "Résistance équivalente en parallèle (2 résistances) ?", answer: "1/R_éq = 1/R1 + 1/R2" },
    { question: "Effet Joule : formule de la puissance dissipée ?", answer: "P = R × I²" },
    { question: "Ampèremètre : comment le brancher ?", answer: "En série dans le circuit" },
    { question: "Voltmètre : comment le brancher ?", answer: "En dérivation (parallèle) aux bornes du dipôle" },
    { question: "Sens conventionnel du courant ?", answer: "Du + vers le - à l'extérieur du générateur" },
    { question: "Un court-circuit : qu'est-ce que c'est ?", answer: "Connexion directe des bornes d'un générateur sans résistance — dangereux !" },
  ]},
  // ── Physique — Optique ────────────────────────────────────────────────────────
  { subject: "Physique", label: "Physique — Optique & Lumière", items: [
    { question: "Vitesse de la lumière dans le vide ?", answer: "c = 3 × 10⁸ m/s" },
    { question: "Loi de Snell-Descartes (réfraction) ?", answer: "n1 × sin(i1) = n2 × sin(i2)" },
    { question: "Indice de réfraction de l'eau (approx) ?", answer: "n ≈ 1,33" },
    { question: "Que se passe-t-il lors de la réflexion totale ?", answer: "Angle d'incidence > angle critique → la lumière est totalement réfléchie" },
    { question: "Spectre visible : quelles couleurs ?", answer: "Violet, indigo, bleu, vert, jaune, orange, rouge" },
    { question: "Formule conjugaison lentille mince (vergence) ?", answer: "1/v - 1/u = 1/f' = V (vergence en dioptries)" },
    { question: "Un rayon passant par le centre optique est... ?", answer: "Non dévié" },
    { question: "Image réelle vs image virtuelle ?", answer: "Réelle : se forme du côté opposé à l'objet. Virtuelle : même côté que l'objet" },
    { question: "Lentille convergente : signe de f' ?", answer: "f' > 0 (foyer image du côté de l'image réelle)" },
    { question: "Grandissement γ = ?", answer: "γ = taille image / taille objet = v/u" },
    { question: "Longueur d'onde de la lumière visible : intervalle ?", answer: "400 nm (violet) à 700 nm (rouge)" },
    { question: "Relation énergie photon et fréquence ?", answer: "E = h × f (h = constante de Planck ≈ 6,63 × 10⁻³⁴ J·s)" },
    { question: "Dispersion de la lumière blanche ?", answer: "Un prisme sépare les couleurs car chaque longueur d'onde est réfractée différemment" },
    { question: "Effet photoélectrique : qu'observe-t-on ?", answer: "Émission d'électrons quand la lumière frappe un métal (si ν > fréquence seuil)" },
    { question: "Fibre optique : quel phénomène utilise-t-elle ?", answer: "La réflexion totale interne" },
  ]},
  // ── Chimie — Liaisons & Molécules ────────────────────────────────────────────
  { subject: "Chimie", label: "Chimie — Liaisons & Molécules", items: [
    { question: "Liaison covalente : définition", answer: "Partage de 2 électrons entre 2 atomes" },
    { question: "Règle de l'octet", answer: "Les atomes tendent à avoir 8 électrons sur leur couche externe" },
    { question: "Formule de l'eau ?", answer: "H₂O" },
    { question: "Formule du dioxyde de carbone ?", answer: "CO₂" },
    { question: "Qu'est-ce qu'un ion positif ?", answer: "Un cation (atome ayant perdu des électrons)" },
    { question: "Qu'est-ce qu'un ion négatif ?", answer: "Un anion (atome ayant gagné des électrons)" },
    { question: "Formule de l'acide chlorhydrique ?", answer: "HCl" },
    { question: "Formule de la soude (hydroxyde de sodium) ?", answer: "NaOH" },
    { question: "Nombre d'électrons de valence du carbone ?", answer: "4 (groupe 14)" },
    { question: "Électronégativité : définition", answer: "Capacité d'un atome à attirer les électrons d'une liaison vers lui" },
    { question: "Qu'est-ce qu'une liaison hydrogène ?", answer: "Interaction faible entre H lié à N/O/F et un autre N/O/F — explique les propriétés de l'eau" },
    { question: "Masse molaire de NaCl ?", answer: "23 (Na) + 35,5 (Cl) = 58,5 g/mol" },
    { question: "Formule du méthane ?", answer: "CH₄" },
    { question: "Formule de l'éthanol ?", answer: "C₂H₅OH" },
    { question: "Formule du glucose ?", answer: "C₆H₁₂O₆" },
  ]},
  // ── SVT — Cellule & ADN ──────────────────────────────────────────────────────
  { subject: "SVT", label: "SVT — Cellule & ADN", items: [
    { question: "De quoi est composée la membrane cellulaire ?", answer: "Bicouche de phospholipides avec des protéines" },
    { question: "Rôle des mitochondries ?", answer: "Production d'ATP par respiration cellulaire (centrale énergétique)" },
    { question: "Rôle des chloroplastes ?", answer: "Photosynthèse (conversion lumière → énergie chimique)" },
    { question: "ADN : que signifie l'acronyme ?", answer: "Acide DésoxyriboNucléique" },
    { question: "Bases azotées de l'ADN ?", answer: "Adénine (A), Thymine (T), Cytosine (C), Guanine (G)" },
    { question: "Règle de complémentarité des bases ?", answer: "A-T et C-G (dans l'ADN)" },
    { question: "Qu'est-ce qu'un gène ?", answer: "Séquence d'ADN codant pour une protéine ou un ARN fonctionnel" },
    { question: "Nombre de chromosomes dans une cellule humaine ?", answer: "46 chromosomes (23 paires)" },
    { question: "Définition de la mitose ?", answer: "Division cellulaire produisant 2 cellules filles identiques (même nombre de chromosomes)" },
    { question: "Définition de la méiose ?", answer: "Division cellulaire réductrice produisant 4 cellules haploïdes (gamètes)" },
    { question: "ARN messager : rôle ?", answer: "Transporte le message génétique du noyau vers les ribosomes pour la synthèse des protéines" },
    { question: "Mutation : définition ?", answer: "Modification de la séquence d'ADN — peut être neutre, bénéfique ou néfaste" },
    { question: "Qu'est-ce que la transcription ?", answer: "Copie de l'ADN en ARNm dans le noyau" },
    { question: "Qu'est-ce que la traduction ?", answer: "Synthèse d'une protéine à partir de l'ARNm par les ribosomes" },
    { question: "Cellule procaryote vs eucaryote ?", answer: "Procaryote : pas de noyau (bactéries). Eucaryote : noyau membraneux (animaux, plantes, champignons)" },
  ]},
  // ── SVT — Évolution & Écologie ───────────────────────────────────────────────
  { subject: "SVT", label: "SVT — Évolution & Classification", items: [
    { question: "Théorie de l'évolution : qui l'a proposée ?", answer: "Charles Darwin (1859, L'Origine des espèces)" },
    { question: "Sélection naturelle : principe ?", answer: "Les individus les mieux adaptés survivent et se reproduisent plus — transmettant leurs caractères" },
    { question: "Définition d'une espèce ?", answer: "Groupe d'individus pouvant se reproduire entre eux et produire une descendance fertile" },
    { question: "Homologie vs analogie ?", answer: "Homologie : même origine, formes différentes (aile chauve-souris/bras humain). Analogie : même fonction, origines différentes" },
    { question: "Qu'est-ce qu'un taxon ?", answer: "Groupe d'êtres vivants défini par des caractères communs (ex : mammifères, insectes)" },
    { question: "Classification phylogénétique : base ?", answer: "Parenté évolutive (caractères dérivés partagés = synapomorphies)" },
    { question: "Niveau de classification du plus général au plus précis ?", answer: "Règne → Embranchement → Classe → Ordre → Famille → Genre → Espèce" },
    { question: "Dérive génétique : définition ?", answer: "Variation aléatoire des fréquences alléliques dans une petite population" },
    { question: "Spéciation allopatrique ?", answer: "Formation d'une nouvelle espèce due à l'isolement géographique de populations" },
    { question: "Qu'est-ce qu'un fossile ?", answer: "Reste ou trace d'un organisme ancien préservé dans les roches sédimentaires" },
    { question: "Chaîne alimentaire : 3 niveaux principaux ?", answer: "Producteurs (plantes) → Consommateurs primaires → Consommateurs secondaires" },
    { question: "Décomposeurs : rôle dans l'écosystème ?", answer: "Recyclent la matière organique en minéraux réutilisables par les plantes" },
    { question: "Biome : définition ?", answer: "Grande unité écologique définie par le climat et les espèces dominantes (ex : forêt tropicale, toundra)" },
    { question: "Biodiversité spécifique ?", answer: "Nombre d'espèces différentes dans un écosystème" },
    { question: "Impact de la déforestation sur la biodiversité ?", answer: "Destruction d'habitats → extinction d'espèces → réduction de la biodiversité" },
  ]},
  // ── Histoire — Moyen Âge ────────────────────────────────────────────────────
  { subject: "Histoire", label: "Histoire — Moyen Âge", items: [
    { question: "Dates du Moyen Âge ?", answer: "476 (chute de Rome) → 1492 (découverte de l'Amérique)" },
    { question: "Qu'est-ce que la féodalité ?", answer: "Système politique où des seigneurs accordent des terres (fiefs) à des vassaux en échange de services militaires" },
    { question: "Qui est Charlemagne ?", answer: "Roi des Francs couronné empereur d'Occident en 800 — unifie une grande partie de l'Europe" },
    { question: "Qu'est-ce qu'une croisade ?", answer: "Expédition militaire chrétienne pour reprendre Jérusalem aux musulmans (1096-1291)" },
    { question: "Qu'est-ce que la Peste Noire ?", answer: "Épidémie de peste bubonique (1347-1353) qui tua 1/3 de la population européenne" },
    { question: "Qu'est-ce qu'une cathédrale gothique ?", answer: "Édifice religieux médiéval avec arcs-boutants, grandes fenêtres et flèches élancées (ex : Notre-Dame de Paris)" },
    { question: "Qui est Jeanne d'Arc ?", answer: "Héroïne française de la Guerre de Cent Ans, brûlée en 1431, canonisée en 1920" },
    { question: "La Guerre de Cent Ans (1337-1453) oppose qui ?", answer: "La France et l'Angleterre pour le trône de France" },
    { question: "Qu'est-ce qu'un serf au Moyen Âge ?", answer: "Paysan lié à la terre d'un seigneur, sans liberté totale de mouvement" },
    { question: "Date de la prise de Constantinople ?", answer: "1453 — par les Ottomans de Mehmed II, fin de l'Empire byzantin" },
    { question: "Qu'est-ce qu'une commune médiévale ?", answer: "Ville affranchie qui obtient des droits d'autonomie (charte communale) de son seigneur" },
    { question: "Rôle de l'Église au Moyen Âge ?", answer: "Institution centrale : religion, education, hôpitaux, droit canon, pouvoir politique" },
    { question: "Qu'est-ce qu'un chevalier ?", answer: "Guerrier à cheval appartenant à la noblesse, suivant un code d'honneur (chevalerie)" },
    { question: "Qu'est-ce qu'une guilde médiévale ?", answer: "Association de marchands ou d'artisans d'un même métier pour protéger leurs intérêts" },
    { question: "Qu'est-ce que l'Inquisition ?", answer: "Tribunal de l'Église chargé de juger et réprimer les hérétiques" },
  ]},
  // ── Histoire — Époque Moderne ─────────────────────────────────────────────────
  { subject: "Histoire", label: "Histoire — Renaissance & Époque Moderne", items: [
    { question: "Qu'est-ce que la Renaissance ?", answer: "Mouvement culturel (XVe-XVIe s.) de redécouverte de l'Antiquité, révolution artistique et scientifique" },
    { question: "Qui a peint la Joconde ?", answer: "Léonard de Vinci (vers 1503-1519)" },
    { question: "Qu'est-ce que l'imprimerie de Gutenberg ?", answer: "Invention de l'impression à caractères mobiles (vers 1450) — révolutionne la diffusion du savoir" },
    { question: "Qu'est-ce que la Réforme protestante ?", answer: "Mouvement religieux initié par Luther (1517) contestant l'autorité de l'Église catholique" },
    { question: "Date de la découverte de l'Amérique ?", answer: "1492 — par Christophe Colomb" },
    { question: "Qu'est-ce que l'humanisme ?", answer: "Courant de pensée qui place l'Homme au centre de la réflexion — Érasme, Rabelais, Montaigne" },
    { question: "Qui était Louis XIV ?", answer: "Roi de France (1643-1715), le Roi-Soleil, monarque absolu — Versailles" },
    { question: "Qu'est-ce que le mercantilisme ?", answer: "Doctrine économique : l'État doit accumuler des métaux précieux en favorisant les exportations" },
    { question: "Qu'est-ce que la traite négrière transatlantique ?", answer: "Commerce triangulaire (XVIe-XIXe s.) déportant des millions d'Africains comme esclaves vers les Amériques" },
    { question: "Galilée : quelle découverte célèbre ?", answer: "Défend l'héliocentrisme (Terre tourne autour du Soleil) — condamné par l'Église en 1633" },
    { question: "Qu'est-ce que l'Edit de Nantes (1598) ?", answer: "Édit d'Henri IV accordant la liberté de culte aux protestants en France" },
    { question: "Colonisation des Amériques : conséquences pour les populations ?", answer: "Extermination par guerres et maladies de 80-90% des populations amérindiennes" },
    { question: "Qu'est-ce que le siècle des Lumières ?", answer: "XVIIIe siècle — philosophes (Voltaire, Rousseau, Diderot) prônent raison, liberté, tolérance" },
    { question: "Quelle est la date de la Déclaration d'Indépendance américaine ?", answer: "4 juillet 1776" },
    { question: "Qui était Napoléon Bonaparte ?", answer: "Général devenu Consul puis Empereur des Français (1804-1814/1815) — Code Civil, conquêtes européennes" },
  ]},
  // ── Géographie — France ──────────────────────────────────────────────────────
  { subject: "Géographie", label: "Géographie — La France", items: [
    { question: "Superficie de la France métropolitaine ?", answer: "551 500 km² (5e d'Europe)" },
    { question: "Fleuve le plus long de France ?", answer: "La Loire (1013 km)" },
    { question: "Plus haut sommet de France ?", answer: "Mont Blanc (4808 m, massif du Mont-Blanc, Alpes)" },
    { question: "Nombre de régions de France métropolitaine ?", answer: "13 régions (depuis 2016)" },
    { question: "Quels océans/mers bordent la France ?", answer: "Atlantique, Manche, Mer du Nord, Méditerranée" },
    { question: "Quels pays frontaliers de la France ?", answer: "Belgique, Luxembourg, Allemagne, Suisse, Italie, Monaco, Espagne, Andorre" },
    { question: "Capitale et plus grande ville de France ?", answer: "Paris (aire urbaine ~12 millions d'habitants)" },
    { question: "Qu'est-ce que la diagonale du vide ?", answer: "Zone peu peuplée allant du NE au SO de la France (des Ardennes aux Landes)" },
    { question: "Qu'est-ce que la métropolisation ?", answer: "Concentration de la population et des activités dans les grandes métropoles" },
    { question: "Quel est le principal port français ?", answer: "Marseille (marchandises) — Le Havre (conteneurs)" },
    { question: "Qu'est-ce que le DOM-TOM (maintenant DROM-COM) ?", answer: "Départements et régions / collectivités d'outre-mer : Guadeloupe, Martinique, Guyane, Réunion, Mayotte..." },
    { question: "Densité de population en France ?", answer: "Environ 120 hab/km² (très inégalement répartis)" },
    { question: "Quel type de relief domine le Massif Central ?", answer: "Relief volcanique ancien, altitude modérée (500-1886m, Puy de Sancy)" },
    { question: "Qu'est-ce que la littoralisation ?", answer: "Concentration des hommes et activités sur les côtes" },
    { question: "Agriculture française : quel rang mondial ?", answer: "1er exportateur agricole européen, 5-6e mondial" },
  ]},
  // ── Géographie — Mondialisation ──────────────────────────────────────────────
  { subject: "Géographie", label: "Géographie — Mondialisation & Inégalités", items: [
    { question: "Définition de la mondialisation ?", answer: "Processus d'intégration croissante des économies, sociétés et cultures à l'échelle mondiale" },
    { question: "Qu'est-ce qu'une FTN ?", answer: "Firme TransNationale : entreprise opérant dans plusieurs pays (ex : Apple, Toyota, Total)" },
    { question: "Qu'est-ce que le libre-échange ?", answer: "Politique commerciale supprimant les barrières douanières pour faciliter les échanges internationaux" },
    { question: "Qu'est-ce que l'IDH ?", answer: "Indice de Développement Humain — mesure espérance de vie, éducation, revenu (0 à 1)" },
    { question: "Pays du Nord vs Pays du Sud : distinction ?", answer: "Nord = pays développés (PNB élevé). Sud = pays en développement — distinction de plus en plus nuancée" },
    { question: "Qu'est-ce que le BRICS ?", answer: "Brésil, Russie, Inde, Chine, Afrique du Sud — pays émergents à forte croissance" },
    { question: "Qu'est-ce qu'une ville mondiale (global city) ?", answer: "Ville concentrant des fonctions de commandement mondial : New York, Londres, Tokyo" },
    { question: "Qu'est-ce que la fracture numérique ?", answer: "Inégalité d'accès aux technologies numériques entre pays et entre populations" },
    { question: "Qu'est-ce que le commerce équitable ?", answer: "Commerce garantissant un prix juste aux producteurs des pays du Sud" },
    { question: "Qu'est-ce que l'OMC ?", answer: "Organisation Mondiale du Commerce — régule les échanges commerciaux internationaux" },
    { question: "Flux financiers illicites : où vont-ils souvent ?", answer: "Paradis fiscaux (ex : Îles Caïmans, Luxembourg, Suisse)" },
    { question: "Qu'est-ce que la délocalisation ?", answer: "Transfert de la production vers des pays à main-d'œuvre moins chère" },
    { question: "Qu'est-ce que le tourisme de masse ?", answer: "Tourisme de grande échelle avec impacts environnementaux et culturels importants" },
    { question: "Qu'est-ce qu'une ZIP (Zone Industrialo-Portuaire) ?", answer: "Zone combinant port et industrie lourde pour le commerce mondial (ex : Dunkerque, Fos-sur-Mer)" },
    { question: "Quels sont les 3 pôles de la Triade ?", answer: "États-Unis, Europe, Japon — centres historiques de la mondialisation" },
  ]},
  // ── Français — Grammaire avancée ─────────────────────────────────────────────
  { subject: "Français", label: "Français — Grammaire avancée", items: [
    { question: "Qu'est-ce qu'un groupe nominal ?", answer: "Ensemble centré sur un nom avec ses déterminants et adjectifs (ex : la belle maison rouge)" },
    { question: "Différence subordonnée relative et complétive ?", answer: "Relative : introduite par pronom relatif (qui, que, dont). Complétive : introduite par que, si" },
    { question: "Qu'est-ce qu'une proposition principale ?", answer: "Proposition qui ne dépend d'aucune autre — peut exister seule" },
    { question: "Imparfait vs passé simple : différence ?", answer: "Imparfait : action durée/répétée. Passé simple : action ponctuelle dans le passé (récit)" },
    { question: "Qu'est-ce que le COI ?", answer: "Complément d'Objet Indirect — relié au verbe par une préposition (parler à, penser à)" },
    { question: "Accord du participe passé avec avoir ?", answer: "S'accorde avec le COD si celui-ci est PLACÉ AVANT le verbe" },
    { question: "Qu'est-ce qu'un attribut du sujet ?", answer: "Mot relié au sujet par un verbe d'état (être, paraître...) — ex : Il semble fatigué" },
    { question: "Nature vs fonction : distinction ?", answer: "Nature = ce qu'est le mot (nom, adjectif). Fonction = rôle dans la phrase (sujet, COD...)" },
    { question: "Apposition : définition ?", answer: "Élément détaché qui précise ou renomme le nom (ex : Paris, capitale de la France, est belle)" },
    { question: "Qu'est-ce qu'une proposition infinitive ?", answer: "Proposition avec un infinitif comme verbe (ex : J'entends les oiseaux chanter)" },
    { question: "Mode subjonctif : quand l'utiliser ?", answer: "Après verbes d'obligation, de doute, de désir, de sentiment (ex : Il faut que tu viennes)" },
    { question: "Qu'est-ce qu'un complément circonstanciel ?", answer: "Complément mobile indiquant les circonstances : temps, lieu, cause, manière (ex : hier, ici, pour cela)" },
    { question: "Accord de l'adjectif avec plusieurs noms ?", answer: "Masculin pluriel si au moins un nom est masculin (ex : une table et un banc verts)" },
    { question: "Qu'est-ce qu'une périphrase ?", answer: "Expression de plusieurs mots remplaçant un seul mot (ex : l'astre du jour = le soleil)" },
    { question: "Qu'est-ce qu'une asyndète ?", answer: "Juxtaposition de propositions sans conjonction de coordination (ex : Je vins, je vis, je vainquis)" },
  ]},
  // ── Français — Littérature ───────────────────────────────────────────────────
  { subject: "Français", label: "Français — Mouvements & Œuvres", items: [
    { question: "Qu'est-ce que le classicisme (XVIIe s.) ?", answer: "Mouvement prônant ordre, mesure, vraisemblance, règle des 3 unités (Molière, Racine, Corneille)" },
    { question: "Qu'est-ce que le romantisme (XIXe s.) ?", answer: "Mouvement privilégiant sentiments, nature, moi profond, mélancolie (Hugo, Lamartine, Musset)" },
    { question: "Qu'est-ce que le réalisme ?", answer: "Représentation fidèle de la réalité sociale (Balzac, Flaubert, Maupassant)" },
    { question: "Qu'est-ce que le naturalisme ?", answer: "Courant issu du réalisme appliquant méthode scientifique à la littérature (Zola, les Rougon-Macquart)" },
    { question: "Qu'est-ce que le surréalisme ?", answer: "Mouvement du XXe s. explorant l'inconscient, le rêve, le hasard (Breton, Éluard, Aragon)" },
    { question: "Victor Hugo : 3 œuvres majeures ?", answer: "Les Misérables, Notre-Dame de Paris, Les Contemplations" },
    { question: "Molière : genre et 3 pièces ?", answer: "Comédie — Tartuffe, Le Misanthrope, L'Avare" },
    { question: "Qu'est-ce qu'une tragédie classique ?", answer: "Pièce mettant en scène personnages nobles conduits à leur perte par destin ou passion (Racine : Phèdre)" },
    { question: "Caractéristiques d'un sonnet ?", answer: "14 vers : 2 quatrains + 2 tercets — rimes embrassées/croisées (ABBA ou ABAB)" },
    { question: "Albert Camus : 2 romans et 1 idée centrale ?", answer: "L'Étranger, La Peste — absurde : l'homme cherche du sens dans un monde qui n'en a pas" },
    { question: "Qu'est-ce qu'une autobiographie ?", answer: "Récit rétrospectif d'une personne sur sa propre vie (Rousseau : Confessions)" },
    { question: "Flaubert : roman le plus célèbre ?", answer: "Madame Bovary (1857) — réalisme, style indirect libre" },
    { question: "Qu'est-ce que le Nouveau Roman (XXe s.) ?", answer: "Courant qui remet en cause le roman traditionnel (personnage, intrigue) — Robbe-Grillet, Sarraute" },
    { question: "Qu'est-ce que l'alexandrin ?", answer: "Vers de 12 syllabes divisé en 2 hémistiches de 6 — dominant dans la poésie classique française" },
    { question: "Racine vs Corneille : distinction principale ?", answer: "Racine : tragédie de la passion amoureuse, fatalité. Corneille : conflit devoir/amour, héroïsme" },
  ]},
  // ── Anglais — Vocabulaire & Culture ──────────────────────────────────────────
  { subject: "Anglais", label: "Anglais — Vocabulaire thématique B1/B2", items: [
    { question: "Traduire : l'environnement", answer: "the environment / environmental issues" },
    { question: "Traduire : le réchauffement climatique", answer: "global warming / climate change" },
    { question: "Traduire : les droits de l'homme", answer: "human rights" },
    { question: "Traduire : l'égalité des chances", answer: "equal opportunities" },
    { question: "Traduire : la mondialisation", answer: "globalization" },
    { question: "Traduire : l'immigration", answer: "immigration / migrants" },
    { question: "Traduire : l'intelligence artificielle", answer: "artificial intelligence (AI)" },
    { question: "Traduire : le développement durable", answer: "sustainable development" },
    { question: "Traduire : la santé mentale", answer: "mental health" },
    { question: "Traduire : les inégalités sociales", answer: "social inequalities" },
    { question: "Différence between 'its' and 'it's' ?", answer: "'its' = possessif (son/sa). 'it's' = it is (contraction)" },
    { question: "Traduire : les médias sociaux", answer: "social media" },
    { question: "Traduire : la liberté d'expression", answer: "freedom of speech / freedom of expression" },
    { question: "Traduire : la discrimination", answer: "discrimination" },
    { question: "Traduire : l'entrepreneuriat", answer: "entrepreneurship" },
  ]},
  // ── Philosophie — Notions Bac ────────────────────────────────────────────────
  { subject: "Philosophie", label: "Philosophie — Grandes Notions Bac", items: [
    { question: "Définir la liberté selon Sartre", answer: "L'existence précède l'essence — l'homme est condamné à être libre, entièrement responsable de ses choix" },
    { question: "Qu'est-ce que l'impératif catégorique de Kant ?", answer: "Agis uniquement selon la maxime que tu pourrais vouloir ériger en loi universelle" },
    { question: "Utilitarisme de Mill : principe ?", answer: "La bonne action est celle qui maximise le bonheur du plus grand nombre" },
    { question: "Qu'est-ce que le contrat social (Rousseau) ?", answer: "Les hommes cèdent une partie de leur liberté naturelle à la société en échange de protection" },
    { question: "Distinguer morale et droit", answer: "Morale : règles intérieures, non contraignantes légalement. Droit : règles extérieures, sanctionnées par l'État" },
    { question: "Platon : allégorie de la caverne — message ?", answer: "Les hommes perçoivent des ombres (apparences). La philosophie libère et mène vers la vérité (le Bien)" },
    { question: "Qu'est-ce que l'empirisme ?", answer: "Doctrine selon laquelle toute connaissance provient de l'expérience sensible (Locke, Hume)" },
    { question: "Qu'est-ce que le rationalisme ?", answer: "Doctrine selon laquelle la raison est la source principale de la connaissance (Descartes, Spinoza)" },
    { question: "Distinguer bonheur et plaisir", answer: "Plaisir : satisfaction ponctuelle. Bonheur : état durable de satisfaction globale de l'existence" },
    { question: "Qu'est-ce que l'aliénation (Marx) ?", answer: "Processus par lequel le travailleur est dépossédé du fruit de son travail et de son humanité" },
    { question: "Qu'est-ce que la conscience selon Descartes ?", answer: "Je pense donc je suis — la conscience de soi est la seule certitude absolue" },
    { question: "Distinguer État et Nation", answer: "Nation : communauté culturelle/historique. État : entité politique avec territoire, gouvernement, souveraineté" },
    { question: "Qu'est-ce que la phénoménologie ?", answer: "Méthode philosophique étudiant les structures de l'expérience vécue et de la conscience (Husserl, Merleau-Ponty)" },
    { question: "Nietzsche : mort de Dieu — implication ?", answer: "La civilisation occidentale a perdu ses valeurs absolues → nécessité de créer de nouvelles valeurs" },
    { question: "Qu'est-ce que l'éthique de la vertu (Aristote) ?", answer: "La vertu est une disposition à agir de façon excellente — cultivée par l'habitude — vise l'eudaimonia (bonheur)" },
  ]},
  // ── NSI — Algorithmique ──────────────────────────────────────────────────────
  { subject: "NSI/Informatique", label: "NSI — Structures de données", items: [
    { question: "Qu'est-ce qu'une liste en Python ?", answer: "Structure de données ordonnée et modifiable — [1, 2, 3]. Accès par index, ajout avec .append()" },
    { question: "Différence liste et tuple en Python ?", answer: "Liste : modifiable []. Tuple : immuable () — plus rapide, utilisé pour données fixes" },
    { question: "Qu'est-ce qu'un dictionnaire Python ?", answer: "Collection clé-valeur : {'nom': 'Alice', 'age': 17}. Accès par clé, non ordonné (avant Python 3.7)" },
    { question: "Qu'est-ce qu'une file (queue) ?", answer: "Structure FIFO : Premier Entré Premier Sorti — comme une file d'attente. Opérations : enqueue/dequeue" },
    { question: "Qu'est-ce qu'une pile (stack) ?", answer: "Structure LIFO : Dernier Entré Premier Sorti — comme une pile d'assiettes. Opérations : push/pop" },
    { question: "Complexité de la recherche dans un tableau trié (dichotomie) ?", answer: "O(log n) — divise l'espace de recherche par 2 à chaque étape" },
    { question: "Complexité tri à bulles (pire cas) ?", answer: "O(n²) — inefficace pour grands tableaux" },
    { question: "Tri fusion : principe et complexité ?", answer: "Diviser pour régner — O(n log n) — divise le tableau puis fusionne les parties triées" },
    { question: "Qu'est-ce qu'un arbre binaire ?", answer: "Structure où chaque nœud a au plus 2 enfants (gauche, droit)" },
    { question: "Arbre binaire de recherche (ABR) : propriété ?", answer: "Fils gauche < nœud < fils droit — permet recherche efficace en O(log n) si équilibré" },
    { question: "Qu'est-ce que la récursivité ?", answer: "Fonction qui s'appelle elle-même — nécessite un cas de base pour éviter l'infini" },
    { question: "Qu'est-ce qu'un graphe ?", answer: "Ensemble de sommets reliés par des arêtes — orienté ou non, pondéré ou non" },
    { question: "Parcours BFS vs DFS ?", answer: "BFS (largeur) : explore niveau par niveau. DFS (profondeur) : explore branche par branche" },
    { question: "Qu'est-ce que SQL ?", answer: "Structured Query Language — langage de requêtes pour bases de données relationnelles" },
    { question: "Requête SQL : sélectionner tout dans table 'eleves' ?", answer: "SELECT * FROM eleves;" },
  ]},
  // ── SES — Sociologie ──────────────────────────────────────────────────────────
  { subject: "SES/Économie", label: "SES — Sociologie & Stratification sociale", items: [
    { question: "Qu'est-ce que la socialisation ?", answer: "Processus par lequel un individu intériorise les normes et valeurs de sa société" },
    { question: "Socialisation primaire vs secondaire ?", answer: "Primaire : enfance, famille. Secondaire : école, pairs, travail, médias" },
    { question: "Qu'est-ce qu'un groupe social ?", answer: "Ensemble d'individus liés par des interactions et une conscience collective" },
    { question: "Classe sociale selon Marx ?", answer: "Groupe défini par sa place dans les rapports de production (bourgeoisie vs prolétariat)" },
    { question: "Capital culturel (Bourdieu) : définition ?", answer: "Ensemble des ressources culturelles (diplômes, savoirs, manières) influençant la position sociale" },
    { question: "Qu'est-ce que la mobilité sociale ascendante ?", answer: "Amélioration de la position sociale par rapport aux parents" },
    { question: "Qu'est-ce que la reproduction sociale ?", answer: "Tendance des inégalités sociales à se perpétuer d'une génération à l'autre" },
    { question: "Qu'est-ce que la déviance (sociologie) ?", answer: "Comportement qui transgresse les normes sociales d'un groupe" },
    { question: "Qu'est-ce qu'une norme sociale ?", answer: "Règle de comportement explicite ou implicite attendue par le groupe" },
    { question: "Qu'est-ce que le capital social (Bourdieu) ?", answer: "Ressources liées aux relations et réseaux sociaux d'un individu" },
    { question: "Inégalités de genre : exemples ?", answer: "Inégalités salariales, double journée de travail, sous-représentation dans le pouvoir" },
    { question: "Qu'est-ce que l'anomie (Durkheim) ?", answer: "État de dérèglement social où les normes sont affaiblies ou absentes — lié à crises, suicides" },
    { question: "Distinction de Bourdieu : concept central ?", answer: "La hiérarchie sociale se construit aussi par les goûts culturels (légitimes vs illégitimes)" },
    { question: "Qu'est-ce que la ségrégation résidentielle ?", answer: "Séparation spatiale des groupes sociaux ou ethniques dans l'espace urbain" },
    { question: "Qu'est-ce que le déclassement social ?", answer: "Mobilité descendante : occuper une position inférieure à celle des parents ou à ses propres attentes" },
  ]},
  // ── SES — Macroéconomie ───────────────────────────────────────────────────────
  { subject: "SES/Économie", label: "SES — Macroéconomie & Croissance", items: [
    { question: "Définition du PIB ?", answer: "Produit Intérieur Brut — valeur totale des biens et services produits sur un territoire en un an" },
    { question: "Croissance économique : définition ?", answer: "Augmentation durable du PIB réel d'un pays" },
    { question: "Qu'est-ce que l'inflation ?", answer: "Hausse généralisée et durable des prix — mesurée par l'IPC (Indice des Prix à la Consommation)" },
    { question: "Qu'est-ce que la politique monétaire ?", answer: "Action de la banque centrale sur la masse monétaire et les taux d'intérêt (BCE en Europe)" },
    { question: "Qu'est-ce que la politique budgétaire ?", answer: "Utilisation des dépenses publiques et impôts par l'État pour influencer l'économie" },
    { question: "Déficit public : définition ?", answer: "Les dépenses de l'État dépassent ses recettes — il emprunte (dette publique)" },
    { question: "Facteurs de production : lesquels ?", answer: "Travail (L) et Capital (K) — selon la théorie néoclassique" },
    { question: "Progrès technique : quel impact sur la croissance ?", answer: "Hausse de la productivité — croissance sans augmentation proportionnelle des facteurs de production" },
    { question: "Qu'est-ce que le taux de chômage ?", answer: "Part des actifs sans emploi qui en cherchent un activement" },
    { question: "Chômage frictionnel vs structurel ?", answer: "Frictionnel : entre deux emplois (temporaire). Structurel : inadéquation formation/marché (durable)" },
    { question: "Qu'est-ce que la courbe de Phillips ?", answer: "Relation inverse entre taux de chômage et taux d'inflation (controversée à long terme)" },
    { question: "Qu'est-ce que la productivité globale des facteurs ?", answer: "Part de la croissance non expliquée par K et L — innovation, organisation, externalités" },
    { question: "Keynes : comment lutter contre la récession ?", answer: "Relance par la demande : augmenter les dépenses publiques (effet multiplicateur)" },
    { question: "Théorie quantitative de la monnaie ?", answer: "MV = PT : Masse monétaire × Vitesse = Prix × Transactions — plus de monnaie → inflation" },
    { question: "Qu'est-ce que l'effet multiplicateur keynésien ?", answer: "1€ dépensé par l'État génère plus d'1€ de revenu national via les dépenses successives" },
  ]},
  // ── Primaire — Français ──────────────────────────────────────────────────────
  { subject: "Français", label: "Primaire — Conjugaison fondamentale", items: [
    { question: "Conjuguer 'être' au présent (je, tu, il) ?", answer: "Je suis, tu es, il/elle est" },
    { question: "Conjuguer 'avoir' au présent (je, tu, il) ?", answer: "J'ai, tu as, il/elle a" },
    { question: "Conjuguer 'aller' au présent (je, tu, il) ?", answer: "Je vais, tu vas, il/elle va" },
    { question: "Terminaison des verbes en -ER au présent (je) ?", answer: "-e (ex : je mange, je chante)" },
    { question: "Conjuguer 'faire' au présent (nous, vous, ils) ?", answer: "Nous faisons, vous faites, ils/elles font" },
    { question: "Passé composé de 'manger' (il) ?", answer: "Il a mangé (auxiliaire avoir + participe passé)" },
    { question: "Passé composé de 'partir' (elle) ?", answer: "Elle est partie (auxiliaire être + participe passé accordé)" },
    { question: "Imparfait : terminaisons (je, tu, il) ?", answer: "-ais, -ais, -ait (ex : je mangeais, tu allais)" },
    { question: "Futur simple de 'venir' (je) ?", answer: "Je viendrai (radical irrégulier)" },
    { question: "Futur simple de 'être' (je) ?", answer: "Je serai" },
    { question: "Futur simple de 'avoir' (tu) ?", answer: "Tu auras" },
    { question: "Conditionnel présent de 'vouloir' (je) ?", answer: "Je voudrais" },
    { question: "Accord du participe passé avec être ?", answer: "S'accorde en genre et nombre avec le sujet (ex : elles sont parties)" },
    { question: "Infinitif ou participe passé après auxiliaire ?", answer: "Après auxiliaire avoir/être → participe passé. Après autre verbe → infinitif" },
    { question: "Verbe au subjonctif présent de 'aller' (il faut que...) ?", answer: "Il faut que j'aille / tu ailles / il aille" },
  ]},
  // ── Primaire — Maths CM1/CM2 ─────────────────────────────────────────────────
  { subject: "Maths", label: "Primaire — Maths CM1/CM2", items: [
    { question: "654 × 7 = ?", answer: "4578" },
    { question: "1000 ÷ 8 = ?", answer: "125" },
    { question: "0,5 × 10 = ?", answer: "5" },
    { question: "Qu'est-ce qu'un nombre premier ?", answer: "Entier > 1 divisible seulement par 1 et lui-même (2, 3, 5, 7, 11...)" },
    { question: "PGCD de 12 et 18 ?", answer: "6 (plus grand diviseur commun)" },
    { question: "Convertir 2,5 en fraction ?", answer: "5/2 ou 2 et demi" },
    { question: "3/4 + 1/4 = ?", answer: "4/4 = 1" },
    { question: "3/4 × 2 = ?", answer: "6/4 = 3/2 = 1,5" },
    { question: "Aire d'un carré de côté 6 cm ?", answer: "36 cm²" },
    { question: "Volume d'un cube de côté 3 cm ?", answer: "27 cm³" },
    { question: "45% de 200 = ?", answer: "90" },
    { question: "Arrondir 3,678 au centième ?", answer: "3,68" },
    { question: "Qu'est-ce que la symétrie axiale ?", answer: "Transformation géométrique qui reflète une figure par rapport à un axe (comme un miroir)" },
    { question: "Périmètre d'un cercle de rayon 5 cm (π≈3,14) ?", answer: "2 × 3,14 × 5 = 31,4 cm" },
    { question: "Convertir 3h 45min en minutes ?", answer: "3×60 + 45 = 225 minutes" },
  ]},
  // ── Sciences — Physique-Chimie Terminale ──────────────────────────────────────
  { subject: "Physique", label: "Physique-Chimie — Terminale (Spécialité)", items: [
    { question: "Deuxième loi de Newton ?", answer: "F = ma (somme des forces = masse × accélération)" },
    { question: "Travail d'une force : formule ?", answer: "W = F × d × cos(θ) (en joules)" },
    { question: "Conservation de l'énergie mécanique ?", answer: "Ec + Ep = constante (sans frottements)" },
    { question: "Energie cinétique Ec = ?", answer: "Ec = (1/2)mv²" },
    { question: "Energie potentielle de pesanteur Ep = ?", answer: "Ep = mgh" },
    { question: "Loi de gravitation universelle (Newton) ?", answer: "F = G × m1 × m2 / r² (G = 6,67 × 10⁻¹¹ N·m²·kg⁻²)" },
    { question: "Période d'un pendule simple (approximation petits angles) ?", answer: "T = 2π√(l/g)" },
    { question: "Vitesse d'un satellite en orbite circulaire ?", answer: "v = √(GM/r)" },
    { question: "Première loi de Kepler ?", answer: "Les planètes décrivent des ellipses dont le Soleil occupe un foyer" },
    { question: "Troisième loi de Kepler ?", answer: "T²/a³ = constante pour toutes les planètes d'un même astre" },
    { question: "Enthalpie de réaction ΔH < 0 : réaction ?", answer: "Exothermique (libère de la chaleur)" },
    { question: "Enthalpie de réaction ΔH > 0 : réaction ?", answer: "Endothermique (absorbe de la chaleur)" },
    { question: "Constante d'équilibre K : si K >> 1 ?", answer: "Équilibre fortement déplacé vers les produits" },
    { question: "Taux d'avancement final τ : formule ?", answer: "τ = x_f / x_max (entre 0 et 1)" },
    { question: "pH d'une solution : définition ?", answer: "pH = -log[H₃O⁺] (mesure acidité : pH<7 acide, pH=7 neutre, pH>7 basique)" },
  ]},
] as SampleSet[];

// ─── Icônes par matière ───────────────────────────────────────────────────────
const SUBJECT_META: Record<string, { icon: React.ElementType; color: string }> = {
  Histoire:    { icon: ScrollText,    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  Maths:       { icon: Calculator,    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  Français:    { icon: BookOpen,      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  SVT:         { icon: FlaskConical,  color: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400' },
  Physique:    { icon: FlaskConical,  color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400' },
  Chimie:      { icon: FlaskConical,  color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400' },
  Géographie:  { icon: Globe2,        color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400' },
  Philosophie: { icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
  Anglais:          { icon: Languages,     color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  'NSI/Informatique': { icon: GraduationCap, color: 'text-slate-600 bg-slate-50 dark:bg-slate-950/40 dark:text-slate-400' },
  'SES/Économie':     { icon: ScrollText,    color: 'text-lime-600 bg-lime-50 dark:bg-lime-950/40 dark:text-lime-400' },
};

const SUBJECTS = [...new Set(SAMPLE_SETS.map(s => s.subject))];

// ─── Composant : sélecteur de banques (Supabase + fallback local) ────────────
interface DbQuestion { question: string; reponse: string; matiere: string; niveau: string; set_label: string | null; }

const BankSelector: React.FC<{
  onAddMany: (pairs: { question: string; answer: string }[]) => void;
}> = ({ onAddMany }) => {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [dbSets, setDbSets] = useState<{ label: string; subject: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSet, setLoadingSet] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Charger les matières disponibles depuis Supabase au montage
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('edu_quiz_questions')
          .select('matiere, set_label')
          .limit(5000);
        if (data && data.length > 0) {
          const subjSet = new Set<string>();
          const setMap = new Map<string, { subject: string; count: number }>();
          data.forEach((r: { matiere: string; set_label: string | null }) => {
            subjSet.add(r.matiere);
            const key = `${r.matiere}||${r.set_label ?? r.matiere}`;
            if (!setMap.has(key)) setMap.set(key, { subject: r.matiere, count: 0 });
            setMap.get(key)!.count++;
          });
          setDbSubjects([...subjSet].sort());
          setDbSets([...setMap.entries()].map(([k, v]) => ({
            label: k.split('||')[1],
            subject: v.subject,
            count: v.count,
          })));
        }
      } catch { /* silently fallback to local */ }
    })();
  }, []);

  const allSubjects = dbSubjects.length > 0 ? dbSubjects : SUBJECTS;
  const setsForSubject = activeSubject
    ? (dbSets.filter(s => s.subject === activeSubject).length > 0
        ? dbSets.filter(s => s.subject === activeSubject)
        : SAMPLE_SETS.filter(s => s.subject === activeSubject).map(s => ({
            label: s.label, subject: s.subject, count: s.items.length,
          })))
    : [];

  const handleLoad = async (label: string, subject: string) => {
    // Essayer Supabase en premier
    setLoadingSet(label);
    try {
      const { data, error } = await supabase
        .from('edu_quiz_questions')
        .select('question, reponse, set_label')
        .eq('matiere', subject)
        .eq('set_label', label)
        .limit(200);
      if (!error && data && data.length > 0) {
        onAddMany(data.map((r: { question: string; reponse: string; set_label: string | null }) => ({ question: r.question, answer: r.reponse })));
        toast.success(`${data.length} questions « ${label} » ajoutées !`);
        setLoadingSet(null);
        return;
      }
    } catch { /* fallback */ }
    // Fallback local
    const local = SAMPLE_SETS.find(s => s.label === label);
    if (local) {
      onAddMany(local.items.map(it => ({ question: it.question, answer: it.answer })));
      toast.success(`${local.items.length} questions « ${label} » ajoutées !`);
    }
    setLoadingSet(null);
  };

  const _ = loading; // suppress unused warning

  return (
    <div className="space-y-3">
      {/* Onglets matières */}
      <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
        <div className="flex gap-1.5 min-w-max">
          {allSubjects.map(subj => {
            const meta = SUBJECT_META[subj] ?? { icon: BookOpen, color: 'text-muted-foreground bg-muted' };
            const Icon = meta.icon;
            const active = activeSubject === subj;
            return (
              <button
                key={subj}
                type="button"
                onClick={() => setActiveSubject(active ? null : subj)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all min-h-[36px] whitespace-nowrap ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banques pour la matière sélectionnée */}
      {activeSubject && setsForSubject.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {setsForSubject.map(set => {
            const meta = SUBJECT_META[set.subject] ?? { icon: BookOpen, color: 'text-muted-foreground bg-muted' };
            const Icon = meta.icon;
            const isLoading = loadingSet === set.label;
            return (
              <button
                key={set.label}
                type="button"
                disabled={isLoading}
                onClick={() => handleLoad(set.label, set.subject)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/40 transition-all text-left group disabled:opacity-60"
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-pretty group-hover:text-primary transition-colors">{set.label}</p>
                  <p className="text-xs text-muted-foreground">{isLoading ? 'Chargement…' : `${set.count} questions`}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      )}

      {!activeSubject && (
        <p className="text-xs text-muted-foreground text-center py-1">
          Sélectionne une matière pour charger des questions du programme officiel
        </p>
      )}
    </div>
  );
};

// ─── Éditeur de quiz ──────────────────────────────────────────────────────────
const QuizEditor: React.FC<{
  items: QA[];
  onAdd: (q: string, a: string) => void;
  onRemove: (id: string) => void;
  onStart: () => void;
  onAddMany: (pairs: { question: string; answer: string }[]) => void;
}> = ({ items, onAdd, onRemove, onStart, onAddMany }) => {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulk, setBulk] = useState('');
  const [tab, setTab] = useState<'bank' | 'manual'>('bank');

  const handleAdd = () => {
    if (!q.trim() || !a.trim()) { toast.error('Remplis la question et la réponse.'); return; }
    onAdd(q.trim(), a.trim());
    setQ(''); setA('');
    toast.success('Question ajoutée !');
  };

  const handleBulkImport = () => {
    const lines = bulk.split('\n').filter(l => l.includes('|'));
    let count = 0;
    lines.forEach(line => {
      const [question, answer] = line.split('|').map(s => s.trim());
      if (question && answer) { onAdd(question, answer); count++; }
    });
    if (count > 0) {
      toast.success(`${count} question${count > 1 ? 's' : ''} importée${count > 1 ? 's' : ''} !`);
      setBulk(''); setBulkMode(false);
    } else {
      toast.error('Format invalide. Utilisez : Question | Réponse');
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Onglets ajout ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-full">
        {([
          { key: 'bank', label: 'Banques de questions', icon: BookOpen },
          { key: 'manual', label: 'Créer manuellement', icon: Plus },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
              tab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{key === 'bank' ? 'Banques' : 'Manuel'}</span>
          </button>
        ))}
      </div>

      {/* ── Contenu onglet ────────────────────────────────────────────────────── */}
      {tab === 'bank' && <BankSelector onAddMany={onAddMany} />}

      {tab === 'manual' && (
        <div className="space-y-4">
          {/* Import en masse */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-border" />
            <button
              type="button"
              onClick={() => setBulkMode(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary whitespace-nowrap"
            >
              <Pencil className="w-3 h-3" /> Import en masse
            </button>
            <div className="flex-1 border-t border-border" />
          </div>

          {bulkMode ? (
            <Card className="border-border shadow-none">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Une ligne par Q&R, séparés par <code className="bg-secondary px-1 rounded font-mono">|</code>
                  <br />Ex : <em className="text-foreground">Capitale de la France | Paris</em>
                </p>
                <Textarea
                  value={bulk}
                  onChange={e => setBulk(e.target.value)}
                  placeholder={"Quelle est la formule de l'eau ? | H₂O\nQui a écrit Les Misérables ? | Victor Hugo"}
                  className="min-h-28 text-sm px-3"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleBulkImport} className="h-9 text-xs">Importer</Button>
                  <Button size="sm" variant="outline" onClick={() => setBulkMode(false)} className="h-9 text-xs">Annuler</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-none">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label htmlFor="quiz-q" className="text-xs font-medium text-muted-foreground mb-1.5 block">Question</Label>
                  <Input
                    id="quiz-q"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Ex : Quelle est la capitale de l'Espagne ?"
                    className="h-10 text-sm"
                    onKeyDown={e => e.key === 'Enter' && a && handleAdd()}
                  />
                </div>
                <div>
                  <Label htmlFor="quiz-a" className="text-xs font-medium text-muted-foreground mb-1.5 block">Réponse</Label>
                  <Input
                    id="quiz-a"
                    value={a}
                    onChange={e => setA(e.target.value)}
                    placeholder="Ex : Madrid"
                    className="h-10 text-sm"
                    onKeyDown={e => e.key === 'Enter' && q && handleAdd()}
                  />
                </div>
                <Button size="sm" onClick={handleAdd} disabled={!q.trim() || !a.trim()} className="w-full h-9 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter cette question
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Liste des Q&R ─────────────────────────────────────────────────────── */}
      {items.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{items.length} question{items.length > 1 ? 's' : ''}</span>
              <Badge variant="secondary" className="text-xs">{items.length >= 5 ? '✅ Prêt' : `encore ${5 - items.length} pour commencer`}</Badge>
            </div>
            <Button size="sm" onClick={onStart} disabled={items.length < 1} className="h-9 text-xs gap-1.5">
              <Play className="w-3.5 h-3.5" /> Lancer le quiz
            </Button>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1" role="list" aria-label="Liste des questions">
            {items.map((item, i) => (
              <div key={item.id}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
                role="listitem"
              >
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5 w-5 font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{item.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.answer}</p>
                </div>
                <button type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0 p-1.5 min-w-[36px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
                  aria-label={`Supprimer : ${item.question}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground font-medium">Aucune question pour l'instant</p>
          <p className="text-xs text-muted-foreground mt-1">Charge une banque ou crée tes propres Q&R</p>
        </div>
      )}
    </div>
  );
};

// ─── Mode quiz actif ──────────────────────────────────────────────────────────
interface QuizResult { id: string; correct: boolean; userAnswer: string; }

const QuizPlay: React.FC<{
  items: QA[];
  onEnd: (results: QuizResult[]) => void;
}> = ({ items, onEnd }) => {
  const [shuffled] = useState(() => [...items].sort(() => Math.random() - 0.5));
  const [current, setCurrent]   = useState(0);
  const [answer, setAnswer]     = useState('');
  const [revealed, setRevealed] = useState(false);
  const [results, setResults]   = useState<QuizResult[]>([]);

  const item     = shuffled[current];
  const progress = ((current) / shuffled.length) * 100;
  const correct  = results.filter(r => r.correct).length;

  const check = () => { if (!revealed) setRevealed(true); };

  const next = (isCorrect: boolean) => {
    const newResults = [...results, { id: item.id, correct: isCorrect, userAnswer: answer }];
    if (current + 1 >= shuffled.length) {
      onEnd(newResults);
    } else {
      setResults(newResults);
      setCurrent(c => c + 1);
      setAnswer('');
      setRevealed(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête progression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Question {current + 1} / {shuffled.length}</span>
          <div className="flex items-center gap-3">
            <span className="text-success font-medium">{correct} ✓</span>
            <span className="text-destructive font-medium">{results.length - correct} ✗</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Carte question */}
      <Card className="shadow-card border-primary/20 bg-primary/5 min-h-[110px]">
        <CardContent className="p-5 flex items-center">
          <p className="text-base md:text-lg font-semibold text-foreground text-pretty leading-relaxed">{item.question}</p>
        </CardContent>
      </Card>

      {/* Zone réponse */}
      {!revealed ? (
        <div className="space-y-3">
          <Input
            aria-label="Votre réponse"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Votre réponse..."
            className="h-11 text-sm"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && check()}
          />
          <Button onClick={check} className="w-full h-11 font-semibold gap-2">
            <ChevronRight className="w-4 h-4" /> Voir la réponse
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Card className="border-success/30 bg-success/5 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-success mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bonne réponse
              </p>
              <p className="text-sm text-foreground font-medium text-pretty">{item.answer}</p>
            </CardContent>
          </Card>
          {answer.trim() && (
            <div className="px-1">
              <p className="text-xs text-muted-foreground">Ta réponse : <span className="text-foreground italic">{answer}</span></p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => next(false)} variant="outline" className="h-11 border-destructive/40 text-destructive hover:bg-destructive/10 gap-2">
              <XCircle className="w-4 h-4" /> Je ne savais pas
            </Button>
            <Button onClick={() => next(true)} className="h-11 bg-success text-success-foreground gap-2">
              <CheckCircle2 className="w-4 h-4" /> Je savais !
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Résultats ────────────────────────────────────────────────────────────────
const QuizResults: React.FC<{
  items: QA[];
  results: QuizResult[];
  onRestart: () => void;
  onEdit: () => void;
}> = ({ items, results, onRestart, onEdit }) => {
  const correct = results.filter(r => r.correct).length;
  const pct     = Math.round((correct / results.length) * 100);
  const [showAll, setShowAll] = useState(false);
  const failed = results.filter(r => !r.correct);

  const emoji  = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : pct >= 40 ? '💪' : '📚';
  const msg    = pct >= 80 ? 'Excellent travail !' : pct >= 60 ? 'Bon résultat, continue !' : pct >= 40 ? 'Pas mal, encore un effort !' : 'Revois le cours et recommence !';
  const color  = pct >= 80 ? 'text-success' : pct >= 60 ? 'text-amber-500' : 'text-destructive';

  const displayedResults = showAll ? results : results.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Score principal */}
      <Card className="shadow-card overflow-hidden">
        <div className="bg-primary/5 border-b border-border p-5 text-center space-y-1">
          <span className="text-5xl block mb-2" aria-hidden="true">{emoji}</span>
          <p className={`text-3xl font-bold ${color}`}>{pct}%</p>
          <p className="text-sm text-muted-foreground">{correct}/{results.length} bonnes réponses</p>
          <Progress value={pct} className="h-3 mt-3" />
          <p className="text-sm text-foreground font-medium pt-1">{msg}</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { label: 'Correctes', value: correct, cls: 'text-success' },
            { label: 'Manquées', value: results.length - correct, cls: 'text-destructive' },
            { label: 'Score', value: `${pct}%`, cls: color },
          ].map(({ label, value, cls }) => (
            <div key={label} className="p-3 text-center">
              <p className={`text-lg font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Questions manquées en premier */}
      {failed.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">À revoir ({failed.length})</p>
          <div className="space-y-1.5">
            {failed.map(r => {
              const item = items.find(it => it.id === r.id);
              if (!item) return null;
              return (
                <div key={r.id} className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-sm">
                  <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-pretty">{item.question}</p>
                    <p className="text-xs text-success mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" /> {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toutes les réponses */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Toutes les réponses</p>
          {results.length > 5 && (
            <button type="button" onClick={() => setShowAll(v => !v)} className="text-xs text-primary hover:underline">
              {showAll ? 'Réduire' : `Voir tout (${results.length})`}
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {displayedResults.map(r => {
            const item = items.find(it => it.id === r.id);
            if (!item) return null;
            return (
              <div key={r.id} className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${r.correct ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                {r.correct
                  ? <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" aria-label="Correct" />
                  : <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-label="Incorrect" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-pretty">{item.question}</p>
                  {!r.correct && <p className="text-xs text-success mt-0.5">{item.answer}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button onClick={onRestart} className="h-10 gap-2 text-sm">
          <RotateCcw className="w-4 h-4" /> Recommencer
        </Button>
        <Button onClick={onEdit} variant="outline" className="h-10 gap-2 text-sm">
          <Pencil className="w-4 h-4" /> Modifier les Q&R
        </Button>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export default function QuizPage() {
  const { addActivity, addXp } = useApp();
  const [items, setItems]   = useState<QA[]>([]);
  const [mode, setMode]     = useState<'edit' | 'play' | 'results'>('edit');
  const [results, setResults] = useState<QuizResult[]>([]);

  const add     = useCallback((q: string, a: string) =>
    setItems(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, question: q, answer: a }]), []);
  const addMany = useCallback((pairs: { question: string; answer: string }[]) =>
    setItems(prev => [...prev, ...pairs.map(p => ({ id: `${Date.now()}-${Math.random()}`, question: p.question, answer: p.answer }))]), []);
  const remove  = useCallback((id: string) =>
    setItems(prev => prev.filter(it => it.id !== id)), []);

  const start = () => {
    if (items.length < 1) { toast.error('Ajoutez au moins une question !'); return; }
    setMode('play');
  };

  const end = (r: QuizResult[]) => {
    setResults(r);
    setMode('results');
    const correct = r.filter(x => x.correct).length;
    const pct = Math.round((correct / r.length) * 100);
    addXp(Math.round(pct / 10) * 2 + 5);
    addActivity(`Quiz terminé : ${correct}/${r.length} correctes (${pct}%)`);
  };

  const restart = () => { setMode('play'); setResults([]); };
  const edit    = () => { setMode('edit'); setResults([]); };

  const modeLabel = { edit: 'Mes questions', play: 'Quiz en cours', results: 'Résultats' }[mode];
  const modeIcon  = { edit: Pencil, play: Play, results: Trophy }[mode];
  const ModeIcon  = modeIcon;

  return (
    <div className="min-w-0 space-y-4 w-full max-w-5xl mx-auto px-4 md:px-5 py-4 md:py-6">
      <h1 className="sr-only">Quiz interactif gratuit</h1>
      <SEO
        title="Quiz Interactif Gratuit — Révisez avec vos propres questions | Apprenix"
        description="Quiz personnalisés avec score en temps réel pour toutes les matières. Idéal pour le Bac, le Brevet et les évaluations. 100% gratuit."
        canonical="/quiz"
        keywords="quiz interactif scolaire gratuit, créer quiz révision, questions réponses cours, quiz bac 2026, quiz brevet 2026, auto-évaluation scolaire"
        dateModified="2026-06-18"
      />
      <PageHero
        variant="tool"
        icon={HelpCircle}
        badge={<>🎯 Quiz Interactif</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Quiz Interactif — Testez vos connaissances"
        subtitle="3 064 questions du programme officiel (CP → Bac+5) · Score en temps réel · Chargez une banque ou créez vos propres questions et lancez un quiz chronométré."
        stats={[
          { value: '3 064', label: 'questions officielles' },
          { value: '100%',  label: 'gratuit' },
          { value: 'CP→M2', label: 'tous niveaux' },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-card">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ModeIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                {modeLabel}
                {items.length > 0 && mode === 'edit' && (
                  <Badge variant="outline" className="text-xs font-normal ml-1">{items.length}</Badge>
                )}
              </CardTitle>
              {mode !== 'edit' && (
                <button type="button" onClick={edit}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                  ← Retour édition
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            {mode === 'edit'    && <QuizEditor   items={items} onAdd={add} onRemove={remove} onStart={start} onAddMany={addMany} />}
            {mode === 'play'    && <QuizPlay     items={items} onEnd={end} />}
            {mode === 'results' && <QuizResults  items={items} results={results} onRestart={restart} onEdit={edit} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
