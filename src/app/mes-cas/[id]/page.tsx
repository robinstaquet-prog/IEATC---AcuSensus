'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserCaseById } from '@/lib/user-cases-store';
import { getParticipationsByCase } from '@/lib/participation-store';
import { useAuth } from '@/lib/auth-context';
import type { ClinicalCase } from '@/types';
import { CasDetailClient } from '@/app/cas/[id]/CasDetailClient';
import { Loader2, PenLine } from 'lucide-react';

export default function MesCasPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [cas, setCas] = useState<ClinicalCase | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    getUserCaseById(id).then(async (found) => {
      if (!found) {
        setNotFound(true);
        return;
      }
      setCas(found);
      if (user && found.auteurId === user.id) {
        const parts = await getParticipationsByCase(id);
        setCanEdit(parts.length === 0);
      }
    });
  }, [id, user]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Cas introuvable</h1>
          <p className="text-slate-500 mb-6">Ce cas n&apos;existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  if (!cas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <>
      {canEdit && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            href={`/mes-cas/${id}/modifier`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors"
          >
            <PenLine size={14} />
            Modifier ce cas
          </Link>
        </div>
      )}
      <CasDetailClient cas={cas} />
    </>
  );
}
