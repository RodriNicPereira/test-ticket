export type TicketStatus = 'pendiente' | 'respondido' | 'cerrado';

export interface TicketReply {
  id: string;
  ticket_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  ticket_attachments?: Attachment[];
}

export interface Ticket {
  id: string;
  client_id: string;
  categoria: string;
  subcategoria: string;
  mail: string;
  titular: string;
  grupo: string | null;
  detalle: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  ticket_replies?: TicketReply[];
  ticket_attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string,
  blob_path?: string,
}

export async function getActiveTickets(): Promise<Ticket[]> {
  const r = await fetch('/api/tickets', { cache: 'no-store' });
  const j = await r.json();
  return j.tickets ?? [];
}

export async function createTicket(input: {
  categoria: string; subcategoria: string; mail: string;
  titular: string; grupo?: string; detalle: string;
}): Promise<Ticket> {
  const r = await fetch('/api/tickets', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error);
  return j.ticket;
}

export async function getTicket(id: string,senderType: 'admin' | 'client' = 'client') 
{
  const r = await fetch(`/api/tickets/${id}`, {
    cache: 'no-store',
    credentials: 'include',
    headers: {'x-sender-type': senderType,},
  });
  const j = await r.json();if (!r.ok) {throw new Error(j.error);}
 return j.ticket as Ticket & {ticket_replies: TicketReply[]; ticket_attachments: Attachment[];};
}

export async function sendReply(ticketId: string, content: string, attachments: Omit<Attachment, 'id'>[] = []) {
  const r = await fetch(`/api/tickets/${ticketId}/replies`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'x-sender-type': 'client' },
    body: JSON.stringify({ content, attachments }),
  });
  if (!r.ok) throw new Error((await r.json()).error);
}

export async function closeTicket(ticketId: string) {
  await fetch(`/api/tickets/${ticketId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cerrado' }),
  });
}

export async function uploadFile(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const r = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!r.ok) {
    const err = await r.text();

    console.error(err);

    throw new Error("Error al subir");
  }

  return r.json();
}

export function getStatusLabel(s: TicketStatus) {
  return { pendiente: 'Pendiente', respondido: 'Respondido', cerrado: 'Cerrado' }[s];
}
export function getStatusColor(s: TicketStatus) {
  return {
    pendiente: 'bg-yellow-100 text-yellow-800',
    respondido: 'bg-green-100 text-green-800',
    cerrado: 'bg-gray-100 text-gray-800',
  }[s];
}

export async function getAdminTickets(): Promise<Ticket[]> {
  const r = await fetch('/api/admin/tickets', {
  cache: 'no-store',
  credentials: 'include',
  headers: {
    'x-sender-type': 'admin',
  },
});
  const j = await r.json();
  if (!r.ok) {
    throw new Error(j.error || 'Error cargando tickets');
  }
  return j.tickets ?? [];
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
) {
  const r = await fetch(`/api/tickets/${ticketId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-sender-type': 'admin',
    },
    body: JSON.stringify({ status }),
  });
  const j = await r.json();
  if (!r.ok) {
    throw new Error(j.error || 'Error actualizando ticket');
  }
  return j;
}

export async function sendAdminReply(
  ticketId: string,
  content: string,
  files: File[] = []
) {
  const attachments: Omit<Attachment, 'id'>[] = [];

  for (const file of files) {
    const uploaded = await uploadFile(file);
    attachments.push(uploaded);
  }

  const r = await fetch(`/api/tickets/${ticketId}/replies`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-sender-type': 'admin',
    },
    body: JSON.stringify({
      content,
      attachments,
    }),
  });

  const j = await r.json();

  if (!r.ok) {
    throw new Error(j.error);
  }

  return j;
}

export async function logoutAdmin() {
  await fetch('/api/admin/logout', {
    method: 'POST',
  });
}