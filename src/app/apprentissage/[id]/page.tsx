'use client';

// ─── Page d'exercice d'apprentissage pour un cas specifique ──────────────────
// 1. Affiche le cas clinique
// 2. Formulaire de participation (mode 'participation', prive)
// 3. Apres soumission : comparaison double panneau (ApprentissageComparaison)

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCaseById } from '@/data';
import { getParticipationsByCase, isCasApprentissage } from '@/lib/participation-store';
import { getExercice, saveExercice } from '@/lib/exercice-store';
import { ParticipationForm } from '@/components/ieatc/ParticipationForm';
import { ApprentissageComparaison } from '@/components/ieatc/ApprentissageComparaison';
import { PoulsDisplay } from '@/components/ieatc/PoulsDisplay';
import { useAuth } from '@/lib/auth-context';
import type { ClinicalCase, UserParticipation } from '@/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Eye,
  Activity,
} from 'lucide-react';

// ─── Constantes d'affichage ──────────────────────────────────────────────────

const COMPLEXITE_LABELS: Record<number, string> = {
  1: '1ère année',
  2: 'Intermédiaire',
  3: '4ème année',
  4: 'Avancé',
};
const COMPLEXITE_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

const CLE_LABELS: Record<string, string> = {
  douleur: 'Douleur',
  horaire: 'Horaire',
  activite: 'Activité',
  traumatisme: 'Traumatisme',
  preferences: 'Préférences',
  antecedents: 'Antécédents',
  sommeil: 'Sommeil',
  alimentation: 'Alimentation',
  digestion: 'Digestion',
  urine: 'Urines',
  transit: 'Transit',
  energie: 'Énergie',
  temperature: 'Température',
  emotionnel: 'Émotionnel',
  contexte: 'Contexte',
  symptome: 'Symptôme',
  evolution: 'Évolution',
  selles: 'Selles',
  frissons: 'Frissons / chaleur',
  transpiration: 'Transpiration',
  menstruations: 'Menstruations',
  symptomes_tete: 'Symptômes tête',
  oreilles: 'Oreilles',
  coeur: 'Cœur',
  aspect: 'Aspect',
  psychisme: 'Psychisme',
  desirs: 'Désirs',
};

function cleLabel(cle: string): string {
  return CLE_LABELS[cle] ?? cle.charAt(0).toUpperCase() + cle.slice(1).replace(/_/g, ' ');
}

// ─── Etapes de la page ──────────────────────────────────────────────────────

type Etape = 'exercice' | 'comparaison';
type OngletCas = 'clinique' | 'pouls';

