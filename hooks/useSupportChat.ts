"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getTicket,
  sendReply,
  uploadFile,
  type Ticket,
} from "@/lib/api/tickets";

import { useTicketChannel } from "@/lib/realtime/useTicketChannel";

export function useSupportChat(ticketId: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [files, setFiles] = useState<File[]>([]);

  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = useCallback(async () => {
    const data = await getTicket(ticketId);

    setTicket(data);
  }, [ticketId]);

  useEffect(() => {
  const init = async () => {
    try {
      setLoading(true);

      await loadTicket();

    } finally {
      setLoading(false);
    }
  };

  init();
}, [loadTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [ticket?.ticket_replies]);

  const handleSendMessage = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      (!message.trim() && files.length === 0) ||
      ticket?.status === "cerrado"
    ) {
      return;
    }

    try {
      setIsSending(true);

      const attachments = await Promise.all(
        files.map(uploadFile)
      );

      await sendReply(
        ticketId,
        message.trim(),
        attachments
      );

      await loadTicket();

      setMessage("");

      setFiles([]);

    } finally {
      setIsSending(false);
    }
  };

  useTicketChannel(ticketId, loadTicket);

  return {
    ticket,
    loading,

    message,
    setMessage,

    files,
    setFiles,

    isSending,

    fileInputRef,
    messagesEndRef,

    handleSendMessage,
  };
}