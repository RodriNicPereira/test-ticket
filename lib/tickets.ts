export type TicketStatus = "pendiente" | "respondido" | "cerrado";

export interface Reply {
  id: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface Ticket {
  id: string;
  mail: string;
  grupo: string;
  asunto: string;
  problema: string;
  attachments: Attachment[];
  status: TicketStatus;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

// Grupos disponibles en Signal
export const GRUPOS = [
  "Grupo A",
  "Grupo B",
  "Grupo C",
  "Grupo D",
];

const STORAGE_KEY = "support_tickets";

export function getTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTicket(
  ticket: Pick<Ticket, "mail" | "grupo" | "asunto" | "problema" | "attachments">
): Ticket {
  const tickets = getTickets();
  const newTicket: Ticket = {
    ...ticket,
    id: crypto.randomUUID(),
    status: "pendiente",
    replies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tickets.push(newTicket);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  return newTicket;
}

export function updateTicketStatus(id: string, status: TicketStatus): Ticket | null {
  const tickets = getTickets();
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tickets[index] = {
    ...tickets[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  return tickets[index];
}

export function addReply(id: string, content: string): Ticket | null {
  const tickets = getTickets();
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const newReply: Reply = {
    id: crypto.randomUUID(),
    content,
    createdAt: new Date().toISOString(),
  };

  tickets[index] = {
    ...tickets[index],
    replies: [...tickets[index].replies, newReply],
    status: "respondido",
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  return tickets[index];
}

export function deleteTicket(id: string): boolean {
  const tickets = getTickets();
  const filtered = tickets.filter((t) => t.id !== id);
  if (filtered.length === tickets.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case "pendiente":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "respondido":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cerrado":
      return "bg-zinc-100 text-zinc-600 border-zinc-200";
  }
}

export function getStatusLabel(status: TicketStatus): string {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "respondido":
      return "Respondido";
    case "cerrado":
      return "Cerrado";
  }
}

// Admin auth
const ADMIN_USER = "admin";
const ADMIN_PASS = "";

export function validateAdmin(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("admin_ok") === "1";
}

export function setAdminAuthed(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    sessionStorage.setItem("admin_ok", "1");
  } else {
    sessionStorage.removeItem("admin_ok");
  }
}
