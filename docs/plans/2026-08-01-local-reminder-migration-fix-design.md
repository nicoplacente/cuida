# Corrección de la migración local de recordatorios

## Contexto

El dashboard falla al consultar medicamentos, tareas y eventos porque Prisma
Client incluye el campo `reminderMinutes`, pero la base local `cuida` todavía no
aplicó la migración `20260728070000_add_configurable_reminders`.

El nombre de columna `existe` informado por Prisma no pertenece al esquema. Es
una interpretación incorrecta del mensaje localizado de PostgreSQL que indica
que una columna no existe.

## Decisión

Aplicar la migración existente mediante `prisma migrate deploy`. Este comando:

- agrega `reminderMinutes` a `Medication`, `CareTask` y `CalendarEvent`;
- asigna el valor predeterminado de 15 minutos a los registros existentes;
- incorpora las restricciones para admitir únicamente 0, 15, 30 y 60;
- registra la migración en `_prisma_migrations`;
- no crea una migración nueva ni elimina datos.

Después se regenerará Prisma Client para mantener sincronizados código, cliente
y base de datos.

## Verificación

Se comprobará que no queden migraciones pendientes, que las tres columnas
existan, que las consultas principales del dashboard respondan y que las pruebas
y el build de producción finalicen correctamente.
