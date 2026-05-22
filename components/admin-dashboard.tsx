"use client";

import { useState, useEffect, useRef } from "react";
import {
  getAdminTickets,
  updateTicketStatus,
  sendAdminReply,
  logoutAdmin,
  getStatusLabel,
  type Ticket,
  type TicketStatus,
  getTicket,
} from "@/lib/api/tickets"; 
import {
  LogOut,
  Send,
  X,
  Paperclip,
  FileText,
  Download,
  User,
  Mail,
  Users,
  Tag,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import {
  useTicketChannel,
  useAdminTicketsChannel
} from "@/lib/realtime/useTicketChannel";

export function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<TicketStatus | "todos">("todos");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  loadTickets();
  }, []);

  useEffect(() => {
   // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.ticket_replies]);

useTicketChannel(
  selectedTicket?.id || null,
  async () => {
    await loadTickets();
  }
);

useAdminTicketsChannel(async () => {
  await loadTickets();
});

  const loadTickets = async () => {
  try {
    const updated = await getAdminTickets();

    setTickets(updated);

    if (selectedTicket?.id) {
      const fullTicket = await getTicket(selectedTicket.id , 'admin');
      setSelectedTicket(fullTicket);
    }

  } catch (error) {
    console.error(error);
  }
};
  
  const handleStatusChange = async (
  id: string,
  status: TicketStatus
) => {
  try {
    await updateTicketStatus(id, status);

    await loadTickets();
  } catch (error) {
    console.error(error);
  }
};

  const handleSendReply = async () => {
  if (!selectedTicket) return;

  if (!replyText.trim() && files.length === 0) return;

  try {
    setIsSending(true);

    const formData = new FormData();

    formData.append("message", replyText);

    files.forEach((file) => {
      formData.append("files", file);
    });

    await sendAdminReply(selectedTicket.id,replyText.trim(),files);

    setReplyText("");
    setFiles([]);

    await loadTickets();
  } catch (error) {
    console.error(error);
  } finally {
    setIsSending(false);
  }
};

  const handleCloseTicket = () => {
    if (!selectedTicket) return;
    handleStatusChange(selectedTicket.id, "cerrado");
  };

  const handleLogout = async () => {
  await logoutAdmin();

  window.location.href = "/admin/login";
};

  const filteredTickets = tickets.filter((ticket) => {
    const matchFilter = filter === "todos" || ticket.status === filter;
    const matchSearch = !searchTerm || 
      ticket.mail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.titular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subcategoria?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendingCount = tickets.filter((t) => t.status === "pendiente").length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pendiente": return "bg-[rgba(240,180,41,0.15)] text-gold";
      case "respondido": return "bg-[rgba(46,204,113,0.12)] text-green";
      case "cerrado": return "bg-surface-3 text-muted-foreground";
      default: return "";
    }
  };

  const getCatIcon = (categoria: string) => {
    if (categoria.includes("Contraseña")) return "🔐";
    if (categoria.includes("2FA") || categoria.includes("Autenticación")) return "🛡️";
    if (categoria.includes("Correo") || categoria.includes("electrónico")) return "📧";
    if (categoria.includes("entrantes")) return "📥";
    if (categoria.includes("salientes")) return "📤";
    if (categoria.includes("Comisiones")) return "💰";
    if (categoria.includes("usuarios") || categoria.includes("Colaboradores")) return "👥";
    if (categoria.includes("Alias")) return "🏷️";
    if (categoria.includes("API") || categoria.includes("Integraciones") || categoria.includes("Webhook")) return "🔗";
    return "⚠️";
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-surface border-b border-border px-5 h-[54px] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d5598bf3-9085-4c31-924a-08016435a769-85ZnfnTIg2ZJhpDbVhWczVcAoy7S2s.png"
            alt="RECASH Logo"
            width={120}
            height={40}
            className="h-7 w-auto"
          />
          <span className="text-border-2">·</span>
          <span className="text-xs text-muted-foreground">
            Soporte <span className="inline-block w-[7px] h-[7px] rounded-full bg-green ml-1.5 animate-pulse-green" />
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[rgba(240,180,41,0.12)] text-gold border border-[rgba(240,180,41,0.2)]">
            {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-2 text-muted-foreground border border-border">
            {tickets.length} total
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground bg-transparent border border-border-2 rounded-md px-3 py-1.5 hover:text-foreground hover:border-border-2 transition-all"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[320px] bg-surface border-r border-border flex flex-col flex-shrink-0">
          {/* Filter tabs */}
          <div className="p-3.5 border-b border-border">
            <div className="flex gap-0.5 bg-surface-2 rounded-lg p-0.5">
              {(["todos", "pendiente", "respondido", "cerrado"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 text-[11px] py-1.5 px-1 rounded-md transition-all font-medium whitespace-nowrap ${
                    filter === f
                      ? "bg-surface-3 text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "todos" ? "Todos" : f === "respondido" ? "Resp." : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "pendiente" && pendingCount > 0 && (
                    <span className="ml-1 min-w-[16px] h-[16px] rounded-lg bg-[rgba(240,180,41,0.2)] text-gold text-[10px] font-bold px-1 inline-flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-3.5 py-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#444]" />
              <input
                type="text"
                placeholder="Buscar por mail, asunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-9 pr-3 bg-surface-2 border border-border rounded-lg text-[13px] text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim transition-colors"
              />
            </div>
          </div>

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-10 text-center text-[13px] text-muted-foreground leading-relaxed">
                Sin tickets{filter !== "todos" ? " en este estado" : ""}.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const ticketNum = tickets.indexOf(ticket) + 1;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`px-4 py-3.5 border-b border-border cursor-pointer transition-colors border-l-2 ${
                      selectedTicket?.id === ticket.id
                        ? "bg-surface-2 border-l-gold"
                        : "border-l-transparent hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-muted-foreground">#{ticketNum}</span>
                      <span className="text-[10px] font-semibold text-gold-dim">{getCatIcon(ticket.categoria)}</span>
                    </div>
                    <p className="text-[13px] font-medium text-foreground truncate mb-0.5">{ticket.subcategoria}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {ticket.titular} · {formatDate(ticket.created_at)}
                    </p>
                    <div className="mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Detail panel */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-background">
          {!selectedTicket ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="text-3xl opacity-30">💬</div>
              <p className="text-[13px]">Seleccioná un ticket para ver el detalle</p>
            </div>
          ) : (
            <>
              {/* Ticket Info Header */}
              <div className="p-7 flex-shrink-0 max-w-[760px]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-foreground leading-tight">{selectedTicket.subcategoria}</h2>
                    <div className="flex items-center gap-2.5 flex-wrap mt-1.5">
                      <span className="text-[11px] font-mono text-muted-foreground">#{tickets.indexOf(selectedTicket) + 1}</span>
                      <span className="text-[11px] text-muted-foreground">{formatDateFull(selectedTicket.created_at)}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${getStatusStyle(selectedTicket.status)}`}>
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>

                {/* Section title */}
                <div className="flex items-center gap-2 my-5">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gold">Información</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-gold-dim to-transparent" />
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="bg-surface border border-border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Mail</span>
                    </div>
                    <p className="text-[13px] font-medium text-foreground break-all">{selectedTicket.mail}</p>
                  </div>
                  <div className="bg-surface border border-border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Titular</span>
                    </div>
                    <p className="text-[13px] font-medium text-foreground break-all">{selectedTicket.titular}</p>
                  </div>
                  <div className="bg-surface border border-border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Grupo Signal</span>
                    </div>
                    <p className="text-[13px] font-medium text-foreground break-all">{selectedTicket.grupo}</p>
                  </div>
                </div>

                {/* Category banner */}
                <div className="flex items-center gap-2.5 bg-[rgba(240,180,41,0.06)] border border-[rgba(240,180,41,0.15)] rounded-lg px-3.5 py-2.5 mb-5">
                  <span className="text-lg">{getCatIcon(selectedTicket.categoria)}</span>
                  <span className="font-semibold text-gold text-[13px]">{selectedTicket.categoria}</span>
                  <span className="text-muted-foreground text-[13px] ml-1">{selectedTicket.subcategoria}</span>
                </div>

                {/* Problem box */}
                <div className="bg-surface border border-border rounded-lg p-4 text-sm leading-relaxed text-[#D8D4CC] whitespace-pre-wrap mb-5">
                  {selectedTicket.detalle}
                </div>

                {/* Attachments */}
                {selectedTicket.ticket_attachments && selectedTicket.ticket_attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.ticket_attachments.map((attachment, index) => (
                      attachment.file_type.startsWith("image/") ? (
                        <a
                          key={index}
                          href={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
                          download={attachment.file_name}
                          className="relative group"
                        >
                          <img 
                            src={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`} 
                            alt={attachment.file_name} 
                            className="w-24 h-[72px] object-cover rounded-lg border border-border hover:opacity-80 transition-opacity" 
                          />
                        </a>
                      ) : (
                        <a
                          key={index}
                          href={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
                          download={attachment.file_name}
                          className="flex items-center gap-2 px-3.5 py-2 bg-surface border border-border rounded-lg text-[13px] text-foreground hover:bg-surface-2 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="max-w-[120px] truncate">{attachment.file_name}</span>
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      )
                    ))}
                  </div>
                )}

                <hr className="border-t border-border my-6" />

                {/* Section title - Replies */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gold">Conversación</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-gold-dim to-transparent" />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto pb-50 px-7 space-y-2 max-w-[760px]">
                              
                {/* Replies support */}
                {selectedTicket.ticket_replies?.map((reply) => (
                  <div key={`${reply.id}-${reply.created_at}`}>
                    <p className="text-[11px] text-muted-foreground mb-1.5">{formatDate(reply.created_at)}</p>
                    <div className={`rounded-lg p-3.5 text-sm leading-relaxed ${
                      reply.is_admin 
                        ? "bg-[rgba(46,204,113,0.06)] border border-[rgba(46,204,113,0.15)] text-[#C8E6C9]" 
                        : "bg-surface border border-border text-[#D8D4CC]"
                    }`}>
                      <p className="whitespace-pre-wrap">{reply.content}</p>
                      {(reply.ticket_attachments?.length ?? 0) > 0 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {reply.ticket_attachments?.map((attachment, i) =>
      attachment.file_type.startsWith("image/") ? (
        <a
          key={i}
          href={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
            alt={attachment.file_name}
            className="w-28 h-20 object-cover rounded-lg border border-border cursor-zoom-in"
          />
        </a>
      ) : (
        <a
          key={i}
          href={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
          className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg text-[12px]"
        >
          <FileText className="h-4 w-4" />
          <span>{attachment.file_name}</span>
        </a>
      )
    )}
  </div>
)}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{reply.is_admin ? "Soporte" : "Cliente"}</p>
                  </div>
                ))}

                {selectedTicket.ticket_replies?.length === 0 && (
                  <p className="text-[13px] text-muted-foreground text-center py-4">Sin respuestas aún</p>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="p-5 flex-shrink-0 max-w-[760px]">
                {selectedTicket.status === "cerrado" ? (
                  <div className="text-center text-[13px] text-muted-foreground bg-surface border border-border rounded-lg py-4">
                    Este ticket está cerrado. No se pueden enviar más respuestas.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribí tu respuesta..."
                      rows={3}
                      className="w-full px-4 py-3.5 bg-surface border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:shadow-[0_0_0_3px_rgba(240,180,41,0.07)] transition-all resize-none leading-relaxed"
                    />
                    {files.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {files.map((file, index) => (
      <div
        key={index}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-[12px]"
      >
        <Paperclip className="h-3.5 w-3.5" />
        <span className="max-w-[120px] truncate">{file.name}</span>

        <button
          type="button"
          onClick={() =>
            setFiles(files.filter((_, i) => i !== index))
          }
        >
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
        </button>
      </div>
    ))}
  </div>
)}
  <div className="flex items-center justify-between">

  {/* IZQUIERDA */}
  <button
    onClick={handleCloseTicket}
    className="px-4 py-2.5 border border-red-500 text-red-500 rounded-lg text-[13px] bg-transparent hover:text-gold hover:border-gold-dim transition-all"
  >
    Cerrar ticket
  </button>

  {/* DERECHA */}
  <div className="flex gap-2 items-center">

    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept="image/*,.pdf,.doc,.docx"
      className="hidden"
      onChange={(e) => {
        if (!e.target.files) return;
        setFiles(Array.from(e.target.files));
      }}
    />

    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      className="px-3 py-2.5 border border-border-2 rounded-lg text-muted-foreground hover:text-gold-dim hover:border-gold-dim transition-all"
    >
      <Paperclip className="h-4 w-4" />
    </button>

    <button
      onClick={handleSendReply}
      disabled={
        (!replyText.trim() && files.length === 0) || isSending
      }
      className="px-5 py-2.5 bg-gradient-to-br from-gold to-[#C8881A] border-none rounded-lg text-[13px] font-bold text-black cursor-pointer hover:opacity-90 transition-all disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-1.5"
    >
      {isSending ? (
        <>
          <span className="w-[13px] h-[13px] border-2 border-[rgba(0,0,0,0.25)] border-t-black rounded-full animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Send className="h-3.5 w-3.5" />
          Enviar respuesta
        </>
      )}
    </button>

  </div>
</div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