export default function ApprentissageExercicePage() {
  const params = useParams();
  const { user } = useAuth();
  const id = params.id as string;

  const [etape, setEtape] = useState<Etape>('exercice');
  const [ongletCas, setOngletCas] = useState<OngletCas>('clinique');
  const [exercice, setExercice] = useState<UserParticipation | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Recuperer le cas (corpus uniquement pour l'apprentissage)
  const cas = useMemo((): ClinicalCase | undefined => {
    return getCaseById(id);
  }, [id]);

  // Charger l'exercice existant si present
  useEffect(() => {
    if (user && cas) {
      const existing = getExercice(user.id, cas.id);
      if (existing) {
        setExercice(existing);
        setEtape('comparaison');
      }
    }
  }, [user, cas]);

  // Participations du store pour ce cas (utilisees dans la comparaison)
  const [participationsStore, setParticipationsStore] = useState<UserParticipation[]>([]);
  useEffect(() => {
    if (cas) getParticipationsByCase(cas.id).then(setParticipationsStore);
  }, [cas]);

  // Ce cas est-il qualifié pour le mode apprentissage ?
  const qualifieApprentissage = useMemo(
    () => (cas ? isCasApprentissage(cas, participationsStore) : false),
    [cas, participationsStore],
  );

  // Texte aplati de l'interrogatoire
  const interrogatoireText = useMemo(() => {
    if (!cas) return '';
    return [
      cas.content.motif,
      ...cas.content.interrogatoire.map((i) => `${i.cle} : ${i.valeur}`),
      cas.content.contexteVie ?? '',
      cas.content.antecedents ?? '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }, [cas]);

  // Callback apres soumission de l'exercice
  const handleSaveExercice = useCallback(
    (data: Partial<UserParticipation>) => {
      if (!user || !cas) return;
      const saved = saveExercice(user.id, { ...data, caseId: cas.id });
      setExercice(saved);
      setEtape('comparaison');
      setShowForm(false);
    },
    [user, cas],
  );

  if (!cas) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 text-lg">Cas introuvable.</p>
        <Link href="/apprentissage" className="text-teal-600 hover:text-teal-700 text-sm mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  if (!qualifieApprentissage) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <GraduationCap size={40} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-700 text-lg font-semibold mb-2">Ce cas n&apos;est pas disponible en mode apprentissage</p>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          Le mode apprentissage est réservé aux cas marqués exemplaires ou validés par un expert ou la communauté.
        </p>
        <Link
          href="/apprentissage"
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          Voir les cas d&apos;apprentissage
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/apprentissage"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Apprentissage
        </Link>
      </div>

      {/* Indicateur exercice prive */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-3 mb-6 flex items-start gap-3">
        <GraduationCap size={16} className="text-teal-600 mt-0.5 shrink-0" />
        <p className="text-sm text-teal-800">
          <strong>Exercice privé</strong> — Cet exercice n&apos;est pas publié et n&apos;affecte ni vos
          points de vote ni les statistiques du cas.
        </p>
      </div>

      {/* Titre du cas */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', COMPLEXITE_COLORS[cas.niveauComplexite])}>
            {COMPLEXITE_LABELS[cas.niveauComplexite]}
          </span>
          {cas.exemplaire && (
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              Apprentissage
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate-900">{cas.titre}</h1>
      </div>

      {/* ─── Onglets du cas clinique ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setOngletCas('clinique')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              ongletCas === 'clinique'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <Eye size={14} />
            Cas clinique
          </button>
          <button
            onClick={() => setOngletCas('pouls')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              ongletCas === 'pouls'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <Activity size={14} />
            Pouls
          </button>
        </div>

        <div className="p-6">
          {ongletCas === 'clinique' && (
            <div className="space-y-6">
              {/* Motif */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Motif de consultation</h3>
                <p className="text-sm text-slate-700">{cas.content.motif}</p>
              </div>

              {/* Interrogatoire */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Interrogatoire</h3>
                <dl className="space-y-2">
                  {cas.content.interrogatoire.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <dt className="text-xs font-semibold text-slate-600 shrink-0 w-28">{cleLabel(item.cle)}</dt>
                      <dd className="text-sm text-slate-700">{item.valeur}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Observation */}
              {cas.content.observation && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Observation</h3>
                  <p className="text-sm text-slate-700">{cas.content.observation}</p>
                </div>
              )}

              {/* Palpation */}
              {cas.content.palpation && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Palpation</h3>
                  <p className="text-sm text-slate-700">{cas.content.palpation}</p>
                </div>
              )}

              {/* Contexte de vie */}
              {cas.content.contexteVie && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Contexte de vie</h3>
                  <p className="text-sm text-slate-700">{cas.content.contexteVie}</p>
                </div>
              )}
            </div>
          )}

          {ongletCas === 'pouls' && (
            <PoulsDisplay prisePouls={cas.content.prisePouls} />
          )}
        </div>
      </div>

      {/* ─── Etape : exercice ou comparaison ─── */}
      {etape === 'exercice' && (
        <>
          {!showForm ? (
            <div className="text-center py-8">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors shadow-sm"
              >
                <GraduationCap size={16} />
                S&apos;entrainer sur ce cas
              </button>
              <p className="text-xs text-slate-400 mt-3">
                Votre exercice sera prive et ne sera pas publie.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap size={16} className="text-teal-600" />
                    Exercice d&apos;apprentissage
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exercice prive — ne sera pas publie
                  </p>
                </div>
              </div>
              {/* Message exercice prive */}
              <div className="mx-6 mt-4 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <p className="text-sm text-slate-600">
                  Cet exercice est privé — il n&apos;impacte pas les statistiques du cas et ne sera pas visible par les autres membres.
                </p>
              </div>
              <div className="overflow-y-auto max-h-[80vh]">
                <ParticipationForm
                  mode="participation"
                  caseId={cas.id}
                  interrogatoireText={interrogatoireText}
                  pulses={cas.content.prisePouls.lectures}
                  pulsesCondition={cas.content.prisePouls.condition}
                  onSave={handleSaveExercice}
                  onCancel={() => setShowForm(false)}
                  skipPersist
                  hidePublicationChoice
                  submitLabel="Passer a la correction"
                />
              </div>
            </div>
          )}
        </>
      )}

      {etape === 'comparaison' && exercice && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-teal-600" />
              Comparaison
            </h2>
            <button
              onClick={() => {
                setEtape('exercice');
                setShowForm(true);
              }}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Refaire l&apos;exercice
            </button>
          </div>
          <ApprentissageComparaison
            cas={cas}
            exercice={exercice}
            participationsStore={participationsStore}
          />
        </div>
      )}
    </div>
  );
}
