import {
  Accessibility,
  ArrowRight, Award, BadgeCheck,
  BarChart2, BookOpen,
  Brain, Calculator,
  Calendar, CheckCircle, Clock, CreditCard, Crown, Eye, FileText, Flame, GitBranch, Globe, GraduationCap,
  Heart, HelpCircle, Languages, Leaf,
  Lightbulb, Lock, Mail, MessageSquare, Minus, Newspaper, PenLine, Rocket, ScanLine, School, ShieldCheck,
  Sparkles, Timer, Trophy, Users, X, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CommentCard from '@/components/community/CommentCard';
import ReviewForm from '@/components/community/ReviewForm';
import PwaInstallSection from '@/components/PwaInstallSection';
import SEO from '@/components/SEO';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { useComments } from '@/hooks/useComments';
import { getLevelCategory, getLevelCategoryLabel } from '@/lib/levelUtils';
import { cn } from '@/lib/utils';

// ─── Données statiques ────────────────────────────────────────────────────────

// Prefetch silencieux — source unique dans src/lib/prefetch.ts
import { prefetchRoute } from '@/lib/prefetch';

// ─── Catégories d'outils ──────────────────────────────────────────────────────
const TOOL_CATEGORIES = [
  { id: 'aide',        label: 'Aide & Recherche',        icon: Brain,      color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/20', desc: 'Trouver des réponses immédiatement'   },
  { id: 'apprendre',   label: 'Apprendre & Mémoriser',   icon: CreditCard, color: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/20', desc: 'Ancrer le savoir durablement'          },
  { id: 'matieres',    label: 'Outils Matières',          icon: Calculator, color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/20', desc: 'Spécialisés par discipline'            },
  { id: 'organiser',   label: 'Organiser & Prendre notes',icon: Calendar,   color: 'text-primary', bg: 'bg-primary/10',  border: 'border-primary/20',  desc: 'Structurer son travail et ses idées'  },
  { id: 'performance', label: 'Concentration & Examen',   icon: Timer,      color: 'text-chart-5', bg: 'bg-chart-5/10', border: 'border-chart-5/20', desc: 'Performer au bon moment'              },
] as const;
type ToolCategoryId = typeof TOOL_CATEGORIES[number]['id'];

// 13 outils pédagogiques — regroupés par catégorie pour meilleure lisibilité
const TOOLS: { path: string; icon: React.ElementType; label: string; desc: string; color: string; bg: string; category: ToolCategoryId }[] = [
  // ── Aide & Recherche ──────────────────────────────────────────────────────
  { path: '/aide-ia',        icon: Brain,         label: 'Aide aux devoirs',        desc: 'Fiches méthode pas-à-pas + ressources vérifiées, toutes matières',      color: 'text-chart-1', bg: 'bg-chart-1/10', category: 'aide'        },
  { path: '/scanner',        icon: ScanLine,      label: 'Scanner de devoirs',      desc: 'Photo ton exercice → explication instantanée',                          color: 'text-chart-1', bg: 'bg-chart-1/10', category: 'aide'        },
  { path: '/base-reponses',  icon: MessageSquare, label: 'Base de réponses',        desc: '100 000 réponses vérifiées par des enseignants — du CP au Bac+5',       color: 'text-chart-1', bg: 'bg-chart-1/10', category: 'aide'        },
  // ── Apprendre & Mémoriser ─────────────────────────────────────────────────
  { path: '/ressources',     icon: BookOpen,      label: 'Ressources pédagogiques', desc: 'Résumés, fiches, annales, méthodes et outil Remix',                     color: 'text-chart-2', bg: 'bg-chart-2/10', category: 'apprendre'   },
  { path: '/flashcards',     icon: CreditCard,    label: 'Flashcards',              desc: 'Révision espacée Anki-style — mémorise durablement',                    color: 'text-chart-2', bg: 'bg-chart-2/10', category: 'apprendre'   },
  { path: '/quiz',           icon: HelpCircle,    label: 'Quiz interactif',         desc: 'Crée tes questions, passe le quiz, obtiens ton score instantané',       color: 'text-chart-2', bg: 'bg-chart-2/10', category: 'apprendre'   },
  // ── Outils Matières ───────────────────────────────────────────────────────
  { path: '/linguistique',   icon: Languages,     label: 'Outils Linguistiques',    desc: 'Dictionnaire, conjugueur, correcteur, traducteur',                      color: 'text-chart-4', bg: 'bg-chart-4/10', category: 'matieres'    },
  { path: '/maths-sciences', icon: Calculator,    label: 'Maths & Sciences',        desc: 'Calculatrice scientifique, formules, tableau périodique',               color: 'text-chart-4', bg: 'bg-chart-4/10', category: 'matieres'    },
  // ── Organiser & Prendre notes ─────────────────────────────────────────────
  { path: '/organisation',   icon: Calendar,      label: 'Organisation',            desc: 'Agenda, planning, to-do list et Pomodoro Deep Focus',                   color: 'text-primary', bg: 'bg-primary/10',  category: 'organiser'   },
  { path: '/notes',          icon: FileText,      label: 'Notes personnelles',      desc: 'Wiki personnel — organise, recherche et exporte tes notes',             color: 'text-primary', bg: 'bg-primary/10',  category: 'organiser'   },
  { path: '/carte-mentale',  icon: GitBranch,     label: 'Carte mentale',           desc: 'Organise tes idées visuellement — sauvegarde auto, export',             color: 'text-primary', bg: 'bg-primary/10',  category: 'organiser'   },
  // ── Concentration & Examen ────────────────────────────────────────────────
  { path: '/focus',          icon: Zap,           label: 'Mode Deep Work',          desc: 'Sessions chronomètrées, musique focus, blocage distractions',           color: 'text-chart-5', bg: 'bg-chart-5/10', category: 'performance' },
  { path: '/examen',         icon: Timer,         label: 'Mode Examen',             desc: 'Minuterie personnalisable, checklist, conseils anti-stress',             color: 'text-chart-5', bg: 'bg-chart-5/10', category: 'performance' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: School,
    title: 'Choisissez votre niveau et votre matière',
    desc: "Sélectionnez votre classe (CP → Bac+5) et la matière concernée. Apprenix adapte instantanément les outils, le vocabulaire et les fiches méthode à votre programme officiel.",
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    bar: 'bg-chart-4',
    details: [
      'Du CP à Bac+5 — tous niveaux et filières',
      'Toutes les matières : Maths, Français, Histoire, Anglais, Physique-Chimie, SVT, Philo, NSI…',
      'Programme personnalisé selon votre classe (Brevet, Bac, BTS, Licence)',
    ],
  },
  {
    step: '02',
    icon: ScanLine,
    title: 'Posez votre question ou scannez un exercice',
    desc: "Tapez votre question en français, collez un extrait de cours, ou photographiez directement un exercice avec votre téléphone. L'IA analyse le contenu en quelques secondes.",
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    bar: 'bg-chart-3',
    details: [
      'Saisie texte libre — posez la question dans vos mots',
      'Scanner photo — photographiez une feuille d\'exercice ou un manuel',
      'Copier-coller — depuis un PDF, un email ou l\'ENT',
    ],
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'L\'IA explique étape par étape, sans faire à votre place',
    desc: "L'assistant Apprenix ne donne jamais la réponse directement : il guide l'élève à travers le raisonnement, identifie les erreurs et propose des exercices similaires pour consolider.",
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    bar: 'bg-chart-1',
    details: [
      'Mode socratique — questions guidées pour construire le raisonnement',
      'Explications adaptées au niveau : CP ou Terminale, jamais le même discours',
      'Identification des erreurs fréquentes et des blocages spécifiques',
    ],
  },
  {
    step: '04',
    icon: BookOpen,
    title: 'Créez vos flashcards et révisez en répétition espacée',
    desc: "En 1 clic, transformez n'importe quelle explication en cartes de mémorisation. L'algorithme de répétition espacée vous repose chaque carte au bon moment pour retenir sans effort.",
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    bar: 'bg-chart-2',
    details: [
      'Génération automatique depuis une explication ou un cours',
      'Algorithme SM-2 — même système qu\'Anki, 100 % gratuit',
      'Synchronisé sur tous vos appareils (téléphone, tablette, PC)',
    ],
  },
  {
    step: '05',
    icon: Trophy,
    title: 'Suivez votre progression et restez motivé',
    desc: "Chaque session compte : XP gagnés, série de jours consécutifs, badges débloqués, défis quotidiens. Votre tableau de bord affiche vos points forts et les chapitres à renforcer.",
    color: 'text-primary',
    bg: 'bg-primary/10',
    bar: 'bg-primary',
    details: [
      'Tableau de bord personnel — matières maîtrisées et chapitres à revoir',
      'Streaks et badges — restez motivé chaque jour',
      'Planning de révision intelligent — adapté à vos prochaines épreuves',
    ],
  },
];

type CompVal = true | false | 'partial';
interface CompRow { feature: string; apprenix: true; chatgpt: CompVal; quizlet: CompVal; brainly: CompVal; khan: CompVal; note?: string; detail?: string; }

const COMPARISON_ROWS: CompRow[] = [
  { feature: 'Mode guidé — comprendre, pas copier',     apprenix: true, chatgpt: false,     quizlet: 'partial', brainly: false,     khan: 'partial', detail: "Les autres outils donnent la réponse directement. Apprenix explique la méthode étape par étape." },
  { feature: 'Scanner de cours + OCR structuré',        apprenix: true, chatgpt: 'partial', quizlet: false,     brainly: false,     khan: false,     detail: "Scannez une fiche papier et obtenez un résumé structuré en secondes. Aucun autre outil scolaire ne le fait." },
  { feature: 'Flashcards + répétition espacée (SM-2)',  apprenix: true, chatgpt: false,     quizlet: true,      brainly: false,     khan: false,     detail: "Quizlet le propose aussi, mais en version payante. Sur Apprenix c'est 100 % gratuit et illimité." },
  { feature: 'Planning & agenda scolaire intégrés',     apprenix: true, chatgpt: false,     quizlet: false,     brainly: false,     khan: false,     detail: "Aucun concurrent ne combine révisions + planning dans une seule application. Apprenix oui." },
  { feature: 'Mode Examen + Quiz interactif',           apprenix: true, chatgpt: false,     quizlet: 'partial', brainly: false,     khan: 'partial', detail: "Minuterie, checklist anti-stress, conseils de dernière minute — pensé pour le jour J." },
  { feature: 'Mode ULIS / SEGPA — inclusion',          apprenix: true, chatgpt: false,     quizlet: false,     brainly: false,     khan: false,     detail: "Apprenix est la seule plateforme avec un mode dédié aux élèves en situation de handicap ou SEGPA." },
  { feature: 'Compte optionnel — accès immédiat',       apprenix: true, chatgpt: false,     quizlet: false,     brainly: false,     khan: true,      detail: "Pas besoin de créer un compte pour commencer. Ouvrez le site et utilisez tous les outils." },
  { feature: 'Fiches méthode & assistant guidé (pas généraliste)', apprenix: true, chatgpt: false, quizlet: false, brainly: false, khan: 'partial', detail: "Les fiches méthode Apprenix suivent les programmes officiels français. L'assistant guide étape par étape sans écrire à la place de l'élève." },
];

// ─── Compteur animé 100K+ ─────────────────────────────────────────────────────
interface AnimatedCounterProps { target: number; duration?: number; suffix?: string; className?: string }
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, duration = 1800, suffix = '', className }) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(ease * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <span className={className}>{display.toLocaleString('fr-FR')}{suffix}</span>;
};

// ─── Barre de stats réelles ───────────────────────────────────────────────────
const REAL_STATS = [
  { value: 96846, suffix: '', label: 'flashcards', icon: CreditCard, color: 'text-chart-2', bg: 'bg-chart-2/10' },
  { value: 3064,  suffix: '', label: 'quiz',       icon: HelpCircle, color: 'text-chart-1', bg: 'bg-chart-1/10' },
  { value: 156,   suffix: '', label: 'packs',      icon: BookOpen,   color: 'text-chart-4', bg: 'bg-chart-4/10' },
  { value: 27,    suffix: '', label: 'fiches',     icon: FileText,   color: 'text-chart-3', bg: 'bg-chart-3/10' },
] as const;

const StatsBar: React.FC<{ animate?: boolean }> = ({ animate = false }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    {REAL_STATS.map(({ value, suffix, label, icon: Icon, color, bg }) => (
      <div key={label} className={`flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 p-3 md:p-4 ${bg} hover:shadow-md transition-shadow`}>
        <div className={`w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm`}>
          <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
        </div>
        <p className={`text-xl md:text-2xl 2xl:text-3xl 3xl:text-4xl font-black tabular-nums leading-none ${color}`}>
          {animate ? <AnimatedCounter target={value} suffix={suffix} /> : <>{value.toLocaleString('fr-FR')}{suffix}</>}
        </p>
        <p className="text-xs md:text-sm text-muted-foreground font-semibold capitalize">{label}</p>
      </div>
    ))}
  </div>
);

// ─── Widget Révision du jour (membres) ────────────────────────────────────────
const RevisionDuJourWidget: React.FC = () => {
  const { flashcards, decks, todos } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const dueCards   = flashcards.filter(c => c.nextReview <= today);
  const urgentTodos = todos.filter(t => !t.completed && t.dueDate && t.dueDate <= today);
  const total = dueCards.length + urgentTodos.length;
  if (total === 0) return null;
  const xpPotential = dueCards.length * 5 + urgentTodos.length * 10;

  return (
    <Card className="shadow-card border-l-4 border-l-chart-1 bg-gradient-to-r from-chart-1/5 to-transparent">
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-chart-1/15 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-chart-1" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-foreground">Révision du jour</p>
                <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-xs">
                  {total} action{total > 1 ? 's' : ''} en attente
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  +{xpPotential} XP potentiel
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {dueCards.length > 0 && `${dueCards.length} flashcard${dueCards.length > 1 ? 's' : ''} à réviser`}
                {dueCards.length > 0 && urgentTodos.length > 0 && ' · '}
                {urgentTodos.length > 0 && `${urgentTodos.length} tâche${urgentTodos.length > 1 ? 's' : ''} urgente${urgentTodos.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {dueCards.length > 0 && (
              <Link to="/flashcards">
                <Button size="sm" className="h-9 text-xs font-semibold">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Réviser ({dueCards.length})
                </Button>
              </Link>
            )}
            {urgentTodos.length > 0 && (
              <Link to="/organisation">
                <Button size="sm" variant="outline" className="h-9 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Tâches urgentes
                </Button>
              </Link>
            )}
          </div>
        </div>
        {dueCards.length > 0 && (() => {
          const mostUrgentDeck = decks.find(d => d.id === dueCards[0]?.deckId);
          if (!mostUrgentDeck) return null;
          const deckCards = flashcards.filter(c => c.deckId === mostUrgentDeck.id);
          const mastered = deckCards.filter(c => c.reviewCount >= 3).length;
          const pct = deckCards.length ? Math.round((mastered / deckCards.length) * 100) : 0;
          return (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-chart-1" />
                  Deck : <span className="font-medium text-foreground ml-1">{mostUrgentDeck.name}</span>
                </span>
                <span>{mastered}/{deckCards.length} · {pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

// ─── Vue VISITEUR ─────────────────────────────────────────────────────────────
const VisitorView: React.FC = () => {
  const { level } = useApp();
  const { reviews, addReview, likeReview } = useComments();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  return (
    <>
    <div className="min-w-0 space-y-6 md:space-y-10 2xl:space-y-14">

      {/* ══ 1. HERO ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden animate-fade-up -mx-4 md:-mx-5 lg:-mx-6 xl:-mx-8 2xl:-mx-12 -mt-4 md:-mt-5 lg:-mt-6 xl:-mt-8 2xl:-mt-12 text-white bg-gradient-primary max-w-[100vw]"
        style={{ isolation: 'isolate' }}
        aria-label="Présentation Apprenix"
      >
        {/* Décor subtil */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/[0.05] blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-white/[0.04] blur-2xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>
        </div>

        {/* Layout hero — 2 colonnes desktop, 1 colonne mobile */}
        <div className="relative z-10 max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center px-5 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20 xl:px-20 xl:py-24 2xl:px-24 2xl:py-28 gap-10 lg:gap-16 xl:gap-24">

          {/* ── Colonne gauche — message principal ── */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0">

            {/* Badge unique et lisible */}
            <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 [text-shadow:0_1px_2px_rgba(0,0,0,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" aria-hidden="true" />
              100 % gratuit · 0 pub · Créé en France 🇫🇷
            </span>

            {/* H1 — clair et direct */}
            <h1 className="text-2xl md:text-5xl lg:text-[3.25rem] xl:text-6xl 2xl:text-7xl font-extrabold text-white leading-[1.08] text-balance mb-4 [text-shadow:0_2px_16px_rgba(0,0,0,0.25)]">
              L'aide scolaire gratuite,{' '}
              <br className="hidden md:block" />
              du CP jusqu'au Bac+5
            </h1>

            {/* Sous-titre — une seule idée claire */}
            <p className="text-white/85 text-base md:text-lg xl:text-xl leading-relaxed text-pretty mb-8 max-w-lg [text-shadow:0_1px_4px_rgba(0,0,0,0.15)]">
              Comprends tes cours, révise avec des flashcards, scanne tes exercices et organise ton planning — sans pub, sans abonnement.
            </p>

            {/* 3 avantages clés — scannables */}
            <ul className="flex flex-col gap-2.5 mb-8 w-full md:w-auto" aria-label="Avantages Apprenix">
              {[
                { icon: Sparkles,      text: '13 outils pédagogiques alignés sur le programme officiel' },
                { icon: Lock,          text: 'Sans compte requis — accès immédiat, sans carte bancaire'  },
                { icon: Accessibility, text: 'Adapté aux élèves DYS, ULIS et SEGPA'                      },
              ].map(({ icon: FIcon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-white/90 text-sm xl:text-base">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <FIcon className="w-3 h-3 text-white shrink-0" aria-hidden="true" />
                  </div>
                  <span className="text-left leading-snug">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTAs — 1 principal, 1 secondaire */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mb-6">
              <Link
                to="/espace"
                className="btn-cta inline-flex items-center justify-center gap-2 font-extrabold text-base xl:text-lg rounded-2xl text-white shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-[transform,box-shadow] duration-200 px-8 xl:px-10 py-4 w-full sm:w-auto min-h-[52px]"
                aria-label="Commencer à utiliser Apprenix gratuitement"
              >
                <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                to="/connexion?mode=inscription"
                className="inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-2xl text-white border border-white/40 hover:bg-white/15 transition-colors px-6 py-4 w-full sm:w-auto min-h-[52px]"
                aria-label="Créer un compte gratuit"
              >
                <Rocket className="w-4 h-4 shrink-0" aria-hidden="true" />
                Créer un compte — gratuit
              </Link>
            </div>

            {/* Garanties courtes */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1.5">
              {[
                { icon: ShieldCheck, label: 'RGPD · données en France' },
                { icon: BadgeCheck,  label: 'Conforme Éduscol'          },
                { icon: CheckCircle, label: 'Aucun abonnement'           },
              ].map(({ icon: TIcon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-white/70 text-xs font-medium">
                  <TIcon className="w-3.5 h-3.5 shrink-0 text-white/50" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>

          </div>

          {/* ── Colonne droite — 4 chiffres clés (desktop uniquement) ── */}
          <div className="hidden md:grid grid-cols-2 gap-3 shrink-0 w-[260px] lg:w-[300px] xl:w-[360px] 2xl:w-[420px]">
            {[
              { value: '100 K+', label: 'ressources vérifiées',   icon: BookOpen,      accent: 'bg-white/15' },
              { value: '96 K+',  label: 'flashcards disponibles', icon: CreditCard,    accent: 'bg-white/15' },
              { value: '3 000+', label: 'quiz interactifs',        icon: HelpCircle,    accent: 'bg-white/15' },
              { value: 'CP–M2',  label: 'tous niveaux couverts',   icon: GraduationCap, accent: 'bg-white/15' },
            ].map(({ value, label, icon: StatIcon, accent }) => (
              <div key={label} className={`${accent} border border-white/20 rounded-2xl p-4 xl:p-5 flex flex-col gap-3`}>
                <StatIcon className="w-5 h-5 xl:w-6 xl:h-6 text-white/70" aria-hidden="true" />
                <div>
                  <p className="text-white font-extrabold text-2xl xl:text-3xl leading-none [text-shadow:0_1px_8px_rgba(0,0,0,0.2)]">{value}</p>
                  <p className="text-white/60 text-xs xl:text-sm mt-1 leading-snug">{label}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══ 2. QUI ÊTES-VOUS ? — 4 profils ════════════════════════════════
          Priorité maximale : décision de navigation du visiteur.
          DYS/ULIS promu en 4e carte (suppression bande démo = doublon
          de la grille outils ci-dessous, suppression barre niveaux =
          doublon des badges sur la carte Élève).                       */}
      <section aria-label="Choisissez votre profil Apprenix">
        <div className="mb-6 section-divider pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full mb-2">
            <Users className="w-3 h-3" aria-hidden="true" />
            Votre espace personnalisé
          </span>
          <h2 className="text-display text-xl md:text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-foreground text-balance mt-1">
            Qui êtes-vous ?
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez votre profil — votre espace et vos outils sont adaptés en un clic.
          </p>
        </div>

        {/* ── 4 cartes profils (Élève / Parent / Enseignant / DYS) ─────────
            DYS/ULIS promu ici (suppression barre niveaux redondante).
            Grille 2×2 sur mobile, 4 colonnes à partir de md.           */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

          {/* Carte Élève */}
          <Link to="/espace" className="group col-span-1 h-full flex">
            <div className="relative flex flex-col w-full rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden hover:border-primary/60 hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer">
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" aria-hidden="true" /> Le plus utilisé
                </span>
              </div>
              <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground text-balance leading-tight mb-1">
                    Je suis <span className="text-primary">élève</span>
                  </h3>
                  <p className="text-xs font-semibold text-primary mb-2">Du CP au Bac+5</p>
                  <p className="text-xs md:text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-2 md:line-clamp-none">
                    13 outils gratuits : fiches méthode, flashcards, planning, scanner OCR…
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['Primaire', 'Collège', 'Lycée', 'Supérieur'].map(n => (
                    <span key={n} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-primary mt-auto pt-1 group-hover:gap-2.5 transition-[gap] duration-150">
                  Mon espace
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>

          {/* Carte Parent */}
          <Link to="/parents" className="group col-span-1 h-full flex">
            <div className="relative flex flex-col w-full rounded-2xl border-2 border-chart-4/30 bg-gradient-to-br from-chart-4/10 via-chart-4/5 to-transparent overflow-hidden hover:border-chart-4/60 hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer">
              <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-chart-4/15 border border-chart-4/25 flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 md:w-7 md:h-7 text-chart-4" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground text-balance leading-tight mb-1">
                    Je suis <span className="text-chart-4">parent</span>
                  </h3>
                  <p className="text-xs font-semibold text-chart-4 mb-2">Accompagner sereinement</p>
                  <p className="text-xs md:text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-2 md:line-clamp-none">
                    Sans pub, sans contenu inapproprié. Suivi de progression en toute confiance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['0 pub', 'RGPD', 'Gratuit'].map(n => (
                    <span key={n} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-chart-4/10 text-chart-4 border border-chart-4/20">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-chart-4 mt-auto pt-1 group-hover:gap-2.5 transition-[gap] duration-150">
                  Espace parents
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>

          {/* Carte Enseignant */}
          <Link to="/enseignants" className="group col-span-1 h-full flex">
            <div className="relative flex flex-col w-full rounded-2xl border-2 border-chart-3/30 bg-gradient-to-br from-chart-3/10 via-chart-3/5 to-transparent overflow-hidden hover:border-chart-3/60 hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer">
              <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-chart-3/15 border border-chart-3/25 flex items-center justify-center shadow-md">
                  <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-chart-3" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground text-balance leading-tight mb-1">
                    Je suis <span className="text-chart-3">enseignant(e)</span>
                  </h3>
                  <p className="text-xs font-semibold text-chart-3 mb-2">Programmes Éduscol</p>
                  <p className="text-xs md:text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-2 md:line-clamp-none">
                    Ressources alignées sur les programmes officiels. Recommandez en toute confiance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['Éduscol', 'B.O.', 'Gratuit'].map(n => (
                    <span key={n} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-chart-3/10 text-chart-3 border border-chart-3/20">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-chart-3 mt-auto pt-1 group-hover:gap-2.5 transition-[gap] duration-150">
                  Espace enseignants
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>

          {/* Carte DYS / ULIS / SEGPA — promu depuis l'ancienne barre niveaux */}
          <Link to="/inclusion" className="group col-span-1 h-full flex">
            <div className="relative flex flex-col w-full rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent overflow-hidden hover:border-success/60 hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer">
              <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-success/15 border border-success/25 flex items-center justify-center shadow-md">
                  <Accessibility className="w-6 h-6 md:w-7 md:h-7 text-success" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground text-balance leading-tight mb-1">
                    <span className="text-success">DYS</span> / ULIS / SEGPA
                  </h3>
                  <p className="text-xs font-semibold text-success mb-2">Accessibilité universelle</p>
                  <p className="text-xs md:text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-2 md:line-clamp-none">
                    Interface adaptée, police DYS, contrastes renforcés. Aucun élève laissé de côté.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['DYS', 'ULIS', 'Adapté'].map(n => (
                    <span key={n} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-success mt-auto pt-1 group-hover:gap-2.5 transition-[gap] duration-150">
                  Espace inclusion
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* ══ 2b. TOUS LES OUTILS — 13 outils ══════════════════════════════
          Placé après les profils : le visiteur sait qui il est,
          maintenant il découvre tous les outils disponibles.          */}
      <section aria-label="Les 13 outils gratuits d'Apprenix">
        <div className="flex items-start justify-between mb-5 gap-3">
          <div className="section-divider pt-3 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-chart-2 bg-chart-2/10 border border-chart-2/20 px-2.5 py-1 rounded-full mb-2">
              <Award className="w-3 h-3" aria-hidden="true" />
              100 % gratuits · sans inscription
            </span>
            <h2 className="text-display text-xl md:text-3xl xl:text-4xl text-foreground text-balance mt-1">
              <span className="gradient-text">13 outils</span> — tous gratuits, tous utiles
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Accessibles sans inscription, sans limite de temps.</p>
          </div>
        </div>
        {/* Grille groupée par catégorie — 5 groupes avec en-tête coloré */}
        <div className="flex flex-col gap-6">
          {TOOL_CATEGORIES.map(({ id, label, icon: CatIcon, color, bg, border, desc: catDesc }) => {
            const tools = TOOLS.filter(t => t.category === id);
            return (
              <div key={id}>
                {/* En-tête de catégorie */}
                <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border mb-3', bg, border)}>
                  <CatIcon className={cn('w-3.5 h-3.5 shrink-0', color)} aria-hidden="true" />
                  <span className={cn('text-xs font-extrabold uppercase tracking-wide', color)}>{label}</span>
                  <span className="text-xs text-muted-foreground font-medium hidden sm:inline">— {catDesc}</span>
                </div>
                {/* Cartes de la catégorie */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
                  {tools.map(({ path, icon: Icon, label: toolLabel, desc, color: tc, bg: tbg }) => (
                    <Link key={path} to={path} onMouseEnter={() => prefetchRoute(path)} className="h-full flex">
                      <div className={cn(
                        'flex flex-col gap-2.5 p-3 md:p-4 rounded-2xl border bg-card w-full',
                        'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5',
                        'transition-[transform,border-color,box-shadow] duration-200 group cursor-pointer card-premium',
                      )}>
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-110 shadow-sm', tbg)}>
                          <Icon className={cn('w-[17px] h-[17px]', tc)} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-bold text-foreground leading-snug mb-1 text-balance">{toolLabel}</p>
                          <p className="text-xs text-muted-foreground text-pretty leading-relaxed line-clamp-2">{desc}</p>
                        </div>
                        <div className={cn('flex items-center gap-1 text-xs font-semibold mt-auto', tc)}>
                          <span className="truncate">Accéder</span>
                          <ArrowRight className="w-3 h-3 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ 4. COMMENT ÇA MARCHE — 5 étapes détaillées ══════════════════════
          Après avoir vu les outils, l'utilisateur comprend exactement comment
          utiliser Apprenix avec des étapes concrètes et précises.           */}
      <section id="comment-ca-marche" aria-label="Comment fonctionne Apprenix">
        <div className="mb-6 section-divider pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full mb-2">
            <Zap className="w-3 h-3" aria-hidden="true" />
            Simple &amp; rapide
          </span>
          <h2 className="text-display text-xl md:text-3xl xl:text-4xl text-foreground text-balance mt-1">
            Comment ça marche ?
          </h2>
          <p className="text-sm text-muted-foreground mt-1">5 étapes concrètes — de la question à la maîtrise.</p>
        </div>

        {/* Grille : 1 col mobile, 2 col tablette, alternance gauche-droite desktop */}
        <div className="flex flex-col gap-4">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color, bg, bar, details }, i) => (
            <div key={step} className={cn(
              'relative flex flex-col md:flex-row items-start gap-4 p-5 rounded-2xl border bg-card card-premium',
              'hover:shadow-lg transition-shadow duration-200 group',
            )}>
              {/* Trait coloré top */}
              <div className={cn('absolute top-0 left-4 right-4 h-[3px] rounded-full opacity-60 md:left-0 md:right-auto md:top-4 md:bottom-4 md:w-[3px] md:h-auto', bar)} aria-hidden="true" />

              {/* Numéro + icône */}
              <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-2 shrink-0 md:w-16 pt-1">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform duration-200 group-hover:scale-110', bg)}>
                  <Icon className={cn('w-6 h-6', color)} aria-hidden="true" />
                </div>
                <span className={cn('text-2xl md:text-3xl font-black leading-none tabular-nums', color)}>{step}</span>
              </div>

              {/* Contenu texte */}
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-bold text-foreground mb-1.5 text-balance">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty mb-3">{desc}</p>

                {/* Liste de détails concrets */}
                <ul className="flex flex-col gap-1.5" aria-label={`Détails étape ${step}`}>
                  {details.map((d, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', color)} aria-hidden="true" />
                      <span className="leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connecteur vertical entre étapes */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="absolute -bottom-3 left-8 md:left-[34px] w-0.5 h-3 bg-border/60 hidden md:block" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        {/* CTA bas de section */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/espace" className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-md">
            <Rocket className="w-4 h-4" aria-hidden="true" />
            Commencer maintenant — c'est gratuit
          </Link>
          <p className="text-xs text-muted-foreground">Aucune carte bancaire · Aucun abonnement</p>
        </div>
      </section>

      {/* ══ 5. CONFIANCE — Comparatif · FAQ · Avis ═══════════════════════
          Ordre : données objectives (comparatif) → questions concrètes
          (FAQ 3 cartes) → preuve sociale (avis). Section unique, sans
          sous-dividers visuels redondants.                              */}
      <section aria-label="Pourquoi faire confiance à Apprenix">

        {/* ── Tableau comparatif ── */}
        <div className="mb-5 section-divider pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full mb-2">
            <Crown className="w-3 h-3" aria-hidden="true" />
            Comparatif 2026
          </span>
          <h2 className="text-display text-xl md:text-3xl xl:text-4xl font-black text-foreground text-balance mt-1">
            Apprenix vs les autres plateformes
          </h2>
          <p className="text-sm text-muted-foreground mt-1 text-pretty max-w-xl">
            Ce que les autres ne font pas — ou font payer.
          </p>
        </div>
        <Card className="border border-border/60 mb-8">
          {/* ── Légende plateformes ── */}
          <div className="px-4 pt-4 pb-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground border-b border-border/40">
            <span className="flex items-center gap-1.5 font-bold text-primary"><Crown className="w-3 h-3" aria-hidden="true" />Apprenix</span>
            <span className="flex items-center gap-1.5">💬 ChatGPT</span>
            <span className="flex items-center gap-1.5">🃏 Quizlet</span>
            <span className="flex items-center gap-1.5">🧠 Brainly</span>
            <span className="flex items-center gap-1.5">📐 Khan Academy</span>
          </div>

          {/* ── Grille de cartes — 1 col mobile, 2 col tablette+ ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-0 divide-border/40">
            {COMPARISON_ROWS.map((row, i) => {
              const platforms: { key: keyof CompRow; emoji: string; label: string }[] = [
                { key: 'apprenix', emoji: '🟠', label: 'Apprenix' },
                { key: 'chatgpt',  emoji: '💬', label: 'ChatGPT'  },
                { key: 'quizlet',  emoji: '🃏', label: 'Quizlet'  },
                { key: 'brainly',  emoji: '🧠', label: 'Brainly'  },
                { key: 'khan',     emoji: '📐', label: 'Khan'     },
              ];
              return (
                <div
                  key={row.feature}
                  className={cn(
                    'px-4 py-4 flex flex-col gap-3',
                    i % 2 !== 0 ? 'bg-muted/10' : '',
                    // Séparateur vertical entre les 2 colonnes desktop
                    'md:border-r md:border-border/30 last:md:border-r-0 [&:nth-child(2n)]:md:border-r-0',
                  )}
                >
                  {/* Titre + détail */}
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground leading-snug text-balance">{row.feature}</p>
                      {row.detail && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-pretty">{row.detail}</p>
                      )}
                    </div>
                  </div>

                  {/* Badges plateformes */}
                  <div className="flex flex-wrap gap-1.5" role="list" aria-label={`Comparatif pour : ${row.feature}`}>
                    {platforms.map(({ key, emoji, label }) => {
                      const val = row[key] as CompVal;
                      const isApprenix = key === 'apprenix';
                      return (
                        <span
                          key={key}
                          role="listitem"
                          aria-label={`${label} : ${val === true ? 'disponible' : val === 'partial' ? 'partiel ou payant' : 'absent'}`}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                            isApprenix
                              ? 'bg-primary/10 border-primary/30 text-primary font-bold'
                              : val === true
                                ? 'bg-success/10 border-success/30 text-success'
                                : val === 'partial'
                                  ? 'bg-warning/10 border-warning/30 text-warning'
                                  : 'bg-muted border-border/40 text-muted-foreground line-through',
                          )}
                        >
                          <span aria-hidden="true">
                            {val === true ? '✅' : val === 'partial' ? '⚡' : '✗'}
                          </span>
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Légende bas */}
          <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">✅ Disponible</span>
            <span className="flex items-center gap-1">⚡ Partiel / payant</span>
            <span className="flex items-center gap-1">✗ Absent</span>
          </div>
        </Card>
        <p className="mb-8 text-xs text-muted-foreground">Données vérifiées en juin 2026.</p>

        {/* ── FAQ — 3 questions essentielles ── */}
        <div className="mb-4">
          <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-xs font-semibold mb-2 flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5" aria-hidden="true" /> Questions fréquentes
          </Badge>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-display text-xl md:text-2xl xl:text-3xl text-foreground text-balance">
              Ce que se demandent <span className="gradient-text">parents & enseignants</span>
            </h2>
            <Link to="/faq" className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2">
              Tout voir <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {([
            { q: "L'outil peut-il rédiger les devoirs à la place de mon enfant ?", a: "Non. L'aide Apprenix fournit des fiches méthode étape par étape pour comprendre les concepts — jamais pour rédiger à la place.", Icon: Brain, color: 'text-chart-1', bg: 'bg-chart-1/10' },
            { q: 'Les contenus sont-ils alignés sur les programmes officiels ?',   a: 'Oui. Toutes les ressources sont vérifiées sur Éduscol et le B.O. Mises à jour chaque rentrée.', Icon: GraduationCap, color: 'text-chart-3', bg: 'bg-chart-3/10' },
            { q: 'Apprenix est-il adapté aux élèves DYS / ULIS / SEGPA ?',        a: 'Oui. Interface simplifiée, police dyslexie (OpenDyslexic), grands contrastes — conforme RGAA 4.1. Aucun élève laissé de côté.', Icon: Heart, color: 'text-destructive', bg: 'bg-destructive/10' },
          ] as const).map(({ q, a, Icon, color, bg }) => (
            <Card key={q} className="h-full border-border/60 hover:border-chart-4/40 hover:shadow-md hover:-translate-y-0.5 transition-[transform,border-color,box-shadow] duration-200">
              <CardContent className="p-4 flex flex-col gap-2.5 h-full">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground text-balance leading-snug pt-1">{q}</h3>
                </div>
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">{a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Avis communauté (preuve sociale) ── */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-display text-xl md:text-2xl font-extrabold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Avis de la communauté
          </h2>
          <button type="button" onClick={() => setReviewDialogOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-2"
            aria-label="Laisser un avis">
            <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
            Laisser un avis
          </button>
        </div>
        {reviews.length === 0 ? (
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border/40 p-5 bg-muted/20">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Aucun avis pour l'instant</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sois le premier à partager ton expérience !</p>
            </div>
            <button type="button" onClick={() => setReviewDialogOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-2 min-h-[44px] px-2">
              <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
              Avis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {reviews.slice(0, 3).map(review => (
              <CommentCard key={review.id} item={review} onLike={likeReview} variant="review" />
            ))}
          </div>
        )}
      </section>

      {/* ══ 7. TÉLÉCHARGER + CTA FINAL ════════════════════════════════
          PWA install + appel à l'action = une seule conclusion claire   */}
      <PwaInstallSection />

      <section
        className="relative rounded-2xl p-6 md:p-10 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--chart-1) / 0.07) 100%)', border: '1px solid hsl(var(--primary) / 0.20)' }}
        aria-label="Commencer avec Apprenix"
      >
        {/* Halos */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-chart-1/8 blur-2xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" aria-hidden="true" />
        {/* Grille pointillés */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.045] pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id="cta-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-dots)" />
        </svg>
        {/* Diagonale */}
        <div className="absolute -top-8 left-1/4 w-px h-[130%] bg-current opacity-[0.06] rotate-[18deg] pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4">
            <Rocket className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Rejoindre 100 % gratuitement
          </span>
          <h2 className="text-display text-xl md:text-4xl xl:text-5xl text-foreground text-balance mb-3 leading-tight font-extrabold">
            Prêt à vraiment progresser ?<br className="hidden md:block" />
            <span className="gradient-text"> Apprenix t'attend.</span>
          </h2>
          <p className="text-base md:text-lg xl:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed max-w-lg mx-auto">
            13 outils pédagogiques alignés sur les programmes français — accessibles dès maintenant, sans créer de compte.
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Link
              to="/espace"
              className="btn-cta inline-flex items-center justify-center gap-2.5 font-extrabold text-base rounded-2xl text-white shadow-xl hover:shadow-2xl transition-[transform,box-shadow] duration-200 hover:-translate-y-1 px-6 md:px-9 py-3.5 w-full md:w-auto min-h-[52px] overflow-hidden whitespace-nowrap"
              aria-label="Commencer à utiliser Apprenix gratuitement"
            >
              <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="truncate min-w-0">Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>
            <button type="button"
              onClick={() => setReviewDialogOpen(true)}
              className="px-6 text-sm font-semibold rounded-2xl border border-border/70 text-foreground hover:bg-primary/5 hover:border-primary/30 transition-[background-color,border-color] duration-150 inline-flex items-center justify-center gap-2 min-h-[52px]"
              aria-label="Laisser un avis sur Apprenix"
            >
              <PenLine className="w-4 h-4 shrink-0" aria-hidden="true" />
              Partager mon avis
            </button>
          </div>
        </div>
      </section>

      {/* ══ SEO — Liens longue traîne (compact) ═════════════════════════
          Indexé par Google, invisible visuellement mais cliquable.     */}
      <nav aria-label="Explorer Apprenix" className="border-t border-border/30 pt-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Explorer</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            { label: 'Aide aux devoirs gratuite',  to: '/aide-ia'              },
            { label: 'Flashcards gratuites',        to: '/flashcards'           },
            { label: 'Révision Bac 2026',           to: '/revision-bac-2026'    },
            { label: 'Bac Français',                to: '/bac-francais'         },
            { label: 'Bac Philo',                   to: '/bac-philo'            },
            { label: 'Cours maths gratuits',        to: '/cours-maths-gratuit'  },
            { label: 'Méthode de travail',          to: '/methode-de-travail'   },
            { label: 'Inclusion DYS / ULIS',        to: '/inclusion'            },
            { label: 'Notre mission',               to: '/mission'              },
            { label: 'Espace enseignants',          to: '/enseignants'          },
            { label: 'Transparence RGPD',           to: '/transparence'         },
            { label: 'Actualités éducatives',       to: '/actualites'           },
          ].map(({ label, to }) => (
            <Link key={to} to={to}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-border hover:decoration-primary">
              {label}
            </Link>
          ))}
        </div>
      </nav>

    </div>
    {/* ── Dialog Laisser un avis ── */}
    <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Laisser un avis</DialogTitle>
          <DialogDescription>Partagez votre expérience avec la communauté Apprenix.</DialogDescription>
        </DialogHeader>
        <ReviewForm onSubmit={(data) => { addReview(data); setReviewDialogOpen(false); }} />
      </DialogContent>
    </Dialog>

    </>
  );
};

// ─── Vue MEMBRE (connecté) ────────────────────────────────────────────────────
const DAILY_TIPS = [
  "Révisez vos flashcards le matin : la mémoire à long terme se consolide mieux après une nuit de sommeil.",
  "La technique Pomodoro (25 min de travail, 5 min de pause) améliore la concentration de 40 %.",
  "Relire ses notes dans les 24 h qui suivent un cours permet de retenir 80 % des informations.",
  "Expliquer un concept à voix haute — même seul — est la méthode de mémorisation la plus efficace.",
  "Varier les matières pendant une session de révision réduit la fatigue mentale et améliore la rétention.",
  "Préparez votre planning de révision la veille : 5 minutes d'organisation = 1 heure gagnée le lendemain.",
  "Désactivez les notifications pendant vos sessions Deep Work — chaque interruption coûte 23 minutes de concentration.",
];

const MemberView: React.FC = () => {
  const { level, profile, flashcards, todos, notes } = useApp();
  const category = getLevelCategory(level);
  const catLabel  = getLevelCategoryLabel(level);
  const firstName = profile.name.split(' ')[0];

  // Conseil rotatif basé sur le jour de l'année — change chaque jour
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTip  = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];

  // Stats rapides
  const today = new Date().toISOString().split('T')[0];
  const dueCards    = flashcards.filter(c => c.nextReview <= today).length;
  const urgentTodos = todos.filter(t => !t.completed && t.dueDate && t.dueDate <= today).length;
  const totalNotes  = notes.length;

  return (
    <div className="min-w-0 space-y-5 md:space-y-7">

      {/* ── Hero membre personnalisé ── */}
      <section className="relative rounded-2xl overflow-hidden bg-hero-pattern animate-fade-up" aria-label={`Tableau de bord de ${firstName}`}>
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
          <GraduationCap className="absolute right-6 top-1/2 -translate-y-1/2 w-36 h-36 text-white opacity-[0.06] hidden md:block" />
        </div>
        <div className="relative z-10 px-5 py-5 md:px-8 md:py-7">
          {/* Ligne du haut */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="hero-badge animate-fade-up delay-50">
              <ApprenixLogo size={16} variant="icon" />
              <span className="font-bold text-sm text-white">Apprenix</span>
            </div>
            <span className="ml-auto hero-badge animate-fade-up delay-100">
              🎓 {catLabel}
            </span>
          </div>

          <h1 className="text-display text-xl md:text-3xl xl:text-4xl text-white mb-1.5 text-balance leading-tight animate-fade-up delay-200">
            Content de te revoir, <span className="text-white font-extrabold">{firstName}</span> ! 👋
          </h1>
          <p className="text-white text-base md:text-lg xl:text-xl mb-4 text-pretty max-w-md leading-relaxed animate-fade-up delay-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.20)]">
            Tes outils, flashcards et suivi de progression sont prêts.
          </p>

          {/* Stats rapides — visibles d'emblée */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: dueCards,    label: 'flashcard' + (dueCards !== 1 ? 's' : '') + ' à réviser', icon: CreditCard, urgent: dueCards > 0, path: '/flashcards' },
              { value: urgentTodos, label: 'tâche' + (urgentTodos !== 1 ? 's' : '') + ' urgente' + (urgentTodos !== 1 ? 's' : ''), icon: CheckCircle, urgent: urgentTodos > 0, path: '/organisation' },
              { value: totalNotes,  label: 'note' + (totalNotes !== 1 ? 's' : '') + ' sauvegardée' + (totalNotes !== 1 ? 's' : ''), icon: FileText, urgent: false, path: '/notes' },
            ].map(({ value, label, icon: StatIcon, urgent, path: statPath }) => (
              <Link key={label} to={statPath}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors',
                  urgent && value > 0
                    ? 'bg-warning/30 border-warning/50 text-white hover:bg-warning/40'
                    : 'bg-white/15 border-white/25 text-white/90 hover:bg-white/25',
                )}
              >
                <StatIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{value}</span>
                <span className="font-medium opacity-80 truncate">{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <Link to="/espace" className="shrink-0">
              <Button className="w-full md:w-auto bg-white hover:bg-white/90 active:scale-95 font-bold h-10 px-6 shadow-lg text-sm rounded-xl transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-xl" style={{ color: 'hsl(var(--primary))' }}>
                <School className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
                Mon espace {catLabel}
                <ArrowRight className="ml-1.5 w-4 h-4 shrink-0" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/motivation" className="shrink-0">
              <Button variant="ghost" className="w-full md:w-auto border-2 border-white/60 text-white hover:bg-white/15 hover:border-white active:scale-95 h-10 px-5 text-sm rounded-xl transition-[background-color,border-color,transform] duration-200">
                <Trophy className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
                Ma progression
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Widget Révision du jour ── */}
      <RevisionDuJourWidget />

      {/* ── Conseil du jour (rotatif) ── */}
      <Card className="border-l-4 border-l-primary bg-primary/5 border-border/60">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary mb-0.5">Conseil du jour</p>
            <p className="text-sm text-foreground text-pretty leading-relaxed">{todayTip}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Mes outils — groupés par catégorie (même structure que VisitorView) ── */}
      <section aria-label="Tous les outils">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-display text-base md:text-lg xl:text-xl font-bold text-foreground text-balance">Mes outils</h2>
          <Badge variant="secondary" className="text-xs shrink-0 font-semibold">13 gratuits</Badge>
        </div>
        <div className="flex flex-col gap-5">
          {TOOL_CATEGORIES.map(({ id, label, icon: CatIcon, color, bg, border }) => {
            const catTools = TOOLS.filter(t => t.category === id);
            return (
              <div key={id}>
                <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border mb-3', bg, border)}>
                  <CatIcon className={cn('w-3.5 h-3.5 shrink-0', color)} aria-hidden="true" />
                  <span className={cn('text-xs font-extrabold uppercase tracking-wide', color)}>{label}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
                  {catTools.map(({ path, icon: Icon, label: toolLabel, color: tc, bg: tbg }) => (
                    <Link key={path} to={path} onMouseEnter={() => prefetchRoute(path)} className="h-full flex">
                      <Card className="h-full card-hover card-glow cursor-pointer group border-border/60 w-full">
                        <CardContent className="p-3 md:p-4 flex flex-col gap-2.5 h-full">
                          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0', tbg)}>
                            <Icon className={cn('w-4 h-4', tc)} aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-foreground text-balance leading-snug">{toolLabel}</h3>
                          </div>
                          <div className={cn('flex items-center gap-1 text-xs font-bold mt-auto', tc)}>
                            Accéder <ArrowRight className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

// ─── Page d'accueil principale ────────────────────────────────────────────────
const AccueilPage: React.FC = () => {
  const { isAuthenticated, authReady, profileReady, level } = useApp();
  const navigate = useNavigate();

  // Auto-redirect : un utilisateur connecté n'a pas besoin de la page marketing
  // On attend profileReady pour rediriger vers le BON niveau (pas le défaut '2nde')
  useEffect(() => {
    if (authReady && isAuthenticated && profileReady) {
      navigate(`/espace/${getLevelCategory(level)}`, { replace: true });
    }
  }, [authReady, isAuthenticated, profileReady, level, navigate]);

  // Pendant le chargement d'un utilisateur connecté → spinner (évite le flash de la page marketing)
  if (!authReady || (isAuthenticated && !profileReady)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Apprenix — Aide scolaire gratuite, Flashcards & Méthode 100% gratuits"
        description="Aide aux devoirs, flashcards et révision gratuits du CP au Bac+5. Zéro pub, zéro abonnement. Pour élèves, parents, enseignants et DYS."
        canonical="/"
        keywords="plateforme éducative gratuite, aide aux devoirs gratuite, fiches méthode scolaire, révision scolaire gratuite, flashcards gratuits, lycée collège université, Apprenix, bac 2026, brevet 2026, apprendre gratuitement, DYS inclusion, enseignants ressources, alternative Skolengo, alternative Pronote gratuit"
        dateModified="2026-06-18"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Apprenix',
          'applicationCategory': 'EducationApplication',
          'operatingSystem': 'Web, iOS, Android, Windows, macOS',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR' },
          'description': 'Plateforme éducative 100% gratuite du CP à la fac.' }}
      />
      <VisitorView />
    </>
  );
};

export default AccueilPage;
