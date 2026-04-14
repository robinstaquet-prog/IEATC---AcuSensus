'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserCaseById } from '@/lib/user-cases-store';
import type { ClinicalCase } from '@/types';
import { CasDetailClient } from '@/app/cas/[id]/CasDetailClient';
import { Loader2 } from 'lucide-react';

export default function MesCasPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [cas, setCas] = useState<ClinicalCase | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getUserCaseById(id).then((found) => {
      if (!found) {
        setNotFound(true);
      } else {
        setCas(found);
      }
    });
  }, [id]);

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

  return <CasDetailClient cas={cas} />;
}
