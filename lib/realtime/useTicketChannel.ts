'use client';

import { useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function useTicketChannel(
  ticketId: string | null,
  onChange: () => void
) {
  useEffect(() => {
    if (!ticketId) return;

    console.log("SUBSCRIBING TO", ticketId);

    const ch = supabaseBrowser
      .channel(`ticket-${ticketId}`)

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_replies',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          console.log("REPLY CHANGE", payload);
          onChange();
        }
      )

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          console.log("TICKET CHANGE", payload);
          onChange();
        }
      )

      .subscribe((status) => {
        console.log("REALTIME STATUS", status);
      });

    return () => {
      supabaseBrowser.removeChannel(ch);
    };
  }, [ticketId]);
}


export function useAdminTicketsChannel(
  onChange: () => void
) {
  useEffect(() => {
    const ch = supabaseBrowser
      .channel('admin-tickets')

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        (payload) => {
          console.log("ADMIN TICKETS CHANGE", payload);
          onChange();
        }
      )

      .subscribe((status) => {
        console.log("ADMIN REALTIME STATUS", status);
      });

    return () => {
      supabaseBrowser.removeChannel(ch);
    };
  }, []);
}