'use client';

// ─── Comparaison apprentissage — double panneau ─────────────────────────────
// Panneau gauche : analyse de l'apprenant
// Panneau droit : analyses de reference (experts ou valeur >= 50)
// Filtre : "Grilles en commun" (defaut) / "Toutes les analyses"

import { useState, useMemo } from 'react';
import type { ClinicalCase, UserParticipation, ClinicalAnalysis, ReadingGridId } from '@/types';
import { DIFFICULTE_LABELS } from '@/types';
import { GridBadge } from '@/components/ieatc/GridBadge';
import { cn } from '@/lib/utils';
import { Award, Filter } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type FiltreRef = 'grilles_commun' | 'toutes';

interface Props {
  cas: ClinicalCase;
  exercice: UserParticipation;
  /** Participations du store (utilisateur) deja enregistrees pour ce cas. */
  participationsStore: UserParticipation[];
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/** Verifie si une participation/analyse est qualifiee comme reference (expert ou valeur >= 50). */
function isReference(p: UserParticipation | ClinicalAnalysis): boolean {
  const ext = p as UserParticipation & { role?: string; auteurStatut?: string };
  if (ext.role === 'expert' || ext.auteurStatut === 'expert') return true;
  if ((p.valeur ?? 0) >= 50) return true;
  return false;
}

/** Recupere la grille principale d'une participation ou analyse. */
function getGrillePrincipale(p: UserParticipation | ClinicalAnalysis): ReadingGridId | undefined {
  if ('grilleChoisie' in p && p.grilleChoisie) return p.grilleChoisie;
  if ('grillePrincipale' in p && (p as ClinicalAnalysis).grillePrincipale) return (p as ClinicalAnalysis).grillePrincipale;
  return undefined;
}

/** Recupere toutes les grilles d'une participation ou analyse. */
function getAllGrilles(p: UserParticipation | ClinicalAnalysis): ReadingGridId[] {
  const grilles: ReadingGridId[] = [];
  const gp = getGrillePrincipale(p);
  if (gp) grilles.push(gp);
  if ('grilleSecondaire' in p && p.grilleSecondaire) grilles.push(p.grilleSecondaire);
  if ('grillesSecondaires' in p && (p as ClinicalAnalysis).grillesSecondaires) {
    grilles.push(...((p as ClinicalAnalysis).grillesSecondaires ?? []));
  }
  return grilles;
}

// ─── Labels de technique ─────────────────────────────────────────────────────

const TECHNIQUE_LABELS: Record<string, string> = {
  tonification: 'Tonifie',
  dispersion: 'Disperse',
  neutre: 'Neutre',
  moxa: 'Moxa',
  moxa_tonification: 'Moxa + Tonifie',
  moxa_dispersion: 'Moxa + Disperse',
  harmonisation: 'Harmonise',
  dispersion_puis_tonification: 'Disperse puis Tonifie',
};

// ─── Sous-composant : bloc d'analyse (utilisable a gauche et a droite) ──────

function AnalyseBlock({
  participation,
  label,
  expert,
}: {
  participation: UserParticipation;
  label?: string;
  expert?: boolean;
}) {
  const ext = participation as UserParticipation & { auteurPseudo?: string; auteurStatut?: string; role?: string; raisonnement?: string };
  const gp = getGrillePrincipale(participation);
  const gs = 'grilleSecondaire' in participation ? participation.grilleSecondaire : ('grillesSecondaires' in participation ? (participation as unknown as ClinicalAnalysis).grillesSecondaires?.[0] : undefined);

  const bilanPoints = (participation.bilanEnergetique ?? '')
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
  const strategiePoints = (participation.strategie ?? '')
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);

  return (
    <div className={cn(
      'rounded-xl border p-4 space-y-3',
      expert ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white',
    )}>
      {/* En-tete */}
      <div className="flex items-center gap-2 flex-wrap">
        {label && <span className="font-semibold text-sm text-slate-900">{label}</span>}
        {ext.auteurPseudo && !label && (
          <span className="font-semibold text-sm text-slate-900">{ext.auteurPseudo}</span>
        )}
        {expert && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
            <Award size={9} /> EXPERT
          </span>
        )}
        {gp && <GridBadge grilleId={gp} size="sm" />}
        {gs && <GridBadge grilleId={gs} size="sm" />}
      </div>

