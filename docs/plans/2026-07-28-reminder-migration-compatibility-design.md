# Compatibilidad de la migración de recordatorios

## Contexto

La migración de anticipaciones configurables fue aplicada en producción con el
identificador `20260728070000_add_configurable_reminders`. La rama `main`
contiene el mismo SQL bajo el identificador
`20260727180000_add_configurable_reminders`.

Prisma identifica las migraciones por el nombre de su directorio. Mantener ambos
identificadores haría que producción intentara ejecutar nuevamente cambios ya
aplicados.

## Decisión

Restaurar en `main` el identificador utilizado en producción:
`20260728070000_add_configurable_reminders`.

El contenido SQL no cambia. De esta forma:

- producción reconoce la migración existente;
- las bases nuevas la aplican una sola vez;
- no se requieren operaciones manuales sobre `_prisma_migrations`;
- el historial permanece reproducible en todos los entornos.

## Validación

Después del cambio se deben ejecutar las pruebas automatizadas, validar el
esquema Prisma, generar el cliente y compilar el build de producción. Tras
publicar `main`, se debe comprobar en Railway que la migración no se repita y
que tanto la aplicación web como el worker de notificaciones permanezcan en
estado estable.
