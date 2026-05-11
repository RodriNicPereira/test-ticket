export type TicketStatus = "pendiente" | "respondido" | "cerrado";


export interface Reply {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface Ticket {
  id: string;
  categoria: string;
  subcategoria: string;
  mail: string;
  titular: string;
  grupo: string;
  detalle: string;
  attachments: Attachment[];
  status: TicketStatus;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

// Categorías y subcategorías de problemas
export const CATEGORIAS: Record<string, string[]> = {
  "Contraseña": [
    "Cambiar contraseña",
    "No puedo iniciar sesión",
  ],
  "Autenticación en dos factores (2FA)": [
    "Cambiar método",
    "No puedo completar la verificación",
  ],
  "Correo electrónico": [
    "Cambiar correo electrónico",
  ],
  "Transferencias entrantes": [
    "Transferencia no recibida",
    "Demora en acreditación",
    "Verificar estado de una transferencia",
    "No sé cómo localizar una transferencia",
  ],
  "Transferencias salientes": [
    "Transferencia no llegó al destinatario",
    "Transferencia rechazada",
    "Reverso de transferencia",
    "Saldo no actualizado tras rechazo",
  ],
  "Comisiones": [
    "Consulta de comisiones aplicadas",
    "Comisión cobrada incorrectamente",
    "Cómo visualizar comisiones",
    "Porcentajes y costos de la plataforma",
  ],
  "Gestión de usuarios (Colaboradores)": [
    "Crear colaborador",
    "Problemas de acceso de colaborador",
    "Modificar permisos",
    "Inhabilitar colaborador",
  ],
  "Alias": [
    "Cambiar alias",
    "Alias no disponible",
    "Problemas con alias existente",
  ],
  "Integraciones (API / Webhooks)": [
    "Obtener token API",
    "Configurar webhook",
    "Problemas con integración",
    "No recibo eventos/notificaciones",
  ],
  "Problemas técnicos": [
    "Plataforma lenta",
    "Error al iniciar sesión",
    "No puedo acceder a la cuenta",
    "Fallas generales del sistema",
  ],
};

const STORAGE_KEY = "support_tickets";
const SELECTED_TICKET_KEY = "selected_ticket_id";


export function getAllTickets(): Ticket[] {
  return getTickets();
}

export function getTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTicketById(id: string): Ticket | null {
  const tickets = getTickets();
  return tickets.find((t) => t.id === id) || null;
}

export function getActiveTicket(): Ticket | null {
  if (typeof window === "undefined") return null;
  const activeId = localStorage.getItem(SELECTED_TICKET_KEY);
  if (!activeId) return null;
  
  const ticket = getTicketById(activeId);
  if (!ticket) {
    localStorage.removeItem(SELECTED_TICKET_KEY);
    return null;
  }
  
  // Si está cerrado, verificar si pasaron más de 2 días
  if (ticket.status === "cerrado" && ticket.closedAt) {
    const closedDate = new Date(ticket.closedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - closedDate.getTime()) / (1000 * 20); //(1000 * 60 * 60 * 24) = 1 día en milisegundos
    
    if (daysDiff > 2) {
      localStorage.removeItem(SELECTED_TICKET_KEY);
      return null;
    }
  }
  
  return ticket;
}

// Crear nuevo ticket
export function createNewTicket() {
  setActiveTicket(null);
}

// Tickets activos (no cerrados o cerrados hace menos de 2 días)
export function getActiveTickets(): Ticket[] {
  const tickets = getTickets();

  return tickets.filter((ticket) => {
    if (ticket.status !== "cerrado") return true;

    if (!ticket.closedAt) return false;

    const closedDate = new Date(ticket.closedAt);
    const now = new Date();

    const diff = now.getTime() - closedDate.getTime();

    return diff < 1000 * 20;
    // cambiar por:
    // return diff < 2 * 24 * 60 * 60 * 1000;
  });
}

export function setActiveTicket(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(SELECTED_TICKET_KEY, id);
  } else {
    localStorage.removeItem(SELECTED_TICKET_KEY);
  }
}

export function saveTicket(
  ticket: Pick<Ticket, "categoria" | "subcategoria" | "mail" | "titular" | "grupo" | "detalle" | "attachments">
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
  setActiveTicket(newTicket.id);
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
    ...(status === "cerrado" ? { closedAt: new Date().toISOString() } : {}),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  return tickets[index];
}

export function addReply(
  id: string,
  content: string,
  isAdmin: boolean = true,
  attachments?: Attachment[]): Ticket | null {
      const tickets = getTickets();
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const newReply: Reply = {
  id: crypto.randomUUID(),
  content,
  isAdmin,
  createdAt: new Date().toISOString(),
  attachments,
};

  tickets[index] = {
    ...tickets[index],
    replies: [...tickets[index].replies, newReply],
    status: isAdmin ? "respondido" : tickets[index].status,
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
  
  // Si era el ticket activo, limpiarlo
  const activeId = localStorage.getItem(SELECTED_TICKET_KEY);
  if (activeId === id) {
    localStorage.removeItem(SELECTED_TICKET_KEY);
  }
  
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
const ADMIN_PASS = "admin";

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
