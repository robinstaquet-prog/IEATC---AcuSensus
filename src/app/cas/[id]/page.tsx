import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCaseByIdWithDb, CLINICAL_CASES } from '@/data';
import { CasDetailClient } from './CasDetailClient';

// Permettre les routes dynamiques pour les cas Supabase
export const dynamicParams = true;
export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return CLINICAL_CASES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = await getCaseByIdWithDb(id);
  if (!c) return { title: 'Cas introuvable' };
  return {
    title: `${c.titre} — AcuSensus`,
    description: c.content.motif,
  };
}

export default async function CasDetailPage({ params }: Props) {
  const { id } = await params;
  const c = await getCaseByIdWithDb(id);
  if (!c) notFound();
  return <CasDetailClient cas={c} />;
}
