# Cuida MVP Design

## Objetivo

Crear una plataforma web real para que familiares y cuidadores organicen el cuidado compartido de una persona. El MVP debe funcionar con PostgreSQL local y Prisma, sin Supabase ni servicios externos.

## Enfoque

La aplicacion usa Next.js App Router con componentes server-first, Server Actions para mutaciones y Prisma como capa de acceso a datos. La experiencia prioriza una interfaz mobile-first, clara y accesible.

## Arquitectura

- `src/app`: rutas publicas y privadas.
- `src/components`: componentes UI reutilizables.
- `src/features`: componentes organizados por dominio funcional.
- `src/services`: acceso a datos y funciones de servidor.
- `src/utils`: utilidades compartidas.
- `prisma`: schema, migraciones y seed.

## Datos Principales

- Usuarios con autenticacion local.
- Circulos de cuidado con miembros y roles.
- Pacientes asociados a circulos.
- Medicamentos, administraciones y bloqueo de doble registro.
- Tareas compartidas.
- Eventos de calendario.
- Historial diario.
- Documentos con metadata.
- Actividad y notificaciones preparadas para evolucionar.

## UI

La direccion visual combina salud, confianza y cuidado familiar: azul oscuro, turquesa, blanco y grises suaves. El producto se siente como una app mobile aunque sea web, con navegacion clara, botones grandes, contraste alto y contenido escaneable.

## Alcance

El MVP incluye landing, registro, login, dashboard, medicamentos, tareas, calendario, historial, documentos y una seccion futura de Asistente Cuida. Realtime y storage avanzado quedan preparados a nivel de arquitectura, pero no dependen de Supabase.
