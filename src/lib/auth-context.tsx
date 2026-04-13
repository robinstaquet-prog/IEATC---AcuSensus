'use client';

// ─── Contexte d'authentification — Supabase-ready ────────────────────────────
// MVP : simule un utilisateur connecté si DEMO_MODE = true.
// Production : connecter à Supabase Auth en remplaçant les fonctions ci-dessous.

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';

// Utilisateur de démo — supprimé dès que Supabase Auth est branché
// Utilisateur de démo — rattaché au nouveau modèle (statut + ratio + points de vote)
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'etudiant@demo.ieatc',
  pseudo: 'ÉtudiantDémo',
  role: 'etudiant',
  niveauProfil: 'intermediaire',
  dateInscription: '2025-09-01',
  statut: 'etudiant_4e_annee', // ratio 1.5
  votePoints: 30,               // solde initial (affiché dans la navbar)
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: () => void;
  signOut: () => void;
  addVotePoints: (delta: number) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: false,
  isDemoMode: true,
  signIn: () => {},
  signOut: () => {},
  addVotePoints: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO (production) : remplacer par Supabase Auth
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...)
    // supabase.auth.getUser().then(({ data }) => { setUser(mapSupabaseUser(data.user)); })

    // Mode démo : pas d'utilisateur connecté par défaut
    setIsLoading(false);
  }, []);

  const signIn = () => {
    // TODO : Supabase Auth signInWithOAuth ou signInWithPassword
    setUser(DEMO_USER);
  };

  const signOut = () => {
    // TODO : supabase.auth.signOut()
    setUser(null);
  };

  const addVotePoints = (delta: number) => {
    setUser((prev) =>
      prev ? { ...prev, votePoints: (prev.votePoints ?? 0) + delta } : prev,
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isDemoMode: true, signIn, signOut, addVotePoints }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRequireAuth(): User | null {
  const { user } = useAuth();
  return user;
}
