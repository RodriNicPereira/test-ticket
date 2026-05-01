"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { validateAdmin, setAdminAuthed } from "@/lib/tickets";
import { MessageSquare, LogIn } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAdmin(user, pass)) {
      setAdminAuthed(true);
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-5">
      <Card className="w-full max-w-[360px] border-zinc-200 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-zinc-900 rounded-xl p-3 w-fit">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl text-zinc-900">Panel de soporte</CardTitle>
          <CardDescription className="text-zinc-500">
            Ingresá tus credenciales de administrador para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="user" className="text-zinc-900 font-medium text-sm">
                  Usuario
                </FieldLabel>
                <Input
                  id="user"
                  type="text"
                  placeholder="admin"
                  value={user}
                  onChange={(e) => {
                    setUser(e.target.value);
                    setError(false);
                  }}
                  className="border-zinc-200 focus:border-zinc-400"
                  autoComplete="username"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="pass" className="text-zinc-900 font-medium text-sm">
                  Contraseña
                </FieldLabel>
                <Input
                  id="pass"
                  type="password"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    setError(false);
                  }}
                  className="border-zinc-200 focus:border-zinc-400"
                  autoComplete="current-password"
                />
              </Field>
            </FieldGroup>

            {error && (
              <p className="text-sm text-red-600 text-center">
                Usuario o contraseña incorrectos
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
