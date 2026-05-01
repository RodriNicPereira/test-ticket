"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveTicket, GRUPOS, type Attachment } from "@/lib/tickets";
import { Send, CheckCircle, Upload, X, FileText, ImageIcon } from "lucide-react";
import Image from "next/image";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export function SupportForm() {
  const [formData, setFormData] = useState({
    mail: "",
    grupo: "",
    asunto: "",
    problema: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      newAttachments.push({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
      });
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

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.mail || !formData.grupo || !formData.asunto || !formData.problema) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    saveTicket({ ...formData, attachments });
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const resetForm = () => {
    setFormData({ mail: "", grupo: "", asunto: "", problema: "" });
    setAttachments([]);
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-[540px] mx-auto border-zinc-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="rounded-full bg-emerald-50 border border-emerald-200 p-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Ticket enviado</h3>
            <p className="text-zinc-500 leading-relaxed max-w-sm">
              Recibimos tu consulta. Un agente te responderá a la brevedad al email que indicaste.
            </p>
            <Button onClick={resetForm} variant="outline" className="mt-2">
              Enviar otra consulta
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[540px] mx-auto border-zinc-200 shadow-sm">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d5598bf3-9085-4c31-924a-08016435a769-85ZnfnTIg2ZJhpDbVhWczVcAoy7S2s.png"
            alt="RECASH Logo"
            width={180}
            height={60}
            className="h-12 w-auto"
          />
        </div>
        <CardTitle className="text-xl text-zinc-900 text-center">Soporte Técnico</CardTitle>
        <CardDescription className="text-zinc-500 text-center">
          Completá el formulario y un agente te responderá a la brevedad al email indicado.
        </CardDescription>
        <p className="text-xs text-zinc-400 mt-1 text-center">* Campos obligatorios</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="mail" className="text-zinc-900 font-semibold text-sm">
                Mail actual *
              </FieldLabel>
              <Input
                id="mail"
                type="email"
                placeholder="tu@email.com"
                value={formData.mail}
                onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                className="border-zinc-200 focus:border-zinc-400"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="grupo" className="text-zinc-900 font-semibold text-sm">
                Grupo asignado en Signal *
              </FieldLabel>
              <Select
                value={formData.grupo}
                onValueChange={(value) => setFormData({ ...formData, grupo: value })}
                required
              >
                <SelectTrigger id="grupo" className="border-zinc-200 focus:border-zinc-400">
                  <SelectValue placeholder="Seleccioná tu grupo..." />
                </SelectTrigger>
                <SelectContent>
                  {GRUPOS.map((grupo) => (
                    <SelectItem key={grupo} value={grupo}>
                      {grupo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="asunto" className="text-zinc-900 font-semibold text-sm">
                Asunto *
              </FieldLabel>
              <Input
                id="asunto"
                placeholder="Resumen breve del problema"
                value={formData.asunto}
                onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                className="border-zinc-200 focus:border-zinc-400"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="problema" className="text-zinc-900 font-semibold text-sm">
                Problema *
              </FieldLabel>
              <Textarea
                id="problema"
                placeholder="Describí el problema con el mayor detalle posible. Indicá qué intentaste hacer y qué error apareció."
                rows={5}
                value={formData.problema}
                onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                className="border-zinc-200 focus:border-zinc-400 resize-y"
                required
              />
            </Field>

            <Field>
              <FieldLabel className="text-zinc-900 font-semibold text-sm">
                Capturas de pantalla / archivos <span className="text-zinc-400 font-normal">(opcional)</span>
              </FieldLabel>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? "border-zinc-400 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
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
                <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-600 font-medium">
                  Hacé clic o arrastrá archivos aquí
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Imágenes, PDF, DOC — hasta {MAX_FILES} archivos, 10 MB c/u
                </p>
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-zinc-50 rounded-lg border border-zinc-100"
                    >
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="h-5 w-5 text-zinc-500 shrink-0" />
                      ) : (
                        <FileText className="h-5 w-5 text-zinc-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-700 truncate">{file.name}</p>
                        <p className="text-xs text-zinc-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(index);
                        }}
                        className="p-1 hover:bg-zinc-200 rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-zinc-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
