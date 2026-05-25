"use client";

import { useState, useRef, useEffect } from "react";
import {
  createTicket,
  getActiveTickets,
  getStatusLabel,
  getStatusColor,
  type Attachment,
  type Ticket,
  uploadFile,
  sendReply,
} from "@/lib/api/tickets";
import {
  Send,
  Upload,
  X,
  FileText,
  ImageIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Plus,
  MessageSquare,
  Clock,
   ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { SupportChat } from "./support-chat";
import { CATEGORIAS } from "@/lib/contanst/categories";


const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type Step = "list" | "category" | "form" | "chat";

const LOGO_URL =
  "/Logo(510x200).png";

export function SupportForm() {
  const [step, setStep] = useState<Step>("category");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedSubcategoria, setSelectedSubcategoria] = useState("");
  const [formData, setFormData] = useState({mail: "",titular: "",grupo: "",detalle: "",});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
const [mailSuggestions, setMailSuggestions] = useState<string[]>([]);
const [titularSuggestions, setTitularSuggestions] = useState<string[]>([]);
const [grupoSuggestions, setGrupoSuggestions] = useState<string[]>([]);
const [showGrupoSuggestions, setShowGrupoSuggestions] = useState(false);
const [showMailSuggestions, setShowMailSuggestions] = useState(false);
const [showTitularSuggestions, setShowTitularSuggestions] = useState(false);

const filteredMailSuggestions = mailSuggestions.filter((mail) =>
  mail.toLowerCase().includes(formData.mail.toLowerCase())
);

const filteredTitularSuggestions = titularSuggestions.filter((titular) =>
  titular.toLowerCase().includes(formData.titular.toLowerCase())
);

const filteredGrupoSuggestions = grupoSuggestions.filter((grupo) =>
  grupo.toLowerCase().includes(formData.grupo.toLowerCase())
);

useEffect(() => {
  async function loadTickets() {
    try {
      const data = await getActiveTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  }

  loadTickets();
}, []);

useEffect(() => {
  setMailSuggestions(
    JSON.parse(localStorage.getItem('ticket_mail') || '[]')
  );

  setTitularSuggestions(
    JSON.parse(localStorage.getItem('ticket_titular') || '[]')
  );

  setGrupoSuggestions(
    JSON.parse(localStorage.getItem('ticket_grupo') || '[]')
  );
}, []);

const saveSuggestion = (
  key: string,
  value: string
) => {
  if (!value.trim()) return;

  const existing = JSON.parse(
    localStorage.getItem(key) || '[]'
  );

  const updated = [
    value,
    ...existing.filter((v: string) => v !== value)
  ];

  localStorage.setItem(
    key,
    JSON.stringify(updated.slice(0, 10))
  );
};

const saveDataLocalStorage = () => {
  saveSuggestion('ticket_mail', formData.mail);
  saveSuggestion('ticket_titular', formData.titular);
  saveSuggestion('ticket_grupo', formData.grupo);
};


 const refreshTickets = async () => {
  const list = await getActiveTickets();
  setTickets(list);
  return list;
};

  const handleFiles = async (files: FileList | null) => {
  if (!files) return;

  const remainingSlots = MAX_FILES - attachments.length;

  const filesToProcess = Array.from(files).slice(0, remainingSlots);

  const newAttachments: Attachment[] = [];

  for (const file of filesToProcess) {

    if (file.size > MAX_FILE_SIZE) {
      alert(`El archivo "${file.name}" supera los 10MB permitidos.`);
      continue;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`El tipo de archivo "${file.name}" no está permitido.`);
      continue;
    }

    try {

      const uploaded = await uploadFile(file);

      newAttachments.push({
        id:
          Date.now().toString(36) +
          Math.random().toString(36).substring(2),

        file_name: uploaded.file_name,
        file_size: uploaded.file_size,
        file_type: uploaded.file_type,
        file_url: uploaded.file_url,
        blob_path: uploaded.blob_path,
      });

    } catch (err) {
      console.error(err);
      alert(`Error subiendo ${file.name}`);
    }
  }

  setAttachments((prev) => [...prev, ...newAttachments]);
};

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSelectSubcategoria = (categoria: string, subcategoria: string) => {
    setSelectedCategoria(categoria);
    setSelectedSubcategoria(subcategoria);
    setStep("form");
  };

  const toggleCategory = (categoria: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoria) ? prev.filter((c) => c !== categoria) : [...prev, categoria]
    );
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (
    !formData.mail ||
    !formData.titular ||
    !formData.grupo ||
    !formData.detalle
  ) return;

  try {

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 1. Crear ticket
    const ticket = await createTicket({
      categoria: selectedCategoria,
      subcategoria: selectedSubcategoria,
      mail: formData.mail,
      titular: formData.titular,
      grupo: formData.grupo,
      detalle: formData.detalle,
    });

    // 2. Si hay archivos, crear reply con attachments
    if (attachments.length > 0) {

      await sendReply(
        ticket.id,
        "", // <- importante
        attachments.map((a) => ({
          file_name: a.file_name,
          file_size: a.file_size,
          file_type: a.file_type,
          file_url: a.file_url,
          blob_path: a.blob_path,
        }))
      );

    }

    setActiveTicketId(ticket.id);

    await refreshTickets();

    saveDataLocalStorage();

    // Reset form
    setFormData({
      mail: "",
      titular: "",
      grupo: "",
      detalle: "",
    });

    setAttachments([]);

    setStep("chat");

  } catch (err) {

    console.error(err);

    alert("Error creando ticket");

  } finally {

    setIsSubmitting(false);

  }
};
  const handleBackToCategory = async () => {
    setSelectedCategoria("");
    setSelectedSubcategoria("");
    // Si tiene tickets, volver a la lista; si no, al selector
    const list = await refreshTickets();
    setStep(list.length > 0 ? "list" : "category");
  };

  const handleNewTicket = () => {
    setSelectedCategoria("");
    setSelectedSubcategoria("");
    setExpandedCategories([]);
    setStep("category");
  };

  const handleOpenTicket = (ticket: Ticket) => {
    setActiveTicketId(ticket.id);
    setStep("chat");
  };

  const handleBackToList = async () => {
    const list = await refreshTickets();
    setActiveTicketId(null);
    setStep(list.length > 0 ? "list" : "category");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Step 0: Lista de tickets
  if (step === "list") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex flex-col items-center pt-12 pb-8 px-5 text-center">
          <div className="mb-7">
            <Image src={LOGO_URL} alt="RECASH Logo" width={180} height={60} className="h-23 w-auto" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[rgba(240,180,41,0.1)] border border-[rgba(240,180,41,0.25)] rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-gold tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-green" />
            Tus tickets
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-br from-gold-light via-gold to-[#C8881A] bg-clip-text text-transparent">
            Mis tickets de soporte
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-[420px] leading-relaxed">
            Continuá la conversación de un ticket existente o creá uno nuevo.
          </p>
        </header>

        <main className="flex justify-center px-5 pb-20">
          <div className="w-full max-w-[600px] bg-surface border border-border rounded-[20px] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-green to-transparent" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gold">
                  {tickets.length} {tickets.length === 1 ? "ticket activo" : "tickets activos"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 break-words max-w-[140px] xs:max-w-none">Tocá uno para abrir el chat</p>
              </div>
              <button
                onClick={handleNewTicket}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-gold border border-gold hover:bg-gradient-to-br from-gold to-[#C8881A] rounded-lg text-sm font-bold hover:text-black hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Nuevo ticket
              </button>
            </div>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {tickets.map((ticket) => {
                const lastReply = ticket.ticket_replies?.[ticket.ticket_replies.length - 1];
                const preview = lastReply?.content || ticket.detalle;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => handleOpenTicket(ticket)}
                    className="w-full text-left bg-surface-2 border border-border-2 hover:border-gold-dim hover:bg-[#161616] rounded-lg p-4 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground truncate">
                          {ticket.subcategoria}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{ticket.categoria}</p>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full border ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {preview}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="hidden sm:inline-flex items-center gap-1 ">
                        <Clock className="h-3 w-3" />
                        {formatDate(ticket.updated_at)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gold opacity-70 group-hover:opacity-100 transition-opacity">
                        <MessageSquare className="h-3 w-3" />
                        {ticket.ticket_replies?.length} {ticket.ticket_replies?.length === 1 ? "mensaje" : "mensajes totales"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-[#444]">© 2026 Recash</footer>
      </div>
    );
  }

  // Step 1: Category Selection
  if (step === "category") {
    const hasTickets = tickets.length > 0;
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex flex-col items-center pt-12 pb-8 px-5 text-center">
          <div className="mb-7">
            <Image src={LOGO_URL} alt="RECASH Logo" width={180} height={60} className="h-11 w-auto" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[rgba(240,180,41,0.1)] border border-[rgba(240,180,41,0.25)] rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-gold tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-green" />
            Soporte en línea
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-br from-gold-light via-gold to-[#C8881A] bg-clip-text text-transparent">
            Centro de Soporte Técnico
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-[420px] leading-relaxed">
            Seleccioná el tipo de problema que tenés para poder asistirte mejor.
          </p>
        </header>

        <main className="flex justify-center px-5 pb-20">
          <div className="w-full max-w-[600px] bg-surface border border-border rounded-[20px] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-green to-transparent" />

            {hasTickets && (
              <button
                onClick={() => setStep("list")}
                className="inline-flex items-center gap-1.5 mb-5 text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-gold" />
                Volver a mis tickets
              </button>
            )}

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {Object.entries(CATEGORIAS).map(([categoria, subcategorias]) => {
                const isExpanded = expandedCategories.includes(categoria);
                return (
                  <div key={categoria} className="border border-border-2 hover:border-gold rounded-lg overflow-hidden bg-surface-2">
                    <button
                      onClick={() => toggleCategory(categoria)}
                      className="w-full px-5 py-3 text-left text-[13px] text-white hover:text-gold transition-colors flex items-center justify-between group"
                          >
                      <span className="font-semibold text-[14px]">{categoria}</span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border divide-y divide-border">
                        {subcategorias.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => handleSelectSubcategoria(categoria, sub)}
                            className="w-full px-5 py-3 text-left text-[13px] text-muted-foreground hover:text-gold hover:bg-[rgba(240,180,41,0.05)] transition-colors flex items-center justify-between group"
                          >
                            <span>{sub}</span>
                            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-gold transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-[#444]">© 2026 Recash</footer>
      </div>
    );
  }

  // Step 2: Form
  if (step === "form") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex flex-col items-center pt-12 pb-6 px-5 text-center">
          <div className="mb-6">
            <Image src={LOGO_URL} alt="RECASH Logo" width={180} height={60} className="h-11 w-auto" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[rgba(240,180,41,0.1)] border border-[rgba(240,180,41,0.25)] rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-gold tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-green" />
            Soporte en línea
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-br from-gold-light via-gold to-[#C8881A] bg-clip-text text-transparent">
            Completá tus datos
          </h1>
          <p className="text-[14px] text-muted-foreground max-w-[400px] leading-relaxed">
            Cuanto más detallada sea tu consulta, más rápida será la resolución.
          </p>
        </header>

        <main className="flex justify-center px-5 pb-20">
          <div className="w-full max-w-[600px] bg-surface border border-border rounded-[20px] p-9 shadow-[0_32px_80px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-green to-transparent" />

            <div className="flex items-center gap-2 mb-7">
              <div className="w-7 h-7 rounded-full bg-green flex items-center justify-center text-xs font-semibold text-black">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex-1 h-px bg-gold-dim" />
              <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-xs font-semibold text-black">
                2
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className="w-7 h-7 rounded-full bg-surface-3 border border-border-2 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                3
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gold">
                Paso 2 — Datos de tu cuenta
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gold-dim to-transparent" />
            </div>

            <div className="bg-[rgba(240,180,41,0.06)] border border-[rgba(240,180,41,0.18)] rounded-lg p-3.5 mb-5">
              <p className="text-xs text-[#C8AA6E] mb-1">Problema seleccionado:</p>
              <p className="text-sm font-semibold text-gold">{selectedCategoria}</p>
              <p className="text-sm text-muted-foreground">{selectedSubcategoria}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mail oficial de la cuenta */}
                <div className="relative">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                    Mail oficial de la cuenta <span className="text-gold">*</span>
                  </label>
                  <input
    type="email"
    placeholder="tu@email.com"
    value={formData.mail}
    onFocus={() => setShowMailSuggestions(true)}
    onBlur={() => {
      setTimeout(() => {
        setShowMailSuggestions(false);
      }, 150);
    }}
    onChange={(e) => {
      setFormData({ ...formData, mail: e.target.value });
      setShowMailSuggestions(true);
    }}
    className="w-full px-3.5 py-3 bg-surface-2 border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.08)] transition-all"
    required
  />

  {showMailSuggestions &&
    formData.mail &&
    filteredMailSuggestions.length > 0 && (
      <div className="absolute z-50 mt-1 w-full bg-surface-2 border border-border rounded-lg overflow-hidden shadow-lg">
        {filteredMailSuggestions.map((mail) => (
          <button
            key={mail}
            type="button"
            onMouseDown={() => {
              setFormData({ ...formData, mail });
              setShowMailSuggestions(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-surface-3"
          >
            {mail}
          </button>
        ))}
      </div>
    )}


                </div>
                {/* Titular de la cuenta */}
                <div className="relative">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                    Titular de la cuenta <span className="text-gold">*</span>
                  </label>
                  <input
    type="text"
    placeholder="Nombre del titular"
    value={formData.titular}
    onFocus={() => setShowTitularSuggestions(true)}
    onBlur={() => {
      setTimeout(() => {
        setShowTitularSuggestions(false);
      }, 150);
    }}
    onChange={(e) => {
      setFormData({ ...formData, titular: e.target.value });
      setShowTitularSuggestions(true);
    }}
    className="w-full px-3.5 py-3 bg-surface-2 border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.08)] transition-all"
    required
  />

  {showTitularSuggestions &&
    formData.titular &&
    filteredTitularSuggestions.length > 0 && (
      <div className="absolute z-50 mt-1 w-full bg-surface-2 border border-border rounded-lg overflow-hidden shadow-lg">
        {filteredTitularSuggestions.map((titular) => (
          <button
            key={titular}
            type="button"
            onMouseDown={() => {
              setFormData({ ...formData, titular });
              setShowTitularSuggestions(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-surface-3"
          >
            {titular}
          </button>
        ))}
      </div>
    )}
                </div>
              </div>
              {/* Grupo de Signal asignado */}
              <div className="relative">
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                  Grupo de Signal asignado <span className="text-gold">*</span>
                </label>
                <input
    type="text"
    placeholder="Nombre del grupo"
    value={formData.grupo}
    onFocus={() => setShowGrupoSuggestions(true)}
    onBlur={() => {
      setTimeout(() => {
        setShowGrupoSuggestions(false);
      }, 150);
    }}
    onChange={(e) => {
      setFormData({ ...formData, grupo: e.target.value });
      setShowGrupoSuggestions(true);
    }}
    className="w-full px-3.5 py-3 bg-surface-2 border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.08)] transition-all"
    required
  />

  {showGrupoSuggestions &&
    formData.grupo &&
    filteredGrupoSuggestions.length > 0 && (
      <div className="absolute z-50 mt-1 w-full bg-surface-2 border border-border rounded-lg overflow-hidden shadow-lg">
        {filteredGrupoSuggestions.map((grupo) => (
          <button
            key={grupo}
            type="button"
            onMouseDown={() => {
              setFormData({ ...formData, grupo });
              setShowGrupoSuggestions(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-surface-3"
          >
            {grupo}
          </button>
        ))}
      </div>
    )}
              </div>
              {/* Detalle del problema */}
              < div>
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                  Detalle del problema <span className="text-gold">*</span>
                </label>
                <textarea
                  placeholder="Describí el problema en detalle. ¿Qué intentabas hacer? ¿Qué error apareció? Incluí IDs de operación, montos, fechas u otros datos relevantes..."
                  rows={4}
                  value={formData.detalle}
                  onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
                  className="w-full px-3.5 py-3 bg-surface-2 border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.08)] transition-all resize-y min-h-[110px] leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                  Capturas / comprobantes{" "}
                  <span className="text-muted-foreground font-normal text-[11px]">(opcional)</span>
                </label>
                <div className="bg-[rgba(240,180,41,0.06)] border border-[rgba(240,180,41,0.18)] rounded-lg p-3.5 text-xs text-[#C8AA6E] leading-relaxed mb-3">
                  <strong className="text-gold">Tip:</strong> Las capturas que incluyan{" "}
                  <strong>ID de operación, COELSA ID, titular y monto</strong> agilizan mucho la
                  resolución.
                </div>
                <div
                  className={`border-[1.5px] border-dashed rounded-lg p-7 text-center cursor-pointer transition-all bg-surface-2 ${
                    dragActive
                      ? "border-gold bg-[rgba(240,180,41,0.05)]"
                      : "border-border-2 hover:border-gold-dim hover:bg-[#161616]"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                  <div className="w-10 h-10 border border-border-2 rounded-lg flex items-center justify-center mx-auto mb-2.5 bg-surface-3">
                    <Upload className="h-5 w-5 text-muted-foreground hover:text-gold" />
                  </div>
                  <p className="text-sm font-medium text-[#C8C4BC] mb-1">
                    Hacé clic o arrastrá archivos aquí
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Imágenes, PDF, DOC — hasta {MAX_FILES} archivos, 10 MB c/u
                  </p>
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {attachments.map((file, index) => (
                      <div key={index} className="relative">
                        {file.file_type.startsWith("image/") ? (
                          <div className="relative">
                             <img
  src={`/api/file?pathname=${encodeURIComponent(
    file.blob_path!
  )}`}
  alt={file.file_name}
  className="w-20 h-16 object-cover rounded-lg border border-border-2"
/>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[#333] text-white border-none text-[9px] cursor-pointer flex items-center justify-center hover:bg-[#444]"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-surface-3 rounded-lg border border-border text-[12px] text-[#C8C4BC] max-w-[180px]">
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate">{file.file_name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-muted-foreground hover:text-foreground ml-auto shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleBackToCategory}
                  className=" hover:border-gold px-5 py-3 bg-transparent border border-border-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 hover:border-border-2 transition-all"
                >
                  <ChevronLeft className="h-4 w-4 inline mr-1" />
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-gold to-[#C8881A] border-none rounded-lg text-sm font-bold text-black cursor-pointer hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-[15px] h-[15px] border-2 border-[rgba(0,0,0,0.25)] border-t-black rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar ticket
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-[#444]">© 2026 Recash</footer>
      </div>
    );
  }

  // Step 3: Chat
  if (step === "chat" && activeTicketId) {
    return <SupportChat ticketId={activeTicketId} onBack={handleBackToList} />;
  }

  return null;
}
