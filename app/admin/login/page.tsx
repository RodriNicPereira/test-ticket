"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Contraseña inválida");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d5598bf3-9085-4c31-924a-08016435a769-85ZnfnTIg2ZJhpDbVhWczVcAoy7S2s.png"
            alt="RECASH"
            width={160}
            height={50}
            className="h-10 w-auto mb-4"
          />

          <h1 className="text-2xl font-bold text-foreground">
            Panel de Soporte
          </h1>

          <p className="text-sm text-muted-foreground mt-2 text-center">
            Ingresá la contraseña de administrador
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-[#555] focus:outline-none focus:border-gold-dim transition-all"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-br from-gold to-[#C8881A] text-black font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}