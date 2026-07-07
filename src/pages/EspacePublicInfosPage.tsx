/**
 * EspacePublicInfosPage — Documentation institutionnelle complète
 *
 * Page cible : /espace-public/informations
 * Accessible sans authentification.
 *
 * Contient :
 *  • Mentions légales        (#mentions)
 *  • Politique de confidentialité (#confidentialite)
 *  • Accréditations          (#accreditations)
 *  • Procédures & conformité (#procedures)
 *  • Déclaration accessibilité WCAG/RGAA (#accessibilite)
 *  • CGU                     (#cgu)
 *
 * WCAG 2.1 AA — keyboard nav, anchor navigation, aria-labels
 */
import {
  Accessibility,
  Award,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Globe,
  Lock,
  Mail,
  Scale,
  Server,
  Shield,
  UserCheck,
  Wrench,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHero from '@/components/ui/PageHero';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SectionAnchor { id: string; label: string; icon: React.ElementType; }

const SECTIONS: SectionAnchor[] = [
  { id: 'mentions',       label: 'Mentions légales',            icon: FileText      },
  { id: 'confidentialite', label: 'Confidentialité & RGPD',     icon: Lock          },
  { id: 'accreditations', label: 'Accréditations',              icon: Award         },
  { id: 'procedures',     label: 'Procédures & conformité',     icon: ClipboardList },
  { id: 'accessibilite',  label: 'Déclaration accessibilité',   icon: Accessibility },
  { id: 'cgu',            label: 'Conditions d\'utilisation',   icon: Scale         },
];

// ─── Sous-composant : Section accordéon ──────────────────────────────────────

interface SectionBlockProps {
  id: string;
  icon: React.ElementType;
  title: string;
  badge?: string;
  badgeVariant?: 'success' | 'primary' | 'warning';
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SectionBlock: React.FC<SectionBlockProps> = ({
  id, icon: Icon, title, badge, badgeVariant = 'primary', children, defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const badgeClass: Record<string, string> = {
    success: 'bg-success/10 text-success border-success/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
  };

  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="scroll-mt-20">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={`${id}-content`}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-border bg-card px-5 py-4 text-left hover:border-primary/40 hover:bg-muted/50 transition-all min-h-[64px] group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id={`${id}-titre`} className="text-sm md:text-base font-bold text-foreground text-balance leading-tight">
              {title}
            </h2>
          </div>
          {badge && (
            <Badge className={cn('text-xs font-bold ml-1 shrink-0', badgeClass[badgeVariant])}>
              {badge}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn('w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={`${id}-content`}
          role="region"
          aria-labelledby={`${id}-titre`}
          className="mt-2 rounded-2xl border border-border bg-card/50 px-5 py-5 space-y-4"
        >
          {children}
        </div>
      )}
    </section>
  );
};

// ─── Sous-composant : ligne d'info ────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ElementType }> = ({
  label, value, icon: Icon,
}) => (
  <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 py-2 border-b border-border last:border-0">
    <dt className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 min-w-[180px]">
      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      {label}
    </dt>
    <dd className="text-sm text-foreground text-pretty">{value}</dd>
  </div>
);

// ─── Sous-composant : item de conformité ──────────────────────────────────────
const ComplianceItem: React.FC<{ ok?: boolean; label: string; detail?: string }> = ({
  ok = true, label, detail,
}) => (
  <li className="flex items-start gap-3">
    <CheckCircle
      className={cn('w-5 h-5 mt-0.5 shrink-0', ok ? 'text-success' : 'text-warning')}
      aria-hidden="true"
    />
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {detail && <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{detail}</p>}
    </div>
  </li>
);

// ─── Page principale ──────────────────────────────────────────────────────────
const EspacePublicInfosPage: React.FC = () => {
  const location = useLocation();

  /* Smooth-scroll vers l'ancre au chargement */
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-w-0 space-y-10 w-full max-w-4xl mx-auto px-4 md:px-5 py-4 md:py-6">
      <SEO
        title="Documentation institutionnelle — Espace Public | Apprenix"
        description="Mentions légales, politique de confidentialité RGPD, déclaration d'accessibilité WCAG 2.1 AA / RGAA 4.1, procédures qualité et conditions d'utilisation d'Apprenix."
        canonical="/espace-public/informations"
        keywords="mentions légales apprenix, RGPD, accessibilité WCAG RGAA, procédures qualité, conditions utilisation"
        dateModified="2026-06-18"
      />

      {/* ── Hero ── */}
      <PageHero
        variant="legal"
        icon={FileText}
        badge={<>📋 Documentation officielle</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Documentation institutionnelle complète"
        subtitle="Toutes les informations légales, réglementaires et de conformité d'Apprenix — regroupées sur une seule page pour les contrôleurs, inspecteurs, DPO et partenaires."
      />

      {/* ── Navigation ancre ── */}
      <nav aria-label="Navigation dans la documentation" className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 md:-mx-5 px-4 md:px-5 py-2">
        <div className="overflow-x-auto">
          <ol className="flex items-center gap-1 whitespace-nowrap" role="list">
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />}
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors min-h-[44px]"
                    aria-label={`Aller à la section : ${s.label}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden md:inline">{s.label}</span>
                    <span className="md:hidden">{s.label.split(' ')[0]}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* ── Sections ── */}
      <div className="space-y-4">

        {/* ── 1. Mentions légales ── */}
        <SectionBlock id="mentions" icon={FileText} title="Mentions légales" badge="Obligatoire — Loi LCEN" badgeVariant="primary" defaultOpen>
          <dl className="divide-y divide-border">
            <InfoRow icon={UserCheck} label="Éditeur responsable" value="Apprenix — Plateforme éducative collaborative" />
            <InfoRow icon={Globe}     label="Site web" value={<a href="https://apprenix.xyz" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">apprenix.xyz <ExternalLink className="w-3.5 h-3.5 inline ml-1" aria-label="(ouvre dans un nouvel onglet)" /></a>} />
            <InfoRow icon={Mail}      label="Contact éditeur" value={<a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline">apprenix.contact@gmail.com</a>} />
            <InfoRow icon={Server}    label="Hébergeur" value="Supabase Inc. — 970 Toa Payoh North, Singapour (infrastructure cloud sécurisée)" />
            <InfoRow icon={Globe}     label="Hébergement CDN" value="Vercel Inc. — 340 Pine Street, Suite 1500, San Francisco, CA 94104, USA" />
            <InfoRow icon={BookOpen}  label="Propriété intellectuelle" value="Tout le contenu éditorial d'Apprenix est protégé par le droit d'auteur. Toute reproduction sans autorisation écrite est interdite." />
            <InfoRow icon={Scale}     label="Droit applicable" value="Droit français. Juridiction compétente : Tribunaux français." />
          </dl>
          <div className="mt-4 p-4 rounded-xl bg-muted/50 text-xs text-muted-foreground">
            <strong className="text-foreground">Déclaration CNIL :</strong> Apprenix est conforme à la loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, modifiée par la loi n° 2004-801 du 6 août 2004.
          </div>
        </SectionBlock>

        {/* ── 2. Confidentialité & RGPD ── */}
        <SectionBlock id="confidentialite" icon={Lock} title="Politique de confidentialité & RGPD" badge="RGPD conforme" badgeVariant="success">
          <ul className="space-y-3" aria-label="Points clés RGPD">
            <ComplianceItem label="Base légale du traitement" detail="Consentement explicite de l'utilisateur lors de l'inscription (Art. 6.1.a RGPD)" />
            <ComplianceItem label="Données collectées" detail="Prénom/nom, adresse email, niveau scolaire. Aucune donnée de paiement (service 100 % gratuit)." />
            <ComplianceItem label="Durée de conservation" detail="Données conservées le temps de l'activité du compte + 3 ans. Suppression sur demande sous 30 jours." />
            <ComplianceItem label="Droit d'accès et rectification" detail="Accessible depuis Mon Profil > Paramètres ou par email à apprenix.contact@gmail.com" />
            <ComplianceItem label="Droit à la portabilité et à l'effacement" detail="Export JSON de vos données ou suppression complète du compte sur simple demande." />
            <ComplianceItem label="Cookies" detail="Cookies techniques uniquement (session, préférences d'accessibilité). Aucun cookie publicitaire ou de tracking tiers." />
            <ComplianceItem label="Données des mineurs" detail="Aucune collecte de données sensibles pour les mineurs. Accord parental requis pour les moins de 15 ans (RGPD Art. 8)." />
            <ComplianceItem label="Transferts hors UE" detail="Hébergeur Supabase dispose de clauses contractuelles types (CCT) conformes RGPD pour les transferts USA." />
          </ul>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">DPO :</strong> Pour toute question RGPD, contactez{' '}
              <a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline">apprenix.contact@gmail.com</a>{' '}
              avec l'objet « RGPD — [nature de la demande] ». Délai de réponse garanti : 30 jours calendaires.
            </p>
          </div>
        </SectionBlock>

        {/* ── 3. Accréditations ── */}
        <SectionBlock id="accreditations" icon={Award} title="Accréditations & certifications" badge="Conforme Éduscol" badgeVariant="success">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: BookOpen, title: 'Conformité Éduscol', desc: 'Tous les contenus sont alignés sur les programmes officiels du Ministère de l\'Éducation nationale (programmes 2024–2025).', status: '✅ Actif' },
              { icon: Shield,   title: 'WCAG 2.1 AA',         desc: 'Déclaration d\'accessibilité numérique conforme au niveau AA. Auditée en interne selon le référentiel RGAA 4.1.', status: '✅ Actif' },
              { icon: Lock,     title: 'RGPD',                 desc: 'Conformité au Règlement Général sur la Protection des Données (UE 2016/679). Politique de confidentialité à jour.', status: '✅ Actif' },
              { icon: Globe,    title: 'Hébergement sécurisé', desc: 'Infrastructure Supabase (PostgreSQL, RLS activé) + CDN Vercel. HTTPS obligatoire. Chiffrement au repos et en transit.', status: '✅ Actif' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-border p-4 flex flex-col gap-2 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                      <p className="text-sm font-bold text-foreground">{item.title}</p>
                    </div>
                    <span className="text-xs font-semibold text-success">{item.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-pretty leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Dernière mise à jour de la documentation d'accréditation : juin 2026.
            Apprenix fait l'objet d'une révision interne annuelle de conformité.
          </p>
        </SectionBlock>

        {/* ── 4. Procédures & conformité ── */}
        <SectionBlock id="procedures" icon={ClipboardList} title="Procédures qualité & conformité réglementaire" badge="Processus éditorial" badgeVariant="primary">
          <div className="space-y-5">
            {[
              {
                titre: 'Processus éditorial',
                icon: Wrench,
                points: [
                  'Rédaction par des bénévoles formés aux programmes officiels',
                  'Validation pédagogique croisée avant mise en ligne',
                  'Révision annuelle selon les mises à jour Éduscol',
                  'Signalement d\'erreur accessible depuis chaque fiche',
                ],
              },
              {
                titre: 'Modération du contenu',
                icon: Shield,
                points: [
                  'Modération manuelle de tout nouveau contenu avant publication',
                  'Système de signalement d\'erreur ou de contenu inapproprié',
                  'Délai de traitement des signalements : 72h ouvrées',
                  'Historique de modifications disponible sur demande',
                ],
              },
              {
                titre: 'Sécurité informatique',
                icon: Lock,
                points: [
                  'Row Level Security (RLS) Supabase activé sur toutes les tables',
                  'Authentification JWT + refresh tokens sécurisés',
                  'HTTPS obligatoire — HSTS activé',
                  'Aucun stockage de mots de passe en clair (bcrypt via Supabase Auth)',
                ],
              },
            ].map(section => {
              const SIcon = section.icon;
              return (
                <div key={section.titre}>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                    <SIcon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                    {section.titre}
                  </h3>
                  <ul className="space-y-2" aria-label={section.titre}>
                    {section.points.map(p => (
                      <ComplianceItem key={p} label={p} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </SectionBlock>

        {/* ── 5. Déclaration accessibilité ── */}
        <SectionBlock id="accessibilite" icon={Accessibility} title="Déclaration d'accessibilité numérique" badge="WCAG 2.1 AA — RGAA 4.1" badgeVariant="success" defaultOpen={location.hash === '#accessibilite'}>
          <div className="space-y-5">
            <div className="rounded-xl bg-success/5 border border-success/20 p-4">
              <p className="text-sm font-bold text-foreground mb-1">
                ✅ Apprenix s'engage à rendre son service numérique accessible conformément à l'article 47 de la loi n° 2005-102.
              </p>
              <p className="text-sm text-muted-foreground text-pretty">
                La présente déclaration d'accessibilité s'applique à l'ensemble du site <strong>apprenix.xyz</strong>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Fonctionnalités d'accessibilité intégrées</h3>
              <ul className="space-y-2" aria-label="Fonctionnalités d'accessibilité">
                <ComplianceItem label="Navigation clavier complète" detail="Tous les éléments interactifs sont accessibles au clavier (Tab, Entrée, Espace, flèches)." />
                <ComplianceItem label="Lecteurs d'écran (NVDA, JAWS, VoiceOver, TalkBack)" detail="ARIA labels sur tous les éléments interactifs. Régions sémantiques (main, nav, header, footer)." />
                <ComplianceItem label="Contraste WCAG AA" detail="Ratio de contraste ≥ 4,5:1 pour le texte normal. Renforcé automatiquement en mode 'prefers-contrast: more'." />
                <ComplianceItem label="Taille de texte ajustable" detail="Interface d'accessibilité intégrée (bouton ♿ dans la barre de navigation) : 3 niveaux de grossissement." />
                <ComplianceItem label="Réduction des animations" detail="Respect automatique du mode 'prefers-reduced-motion' (iOS, Android, Windows, macOS)." />
                <ComplianceItem label="Mode fort contraste (Windows HC)" detail="Prise en charge de forced-colors pour Windows High Contrast (HC Black, HC White, Aquatic, Desert)." />
                <ComplianceItem label="Skip link" detail="Lien 'Aller au contenu principal' visible au focus clavier (ancre #main-content)." />
                <ComplianceItem label="Taille des zones cliquables ≥ 44×44px" detail="Conformément à WCAG 2.5.5. Toutes les cibles tactiles respectent le standard sur mobile." />
                <ComplianceItem label="Textes alternatifs sur toutes les images" detail="Attribut alt renseigné ou aria-hidden pour les images purement décoratives." />
                <ComplianceItem label="Synthèse vocale intégrée (TTS)" detail="Lecture à voix haute disponible sur les fiches méthode, quiz et flashcards. Compatible iOS/Android/Windows/macOS." />
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Limites connues et contenus non conformes</h3>
              <ul className="space-y-2">
                <ComplianceItem ok={false} label="Certains PDF non natifs" detail="Des PDF issus de sources tierces peuvent ne pas être intégralement accessibles. En cours de correction (Q3 2026)." />
                <ComplianceItem ok={false} label="Vidéos sans sous-titres" detail="Les vidéos YouTube intégrées ne disposent pas systématiquement de sous-titres. Signalement possible via le formulaire de contact." />
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-bold text-foreground mb-2">Signaler un problème d'accessibilité</h3>
              <p className="text-xs text-muted-foreground text-pretty mb-3">
                Si vous rencontrez un obstacle à l'accessibilité, contactez-nous. Nous nous engageons à traiter votre demande sous 5 jours ouvrés et à proposer une alternative accessible.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="mailto:apprenix.contact@gmail.com?subject=Problème d'accessibilité"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors min-h-[44px]"
                  aria-label="Signaler un problème d'accessibilité par email"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  Signaler par email
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:border-primary/40 hover:text-primary transition-colors min-h-[44px]"
                >
                  Formulaire de contact
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                En cas de réponse non satisfaisante, vous pouvez saisir le <a href="https://www.defenseurdesdroits.fr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Défenseur des droits <ExternalLink className="w-3 h-3 inline" aria-label="(lien externe)" /></a>.
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              <p><strong className="text-foreground">Date de publication :</strong> Juin 2026</p>
              <p className="mt-1"><strong className="text-foreground">Technologie de développement :</strong> React 18, TypeScript, Tailwind CSS, Vite, Supabase</p>
              <p className="mt-1"><strong className="text-foreground">Méthode d'évaluation :</strong> Auto-évaluation interne selon les critères RGAA 4.1 et WCAG 2.1</p>
            </div>
          </div>
        </SectionBlock>

        {/* ── 6. CGU ── */}
        <SectionBlock id="cgu" icon={Scale} title="Conditions générales d'utilisation (CGU)" badge="Mis à jour juin 2026" badgeVariant="primary">
          <div className="space-y-4 text-sm text-foreground">
            {[
              {
                titre: 'Objet et acceptation',
                contenu: 'Les présentes CGU régissent l\'utilisation du service Apprenix accessible sur apprenix.xyz. L\'utilisation du service implique l\'acceptation pleine et entière des présentes conditions.',
              },
              {
                titre: 'Accès au service',
                contenu: 'Apprenix est accessible gratuitement à toute personne disposant d\'un accès à Internet. L\'inscription crée un compte personnel non transmissible.',
              },
              {
                titre: 'Contenu et propriété intellectuelle',
                contenu: 'Le contenu éditorial d\'Apprenix est protégé par le droit d\'auteur. Toute reproduction, diffusion ou exploitation commerciale sans autorisation écrite est interdite.',
              },
              {
                titre: 'Responsabilités de l\'utilisateur',
                contenu: 'L\'utilisateur s\'engage à utiliser le service conformément aux lois en vigueur, à ne pas diffuser de contenu illicite et à préserver la confidentialité de ses identifiants.',
              },
              {
                titre: 'Limitation de responsabilité',
                contenu: 'Apprenix est un service éducatif complémentaire. Il ne remplace pas l\'enseignement officiel. L\'équipe s\'efforce de maintenir la qualité et la conformité des contenus sans pouvoir en garantir l\'exhaustivité.',
              },
              {
                titre: 'Modifications des CGU',
                contenu: 'Les CGU peuvent être modifiées à tout moment. Les utilisateurs sont informés par email en cas de modifications substantielles. L\'utilisation continue du service vaut acceptation des nouvelles CGU.',
              },
            ].map(item => (
              <div key={item.titre}>
                <h3 className="font-bold text-foreground mb-1">{item.titre}</h3>
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{item.contenu}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      </div>

      {/* ── Footer espace public ── */}
      <footer
        className="rounded-2xl border border-border bg-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        aria-label="Navigation retour Espace Public"
      >
        <div>
          <p className="text-sm font-bold text-foreground">Documentation mise à jour</p>
          <p className="text-xs text-muted-foreground mt-0.5">Dernière révision : juin 2026 — Version 3.3</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="min-h-[44px] text-xs">
            <Link to="/espace-public">
              ← Retour à l'Espace Public
            </Link>
          </Button>
          <Button asChild size="sm" className="min-h-[44px] text-xs">
            <Link to="/contact">
              <Mail className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Nous contacter
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default EspacePublicInfosPage;
