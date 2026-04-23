'use client';

// ─── Store de notifications ────────────────────────────────────────────────────

import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'vote_analyse';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: Record<string, any>): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    data: row.data ?? {},
    read: row.read ?? false,
    createdAt: row.created_at,
  };
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map(fromRow);
}

export async function getUnreadNotifCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) return 0;
  return count ?? 0;
}

export async function markAllNotifsRead(userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
}

export async function insertNotification(
  userId: string,
  type: Notification['type'],
  data: Record<string, unknown>,
): Promise<void> {
  await supabase.from('notifications').insert({
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId,
    type,
    data,
    read: false,
  });
}
