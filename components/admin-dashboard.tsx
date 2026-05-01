"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  getTickets,
  updateTicketStatus,
  addReply,
  deleteTicket,
  getStatusColor,
  getStatusLabel,
  setAdminAuthed,
  type Ticket,
  type TicketStatus,
} from "@/lib/tickets";
import {
  MessageSquare,
  LogOut,
  Send,
  X,
  Paperclip,
  FileText,
  ImageIcon,
  Download,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<TicketStatus | "todos">("todos");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setTickets(getTickets());
  }, []);

  const refreshTickets = () => {
    const updated = getTickets();
    setTickets(updated);
    if (selectedTicket) {
      const found = updated.find((t) => t.id === selectedTicket.id);
      setSelectedTicket(found || null);
    }
  };

  const handleStatusChange = (id: string, status: TicketStatus) => {
    updateTicketStatus(id, status);
    refreshTickets();
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 300));
    addReply(selectedTicket.id, replyText.trim());
    setReplyText("");
    setIsSending(false);
    refreshTickets();
  };

  const handleCloseTicket = () => {
    if (!selectedTicket) return;
    handleStatusChange(selectedTicket.id, "cerrado");
  };

  const handleLogout = () => {
    setAdminAuthed(false);
    window.location.reload();
  };

  const filteredTickets = tickets.filter(
    (ticket) => filter === "todos" || ticket.status === filter
  );

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

  return (
    <div className="h-screen flex flex-col bg-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d5598bf3-9085-4c31-924a-08016435a769-85ZnfnTIg2ZJhpDbVhWczVcAoy7S2s.png"
            alt="RECASH Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
          <div className="h-6 w-px bg-zinc-200" />
          <div>
            <span className="font-semibold text-zinc-900 text-sm">Panel de soporte</span>
            <span className="text-zinc-400 mx-2 text-sm">|</span>
            <span className="text-zinc-500 text-sm">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} - {pendingCount} pendiente
              {pendingCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-zinc-500 border-zinc-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </header>

      {/* Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[300px] bg-white border-r border-zinc-200 flex flex-col flex-shrink-0">
          {/* Filter tabs */}
          <div className="p-3 border-b border-zinc-200">
            <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
              {(["todos", "pendiente", "respondido", "cerrado"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 text-xs py-1.5 px-2 rounded-md transition-colors font-medium",
                    filter === f
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "pendiente" && pendingCount > 0 && (
                    <span className="ml-1 bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-400">
                No hay tickets{filter !== "todos" ? " en este estado" : ""}.
              </div>
            ) : (
              filteredTickets.map((ticket, idx) => {
                const ticketNum = tickets.indexOf(ticket) + 1;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "px-4 py-3 border-b border-zinc-100 cursor-pointer transition-colors",
                      selectedTicket?.id === ticket.id
                        ? "bg-zinc-100 border-l-2 border-l-zinc-900"
                        : "hover:bg-zinc-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-zinc-400">#{ticketNum}</span>
                      <Badge
                        className={cn("text-[10px] font-semibold px-2 py-0.5", getStatusColor(ticket.status))}
                        variant="outline"
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-zinc-900 truncate">{ticket.asunto}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {ticket.mail} - {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Detail panel */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedTicket ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <MessageSquare className="h-10 w-10 mb-3 stroke-zinc-300" />
              <p>Seleccioná un ticket para ver el detalle</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto flex flex-col h-full">
              {/* Ticket header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 mb-1">{selectedTicket.asunto}</h2>
                  <p className="text-xs text-zinc-500">
                    #{tickets.indexOf(selectedTicket) + 1} - Creado el {formatDateFull(selectedTicket.createdAt)}
                  </p>
                </div>
                <Badge
                  className={cn("text-xs font-semibold px-2.5 py-1", getStatusColor(selectedTicket.status))}
                  variant="outline"
                >
                  {getStatusLabel(selectedTicket.status)}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-zinc-100 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-zinc-900 break-all">{selectedTicket.mail}</p>
                </div>
                <div className="bg-zinc-100 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    Grupo
                  </p>
                  <p className="text-sm font-medium text-zinc-900">{selectedTicket.grupo}</p>
                </div>
              </div>

              {/* Problem */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                  Problema
                </p>
                <div className="bg-zinc-100 rounded-lg p-4 text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.problema}
                </div>
              </div>

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="mb-5">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5" />
                    Archivos adjuntos ({selectedTicket.attachments.length})
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTicket.attachments.map((attachment, index) => (
                      <div key={index} className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                        {attachment.type.startsWith("image/") ? (
                          <div className="relative">
                            <img
                              src={attachment.dataUrl}
                              alt={attachment.name}
                              className="w-full h-32 object-cover"
                            />
                            <a
                              href={attachment.dataUrl}
                              download={attachment.name}
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-md p-1.5 shadow-sm transition-colors"
                              title="Descargar"
                            >
                              <Download className="h-4 w-4 text-zinc-700" />
                            </a>
                          </div>
                        ) : (
                          <div className="h-32 flex items-center justify-center bg-zinc-50">
                            <FileText className="h-10 w-10 text-zinc-400" />
                          </div>
                        )}
                        <div className="p-2 border-t border-zinc-100">
                          <p className="text-xs text-zinc-700 truncate font-medium">{attachment.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-zinc-400">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                            <a
                              href={attachment.dataUrl}
                              download={attachment.name}
                              className="text-[10px] text-zinc-500 hover:text-zinc-700 flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Descargar
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Replies */}
              {selectedTicket.replies.length > 0 && (
                <div className="mb-5">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                    Respuestas enviadas
                  </p>
                  <div className="space-y-2">
                    {selectedTicket.replies.map((reply) => (
                      <div key={reply.id}>
                        <p className="text-[11px] text-zinc-400 mb-1">
                          Agente - {formatDate(reply.createdAt)}
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply form or closed note */}
              <div className="mt-auto pt-5 border-t border-zinc-200">
                {selectedTicket.status === "cerrado" ? (
                  <p className="text-center text-sm text-zinc-500 bg-zinc-100 rounded-lg py-4">
                    Este ticket está cerrado. No se pueden enviar más respuestas.
                  </p>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Responder
                    </p>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribí tu respuesta aquí..."
                      rows={4}
                      className="border-zinc-200 focus:border-zinc-400 resize-none mb-3"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={handleCloseTicket}
                        className="border-zinc-200 text-zinc-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cerrar ticket
                      </Button>
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSending}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white"
                      >
                        {isSending ? (
                          <>
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar respuesta
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
