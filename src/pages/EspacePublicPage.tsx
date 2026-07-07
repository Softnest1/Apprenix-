/**
 * EspacePublicPage — Espace Public Institutionnel
 *
 * Portail public d'information et de transparence d'Apprenix.
 * Accessible sans authentification.
 *
 * Utilisateurs cibles :
 *  • Élèves (première visite) — orientation rapide
 *  • Parents               — vérification crédibilité
 *  • Enseignants           — jugement professionnalisme
 *  • Contrôleurs/Inspecteurs — conformité réglementaire
 *
 * WCAG 2.1 AA — keyboard nav, aria-labels, focus-visible, min-h touch 44px
 */
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  Star,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import PageHero from '@/components/ui/PageHero';
import { cn } from '@/lib/utils';

// ─── Données ────────────────────────────────────────────────────────────────

interface UserTypeCard {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  items: string[];
  cta: string;
  href: string;
  accent: string;
  badgeColor: string;
}

const USER_TYPES: UserTypeCard[] = [
  {
    id: 'eleve',
    icon: GraduationCap,
    label: 'Élève',
    description: 'Première visite ? Retrouvez tout ce qu\'il faut pour bien démarrer.',
    items: [
      'Comment créer mon compte gratuitement',
      'Les outils disponibles (fiches, quiz, flashcards)',
      'Comment fonctionne la plateforme',
      'Règles d\'utilisation et vie privée',
    ],
    cta: 'Mon espace élève',
    href: '/espace',
    accent: 'border-primary/30 bg-primary/5',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'parent',
    icon: Heart,
    label: 'Parent',
    description: 'Vérifiez notre sérieux, notre conformité RGPD et nos engagements.',
    items: [
      'Politique de protection des données (RGPD)',
      'Charte de sécurité pour les mineurs',
      'Conditions d\'utilisation',
      'Contacts et réclamations',
    ],
    cta: 'Espace parents',
    href: '/parents',
    accent: 'border-chart-4/30 bg-chart-4/5',
    badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  },
  {
    id: 'enseignant',
    icon: UserCheck,
    label: 'Enseignant(e)',
    description: 'Évaluez la qualité pédagogique et la conformité aux programmes.',
    items: [
      'Conformité aux programmes officiels (Éduscol)',
      'Charte qualité éditoriale',
      'Mentions légales complètes',
      'Déclaration d\'accessibilité RGAA 4.1',
    ],
    cta: 'Espace enseignants',
    href: '/enseignants',
    accent: 'border-chart-3/30 bg-chart-3/5',
    badgeColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  },
  {
    id: 'inspecteur',
    icon: Shield,
    label: 'Contrôleur / Inspecteur',
    description: 'Accès direct à toute la documentation de conformité réglementaire.',
    items: [
      'Déclaration d\'accessibilité WCAG 2.1 AA / RGAA 4.1',
      'Mentions légales & éditeur responsable',
      'Politique de modération du contenu',
      'Procédures qualité et conformité',
    ],
    cta: 'Documentation complète',
    href: '/espace-public/informations',
    accent: 'border-success/30 bg-success/5',
    badgeColor: 'bg-success/10 text-success border-success/20',
  },
];

interface StatItem { value: string; label: string; icon: React.ElementType; }
const STATS: StatItem[] = [
  { value: '100 093',   label: 'ressources éducatives',    icon: BookOpen     },
  { value: '100 %',     label: 'gratuit — zéro pub',        icon: Star         },
  { value: 'CP → Bac+5', label: 'tous les niveaux couverts', icon: GraduationCap },
  { value: 'RGPD',      label: 'conforme — données protégées', icon: Lock      },
];

interface HowStep { num: string; title: string; desc: string; icon: React.ElementType; }
const HOW_STEPS: HowStep[] = [
  {
    num: '1',
    title: 'Inscrivez-vous gratuitement',
    desc: 'Créez un compte en 30 secondes — sans carte bancaire, sans abonnement. 100 % gratuit pour toujours.',
    icon: Users,
  },
  {
    num: '2',
    title: 'Choisissez votre profil',
    desc: 'Élève, parent, enseignant ou visiteur : chaque profil accède à un espace adapté à ses besoins.',
    icon: UserCheck,
  },
  {
    num: '3',
    title: 'Accédez aux ressources',
    desc: '3 064 quiz, 156 packs de flashcards, 96 846 cartes et 27 fiches méthode — disponibles immédiatement.',
    icon: Zap,
  },
];

