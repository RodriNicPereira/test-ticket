import { Ticket } from "@/lib/api/tickets";
import { MessageBubble } from "components/support-chat/messageBubble";

interface Props {
  ticket: Ticket;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  ticket,
  messagesEndRef,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">

      <MessageBubble
        isAdmin={false}
        content={ticket.detalle}
        createdAt={ticket.created_at}
      />

      {ticket.ticket_replies?.map((reply) => (
        <MessageBubble
          key={reply.id}
          reply={reply}
        />
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}