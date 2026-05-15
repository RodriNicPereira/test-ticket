"use client";

import { useState } from "react";
import { validateAdmin, setAdminAuthed } from "@/lib/api/tickets";
import Image from "next/image";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAdmin("admin", pass)) {
      setAdminAuthed(true);
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{
      backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(240,180,41,.07) 0%, transparent 70%)"
    }}>
      <div className="w-full max-w-[380px] bg-surface border border-border-2 rounded-[20px] px-10 py-11 text-center relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-green to-transparent" />
        
        <div className="mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d5598bf3-9085-4c31-924a-08016435a769-85ZnfnTIg2ZJhpDbVhWczVcAoy7S2s.png"
            alt="RECASH Logo"
            width={160}
            height={53}
            className="h-10 w-auto mx-auto mb-2"
          />
          <p className="text-[13px] text-muted-foreground">Panel de soporte — solo agentes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Contraseña de acceso"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError(false);
            }}
            className="w-full px-3.5 py-3 bg-surface-2 border border-border-2 rounded-lg text-sm text-foreground placeholder:text-[#444] focus:outline-none focus:border-gold-dim focus:shadow-[0_0_0_3px_rgba(240,180,41,0.08)] transition-all"
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-br from-gold to-[#C8881A] border-none rounded-lg text-sm font-bold text-black cursor-pointer hover:opacity-90 transition-all"
          >
            Ingresar al panel
          </button>
        </form>

        {error && (
          <p className="text-[13px] text-destructive mt-3">
            Contraseña incorrecta
          </p>
        )}
      </div>
    </div>
  );
}
