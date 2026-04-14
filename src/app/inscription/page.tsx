'use client';

// ─── Page d'inscription AcuSensus ─────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { UserPlus, Eye, EyeOff, Info } from 'lucide-react';

const STATUTS_IEATC = [
  { value: 'premiere_annee', label: '1ère année' },
  { value: 'etudiant', label: 'Étudiant (2e/3e année)' },
  { value: 'quatrieme_annee', label: '4ème année' },
  { value: 'jeune_praticien', label: 'Jeune praticien' },
  { value: 'praticien_experimente', label: 'Praticien expérimenté' },
];

const STATUTS_DIPLOME = ['jeune_praticien', 'praticien_experimente'];

export default function InscriptionPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statutIeatc, setStatutIeatc] = useState('');
  const [anneePromotion, setAnneePromotion] = useState('');
  const [anneeDiplome, setAnneeDiplome] = useState('');
  const [lieuPratique, setLieuPratique] = useState('');
  const [mailPublic, setMailPublic] = useState('');
  const [telephone, setTelephone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const needsDiplome = STATUTS_DIPLOME.includes(statutIeatc);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prenom.trim() || !nom.trim()) {
      setError('Le prénom et le nom sont obligatoires.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!statutIeatc) {
      setError('Veuillez sélectionner votre statut IEATC.');
      return;
    }
    if (!anneePromotion) {
      setError('L\'année de début d\'études est obligatoire.');
      return;
    }
    if (needsDiplome && !anneeDiplome) {
      setError('L\'année d\'obtention du diplôme est obligatoire pour votre statut.');
      return;
    }

    setSubmitting(true);
    const { error: signUpError } = await signUp({
      prenom: prenom.trim(),
      nom: nom.trim(),
      password,
      statut_ieatc: statutIeatc,
      annee_promotion: anneePromotion ? parseInt(anneePromotion) : undefined,
      annee_diplome: anneeDiplome ? parseInt(anneeDiplome) : undefined,
      lieu_pratique: lieuPratique.trim() || undefined,
      mail_public: mailPublic.trim() || undefined,
      telephone: telephone.trim() || undefined,
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} className="text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Bienvenue sur AcuSensus !</h2>
          <p className="text-slate-500 text-sm">
            Votre compte a été créé. Vous allez être redirigé vers l&apos;accueil…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white mb-4">
            <UserPlus size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
          <p className="text-slate-500 text-sm mt-1">
            Rejoignez la communauté IEATC sur AcuSensus
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Marie"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Dupont"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-slate-100 pt-1" />

            {/* Statut IEATC */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Statut IEATC <span className="text-red-500">*</span>
              </label>
              <select
                value={statutIeatc}
                onChange={(e) => setStatutIeatc(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white"
              >
                <option value="">— Sélectionnez votre statut —</option>
                {STATUTS_IEATC.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {/* Note expert */}
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-400">
                <Info size={12} className="mt-0.5 shrink-0" />
                Les comptes Expert sont créés par l&apos;administration de l&apos;école.
              </p>
            </div>

            {/* Année de début d'études */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Année de début d&apos;études <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={anneePromotion}
                onChange={(e) => setAnneePromotion(e.target.value)}
                placeholder="ex : 2022"
                required
                min={2000}
                max={2030}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>

            {/* Année de diplôme — conditionnelle */}
            {needsDiplome && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Année d&apos;obtention du diplôme <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={anneeDiplome}
                  onChange={(e) => setAnneeDiplome(e.target.value)}
                  placeholder="ex : 2026"
                  required={needsDiplome}
                  min={2000}
                  max={2035}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
            )}

            {/* Séparateur */}
            <div className="border-t border-slate-100 pt-1">
              <p className="text-xs text-slate-400 mb-3">Informations publiques (optionnelles)</p>
            </div>

            {/* Lieu de pratique */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Lieu de pratique / d&apos;étude
              </label>
              <input
                type="text"
                value={lieuPratique}
                onChange={(e) => setLieuPratique(e.target.value)}
                placeholder="Paris, Lyon…"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>

            {/* Mail public */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mail public
              </label>
              <input
                type="email"
                value={mailPublic}
                onChange={(e) => setMailPublic(e.target.value)}
                placeholder="votre@email.fr"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Téléphone public
              </label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="06 00 00 00 00"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-teal-600 text-white font-semibold text-sm hover:bg-teal-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Création en cours…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          {/* Lien connexion */}
          <p className="text-center text-sm text-slate-500 mt-5">
            Déjà un compte ?{' '}
            <Link href="/connexion" className="text-teal-600 hover:text-teal-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
