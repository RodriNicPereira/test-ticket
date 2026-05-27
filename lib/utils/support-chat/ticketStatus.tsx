import {
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function getStatusIcon(
  status: string
) {
  switch (status) {
    case "pendiente":
      return <Clock className="h-4 w-4" />;

    case "respondido":
      return (
        <CheckCircle className="h-4 w-4" />
      );

    case "cerrado":
      return (
        <XCircle className="h-4 w-4" />
      );

    default:
      return null;
  }
}