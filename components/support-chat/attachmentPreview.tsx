import { FileText } from "lucide-react";

interface Props {
  attachments: any[];
}

export function AttachmentPreview({
  attachments,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">

      {attachments.map((att, index) => {

        const url = `/api/file?pathname=${encodeURIComponent(
          att.blob_path
        )}`;

        if (
          att.file_type.startsWith("image/")
        ) {
          return (
            <a
              key={index}
              href={url}
              download={att.file_name}
            >
              <img
                src={url}
                alt={att.file_name}
                className="rounded-lg max-h-40"
              />
            </a>
          );
        }

        return (
          <a
            key={index}
            href={url}
            download={att.file_name}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />

            <span>
              {att.file_name}
            </span>
          </a>
        );
      })}
    </div>
  );
}