import {
  AlertCircle, BarChart3, BookOpen,
  Calculator, CheckCircle, ChevronLeft,
  ChevronRight, Clock, CreditCard, Download,
  Eye, FlaskConical, Globe2, GraduationCap,
  Languages, Layers, Pencil, Plus,
  RotateCcw, ScrollText, Trash2,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ENBadge from '@/components/ui/ENBadge';
import ExportButton from '@/components/ui/ExportButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { getSubjectsForLevel } from '@/lib/levelUtils';
import type { Subject } from '@/types/types';

type View = 'list' | 'study' | 'manage';

// ─── Bibliothèque de packs de révision (programme français officiel) ───────────
interface FlashPack { name: string; subject: Subject; level: string; cards: { q: string; a: string }[] }

const FLASH_PACKS = [
  {
    name: 'Maths — Dérivées & Intégrales', subject: 'Maths' as Subject, level: 'Terminale',
    cards: [
      { q: "Dérivée de f(x) = xⁿ ?", a: "f'(x) = n·xⁿ⁻¹" },
      { q: "Dérivée de f(x) = eˣ ?", a: "f'(x) = eˣ" },
      { q: "Dérivée de f(x) = ln(x) ?", a: "f'(x) = 1/x" },
      { q: "Dérivée de f(x) = sin(x) ?", a: "f'(x) = cos(x)" },
      { q: "Dérivée de f(x) = cos(x) ?", a: "f'(x) = −sin(x)" },
      { q: "Primitive de f(x) = xⁿ (n ≠ −1) ?", a: "F(x) = xⁿ⁺¹/(n+1) + C" },
      { q: "Primitive de f(x) = eˣ ?", a: "F(x) = eˣ + C" },
      { q: "Primitive de f(x) = 1/x ?", a: "F(x) = ln|x| + C" },
      { q: "Formule de la dérivée d'un produit u·v ?", a: "(uv)' = u'v + uv\'" },
      { q: "Formule de la dérivée d'un quotient u/v ?", a: "(u/v)' = (u'v − uv') / v²" },
      { q: "Théorème de Rolle : condition ?", a: "Si f est dérivable sur [a,b], f(a)=f(b), alors ∃c∈]a,b[ tel que f'(c)=0" },
      { q: "Interprétation géométrique de ∫ₐᵇ f(x)dx ?", a: "Aire algébrique entre la courbe et l'axe des abscisses entre a et b" },
    ],
  },
  {
    name: 'Maths — Probabilités & Statistiques', subject: 'Maths' as Subject, level: 'Lycée',
    cards: [
      { q: "P(A ∪ B) = ?", a: "P(A) + P(B) − P(A ∩ B)" },
      { q: "P(A ∩ B) si A et B indépendants ?", a: "P(A) × P(B)" },
      { q: "Probabilité conditionnelle P(A|B) = ?", a: "P(A ∩ B) / P(B)" },
      { q: "Espérance d'une variable aléatoire X ?", a: "E(X) = Σ xᵢ · P(X = xᵢ)" },
      { q: "Variance V(X) = ?", a: "E(X²) − [E(X)]²" },
      { q: "Loi binomiale B(n,p) : P(X=k) = ?", a: "C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ" },
      { q: "Espérance de la loi binomiale B(n,p) ?", a: "E(X) = n·p" },
      { q: "Écart-type de la loi binomiale B(n,p) ?", a: "σ = √(n·p·(1−p))" },
      { q: "Loi normale centrée réduite N(0,1) : moyenne et écart-type ?", a: "μ = 0, σ = 1" },
      { q: "Intervalle de fluctuation au seuil 95% ?", a: "[p − 1/√n ; p + 1/√n]" },
    ],
  },
  {
    name: 'Maths — Géométrie & Trigonométrie', subject: 'Maths' as Subject, level: 'Lycée',
    cards: [
      { q: "sin²(x) + cos²(x) = ?", a: "1 (identité fondamentale)" },
      { q: "tan(x) = ?", a: "sin(x) / cos(x)" },
      { q: "cos(a+b) = ?", a: "cos(a)cos(b) − sin(a)sin(b)" },
      { q: "sin(a+b) = ?", a: "sin(a)cos(b) + cos(a)sin(b)" },
      { q: "Formule d'Euler : eⁱˣ = ?", a: "cos(x) + i·sin(x)" },
      { q: "Valeur de sin(30°) = sin(π/6) ?", a: "1/2" },
      { q: "Valeur de cos(60°) = cos(π/3) ?", a: "1/2" },
      { q: "Valeur de tan(45°) = tan(π/4) ?", a: "1" },
      { q: "Théorème de Pythagore ?", a: "Dans un triangle rectangle : a² + b² = c² (c = hypoténuse)" },
      { q: "Formule du cosinus (Al-Kashi) ?", a: "c² = a² + b² − 2ab·cos(C)" },
    ],
  },
  {
    name: 'Physique-Chimie — Mécanique', subject: 'Physique-Chimie' as Subject, level: 'Terminale',
    cards: [
      { q: "Deuxième loi de Newton ?", a: "ΣF⃗ = m·a⃗ (somme des forces = masse × accélération)" },
      { q: "Formule de l'énergie cinétique ?", a: "Ec = ½·m·v²" },
      { q: "Formule de l'énergie potentielle de pesanteur ?", a: "Ep = m·g·h" },
      { q: "Valeur de g (accélération gravitationnelle) ?", a: "g ≈ 9,81 m·s⁻² (ou 10 m·s⁻² en approximation)" },
      { q: "Formule de la vitesse d'une MRUA ?", a: "v = v₀ + a·t" },
      { q: "Formule de la position en MRUA ?", a: "x = x₀ + v₀·t + ½·a·t²" },
      { q: "Principe de conservation de l'énergie mécanique (sans frottement) ?", a: "Ec + Ep = constante" },
      { q: "Loi de la gravitation universelle (Newton) ?", a: "F = G·m₁·m₂/r² avec G = 6,67×10⁻¹¹ N·m²·kg⁻²" },
      { q: "Quantité de mouvement p = ?", a: "p = m·v⃗" },
      { q: "Travail d'une force constante W = ?", a: "W = F·d·cos(θ)" },
    ],
  },
  {
    name: 'Physique-Chimie — Électricité', subject: 'Physique-Chimie' as Subject, level: 'Lycée',
    cards: [
      { q: "Loi d'Ohm ?", a: "U = R·I (tension = résistance × intensité)" },
      { q: "Puissance électrique P = ?", a: "P = U·I = R·I² = U²/R" },
      { q: "Energie électrique E = ?", a: "E = P·t (en joules si t en secondes)" },
      { q: "Résistances en série : Req = ?", a: "Req = R1 + R2 + ... + Rn" },
      { q: "Résistances en parallèle : 1/Req = ?", a: "1/Req = 1/R1 + 1/R2 + ... + 1/Rn" },
      { q: "Loi des nœuds (Kirchhoff) ?", a: "La somme des courants entrants = somme des courants sortants" },
      { q: "Loi des mailles (Kirchhoff) ?", a: "La somme algébrique des tensions dans une maille = 0" },
      { q: "Charge d'un condensateur : Q = ?", a: "Q = C·U (charge = capacité × tension)" },
      { q: "Énergie stockée dans un condensateur ?", a: "Ec = ½·C·U²" },
    ],
  },
  {
    name: 'SVT — Génétique & ADN', subject: 'SVT' as Subject, level: 'Terminale',
    cards: [
      { q: "Qu'est-ce que l\'ADN ?", a: "Acide DésoxyriboNucléique — molécule en double hélice porteuse de l\'information génétique" },
      { q: "Les 4 bases azotées de l'ADN ?", a: "Adénine (A), Thymine (T), Guanine (G), Cytosine (C)" },
      { q: "Règle de complémentarité des bases ?", a: "A s'apparie avec T ; G s\'apparie avec C" },
      { q: "Définition d'un gène ?", a: "Séquence d\'ADN codant pour une protéine ou un ARN fonctionnel" },
      { q: "Définition d'un allèle ?", a: "Forme alternative d\'un gène occupant le même locus sur des chromosomes homologues" },
      { q: "Qu'est-ce que la mitose ?", a: "Division cellulaire produisant 2 cellules filles identiques à la cellule mère (même nombre de chromosomes)" },
      { q: "Qu'est-ce que la méiose ?", a: "Division cellulaire produisant 4 gamètes haploïdes (n chromosomes), avec brassage génétique" },
      { q: "Définition du phénotype ?", a: "Ensemble des caractères observables d'un individu (morphologiques, biochimiques)" },
      { q: "Définition du génotype ?", a: "Constitution génétique d'un individu — ensemble de ses allèles" },
      { q: "Qu'est-ce qu\'une mutation ?", a: "Modification permanente de la séquence d\'ADN (substitution, délétion, insertion de nucléotides)" },
      { q: "Transcription de l'ADN : définition ?", a: "Synthèse d\'un ARNm à partir d\'un brin d\'ADN matrice dans le noyau" },
      { q: "Traduction : définition ?", a: "Synthèse d'une protéine à partir d\'un ARNm par les ribosomes dans le cytoplasme" },
    ],
  },
  {
    name: 'SVT — Système immunitaire', subject: 'SVT' as Subject, level: 'Terminale',
    cards: [
      { q: "Immunité innée vs adaptative ?", a: "Innée : rapide, non spécifique. Adaptative : lente, spécifique, avec mémoire immunitaire" },
      { q: "Qu'est-ce qu\'un antigène ?", a: "Molécule étrangère reconnue par le système immunitaire et déclenchant une réponse immunitaire" },
      { q: "Qu'est-ce qu\'un anticorps ?", a: "Protéine (immunoglobuline) produite par les plasmocytes, spécifique d\'un antigène" },
      { q: "Rôle des lymphocytes T cytotoxiques ?", a: "Détruire les cellules infectées ou tumorales présentant l'antigène (immunité cellulaire)" },
      { q: "Rôle des lymphocytes B ?", a: "Se différencient en plasmocytes pour produire des anticorps (immunité humorale)" },
      { q: "Qu'est-ce que la mémoire immunitaire ?", a: "Conservation de lymphocytes mémoire après un premier contact, permettant une réponse plus rapide lors d\'une réinfection" },
      { q: "Définition d'un vaccin ?", a: "Administration d\'un antigène (atténué ou inactivé) pour induire une réponse immunitaire et une mémoire sans déclencher la maladie" },
      { q: "Qu'est-ce que le CMH ?", a: "Complexe Majeur d\'Histocompatibilité — protéines de surface présentant les antigènes aux lymphocytes T" },
    ],
  },
  {
    name: 'Histoire — La Seconde Guerre mondiale', subject: 'Histoire-Géographie' as Subject, level: 'Lycée',
    cards: [
      { q: "Date du début de la Seconde Guerre mondiale ?", a: "1er septembre 1939 (invasion de la Pologne par l'Allemagne nazie)" },
      { q: "Date de la capitulation de la France ?", a: "22 juin 1940 (armistice de Compiègne)" },
      { q: "Qu'est-ce que le régime de Vichy ?", a: "Gouvernement collaborationniste français dirigé par le maréchal Pétain (1940-1944)" },
      { q: "Qui dirige la France libre depuis Londres ?", a: "Le général Charles de Gaulle (appel du 18 juin 1940)" },
      { q: "Qu'est-ce que la Solution finale ?", a: "Projet d\'extermination systématique des Juifs d\'Europe par les nazis (Shoah)" },
      { q: "Date du débarquement en Normandie ?", a: "6 juin 1944 (Opération Overlord)" },
      { q: "Date de la capitulation de l'Allemagne nazie ?", a: "8 mai 1945 (fin de la guerre en Europe)" },
      { q: "Dates des bombes atomiques sur le Japon ?", a: "6 août 1945 (Hiroshima) et 9 août 1945 (Nagasaki)" },
      { q: "Création de l'ONU : date et objectif ?", a: "1945 — maintenir la paix internationale et développer la coopération entre nations" },
      { q: "Procès de Nuremberg : objet ?", a: "Jugement des dirigeants nazis pour crimes de guerre et crimes contre l'humanité (1945-1946)" },
    ],
  },
  {
    name: 'Histoire — Révolution française', subject: 'Histoire-Géographie' as Subject, level: 'Collège',
    cards: [
      { q: "Date de la prise de la Bastille ?", a: "14 juillet 1789" },
      { q: "Que symbolise la prise de la Bastille ?", a: "Début de la Révolution française et fin de l'absolutisme royal" },
      { q: "Date de la déclaration des droits de l'homme et du citoyen ?", a: "26 août 1789" },
      { q: "Qui est Louis XVI ?", a: "Roi de France guillotiné le 21 janvier 1793 pendant la Révolution" },
      { q: "Qu'est-ce que la Terreur ?", a: "Période (1793-1794) de répression violente dirigée par Robespierre et le Comité de salut public" },
      { q: "Qui est Robespierre ?", a: "Révolutionnaire jacobin, figure principale de la Terreur, guillotiné en juillet 1794 (Thermidor)" },
      { q: "Devise de la République française ?", a: "Liberté, Égalité, Fraternité" },
      { q: "Quand Bonaparte prend le pouvoir (coup d'État) ?", a: "18-19 brumaire an VIII — 9-10 novembre 1799" },
    ],
  },
  {
    name: 'Français — Figures de style', subject: 'Français' as Subject, level: 'Lycée',
    cards: [
      { q: "Définir la métaphore ?", a: "Comparaison implicite sans outil de comparaison. Ex : 'La vie est un voyage\'" },
      { q: "Définir la comparaison ?", a: "Rapprochement avec outil de comparaison (comme, tel, ainsi que). Ex : 'courageux comme un lion\'" },
      { q: "Définir l'hyperbole ?", a: "Exagération pour renforcer un effet. Ex : \'Je meurs de faim\'" },
      { q: "Définir l'anaphore ?", a: "Répétition d\'un mot ou groupe en début de phrases successives. Ex : \'Je t\'aime pour ta douceur, je t\'aime pour ta force…\'" },
      { q: "Définir l'antithèse ?", a: "Opposition de deux termes ou idées contraires pour créer un contraste. Ex : \'C\'était un ange au visage de démon\'" },
      { q: "Définir la litote ?", a: "Dire moins pour suggérer plus. Ex : 'Ce n\'est pas mal' pour dire 'c\'est très bien\'" },
      { q: "Définir la personnification ?", a: "Attribuer des caractéristiques humaines à un être inanimé ou abstrait" },
      { q: "Définir l'oxymore ?", a: "Association de deux termes contradictoires. Ex : \'obscure clarté', 'silence éloquent\'" },
      { q: "Définir l'allitération ?", a: "Répétition d\'un même son consonantique dans des mots proches. Ex : \'Pour qui sont ces serpents qui sifflent sur vos têtes\'" },
      { q: "Définir l'assonance ?", a: "Répétition d\'un même son vocalique dans des mots proches. Ex : \'Les sanglots longs des violons\'" },
      { q: "Définir l'euphémisme ?", a: "Atténuation d\'une réalité difficile par une expression plus douce. Ex : \'Il nous a quittés' pour 'il est mort\'" },
      { q: "Définir la synecdoque ?", a: "Désigner un tout par une partie (ou l'inverse). Ex : \'les voiles' pour 'les bateaux\'" },
    ],
  },
  {
    name: 'Français — Grammaire & Syntaxe', subject: 'Français' as Subject, level: 'Collège',
    cards: [
      { q: "Les 9 classes grammaticales ?", a: "Nom, article, adjectif, pronom, verbe, adverbe, préposition, conjonction, interjection" },
      { q: "Qu'est-ce qu\'un COD ?", a: "Complément d\'objet direct — répond à \'qui ?' ou 'quoi ?' après un verbe transitif direct, sans préposition" },
      { q: "Qu'est-ce qu\'un COI ?", a: "Complément d\'objet indirect — reliéau verbe par une préposition (à, de…). Ex : \'Je parle DE toi\'" },
      { q: "Différence phrase simple / phrase complexe ?", a: "Simple : une seule proposition. Complexe : plusieurs propositions (juxtaposition, coordination ou subordination)" },
      { q: "Les temps de l'indicatif (7) ?", a: "Présent, imparfait, passé simple, passé composé, futur simple, futur antérieur, plus-que-parfait, conditionnel présent" },
      { q: "Accord du participe passé avec avoir ?", a: "S'accorde avec le COD seulement si le COD est placé AVANT le verbe" },
      { q: "Accord du participe passé avec être ?", a: "S'accorde toujours avec le sujet (en genre et en nombre)" },
      { q: "Qu'est-ce qu\'une proposition subordonnée relative ?", a: "Proposition introduite par un pronom relatif (qui, que, dont…) qui complète un nom antécédent" },
    ],
  },
  {
    name: 'Anglais — Vocabulaire B1', subject: 'Langues' as Subject, level: 'Lycée',
    cards: [
      { q: "to achieve ?", a: "accomplir, réussir, atteindre un objectif" },
      { q: "to overcome ?", a: "surmonter, vaincre (une difficulté)" },
      { q: "despite ?", a: "malgré, en dépit de" },
      { q: "although / even though ?", a: "bien que, même si (conjonction de concession)" },
      { q: "to rely on ?", a: "compter sur, dépendre de" },
      { q: "therefore ?", a: "donc, par conséquent (marqueur de conséquence logique)" },
      { q: "whereas ?", a: "alors que, tandis que (opposition/contraste)" },
      { q: "to deal with ?", a: "faire face à, gérer, s'occuper de" },
      { q: "throughout ?", a: "tout au long de, dans tout" },
      { q: "to raise awareness ?", a: "sensibiliser, faire prendre conscience" },
      { q: "nevertheless ?", a: "néanmoins, cependant, pourtant" },
      { q: "to improve ?", a: "améliorer, progresser" },
    ],
  },
  {
    name: 'Géographie — Capitales mondiales', subject: 'Histoire-Géographie' as Subject, level: 'Collège',
    cards: [
      { q: "Capitale de l'Allemagne ?", a: "Berlin" },
      { q: "Capitale du Brésil ?", a: "Brasília" },
      { q: "Capitale de la Chine ?", a: "Pékin (Beijing)" },
      { q: "Capitale de l'Australie ?", a: "Canberra" },
      { q: "Capitale du Canada ?", a: "Ottawa" },
      { q: "Capitale de l'Inde ?", a: "New Delhi" },
      { q: "Capitale du Japon ?", a: "Tokyo" },
      { q: "Capitale de la Russie ?", a: "Moscou" },
      { q: "Capitale de l'Argentine ?", a: "Buenos Aires" },
      { q: "Capitale de l'Afrique du Sud ?", a: "Pretoria (administrative), Le Cap (législative), Bloemfontein (judiciaire)" },
      { q: "Capitale du Mexique ?", a: "Mexico (Ciudad de México)" },
      { q: "Capitale de l'Égypte ?", a: "Le Caire" },
    ],
  },
  {
    name: 'Philosophie — Auteurs & Concepts', subject: 'Philosophie' as Subject, level: 'Terminale',
    cards: [
      { q: "Cogito de Descartes ?", a: "'Je pense, donc je suis' — l'existence du sujet pensant est la première certitude indubitable" },
      { q: "L'impératif catégorique de Kant ?", a: "\'Agis uniquement selon la maxime qui peut être érigée en loi universelle\'" },
      { q: "Platon — mythe de la caverne ?", a: "Allégorie illustrant que les hommes confondent les apparences avec la réalité. La philosophie mène vers la Vérité (les Idées)" },
      { q: "Aristote — définition de l'homme ?", a: "\'L\'homme est un animal politique' (zoon politikon) — il ne peut se réaliser qu'en société" },
      { q: "Nietzsche — mort de Dieu ?", a: "Proclamation de la fin des valeurs absolues (religieuses, morales). Appel au dépassement de l'homme vers le Surhomme" },
      { q: "Sartre — 'l\'existence précède l\'essence' ?", a: "L'homme n\'a pas de nature fixe : il se définit par ses actes et ses choix (existentialisme)" },
      { q: "Hobbes — état de nature ?", a: "'L\'homme est un loup pour l\'homme' — guerre de tous contre tous, d'où la nécessité du contrat social" },
      { q: "Rousseau — nature de l'homme ?", a: "L\'homme est naturellement bon ; c\'est la société qui le corrompt" },
      { q: "Epicure — définition du plaisir ?", a: "Le souverain bien est l'ataraxie (absence de trouble) et l\'aponie (absence de douleur)" },
      { q: "Marx — matérialisme historique ?", a: "L'histoire est déterminée par les conditions matérielles de production ; la lutte des classes est le moteur de l\'Histoire" },
    ],
  },
  {
    name: 'Chimie — Réactions & Équations', subject: 'Physique-Chimie' as Subject, level: 'Lycée',
    cards: [
      { q: "Loi de conservation de la masse (Lavoisier) ?", a: "'Rien ne se perd, rien ne se crée, tout se transforme' — la masse totale est conservée" },
      { q: "Comment équilibrer une équation chimique ?", a: "Ajuster les coefficients stœchiométriques pour avoir le même nombre d'atomes de chaque élément des deux côtés" },
      { q: "Qu'est-ce qu\'un acide selon Brønsted ?", a: "Espèce chimique capable de donner un proton H⁺" },
      { q: "Qu'est-ce qu\'une base selon Brønsted ?", a: "Espèce chimique capable d\'accepter un proton H⁺" },
      { q: "Formule du pH ?", a: "pH = −log[H₃O⁺]" },
      { q: "Qu'est-ce qu\'une réaction de combustion complète ?", a: "Réaction avec dioxygène (O₂) produisant CO₂ et H₂O uniquement" },
      { q: "Réaction d'oxydoréduction : définition ?", a: "Transfert d\'électrons entre un réducteur (perd des électrons) et un oxydant (gagne des électrons)" },
      { q: "Formule molaire du dioxyde de carbone ?", a: "CO₂ — 1 carbone, 2 oxygènes" },
    ],
  },,

  // ── Maths supplémentaires ───────────────────────────────────────────────────
  { name: 'Maths — Suites & Récurrences', subject: 'Maths' as Subject, level: 'Terminale', cards: [
    { q: 'Suite arithmétique : formule du terme général ?', a: 'uₙ = u₀ + n×r  (r = raison)' },
    { q: 'Suite géométrique : formule du terme général ?', a: 'uₙ = u₀ × qⁿ  (q = raison)' },
    { q: 'Somme des n+1 premiers termes d\'une suite arithmétique ?', a: 'S = (n+1) × (u₀ + uₙ) / 2' },
    { q: 'Somme des n+1 premiers termes d\'une suite géométrique (q≠1) ?', a: 'S = u₀ × (1 − qⁿ⁺¹) / (1 − q)' },
    { q: 'Comment prouver qu\'une suite est arithmétique ?', a: 'Montrer que uₙ₊₁ − uₙ = constante' },
    { q: 'Comment prouver qu\'une suite est géométrique ?', a: 'Montrer que uₙ₊₁ / uₙ = constante (q)' },
    { q: 'Suite croissante si ?', a: 'uₙ₊₁ − uₙ > 0  ou  uₙ₊₁/uₙ > 1 (si termes positifs)' },
    { q: 'Limite d\'une suite géométrique si |q| < 1 ?', a: 'Tend vers 0' },
    { q: 'Limite d\'une suite géométrique si q > 1 ?', a: 'Tend vers +∞' },
    { q: 'Raisonnement par récurrence — 3 étapes ?', a: 'Initialisation → Hypothèse rang n → Hérédité au rang n+1' },
  ]},
  { name: 'Maths — Fonctions de référence', subject: 'Maths' as Subject, level: 'Lycée', cards: [
    { q: 'Dérivée de sin(x) ?', a: 'cos(x)' },
    { q: 'Dérivée de cos(x) ?', a: '−sin(x)' },
    { q: 'Dérivée de eˣ ?', a: 'eˣ' },
    { q: 'Dérivée de ln(x) ?', a: '1/x  (x > 0)' },
    { q: 'Dérivée de xⁿ ?', a: 'n·xⁿ⁻¹' },
    { q: 'Dérivée de √x ?', a: '1 / (2√x)' },
    { q: 'Dérivée de u×v ?', a: "u'·v + u·v'" },
    { q: 'Dérivée de u/v ?', a: "(u'·v − u·v') / v²" },
    { q: 'Intégrale de eˣ ?', a: 'eˣ + C' },
    { q: 'Intégrale de 1/x ?', a: 'ln|x| + C' },
    { q: 'Intégrale de xⁿ (n≠−1) ?', a: 'xⁿ⁺¹ / (n+1) + C' },
    { q: 'Intégrale de cos(x) ?', a: 'sin(x) + C' },
  ]},
  { name: 'Maths — Probabilités avancées', subject: 'Maths' as Subject, level: 'Terminale', cards: [
    { q: 'Formule de probabilité totale ?', a: 'P(B) = P(B|A)·P(A) + P(B|Ā)·P(Ā)' },
    { q: 'Formule de Bayes ?', a: 'P(A|B) = P(B|A)·P(A) / P(B)' },
    { q: 'Espérance d\'une variable X ?', a: 'E(X) = Σ xᵢ · P(X=xᵢ)' },
    { q: 'Variance de X ?', a: 'V(X) = E(X²) − [E(X)]²' },
    { q: 'Écart-type σ ?', a: 'σ = √V(X)' },
    { q: 'Loi binomiale B(n,p) — espérance ?', a: 'E(X) = np' },
    { q: 'Loi binomiale B(n,p) — variance ?', a: 'V(X) = np(1−p)' },
    { q: 'Loi normale centrée réduite N(0,1) — P(−1.96 < Z < 1.96) ?', a: '≈ 0.95 (intervalle de confiance 95%)' },
    { q: 'Événements A et B indépendants si ?', a: 'P(A∩B) = P(A) × P(B)' },
    { q: 'P(A∪B) = ?', a: 'P(A) + P(B) − P(A∩B)' },
  ]},
  { name: 'Maths — Géométrie Collège', subject: 'Maths' as Subject, level: 'Collège', cards: [
    { q: 'Périmètre d\'un carré de côté a ?', a: '4a' },
    { q: 'Aire d\'un carré de côté a ?', a: 'a²' },
    { q: 'Périmètre d\'un cercle de rayon r ?', a: '2πr' },
    { q: 'Aire d\'un cercle de rayon r ?', a: 'πr²' },
    { q: 'Aire d\'un triangle (base × hauteur) ?', a: '(base × hauteur) / 2' },
    { q: 'Volume d\'un cube de côté a ?', a: 'a³' },
    { q: 'Volume d\'une sphère de rayon r ?', a: '(4/3)πr³' },
    { q: 'Théorème de Pythagore ?', a: 'Dans un triangle rectangle : c² = a² + b² (c = hypoténuse)' },
    { q: 'Somme des angles d\'un triangle ?', a: '180°' },
    { q: 'Un quadrilatère a combien de degrés en tout ?', a: '360°' },
    { q: 'Angle inscrit dans un demi-cercle ?', a: '90° (angle droit — théorème de Thalès)' },
  ]},
  // ── Physique-Chimie supplémentaires ─────────────────────────────────────────
  { name: 'Physique — Thermodynamique', subject: 'Physique' as Subject, level: 'Terminale', cards: [
    { q: '1er principe de la thermodynamique ?', a: 'ΔU = W + Q  (énergie interne = travail + chaleur)' },
    { q: '2e principe — entropie ?', a: 'L\'entropie d\'un système isolé ne peut qu\'augmenter (ΔS ≥ 0)' },
    { q: 'Relation chaleur — température ?', a: 'Q = m·c·ΔT  (c = chaleur massique)' },
    { q: 'Chaleur massique de l\'eau ?', a: '4180 J·kg⁻¹·K⁻¹' },
    { q: 'Conversion °C → K ?', a: 'T(K) = T(°C) + 273.15' },
    { q: 'Loi des gaz parfaits ?', a: 'PV = nRT  (R = 8.314 J·mol⁻¹·K⁻¹)' },
    { q: 'Puissance thermique P ?', a: 'P = Q / Δt  (en Watts)' },
  ]},
  { name: 'Physique — Électromagnétisme', subject: 'Physique' as Subject, level: 'Terminale', cards: [
    { q: 'Force de Coulomb entre deux charges ?', a: 'F = k·|q₁·q₂|/r²  (k = 9×10⁹ N·m²·C⁻²)' },
    { q: 'Champ électrique créé par une charge q ?', a: 'E = k·q/r²  (en N/C)' },
    { q: 'Énergie potentielle électrique ?', a: 'Ep = q·V  (q = charge, V = potentiel)' },
    { q: 'Loi de Faraday — force électromotrice induite ?', a: 'e = −dΦ/dt  (Φ = flux magnétique)' },
    { q: 'Flux magnétique Φ ?', a: 'Φ = B·S·cos(θ)  (B = champ, S = surface, θ = angle)' },
    { q: 'Fréquence de résonance d\'un circuit LC ?', a: 'f₀ = 1 / (2π√(LC))' },
    { q: 'Énergie stockée dans un condensateur ?', a: 'E = ½·C·U²' },
    { q: 'Énergie stockée dans une bobine ?', a: 'E = ½·L·I²' },
  ]},
  { name: 'Chimie — Chimie organique', subject: 'Chimie' as Subject, level: 'Terminale', cards: [
    { q: 'Groupe fonctionnel alcool ?', a: '−OH  (hydroxyle)' },
    { q: 'Groupe fonctionnel aldéhyde ?', a: '−CHO  (extrémité de chaîne)' },
    { q: 'Groupe fonctionnel cétone ?', a: 'C=O  (au milieu de chaîne)' },
    { q: 'Groupe fonctionnel acide carboxylique ?', a: '−COOH' },
    { q: 'Groupe fonctionnel ester ?', a: '−COO−' },
    { q: 'Groupe fonctionnel amine ?', a: '−NH₂' },
    { q: 'Réaction d\'estérification ?', a: 'Alcool + Acide carboxylique → Ester + Eau (catalyseur H⁺, équilibre)' },
    { q: 'Réaction de saponification ?', a: 'Ester + Base forte → Alcool + Sel d\'acide carboxylique (irréversible)' },
    { q: 'Formule brute du méthane ?', a: 'CH₄' },
    { q: 'Formule brute de l\'éthanol ?', a: 'C₂H₅OH  ou  C₂H₆O' },
    { q: 'Homologue supérieur d\'un alcane CₙH₂ₙ₊₂ ?', a: 'Ajouter −CH₂− : Cₙ₊₁H₂ₙ₊₄' },
  ]},
  { name: 'Chimie — Acides, bases et pH', subject: 'Chimie' as Subject, level: 'Lycée', cards: [
    { q: 'Définition d\'un acide selon Brønsted ?', a: 'Espèce qui peut donner un proton H⁺' },
    { q: 'Définition d\'une base selon Brønsted ?', a: 'Espèce qui peut accepter un proton H⁺' },
    { q: 'pH d\'une solution neutre à 25°C ?', a: 'pH = 7' },
    { q: 'Formule du pH ?', a: 'pH = −log([H₃O⁺])' },
    { q: 'Produit ionique de l\'eau Ke à 25°C ?', a: 'Ke = [H₃O⁺]·[OH⁻] = 10⁻¹⁴' },
    { q: 'pKe à 25°C ?', a: 'pKe = 14' },
    { q: 'Relation pH + pOH ?', a: 'pH + pOH = 14 (à 25°C)' },
    { q: 'Acide fort vs acide faible ?', a: 'Fort : dissociation totale. Faible : dissociation partielle, caractérisée par Ka.' },
    { q: 'pH d\'un acide fort de concentration Ca ?', a: 'pH = −log(Ca)' },
    { q: 'Indicateur coloré universel : couleur à pH < 3 ?', a: 'Rouge (milieu très acide)' },
  ]},
  // ── SVT supplémentaires ──────────────────────────────────────────────────────
  { name: 'SVT — Corps humain & Santé', subject: 'SVT' as Subject, level: 'Lycée', cards: [
    { q: 'Nombre de chromosomes dans une cellule humaine normale ?', a: '46 (23 paires)' },
    { q: 'Que produit le pancréas pour réguler la glycémie ?', a: 'Insuline (baisse glycémie) et glucagon (hausse glycémie)' },
    { q: 'Valeur normale de la glycémie à jeun ?', a: '0.8 à 1.1 g/L (ou 4.4 à 6.1 mmol/L)' },
    { q: 'Qu\'est-ce que le diabète de type 1 ?', a: 'Destruction auto-immune des cellules β du pancréas → manque d\'insuline' },
    { q: 'Qu\'est-ce que le diabète de type 2 ?', a: 'Résistance des cellules à l\'insuline + insuffisance progressive du pancréas' },
    { q: 'Rôle du rein ?', a: 'Filtration du sang, élimination déchets dans l\'urine, régulation hydrique et ionique' },
    { q: 'Qu\'est-ce qu\'un neurotransmetteur ?', a: 'Molécule libérée par un neurone pour transmettre un signal à un autre neurone ou muscle' },
    { q: 'Exemples de neurotransmetteurs ?', a: 'Dopamine, sérotonine, acétylcholine, GABA, glutamate, noradrénaline' },
    { q: 'Qu\'est-ce que la plasticité synaptique ?', a: 'Modification de l\'efficacité des synapses par l\'expérience → base de l\'apprentissage' },
    { q: 'Phases du cycle cellulaire ?', a: 'Interphase (G1, S, G2) → Mitose (prophase, métaphase, anaphase, télophase) → Cytocinèse' },
  ]},
  { name: 'SVT — Évolution & Écologie', subject: 'SVT' as Subject, level: 'Lycée', cards: [
    { q: 'Définition de la sélection naturelle (Darwin) ?', a: 'Les individus les mieux adaptés à leur environnement survivent et se reproduisent davantage' },
    { q: 'Qu\'est-ce qu\'une mutation ?', a: 'Modification de la séquence d\'ADN — source de variabilité génétique' },
    { q: 'Définition d\'une espèce (critère biologique) ?', a: 'Ensemble d\'individus pouvant se reproduire entre eux et produire des descendants fertiles' },
    { q: 'Qu\'est-ce que la dérive génétique ?', a: 'Variation aléatoire des fréquences alléliques dans une petite population' },
    { q: 'Producteur primaire dans un écosystème ?', a: 'Organismes autotrophes (végétaux, algues, cyanobactéries) qui captent l\'énergie solaire' },
    { q: 'Définition du flux de matière ?', a: 'Transfert de biomasse d\'un niveau trophique au suivant (10% d\'efficacité en moyenne)' },
    { q: 'Qu\'est-ce que la biodiversité ?', a: 'Diversité du vivant : génétique, spécifique (espèces) et écosystémique' },
    { q: 'Principal gaz responsable de l\'effet de serre anthropique ?', a: 'CO₂ (dioxyde de carbone)' },
    { q: 'Qu\'est-ce que la symbiose ?', a: 'Association durable bénéfique pour les deux partenaires (ex : lichens, mycorhizes)' },
    { q: 'Différence parasitisme vs prédation ?', a: 'Parasitisme : exploite son hôte sans le tuer directement. Prédation : tue et consomme.' },
  ]},
  { name: 'SVT — Expression génétique avancée', subject: 'SVT' as Subject, level: 'Terminale', cards: [
    { q: 'Monomères de l\'ADN ?', a: 'Nucléotides (base azotée + désoxyribose + groupement phosphate)' },
    { q: 'Les 4 bases de l\'ADN ?', a: 'Adénine (A), Thymine (T), Guanine (G), Cytosine (C)' },
    { q: 'Règle de complémentarité des bases ?', a: 'A-T et G-C (A apparie avec T, G avec C)' },
    { q: 'Différence ADN / ARN ?', a: 'ARN : simple brin, uracile (U) remplace thymine (T), ribose remplace désoxyribose' },
    { q: 'Transcription ?', a: 'ADN → ARNm (dans le noyau) par l\'ARN polymérase' },
    { q: 'Traduction ?', a: 'ARNm → protéine (dans le cytoplasme, par les ribosomes)' },
    { q: 'Un codon = ?', a: '3 nucléotides de l\'ARNm codant pour un acide aminé' },
    { q: 'Nombre d\'acides aminés naturels ?', a: '20' },
    { q: 'Qu\'est-ce qu\'une mutation ponctuelle ?', a: 'Substitution d\'une base par une autre dans la séquence d\'ADN' },
    { q: 'Épigénétique : définition ?', a: 'Modifications de l\'expression des gènes sans changement de séquence ADN (méthylation, acétylation histones)' },
  ]},
  // ── Histoire-Géographie supplémentaires ─────────────────────────────────────
  { name: 'Histoire — La France au XXe siècle', subject: 'Histoire' as Subject, level: 'Lycée', cards: [
    { q: 'Dates de la 1ère République française ?', a: '1792–1804' },
    { q: 'Date de la Révolution française ?', a: '1789 (prise de la Bastille : 14 juillet 1789)' },
    { q: 'Quand la France entre-t-elle dans la 1ère Guerre mondiale ?', a: '3 août 1914' },
    { q: 'Qu\'est-ce que le Traité de Versailles (1919) ?', a: 'Traité de paix qui met fin à la 1ère GM — impose de lourdes réparations à l\'Allemagne' },
    { q: 'Date de l\'Appel du 18 juin 1940 ?', a: '18 juin 1940 — De Gaulle appelle à continuer la résistance depuis Londres (BBC)' },
    { q: 'Qu\'est-ce que Vichy ?', a: 'Régime collaborationniste de Pétain (1940–1944), siège à Vichy' },
    { q: 'Date de la Libération de Paris ?', a: '25 août 1944' },
    { q: 'Quand commence la Ve République ?', a: '1958 — Constitution approuvée par référendum, De Gaulle président' },
    { q: 'Mai 68 — contexte et portée ?', a: 'Mouvement étudiant et grève générale → bouleversements sociaux, culturels et politiques' },
    { q: 'Date de l\'abolition de la peine de mort en France ?', a: '1981 — sous Robert Badinter, garde des Sceaux' },
    { q: 'Date du droit de vote des femmes en France ?', a: '1944 (ordonnance) — exercé pour la première fois en avril 1945' },
    { q: 'Traité de Rome (1957) ?', a: 'Création de la Communauté Économique Européenne (CEE) par 6 pays fondateurs' },
  ]},
  { name: 'Histoire — Le monde contemporain', subject: 'Histoire' as Subject, level: 'Terminale', cards: [
    { q: 'Date de la création de l\'ONU ?', a: '26 juin 1945 (Charte de San Francisco)' },
    { q: 'Date du plan Marshall ?', a: '1947 — aide économique américaine pour reconstruire l\'Europe de l\'Ouest' },
    { q: 'Date du mur de Berlin (construction / chute) ?', a: 'Construction : 13 août 1961. Chute : 9 novembre 1989' },
    { q: 'Qu\'est-ce que la décolonisation ?', a: 'Processus par lequel les colonies accèdent à l\'indépendance (1945–1975 environ)' },
    { q: 'Date de l\'indépendance de l\'Algérie ?', a: '5 juillet 1962 (accords d\'Évian : 18 mars 1962)' },
    { q: 'Qu\'est-ce que l\'apartheid ?', a: 'Régime de ségrégation raciale en Afrique du Sud (1948–1991)' },
    { q: 'Date de la dissolution de l\'URSS ?', a: '25 décembre 1991' },
    { q: 'Attentats du 11 septembre 2001 ?', a: 'Attaques terroristes d\'Al-Qaïda contre les États-Unis (3000 morts)' },
    { q: 'Qu\'est-ce que la mondialisation ?', a: 'Intensification des échanges économiques, culturels et humains à l\'échelle mondiale' },
    { q: 'COP21 — résultat ?', a: 'Accord de Paris (2015) : limiter le réchauffement à +2°C voire +1.5°C' },
  ]},
  { name: 'Géographie — Mondialisation & Espaces', subject: 'Géographie' as Subject, level: 'Terminale', cards: [
    { q: 'Qu\'est-ce que la métropolisation ?', a: 'Concentration des hommes, activités et richesses dans les grandes métropoles mondiales' },
    { q: 'Les 3 pôles de la Triade ?', a: 'Amérique du Nord, Europe occidentale, Asie orientale (Japon, Chine du Sud-Est)' },
    { q: 'Définition du PIB/habitant ?', a: 'PIB divisé par la population — mesure approximative du niveau de vie' },
    { q: 'Qu\'est-ce qu\'une FMN (firme multinationale) ?', a: 'Entreprise dont les activités de production sont réparties dans plusieurs pays' },
    { q: 'Les pays du Sud global — définition ?', a: 'Pays en développement ou émergents de l\'hémisphère Sud et d\'Asie' },
    { q: 'Qu\'est-ce que le développement durable ?', a: 'Développement répondant aux besoins présents sans compromettre ceux des générations futures (rapport Brundtland, 1987)' },
    { q: 'Exemple de mégalopole mondiale ?', a: 'BosWash (Boston–Washington), Mégalopole japonaise (Tokyo–Osaka)' },
    { q: 'Qu\'est-ce qu\'une zone franche ?', a: 'Espace où les entreprises bénéficient d\'exonérations fiscales et douanières pour attirer les investissements' },
    { q: 'Les ODD (Objectifs de Développement Durable) — combien ?', a: '17 ODD fixés par l\'ONU en 2015 (Agenda 2030)' },
    { q: 'Définition de l\'IDH ?', a: 'Indice de Développement Humain : espérance de vie + éducation + revenu national brut/hab' },
  ]},
  // ── Français supplémentaires ─────────────────────────────────────────────────
  { name: 'Français — Mouvements littéraires', subject: 'Français' as Subject, level: 'Lycée', cards: [
    { q: 'Le classicisme — période et valeurs ?', a: 'XVIIe siècle — raison, équilibre, imitation des Anciens, règles (3 unités au théâtre)' },
    { q: 'Les Lumières — période et idées ?', a: 'XVIIIe siècle — raison, progrès, tolérance, critique des religions et des institutions' },
    { q: 'Le romantisme — période et thèmes ?', a: '1ère moitié XIXe siècle — sentiment, imagination, nature, moi, mélancolie, exotisme' },
    { q: 'Le réalisme / naturalisme — période ?', a: '2e moitié XIXe — représenter la réalité sociale, scientifique. Zola, Flaubert, Balzac' },
    { q: 'Le symbolisme — idée principale ?', a: 'Fin XIXe — évoquer plus que décrire, musicale de la langue. Mallarmé, Verlaine, Rimbaud' },
    { q: 'Le surréalisme — idée principale ?', a: 'XXe siècle — libérer l\'inconscient, écriture automatique. Breton, Aragon, Éluard' },
    { q: 'L\'existentialisme — représentants ?', a: 'Sartre, Beauvoir, Camus — liberté, responsabilité, absurde' },
    { q: 'La règle des 3 unités au théâtre classique ?', a: 'Unité de temps (24h), unité de lieu (1 seul endroit), unité d\'action (1 intrigue principale)' },
    { q: 'Différence tragédie / comédie ?', a: 'Tragédie : héros noble, destin fatal, mort. Comédie : personnages ordinaires, fin heureuse, dénouement heureux' },
    { q: 'Qu\'est-ce qu\'un roman épistolaire ?', a: 'Roman composé de lettres échangées entre personnages (ex : Les Liaisons Dangereuses)' },
  ]},
  { name: 'Français — Grammaire avancée', subject: 'Français' as Subject, level: 'Lycée', cards: [
    { q: 'Proposition subordonnée relative — rôle ?', a: 'Complète un nom ou pronom antécédent — introduite par un pronom relatif (qui, que, dont, où...)' },
    { q: 'Proposition subordonnée conjonctive — rôle ?', a: 'COD, sujet ou CC du verbe principal — introduite par "que", "si", "quand"...' },
    { q: 'Discours direct vs indirect ?', a: 'Direct : paroles entre guillemets, verbe introducteur + virgule/deux-points. Indirect : paroles reformulées après "que", changement de temps et pronoms' },
    { q: 'Mode subjonctif — quand l\'utiliser ?', a: 'Après verbes de volonté, doute, sentiment, crainte + "que" : je veux qu\'il vienne' },
    { q: 'Accord du participe passé avec avoir ?', a: 'S\'accorde avec le COD si celui-ci est placé AVANT le verbe (la lettre que j\'ai écrite)' },
    { q: 'Accord du participe passé avec être ?', a: 'S\'accorde toujours avec le sujet (elle est partie, ils sont arrivés)' },
    { q: 'Complément d\'objet direct (COD) ?', a: 'Répond à "quoi ?" ou "qui ?" après le verbe sans préposition' },
    { q: 'Complément d\'objet indirect (COI) ?', a: 'Répond à "à qui ?", "de qui ?", "à quoi ?" — avec préposition' },
    { q: 'Valeur du présent de l\'indicatif ?', a: 'Vérité générale, action en cours, présent historique, futur proche' },
    { q: 'Différence imparfait / passé simple ?', a: 'Imparfait : durée, description, habitude. Passé simple : action ponctuelle, premier plan du récit' },
  ]},
  { name: 'Français — Oeuvres au programme (Bac)', subject: 'Français' as Subject, level: 'Première', cards: [
    { q: 'Auteur de "Les Fleurs du Mal" ?', a: 'Charles Baudelaire (1857) — symbolisme, spleen, idéal, beauté' },
    { q: 'Auteur de "La Princesse de Clèves" ?', a: 'Madame de La Fayette (1678) — roman psychologique classique' },
    { q: 'Auteur de "Les Essais" ?', a: 'Michel de Montaigne (XVIe siècle) — humanisme, introspection' },
    { q: 'Auteur de "Manon Lescaut" ?', a: 'L\'Abbé Prévost (1731) — roman libertin, amour fatal' },
    { q: 'Auteur de "Juste la fin du monde" ?', a: 'Jean-Luc Lagarce (1990) — théâtre contemporain, retour en famille' },
    { q: 'Auteur de "Olympe de Gouges — Déclaration des droits de la femme" ?', a: 'Olympe de Gouges (1791) — féminisme des Lumières, réponse à la DDHC' },
    { q: 'Mouvements littéraires de Rimbaud ?', a: 'Symbolisme, poésie voyante — "Le dormeur du val", "Illuminations"' },
    { q: 'Définition de la biographie romancée ?', a: 'Roman inspiré d\'une vraie vie, mêlant faits réels et invention littéraire' },
    { q: 'Qu\'est-ce que l\'incipit d\'un roman ?', a: 'Début du roman — présente l\'univers, les personnages, donne le ton' },
    { q: 'Qu\'est-ce que l\'excipit ?', a: 'Fin du roman — clôture l\'histoire, laisse parfois une ouverture ou une ambiguïté' },
  ]},
  // ── Anglais supplémentaires ──────────────────────────────────────────────────
  { name: 'Anglais — Vocabulaire thématique', subject: 'Anglais' as Subject, level: 'Lycée', cards: [
    { q: 'Environment : 5 mots clés ?', a: 'Deforestation, renewable energy, carbon footprint, biodiversity, sustainability' },
    { q: 'Technology : 5 mots clés ?', a: 'Artificial intelligence, algorithm, data breach, digital divide, social media' },
    { q: 'Society : 5 mots clés ?', a: 'Inequality, discrimination, empowerment, grassroots movement, social mobility' },
    { q: 'Politics : 5 mots clés ?', a: 'Democracy, lobbying, veto, referendum, geopolitics' },
    { q: 'Health : 5 mots clés ?', a: 'Epidemic, healthcare, mental health, vaccination, well-being' },
    { q: 'Migration : 5 mots clés ?', a: 'Asylum seeker, refugee, border, integration, displacement' },
    { q: 'Economy : 5 mots clés ?', a: 'Inflation, GDP, recession, stock market, trade deficit' },
    { q: 'Human rights : 5 mots clés ?', a: 'Freedom of speech, civil rights, gender equality, oppression, activism' },
    { q: 'Education : 5 mots clés ?', a: 'Literacy rate, tuition fees, vocational training, curriculum, dropout' },
    { q: 'Science : 5 mots clés ?', a: 'Genome, quantum physics, stem cells, peer review, hypothesis' },
  ]},
  { name: 'Anglais — Grammaire B2', subject: 'Anglais' as Subject, level: 'Terminale', cards: [
    { q: 'Reported speech : "I am tired" → ?', a: 'She said (that) she was tired  (présent → imparfait)' },
    { q: 'Reported speech : "I have finished" → ?', a: 'She said (that) she had finished  (present perfect → past perfect)' },
    { q: 'Reported speech : "I will come" → ?', a: 'She said (that) she would come  (will → would)' },
    { q: 'Passive voice — present continuous ?', a: 'Subject + is/are being + past participle' },
    { q: 'Passive voice — present perfect ?', a: 'Subject + has/have been + past participle' },
    { q: 'Inversion après never, rarely, seldom ?', a: 'Never have I seen such a thing (auxiliaire avant sujet)' },
    { q: 'Cleft sentence : It is... ?', a: '"It was John who broke the window" — emphase sur un élément' },
    { q: 'Gerund vs infinitive after "stop" ?', a: 'Stop + gerund = cesser. Stop + infinitive = s\'arrêter pour faire qqch' },
    { q: 'Would rather + structure ?', a: 'Would rather + base verb (I\'d rather stay home) OU + subject + past tense (I\'d rather you stayed)' },
    { q: 'Wish + past perfect ?', a: 'Regret sur le passé : "I wish I had studied harder"' },
  ]},
  // ── Philosophie supplémentaires ──────────────────────────────────────────────
  { name: 'Philosophie — Thèmes du Bac', subject: 'Philosophie' as Subject, level: 'Terminale', cards: [
    { q: 'Définition philosophique de la liberté ?', a: 'Capacité d\'agir selon sa propre volonté sans contrainte extérieure — débat déterminisme / libre-arbitre' },
    { q: 'Définition philosophique de la conscience ?', a: 'Faculté de se représenter soi-même et le monde — conscience de soi (réflexive) et conscience perceptive' },
    { q: 'Définition philosophique du travail ?', a: 'Activité transformant la nature par l\'effort en vue d\'un but — aliénation (Marx) vs émancipation (Hegel)' },
    { q: 'Définition philosophique de la justice ?', a: 'Ce qui est dû à chacun selon l\'égalité ou le mérite — Rawls : voile d\'ignorance' },
    { q: 'Définition philosophique de la vérité ?', a: 'Adéquation entre le jugement et la réalité (correspondance) — ou cohérence interne, ou utilité (pragmatisme)' },
    { q: 'Définition philosophique de l\'État ?', a: 'Organisation politique souveraine d\'une société — détient le monopole de la violence légitime (Weber)' },
    { q: 'Définition philosophique de la religion ?', a: 'Système de croyances et pratiques reliant l\'humain au sacré ou au divin' },
    { q: 'Définition philosophique de la technique ?', a: 'Ensemble de procédés pratiques pour transformer le monde — Heidegger : danger de la technique moderne' },
    { q: 'Définition philosophique du langage ?', a: 'Système de signes permettant la communication et la pensée — le langage structure-t-il la pensée ?' },
    { q: 'Définition philosophique du bonheur ?', a: 'État durable de satisfaction — épicurisme (ataraxie), stoïcisme (vertu), hédonisme (plaisir), Kant (dignité > bonheur)' },
  ]},
  // ── NSI / Informatique supplémentaires ──────────────────────────────────────
  { name: 'NSI — Python fondamentaux', subject: 'NSI/Informatique' as Subject, level: 'Lycée', cards: [
    { q: 'Affectation d\'une variable en Python ?', a: 'x = 5  (pas de déclaration de type)' },
    { q: 'Types de base en Python ?', a: 'int, float, str, bool, list, dict, tuple, set' },
    { q: 'Créer une liste en Python ?', a: 'ma_liste = [1, 2, 3]  ou  ma_liste = list()' },
    { q: 'Accéder au 1er élément d\'une liste ?', a: 'ma_liste[0]  (indexation à partir de 0)' },
    { q: 'Ajouter un élément en fin de liste ?', a: 'ma_liste.append(valeur)' },
    { q: 'Longueur d\'une liste ?', a: 'len(ma_liste)' },
    { q: 'Boucle for sur une liste ?', a: 'for elem in ma_liste:  (ou for i in range(n):)' },
    { q: 'Définir une fonction en Python ?', a: 'def ma_fonction(parametre):  →  indenter le corps  →  return valeur' },
    { q: 'Créer un dictionnaire Python ?', a: 'd = {"clé": valeur}  ou  d = dict()' },
    { q: 'Accéder à une valeur dans un dictionnaire ?', a: 'd["clé"]  ou  d.get("clé")' },
    { q: 'Compréhension de liste ?', a: '[x**2 for x in range(10) if x % 2 == 0]' },
    { q: 'Qu\'est-ce qu\'une exception Python ?', a: 'Erreur levée à l\'exécution — gérée par try: ... except:' },
  ]},
  { name: 'NSI — Réseaux & Web', subject: 'NSI/Informatique' as Subject, level: 'Terminale', cards: [
    { q: 'Différence HTTP / HTTPS ?', a: 'HTTPS = HTTP + chiffrement TLS/SSL — sécurise les données en transit' },
    { q: 'Qu\'est-ce qu\'une adresse IP ?', a: 'Identifiant numérique unique d\'un appareil sur un réseau — IPv4 : 32 bits (ex: 192.168.1.1)' },
    { q: 'Qu\'est-ce qu\'un DNS ?', a: 'Domain Name System — traduit les noms de domaine en adresses IP' },
    { q: 'Port HTTP standard ?', a: '80 (HTTP) et 443 (HTTPS)' },
    { q: 'Différence TCP / UDP ?', a: 'TCP : fiable, avec accusé de réception. UDP : rapide mais sans garantie de livraison' },
    { q: 'Qu\'est-ce qu\'un routeur ?', a: 'Équipement réseau qui achemine les paquets entre réseaux différents' },
    { q: 'Méthodes HTTP principales ?', a: 'GET (lire), POST (envoyer), PUT (modifier), DELETE (supprimer)' },
    { q: 'Code HTTP 200 / 404 / 500 ?', a: '200 : succès. 404 : page introuvable. 500 : erreur serveur' },
    { q: 'Qu\'est-ce qu\'un cookie ?', a: 'Petit fichier stocké côté client pour mémoriser des infos (session, préférences)' },
    { q: 'Chiffrement symétrique vs asymétrique ?', a: 'Symétrique : même clé pour chiffrer/déchiffrer (rapide). Asymétrique : clé publique/privée (RSA)' },
  ]},
  // ── SES supplémentaires ──────────────────────────────────────────────────────
  { name: 'SES — Sociologie & Politique', subject: 'Économie/SES' as Subject, level: 'Terminale', cards: [
    { q: 'Définition de la socialisation ?', a: 'Processus par lequel l\'individu intègre les normes et valeurs d\'une société — primaire (famille) et secondaire (école, pairs)' },
    { q: 'Capital social selon Bourdieu ?', a: 'Ensemble des relations sociales qu\'un individu peut mobiliser — source d\'avantages' },
    { q: 'Capital culturel selon Bourdieu ?', a: 'Dispositions, savoirs, diplômes transmis par la famille et l\'école' },
    { q: 'Définition du groupe social ?', a: 'Ensemble d\'individus partageant une caractéristique et ayant conscience d\'appartenance commune' },
    { q: 'Qu\'est-ce que la déviance ?', a: 'Comportement qui s\'écarte des normes sociales — relatif selon les sociétés et époques' },
    { q: 'Démocratie représentative vs directe ?', a: 'Représentative : élus décident au nom du peuple. Directe : citoyens décident eux-mêmes (référendum)' },
    { q: 'Qu\'est-ce que l\'État providence ?', a: 'État qui assure une protection sociale (santé, retraite, chômage, famille)' },
    { q: 'Système de protection sociale français ?', a: 'Sécurité sociale (1945) — financement par cotisations et impôts — branches maladie, retraite, famille, accidents' },
    { q: 'Qu\'est-ce que la discrimination positive ?', a: 'Traitement préférentiel accordé à des groupes historiquement défavorisés pour réduire les inégalités' },
    { q: 'Définition du vote ?', a: 'Acte civique par lequel le citoyen exprime son choix — obligatoire dans certains pays (Belgique, Australie)' },
  ]},
  // ── Primaire ─────────────────────────────────────────────────────────────────
  { name: 'Primaire — Tables de multiplication (×2 à ×9)', subject: 'Maths' as Subject, level: 'Primaire', cards: [
    { q: '2 × 3 = ?', a: '6' }, { q: '2 × 7 = ?', a: '14' }, { q: '3 × 4 = ?', a: '12' },
    { q: '3 × 7 = ?', a: '21' }, { q: '4 × 4 = ?', a: '16' }, { q: '4 × 8 = ?', a: '32' },
    { q: '5 × 6 = ?', a: '30' }, { q: '5 × 9 = ?', a: '45' }, { q: '6 × 6 = ?', a: '36' },
    { q: '6 × 7 = ?', a: '42' }, { q: '7 × 7 = ?', a: '49' }, { q: '7 × 8 = ?', a: '56' },
    { q: '8 × 8 = ?', a: '64' }, { q: '8 × 9 = ?', a: '72' }, { q: '9 × 9 = ?', a: '81' },
    { q: '6 × 9 = ?', a: '54' }, { q: '4 × 7 = ?', a: '28' }, { q: '3 × 8 = ?', a: '24' },
    { q: '5 × 7 = ?', a: '35' }, { q: '4 × 9 = ?', a: '36' },
  ]},
  { name: 'Primaire — Vocabulaire Français (CM1-CM2)', subject: 'Français' as Subject, level: 'Primaire', cards: [
    { q: 'Synonyme de "content" ?', a: 'Joyeux, heureux, ravi, satisfait' },
    { q: 'Synonyme de "triste" ?', a: 'Mélancolique, malheureux, chagriné, affligé' },
    { q: 'Contraire de "courageux" ?', a: 'Lâche, peureux, timide' },
    { q: 'Contraire de "généreuse" ?', a: 'Égoïste, avare' },
    { q: 'Définition d\'un nom propre ?', a: 'Désigne une personne, un lieu, un titre unique — prend une majuscule (Paris, Marie)' },
    { q: 'Définition d\'un nom commun ?', a: 'Désigne une catégorie d\'objets, d\'êtres, d\'idées — avec article (une maison)' },
    { q: 'Définition d\'un verbe d\'action ?', a: 'Exprime une action réalisée par le sujet (courir, écrire, manger)' },
    { q: 'Pluriel de "oeil" ?', a: 'Yeux (irrégulier !)' },
    { q: 'Pluriel de "cheval" ?', a: 'Chevaux (−al → −aux)' },
    { q: 'Pluriel de "genou" ?', a: 'Genoux (sept mots en −ou prennent −x : bijou, caillou, chou, genou, hibou, joujou, pou)' },
    { q: 'Qu\'est-ce qu\'un adverbe ?', a: 'Mot invariable qui modifie un verbe, un adjectif ou un autre adverbe (rapidement, très, bien)' },
    { q: 'Qu\'est-ce qu\'une préposition ?', a: 'Mot de liaison invariable (à, de, avec, sans, pour, dans, sur, sous...)' },
  ]},
  { name: 'Primaire — Histoire et Géographie (CM1-CM2)', subject: 'Histoire' as Subject, level: 'Primaire', cards: [
    { q: 'Capitale de la France ?', a: 'Paris' },
    { q: 'Capitale de l\'Espagne ?', a: 'Madrid' },
    { q: 'Capitale de l\'Allemagne ?', a: 'Berlin' },
    { q: 'Capitale de l\'Italie ?', a: 'Rome' },
    { q: 'Capitale du Royaume-Uni ?', a: 'Londres' },
    { q: 'Fleuve traversant Paris ?', a: 'La Seine' },
    { q: 'Plus haut sommet de France ?', a: 'Le Mont-Blanc (4808 m)' },
    { q: 'Combien de régions en France métropolitaine ?', a: '13 régions (depuis 2016)' },
    { q: 'Qui a construit la Tour Eiffel et en quelle année ?', a: 'Gustave Eiffel — 1889 (pour l\'Exposition universelle)' },
    { q: 'Qu\'est-ce que la Révolution française ?', a: 'Période 1789–1799 : chute de la monarchie absolue, naissance de la République' },
    { q: 'Qu\'est-ce qu\'une carte ?', a: 'Représentation à plat d\'un espace géographique à l\'aide d\'une légende et d\'une échelle' },
    { q: 'Les 5 continents ?', a: 'Europe, Asie, Afrique, Amérique, Océanie (parfois Antarctique = 6e)' },
  ]},
  { name: 'Brevet — Maths Collège (révision)', subject: 'Maths' as Subject, level: '3e', cards: [
    { q: 'Factoriser x² − 9 ?', a: '(x−3)(x+3)  — identité remarquable a²−b²=(a−b)(a+b)' },
    { q: 'Développer (x+3)² ?', a: 'x² + 6x + 9  — identité (a+b)² = a²+2ab+b²' },
    { q: 'Définition d\'une droite perpendiculaire ?', a: 'Deux droites qui se coupent à angle droit (90°)' },
    { q: 'Définition d\'une médiatrice ?', a: 'Droite perpendiculaire au milieu d\'un segment' },
    { q: 'Propriété de la médiatrice ?', a: 'Tout point de la médiatrice est équidistant des deux extrémités du segment' },
    { q: 'Qu\'est-ce qu\'un vecteur ?', a: 'Objet mathématique ayant une direction, un sens et une norme (longueur)' },
    { q: 'Coordonnées du vecteur AB si A(x₁,y₁) et B(x₂,y₂) ?', a: 'AB⃗ = (x₂−x₁ ; y₂−y₁)' },
    { q: 'Équation d\'une droite sous forme y = mx + p ?', a: 'm = coefficient directeur (pente), p = ordonnée à l\'origine' },
    { q: 'Coefficient directeur d\'une droite passant par A(1,2) et B(3,8) ?', a: 'm = (8−2)/(3−1) = 6/2 = 3' },
    { q: 'Définition d\'une probabilité ?', a: '0 ≤ P(A) ≤ 1. P(certain) = 1. P(impossible) = 0' },
  ]},


  // ── Maths supplémentaires ───────────────────────────────────────────────────
  { name: "Maths — Nombres & Calcul CM2/6e", subject: "Maths" as Subject, level: "Collège", cards: [
    { q: "PGCD de 24 et 36 ?", a: "12" },
    { q: "PPCM de 4 et 6 ?", a: "12" },
    { q: "Décomposer 60 en facteurs premiers", a: "60 = 2² × 3 × 5" },
    { q: "Décomposer 84 en facteurs premiers", a: "84 = 2² × 3 × 7" },
    { q: "Fraction irréductible de 18/24 ?", a: "3/4 (diviser par PGCD=6)" },
    { q: "3/5 + 2/3 = ?", a: "9/15 + 10/15 = 19/15" },
    { q: "5/6 - 1/4 = ?", a: "10/12 - 3/12 = 7/12" },
    { q: "2/3 × 3/4 = ?", a: "6/12 = 1/2" },
    { q: "3/4 ÷ 3/8 = ?", a: "3/4 × 8/3 = 24/12 = 2" },
    { q: "Qu'est-ce qu'un nombre entier relatif ?", a: "Entier positif, négatif ou nul (ex : -5, 0, 7)" },
    { q: "(-3) × (-4) = ?", a: "12 (négatif × négatif = positif)" },
    { q: "(-6) + 4 = ?", a: "-2" },
    { q: "Valeur absolue de -7 ?", a: "7" },
    { q: "Convertir 3/8 en décimal ?", a: "0,375" },
    { q: "25% en fraction simplifiée ?", a: "1/4" },
  ]},
  { name: "Maths — Fonctions Lycée", subject: "Maths" as Subject, level: "Lycée", cards: [
    { q: "Définition : fonction croissante ?", a: "x1 < x2 ⟹ f(x1) < f(x2) — la courbe monte de gauche à droite" },
    { q: "Définition : fonction décroissante ?", a: "x1 < x2 ⟹ f(x1) > f(x2) — la courbe descend de gauche à droite" },
    { q: "Extremum local : définition ?", a: "Point où la fonction change de sens de variation (max ou min local)" },
    { q: "Domaine de définition de f(x)=1/x ?", a: "ℝ\{0} — tout réel sauf 0" },
    { q: "Domaine de définition de f(x)=√x ?", a: "[0, +∞[" },
    { q: "Limite de 1/x quand x→+∞ ?", a: "0" },
    { q: "Limite de x² quand x→-∞ ?", a: "+∞" },
    { q: "Asymptote verticale de f(x)=1/(x-3) ?", a: "x = 3" },
    { q: "Asymptote horizontale de f(x)=2+1/x ?", a: "y = 2" },
    { q: "Composée f∘g(x) = ?", a: "f(g(x)) — appliquer g d'abord, puis f" },
    { q: "Bijection : définition ?", a: "Fonction à la fois injective (1-1) et surjective (sur tout le codomaine)" },
    { q: "Fonction réciproque f⁻¹ : existence ?", a: "Existe ssi f est bijective — f⁻¹(y)=x ⟺ f(x)=y" },
    { q: "Parité : f paire signifie ?", a: "f(-x) = f(x) — symétrie axe Oy" },
    { q: "Parité : f impaire signifie ?", a: "f(-x) = -f(x) — symétrie centre O" },
    { q: "f(x) = |x| : dérivable en 0 ?", a: "Non — coin aigu, limite gauche ≠ limite droite de la dérivée" },
  ]},
  { name: "Maths — Trigonométrie", subject: "Maths" as Subject, level: "Lycée", cards: [
    { q: "sin(0) = ?", a: "0" },
    { q: "cos(0) = ?", a: "1" },
    { q: "sin(π/2) = ?", a: "1" },
    { q: "cos(π/2) = ?", a: "0" },
    { q: "sin(π) = ?", a: "0" },
    { q: "cos(π) = ?", a: "-1" },
    { q: "tan(x) = ?", a: "sin(x)/cos(x)" },
    { q: "sin²(x) + cos²(x) = ?", a: "1 (identité fondamentale)" },
    { q: "Formule sin(a+b) ?", a: "sin(a)cos(b) + cos(a)sin(b)" },
    { q: "Formule cos(a+b) ?", a: "cos(a)cos(b) - sin(a)sin(b)" },
    { q: "sin(2x) = ?", a: "2sin(x)cos(x)" },
    { q: "cos(2x) = ?", a: "cos²(x) - sin²(x) ou 1-2sin²(x) ou 2cos²(x)-1" },
    { q: "Période de sin(x) ?", a: "2π" },
    { q: "Période de tan(x) ?", a: "π" },
    { q: "Résoudre sin(x) = 0 sur ℝ ?", a: "x = kπ, k∈ℤ" },
  ]},
  { name: "Maths — Suites numériques", subject: "Maths" as Subject, level: "Terminale", cards: [
    { q: "Suite arithmétique : terme général ?", a: "uₙ = u₀ + n×r (r = raison)" },
    { q: "Suite géométrique : terme général ?", a: "uₙ = u₀ × qⁿ (q = raison)" },
    { q: "Somme n+1 premiers termes d'une suite arithmétique ?", a: "S = (n+1)(u₀+uₙ)/2" },
    { q: "Somme n+1 premiers termes d'une suite géométrique ?", a: "S = u₀ × (1-qⁿ⁺¹)/(1-q)" },
    { q: "Suite géométrique converge si ?", a: "|q| < 1 → limite 0; q=1 → limite u₀; |q|>1 → diverge" },
    { q: "Suite croissante : condition ?", a: "uₙ₊₁ - uₙ > 0 ou uₙ₊₁/uₙ > 1 (si termes positifs)" },
    { q: "Raisonnement par récurrence : étapes ?", a: "1) Initialisation (n=0 ou n=1). 2) Hérédité (si vrai au rang n, vrai au rang n+1)" },
    { q: "Suite définie par récurrence : exemple ?", a: "u₀=1, uₙ₊₁=2uₙ+1 → suite géométrique cachée" },
    { q: "Limite de qⁿ si |q|<1 ?", a: "0" },
    { q: "Limite de n×qⁿ si |q|<1 ?", a: "0 (exponentielle l'emporte sur polynôme)" },
    { q: "Suite bornée + monotone → ?", a: "Convergente (théorème de la limite monotone bornée)" },
    { q: "Valeur du segment [uₙ, uₙ₊₁] qui rétrécit → ?", a: "La suite converge vers la borne commune" },
    { q: "Qu'est-ce qu'une suite de Fibonacci ?", a: "u₀=0, u₁=1, uₙ₊₂=uₙ₊₁+uₙ (chaque terme = somme des 2 précédents)" },
    { q: "Suite arithmético-géométrique : méthode ?", a: "Trouver le point fixe l, poser vₙ = uₙ - l → suite géométrique" },
    { q: "Comportement de eⁿ vs nᵏ quand n→+∞ ?", a: "eⁿ/nᵏ → +∞ (exponentielle domine tout polynôme)" },
  ]},
  { name: "Maths — Complexes & Géométrie", subject: "Maths" as Subject, level: "Terminale", cards: [
    { q: "i² = ?", a: "-1" },
    { q: "Module de z=a+ib ?", a: "|z| = √(a²+b²)" },
    { q: "Conjugué de z=a+ib ?", a: "z̄ = a-ib" },
    { q: "Forme trigonométrique de z ?", a: "z = r(cos θ + i sin θ) avec r=|z|, θ=arg(z)" },
    { q: "Formule d'Euler ?", a: "e^(iθ) = cos θ + i sin θ" },
    { q: "Produit de modules ?", a: "|z₁×z₂| = |z₁|×|z₂|" },
    { q: "Argument d'un produit ?", a: "arg(z₁×z₂) = arg(z₁) + arg(z₂)" },
    { q: "Résoudre z² = -9 ?", a: "z = 3i ou z = -3i" },
    { q: "Interprétation géométrique de |z-z₀| = R ?", a: "Cercle de centre z₀ et rayon R dans le plan complexe" },
    { q: "Vecteur colinéaire à OA si z_A réel positif ?", a: "z_B/z_A réel positif → B, O, A alignés dans cet ordre" },
    { q: "Rotation d'angle π/2 : multiplication par ?", a: "i" },
    { q: "Racines n-ièmes de l'unité ?", a: "e^(2ikπ/n) pour k=0,1,...,n-1 — réparties sur cercle unité" },
    { q: "Formule de Moivre ?", a: "(cos θ + i sin θ)ⁿ = cos(nθ) + i sin(nθ)" },
    { q: "Linéariser cos²(x) ?", a: "cos²(x) = (1 + cos(2x))/2" },
    { q: "Linéariser sin²(x) ?", a: "sin²(x) = (1 - cos(2x))/2" },
  ]},
  // ── Physique supplémentaires ────────────────────────────────────────────────
  { name: "Physique — Énergie & Thermodynamique", subject: "Physique" as Subject, level: "Terminale", cards: [
    { q: "Premier principe de la thermodynamique ?", a: "ΔU = W + Q (variation énergie interne = travail + chaleur reçus)" },
    { q: "Deuxième principe (entropie) ?", a: "L'entropie d'un système isolé ne peut qu'augmenter" },
    { q: "Chaleur molaire à pression constante Cp ?", a: "Cp = (5/2)R pour un gaz diatomique, (3/2)R pour monoatomique" },
    { q: "Gaz parfait : loi d'état ?", a: "PV = nRT (P pression, V volume, n moles, R=8,314, T température K)" },
    { q: "Processus isotherme ?", a: "Température constante : PV = constante (loi de Boyle-Mariotte)" },
    { q: "Processus isobare ?", a: "Pression constante : V/T = constante (loi de Charles)" },
    { q: "Processus isochore ?", a: "Volume constant : P/T = constante" },
    { q: "Rendement d'un moteur thermique ?", a: "η = W/Qchaud = 1 - Tfroid/Tchaud (cycle de Carnot, max théorique)" },
    { q: "Chaleur latente de fusion ?", a: "Énergie absorbée lors du passage solide→liquide à température constante" },
    { q: "Capacité thermique massique : définition ?", a: "c = Q/(m×ΔT) — énergie pour élever 1kg de 1°C (eau : 4186 J/kg·K)" },
    { q: "Équivalence travail/chaleur (Joule) ?", a: "1 calorie = 4,186 joules" },
    { q: "Puissance rayonnée (loi de Stefan-Boltzmann) ?", a: "P = σ × S × T⁴ (σ = 5,67×10⁻⁸ W·m⁻²·K⁻⁴)" },
    { q: "Loi de Wien (émission thermique) ?", a: "λ_max × T = 2,898×10⁻³ m·K" },
    { q: "Énergie interne d'un gaz parfait monoatomique ?", a: "U = (3/2)nRT" },
    { q: "Travail reçu en compression isobare ?", a: "W = -PΔV (négatif si expansion, positif si compression)" },
  ]},
  { name: "Physique — Cinématique & Dynamique", subject: "Physique" as Subject, level: "Terminale", cards: [
    { q: "Vitesse instantanée : définition ?", a: "v = dx/dt — dérivée de la position par rapport au temps" },
    { q: "Accélération : définition ?", a: "a = dv/dt = d²x/dt² — dérivée de la vitesse" },
    { q: "MRUA : équation horaire de la position ?", a: "x(t) = x₀ + v₀t + (1/2)at²" },
    { q: "Chute libre : vitesse après t secondes ?", a: "v = g×t (si v₀=0, en ignorant l'air, g≈9,8 m/s²)" },
    { q: "Portée d'un projectile (angle 45°) ?", a: "Xmax = v₀²/g — portée maximale à 45°" },
    { q: "Troisième loi de Newton ?", a: "Action-réaction : FA→B = -FB→A (forces égales, opposées, même droite d'action)" },
    { q: "Conservation de la quantité de mouvement ?", a: "Σp = constante si Σ forces extérieures = 0" },
    { q: "Quantité de mouvement p = ?", a: "p = mv (kg·m/s)" },
    { q: "Impulsion : loi impulse-momentum ?", a: "J = F×Δt = Δp" },
    { q: "Travail d'une force de frottement ?", a: "W < 0 — la force de frottement s'oppose toujours au déplacement" },
    { q: "Choc élastique : ce qui se conserve ?", a: "Énergie cinétique totale ET quantité de mouvement totale" },
    { q: "Choc inélastique : ce qui se conserve ?", a: "Quantité de mouvement seulement (Ec non conservée)" },
    { q: "Force centripète : formule ?", a: "Fc = mv²/r (dirigée vers le centre du cercle)" },
    { q: "Accélération centripète ?", a: "a = v²/r = ω²r" },
    { q: "Période de révolution d'un satellite : formule ?", a: "T = 2π√(r³/GM)" },
  ]},
  // ── Chimie supplémentaires ──────────────────────────────────────────────────
  { name: "Chimie — Équilibres & Cinétique", subject: "Chimie" as Subject, level: "Terminale", cards: [
    { q: "Qu'est-ce qu'une réaction réversible ?", a: "Réaction pouvant aller dans les deux sens — notée avec ⇌" },
    { q: "Constante d'équilibre K : définition ?", a: "K = [produits]^stoéchio / [réactifs]^stoéchio à l'équilibre" },
    { q: "Principe de Le Chatelier ?", a: "Tout système en équilibre soumis à une perturbation réagit pour s'opposer à cette perturbation" },
    { q: "Facteurs influençant la vitesse de réaction ?", a: "Température, concentration, surface de contact, catalyseur, pression (gaz)" },
    { q: "Catalyseur : rôle ?", a: "Accélère la réaction sans être consommé — abaisse l'énergie d'activation" },
    { q: "Ordre d'une réaction : définition ?", a: "Exposant de la concentration dans la loi de vitesse v = k[A]^m[B]^n" },
    { q: "Demi-vie t₁/₂ : définition ?", a: "Temps pour que [réactif] diminue de moitié" },
    { q: "Loi de vitesse d'ordre 1 ?", a: "[A] = [A]₀ × e^(-kt)" },
    { q: "Déplacer l'équilibre vers les produits : comment ?", a: "Augmenter T (si ΔH>0), augmenter [réactifs], diminuer [produits], catalyseur (accélère pas déplace)" },
    { q: "Acide fort vs acide faible ?", a: "Fort : ionisation totale (HCl→H⁺+Cl⁻). Faible : ionisation partielle (CH₃COOH⇌CH₃COO⁻+H⁺)" },
    { q: "Ka et pKa : relation ?", a: "pKa = -log(Ka) — plus pKa est faible, plus l'acide est fort" },
    { q: "Neutralisation acide/base : résultat ?", a: "Formation d'eau et d'un sel : HCl + NaOH → NaCl + H₂O" },
    { q: "Oxydation : définition ?", a: "Perte d'électrons (OIL — Oxidation Is Loss)" },
    { q: "Réduction : définition ?", a: "Gain d'électrons (RIG — Reduction Is Gain)" },
    { q: "Potentiel standard de réduction E° : plus grand = ?", a: "Oxydant plus fort — tendance plus grande à accepter des électrons" },
  ]},
  { name: "Chimie — Chimie organique avancée", subject: "Chimie" as Subject, level: "Terminale", cards: [
    { q: "Groupe fonctionnel alcool ?", a: "-OH (hydroxyle) lié à un carbone sp3" },
    { q: "Groupe fonctionnel aldéhyde ?", a: "-CHO (carbonyle en bout de chaîne)" },
    { q: "Groupe fonctionnel cétone ?", a: "C=O en milieu de chaîne" },
    { q: "Groupe fonctionnel acide carboxylique ?", a: "-COOH" },
    { q: "Groupe fonctionnel ester ?", a: "-COO- (acide + alcool avec perte d'eau)" },
    { q: "Réaction d'estérification : conditions ?", a: "Acide carboxylique + alcool → ester + eau (catalyse acide, équilibre)" },
    { q: "Réaction de saponification ?", a: "Ester + base forte → sel d'acide + alcool (totale, irréversible)" },
    { q: "Qu'est-ce qu'un alcane ?", a: "Hydrocarbure saturé CₙH₂ₙ₊₂ — liaisons simples uniquement" },
    { q: "Qu'est-ce qu'un alcène ?", a: "Hydrocarbure avec double liaison C=C (ex : éthylène CH₂=CH₂)" },
    { q: "Règle de Markovnikov ?", a: "Lors d'addition sur alcène : H s'ajoute sur le C le plus hydrogéné" },
    { q: "Polymérisation : principe ?", a: "Addition ou condensation de monomères pour former une longue chaîne macromoléculaire" },
    { q: "Qu'est-ce qu'un stéréoisomère ?", a: "Même formule brute et connectivité, mais arrangement spatial différent" },
    { q: "Chiralité : définition ?", a: "Carbone chiral = lié à 4 groupes différents — molécule non superposable à son image miroir" },
    { q: "Qu'est-ce qu'une réaction de substitution nucléophile ?", a: "Un nucléophile remplace un groupe partant sur un carbone (SN1 ou SN2)" },
    { q: "Amide : groupe fonctionnel ?", a: "-CONH₂ ou -CONH- (liaison peptidique entre acides aminés)" },
  ]},
  // ── SVT supplémentaires ──────────────────────────────────────────────────────
  { name: "SVT — Immunologie", subject: "SVT" as Subject, level: "Terminale", cards: [
    { q: "Immunité innée vs adaptative ?", a: "Innée : réponse rapide, non spécifique. Adaptative : lente, spécifique, mémoire immunologique" },
    { q: "Antigène : définition ?", a: "Molécule étrangère qui déclenche une réponse immunitaire (fragment reconnu = épitope)" },
    { q: "Anticorps : structure ?", a: "Protéine en Y (immunoglobuline) avec 2 sites de fixation spécifiques à l'antigène" },
    { q: "Lymphocytes B : rôle ?", a: "Immunité humorale — se différencient en plasmocytes producteurs d'anticorps" },
    { q: "Lymphocytes T CD4+ : rôle ?", a: "Lymphocytes T auxiliaires (helper) — coordonnent la réponse immunitaire" },
    { q: "Lymphocytes T CD8+ : rôle ?", a: "Lymphocytes T cytotoxiques — tuent les cellules infectées" },
    { q: "CMH (MHC) : rôle ?", a: "Complexe Majeur d'Histocompatibilité — présente les peptides antigéniques aux lymphocytes T" },
    { q: "Qu'est-ce qu'un vaccin ?", a: "Introduit un antigène affaibli/inactivé → crée une mémoire immunitaire sans maladie" },
    { q: "Mémoire immunitaire : mécanisme ?", a: "Certains lymphocytes B et T deviennent des cellules mémoire à longue durée de vie" },
    { q: "Phagocytose : qu'est-ce que c'est ?", a: "Ingestion et destruction de pathogènes par des phagocytes (macrophages, neutrophiles)" },
    { q: "VIH : comment détruit-il l'immunité ?", a: "Infecte et détruit les lymphocytes T CD4+ → immunodéficience (SIDA au stade avancé)" },
    { q: "Réaction inflammatoire : signes ?", a: "Rougeur, chaleur, gonflement, douleur — recrutement de cellules immunitaires" },
    { q: "Interférons : rôle ?", a: "Protéines antivirales libérées par cellules infectées pour alerter les cellules voisines" },
    { q: "Rejet de greffe : pourquoi ?", a: "Les CMH du donneur sont reconnus comme étrangers par les LT du receveur" },
    { q: "Maladie auto-immune : définition ?", a: "Le système immunitaire attaque les propres tissus de l'organisme (ex : diabète type 1, lupus)" },
  ]},
  { name: "SVT — Physiologie humaine", subject: "SVT" as Subject, level: "Lycée", cards: [
    { q: "Rôle du cœur ?", a: "Pompe le sang dans les vaisseaux — double circulation : pulmonaire et systémique" },
    { q: "Systole vs diastole ?", a: "Systole : contraction du cœur (expulse le sang). Diastole : relâchement (remplissage)" },
    { q: "Qu'est-ce que la pression artérielle ?", a: "Pression exercée par le sang sur les parois des artères (normale : 120/80 mmHg)" },
    { q: "Rôle des globules rouges ?", a: "Transportent O₂ grâce à l'hémoglobine" },
    { q: "Rôle du foie ?", a: "Métabolisme des glucides/lipides/protéines, détoxification, production de bile, stockage glycogène" },
    { q: "Rôle des reins ?", a: "Filtration du sang, élimination déchets (urine), régulation pression artérielle et pH" },
    { q: "Échanges gazeux dans les poumons ?", a: "O₂ passe des alvéoles au sang. CO₂ passe du sang aux alvéoles (diffusion)" },
    { q: "Neurone : structure principale ?", a: "Corps cellulaire + dendrites (reçoivent) + axone (transmet) + terminaisons synaptiques" },
    { q: "Potentiel d'action : définition ?", a: "Signal électrique propagé le long de l'axone quand le seuil de dépolarisation est atteint" },
    { q: "Synapse chimique : fonctionnement ?", a: "Neurotransmetteur libéré dans la fente synaptique → se fixe sur récepteurs du neurone suivant" },
    { q: "Rôle du pancréas (endocrine) ?", a: "Sécrète insuline (baisse glycémie) et glucagon (hausse glycémie)" },
    { q: "Qu'est-ce que la glycémie ?", a: "Taux de glucose dans le sang — normale : 0,8-1,1 g/L à jeun" },
    { q: "Diabète de type 1 vs type 2 ?", a: "Type 1 : destruction cellules β (pas insuline). Type 2 : résistance à l'insuline" },
    { q: "Rôle des estrogènes ?", a: "Hormones sexuelles féminines — développement caractères sexuels secondaires, cycle menstruel" },
    { q: "Rôle de la testostérone ?", a: "Hormone sexuelle masculine — développement caractères sexuels secondaires, spermatogenèse" },
  ]},
  // ── Histoire supplémentaires ────────────────────────────────────────────────
  { name: "Histoire — XXe siècle avancé", subject: "Histoire" as Subject, level: "Terminale", cards: [
    { q: "Qu'est-ce que la Guerre froide ?", a: "Rivalité (1947-1991) entre USA (bloc occidental) et URSS (bloc communiste) sans conflit direct" },
    { q: "Date de la création de l'ONU ?", a: "1945 — après la 2e Guerre mondiale pour maintenir la paix internationale" },
    { q: "Date du mur de Berlin : construction et chute ?", a: "Construit 1961, tombé le 9 novembre 1989" },
    { q: "Plan Marshall : qu'est-ce que c'est ?", a: "Aide économique américaine à l'Europe occidentale (1948) pour reconstruire et contrer le communisme" },
    { q: "Qu'est-ce que la décolonisation ?", a: "Processus d'indépendance des colonies (principalement 1945-1975)" },
    { q: "Date de l'indépendance de l'Algérie ?", a: "5 juillet 1962 (Accords d'Évian, 18 mars 1962)" },
    { q: "Mai 68 : qu'est-ce que c'est ?", a: "Mouvement social français (grèves, manifestations étudiantes) contre l'ordre établi" },
    { q: "Qu'est-ce que les Trente Glorieuses ?", a: "Période de forte croissance économique en France (1945-1973) — plein emploi, hausse niveau de vie" },
    { q: "Chute de l'URSS : date ?", a: "25 décembre 1991 — dissolution officielle de l'Union soviétique" },
    { q: "Qu'est-ce que le génocide rwandais ?", a: "Massacre de ~800 000 Tutsis par les Hutus en 100 jours (avril-juillet 1994)" },
    { q: "Qu'est-ce que l'apartheid ?", a: "Régime de ségrégation raciale en Afrique du Sud (1948-1991) — aboli grâce à Nelson Mandela" },
    { q: "Attentat du 11 septembre 2001 : conséquences ?", a: "Attaque d'Al-Qaïda sur les USA → guerre en Afghanistan, Patriot Act, lutte antiterroriste mondiale" },
    { q: "Qu'est-ce que l'Union européenne ?", a: "Organisation supranationale créée par Maastricht (1992) — 27 membres, monnaie unique (€)" },
    { q: "Qu'est-ce que la mondialisation post-1990 ?", a: "Accélération des échanges après la chute du communisme et l'essor d'internet" },
    { q: "Crise de 2008 : origine ?", a: "Crise des subprimes (prêts immobiliers risqués US) → effondrement bancaire → récession mondiale" },
  ]},
  // ── Philosophie supplémentaires ─────────────────────────────────────────────
  { name: "Philosophie — Science & Technique", subject: "Philosophie" as Subject, level: "Terminale", cards: [
    { q: "Popper : critère de la science ?", a: "Falsifiabilité — une théorie est scientifique si elle peut être réfutée par l'expérience" },
    { q: "Kuhn : paradigme scientifique ?", a: "Ensemble de présupposés dominant une époque — révolution scientifique = changement de paradigme" },
    { q: "Technique : définition philosophique ?", a: "Ensemble des moyens rationnels mis en œuvre pour transformer la nature (Heidegger : révèle l'être)" },
    { q: "Heidegger sur la technique moderne ?", a: "Elle transforme la nature en simple réserve d'énergie (Bestand) — arraisonnement du monde" },
    { q: "Distinction science pure / science appliquée ?", a: "Pure : connaissance désintéressée. Appliquée : recherche de solutions pratiques" },
    { q: "Auguste Comte : positivisme ?", a: "Seules les sciences positives (vérifiables) donnent une connaissance valide — 3 stades : théol./méta./positif" },
    { q: "Descartes : méthode scientifique (4 règles) ?", a: "Évidence, analyse, synthèse, dénombrement (Discours de la méthode)" },
    { q: "Progrès technique : toujours du progrès moral ?", a: "Non — ex: armes de destruction massive, pollution. Le progrès technique n'implique pas progrès humain" },
    { q: "Qu'est-ce que le transhumanisme ?", a: "Courant voulant améliorer l'humain par la technologie (augmentation cognitive, longévité)" },
    { q: "Hans Jonas : principe responsabilité ?", a: "Agis de sorte que les effets de ton action soient compatibles avec la permanence de la vie humaine" },
    { q: "Vérité scientifique vs vérité philosophique ?", a: "Scientifique : provisoire, falsifiable. Philosophique : questionnement des fondements mêmes du savoir" },
    { q: "Bachelard : obstacle épistémologique ?", a: "Préjugé ou habitude mentale qui empêche la connaissance scientifique de progresser" },
    { q: "Qu'est-ce qu'une hypothèse scientifique ?", a: "Proposition provisoire testable par l'expérience — base du raisonnement hypothético-déductif" },
    { q: "Intelligence artificielle : question philosophique centrale ?", a: "Peut-elle penser ? (test de Turing) — question de la conscience, de la personne, du travail" },
    { q: "Bergson sur la technique ?", a: "L'homo faber (fabricant) précède l'homo sapiens — l'intelligence est essentiellement fabricatrice" },
  ]},
  // ── Langues vivantes ────────────────────────────────────────────────────────
  { name: "Anglais — Grammaire avancée B2", subject: "Anglais" as Subject, level: "Terminale", cards: [
    { q: "Present Perfect : quand l'utiliser ?", a: "Action passée avec lien au présent (have/has + V3) — ex: I have just finished" },
    { q: "Past Perfect : quand l'utiliser ?", a: "Action passée avant une autre action passée — ex: She had left when he arrived" },
    { q: "Conditionnel type 2 : structure ?", a: "If + past simple, would + infinitif — situation hypothétique présente/future" },
    { q: "Conditionnel type 3 : structure ?", a: "If + past perfect, would have + V3 — situation irréelle dans le passé" },
    { q: "Discours indirect au passé : transformation ?", a: "'I am tired' → He said (that) he was tired (décalage temporel des temps)" },
    { q: "Voix passive formation ?", a: "être (to be) au temps voulu + V3 — ex: The book was written in 1990" },
    { q: "Modaux de probabilité ?", a: "must = très probable; might/may = possible; can't = impossible" },
    { q: "Gérondif vs infinitif après 'stop' ?", a: "stop + -ing = arrêter de. stop + to = s'arrêter pour" },
    { q: "Inversion après neither/nor/so ?", a: "So do I / Neither do I — inversion sujet-auxiliaire" },
    { q: "Relative clause defining vs non-defining ?", a: "Defining : sans virgules, essentielle. Non-defining : virgules, ajout d'info — ex: Paris, which is beautiful" },
    { q: "Phrasal verb 'give up' ?", a: "Abandonner — ex: He gave up smoking" },
    { q: "Différence 'used to' et 'would' (passé) ?", a: "Both = habitude passée, mais 'used to' aussi pour états. 'Would' uniquement pour actions répétées" },
    { q: "Emphase avec 'it is...that/who' ?", a: "Cleft sentence — ex: It was Mary who called (emphase sur Mary)" },
    { q: "Subjonctif anglais (suggest, recommend) ?", a: "I suggest (that) he be present — forme de base sans -s à la 3e pers." },
    { q: "Articles a/an/the : règle principale ?", a: "a/an = 1ère mention ou général. the = déjà mentionné ou unique" },
  ]},
  { name: "Espagnol — Grammaire fondamentale", subject: "Espagnol" as Subject, level: "Lycée", cards: [
    { q: "Ser vs Estar : règle principale ?", a: "Ser : caractéristiques permanentes. Estar : états temporaires ou position" },
    { q: "Conjuguer 'hablar' au présent (yo) ?", a: "yo hablo" },
    { q: "Conjuguer 'ser' au présent (yo, tú, él) ?", a: "soy, eres, es" },
    { q: "Conjuguer 'tener' au présent (yo) ?", a: "tengo" },
    { q: "Conjuguer 'ir' au présent (yo) ?", a: "voy" },
    { q: "Prétérit indéfini de 'hablar' (yo) ?", a: "hablé" },
    { q: "Imparfait de 'hablar' (yo) ?", a: "hablaba" },
    { q: "Futur de 'hablar' (yo) ?", a: "hablaré" },
    { q: "Conditionnel de 'hablar' (yo) ?", a: "hablaría" },
    { q: "Subjonctif présent de 'hablar' (yo) ?", a: "hable (hable, hables, hable, hablemos, habléis, hablen)" },
    { q: "Emploi du subjonctif en espagnol ?", a: "Après verbes de volonté, doute, émotion : quiero que vengas, espero que sea..." },
    { q: "Accord des adjectifs en espagnol ?", a: "S'accordent en genre et nombre avec le nom (bello/bella/bellos/bellas)" },
    { q: "Pronoms personnels COD (le/la) espagnol ?", a: "me, te, lo/la, nos, os, los/las — se placent avant le verbe conjugué" },
    { q: "Forme progressive en espagnol ?", a: "estar + gérondif (-ando/-iendo) ex: estoy comiendo" },
    { q: "Negation en espagnol ?", a: "no + verbe — ex: No hablo inglés. Double négation possible : No veo nada" },
  ]},
  // ── Économie/SES supplémentaires ────────────────────────────────────────────
  { name: "SES — Marchés & Microéconomie", subject: "SES/Économie" as Subject, level: "Lycée", cards: [
    { q: "Loi de l'offre et de la demande ?", a: "Prix augmente → demande baisse, offre augmente. Prix baisse → demande monte, offre baisse" },
    { q: "Prix d'équilibre : définition ?", a: "Prix où l'offre = demande — aucun surplus ni pénurie" },
    { q: "Qu'est-ce qu'une externalité ?", a: "Effet non pris en compte par le marché sur des tiers (ex : pollution = externalité négative)" },
    { q: "Bien public : caractéristiques ?", a: "Non rival (une consommation n'exclut pas les autres) + non excluable (ex : défense nationale)" },
    { q: "Bien de Giffen : comportement ?", a: "Demande augmente quand le prix augmente (paradoxe) — biens inférieurs en cas d'effet de revenu fort" },
    { q: "Monopole : inefficacité ?", a: "Prix supérieur au coût marginal → perte sèche (deadweight loss), moins d'unités produites" },
    { q: "Concurrence parfaite : 5 conditions ?", a: "Atomicité, homogénéité, libre entrée/sortie, mobilité des facteurs, transparence" },
    { q: "Élasticité-prix de la demande : formule ?", a: "ε = (%ΔQ)/(%ΔP) — si |ε|>1 : élastique; <1 : inélastique" },
    { q: "Théorème de Coase ?", a: "En l'absence de coûts de transaction, les parties peuvent internaliser les externalités par négociation" },
    { q: "Asymétrie d'information : conséquences ?", a: "Sélection adverse et aléa moral — peuvent empêcher le marché de fonctionner efficacement" },
    { q: "Qu'est-ce qu'un oligopole ?", a: "Marché dominé par quelques grandes firmes (ex : constructeurs automobiles, téléphonie)" },
    { q: "Bien inférieur vs bien normal ?", a: "Inférieur : demande baisse quand revenu augmente. Normal : demande monte avec le revenu" },
    { q: "Cout marginal : définition ?", a: "Coût de production d'une unité supplémentaire" },
    { q: "Profit économique = ?", a: "Recettes totales - Coûts totaux (incluant coût d'opportunité)" },
    { q: "Qu'est-ce que la main invisible (Adam Smith) ?", a: "Le marché libre coordonne les intérêts individuels pour le bien collectif sans intervention" },
  ]},
  // ── NSI supplémentaires ──────────────────────────────────────────────────────
  { name: "NSI — Réseaux & Protocoles", subject: "NSI/Informatique" as Subject, level: "Lycée", cards: [
    { q: "Modèle OSI : combien de couches ?", a: "7 couches (de bas en haut : physique, liaison, réseau, transport, session, présentation, application)" },
    { q: "Protocole TCP vs UDP ?", a: "TCP : fiable, avec accusé de réception. UDP : rapide, sans garantie (streaming, jeux)" },
    { q: "Adresse IP : format IPv4 ?", a: "4 octets séparés par des points (ex : 192.168.1.1) — 32 bits" },
    { q: "Masque de sous-réseau : rôle ?", a: "Définit quelle partie de l'IP identifie le réseau vs l'hôte (ex : 255.255.255.0 = /24)" },
    { q: "DNS : rôle ?", a: "Domain Name System — traduit les noms de domaine (google.com) en adresses IP" },
    { q: "HTTP vs HTTPS ?", a: "HTTP : non chiffré. HTTPS : chiffré via TLS/SSL — sécurité des échanges web" },
    { q: "Qu'est-ce qu'un routeur ?", a: "Équipement qui achemine les paquets entre différents réseaux selon la table de routage" },
    { q: "Protocole DHCP : rôle ?", a: "Attribue automatiquement une adresse IP aux appareils sur un réseau" },
    { q: "Qu'est-ce qu'un pare-feu (firewall) ?", a: "Filtre le trafic réseau selon des règles pour bloquer les connexions non autorisées" },
    { q: "Chiffrement symétrique vs asymétrique ?", a: "Symétrique : même clé pour chiffrer/déchiffrer. Asymétrique : clé publique + clé privée" },
    { q: "Qu'est-ce que le protocole ARP ?", a: "Traduit une adresse IP en adresse MAC sur un réseau local" },
    { q: "Latence réseau : définition ?", a: "Temps de transit d'un paquet de la source à la destination (en ms)" },
    { q: "Qu'est-ce qu'un VPN ?", a: "Virtual Private Network — crée un tunnel chiffré pour sécuriser les communications" },
    { q: "Algorithme de routage Dijkstra : objet ?", a: "Trouver le chemin le plus court dans un graphe pondéré (utilisé par OSPF)" },
    { q: "Qu'est-ce qu'un switch ?", a: "Commutateur réseau — relie des appareils dans un même réseau local (LAN) via adresses MAC" },
  ]},
  // ── Primaire supplémentaires ────────────────────────────────────────────────
  { name: "Primaire — Sciences & Découverte du monde", subject: "SVT" as Subject, level: "Primaire", cards: [
    { q: "Les 3 états de la matière ?", a: "Solide, liquide, gazeux (ex : glace, eau, vapeur)" },
    { q: "Qu'est-ce que la photosynthèse (niveau CM) ?", a: "Les plantes fabriquent leur nourriture avec l'eau, le CO₂ et la lumière — produisent O₂" },
    { q: "Nom des 8 planètes du système solaire ?", a: "Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune" },
    { q: "Combien de temps la Terre met-elle pour tourner autour du Soleil ?", a: "365 jours (1 an)" },
    { q: "Pourquoi a-t-on les saisons ?", a: "À cause de l'inclinaison de l'axe de rotation de la Terre (23,5°)" },
    { q: "Qu'est-ce que la chaîne alimentaire ?", a: "Plante → herbivore → carnivore — chaque être mange celui d'avant" },
    { q: "La lumière blanche est composée de... ?", a: "Toutes les couleurs de l'arc-en-ciel (ROY G BIV)" },
    { q: "Qu'est-ce qu'un volcan ?", a: "Ouverture dans la croûte terrestre par où sort le magma (lave, cendres, gaz)" },
    { q: "Que produit la respiration ?", a: "CO₂ et H₂O — les poumons rejettent le dioxyde de carbone" },
    { q: "Comment se forme la pluie ?", a: "L'eau s'évapore, forme des nuages, et retombe en pluie (cycle de l'eau)" },
    { q: "Qu'est-ce qu'un mammifère ?", a: "Animal à sang chaud, vertébré, nourrit ses petits avec du lait" },
    { q: "Qu'est-ce qu'un insecte ?", a: "Animal à 6 pattes, 3 parties du corps (tête/thorax/abdomen), souvent des ailes" },
    { q: "Qu'est-ce que l'érosion ?", a: "Usure des roches par l'eau, le vent, la glace sur de très longues périodes" },
    { q: "Cœur humain : combien de cavités ?", a: "4 cavités : 2 oreillettes + 2 ventricules" },
    { q: "Qu'est-ce qu'un nutriment ?", a: "Substance nutritive absorbée par l'organisme : glucides, lipides, protides, vitamines, minéraux" },
  ]},
  { name: "Primaire — Histoire de France CM", subject: "Histoire" as Subject, level: "Primaire", cards: [
    { q: "Qui est Vercingétorix ?", a: "Chef gaulois qui résista à Jules César (bataille d'Alésia, 52 av. J.-C.) — symbole de la résistance" },
    { q: "Quand Clovis est-il baptisé ?", a: "Vers 496 — premier roi franc chrétien, fondement de la France" },
    { q: "Qui est Charlemagne ?", a: "Roi des Francs, couronné empereur en 800 — développe l'école, unifie l'Europe" },
    { q: "Date de la Bataille de Hastings ?", a: "1066 — Guillaume le Conquérant bat le roi Harold et conquiert l'Angleterre" },
    { q: "Qui est Louis IX (Saint Louis) ?", a: "Roi de France réputé pour sa justice — participa aux croisades — canonisé en 1297" },
    { q: "Date de la prise de la Bastille ?", a: "14 juillet 1789 — début de la Révolution française" },
    { q: "Qui est Napoléon Bonaparte ?", a: "Général devenu Consul puis Empereur (1804-1815) — Code civil, conquêtes européennes" },
    { q: "Quand la France abolit-elle l'esclavage définitivement ?", a: "1848 — sous Victor Schoelcher" },
    { q: "Date de la 3e République française ?", a: "1870-1940 — école laïque et gratuite (Jules Ferry, 1882)" },
    { q: "Dates de la 1ère Guerre mondiale ?", a: "1914-1918" },
    { q: "Dates de la 2ème Guerre mondiale ?", a: "1939-1945" },
    { q: "Qui est le général de Gaulle ?", a: "Chef de la France libre (Londres, 18 juin 1940) — puis président de la République (1958)" },
    { q: "Qu'est-ce que la Ve République ?", a: "Régime politique de la France depuis 1958 — constitution rédigée par de Gaulle" },
    { q: "Date de la construction de la Tour Eiffel ?", a: "1889 — pour l'Exposition universelle de Paris" },
    { q: "Qui était Marie Curie ?", a: "Scientifique franco-polonaise, 2 prix Nobel (physique 1903, chimie 1911) — découverte du radium" },
  ]},
  // ── Bac & Brevet révision ────────────────────────────────────────────────────
  { name: "Brevet — Sciences (SVT + Physique)", subject: "SVT" as Subject, level: "3e", cards: [
    { q: "Formule du glucose ?", a: "C₆H₁₂O₆" },
    { q: "Réaction de photosynthèse (simplifiée) ?", a: "CO₂ + H₂O + lumière → glucose + O₂" },
    { q: "Réaction de respiration cellulaire ?", a: "Glucose + O₂ → CO₂ + H₂O + énergie (ATP)" },
    { q: "Qu'est-ce qu'un allèle ?", a: "Version alternative d'un gène — un individu diploïde possède 2 allèles pour chaque gène" },
    { q: "Allèle dominant vs récessif ?", a: "Dominant : s'exprime même si 1 seul exemplaire. Récessif : ne s'exprime qu'en 2 exemplaires" },
    { q: "Loi de Newton F = ?", a: "F = m × a" },
    { q: "Unité de la pression ?", a: "Pascal (Pa)" },
    { q: "Formule pression hydrostatique ?", a: "P = ρ × g × h (ρ densité, g 9,8, h profondeur)" },
    { q: "Spectre électromagnétique : du + court au + long ?", a: "γ, X, UV, visible, IR, micro-ondes, radio" },
    { q: "Vitesse du son dans l'air ?", a: "340 m/s (environ)" },
    { q: "Formule chimique de l'eau ?", a: "H₂O" },
    { q: "Formule du dioxyde de carbone ?", a: "CO₂" },
    { q: "Couche d'ozone : rôle ?", a: "Absorbe les UV nocifs du Soleil — protège les êtres vivants" },
    { q: "Tectonique des plaques : principe ?", a: "La lithosphère est découpée en plaques qui se déplacent lentement" },
    { q: "Séisme : origine ?", a: "Rupture brutale de roches en profondeur (foyer/hypocentre) — libère des ondes sismiques" },
  ]},
  { name: "Bac — Français (méthode dissertation)", subject: "Français" as Subject, level: "Première", cards: [
    { q: "Structure d'une dissertation en 3 parties ?", a: "I. Thèse (affirmer) → II. Antithèse (nuancer/contredire) → III. Synthèse (dépasser)" },
    { q: "Structure d'un paragraphe développement ?", a: "Idée directrice + argument + exemple littéraire + analyse + transition" },
    { q: "Longueur recommandée d'une intro ?", a: "10-15% de la copie — accroche + présentation sujet + problématique + annonce plan" },
    { q: "Qu'est-ce qu'une problématique ?", a: "Question centrale qui oriente toute la réflexion — pas de oui/non simple, tension intellectuelle" },
    { q: "Qu'est-ce qu'un registre littéraire ?", a: "Ton dominant d'un texte : tragique, comique, lyrique, épique, fantastique, réaliste..." },
    { q: "Commentaire linéaire vs composé ?", a: "Linéaire : suit l'ordre du texte. Composé (analytique) : organisé par axes thématiques" },
    { q: "Oral EAF : comment introduire l'explication ?", a: "Lire le texte → situer passage → formuler projet de lecture → annoncer 2-3 axes" },
    { q: "Qu'est-ce qu'un hypotexte ?", a: "Texte source dont s'inspire un autre texte (hypertexte) — ex: Ulysse d'Homer est hypotexte de L'Odyssée de Joyce" },
    { q: "Qu'est-ce qu'un champ lexical ?", a: "Ensemble de mots appartenant au même domaine sémantique (ex : champ lexical de la guerre)" },
    { q: "Ironie : définition et effet ?", a: "Dire le contraire de ce qu'on pense — effet satirique, critique, comique ou amer" },
    { q: "Oxymore : définition et exemple ?", a: "Alliance de mots contradictoires — ex: 'un illustre inconnu', 'cette obscure clarté'" },
    { q: "Anaphore : définition et effet ?", a: "Répétition en début de vers/phrase — crée rythme, insistance, émotion" },
    { q: "Métonymie vs synecdoque ?", a: "Métonymie : désigner par contiguïté (boire un verre). Synecdoque : partie pour le tout (voile pour bateau)" },
    { q: "Qu'est-ce que l'écriture d'invention au bac ?", a: "Produire un texte créatif en respectant genre, ton, contraintes données — valorise créativité + maîtrise" },
    { q: "Références obligatoires pour la dissertation de français ?", a: "Au moins 1 œuvre du programme + autres lectures personnelles + exemples précis et datés" },
  ]},
] as FlashPack[];

// ─── Icônes & couleurs par matière ───────────────────────────────────────────
const SUBJECT_META: Record<string, { icon: React.ElementType; color: string }> = {
  'Maths':             { icon: Calculator,    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  'Physique-Chimie':   { icon: FlaskConical,  color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400' },
  'SVT':               { icon: FlaskConical,  color: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400' },
  'Histoire-Géographie': { icon: ScrollText,  color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  'Français':          { icon: BookOpen,      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  'Philosophie':       { icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
  'Langues':           { icon: Languages,     color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  'Géographie':        { icon: Globe2,        color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400' },
};
const getMeta = (subject: string) => SUBJECT_META[subject] ?? { icon: BookOpen, color: 'text-muted-foreground bg-muted' };

// ─── Bibliothèque : sélection par onglet matière ─────────────────────────────
const FlashLibrary: React.FC<{
  subjects: string[];
  onImport: (pack: FlashPack) => void;
}> = React.memo(({ subjects, onImport }) => {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [dbPacks, setDbPacks] = useState<{ id: string; name: string; subject: string; niveau: string; card_count: number }[]>([]);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Charger les packs depuis Supabase au montage
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('edu_flashcard_packs')
          .select('id, name, matiere, niveau, card_count')
          .order('matiere')
          .limit(500);
        if (!error && data && data.length > 0) {
          const uniq = [...new Set(data.map((p: { matiere: string }) => p.matiere))].sort();
          setDbSubjects(uniq);
          setDbPacks(data.map((p: { id: string; name: string; matiere: string; niveau: string; card_count: number }) => ({
            id: p.id,
            name: p.name,
            subject: p.matiere,
            niveau: p.niveau,
            card_count: p.card_count ?? 0,
          })));
        }
      } catch { /* fallback silencieux */ }
    })();
  }, []);

  const availableSubjects = dbSubjects.length > 0
    ? dbSubjects.filter(s => !subjects.length || subjects.includes(s))
    : [...new Set(FLASH_PACKS.map(p => p.subject))].filter(s => !subjects.length || subjects.includes(s));

  const filtered = activeSubject
    ? (dbPacks.filter(p => p.subject === activeSubject).length > 0
        ? dbPacks.filter(p => p.subject === activeSubject)
        : FLASH_PACKS.filter(p => p.subject === activeSubject).map(p => ({
            id: p.name, name: p.name, subject: p.subject as string, niveau: p.level, card_count: p.cards.length,
          })))
    : [];

  const handleImportDb = async (pack: { id: string; name: string; subject: string; niveau: string; card_count: number }) => {
    // Essayer chargement depuis Supabase
    setLoadingPack(pack.id);
    try {
      const { data, error } = await supabase
        .from('edu_flashcards')
        .select('question, reponse')
        .eq('pack_id', pack.id)
        .limit(500);
      if (!error && data && data.length > 0) {
        onImport({
          name: pack.name,
          subject: pack.subject as Subject,
          level: pack.niveau,
          cards: data.map((c: { question: string; reponse: string }) => ({ q: c.question, a: c.reponse })),
        });
        setLoadingPack(null);
        return;
      }
    } catch { /* fallback */ }
    // Fallback local
    const local = FLASH_PACKS.find(p => p.name === pack.name);
    if (local) onImport(local);
    setLoadingPack(null);
  };

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          Bibliothèque — packs du programme officiel
        </CardTitle>
        <p className="text-xs text-muted-foreground">Importe un pack en un clic — toutes les matières du collège au lycée.</p>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {/* Onglets matières */}
        <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
          <div className="flex gap-1.5 min-w-max">
            {availableSubjects.map(subj => {
              const meta = getMeta(subj);
              const Icon = meta.icon;
              const active = activeSubject === subj;
              return (
                <button key={subj} type="button"
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

        {/* Packs de la matière sélectionnée */}
        {activeSubject && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map(pack => {
              const meta = getMeta(pack.subject);
              const Icon = meta.icon;
              const isLoading = loadingPack === pack.id;
              return (
                <button key={pack.id} type="button"
                  disabled={isLoading}
                  onClick={() => handleImportDb(pack)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/40 transition-all text-left group disabled:opacity-60"
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors text-pretty">{pack.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? 'Chargement…' : `${pack.card_count} cartes · ${pack.niveau}`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        )}

        {!activeSubject && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Sélectionne une matière pour voir les packs disponibles
          </p>
        )}
      </CardContent>
    </Card>
  );
});
FlashLibrary.displayName = 'FlashLibrary';

const FlashcardsPage: React.FC = () => {
  const { level, decks, addDeck, deleteDeck, flashcards, addFlashcard, importPackCards, deleteFlashcard, reviewFlashcard } = useApp();
  const subjects = getSubjectsForLevel(level);
  const today = new Date().toISOString().split('T')[0];

  // ── État local ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>('list');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [deckForm, setDeckForm] = useState({ name: '', subject: subjects[0] as Subject });
  const [cardForm, setCardForm] = useState({ question: '', answer: '' });
  const [studyIndex, setStudyIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // ── Génération IA de flashcards supprimée — contenu 100 % humain ──────────────

  const activeDeck = decks.find(d => d.id === activeDeckId);
  const deckCards = flashcards.filter(c => c.deckId === activeDeckId);
  const dueCards = deckCards.filter(c => c.nextReview <= today);
  const studyCard = dueCards[studyIndex] ?? null;

  // ── Stats globales ───────────────────────────────────────────────────────────
  const totalCards = flashcards.length;
  const easyCards = flashcards.filter(c => c.difficulty === 'easy').length;
  const hardCards = flashcards.filter(c => c.difficulty === 'hard').length;
  const todayDue = flashcards.filter(c => c.nextReview <= today).length;
  const masteryPct = totalCards > 0 ? Math.round((easyCards / totalCards) * 100) : 0;

  const deckStats = useMemo(() => decks.map(deck => {
    const cards = flashcards.filter(c => c.deckId === deck.id);
    const due = cards.filter(c => c.nextReview <= today).length;
    return { ...deck, total: cards.length, due };
  }), [decks, flashcards, today]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCreateDeck = () => {
    if (!deckForm.name.trim()) return;
    addDeck({ name: deckForm.name.trim(), subject: deckForm.subject, level });
    setDeckForm({ name: '', subject: subjects[0] as Subject });
    setShowNewDeck(false);
  };

  const handleCreateCard = () => {
    if (!cardForm.question.trim() || !cardForm.answer.trim() || !activeDeckId) return;
    addFlashcard({ deckId: activeDeckId, question: cardForm.question.trim(), answer: cardForm.answer.trim(), difficulty: 'medium' });
    setCardForm({ question: '', answer: '' });
    setShowNewCard(false);
  };

  const handleReview = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!studyCard) return;
    reviewFlashcard(studyCard.id, difficulty);
    setRevealed(false);
    if (studyIndex + 1 >= dueCards.length) {
      setView('list');
      setStudyIndex(0);
    } else {
      setStudyIndex(i => i + 1);
    }
  };

  const startStudy = (deckId: string) => {
    // Remonter en haut AVANT le changement de vue — la vue 'study' est plus courte
    // que la liste, si le scroll est à mi-page on se retrouverait sur le footer.
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveDeckId(deckId);
    setStudyIndex(0);
    setRevealed(false);
    setView('study');
  };

  // ── Navigation clavier (Space = révéler/évaluer, Flèches = évaluation) ──────
  React.useEffect(() => {
    if (view !== 'study') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      }
      if (revealed) {
        if (e.key === '1') handleReview('hard');
        if (e.key === '2') handleReview('medium');
        if (e.key === '3') handleReview('easy');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, revealed, studyCard]);

  // useCallback stable → FlashLibrary (React.memo) ne re-rend pas à chaque render parent
  // IMPORTANT : doit être déclaré AVANT les early returns conditionnels (Rules of Hooks)
  const handleImport = useCallback((pack: FlashPack) => {
    const deckId = addDeck({ name: pack.name, subject: pack.subject, level });
    importPackCards(pack.cards.map(c => ({ deckId, question: c.q, answer: c.a, difficulty: 'medium' as const })));
    toast.success(`Pack "${pack.name}" importé — ${pack.cards.length} cartes ajoutées ! 🃏`);
  }, [addDeck, importPackCards, level]);

  // ── Vue : Étude ───────────────────────────────────────────────────────────────
  if (view === 'study' && activeDeck) {
    const done   = studyIndex;
    const total  = dueCards.length;
    const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-4 px-4 py-6">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5"
            onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setView('list'); setStudyIndex(0); }}>
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{activeDeck.name}</p>
            <p className="text-xs text-muted-foreground">{done}/{total} cartes révisées</p>
          </div>
          <Badge variant="secondary" className="shrink-0">{total - done} restantes</Badge>
        </div>

        {/* Barre de progression */}
        <div className="space-y-1">
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{pct}% terminé</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">Espace</kbd> révéler ·
              <kbd className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">1</kbd>
              <kbd className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">2</kbd>
              <kbd className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">3</kbd> évaluer
            </span>
          </div>
        </div>

        {studyCard ? (
          <div className="space-y-4">
            {/* Carte principale */}
            <Card className="shadow-card min-h-[200px] flex flex-col">
              <div className="border-b border-border px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Question</span>
                <Badge variant="outline" className="text-xs">
                  {studyCard.difficulty === 'easy' ? '🟢 Facile' : studyCard.difficulty === 'hard' ? '🔴 Difficile' : '🟡 Moyen'}
                </Badge>
              </div>
              <CardContent className="flex-1 flex items-center justify-center p-6">
                <p className="text-lg md:text-xl font-semibold text-foreground text-center text-balance leading-relaxed">
                  {studyCard.question}
                </p>
              </CardContent>
            </Card>

            {/* Zone réponse */}
            {!revealed ? (
              <div className="text-center space-y-3">
                <Button onClick={() => setRevealed(true)} size="lg" className="w-full md:w-auto gap-2 h-12">
                  <Eye className="w-4 h-4" /> Révéler la réponse
                </Button>
                <p className="text-xs text-muted-foreground">ou appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">Espace</kbd></p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Réponse */}
                <Card className="border-success/30 bg-success/5 shadow-none">
                  <div className="border-b border-success/20 px-5 py-2.5 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold text-success uppercase tracking-wide">Réponse</span>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-base text-foreground font-medium text-pretty leading-relaxed">
                      {studyCard.answer}
                    </p>
                  </CardContent>
                </Card>

                {/* Évaluation */}
                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground font-medium">Comment tu t'en es sorti ?</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button"
                      onClick={() => handleReview('hard')}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors group min-h-[80px]"
                      aria-label="Difficile — revoir dans 1 jour"
                    >
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span className="text-sm font-semibold text-destructive">Difficile</span>
                      <span className="text-[11px] text-muted-foreground">+1 jour · <kbd className="font-mono opacity-60">1</kbd></span>
                    </button>
                    <button type="button"
                      onClick={() => handleReview('medium')}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-colors group min-h-[80px]"
                      aria-label="Moyen — revoir dans 3 jours"
                    >
                      <Clock className="w-5 h-5 text-warning" />
                      <span className="text-sm font-semibold text-warning">Moyen</span>
                      <span className="text-[11px] text-muted-foreground">+3 jours · <kbd className="font-mono opacity-60">2</kbd></span>
                    </button>
                    <button type="button"
                      onClick={() => handleReview('easy')}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-colors group min-h-[80px]"
                      aria-label="Facile — revoir dans 7 jours"
                    >
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm font-semibold text-success">Facile</span>
                      <span className="text-[11px] text-muted-foreground">+7 jours · <kbd className="font-mono opacity-60">3</kbd></span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Session terminée */
          <Card className="shadow-card">
            <CardContent className="py-12 text-center space-y-4">
              <span className="text-5xl block">🎉</span>
              <div>
                <p className="text-xl font-bold text-foreground">Session terminée !</p>
                <p className="text-sm text-muted-foreground mt-1">Tu as révisé toutes les cartes dues pour aujourd'hui.</p>
              </div>
              <p className="text-sm text-muted-foreground text-pretty max-w-xs mx-auto">
                L'algorithme SM-2 a programmé tes prochaines révisions. Reviens demain !
              </p>
              <Button onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setView('list'); setStudyIndex(0); }}
                className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Retour aux decks
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Vue : Gestion d'un deck ──────────────────────────────────────────────────
  if (view === 'manage' && activeDeck) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 px-4 py-6">
        {/* En-tête */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" className="gap-1.5"
            onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setView('list'); }}>
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{activeDeck.name}</p>
            <p className="text-xs text-muted-foreground">{deckCards.length} carte{deckCards.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {deckCards.length > 0 && (
              <ExportButton
                fileName={`flashcards-${activeDeck.name.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`}
                variant="outline" size="sm" label="Exporter"
                getContent={() => ({
                  title: `Flashcards — ${activeDeck.name}`,
                  subtitle: `Matière : ${activeDeck.subject} · ${deckCards.length} carte${deckCards.length > 1 ? 's' : ''}`,
                  sections: deckCards.map((c, i) => ({
                    heading: `Carte ${i + 1} — ${c.question}`,
                    body: `Réponse : ${c.answer}\nDifficulté : ${c.difficulty === 'easy' ? 'Facile' : c.difficulty === 'hard' ? 'Difficile' : 'Moyen'}`,
                  })),
                })}
              />
            )}
            <Button size="sm" className="gap-1.5" onClick={() => setShowNewCard(true)}>
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </div>
        </div>

        {/* Légende difficultés */}
        <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
          {[
            { label: 'Facile', cls: 'bg-success/10 text-success border-success/30' },
            { label: 'Moyen', cls: 'bg-warning/10 text-warning border-warning/30' },
            { label: 'Difficile', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
          ].map(d => (
            <span key={d.label} className={`px-2 py-0.5 rounded-full border text-xs font-medium ${d.cls}`}>{d.label}</span>
          ))}
          <span className="text-muted-foreground self-center">— niveau de mémorisation actuel</span>
        </div>

        {/* Liste des cartes */}
        {deckCards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="font-semibold text-foreground">Aucune carte dans ce deck</p>
              <p className="text-sm text-muted-foreground">Commence par ajouter ta première flashcard.</p>
              <Button onClick={() => setShowNewCard(true)} className="gap-1.5">
                <Plus className="w-4 h-4" /> Créer une carte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {deckCards.map((card, i) => (
              <Card key={card.id} className="hover:bg-secondary/30 transition-colors">
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  <span className="text-xs text-muted-foreground font-mono shrink-0 pt-0.5 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground text-pretty">{card.question}</p>
                    <p className="text-sm text-muted-foreground text-pretty line-clamp-2">{card.answer}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                      card.difficulty === 'easy'   ? 'bg-success/10 text-success border-success/30' :
                      card.difficulty === 'hard'   ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                                     'bg-warning/10 text-warning border-warning/30'
                    }`}>
                      {card.difficulty === 'easy' ? 'Facile' : card.difficulty === 'hard' ? 'Difficile' : 'Moyen'}
                    </span>
                    <button type="button"
                      onClick={() => deleteFlashcard(card.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      aria-label={`Supprimer : ${card.question}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog nouvelle carte */}
        <Dialog open={showNewCard} onOpenChange={setShowNewCard}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle flashcard</DialogTitle>
              <DialogDescription className="sr-only">Créer une nouvelle carte question / réponse.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Question (recto)</Label>
                <Textarea placeholder="Ex : Quelle est la formule de l'eau ?" value={cardForm.question}
                  onChange={e => setCardForm(f => ({ ...f, question: e.target.value }))} rows={2} className="px-3" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Réponse (verso)</Label>
                <Textarea placeholder="Ex : H₂O — deux atomes d'hydrogène, un atome d\'oxygène" value={cardForm.answer}
                  onChange={e => setCardForm(f => ({ ...f, answer: e.target.value }))} rows={2} className="px-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewCard(false)}>Annuler</Button>
              <Button onClick={handleCreateCard} disabled={!cardForm.question.trim() || !cardForm.answer.trim()}>Créer la carte</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Vue : Liste des decks ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 min-w-0 w-full max-w-5xl mx-auto px-4 md:px-5 py-4 md:py-6">
      <h1 className="sr-only">Flashcards — Répétition espacée</h1>
      <SEO
        title="Flashcards gratuits — Mémorisez 2× plus vite, répétition espacée | Apprenix"
        description="Créez et révisez vos flashcards avec la répétition espacée SM-2. Mémorisez vocabulaire, dates et formules 2× plus vite. Gratuit."
        canonical="/flashcards"
        keywords="flashcards répétition espacée gratuit, révision intelligente, mémorisation scolaire, cartes mémoire, alternative Anki gratuit"
        dateModified="2026-06-20"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Révision par flashcards — Apprenix",
          "description": "Système de flashcards avec algorithme de répétition espacée pour mémoriser efficacement toutes les matières scolaires.",
          "url": "https://apprenix.xyz/flashcards",
          "provider": { "@type": "Organization", "name": "Apprenix", "url": "https://apprenix.xyz" },
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
          "educationalLevel": "CP, Collège, Lycée, Université",
          "inLanguage": "fr-FR",
          "isAccessibleForFree": true,
        }}
      />

      <PageHero
        variant="tool"
        icon={BookOpen}
        badge={<>🃏 Flashcards</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Flashcards — Mémorisez 2× plus vite"
        subtitle="156 packs du programme officiel · 96 846 cartes vérifiées · Du CP au Bac+5. Importe un pack ou crée les tiens, puis révise avec l'algorithme de répétition espacée SM-2."
        stats={[
          { value: '96 846', label: 'flashcards vérifiées' },
          { value: '156',    label: 'packs officiels' },
          { value: 'SM-2',   label: 'Algorithme scientifique' },
        ]}
        cta={{ label: 'Nouveau deck', onClick: () => setShowNewDeck(true) }}
      >
        <ENBadge />
      </PageHero>

      {/* ── Bannière "à réviser aujourd'hui" ── */}
      {todayDue > 0 && (
        <Card className="border-warning/30 bg-warning/5 shadow-none">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-warning shrink-0" />
            <p className="text-sm text-foreground flex-1 min-w-0">
              <span className="font-semibold">{todayDue} carte{todayDue > 1 ? 's' : ''}</span> à réviser aujourd'hui — lance une session pour ne pas perdre ta progression !
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Stats globales ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'À réviser aujourd\'hui', value: todayDue,     icon: Clock,       color: 'text-warning' },
          { label: 'Cartes maîtrisées',      value: easyCards,   icon: CheckCircle, color: 'text-success' },
          { label: 'Cartes difficiles',      value: hardCards,   icon: AlertCircle, color: 'text-destructive' },
          { label: 'Taux de maîtrise',       value: `${masteryPct}%`, icon: BarChart3, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="h-full shadow-none border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-muted`}>
                <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground text-balance leading-snug">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Bibliothèque ── */}
      <FlashLibrary subjects={subjects} onImport={handleImport} />

      {/* ── Mes decks ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Mes decks ({decks.length})</h2>
          <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={() => setShowNewDeck(true)}>
            <Plus className="w-3.5 h-3.5" /> Nouveau deck
          </Button>
        </div>

        {decks.length === 0 ? (
          <Card>
            <CardContent className="py-12 md:py-20 text-center space-y-3">
              <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <p className="text-lg font-semibold text-foreground">Aucun deck pour l'instant</p>
              <p className="text-sm text-muted-foreground text-pretty max-w-xs mx-auto">
                Importe un pack depuis la bibliothèque ou crée ton propre deck de zéro.
              </p>
              <Button onClick={() => setShowNewDeck(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Créer mon premier deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deckStats.map(deck => {
              const meta    = getMeta(deck.subject);
              const Icon    = meta.icon;
              const mastery = deck.total > 0
                ? Math.round((flashcards.filter(c => c.deckId === deck.id && c.difficulty === 'easy').length / deck.total) * 100)
                : 0;

              return (
                <Card key={deck.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm text-balance leading-snug">{deck.name}</CardTitle>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs py-0">{deck.subject}</Badge>
                          <Badge variant="outline" className="text-xs py-0">{deck.level}</Badge>
                        </div>
                      </div>
                      <button type="button"
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                        onClick={() => deleteDeck(deck.id)}
                        aria-label={`Supprimer le deck ${deck.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-3">
                    {/* Stats du deck */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{deck.total} carte{deck.total !== 1 ? 's' : ''}</span>
                        <span className="font-medium text-foreground">{mastery}% maîtrisé</span>
                      </div>
                      <Progress value={mastery} className="h-1.5" />
                      {deck.due > 0 && (
                        <p className="text-xs text-warning font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {deck.due} carte{deck.due > 1 ? 's' : ''} à réviser
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Button size="sm" className="flex-1 gap-1.5"
                        disabled={deck.due === 0}
                        onClick={() => startStudy(deck.id)}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {deck.due > 0 ? `Étudier (${deck.due})` : '✓ À jour'}
                      </Button>
                      <button type="button"
                        className="px-3 rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[36px] flex items-center justify-center"
                        onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setActiveDeckId(deck.id); setView('manage'); }}
                        aria-label={`Gérer les cartes du deck ${deck.name}`}
                        title="Gérer les cartes"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Dialog nouveau deck ── */}
      <Dialog open={showNewDeck} onOpenChange={setShowNewDeck}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau deck de flashcards</DialogTitle>
            <DialogDescription className="sr-only">Créer un nouveau deck pour organiser vos flashcards par matière.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="deck-name" className="text-sm font-medium">Nom du deck</Label>
              <Input id="deck-name" placeholder="ex : Formules de Physique" value={deckForm.name}
                onChange={e => setDeckForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && deckForm.name.trim() && handleCreateDeck()}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Matière</Label>
              <Select value={deckForm.subject} onValueChange={v => setDeckForm(f => ({ ...f, subject: v as Subject }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDeck(false)}>Annuler</Button>
            <Button onClick={handleCreateDeck} disabled={!deckForm.name.trim()}>Créer le deck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashcardsPage;
