// API route admin — suppression d'un cas clinical_cases
// Utilise la service role key pour contourner RLS (corpus cases avec auteur_id = null)
// Vérifie que le demandeur est bien admin avant d'agir.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(req: NextRequest) {
  const { caseId } = await req.json();
  if (!caseId) {
    return NextResponse.json({ error: 'caseId requis' }, { status: 400 });
  }

  if (!SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY non configurée — ajoutez-la dans .env.local' },
      { status: 500 },
    );
  }

  // Vérification que le demandeur est admin via son JWT
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier is_admin dans la table users
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: profile } = await adminClient
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Accès refusé — admin requis' }, { status: 403 });
  }

  // Suppression avec service role (ignore RLS)
  const { error } = await adminClient
    .from('clinical_cases')
    .delete()
    .eq('id', caseId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
