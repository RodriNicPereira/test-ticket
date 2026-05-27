import { AlertCircle } from "lucide-react";

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="bg-surface border border-border rounded-[20px] p-12 text-center max-w-md">

        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />

        <p className="text-muted-foreground">
          Cargando ticket...
        </p>
      </div>
    </div>
  );
}