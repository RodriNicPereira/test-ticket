import { SupportForm } from "@/components/support-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-100 py-10 px-4">
      {/* Boton de admin (temporal - puedes quitarlo despues) */}
      <div className="max-w-[540px] mx-auto mb-4 flex justify-end">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="text-zinc-500 border-zinc-200 bg-white">
            <Settings className="mr-2 h-4 w-4" />
            Panel Admin
          </Button>
        </Link>
      </div>

      <SupportForm />
    </main>
  );
}
