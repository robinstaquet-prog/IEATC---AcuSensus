'use client';

import Link from 'next/link';
import { Users, LogIn, Stethoscope } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function JoinCta() {
  const { user } = useAuth();

  // Ne rien afficher si l'utilisateur est connecté
  if (user) return null;

  return (
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
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-white/90 text-teal-800 font-semibold text-sm hover:bg-white transition-colors"
        >
          <Stethoscope size={14} />
          Créer un compte
        </Link>
        <Link
          href="/connexion"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-teal-300/60 text-white font-medium text-sm hover:bg-teal-500/40 transition-colors"
        >
          <LogIn size={14} />
          Se connecter
        </Link>
      </div>
    </div>
  );
}
