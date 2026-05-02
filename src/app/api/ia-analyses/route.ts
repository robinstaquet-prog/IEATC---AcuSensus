/**
 * API Route : /api/ia-analyses
 *
 * POST  → sauvegarder une analyse terminée
 * GET   → charger les analyses d'un cas (?casId=xxx)
 * DELETE → supprimer une analyse (?id=xxx)
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveAnalyse, loadAnalysesByCas, deleteAnalyse } from '@/lib/five-elements/store';
import type { IaAnalyseInsert } from '@/lib/five-elements/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as IaAnalyseInsert;

    if (!body.cas_id || !body.tier || !body.synthesis) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    const analyse = await saveAnalyse(body);
    if (!analyse) {
      return NextResponse.json({ error: 'Erreur Supabase lors de la sauvegarde.' }, { status: 500 });
    }

    return NextResponse.json(analyse, { status: 201 });
  } catch (err) {
    console.error('[/api/ia-analyses POST]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const casId = req.nextUrl.searchParams.get('casId');
  if (!casId) {
    return NextResponse.json({ error: 'casId requis.' }, { status: 400 });
  }

  const analyses = await loadAnalysesByCas(casId);
  return NextResponse.json(analyses);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id requis.' }, { status: 400 });
  }

  const ok = await deleteAnalyse(id);
  if (!ok) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
