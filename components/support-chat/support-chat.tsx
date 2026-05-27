"use client";

import { ChatHeader } from "components/support-chat/chatHeader";
import { ChatMessages } from "components/support-chat/chatMessages";
import { ChatInput } from "components/support-chat/chatInput";
import { LoadingState } from "components/support-chat/loadingState";
import { useSupportChat } from "hooks/useSupportChat";

interface SupportChatProps {
  ticketId: string;
  onBack?: () => void;
}

export function SupportChat({
  ticketId,
  onBack,
}: SupportChatProps) {
  const chat = useSupportChat(ticketId);

  if (chat.loading || !chat.ticket) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-5">
      <div className="w-full max-w-[560px] bg-surface border border-border rounded-[20px] overflow-hidden flex flex-col h-[90vh]">

        <ChatHeader
          ticket={chat.ticket}
          onBack={onBack}
        />

        <ChatMessages
          ticket={chat.ticket}
          messagesEndRef={chat.messagesEndRef}
        />

        <ChatInput {...chat} />
      </div>
    </div>
  );
}