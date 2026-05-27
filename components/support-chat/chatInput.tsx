import {
  FileText,
  Paperclip,
  Send,
  XCircle,
} from "lucide-react";

interface Props {
  ticket: any;

  message: string;

  setMessage: (
    value: string
  ) => void;

  files: File[];

  setFiles: (
    files: File[]
  ) => void;

  isSending: boolean;

  handleSendMessage: (
    e: React.FormEvent
  ) => Promise<void>;

  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ChatInput({
  ticket,
  message,
  setMessage,
  files,
  setFiles,
  isSending,
  handleSendMessage,
  fileInputRef,
}: Props) {

  if (ticket?.status === "cerrado") {
    return (
      <div className="border-t border-border p-4 bg-surface-2">
        <p className="text-sm text-muted-foreground text-center">
          Este ticket ha sido cerrado.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border p-4 flex-shrink-0 border-gold">

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(e);
        }}
        className="flex items-center gap-1.5 xs:gap-2"
      >

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {

            if (!e.target.files) {
              return;
            }

            setFiles([
              ...files,
              ...Array.from(e.target.files),
            ]);
          }}
        />

        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Escribí tu mensaje..."
          disabled={isSending}
          className="
          hover:border-gold focus:outline-none focus:ring-0 focus:border-gold hover:border-gold 
          flex-1 min-w-0 px-3 py-2.5 bg-surface-2 border border-border-2 rounded-lg text-sm"
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="border-2 hover:border-gold shrink-0 px-3 py-2.5 rounded-lg"
        >
          <Paperclip className="h-4 w-4 text-gold hover:text-gold/60" />
        </button>

        <button
          type="submit"
          disabled={
            isSending ||
            (!message.trim() &&
              files.length === 0)
          }
          className="hover:bg-gold shrink-0 px-4 py-2.5 bg-gold/70 rounded-lg text-black disabled:opacity-60"
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
                  setFiles(
                    files.filter(
                      (_, i) =>
                        i !== index
                    )
                  )
                }
              >
                <XCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}