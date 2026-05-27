import Image from "next/image";

import {
  ArrowLeft,
  MessageCircle,
  XCircle,
} from "lucide-react";

import {
  getStatusIcon,
} from "lib/utils/support-chat/ticketStatus";

import {
  getCategoryIcon,
} from "lib/utils/support-chat/categoryIcon";

import {
  getClosedTimeRemaining,
} from "lib/utils/support-chat/getClosedTimeRemaining";

import {
  getStatusLabel,
  type Ticket,
} from "@/lib/api/tickets";

interface Props {
  ticket: Ticket;
  onBack?: () => void;
}

export function ChatHeader({
  ticket,
  onBack,
}: Props) {

  const statusStyles = {
    pendiente:
      "bg-[rgba(240,180,41,0.15)] text-gold",

    respondido:
      "bg-[rgba(46,204,113,0.12)] text-green",

    cerrado:
      "bg-surface-3 text-muted-foreground",
  };

  return (
    <div className="border-b border-border px-5 py-4 flex-shrink-0">

      <div className="relative flex items-center justify-end sm:justify-center mb-4">

        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
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
          className=""
        />
      </div>

      <div className="flex items-center justify-between mb-3">

        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-gold" />

          <span className="font-semibold text-sm">
            Ticket #{ticket.id.slice(0, 8)}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            statusStyles[
              ticket.status as keyof typeof statusStyles
            ]
          }`}
        >
          {getStatusIcon(ticket.status)}

          {getStatusLabel(ticket.status)}
        </span>
      </div>

      <div className="bg-[rgba(240,180,41,0.06)] border border-[rgba(240,180,41,0.15)] rounded-lg p-3 hidden sm:block">

        <div className="flex items-center gap-2 mb-1 sx:p-2">

          <span className="text-lg">
            {getCategoryIcon(ticket.categoria)}
          </span>

          <span className="font-semibold text-gold text-sm">
            {ticket.categoria}
          </span>
        </div>

        <p className="text-muted-foreground text-sm ml-7">
          {ticket.subcategoria}
        </p>
      </div>

      {ticket.status === "cerrado" && (
        <div className="mt-3 bg-surface-2 border border-border-2 rounded-lg p-3 flex items-start gap-2">

          <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-medium">
              Ticket cerrado
            </p>

            <p className="text-xs text-muted-foreground">
              Este chat estará disponible por{" "}
              {getClosedTimeRemaining(
                ticket.closed_at
              )}{" "}
              más.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}