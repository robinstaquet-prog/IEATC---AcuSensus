import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  Library,
  Star,
  Eye,
  GitBranch,
  Lightbulb,
  GraduationCap,
  Users,
} from 'lucide-react';
import {
  getCasesExemplaires,
  getCasesRecents,
  computeGlobalStats,
} from '@/data';
import { getGrille, GRILLES } from '@/data/grilles';
import { TutorialAccordion } from '@/components/home/TutorialAccordion';

export default function HomePage() {
  const stats = computeGlobalStats();
  const exemplaires = getCasesExemplaires();
  const recents = getCasesRecents(4);

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-900/60 text-teal-300 text-sm px-3 py-1.5 rounded-full mb-6 border border-teal-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Plateforme pédagogique IEATC
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
              Pensée clinique{' '}
              <span className="text-teal-400">structurée</span>,<br />
              multi-lectures,{' '}
              <span className="text-teal-400">rigoureuse</span>.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl">
              AcuSensus est une base vivante de cas cliniques commentés selon les grilles de lecture
              de l'approche IEATC — Yin/Yang, Cinq Éléments, Zang/Fu, Méridiens et plus.
              Explorez, comparez, consignez votre raisonnement.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/cas"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors"
              >
                <BookOpen size={16} />
                Explorer les cas
              </Link>
              <Link
                href="/apprentissage"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors border border-slate-600"
              >
                <GraduationCap size={16} />
                Mode Apprentissage
              </Link>
              <Link
                href="/lexique"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold text-sm transition-colors"
              >
                <Library size={16} />
                Lexique IEATC
              </Link>
            </div>

            {/* Accordéon tutoriel */}
            <TutorialAccordion />
          </div>
        </div>
      </section>

      {/* ── Barre de stats ── */}
      <section className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
            {[
              { label: 'Cas cliniques', value: stats.casPublies, icon: BookOpen, color: 'text-teal-600' },
              { label: "Cas d'apprentissage", value: stats.casExemplaires, icon: Star, color: 'text-amber-600' },
              { label: 'Analyses déposées', value: stats.totalAnalyses, icon: GitBranch, color: 'text-indigo-600' },
              { label: 'Grilles de lecture', value: GRILLES.length, icon: Lightbulb, color: 'text-emerald-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-5">
                <Icon size={20} className={color} />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Corps de page ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-10">

            {/* Cas exemplaires */}
            {exemplaires.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Cas d'apprentissage</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Validés suffisamment par la communauté
                    </p>
                  </div>
                  <Link
                    href="/cas"
                    className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
                  >
                    Tous les cas <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {exemplaires.map((c) => (
                    <Link key={c.id} href={`/cas/${c.id}`} className="group block">
                      <article className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                <Star size={9} />
                                Apprentissage
                              </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-1">
                              {c.titre}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{c.content.motif}</p>
                          </div>
                          <div className="text-right shrink-0 text-xs text-slate-400 space-y-1">
                            <div className="flex items-center gap-1 justify-end">
                              <Eye size={12} /> {c.viewCount}
                            </div>
                            {c.age && (
                              <div>
                                {c.age} ans
                                {c.sexe && c.sexe !== 'non_precise' && (
                                  <span> · {c.sexe === 'feminin' ? 'F' : 'H'}</span>
                                )}
                              </div>
                            )}
                            <div>{c.analyses.length} analyse{c.analyses.length > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Cas récents */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Cas récents</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Dernières mises à jour</p>
                </div>
                <Link
                  href="/cas"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
                >
                  Tous les cas <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {recents.map((c) => (
                  <Link key={c.id} href={`/cas/${c.id}`} className="group block">
                    <article className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-4 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {c.exemplaire && (
                          <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
                            <Star size={10} /> Apprentissage
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-teal-700 transition-colors flex-1">
                        {c.titre}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{c.content.motif}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {c.age ? `${c.age} ans` : ''}
                          {c.sexe && c.sexe !== 'non_precise' && ` · ${c.sexe === 'feminin' ? 'F' : 'H'}`}
                        </span>
                        <span>{c.analyses.length} analyse{c.analyses.length > 1 ? 's' : ''}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Points les plus utilisés */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-4">Points les plus utilisés</h3>
              <div className="space-y-2.5">
                {stats.topPoints.slice(0, 8).map(({ id, count }) => (
                  <div key={id} className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-800 w-10 shrink-0">
                      {id}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{
                          width: `${(count / (stats.topPoints[0]?.count ?? 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grilles de lecture */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-4">Grilles de lecture</h3>
              <div className="space-y-2">
                {stats.topGrilles.map(({ id, count }) => {
                  const grille = getGrille(id as Parameters<typeof getGrille>[0]);
                  if (!grille) return null;
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${grille.colorClass} ${grille.textClass}`}
                      >
                        {grille.nomCourt}
                      </span>
                      <span className="text-xs text-slate-400">
                        {count} analyse{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Participer */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-teal-200" />
                <h3 className="font-semibold text-sm">Rejoindre la communauté</h3>
              </div>
              <p className="text-teal-100 text-xs leading-relaxed mb-4">
                Déposez votre analyse sur un cas, entraînez-vous en mode apprentissage,
                votez pour les raisonnements les plus solides.
              </p>
              <div className="space-y-2">
                <Link
                  href="/inscription"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-white text-teal-700 font-semibold text-sm hover:bg-teal-50 transition-colors"
                >
                  Créer un compte
                </Link>
                <Link
                  href="/connexion"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-teal-400/50 text-teal-100 font-medium text-sm hover:bg-teal-600 transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </div>

            {/* Navigation rapide */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Navigation</h3>
              <div className="space-y-1">
                {[
                  { href: '/cas', label: 'Tous les cas cliniques', icon: BookOpen },
                  { href: '/apprentissage', label: 'Mode Apprentissage', icon: GraduationCap },
                  { href: '/lexique', label: 'Lexique IEATC', icon: Library },
                  { href: '/statistiques', label: 'Statistiques', icon: BarChart3 },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <Icon size={15} className="text-teal-600" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
                    <ArrowRight
                      size={13}
                      className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