interface ComplianceLink { label: string; href: string; icon: React.ElementType; desc: string; }
const COMPLIANCE_LINKS: ComplianceLink[] = [
  { label: 'Mentions légales',            href: '/espace-public/informations#mentions',      icon: FileText,      desc: 'Éditeur, hébergeur, propriété intellectuelle'    },
  { label: 'Politique de confidentialité', href: '/espace-public/informations#confidentialite', icon: Lock,         desc: 'RGPD, données personnelles, cookies'               },
  { label: 'Déclaration d\'accessibilité', href: '/espace-public/informations#accessibilite', icon: Shield,        desc: 'WCAG 2.1 AA — RGAA 4.1'                          },
  { label: 'Procédures qualité',           href: '/espace-public/informations#procedures',   icon: ClipboardList, desc: 'Processus éditorial et conformité réglementaire'   },
  { label: 'Conditions d\'utilisation',    href: '/espace-public/informations#cgu',          icon: Award,         desc: 'Règles d\'usage et responsabilités'                },
  { label: 'Contact & réclamations',       href: '/contact',                                  icon: Mail,          desc: 'Signalement, questions, suggestions'               },
];

interface FaqItem { q: string; a: string; }
const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Apprenix est-il vraiment gratuit ?',
    a: 'Oui, entièrement et définitivement. Aucune publicité, aucun abonnement, aucune limitation cachée. Apprenix est financé par des dons et contributions bénévoles.',
  },
  {
    q: 'Comment mes données personnelles sont-elles protégées ?',
    a: 'Apprenix respecte le RGPD. Vos données ne sont jamais vendues à des tiers. Seules les données strictement nécessaires au fonctionnement du service sont collectées. Vous pouvez demander leur suppression à tout moment.',
  },
  {
    q: 'La plateforme est-elle accessible aux élèves en situation de handicap ?',
    a: 'Oui. Apprenix est conforme WCAG 2.1 AA et RGAA 4.1. Des outils d\'accessibilité intégrés permettent d\'ajuster la taille du texte, le contraste, la vitesse de lecture vocale et bien plus.',
  },
  {
    q: 'Les contenus sont-ils conformes aux programmes officiels ?',
    a: 'Tous les contenus sont alignés sur les programmes Éduscol du Ministère de l\'Éducation nationale, du CP au Bac+5. La charte éditoriale garantit la rigueur et la pertinence pédagogique.',
  },
  {
    q: 'Comment signaler un problème ou contacter l\'équipe ?',
    a: 'Via le formulaire de contact, par email à apprenix.contact@gmail.com, ou via le bouton « Nous contacter » dans chaque page. Délai de réponse : 48h ouvrées.',
  },
];

// ─── Sous-composants ─────────────────────────────────────────────────────────

