import {
  ArrowRight, BookOpen, Loader2, MessageSquare,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/db/supabase';
import type { DbCollaboration } from '@/db/supabase';
import { getCollaborationsAsTeacher } from '@/lib/api';

type CollabWithStudent = DbCollaboration & { studentName: string; studentInitial: string };

export default function EnseignantMessageriePage() {
  const { user }    = useApp();
  const navigate    = useNavigate();
  const [collabs, setCollabs]   = useState<CollabWithStudent[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const cs = await getCollaborationsAsTeacher(user.id);
        const enriched = await Promise.all(
          cs.map(async c => {
            try {
              const { data } = await supabase
                .from('profiles').select('name').eq('id', c.student_id).maybeSingle();
              const name = data?.name ?? 'Élève';
              return { ...c, studentName: name, studentInitial: name[0]?.toUpperCase() ?? 'É' };
            } catch {
              return { ...c, studentName: 'Élève', studentInitial: 'É' };
            }
          })
        );
        setCollabs(enriched);
      } catch { /* hors ligne */ }
      setLoading(false);
    })();
  }, [user?.id]);

  return (
    <>
      <SEO title="Messagerie — Espace Enseignant" description="Échangez avec vos élèves dans vos espaces de collaboration." />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Messagerie élèves</h1>
          <p className="text-sm text-muted-foreground mt-1 text-pretty">
            Les échanges se déroulent dans vos espaces de collaboration en temps réel.
          </p>
        </div>

        {/* Bandeau info */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Chat en temps réel</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
              Ouvrez un espace de collaboration pour échanger des messages, partager des ressources
              et fixer des objectifs pédagogiques avec votre élève.
            </p>
          </div>
        </div>

        {/* Liste des collaborations */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" aria-label="Chargement…" />
          </div>
        ) : collabs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
              <MessageSquare className="w-7 h-7 text-muted-foreground opacity-50" aria-hidden="true" />
            </div>
            <p className="font-semibold text-foreground">Aucune collaboration active</p>
            <p className="text-sm text-muted-foreground text-pretty max-w-xs mx-auto">
              Les demandes d'accompagnement acceptées créent automatiquement un espace de messagerie.
            </p>
            <Button variant="outline" className="mt-2 h-9" onClick={() => navigate('/espace-enseignant/demandes')}>
              <BookOpen className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Voir les demandes
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {collabs.map(c => (
              <Card
                key={c.id}
                className="border-border/60 hover:border-primary/40 hover:shadow-md transition-[border-color,box-shadow] duration-200 cursor-pointer"
                onClick={() => navigate(`/espace-collaboration/${c.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/espace-collaboration/${c.id}`); }}
                aria-label={`Ouvrir la messagerie avec ${c.studentName}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-11 h-11 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                      {c.studentInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{c.studentName}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                        {c.subject}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Depuis le {new Date(c.created_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span className="hidden md:inline">Ouvrir</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
