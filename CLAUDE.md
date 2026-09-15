@AGENTS.md

# Bitácora del proyecto — Invitación Noe & Esme

> Registro de contexto para cualquier sesión futura (humana o de IA) que retome este proyecto. Se actualiza conforme avanza el trabajo; no reemplaza el historial de git, lo complementa con el "por qué" y el estado actual.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4**
- **Prisma 7.10** sobre **PostgreSQL (Supabase)** — usado tanto en local como en producción (ya no hay SQLite en el proyecto; se migró por completo el 2026-09-15). Driver adapter `@prisma/adapter-pg` (`pg`). Local usa la cadena de **conexión directa** (puerto 5432); en Vercel, `DATABASE_URL` debe apuntar a la cadena de **Transaction pooler** (puerto 6543, con `?pgbouncer=true`) porque esta versión de Prisma no soporta un `directUrl` separado para migraciones — las migraciones siempre se corren contra la conexión directa, nunca contra el pooler.
- Autenticación de admin propia: JWT en cookie (`jose`) + `bcryptjs`, sin NextAuth ni proveedor externo.
- **Cloudinary** (plan gratuito) para subida y optimización de imágenes desde el panel — se eligió sobre Supabase Storage por su cuota gratuita más amplia (25GB vs 1GB) y por incluir optimización automática (`f_auto,q_auto`) sin trabajo adicional.
- Despliegue objetivo: **Vercel** (frontend), aún no configurado. La base de datos (Supabase) ya está lista.

## Qué existe hoy

### Invitado (`/invite`, `/invite/[uuid]`)
Vista basada 1:1 en un diseño de Claude Design importado (paleta crema/dorado/marrón, tipografías Cormorant Garamond + Jost, con Times New Roman específicamente para fechas y el contador). Secciones: Portada (con sello opcional), frase de bendición, contador regresivo en vivo, padres de los novios, sección de invitados (solo si la invitación es personalizada — nombre del titular + lista de personas + tag "Menor de 8 años"), aviso de fecha límite, itinerario, ubicación (mapa de Google con pin exacto vía lat/lng + botón "Cómo llegar"), galería, código de vestimenta con colores prohibidos, mesa de regalos, RSVP, aviso de cuidado del recinto, footer.

- **Vista genérica** (sin UUID): nunca muestra nombre de invitado ni botón de RSVP — cumple el requisito de que un invitado no pueda ver información de otro ni confirmar sin su link personal.
- **RSVP**: selección por persona (check individual + atajo "marcar que todos asistirán"), mensaje opcional para los novios (persistido en `Invitation.guestMessage`, visible en el detalle del invitado en el admin). Al enviar, cada persona queda `CONFIRMED`/`REJECTED` y el estatus agregado de la invitación se recalcula.
- Countdown implementado con guard anti-hydration-mismatch (`now` arranca en `null`, se fija en `useEffect`).

### Admin (`/admin/*`)
- Protegido por `proxy.ts` (JWT en cookie) + reestructurado en un route group `src/app/admin/(protected)/` para que el sidebar **solo** se renderice ya autenticado — `/admin/login` vive fuera de ese grupo.
- **Dashboard**: las secciones "Aceptaron / Pendientes / Rechazaron" agrupan por estatus de **cada persona**, no por el estatus agregado de la invitación — una invitación con 2 aceptados y 1 rechazado aparece en ambas secciones, mostrando solo el subconjunto correspondiente en "Detalles" (con banner "Mostrando solo quienes..." y link "Ver todos"). Números de las tarjetas en Times New Roman.
- **Invitados** (`/admin/guests`): listado con el mismo criterio de filtrado por persona, alta/edición/eliminación, detalle de invitado con mensaje de RSVP visible.
- **Mesas** (`/admin/tables`): 19 mesas × 10 lugares, asignar/quitar personas confirmadas, búsqueda global, filtro por novio/novia. Números de mesa en Times New Roman.
- **Configuración** (`/admin/settings`): fecha del evento, lugar + dirección + coordenadas (lat/lng, usadas para el pin del mapa) + link de "Cómo llegar", horarios, itinerario (con nota opcional por evento), fechas límite primaria/secundaria, frase de bendición + sello (subida a Cloudinary), padres de los novios, código de vestimenta + detalle + colores prohibidos, mesa de regalos, aviso importante, imágenes (sello y galería vía `ImageUploader.tsx` → Cloudinary, o URL manual como respaldo).
- Regla de 190 invitados + niños 2×1 (`countPersonSlots` / `countConfirmedSlots` / `countPendingSlots` en `src/lib/utils.ts`) aplicada al dar de alta invitados.

### Bugs corregidos en esta fase (por si reaparecen)
- El `PUT /api/guests/[id]` recalculaba el estatus agregado desde las personas pero luego un `if (status) newStatus = status` lo pisaba con el valor "viejo" que el cliente siempre mandaba — el admin ahora solo manda `status` explícito si el select "Estado general" realmente cambió.
- El link "Volver" en el detalle de invitado apuntaba siempre a `/admin/guests`; ahora usa `router.back()` (mismo patrón que el botón "Cancelar" del formulario de alta).
- El mapa embebido usaba una búsqueda de texto (`venueAddress`) que quedaba muy alejada del lugar real; ahora usa coordenadas (`venueLat`/`venueLng`) que producen un pin exacto.
- Espaciado pegado entre la sección de "Invitados" y el aviso de "Fecha límite" (padding superior en 0 por error).

### Migración a Supabase (2026-09-15)
- `schema.prisma`: `provider` de `sqlite` → `postgresql`.
- `lib/prisma.ts` y `prisma/seed.ts`: adaptador `PrismaBetterSqlite3` → `PrismaPg`.
- `package.json`: fuera `better-sqlite3`/`@prisma/adapter-better-sqlite3`; dentro `pg`/`@prisma/adapter-pg`; `prisma`/`@prisma/client` alineados a `7.10.0` (tenían que coincidir con la versión del adapter, si no fallan en runtime).
- Migraciones viejas de SQLite eliminadas (SQL específico de ese motor, no sirve en Postgres) y se generó un historial nuevo (`prisma/migrations/<timestamp>_init`) directo contra Supabase.
- `dev.db` ya no se usa — el archivo puede borrarse localmente cuando se quiera, sigue en `.gitignore` por si acaso.
- Verificado en el navegador: login de admin, Dashboard y la invitación (`/invite`) cargan correctamente contra la base de Supabase ya sembrada (admin, `EventConfig`, 19 mesas).

## Pendiente / no resuelto todavía

- **Desplegar a Vercel** — no configurado aún. Falta: crear el proyecto en Vercel, y en sus variables de entorno de producción usar el `DATABASE_URL` del **Transaction pooler** de Supabase (puerto 6543 + `?pgbouncer=true`), NO la conexión directa que se usa en local — el pooler es necesario porque las funciones serverless abren muchas conexiones cortas y la conexión directa tiene un límite bajo.
- Campo `coverImageUrl` (Config/Settings, sección "Imágenes") **no se usa en ningún lado de la vista actual de la invitación** — quedó huérfano de una iteración anterior al diseño de Claude Design. Pendiente decidir: ¿se elimina o se reconecta como fondo de la Portada?
- Sin pruebas automatizadas.
- El push a GitHub del historial hasta este punto se hizo con un Personal Access Token que el usuario debe generar y usar él mismo (Claude no maneja tokens/contraseñas por política) — confirmar que quedó publicado y, si el token se compartió en el chat, rotarlo por seguridad.

_Última actualización: 2026-09-15._
