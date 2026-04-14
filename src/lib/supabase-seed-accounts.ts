// ─── Script de seed — comptes de démo AcuSensus ───────────────────────────────
// NON auto-exécuté — appeler seedFakeAccounts() manuellement via /admin/seed
// Nécessite que le projet Supabase autorise l'inscription par email.

import { supabase } from '@/lib/supabase';

interface SeedAccount {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  statut_ieatc: string;
  points_vote: number;
  is_admin?: boolean;
}

const DEMO_ACCOUNTS: SeedAccount[] = [
  // ─── Compte administrateur ──────────────────────────────────────────────────
  {
    prenom: 'Robin',
    nom: 'Staquet',
    email: 'robin.staquet@acusensus.app',
    password: 'AcuSensus_Admin_2026!',
    statut_ieatc: 'praticien_experimente',
    points_vote: 1000,
    is_admin: true,
  },
  // ─── Experts / praticiens démo ───────────────────────────────────────────────
  {
    prenom: 'Laurent',
    nom: 'Mercier',
    email: 'laurent.mercier@acusensus.app',
    password: 'AcuSensus2026!',
    statut_ieatc: 'expert',
    points_vote: 200,
  },
  {
    prenom: 'Isabelle',
    nom: 'Fontaine',
    email: 'isabelle.fontaine@acusensus.app',
    password: 'AcuSensus2026!',
    statut_ieatc: 'expert',
    points_vote: 180,
  },
  {
    prenom: 'Marie',
    nom: 'Dubois',
    email: 'marie.dubois@acusensus.app',
    password: 'AcuSensus2026!',
    statut_ieatc: 'praticien_experimente',
    points_vote: 80,
  },
  {
    prenom: 'Thomas',
    nom: 'Bernard',
    email: 'thomas.bernard@acusensus.app',
    password: 'AcuSensus2026!',
    statut_ieatc: 'etudiant',
    points_vote: 30,
  },
];

export interface SeedResult {
  email: string;
  status: 'created' | 'exists' | 'error';
  message?: string;
}

export async function seedFakeAccounts(): Promise<SeedResult[]> {
  const results: SeedResult[] = [];

  for (const account of DEMO_ACCOUNTS) {
    try {
      // Tentative de création du compte Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            prenom: account.prenom,
            nom: account.nom,
            statut_ieatc: account.statut_ieatc,
            points_vote: account.points_vote,
            is_admin: account.is_admin ?? false,
          },
        },
      });

      if (signUpError) {
        // "already registered" = compte existant
        if (
          signUpError.message?.includes('already registered') ||
          signUpError.message?.includes('already exists')
        ) {
          results.push({ email: account.email, status: 'exists', message: 'Compte déjà existant' });
        } else {
          results.push({ email: account.email, status: 'error', message: signUpError.message });
        }
        continue;
      }

      // Met à jour les champs supplémentaires si le user a été créé
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            statut_ieatc: account.statut_ieatc,
            points_vote: account.points_vote,
            is_admin: account.is_admin ?? false,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          results.push({
            email: account.email,
            status: 'created',
            message: `Compte créé mais mise à jour profil échouée : ${updateError.message}`,
          });
        } else {
          results.push({ email: account.email, status: 'created', message: 'Compte créé avec succès' });
        }
      } else {
        // signUp retourné sans erreur ni user = email déjà existant (Supabase v2)
        results.push({ email: account.email, status: 'exists', message: 'Compte déjà existant (email en attente de confirmation)' });
      }
    } catch (err) {
      results.push({
        email: account.email,
        status: 'error',
        message: err instanceof Error ? err.message : 'Erreur inconnue',
      });
    }
  }

  return results;
}
