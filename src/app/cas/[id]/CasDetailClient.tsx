'use client';

// ─── Page détail d'un cas — Phase 3 ───────────────────────────────────────────
// - Onglets principaux : Cas clinique / Pouls (données brutes)
// - L'analyse est masquée jusqu'au déverrouillage (bouton explicite)
// - Une fois déverrouillée, 3 formes d'analyse (participations / synthèse / filtre)

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  getParticipation,
  upsertParticipation,
  markRevelation,
  getParticipationsByCase,
  computeDifficulty,
  removeParticipation,
  syncParticipationIfNeeded,
  isCasApprentissage,
} from '@/lib/participation-store';
import { PoulsDisplay } from '@/components/ieatc/PoulsDisplay';
import { ParticipationForm } from '@/components/ieatc/ParticipationForm';
import { AnalysePanel } from '@/components/ieatc/AnalysePanel';
import type { ClinicalCase, UserParticipation, ClinicalAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import { COMPLEXITE_LABELS, COMPLEXITE_COLORS, cleLabel } from '@/lib/constants';
import {
  ArrowLeft,
  Star,
  Eye,
  BookOpen,
  Unlock,
  Lock,
  PenLine,
  X,
  GitBranch,
  CheckCircle2,
  Activity,
  FileText,
  BarChart2,
  Trash2,
  GraduationCap,
} from 'lucide-react';

// ─── Modal participation ───────────────────────────────────────────────────────

function ParticipationModal({
  caseId,
  cas,
  userId,
  onClose,
  onSaved,
}: {
  caseId: string;
  cas: ClinicalCase;
  userId: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [existing, setExisting] = useState<UserParticipation | undefined>(undefined);

  useEffect(() => {
    getParticipation(userId, caseId).then(setExisting);
  }, [userId, caseId]);

  const handleSave = async (data: Partial<UserParticipation>) => {
    await upsertParticipation(userId, { ...data, caseId });
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[96dvh] flex flex-col">
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">
              {existing ? 'Modifier ma participation' : 'Consigner mon analyse'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Publiée (publique ou anonyme) dans la base de participations
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ParticipationForm
            mode="participation"
            caseId={caseId}
            interrogatoireText={[
              cas.content.motif,
              ...cas.content.interrogatoire.map((i) => `${i.cle} : ${i.valeur}`),
              cas.content.contexteVie ?? '',
              cas.content.antecedents ?? '',
            ]
              .filter(Boolean)
              .join('\n\n')}
            pulses={cas.content.prisePouls.lectures}
            pulsesCondition={cas.content.prisePouls.condition}
            existingParticipation={existing}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────

interface CasDetailClientProps {
  cas: ClinicalCase;
}

type MainTab = 'clinique' | 'pouls_langue';

export function CasDetailClient({ cas }: CasDetailClientProps) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const [hasParticipation, setHasParticipation] = useState(false);
  const [showParticipation, setShowParticipation] = useState(false);
  // Modale de confirmation avant modification d'une participation existante
  const [showConfirmModif, setShowConfirmModif] = useState(false);
  // Modale de confirmation avant suppression de la participation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('clinique');
  // Texte langue du cas — optionnel, à enrichir quand le type CaseContent sera étendu
  const langueTexteCas: string | undefined = undefined;
  const [participations, setParticipations] = useState<UserParticipation[]>([]);
  // Difficulté estimée par la communauté (calculée après chargement des participations)
  const [difficultyInfo, setDifficultyInfo] = useState<ReturnType<typeof computeDifficulty>>(null);
  // Ce cas est-il qualifié pour le mode apprentissage ?
  const isApprentissage = useMemo(
    () => isCasApprentissage(cas, participations),
    [cas, participations],
  );

  const refreshParticipations = useCallback(async () => {
    const parts = await getParticipationsByCase(cas.id);
    setParticipations(parts);
    setDifficultyInfo(computeDifficulty(parts));
  }, [cas.id]);

  // Participation factices issues de cas.analyses (variantes) — affichées dans AnalysePanel
  // Les ClinicalAnalysis sont compatibles avec UserParticipation via un cast :
  //   grillePrincipale → grilleChoisie, grillesSecondaires[0] → grilleSecondaire
  const analyseVariantes = useMemo((): UserParticipation[] =>
    (cas.analyses ?? [])
      .filter((a: ClinicalAnalysis) => a.type === 'variante')
      .map((a: ClinicalAnalysis) => ({
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
        // Champs annotations et affichage
        annotationsInterrogatoire: a.annotationsInterrogatoire ?? [],
        annotationsPouls: a.annotationsPouls ?? [],
        langueTexte: a.langueTexte,
        annotationsLangue: a.annotationsLangue ?? [],
        bilanEnergetique: a.bilanEnergetique,
        strategie: a.strategie,
        commentaireLibre: a.commentaireLibre,
        publicationMode: a.publicationMode ?? 'public',
        votes: a.votes ?? [],
        valeur: a.valeur ?? 1.0,
        difficultéEstimee: a.difficultéEstimee,
        // Champs bonus (lus via cast dans AnalysePanel)
        auteurPseudo: a.auteurPseudo,
        auteurStatut: a.auteurStatut,
        role: a.role,
      } as UserParticipation & { auteurPseudo?: string; auteurStatut?: string; role?: string })),
  [cas.analyses]);

  useEffect(() => {
    void refreshParticipations();
    if (user) {
      getParticipation(user.id, cas.id).then((p) => {
        if (p) {
          setHasParticipation(true);
          if (p.revelationFaite) setRevealed(true);
        }
      });
    }
  }, [user, cas.id, refreshParticipations]);

  const handleReveal = () => {
    setRevealed(true);
    if (user) void markRevelation(user.id, cas.id);
  };

  const handleDeleteParticipation = () => {
    if (!user) return;
    removeParticipation(user.id, cas.id).then(() => {
      setHasParticipation(false);
      setShowConfirmDelete(false);
      void refreshParticipations();
    });
  };

  const [analyseVariantesOverrides, setAnalyseVariantesOverrides] = useState<Map<string, UserParticipation>>(new Map());

  const allParticipations = useMemo(() => {
    const analyseIds = new Set(analyseVariantes.map((a) => a.id));
    const resolvedVariantes = analyseVariantes.map((a) => analyseVariantesOverrides.get(a.id) ?? a);
    return [...resolvedVariantes, ...participations.filter((p) => !analyseIds.has(p.id))];
  }, [analyseVariantes, participations, analyseVariantesOverrides]);

  const onVoted = (updated: UserParticipation) => {
    setParticipations((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setAnalyseVariantesOverrides((prev) => new Map(prev).set(updated.id, updated));
  };

  // Nombre d'analyses = nombre de participations (pas les analyses officielles)
  const nbLectures = participations.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
        <Link href="/cas" className="flex items-center gap-1.5 hover:text-teal-600 transition-colors">
          <ArrowLeft size={14} />
          Cas cliniques
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium line-clamp-1">{cas.titre}</span>
      </div>

      {/* En-tête du cas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {cas.exemplaire && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                <Star size={10} />
                Apprentissage
              </span>
            )}
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                COMPLEXITE_COLORS[cas.niveauComplexite],
              )}
            >
              {COMPLEXITE_LABELS[cas.niveauComplexite]}
            </span>
            <span className="flex items-center gap-1 text-slate-400 text-xs ml-auto">
              <Eye size={12} />
              {cas.viewCount}
            </span>
          </div>
          {/* Nom anonyme — pas de préfixe "PATIENT" */}
          <h1 className="text-2xl font-bold text-white leading-tight">{cas.titre}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-slate-100 bg-slate-50/60">
          <div className="px-5 py-3">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Profil</p>
            <p className="text-slate-700 text-sm font-medium">
              {cas.age ? `${cas.age} ans` : '—'}
              {cas.sexe && cas.sexe !== 'non_precise' && (
                <span className="ml-1 text-slate-500">
                  · {cas.sexe === 'feminin' ? 'Femme' : 'Homme'}
                </span>
              )}
            </p>
          </div>

          <div className="px-5 py-3">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
              Analyses
            </p>
            <p className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
              <GitBranch size={13} className="text-indigo-400" />
              {nbLectures} analyse{nbLectures > 1 ? 's' : ''}
            </p>
          </div>

          {difficultyInfo && (
            <div className="px-5 py-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Difficulté estimée</p>
              <p className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                <BarChart2 size={13} className="text-violet-400" />
                {difficultyInfo.label}
                <span className="text-xs text-slate-400 font-normal ml-1">
                  ({difficultyInfo.count}/{difficultyInfo.total})
                </span>
              </p>
            </div>
          )}

          <div className="px-5 py-3">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">État</p>
            {revealed ? (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <Unlock size={11} /> Analyse révélée
              </span>
            ) : hasParticipation ? (
              <span className="text-xs font-medium text-teal-600 flex items-center gap-1">
                <CheckCircle2 size={11} /> Déjà participé
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                <Lock size={11} /> Analyse masquée
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          {!revealed ? (
            <>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" />
                L'analyse communautaire est masquée
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Lisez le cas, consignez votre raisonnement, puis déverrouillez.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              Analyse déverrouillée — explorez les 3 formes ci-dessous.
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          {isApprentissage && (
            <Link
              href={`/apprentissage/${cas.id}`}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium"
            >
              <GraduationCap size={14} />
              Mode apprentissage
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                if (hasParticipation) {
                  setShowConfirmModif(true);
                } else {
                  setShowParticipation(true);
                }
              }}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              <PenLine size={14} />
              {hasParticipation ? 'Modifier ma participation' : 'Consigner mon analyse'}
            </button>
          ) : (
            <Link
              href="/connexion"
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors font-medium"
            >
              <PenLine size={14} />
              Connexion pour participer
            </Link>
          )}
          {user && hasParticipation && (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              title="Supprimer ma participation"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          )}
          {!revealed && (
            <button
              onClick={handleReveal}
              className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors font-semibold"
            >
              <Unlock size={14} />
              Déverrouiller l'analyse
            </button>
          )}
        </div>
      </div>

      {/* Onglets principaux : Clinique / Pouls */}
      <div className="flex items-center gap-1 mb-5 border-b border-slate-200">
        <TabBtn active={mainTab === 'clinique'} onClick={() => setMainTab('clinique')} icon={<FileText size={14} />}>
          Cas clinique
        </TabBtn>
        <TabBtn active={mainTab === 'pouls_langue'} onClick={() => setMainTab('pouls_langue')} icon={<Activity size={14} />}>
          Pouls, Langue & Examens
        </TabBtn>
      </div>

      {mainTab === 'clinique' && (
        <div className="space-y-5">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">
              <BookOpen size={13} className="text-teal-600" />
              Motif de consultation
            </h2>
            <p className="text-slate-800 leading-relaxed font-medium">{cas.content.motif}</p>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Anamnèse & interrogatoire
            </h2>
            <dl className="divide-y divide-slate-50">
              {cas.content.interrogatoire.map((item, i) => (
                <div key={i} className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-sm">
                  <dt className="font-semibold text-slate-500 pt-0.5 shrink-0">
                    {cleLabel(item.cle)}
                  </dt>
                  <dd className="text-slate-700 leading-relaxed">{item.valeur}</dd>
                </div>
              ))}
              {cas.content.contexteVie && (
                <div className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-sm">
                  <dt className="font-semibold text-slate-500 pt-0.5 shrink-0">
                    Contexte de vie
                  </dt>
                  <dd className="text-slate-700 leading-relaxed">{cas.content.contexteVie}</dd>
                </div>
              )}
              {cas.content.antecedents && (
                <div className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-sm">
                  <dt className="font-semibold text-slate-500 pt-0.5 shrink-0">Antécédents</dt>
                  <dd className="text-slate-700 leading-relaxed">{cas.content.antecedents}</dd>
                </div>
              )}
            </dl>
          </section>

          {(cas.content.observation || cas.content.palpation) && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wide">
                Observation & palpation
              </h2>
              <dl className="divide-y divide-slate-50">
                {cas.content.observation && (
                  <div className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-sm">
                    <dt className="font-semibold text-slate-500 pt-0.5">Observation</dt>
                    <dd className="text-slate-700 leading-relaxed">{cas.content.observation}</dd>
                  </div>
                )}
                {cas.content.palpation && (
                  <div className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-sm">
                    <dt className="font-semibold text-slate-500 pt-0.5">Palpation</dt>
                    <dd className="text-slate-700 leading-relaxed">{cas.content.palpation}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {cas.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cas.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-400 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {mainTab === 'pouls_langue' && (
        <div className="space-y-5">
          {/* Section Pouls — données brutes, aucune interprétation */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Prise de pouls — données brutes
            </h2>
            <div className="mb-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              Positions et qualités brutes uniquement — aucune interprétation. Les analyses des
              experts et des participants sont accessibles dans l'analyse déverrouillée.
            </div>
            <PoulsDisplay prisePouls={cas.content.prisePouls} />
          </section>

          {/* Section Langue */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Examen de la langue
            </h2>
            {langueTexteCas ? (
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {langueTexteCas}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
                Aucune donnée de langue pour ce cas.
              </p>
            )}
          </section>

          {/* Section Examens complémentaires */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Examens complémentaires
            </h2>
            <p className="text-sm text-slate-400 italic bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
              Aucun examen complémentaire pour ce cas.
            </p>
          </section>
        </div>
      )}

      {/* Panneau analyse déverrouillée */}
      {revealed && (
        <div className="mt-6">
          <AnalysePanel cas={cas} participations={allParticipations} onVote={onVoted} />
          {!user && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <Lock size={15} className="text-slate-400 shrink-0" />
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">Connectez-vous</span> pour consigner
                votre participation et voter sur les analyses.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modale de confirmation avant modification d'une participation existante */}
      {showConfirmModif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowConfirmModif(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base leading-snug">Votre avis compte</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ne changez pas votre analyse par peur de non-conformité, mais seulement si vous
              reconnaissez vous être trompé !
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmModif(false);
                  setShowParticipation(true);
                }}
                className="flex-1 text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors font-semibold"
              >
                Continuer
              </button>
              <button
                onClick={() => setShowConfirmModif(false)}
                className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression de la participation */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowConfirmDelete(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base leading-snug">
              Êtes-vous sûr de vouloir supprimer votre participation ?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cette action est irréversible. Votre participation sera définitivement effacée.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeleteParticipation}
                className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors font-semibold"
              >
                <Trash2 size={14} />
                Supprimer définitivement
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal participation */}
      {showParticipation && user && (
        <ParticipationModal
          caseId={cas.id}
          cas={cas}
          userId={user.id}
          onClose={() => setShowParticipation(false)}
          onSaved={() => {
            setShowParticipation(false);
            setHasParticipation(true);
            void refreshParticipations();
          }}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
        active
          ? 'border-teal-600 text-teal-700'
          : 'border-transparent text-slate-500 hover:text-slate-700',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
