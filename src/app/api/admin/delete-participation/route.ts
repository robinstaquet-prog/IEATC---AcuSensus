// API route admin — suppression d'une participation (user_participations)
// Utilise la service role key pour contourner RLS.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(req: NextRequest) {
  const { participationId } = await req.json();
  if (!participationId) {
    return NextResponse.json({ error: 'participationId requis' }, { status: 400 });
  }

  if (!SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY non configurée' },
      { status: 500 },
    );
  }

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

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: profile } = await adminClient
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Accès refusé — admin requis' }, { status: 403 });
  }

  const { error } = await adminClient
    .from('user_participations')
    .delete()
    .eq('id', participationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
