'use client';
import { useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function useTicketChannel(ticketId: string | null, onChange: () => void) {
  useEffect(() => {
    if (!ticketId) return;
    const ch = supabaseBrowser
      .channel(`ticket-${ticketId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ticket_replies', filter: `ticket_id=eq.${ticketId}` },
        onChange)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` },
        onChange)
      .subscribe();
    return () => { supabaseBrowser.removeChannel(ch); };
  }, [ticketId, onChange]);
}

export function useClientTicketsChannel(clientId: string | null, onChange: () => void) {
  useEffect(() => {
    if (!clientId) return;
    const ch = supabaseBrowser
      .channel(`client-${clientId}-tickets`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `client_id=eq.${clientId}` },
        onChange)
      .subscribe();
    return () => { supabaseBrowser.removeChannel(ch); };
  }, [clientId, onChange]);
}