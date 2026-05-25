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
  ArrowLeft,
  Menu,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import {
  useTicketChannel,
  useAdminTicketsChannel,
} from "@/lib/realtime/useTicketChannel";

export function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<"todos" | TicketStatus>("todos");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.ticket_replies]);

  useTicketChannel(selectedTicket?.id || null, async () => {
    await loadTickets();
  });

  useAdminTicketsChannel(async () => {
    await loadTickets();
  });

  const loadTickets = async () => {
    try {
      const updated = await getAdminTickets();
      setTickets(updated);
      if (selectedTicket?.id) {
        const fullTicket = await getTicket(selectedTicket.id, "admin");
        setSelectedTicket(fullTicket);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (id: string, status: TicketStatus) => {
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
      await sendAdminReply(selectedTicket.id, replyText.trim(), files);
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
    const matchSearch =
      !searchTerm ||
      ticket.mail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.titular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subcategoria?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendingCount = tickets.filter((t) => t.status === "pendiente").length;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDateFull = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
      case "respondido":
        return "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20";
      case "cerrado":
        return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Clock className="h-3 w-3" />;
      case "respondido":
        return <CheckCircle2 className="h-3 w-3" />;
      case "cerrado":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
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

  const showListMobile = !selectedTicket;
  const showDetailMobile = !!selectedTicket;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/60 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-gold" />
            </div>
            <div className="flex flex-col">
              <span className="text-gold font-semibold text-sm sm:text-base">Panel Admin</span>
              <span className="text-zinc-500 text-[10px] sm:text-xs hidden xs:block">Sistema de Soporte</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span className="text-[11px] sm:text-xs text-amber-400 font-medium">
                {pendingCount}
                <span className="hidden sm:inline"> pendiente{pendingCount !== 1 ? "s" : ""}</span>
              </span>
            </div>
          )}
          <span className="text-[11px] sm:text-xs text-zinc-500 hidden sm:inline">
            {tickets.length} tickets
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
            aria-label="Salir"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ===== LAYOUT ===== */}
      <div className="flex flex-1 min-h-0">
        {/* ----- SIDEBAR (lista) ----- */}
        <aside
          className={`${
            showListMobile ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-[320px] lg:w-[360px] border-r border-zinc-800/60 bg-zinc-900/50 min-h-0`}
        >
          {/* Filtros */}
          <div className="px-3 sm:px-4 pt-4">
            <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl border border-zinc-700/30">
              {(["todos", "pendiente", "respondido", "cerrado"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 min-w-fit text-[11px] py-2 px-2.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    filter === f
                      ? "bg-zinc-700 text-zinc-100 shadow-lg shadow-black/20"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  {f === "todos" ? "Todos" : f === "respondido" ? "Resp." : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "pendiente" && pendingCount > 0 && (
                    <span className="inline-flex items-center justify-center text-[9px] bg-amber-500 text-zinc-900 rounded-full h-4 min-w-[16px] px-1 font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 sm:px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 bg-zinc-800/50 border border-zinc-700/40 rounded-xl text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold transition-all duration-200"
              />
            </div>
          </div>

          {/* Lista de tickets */}
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-5 w-5 text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-500">
                  Sin tickets{filter !== "todos" ? " en este estado" : ""}
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const ticketNum = tickets.indexOf(ticket) + 1;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setInfoOpen(false);
                    }}
                    className={`px-3 sm:px-4 py-3.5 border-b border-zinc-800/40 cursor-pointer transition-all duration-200 border-l-[3px] ${
                      selectedTicket?.id === ticket.id
                        ? "bg-zinc-800/60 border-l-gold"
                        : "border-l-transparent hover:bg-zinc-800/30 hover:border-l-zinc-600"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] text-zinc-500 font-mono">#{ticketNum}</span>
                      <span className="text-base">{getCatIcon(ticket.categoria)}</span>
                    </div>
                    <p className="text-[13px] font-medium text-zinc-100 truncate leading-tight">
                      {ticket.subcategoria}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate mt-1">
                      {ticket.titular} · {formatDate(ticket.created_at)}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-medium ${getStatusStyle(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ----- DETALLE ----- */}
        <main
          className={`${
            showDetailMobile ? "flex" : "hidden"
          } md:flex flex-1 flex-col min-h-0 min-w-0 bg-zinc-950`}
        >
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="h-16 w-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500 max-w-[200px]">
                Seleccioná un ticket de la lista para ver el detalle
              </p>
            </div>
          ) : (
            <>
              {/* Top bar del detalle */}
              <div className="flex items-center gap-3 px-3 sm:px-6 py-3 border-b border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="md:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                  aria-label="Volver"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] sm:text-sm font-semibold truncate text-zinc-100">
                    {selectedTicket.subcategoria}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate font-mono">
                    #{tickets.indexOf(selectedTicket) + 1} · {formatDateFull(selectedTicket.created_at)}
                  </p>
                </div>
                <span className={`text-[10px] sm:text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 font-medium ${getStatusStyle(selectedTicket.status)}`}>
                  {getStatusIcon(selectedTicket.status)}
                  {getStatusLabel(selectedTicket.status)}
                </span>
              </div>

              {/* Cuerpo scrollable */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                {/* Acordeón Info */}
                <div className="border border-zinc-800/60 rounded-xl bg-zinc-900/40 overflow-hidden">
                  <button
                    onClick={() => setInfoOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 md:cursor-default hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-gold/20 flex items-center justify-center">
                        <Info className="h-3.5 w-3.5 text-gold" />
                      </div>
                      <span className="text-[12px] uppercase tracking-wide text-gold font-semibold">
                        Información del ticket
                      </span>
                    </div>
                    <span className="md:hidden text-zinc-500">
                      {infoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  <div className={`${infoOpen ? "block" : "hidden"} md:block px-4 pb-4 space-y-4 border-t border-zinc-800/40`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                      <div className="p-3 bg-zinc-800/30 rounded-lg border border-gold/50">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500 mb-1.5">
                          <Mail className="h-3 w-3 text-gold" /> Email
                        </div>
                        <p className="text-[12px] text-zinc-200 break-all">{selectedTicket.mail}</p>
                      </div>
                      <div className="p-3 bg-zinc-800/30 rounded-lg border border-gold/50">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500 mb-1.5">
                          <User className="h-3 w-3 text-gold" /> Titular
                        </div>
                        <p className="text-[12px] text-zinc-200">{selectedTicket.titular}</p>
                      </div>
                      <div className="p-3 bg-zinc-800/30 rounded-lg border border-gold/50">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500 mb-1.5">
                          <Users className="h-3 w-3 text-gold" /> Grupo Signal
                        </div>
                        <p className="text-[12px] text-zinc-200">{selectedTicket.grupo}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800/40 rounded-lg text-[12px] flex-wrap border border-zinc-700/30">
                      <span>{getCatIcon(selectedTicket.categoria)}</span>
                      <span className="font-medium text-gold">{selectedTicket.categoria}</span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-gold/95">{selectedTicket.subcategoria}</span>
                    </div>

                    <div className="p-4 bg-zinc-800/30 border border-gold/30 rounded-lg text-[13px] whitespace-pre-wrap leading-relaxed text-zinc-300">
                      {selectedTicket.detalle}
                    </div>

                    {selectedTicket.ticket_attachments && selectedTicket.ticket_attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.ticket_attachments.map((attachment, index) =>
                          attachment.file_type.startsWith("image/") ? (
                            <a key={index} href={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`} target="_blank" rel="noreferrer" className="block group">
                              <img
                                src={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
                                alt={attachment.file_name}
                                className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg border border-zinc-700/50 group-hover:border-sky-500/50 transition-colors"
                              />
                            </a>
                          ) : (
                            <a
                              key={index}
                              href={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800/40 border border-zinc-700/40 rounded-lg text-[12px] max-w-full hover:border-gold/50 hover:bg-zinc-800/60 transition-all group"
                            >
                              <FileText className="h-4 w-4 shrink-0 text-gold" />
                              <span className="truncate max-w-[160px] sm:max-w-[220px] text-zinc-300">{attachment.file_name}</span>
                              <Download className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-gold transition-colors" />
                            </a>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Conversación */}
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <MessageSquare className="h-4 w-4 text-gold" />
                    <span className="text-[12px] uppercase tracking-wide text-gold font-semibold">
                      Conversación
                    </span>
                  </div>
                  <div className="space-y-4">
                    {selectedTicket.ticket_replies?.length === 0 && (
                      <div className="text-center py-8">
                        <div className="h-10 w-10 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-2">
                          <MessageSquare className="h-4 w-4 text-zinc-600" />
                        </div>
                        <p className="text-xs text-zinc-500">Sin respuestas aún</p>
                      </div>
                    )}
                    {selectedTicket.ticket_replies?.map((reply) => (
                      <div
                        key={reply.id}
                        className={`flex flex-col ${reply.is_admin ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-zinc-500 mb-1.5 px-1 font-mono">
                          {formatDate(reply.created_at)}
                        </span>
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed break-words shadow-lg ${
                            reply.is_admin
                              ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 rounded-br-md"
                              : "bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-bl-md"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{reply.content}</p>
                          {(reply.ticket_attachments?.length ?? 0) > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {reply.ticket_attachments?.map((attachment, i) =>
                                attachment.file_type.startsWith("image/") ? (
                                  <a key={i} href={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`} target="_blank" rel="noreferrer">
                                    <img
                                      src={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
                                      alt={attachment.file_name}
                                      className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg border border-zinc-600/50"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    key={i}
                                    href={`/api/file?pathname=${encodeURIComponent(attachment.blob_path)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-[11px] max-w-full hover:bg-zinc-900 transition-colors"
                                  >
                                    <FileText className="h-3 w-3 shrink-0" />
                                    <span className="truncate max-w-[140px]">{attachment.file_name}</span>
                                  </a>
                                )
                              )}
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] mt-1.5 px-1 font-medium ${reply.is_admin ? "text-emerald-400" : "text-zinc-500"}`}>
                          {reply.is_admin ? "✓ Soporte" : "Cliente"}
                        </span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>

              {/* Input de respuesta */}
              <div className="border-t border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm px-3 sm:px-6 py-4 space-y-3">
                {selectedTicket.status === "cerrado" ? (
                  <div className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
                    <XCircle className="h-4 w-4 text-zinc-500" />
                    <p className="text-xs text-zinc-500">
                      Este ticket está cerrado. No se pueden enviar más respuestas.
                    </p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribí tu respuesta..."
                      rows={2}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/40 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all duration-200 resize-none leading-relaxed"
                    />

                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 border border-zinc-700/40 rounded-lg text-[11px]"
                          >
                            <Paperclip className="h-3 w-3 text-gold" />
                            <span className="max-w-[100px] sm:max-w-[140px] truncate text-zinc-300">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setFiles(files.filter((_, i) => i !== index))}
                              className="p-0.5 hover:bg-zinc-700 rounded transition-colors"
                            >
                              <X className="h-3 w-3 text-zinc-400 hover:text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={handleCloseTicket}
                        className="px-3 sm:px-4 py-2.5 border border-red-500/40 text-red-400 rounded-xl text-[12px] sm:text-[13px] bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/60 transition-all duration-200 whitespace-nowrap font-medium"
                      >
                        <span className="sm:hidden">Cerrar</span>
                        <span className="hidden sm:inline">Cerrar ticket</span>
                      </button>

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
                          className="px-3 py-2.5 border border-zinc-700/40 rounded-xl text-zinc-400 hover:text-gold hover:border-gold  transition-all duration-200"
                          aria-label="Adjuntar"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>

                        <button
                          onClick={handleSendReply}
                          disabled={(!replyText.trim() && files.length === 0) || isSending}
                          className="px-4 sm:px-6 py-2.5 bg-gold hover:bg-gold border border-gold-600 rounded-xl text-[12px] sm:text-[13px] font-semibold text-gray-900 hover:text-gold hover:bg-transparent hover:border-gold cursor-pointer transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:bg-gold flex items-center gap-2 whitespace-nowrap"
                        >
                          {isSending ? (
                            <>
                              <span className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="hidden sm:inline">Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span className="hidden sm:inline">Enviar respuesta</span>
                              <span className="sm:hidden">Enviar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
