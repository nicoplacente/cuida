# Migración de actividades de gestión del equipo

## Objetivo

Restablecer las acciones de cambio de rol, eliminación de miembros, cancelación
de invitaciones y salida del grupo tanto en el entorno local como en producción,
sin perder sus registros de auditoría.

## Causa confirmada

Las acciones nuevas guardan los tipos de actividad `MEMBER_ROLE_UPDATED`,
`MEMBER_REMOVED`, `INVITATION_REVOKED` y `MEMBER_LEFT` dentro de la misma
transacción que modifica el equipo. La migración
`20260803223000_add_team_management_activity_types` existe en el repositorio,
pero no está aplicada en la base local. PostgreSQL rechaza el valor nuevo del
enum `ActivityType` y revierte toda la transacción.

## Arquitectura

- Mantener las acciones, permisos, transacciones y registros de actividad
  actuales.
- Utilizar exclusivamente Prisma Migrate y la migración existente.
- No sustituir la migración por `prisma db push` en producción.
- Aplicar exactamente el mismo historial de migraciones en local y producción.
- No agregar dependencias ni cambiar el esquema fuera de la migración aprobada.

## Flujo de aplicación

1. Verificar que la migración pendiente coincida con los valores declarados en
   el esquema de Prisma.
2. Aplicar la migración existente en la base local.
3. Confirmar que Prisma no reporte migraciones pendientes localmente.
4. Vincular Railway CLI al proyecto y entorno correctos.
5. Ejecutar `prisma migrate deploy` con las variables del servicio de
   producción.
6. Confirmar que producción no tenga migraciones pendientes.

## Manejo de errores

- Detener el proceso si Railway no permite identificar de forma inequívoca el
  proyecto, entorno o servicio correctos.
- No mostrar ni copiar URLs de conexión ni credenciales de las bases.
- No modificar acciones ni omitir registros de auditoría como solución
  alternativa.
- Conservar el logger seguro y los mensajes públicos actuales.

## Verificación

- Consultar el estado de Prisma Migrate en ambos entornos.
- Ejecutar la suite completa de pruebas.
- Generar el build de producción.
- Verificar que las acciones de equipo completen sus transacciones después de
  la migración.
- Cerrar cualquier servidor o puerto temporal utilizado durante la prueba.

