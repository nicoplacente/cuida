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
Email: nicolasplacente@gmail.com
Contraseña: Between12
```

7. Ejecutar la app:

```bash
pnpm dev
```

Abrir `http://localhost:3000`.