      {/* Raisonnement (analyses du corpus) */}
      {ext.raisonnement && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Raisonnement</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ext.raisonnement}</p>
        </div>
      )}

      {/* Bilan energetique */}
      {bilanPoints.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Bilan énergétique</p>
          <ul className="space-y-0.5">
            {bilanPoints.map((b, i) => (
              <li key={i} className="text-sm text-slate-700">{i + 1}. {b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strategie */}
      {strategiePoints.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Stratégie thérapeutique</p>
          <ul className="space-y-0.5">
            {strategiePoints.map((s, i) => (
              <li key={i} className="text-sm text-slate-700">{i + 1}. {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Points proposes */}
      {participation.pointsProposer && participation.pointsProposer.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Points proposes</p>
          <div className="space-y-1">
            {participation.pointsProposer.map((pt, i) => {
              const techniqueLabel =
                TECHNIQUE_LABELS[pt.technique ?? ''] ??
                TECHNIQUE_LABELS[pt.action ?? ''] ??
                pt.technique ??
                pt.action ??
                '';
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-mono font-bold text-teal-700">{pt.code}</span>
                  {techniqueLabel && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{techniqueLabel}</span>
                  )}
                  {pt.justification && (
                    <span className="text-xs text-slate-500 italic">{pt.justification}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Niveau de lecture */}
      {participation.difficultéEstimee && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Niveau de lecture :</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
            {DIFFICULTE_LABELS[participation.difficultéEstimee]}
          </span>
        </div>
      )}

      {/* Commentaire libre */}
      {participation.commentaireLibre && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Commentaire</p>
          <p className="text-sm text-slate-600 italic">{participation.commentaireLibre}</p>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────

export function ApprentissageComparaison({ cas, exercice, participationsStore }: Props) {
  const [filtre, setFiltre] = useState<FiltreRef>('grilles_commun');

  // Construire la liste des analyses de reference :
  // 1. Analyses du cas (ClinicalAnalysis) castees en UserParticipation-like
  // 2. Participations du store qualifiees (expert ou valeur >= 50)
  const references = useMemo(() => {
    const refs: (UserParticipation & { auteurPseudo?: string; auteurStatut?: string; role?: string; raisonnement?: string })[] = [];

    // Depuis cas.analyses
    for (const a of cas.analyses) {
      if (!isReference(a)) continue;
      refs.push({
        id: a.id,
        userId: a.auteurId ?? a.id,
        caseId: a.caseId,
        grilleChoisie: a.grillePrincipale,
        grilleSecondaire: a.grillesSecondaires?.[0],
        categoriesRetenues: a.categoriesDiagnostiques ?? [],
        pointsProposer: a.pointsProposer ?? a.pointsUtilises ?? [],
        revelationFaite: true,
        createdAt: '',
        updatedAt: '',
        bilanEnergetique: a.bilanEnergetique,
        strategie: a.strategie ?? a.strategieTherapeutique,
        commentaireLibre: a.commentaireLibre,
        publicationMode: a.publicationMode ?? 'public',
        votes: a.votes ?? [],
        valeur: a.valeur ?? 1.0,
        difficultéEstimee: a.difficultéEstimee,
        auteurPseudo: a.auteurPseudo,
        auteurStatut: a.auteurStatut,
        role: a.role,
        raisonnement: a.raisonnement,
      } as UserParticipation & { auteurPseudo?: string; auteurStatut?: string; role?: string; raisonnement?: string });
    }

    // Depuis participations store
    for (const p of participationsStore) {
      if (!isReference(p)) continue;
      // Eviter les doublons (meme id)
      if (refs.some((r) => r.id === p.id)) continue;
      refs.push(p as UserParticipation & { auteurPseudo?: string; auteurStatut?: string; role?: string; raisonnement?: string });
    }

    return refs;
  }, [cas.analyses, participationsStore]);

  // Filtrer par grilles en commun si necessaire
  const grillesApprenant = useMemo(() => getAllGrilles(exercice), [exercice]);
  const filteredRefs = useMemo(() => {
    if (filtre === 'toutes') return references;
    return references.filter((ref) => {
      const grillesRef = getAllGrilles(ref);
      return grillesRef.some((g) => grillesApprenant.includes(g));
    });
  }, [references, filtre, grillesApprenant]);

  return (
    <div className="space-y-6">
      {/* Filtre */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={14} className="text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Afficher :</span>
        <button
          onClick={() => setFiltre('grilles_commun')}
          className={cn(
            'text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors',
            filtre === 'grilles_commun'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50',
          )}
        >
          Grilles en commun
        </button>
        <button
          onClick={() => setFiltre('toutes')}
          className={cn(
            'text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors',
            filtre === 'toutes'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50',
          )}
        >
          Toutes les analyses
        </button>
      </div>

      {/* Double panneau */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panneau gauche : analyse de l'apprenant */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
            Votre analyse
          </h3>
          <AnalyseBlock participation={exercice} label="Mon exercice" />
        </div>

        {/* Panneau droit : analyses de reference */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            Analyses de reference
            <span className="text-xs text-slate-400 font-normal">({filteredRefs.length})</span>
          </h3>
          {filteredRefs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-500">
                {filtre === 'grilles_commun'
                  ? 'Aucune analyse de reference avec une grille en commun. Essayez "Toutes les analyses".'
                  : 'Aucune analyse de reference disponible pour ce cas.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRefs.map((ref) => (
                <AnalyseBlock
                  key={ref.id}
                  participation={ref}
                  expert={ref.role === 'expert' || ref.auteurStatut === 'expert'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
