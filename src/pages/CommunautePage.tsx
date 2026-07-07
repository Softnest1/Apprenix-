import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/db/supabase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  BookOpen, ChevronDown, ChevronUp,
  GraduationCap, Loader2, MessageCircle,
  Plus, Radio, Search, Send, Shield, ThumbsUp, Users, User, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { SCHOOL_LEVELS, SCHOOL_SUBJECTS } from '@/lib/constants';

// ─── Types ─────────────────────────────────────────────────────────────────────

type UserRole = 'Élève' | 'Parent' | 'Professeur' | 'Visiteur';

interface CommunityAnswer {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorLevel: string;
  content: string;
  upvotes: number;
  date: string;
  userVote: 'up' | null;
}

interface CommunityQuestion {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  authorName: string;
  authorRole: UserRole;
  date: string;
  answers: CommunityAnswer[];
  tags: string[];
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const SUBJECTS = SCHOOL_SUBJECTS as readonly string[];
const LEVELS   = SCHOOL_LEVELS   as readonly string[];

const ROLES: UserRole[] = ['Élève', 'Parent', 'Professeur', 'Visiteur'];

// Couleurs de rôles
const ROLE_COLORS: Record<UserRole, string> = {
  'Élève':      'bg-primary/10 text-primary border-primary/25',
  'Parent':     'bg-chart-3/15 text-chart-3 border-chart-3/30',
  'Professeur': 'bg-success/15 text-success border-success/30',
  'Visiteur':   'bg-muted text-muted-foreground border-border',
};
const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  'Élève':      GraduationCap,
  'Parent':     Users,
  'Professeur': Shield,
  'Visiteur':   User,
};

const SUBJECT_TABS = ['Tous sujets', ...SUBJECTS];
const COMMUNITY_TABS: { id: string; label: string; desc: string; role?: UserRole }[] = [
  { id: 'all',        label: 'Toutes',       desc: 'Toutes les discussions' },
  { id: 'Élève',      label: 'Élèves',       desc: 'Entraide entre élèves',        role: 'Élève'      },
  { id: 'Parent',     label: 'Parents',      desc: 'Espace parents',               role: 'Parent'     },
  { id: 'Professeur', label: 'Professeurs',  desc: 'Coin professeurs',             role: 'Professeur' },
];


// ─── Helpers Supabase ─────────────────────────────────────────────────────────

async function fetchQuestions(
  localVotes: Record<string, 'up'>,
): Promise<CommunityQuestion[]> {
  const { data: qRows, error } = await supabase
    .from('community_questions')
    .select('id, title, description, subject, level, author_name, author_role, tags, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !qRows) return [];

  const { data: aRows } = await supabase
    .from('community_answers')
    .select('id, question_id, author_name, author_role, author_level, content, upvotes, created_at')
    .order('upvotes', { ascending: false })
    .limit(500);

  const answersMap: Record<string, CommunityAnswer[]> = {};
  (aRows ?? []).forEach(a => {
    if (!answersMap[a.question_id]) answersMap[a.question_id] = [];
    answersMap[a.question_id].push({
      id: a.id,
      authorName: a.author_name,
      authorRole: (a.author_role ?? 'Élève') as UserRole,
      authorLevel: a.author_level ?? '',
      content: a.content,
      upvotes: a.upvotes ?? 0,
      date: new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      userVote: localVotes[a.id] ?? null,
    });
  });

  return qRows.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description ?? '',
    subject: q.subject,
    level: q.level,
    authorName: q.author_name,
    authorRole: (q.author_role ?? 'Élève') as UserRole,
    date: new Date(q.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    tags: q.tags ?? [],
    answers: answersMap[q.id] ?? [],
  }));
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ role: UserRole; className?: string }> = ({ role, className = '' }) => {
  const Icon = ROLE_ICONS[role];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[role]} ${className}`}>
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      {role}
    </span>
  );
};

const AnswerCard: React.FC<{
  answer: CommunityAnswer;
  onVote: (id: string, current: number) => void;
}> = ({ answer, onVote }) => (
  <div className="flex gap-3 p-3 bg-muted/40 rounded-xl">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      <User className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
    </div>
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-foreground">{answer.authorName}</span>
        <RoleBadge role={answer.authorRole} />
        <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{answer.date}</span>
      </div>
      <p className="text-sm text-foreground text-pretty leading-relaxed whitespace-pre-line">{answer.content}</p>
      <button
        type="button"
        onClick={() => onVote(answer.id, answer.upvotes)}
        disabled={!!answer.userVote}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${
          answer.userVote === 'up'
            ? 'bg-success/20 text-success'
            : 'text-muted-foreground hover:text-success hover:bg-success/10'
        }`}
        title={answer.userVote ? 'Déjà voté' : 'Voter pour cette réponse'}
      >
        <ThumbsUp className="w-3 h-3" /> {answer.upvotes}
      </button>
    </div>
  </div>
);

