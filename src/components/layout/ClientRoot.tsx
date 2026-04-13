'use client';

// ─── ClientRoot ───────────────────────────────────────────────────────────────
// Wrapper client chargé au démarrage de l'application.
// Rôle : exécuter les initialisations côté client qui ne peuvent pas se faire
// dans le layout serveur (ex : seed du localStorage).

import { useEffect } from 'react';
import { seedDemoParticipations } from '@/lib/seed-demo';

export function ClientRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Injection des participations démo au premier chargement
    seedDemoParticipations();
  }, []);

  return <>{children}</>;
}
