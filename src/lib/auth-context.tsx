'use client';

// ─── Contexte d'authentification — Supabase Auth réel ────────────────────────
// Login : prénom + nom + mot de passe
// Email interne généré : {prenom}.{nom}@acusensus.app (normalisé)

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  prenom: string;
  nom: string;
  email: string;           // email interne @acusensus.app
  statut_ieatc: string;
  role: string;
  votePoints: number;
  is_admin: boolean;
  annee_promotion?: number;
  annee_diplome?: number;
  lieu_pratique?: string;
  photo_profil?: string;
  mail_public?: string;
  telephone?: string;
  // Compatibilité avec les composants existants
  pseudo: string;
  statut?: string;
  niveauProfil?: string;
  dateInscription?: string;
  anneePromotion?: number;
  lieu?: string;
  photoUrl?: string;
  emailPublic?: string;
}

export interface SignUpData {
  prenom: string;
  nom: string;
  password: string;
  statut_ieatc: string;
  annee_promotion?: number;
  annee_diplome?: number;
  lieu_pratique?: string;
  mail_public?: string;
  telephone?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isLoading: boolean;       // alias pour compatibilité
  isDemoMode: boolean;
  signIn: (prenom: string, nom: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  addVotePoints: (delta: number) => void;
}

// ─── Normalisation email ──────────────────────────────────────────────────────
// {prenom}.{nom}@acusensus.app — lowercase, sans accents, espaces → tirets

export function normalizeEmailPart(str: string): string {
  return str
    .normalize('NFD')                    // décompose les accents
    .replace(/[\u0300-\u036f]/g, '')     // supprime les diacritiques
    .toLowerCase()
    .replace(/\s+/g, '-')               // espaces → tirets
    .replace(/[^a-z0-9.-]/g, '');       // garde seulement a-z 0-9 . -
}

export function buildEmail(prenom: string, nom: string): string {
  return `${normalizeEmailPart(prenom)}.${normalizeEmailPart(nom)}@acusensus.app`;
}

// ─── Mapping DB → AuthUser ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(profile: Record<string, any>): AuthUser {
  const prenom = profile.prenom ?? '';
  const nom = profile.nom ?? '';
  return {
    id: profile.id,
    prenom,
    nom,
    email: profile.email,
    statut_ieatc: profile.statut_ieatc ?? 'etudiant',
    role: profile.role ?? 'etudiant',
    votePoints: profile.points_vote ?? 10,
    is_admin: profile.is_admin ?? false,
    annee_promotion: profile.annee_promotion ?? undefined,
    annee_diplome: profile.annee_diplome ?? undefined,
    lieu_pratique: profile.lieu_pratique ?? undefined,
    photo_profil: profile.photo_profil ?? undefined,
    mail_public: profile.mail_public ?? undefined,
    telephone: profile.telephone ?? undefined,
    // Compatibilité
    pseudo: profile.pseudo ?? `${prenom} ${nom}`.trim() || profile.email,
    statut: profile.statut_ieatc ?? 'etudiant',
    niveauProfil: profile.niveau_profil ?? 'debutant',
    dateInscription: profile.date_inscription ?? '',
    anneePromotion: profile.annee_promotion ?? undefined,
    lieu: profile.lieu_pratique ?? undefined,
    photoUrl: profile.photo_profil ?? undefined,
    emailPublic: profile.mail_public ?? undefined,
  };
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isLoading: true,
  isDemoMode: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshUser: async () => {},
  addVotePoints: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }
    return mapProfile(data);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await fetchProfile(authUser.id);
      setUser(profile);
    } else {
      setUser(null);
    }
  }, [fetchProfile]);

  useEffect(() => {
    // Récupère la session courante au montage
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    // Écoute les changements d'état d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (prenom: string, nom: string, password: string) => {
    const email = buildEmail(prenom, nom);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: 'Identifiants incorrects. Vérifiez votre prénom, nom et mot de passe.' };
    }
    return { error: null };
  };

  const signUp = async (data: SignUpData) => {
    const email = buildEmail(data.prenom, data.nom);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          prenom: data.prenom,
          nom: data.nom,
          statut_ieatc: data.statut_ieatc,
          points_vote: 10,
          is_admin: false,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message?.includes('already registered')) {
        return { error: 'Un compte existe déjà avec ce prénom et ce nom.' };
      }
      return { error: signUpError.message ?? 'Erreur lors de la création du compte.' };
    }

    // Met à jour les champs supplémentaires du profil
    if (authData.user) {
      const updates: Record<string, unknown> = {};
      if (data.annee_promotion !== undefined) updates.annee_promotion = data.annee_promotion;
      if (data.annee_diplome !== undefined) updates.annee_diplome = data.annee_diplome;
      if (data.lieu_pratique) updates.lieu_pratique = data.lieu_pratique;
      if (data.mail_public) updates.mail_public = data.mail_public;
      if (data.telephone) updates.telephone = data.telephone;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('users')
          .update(updates)
          .eq('id', authData.user.id);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const addVotePoints = (delta: number) => {
    setUser((prev) =>
      prev ? { ...prev, votePoints: (prev.votePoints ?? 0) + delta } : prev
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading,
        isDemoMode: false,
        signIn,
        signUp,
        signOut,
        refreshUser,
        addVotePoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRequireAuth(): AuthUser | null {
  const { user } = useAuth();
  return user;
}