/** Barre de recherche rapide */
const SearchBar: React.FC = () => {
  const [query, setQuery]   = useState('');
  const inputRef            = useRef<HTMLInputElement>(null);

  const SEARCH_HINTS = [
    'mentions légales', 'RGPD', 'accessibilité', 'conditions d\'utilisation',
    'conformité', 'contact', 'programmes officiels', 'données personnelles',
  ];

  const filtered = useMemo(() =>
    query.trim().length >= 2
      ? SEARCH_HINTS.filter(h => h.toLowerCase().includes(query.toLowerCase()))
      : [],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [query]);

  const go = useCallback((term: string) => {
    const map: Record<string, string> = {
      'mentions légales':          '/espace-public/informations#mentions',
      'rgpd':                      '/espace-public/informations#confidentialite',
      'accessibilité':             '/espace-public/informations#accessibilite',
      'conditions d\'utilisation': '/espace-public/informations#cgu',
      'conformité':                '/espace-public/informations#procedures',
      'contact':                   '/contact',
      'programmes officiels':      '/ressources-officielles',
      'données personnelles':      '/espace-public/informations#confidentialite',
    };
    const dest = map[term.toLowerCase()] ?? '/espace-public/informations';
    window.location.href = dest;
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto" role="search" aria-label="Recherche dans l'Espace Public">
      <div className="relative flex items-center bg-background border-2 border-border rounded-2xl shadow-md focus-within:border-primary focus-within:shadow-lg transition-all duration-200">
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && filtered[0]) go(filtered[0]); }}
          placeholder="Rechercher : mentions légales, RGPD, accessibilité…"
          aria-label="Rechercher une information ou un document"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={filtered.length > 0}
          className="w-full pl-12 pr-4 py-4 bg-transparent text-foreground placeholder:text-muted-foreground text-base font-medium rounded-2xl focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            aria-label="Effacer la recherche"
            className="absolute right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Suggestions de recherche"
          className="absolute top-full mt-2 w-full bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {filtered.map(hint => (
            <li key={hint} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => go(hint)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted flex items-center gap-2 transition-colors min-h-[44px]"
              >
                <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <span>{hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** Carte par type d'utilisateur */
const UserTypeCardComponent: React.FC<{ card: UserTypeCard }> = ({ card }) => {
  const Icon = card.icon;
  return (
    <article
      className={cn('rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg h-full', card.accent)}
      aria-label={`Section ${card.label}`}
    >
      <header className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', card.badgeColor)}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <Badge className={cn('text-xs font-bold mb-1', card.badgeColor)}>{card.label}</Badge>
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{card.description}</p>
        </div>
      </header>

      <ul className="space-y-2 flex-1" aria-label={`Informations pour ${card.label}`}>
        {card.items.map(item => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground">
            <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-pretty">{item}</span>
          </li>
        ))}
      </ul>

      <Link
        to={card.href}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold',
          'min-h-[44px] transition-all duration-150 hover:opacity-90',
          'bg-primary text-primary-foreground',
        )}
        aria-label={`${card.cta} — Section ${card.label}`}
      >
        {card.cta}
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </article>
  );
};

