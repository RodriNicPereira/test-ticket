"use client";

import { useState, useRef, useEffect } from "react";
import { saveTicket, CATEGORIAS, getActiveTicket, type Attachment, getTickets } from "@/lib/api/tickets";
import { 
  Send, 
  Upload, 
  X, 
  FileText, 
  ImageIcon, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { SupportChat } from "./support-chat/support-chat";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg", 
  "image/png", 
  "image/gif", 
  "image/webp", 
  "application/pdf", 
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

type Step = "list" | "category" | "form" | "chat";

export function SupportForm() {
  const [step, setStep] = useState<Step>("category");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedSubcategoria, setSelectedSubcategoria] = useState("");
  const [formData, setFormData] = useState({
    mail: "",
    titular: "",
    grupo: "",
    detalle: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tickets = getTickets();
    if (tickets.length > 0) {
      setStep("list");
    }
  }, []);

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
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newAttachments.push({ name: file.name, size: file.size, type: file.type, dataUrl });
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
    setExpandedCategories(prev => 
      prev.includes(categoria) 
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mail || !formData.titular || !formData.grupo || !formData.detalle) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const ticket = saveTicket({
      categoria: selectedCategoria,
      subcategoria: selectedSubcategoria,
      ...formData,
      attachments,
    });
    setActiveTicketId(ticket.id);
    setIsSubmitting(false);
    setStep("chat");
  };

  const handleBackToCategory = () => {
    setSelectedCategoria("");
    setSelectedSubcategoria("");
    setStep("category");
  };

  // Step 1: Category Selection
  if (step === "category") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex flex-col items-center pt-12 pb-8 px-5 text-center">
          <div className="mb-7">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d5598bf3-9085-4c31-924a-08016435a769-85ZnfnTIg2ZJhpDbVhWczVcAoy7S2s.png"
              alt="RECASH Logo"
              width={180}
              height={60}
              className="h-11 w-auto"
            />
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

        {/* Main Card */}
        <main className="flex justify-center px-5 pb-20">
          <div className="w-full max-w-[600px] bg-surface border border-border rounded-[20px] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-green to-transparent" />
            
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {Object.entries(CATEGORIAS).map(([categoria, subcategorias]) => {
                const isExpanded = expandedCategories.includes(categoria);
                return (
                  <div key={categoria} className="border border-border-2 rounded-lg overflow-hidden bg-surface-2">
                    <button
                      onClick={() => toggleCategory(categoria)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-3 transition-colors"
                    >
                      <span className="font-semibold text-[14px] text-foreground">{categoria}</span>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
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

        <footer className="text-center py-6 text-xs text-[#444]">
          © 2026 Recash
        </footer>
      </div>
    );
  }

  // Step 2: Form
  if (step === "form") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex flex-col items-center pt-12 pb-6 px-5 text-center">
          <div className="mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d5598bf3-9085-4c31-924a-08016435a769-85ZnfnTIg2ZJhpDbVhWczVcAoy7S2s.png"
              alt="RECASH Logo"
              width={180}
              height={60}
              className="h-11 w-auto"
            />
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

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-7">
              <div className="w-7 h-7 rounded-full bg-green flex items-center justify-center text-xs font-semibold text-black">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex-1 h-px bg-gold-dim" />
              <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-xs font-semibold text-black">2</div>
              <div className="flex-1 h-px bg-border" />
              <div className="w-7 h-7 rounded-full bg-surface-3 border border-border-2 flex items-center justify-center text-xs font-semibold text-muted-foreground">3</div>
            </div>

            {/* Section label */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gold">Paso 2 — Datos de tu cuenta</span>
              <div className="flex-1 h-px bg-gradient-to-r from-gold-dim to-transparent" />
            </div>

            {/* Selected problem */}
            <div className="bg-[rgba(240,180,41,0.06)] border border-[rgba(240,180,41,0.18)] rounded-lg p-3.5 mb-5">
              <p className="text-xs text-[#C8AA6E] mb-1">Problema seleccionado:</p>
              <p className="text-sm font-semibold text-gold">{selectedCategoria}</p>
              <p className="text-sm text-muted-foreground">{selectedSubcategoria}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Two column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                    Mail oficial de la cuenta <span className="text-gold">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.mail}
                    onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                    className="w-full px-3.5 py-3 bg-surface-2 border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.08)] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                    Titular de la cuenta <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre y apellido"
                    value={formData.titular}
                    onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
                    className="w-full px-3.5 py-3 bg-surface-2 border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.08)] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                  Grupo de Signal asignado <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nombre del grupo"
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                  className="w-full px-3.5 py-3 bg-surface-2 border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.08)] transition-all"
                  required
                />
              </div>

              <div>
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

              {/* File upload */}
              <div>
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8C4BC] mb-2">
                  Capturas / comprobantes <span className="text-muted-foreground font-normal text-[11px]">(opcional)</span>
                </label>
                <div className="bg-[rgba(240,180,41,0.06)] border border-[rgba(240,180,41,0.18)] rounded-lg p-3.5 text-xs text-[#C8AA6E] leading-relaxed mb-3">
                  <strong className="text-gold">Tip:</strong> Las capturas que incluyan <strong>ID de operación, COELSA ID, titular y monto</strong> agilizan mucho la resolución.
                </div>
                <div
                  className={`border-[1.5px] border-dashed rounded-lg p-7 text-center cursor-pointer transition-all bg-surface-2 ${
                    dragActive ? "border-gold bg-[rgba(240,180,41,0.05)]" : "border-border-2 hover:border-gold-dim hover:bg-[#161616]"
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
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-[#C8C4BC] mb-1">Hacé clic o arrastrá archivos aquí</p>
                  <p className="text-[11px] text-muted-foreground">Imágenes, PDF, DOC — hasta {MAX_FILES} archivos, 10 MB c/u</p>
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {attachments.map((file, index) => (
                      <div key={index} className="relative">
                        {file.type.startsWith("image/") ? (
                          <div className="relative">
                            <img src={file.dataUrl} alt={file.name} className="w-20 h-16 object-cover rounded-lg border border-border-2" />
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
                            <span className="truncate">{file.name}</span>
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

              {/* Navigation */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleBackToCategory}
                  className="px-5 py-3 bg-transparent border border-border-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 hover:border-border-2 transition-all"
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

        <footer className="text-center py-6 text-xs text-[#444]">
          © 2026 Recash
        </footer>
      </div>
    );
  }

  // Step 3: Chat
  if (step === "chat" && activeTicketId) {
    return <SupportChat ticketId={activeTicketId} />;
  }

  return null;
}
