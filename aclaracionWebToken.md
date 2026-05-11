# Aclaraciones para implementación en producción

## Estado actual (Boceto / Demo)

El sistema actual funciona con **localStorage** para almacenar los tickets y **polling** (consultas cada 3 segundos) para simular tiempo real. Esto es suficiente para pruebas y demostración, pero **NO es adecuado para producción**.

---

## Cambios necesarios para producción

### 1. Base de datos (Obligatorio)

Necesitás una base de datos para almacenar los tickets de forma persistente. Opciones recomendadas:

- **Supabase** (recomendado): PostgreSQL + autenticación + tiempo real incluido
- **Neon**: PostgreSQL serverless
- **PlanetScale**: MySQL compatible

#### Esquema de base de datos sugerido:

```sql
-- Tabla de tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100) NOT NULL,
  mail VARCHAR(255) NOT NULL,
  titular VARCHAR(255) NOT NULL,
  grupo VARCHAR(100) NOT NULL,
  detalle TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'respondido', 'cerrado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de respuestas
CREATE TABLE ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de archivos adjuntos
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL, -- URL del archivo en storage (Vercel Blob, S3, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_replies_ticket_id ON ticket_replies(ticket_id);
```

---

### 2. Identificación del cliente (Cookie + Token)

Para que el cliente pueda ver su ticket sin necesidad de login:

#### Opción A: Token en Cookie (Recomendado)

```typescript
// Al crear un ticket, generar un token único
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Crear token cuando se crea el ticket
export async function createTicketToken(ticketId: string) {
  const token = await new SignJWT({ ticketId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d') // 7 días de validez
    .sign(SECRET);
  
  cookies().set('ticket_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  
  return token;
}

// Verificar token
export async function getTicketFromToken() {
  const token = cookies().get('ticket_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.ticketId as string;
  } catch {
    return null;
  }
}
```

#### Variables de entorno necesarias:

```env
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_minimo_32_caracteres
```

---

### 3. Tiempo real (WebSocket o Supabase Realtime)

#### Opción A: Supabase Realtime (Recomendado si usás Supabase)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Suscribirse a cambios en un ticket específico
supabase
  .channel('ticket-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'ticket_replies',
      filter: `ticket_id=eq.${ticketId}`,
    },
    (payload) => {
      // Actualizar la UI con el nuevo mensaje
      console.log('Nueva respuesta:', payload.new);
    }
  )
  .subscribe();
```

#### Opción B: WebSocket con Pusher o Ably

```typescript
// Usando Pusher
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

const channel = pusher.subscribe(`ticket-${ticketId}`);
channel.bind('new-reply', (data: Reply) => {
  // Actualizar la UI
});
```

---

### 4. Almacenamiento de archivos

Los archivos adjuntos NO deben guardarse como base64 en la base de datos. Usá un servicio de storage:

#### Opción A: Vercel Blob (Recomendado)

```typescript
import { put } from '@vercel/blob';

export async function uploadAttachment(file: File) {
  const blob = await put(file.name, file, {
    access: 'public',
  });
  
  return {
    url: blob.url,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}
```

#### Variables de entorno:

```env
BLOB_READ_WRITE_TOKEN=tu_token_de_vercel_blob
```

---

### 5. Autenticación del administrador

Para producción, reemplazar el login hardcodeado:

#### Opción A: Supabase Auth

```typescript
import { createClient } from '@supabase/supabase-js';

// Verificar si es admin
export async function isAdmin(userId: string) {
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  return !!data;
}
```

#### Opción B: NextAuth.js con credenciales

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Buscar admin en la base de datos
        const admin = await db.query('SELECT * FROM admins WHERE username = $1', [credentials.username]);
        
        if (admin && await bcrypt.compare(credentials.password, admin.password_hash)) {
          return { id: admin.id, name: admin.username };
        }
        return null;
      },
    }),
  ],
};
```

---

## Resumen de pasos para producción

1. **Configurar Supabase** (o la base de datos elegida)
2. **Crear las tablas** con el esquema SQL provisto
3. **Configurar Vercel Blob** para archivos
4. **Generar JWT_SECRET** y agregarlo a las variables de entorno
5. **Reemplazar localStorage** por llamadas a la API/base de datos
6. **Implementar Supabase Realtime** o WebSocket para chat en tiempo real
7. **Configurar autenticación de admin** con Supabase Auth o NextAuth

---

## Dependencias a instalar para producción

```bash
pnpm add @supabase/supabase-js @vercel/blob jose bcryptjs
pnpm add -D @types/bcryptjs
```

---

## Contacto

Si necesitás ayuda con la implementación, podés continuar el desarrollo en v0 conectando las integraciones de Supabase y Vercel Blob desde el panel de configuración.