/** Accordéon FAQ */
const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="space-y-2" role="list" aria-label="Questions fréquentes">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} role="listitem" className="border border-border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left bg-card hover:bg-muted transition-colors min-h-[56px]"
            >
              <span className="text-sm font-semibold text-foreground text-pretty flex-1">{item.q}</span>
              <ChevronDown
                className={cn('w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div
                id={`faq-answer-${i}`}
                role="region"
                className="px-5 pb-4 pt-2 bg-muted/30 border-t border-border"
              >
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
const EspacePublicPage: React.FC = () => {
  return (
    <div className="min-w-0 space-y-10 w-full max-w-5xl mx-auto px-4 md:px-5 py-4 md:py-6">
      <SEO
        title="Espace Public — Transparence institutionnelle | Apprenix"
        description="Portail public d'Apprenix : mentions légales, conformité RGPD, déclaration d'accessibilité WCAG/RGAA, procédures qualité. Accès rapide pour élèves, parents, enseignants et contrôleurs."
        canonical="/espace-public"
        keywords="espace public apprenix, mentions légales, RGPD, accessibilité WCAG, RGAA, conformité éducative, transparence institutionnelle"
        dateModified="2026-06-18"
      />

      {/* ── Hero ── */}
      <PageHero
        variant="trust"
        icon={Shield}
        badge={<>🏛️ Espace Public</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Transparence et conformité institutionnelle"
        subtitle="Accédez à toutes les informations officielles d'Apprenix : mentions légales, politique de confidentialité, déclaration d'accessibilité et procédures qualité."
        stats={[
          { value: 'RGPD',      label: 'conforme', emoji: '🔒' },
          { value: 'WCAG 2.1',  label: 'AA — RGAA 4.1', emoji: '♿' },
          { value: '100 %',     label: 'gratuit & transparent', emoji: '✅' },
        ]}
      >
        <ENBadge />
      </PageHero>

      {/* ── Barre de recherche ── */}
      <section aria-labelledby="search-titre">
        <h2 id="search-titre" className="sr-only">Recherche rapide</h2>
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-3">
          <div className="text-center mb-4">
            <p className="text-base font-bold text-foreground">Trouvez l'information en 2 secondes</p>
            <p className="text-sm text-muted-foreground mt-1">RGPD, accessibilité, mentions légales, contact…</p>
          </div>
          <SearchBar />
          <div className="flex flex-wrap justify-center gap-2 mt-3" aria-label="Recherches fréquentes">
            {['Mentions légales', 'RGPD', 'Accessibilité', 'Contact'].map(tag => (
              <Link
                key={tag}
                to={
                  tag === 'Mentions légales' ? '/espace-public/informations#mentions' :
                  tag === 'RGPD'            ? '/espace-public/informations#confidentialite' :
                  tag === 'Accessibilité'   ? '/espace-public/informations#accessibilite' :
                  '/contact'
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-muted text-foreground border border-border hover:border-primary/50 hover:text-primary transition-colors min-h-[44px]"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 profils utilisateur ── */}
      <section aria-labelledby="profils-titre">
        <div className="mb-5">
          <h2 id="profils-titre" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Accès rapide par profil
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Chaque profil trouve directement les informations qui le concernent.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {USER_TYPES.map(card => (
            <UserTypeCardComponent key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* ── Signaux de crédibilité ── */}
      <section aria-labelledby="credibilite-titre">
        <h2 id="credibilite-titre" className="sr-only">Signaux de crédibilité</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center text-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <p className="text-lg font-extrabold text-foreground text-balance leading-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground text-pretty leading-snug">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section aria-labelledby="comment-titre">
        <div className="mb-5">
          <h2 id="comment-titre" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Comment ça marche ?
          </h2>
          <p className="text-sm text-muted-foreground mt-1">3 étapes pour commencer à apprendre gratuitement.</p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Étapes d'utilisation d'Apprenix">
          {HOW_STEPS.map(step => {
            const Icon = step.icon;
            return (
              <li
                key={step.num}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 h-full"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-lg shrink-0"
                    aria-label={`Étape ${step.num}`}
                  >
                    {step.num}
                  </span>
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground text-sm text-balance">{step.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">{step.desc}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── Conformité & légal ── */}
      <section aria-labelledby="conformite-titre">
        <div className="mb-5">
          <h2 id="conformite-titre" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Documentation de conformité
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Accès direct à tous les documents officiels — sans navigation complexe.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMPLIANCE_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 group min-h-[72px]"
                aria-label={`${link.label} — ${link.desc}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{link.label}</p>
                  <p className="text-xs text-muted-foreground text-pretty mt-0.5">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section aria-labelledby="faq-titre">
        <div className="mb-5">
          <h2 id="faq-titre" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Questions fréquentes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Les réponses aux questions les plus posées sur Apprenix.
          </p>
        </div>
        <FaqAccordion items={FAQ_ITEMS} />
        <div className="mt-4 text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline min-h-[44px] px-3"
          >
            Voir toutes les questions
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Contact & Support ── */}
      <section
        aria-labelledby="contact-titre"
        className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8"
      >
        <h2 id="contact-titre" className="text-base md:text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
          Nous contacter
        </h2>
        <p className="text-sm text-muted-foreground text-pretty mb-5 max-w-xl">
          Une question, une réclamation, un signalement ou une demande d'information institutionnelle ?
          Notre équipe répond sous 48 h ouvrées.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="min-h-[48px] text-sm font-bold">
            <Link to="/contact">
              <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
              Envoyer un message
            </Link>
          </Button>
          <a
            href="mailto:apprenix.contact@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-background text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-all min-h-[48px]"
            aria-label="Envoyer un email à apprenix.contact@gmail.com"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            apprenix.contact@gmail.com
          </a>
        </div>

        {/* Infos de contact supplémentaires pour contrôleurs */}
        <div className="mt-5 pt-5 border-t border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>France métropolitaine</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Réponse email sous 48h ouvrées</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
            <Link to="/espace-public/informations#mentions" className="hover:text-primary transition-colors underline underline-offset-2">
              Voir les mentions légales complètes
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lien vers page infos complète ── */}
      <section aria-label="Documentation complète" className="text-center py-4">
        <Card className="inline-block max-w-xl w-full border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
              Documentation institutionnelle complète
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground text-pretty mb-4">
              Contrôleurs, inspecteurs, DPO : toute la documentation de conformité
              (mentions légales, RGPD, accessibilité, procédures) est regroupée sur une seule page.
            </p>
            <Button asChild variant="outline" className="min-h-[48px] text-sm font-bold">
              <Link to="/espace-public/informations">
                <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                Accéder à la documentation complète
                <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default EspacePublicPage;