// ─── Composant principal ───────────────────────────────────────────────────────

const CommunautePage: React.FC = () => {
  const { profile, addXp, addActivity, isAuthenticated } = useApp();

  // Questions
  const [questions, setQuestions]     = useState<CommunityQuestion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [localVotes, setLocalVotes]   = useLocalStorage<Record<string, 'up'>>('apprenix_answer_votes', {});

  // Filtres
  const [communityTab, setCommunityTab] = useState('all');
  const [activeSubject, setActiveSubject] = useState('Tous sujets');
  const [searchQuery, setSearchQuery]   = useState('');

  // UI
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [replyingTo, setReplyingTo]     = useState<string | null>(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  // Formulaire nouvelle question
  const [newTitle, setNewTitle]         = useState('');
  const [newDesc, setNewDesc]           = useState('');
  const [newSubject, setNewSubject]     = useState('');
  const [newLevel, setNewLevel]         = useState('');
  const [visitorName, setVisitorName]   = useState('');
  const [visitorRole, setVisitorRole]   = useState<UserRole>('Élève');

  // Formulaire réponse
  const [replyContent, setReplyContent] = useState('');
  const [replyName, setReplyName]       = useState('');
  const [replyRole, setReplyRole]       = useState<UserRole>('Élève');
  const [realtimeActive, setRealtimeActive] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const data = await fetchQuestions(localVotes);
    setQuestions(data);
    setLoading(false);
  }, [localVotes]);

  useEffect(() => { loadQuestions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Temps réel — nouvelles questions et réponses ───────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('community-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_questions' },
        () => { loadQuestions(); },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_answers' },
        () => { loadQuestions(); },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_answers' },
        () => { loadQuestions(); },
      )
      .subscribe(status => {
        setRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, [loadQuestions]);

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (communityTab !== 'all' && q.authorRole !== communityTab) return false;
      if (activeSubject !== 'Tous sujets' && q.subject !== activeSubject) return false;
      if (searchQuery.trim().length > 1) {
        const s = searchQuery.toLowerCase();
        return q.title.toLowerCase().includes(s) || q.description.toLowerCase().includes(s);
      }
      return true;
    });
  }, [questions, communityTab, activeSubject, searchQuery]);

  // ── Publier question ────────────────────────────────────────────────────────
  const handlePublishQuestion = async () => {
    const authorName = isAuthenticated ? (profile.name || 'Anonyme') : visitorName.trim();
    if (!newTitle.trim() || !newSubject || !newLevel) return;
    if (!isAuthenticated && !authorName) { toast.error('Merci d\'entrer votre prénom ou pseudo.'); return; }
    setSubmitting(true);
    const role: UserRole = isAuthenticated ? ((profile.role as UserRole) ?? visitorRole) : visitorRole;
    const { error } = await supabase.from('community_questions').insert({
      title:       newTitle.trim(),
      description: newDesc.trim(),
      subject:     newSubject,
      level:       newLevel,
      author_name: authorName || 'Anonyme',
      author_role: role,
      tags:        [newSubject, newLevel],
    });
    setSubmitting(false);
    if (error) { toast.error('Erreur lors de la publication. Réessayez.'); return; }
    setNewTitle(''); setNewDesc(''); setNewSubject(''); setNewLevel(''); setVisitorName('');
    setShowNewQuestion(false);
    if (isAuthenticated) { addXp(10); addActivity('Question publiée dans la Communauté'); }
    toast.success('Question publiée ! Elle est maintenant visible par tous.');
    await loadQuestions();
  };

  // ── Publier réponse ─────────────────────────────────────────────────────────
  const handlePublishAnswer = async (questionId: string) => {
    const authorName = isAuthenticated ? (profile.name || 'Anonyme') : replyName.trim();
    if (!replyContent.trim()) return;
    if (!isAuthenticated && !authorName) { toast.error('Merci d\'entrer votre prénom ou pseudo.'); return; }
    setSubmitting(true);
    const role: UserRole = isAuthenticated ? ((profile.role as UserRole) ?? replyRole) : replyRole;
    const { error } = await supabase.from('community_answers').insert({
      question_id:  questionId,
      author_name:  authorName || 'Anonyme',
      author_role:  role,
      author_level: isAuthenticated ? (profile.schoolLevel || role) : role,
      content:      replyContent.trim(),
      upvotes:      0,
    });
    setSubmitting(false);
    if (error) { toast.error('Erreur lors de la publication. Réessayez.'); return; }
    setReplyContent(''); setReplyName(''); setReplyingTo(null);
    if (isAuthenticated) { addXp(15); addActivity('Réponse publiée dans la Communauté'); }
    toast.success('Réponse publiée ! Merci d\'avoir aidé la communauté. 🎉');
    await loadQuestions();
  };

  // ── Voter ───────────────────────────────────────────────────────────────────
  const handleVote = async (answerId: string, currentUpvotes: number) => {
    if (localVotes[answerId]) { toast.info('Vous avez déjà voté pour cette réponse.'); return; }
    const { error } = await supabase.from('community_answers').update({ upvotes: currentUpvotes + 1 }).eq('id', answerId);
    if (error) { toast.error('Erreur lors du vote.'); return; }
    setLocalVotes(prev => ({ ...prev, [answerId]: 'up' }));
    setQuestions(prev => prev.map(q => ({
      ...q,
      answers: q.answers.map(a => a.id === answerId ? { ...a, upvotes: currentUpvotes + 1, userVote: 'up' as const } : a),
    })));
  };

  // ── Stats globales ──────────────────────────────────────────────────────────
  const totalAnswers = useMemo(() => questions.reduce((s, q) => s + q.answers.length, 0), [questions]);

  return (
    <div className="min-w-0 w-full max-w-5xl mx-auto px-4 md:px-5 py-4 md:py-6 space-y-5">
      <h1 className="sr-only">Communauté Apprenix</h1>

      <SEO
        title="Communauté Apprenix — Entraide entre élèves, parents et professeurs"
        description="Posez vos questions, aidez les autres et échangez en communauté. Espace ouvert aux élèves, parents, professeurs et visiteurs. Gratuit, sans pub."
        canonical="/communaute"
        keywords="communauté scolaire, forum élèves, forum professeurs, entraide parents, questions réponses école, forum collège lycée gratuit"
        dateModified="2026-06-26"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-primary text-white" style={{ isolation: 'isolate' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 -left-8 w-40 h-40 rounded-full bg-white/4 blur-2xl" />
        </div>
        <div className="relative z-10 px-5 py-7 md:px-10 md:py-9">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Communauté ouverte à tous
                </span>
                {realtimeActive && (
                  <span className="inline-flex items-center gap-1 bg-success/25 border border-success/40 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    <Radio className="w-3 h-3 animate-pulse" aria-hidden="true" />
                    En direct
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-balance">
                Élèves, parents, professeurs<br className="hidden md:block" /> — bienvenue ici
              </h2>
              <p className="text-white/80 text-sm mt-2 max-w-lg text-pretty">
                Posez vos questions, partagez vos conseils et aidez la communauté. Visiteurs bienvenus — aucun compte requis pour lire et même pour poster.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 shrink-0 md:w-52">
              {[
                { value: String(questions.length), label: 'Discussions', icon: MessageCircle },
                { value: String(totalAnswers),      label: 'Réponses',    icon: ThumbsUp },
                { value: '4',                       label: 'Communautés', icon: Users },
                { value: '100%',                    label: 'Gratuit',     icon: GraduationCap },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="bg-white/10 border border-white/20 rounded-xl p-3">
                  <Icon className="w-4 h-4 text-white/70 mb-1" aria-hidden="true" />
                  <p className="text-white font-extrabold text-lg leading-none">{value}</p>
                  <p className="text-white/60 text-[11px] mt-0.5 leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bouton poser une question ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length} discussion{filtered.length !== 1 ? 's' : ''}
          {communityTab !== 'all' && ` · ${communityTab}s`}
        </p>
        <Button
          className="bg-primary text-primary-foreground shrink-0"
          onClick={() => {
            setShowNewQuestion(v => !v);
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
          }}
        >
          {showNewQuestion ? <X className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
          {showNewQuestion ? 'Annuler' : 'Poser une question'}
        </Button>
      </div>

      {/* ── Formulaire nouvelle question ─────────────────────────────────── */}
      {showNewQuestion && (
        <Card ref={formRef as React.RefObject<HTMLDivElement>} className="border border-primary/30 bg-primary/3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Poser une question à la communauté
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Visiteur : nom + rôle */}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Votre prénom / pseudo *"
                  value={visitorName}
                  onChange={e => setVisitorName(e.target.value)}
                  maxLength={40}
                  aria-label="Votre prénom ou pseudo"
                />
                <Select value={visitorRole} onValueChange={v => setVisitorRole(v as UserRole)}>
                  <SelectTrigger className="h-9 text-sm" aria-label="Votre rôle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Input
              placeholder="Titre de votre question *"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              maxLength={120}
              aria-label="Titre de la question"
            />
            <Textarea
              placeholder="Décrivez votre question en détail (optionnel)…"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Matière *" /></SelectTrigger>
                <SelectContent>
                  {['Autres', ...SUBJECTS].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newLevel} onValueChange={setNewLevel}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Niveau *" /></SelectTrigger>
                <SelectContent>
                  {['Tous niveaux', ...LEVELS].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={handlePublishQuestion}
              disabled={!newTitle.trim() || !newSubject || !newLevel || submitting || (!isAuthenticated && !visitorName.trim())}
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Publier{isAuthenticated ? ' (+10 XP)' : ''}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Layout principal : questions + sidebar ────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Colonne questions ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Onglets communautés */}
          <div className="w-full overflow-x-auto scrollbar-none -mx-1 px-1">
            <div className="flex gap-1.5 flex-nowrap pb-1">
              {COMMUNITY_TABS.map(tab => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setCommunityTab(tab.id)}
                  className={`text-xs px-3 py-2 rounded-full border font-medium whitespace-nowrap shrink-0 transition-colors ${
                    communityTab === tab.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recherche + filtre matière */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Rechercher une discussion…"
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Rechercher dans les discussions"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Effacer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="w-full overflow-x-auto scrollbar-none -mx-1 px-1">
              <div className="flex gap-1.5 flex-nowrap pb-1">
                {SUBJECT_TABS.map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setActiveSubject(s)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap shrink-0 transition-colors ${
                      activeSubject === s
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border/70 text-muted-foreground hover:border-border hover:text-foreground bg-background'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border border-border/60">
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-3 w-1/4 bg-muted" />
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-3 w-1/2 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-14 gap-4 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {questions.length === 0
                      ? 'La communauté démarre — soyez le premier !'
                      : 'Aucune discussion trouvée'}
                  </p>
                  <p className="text-sm text-muted-foreground text-pretty max-w-xs">
                    {questions.length === 0
                      ? 'Posez votre première vraie question. Élèves, parents et professeurs vous répondront.'
                      : 'Essayez un autre filtre ou lancez vous-même cette discussion.'}
                  </p>
                </div>
                <Button size="sm" onClick={() => { setShowNewQuestion(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80); }}>
                  <Plus className="w-4 h-4 mr-1" />
                  {questions.length === 0 ? 'Lancer la première discussion' : 'Poser une question'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(q => {
                const isExpanded = expandedId === q.id;
                return (
                  <Card
                    key={q.id}
                    className={`border transition-colors duration-150 ${isExpanded ? 'border-primary/30' : 'border-border/60 hover:border-border'}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Entête */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <RoleBadge role={q.authorRole} />
                            <Badge variant="outline" className="text-xs">{q.subject}</Badge>
                            <Badge variant="outline" className="text-xs hidden sm:inline-flex">{q.level}</Badge>
                            <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{q.date}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground text-balance leading-snug">{q.title}</h3>
                          {q.description && (
                            <p className="text-sm text-muted-foreground mt-1 text-pretty line-clamp-2">{q.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">Par {q.authorName}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {q.answers.length} réponse{q.answers.length !== 1 ? 's' : ''}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-primary hover:bg-primary/10"
                          onClick={() => {
                            const next = isExpanded ? null : q.id;
                            setExpandedId(next);
                            setReplyingTo(null);
                            if (next) setTimeout(() => document.getElementById(`ans-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
                          }}
                        >
                          {isExpanded
                            ? <><ChevronUp className="w-3 h-3 mr-1" />Masquer</>
                            : <><ChevronDown className="w-3 h-3 mr-1" />Voir les réponses</>}
                        </Button>
                      </div>

                      {/* Réponses dépliables */}
                      {isExpanded && (
                        <div id={`ans-${q.id}`} className="space-y-3 pt-2 border-t border-border/40">
                          {q.answers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Sois le premier à répondre !</p>
                          ) : (
                            q.answers.map(a => (
                              <AnswerCard key={a.id} answer={a} onVote={handleVote} />
                            ))
                          )}

                          {/* Formulaire réponse */}
                          {replyingTo === q.id ? (
                            <div className="space-y-2 pt-2">
                              {!isAuthenticated && (
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="Prénom / pseudo *"
                                    value={replyName}
                                    onChange={e => setReplyName(e.target.value)}
                                    maxLength={40}
                                    className="text-sm"
                                    aria-label="Votre prénom ou pseudo"
                                  />
                                  <Select value={replyRole} onValueChange={v => setReplyRole(v as UserRole)}>
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <Textarea
                                placeholder="Votre réponse…"
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                className="min-h-[80px] resize-none text-sm"
                                maxLength={600}
                                aria-label="Votre réponse"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-primary text-primary-foreground"
                                  onClick={() => handlePublishAnswer(q.id)}
                                  disabled={!replyContent.trim() || submitting || (!isAuthenticated && !replyName.trim())}
                                >
                                  {submitting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                                  Publier{isAuthenticated ? ' (+15 XP)' : ''}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyContent(''); setReplyName(''); }}>
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => setReplyingTo(q.id)}
                            >
                              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                              Répondre à cette question
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-60 shrink-0 space-y-4" aria-label="Informations communauté">

          {/* Communautés */}
          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Communautés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {COMMUNITY_TABS.map(tab => {
                const count = tab.id === 'all' ? questions.length : questions.filter(q => q.authorRole === tab.id).length;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setCommunityTab(tab.id)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      communityTab === tab.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${communityTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Filtre matières */}
          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Matières
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5 pt-0">
              {['Tous sujets', ...SUBJECTS, 'Autres'].map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    activeSubject === s
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Charte */}
          <div className="flex items-start gap-2 rounded-xl border border-success/25 bg-success/5 px-3 py-3">
            <Shield className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground text-pretty leading-relaxed">
              <strong className="text-foreground">Bienveillance obligatoire.</strong>{' '}
              Respectez chacun. Les réponses incorrectes peuvent être signalées via les votes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CommunautePage;
