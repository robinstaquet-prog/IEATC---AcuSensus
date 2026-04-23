'use client';

// ─── Store de messagerie ──────────────────────────────────────────────────────

import { supabase } from '@/lib/supabase';
import { insertNotification } from '@/lib/notification-store';

export interface Message {
  id: string;
  senderId: string;
  senderPrenom: string;
  senderNom: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: Record<string, any>): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderPrenom: row.sender_prenom ?? '',
    senderNom: row.sender_nom ?? '',
    recipientId: row.recipient_id,
    content: row.content,
    read: row.read ?? false,
    createdAt: row.created_at,
  };
}

export async function getReceivedMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(fromRow);
}

export async function sendMessage(
  senderId: string,
  senderPrenom: string,
  senderNom: string,
  recipientId: string,
  content: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('messages').insert({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender_id: senderId,
    sender_prenom: senderPrenom,
    sender_nom: senderNom,
    recipient_id: recipientId,
    content,
    read: false,
  });
  if (error) return { error: error.message };

  // Notification pour le destinataire
  await insertNotification(recipientId, 'message', {
    senderId,
    senderPrenom,
    senderNom,
    preview: content.slice(0, 120),
  });

  return { error: null };
}

export async function markMessageRead(messageId: string): Promise<void> {
  await supabase.from('messages').update({ read: true }).eq('id', messageId);
}

export async function markAllMessagesRead(userId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('recipient_id', userId)
    .eq('read', false);
}
