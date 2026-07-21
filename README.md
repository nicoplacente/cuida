# Cuida

Cuida es una plataforma gratuita y open source para ayudar a familias y cuidadores a organizar el cuidado compartido de una persona.

## Stack

- Next.js App Router
- JavaScript
- Tailwind CSS
- PostgreSQL local
- Prisma ORM
- Auth local con cookies HTTP-only

## Configuración local

Este proyecto solo permite `pnpm`. Los comandos ejecutados con `npm`, `yarn` o `bun` fallan intencionalmente.

1. Instalar dependencias:

```bash
pnpm install
```

2. Crear una base PostgreSQL local llamada `cuida`.

3. Copiar o ajustar variables:

```bash
Copy-Item .env.example .env
```

`DATABASE_URL` por defecto:

```bash
postgresql://postgres:postgres@localhost:5432/cuida?schema=public
```

Para que los enlaces de invitación sean absolutos, configurá:

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

En producción:

```bash
NEXT_PUBLIC_APP_URL="https://cuida.codeluxe.tech"
```

4. Generar Prisma Client:

```bash
pnpm db:generate
```

5. Aplicar schema:

```bash
pnpm db:migrate --name init
```

Si tu entorno local no permite migraciones, para desarrollo podés usar:

```bash
pnpm db:push
```

6. Cargar datos iniciales:

```bash
pnpm db:seed
```

Usuario admin:

```txt
Email: test@gmail.com
Contraseña: test
```

7. Ejecutar la app:

```bash
pnpm dev
```

Abrir `http://localhost:3000`.

## Notificaciones Push y aplicación instalable

Cuida incluye un manifest PWA, service worker, suscripciones por dispositivo y
un worker persistente para enviar recordatorios de medicamentos, tareas y
eventos.

1. Generar claves VAPID una sola vez:

```bash
pnpm exec web-push generate-vapid-keys
```

2. Configurar las siguientes variables tanto en Vercel como en el worker de
   Railway. La clave pública también debe existir durante el build de Vercel:

```txt
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:tu-email@example.com"
APP_TIME_ZONE="America/Argentina/Buenos_Aires"
APP_TIME_ZONE_OFFSET="-03:00"
```

3. Aplicar las migraciones en producción:

```bash
pnpm exec prisma migrate deploy
```

4. En Railway, crear un servicio persistente desde este mismo repositorio,
   compartir `DATABASE_URL` y las variables anteriores, y usar:

```bash
pnpm worker:notifications
```

Configurar la política de reinicio del worker como `Always`. El worker no
necesita un dominio público.

Las notificaciones requieren HTTPS en producción. En iPhone y iPad deben
activarse desde la aplicación agregada a la pantalla de inicio. El sonido final
depende de la configuración de notificaciones, volumen y modo Concentración del
dispositivo.
