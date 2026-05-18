"use client";

import { useState, useEffect, useRef } from "react";
import {
  getTicket,
  sendReply,
  getStatusLabel,
  type Ticket
} from "@/lib/api/tickets";
import { 
  Send, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText,
  Paperclip,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";

import { useCallback } from "react";
import { useTicketChannel } from "@/lib/realtime/useTicketChannel";

interface SupportChatProps {
  ticketId: string;
  onBack?: () => void;
}

export function SupportChat({ ticketId, onBack }: SupportChatProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
  const loadTicket = async () => {
    try {
      setLoading(true);
      const t = await getTicket(ticketId);
      setTicket(t);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  loadTicket();

}, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.ticket_replies]);

  const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();

  if ((!message.trim() && files.length === 0) || ticket?.status === "cerrado") {
    return;
  }

  try {
    setIsSending(true);

    const attachments = await Promise.all(
      files.map(async (file) => ({
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: await fileToDataUrl(file),
      }))
    );

    await sendReply(
      ticketId,
      message.trim(),
      attachments
    );

    const updated = await getTicket(ticketId);

    setTicket(updated);

    setMessage("");
    setFiles([]);

  } catch (error) {
    console.error(error);

  } finally {
    setIsSending(false);
  }
};



useTicketChannel(ticketId, async () => {
  const updated = await getTicket(ticketId);
  setTicket(updated);
});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente": return <Clock className="h-3.5 w-3.5" />;
      case "respondido": return <CheckCircle className="h-3.5 w-3.5" />;
      case "cerrado": return <XCircle className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pendiente": return "bg-[rgba(240,180,41,0.15)] text-gold border-transparent";
      case "respondido": return "bg-[rgba(46,204,113,0.12)] text-green border-transparent";
      case "cerrado": return "bg-surface-3 text-muted-foreground border-transparent";
      default: return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  const getClosedTimeRemaining = () => {
    if (!ticket?.closed_at) return null;
    const closedDate = new Date(ticket.closed_at);
    const expiryDate = new Date(closedDate.getTime() + 1000 * 20); // 1 minuto cambiar  2 * 24 * 60 * 60 * 1000 para 2 dias
    const now = new Date();
    const hoursRemaining = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 20)));
    if (hoursRemaining > 24) {
      const days = Math.floor(hoursRemaining / 24);
      return `${days} día${days > 1 ? "s" : ""}`;
    }
    return `${hoursRemaining} hora${hoursRemaining !== 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-surface border border-border rounded-[20px] p-12 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No se encontró el ticket.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-5">
      <div className="w-full max-w-[560px] bg-surface border border-border rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col h-[85vh] max-h-[750px] relative">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-green to-transparent" />
        
        {/* Header */}
<div className="border-b border-border px-5 py-4 flex-shrink-0">

  <div className="relative flex items-center justify-end sm:justify-center mb-4">

    {onBack && (
      <button
        onClick={onBack}
        className="absolute left-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>
    )}

    <Image
      src="/Logo(510x200).png"
      alt="RECASH Logo"
      width={140}
      height={50}
      className="h-15 w-auto"
    />

  </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gold" />
              <span className="font-semibold text-foreground text-sm">Ticket #{ticket?.id.slice(0, 8)}</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(ticket?.status)}`}>
              {getStatusIcon(ticket.status)}
              {getStatusLabel(ticket.status)}
            </span>
          </div>
          
          <div className="bg-[rgba(240,180,41,0.06)] border border-[rgba(240,180,41,0.15)] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {ticket?.categoria.includes("Contraseña") ? "🔐" : 
                 ticket?.categoria.includes("2FA") ? "🛡️" : 
                 ticket?.categoria.includes("Correo") ? "📧" : 
                 ticket?.categoria.includes("entrantes") ? "📥" : 
                 ticket?.categoria.includes("salientes") ? "📤" : 
                 ticket?.categoria.includes("Comisiones") ? "💰" : 
                 ticket?.categoria.includes("usuarios") ? "👥" : 
                 ticket?.categoria.includes("Alias") ? "🏷️" : 
                 ticket?.categoria.includes("API") || ticket?.categoria.includes("Integraciones") ? "🔗" : "⚠️"}
              </span>
              <span className="font-semibold text-gold text-sm">{ticket?.categoria}</span>
            </div>
            <p className="text-muted-foreground text-sm ml-7">{ticket?.subcategoria}</p>
          </div>

          {ticket.status === "cerrado" && (
            <div className="mt-3 bg-surface-2 border border-border-2 rounded-lg p-3 flex items-start gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium">Ticket cerrado</p>
                <p className="text-xs text-muted-foreground">
                  Este chat estará disponible por {getClosedTimeRemaining()} más.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Initial ticket message */}
          <div className="flex justify-end">
            <div className="max-w-[85%] bg-card">
              <div className="bg-surface-3 border border-border-2 text-foreground rounded-2xl rounded-br-md px-4 py-3">
                <p className="text-sm whitespace-pre-wrap leading-relaxed break-all overflow-hidden">{ticket?.detalle}</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-right font-mono">
                {formatDate(ticket.created_at)}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {ticket?.ticket_attachments && ticket?.ticket_attachments.length > 0 && (
            <div className="flex justify-end">
              <div className="max-w-[85%] space-y-2">
                {ticket?.ticket_attachments.map((att, index) => (
                  <div key={index} className="bg-surface-2 rounded-xl p-2 border border-border">
                    {att.file_type.startsWith("image/") ? (
                      <img src={att.file_url} alt={att.file_name} className="rounded-lg max-h-40 object-cover" />
                    ) : (
                      <div className="flex items-center gap-2 p-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-foreground truncate">{att.file_name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Replies */}
          {ticket?.ticket_replies?.map((reply) => (
            <div key={reply.id} className={`flex ${reply.is_admin ? "justify-start" : "justify-end"}`}>
              <div className="max-w-[85%]">
                {reply.is_admin && (
                  <p className="text-xs text-green mb-1 ml-1 font-semibold">Soporte RECASH</p>
                )}
                <div className={`rounded-2xl px-4 py-3 ${
                  reply.is_admin 
                    ? "bg-[rgba(46,204,113,0.06)] border border-[rgba(46,204,113,0.15)] text-[#C8E6C9] rounded-bl-md" 
                    : "bg-surface-3 border border-border-2 text-foreground rounded-br-md"
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed break-all overflow-hidden">{reply.content}</p>
                  {reply.ticket_attachments && reply.ticket_attachments.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {reply.ticket_attachments.map((att, index) => (
      att.file_type.startsWith("image/") ? (
        <a
          key={index}
          href={att.file_url}
          download={att.file_name}
        >
          <img
            src={att.file_url}
            alt={att.file_name}
            className="rounded-lg max-h-40 object-cover border border-border"
          />
        </a>
      ) : (
        <a
          key={index}
          href={att.file_url}
          download={att.file_name}
          className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 border border-border"
        >
          <FileText className="h-4 w-4" />
          <span className="text-xs truncate">{att.file_name}</span>
        </a>
      )
    ))}
  </div>
)}
                </div>
                <p className={`text-[10px] text-muted-foreground mt-1.5 font-mono ${reply.is_admin ? "text-left ml-1" : "text-right"}`}>
                  {formatDate(reply.created_at)}
                </p>
              </div>
            </div>
          ))}

          {/* Waiting message */}
          {ticket?.ticket_replies?.length === 0 && ticket?.status === "pendiente" && (
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Esperando respuesta del soporte...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {ticket?.status !== "cerrado" ? (
          <div className="border-t border-border p-4 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 xs:gap-2">

  <input
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Escribí tu mensaje..."
    className="
      flex-1
      min-w-0
      px-2 xs:px-4
      py-2.5
      bg-surface-2
      border border-border-2
      rounded-lg
      text-sm
      text-foreground
      placeholder:text-[#444]
      focus:outline-none
      focus:border-gold-dim
      transition-all
    "
    disabled={isSending}
  />

  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="
      shrink-0
      px-2 xs:px-3
      py-2.5
      border border-border-2
      rounded-lg
      text-muted-foreground
    "
  >
    <Paperclip className="h-4 w-4" />
  </button>

  <button
    type="submit"
    disabled={isSending || (!message.trim() && files.length === 0)}
    className="
      shrink-0
      px-3 xs:px-4
      py-2.5
      bg-gradient-to-br from-gold to-[#C8881A]
      rounded-lg
      text-black
      flex items-center justify-center
      disabled:opacity-35
    "
  >
    <Send className="h-4 w-4" />
  </button>

</form>
            {files.length > 0 && (
           <div className="flex flex-wrap gap-2 mt-3">
          {files.map((file, index) => (
      <div
        key={index}
        className="flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs"
      >
        <FileText className="h-3.5 w-3.5" />

        <span className="max-w-[120px] truncate">
          {file.name}
        </span>

        <button
          type="button"
          onClick={() =>
            setFiles(files.filter((_, i) => i !== index))
          }
        >
          <XCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
        </button>
      </div>
        ))}
      </div>
        )}
        </div>
        ) : (
          <div className="border-t border-border p-4 flex-shrink-0 bg-surface-2">
            <p className="text-sm text-muted-foreground text-center">
              Este ticket ha sido cerrado. No es posible enviar más mensajes.
            </p>
          </div>
        )}
      </div>

      <footer className="text-center py-6 text-xs text-[#444]">
        © 2026 Recash
      </footer>
    </div>
  );
}
