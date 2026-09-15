# Invitación Noe & Esme

Invitación de boda digital con panel de administración — gestión de invitados, mesas, RSVP y contenido del evento, todo editable sin redesplegar.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4**
- **Prisma 7** — SQLite en desarrollo, pensado para migrar a **Supabase** (Postgres) en producción
- **Cloudinary** — subida/optimización de imágenes desde el panel de admin
- Autenticación de admin con JWT (cookie), sin dependencias externas de auth

## Desarrollo local

```bash
npm install
npx prisma migrate dev
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

- Invitación genérica: `/invite`
- Invitación personalizada: `/invite/{uuid}`
- Panel de administración: `/admin/login`

## Variables de entorno

Copia `.env` y completa (ver `.env` en el repo para la lista completa):

- `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — cuenta gratuita en [cloudinary.com](https://cloudinary.com), preset de subida en modo *Unsigned*

## Notas

- La base de datos local (`dev.db`) no se sube al repositorio — contiene datos reales de invitados.
