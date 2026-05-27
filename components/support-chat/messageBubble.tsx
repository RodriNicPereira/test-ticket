import { formatDate } from "lib/utils/support-chat/formatDate";
import { AttachmentPreview } from "components/support-chat/attachmentPreview";

interface Props {
  reply?: any;

  isAdmin?: boolean;

  content?: string;

  createdAt?: string;
}

export function MessageBubble({
  reply,
  isAdmin,
  content,
  createdAt,
}: Props) {

  const admin =
    reply?.is_admin ?? isAdmin;

  const text =
    reply?.content ?? content;

  const date =
    reply?.created_at ?? createdAt;

  return (
    <div
      className={`flex ${
        admin
          ? "justify-start"
          : "justify-end"
      }`}
    >
      <div className="max-w-[85%]">

        {admin && (
          <p className="text-xs text-green mb-1">
            Soporte RECASH
          </p>
        )}

        <div
          className={`rounded-2xl px-4 py-3 ${
            admin
              ? "bg-green-500/10"
              : "bg-surface-3"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">
            {text}
          </p>

          {reply?.ticket_attachments && (
            <AttachmentPreview
              attachments={
                reply.ticket_attachments
              }
            />
          )}
        </div>

        <p className="text-[10px] mt-1">
          {formatDate(date)}
        </p>
      </div>
    </div>
  );
}