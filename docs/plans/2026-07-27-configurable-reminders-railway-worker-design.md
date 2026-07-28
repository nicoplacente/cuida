# Recordatorios configurables y worker de Railway

## Objetivo

Permitir que medicamentos, tareas y eventos de calendario tengan un recordatorio
configurable y que las notificaciones Push se entreguen de forma confiable desde
un worker persistente desplegado en Railway.

Las opciones disponibles serán:

- Sin recordatorio.
- 15 minutos antes.
- 30 minutos antes.
- 1 hora antes.

Los registros existentes recibirán una anticipación inicial de 15 minutos.

## Arquitectura

La aplicación web continuará ejecutándose como un servicio de Railway. Un segundo
servicio persistente, desplegado desde el mismo repositorio, ejecutará
`pnpm worker:notifications`.

El worker consultará la base de datos cada 30 segundos, materializará las
notificaciones próximas y entregará las que hayan alcanzado su horario de envío.
No se utilizará Railway Cron porque el proceso actual es continuo y los
recordatorios requieren mayor precisión que una ejecución programada cada cinco
minutos.

El worker validará al iniciar que existan la conexión a la base de datos y las
credenciales VAPID. Si falta una variable esencial, finalizará con un error claro
para permitir que Railway aplique su política de reinicio y exponga el problema
en los logs.

## Modelo de datos

Los modelos `Medication`, `CareTask` y `CalendarEvent` incorporarán el campo
`reminderMinutes`, con los valores admitidos `0`, `15`, `30` y `60`. El valor `0`
representará la ausencia de recordatorio.

La migración asignará `15` a los registros existentes. La aplicación validará los
valores mediante una utilidad compartida para mantener la misma regla en los tres
dominios.

La hora original de una actividad y la hora de envío se conservarán como
conceptos separados. Por ejemplo, una medicación programada para las 20:00 con
15 minutos de anticipación producirá una notificación programada para las 19:45,
mientras que el mensaje seguirá indicando que la toma corresponde a las 20:00.

La clave de ocurrencia incluirá el tipo, el origen, la fecha, la hora y la
anticipación. Esto permitirá reprogramar una notificación cuando cambie realmente
su horario sin colisionar con una ocurrencia anterior.

## Creación y edición

Los formularios de medicamentos, tareas y eventos incorporarán un selector
“Recordatorio”. El valor inicial será “15 minutos antes”. Las tareas sin fecha u
horario se guardarán automáticamente sin recordatorio.

Cada tarjeta mostrará la anticipación configurada y tendrá un botón “Editar”. La
edición se realizará en un modal accesible y permitirá modificar:

- Medicamentos: nombre, dosis, horario, frecuencia, instrucciones y recordatorio.
- Tareas: título, descripción, fecha, horario, responsable y recordatorio.
- Eventos: título, fecha, hora, ubicación, notas y recordatorio.

Los estados de administración de medicamentos y finalización de tareas
continuarán utilizando sus acciones específicas.

El modal reutilizará un contenedor común, restaurará el foco al cerrarse, admitirá
la tecla Escape y mostrará estados de guardado y error. Tras guardar, se cerrará
y actualizará la información visible.

Las acciones de actualización verificarán que el registro pertenezca al círculo
activo, validarán todos los campos y cancelarán las notificaciones pendientes del
origen modificado. El worker recreará las notificaciones necesarias con la nueva
programación. Las notificaciones ya enviadas permanecerán como historial.

La administración de medicamentos obtendrá el horario y la anticipación desde la
base de datos y no confiará en valores ocultos enviados por el navegador.

## Railway y secretos

La configuración se realizará mediante el MCP oficial de Railway después de
identificar explícitamente el proyecto, el ambiente y los servicios existentes.

El servicio web recibirá la clave VAPID pública y la configuración horaria. El
worker recibirá:

- `DATABASE_URL`.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- `VAPID_PRIVATE_KEY`.
- `VAPID_SUBJECT`.
- `APP_TIME_ZONE`.
- `APP_TIME_ZONE_OFFSET`.

Se reutilizará un par VAPID existente o se generará uno único si todavía no está
configurado. La clave privada nunca se expondrá al cliente. La zona horaria será
`America/Argentina/Buenos_Aires` con el desplazamiento correspondiente.

La migración se aplicará con `prisma migrate deploy`. El worker no tendrá dominio
público y utilizará una política de reinicio persistente.

## Errores y consistencia

Las entradas se validarán en el servidor. Los valores de anticipación fuera de la
lista permitida serán rechazados. Las actualizaciones mantendrán el alcance del
círculo activo y registrarán una actividad descriptiva.

Las notificaciones pendientes se eliminarán antes de reprogramar un origen. La
restricción de unicidad y el reclamo temporal existente seguirán protegiendo
contra envíos duplicados y ejecuciones concurrentes.

Las suscripciones expiradas continuarán eliminándose cuando el proveedor Push
responda con estado 404 o 410.

## Verificación

Se agregarán pruebas para:

- Las anticipaciones de 0, 15, 30 y 60 minutos.
- Cambios de día al restar la anticipación.
- Validación de valores admitidos.
- Generación estable de claves de ocurrencia.
- Reprogramación y cancelación de notificaciones pendientes.

También se ejecutarán Prisma Generate, las pruebas automatizadas y el build de
producción.

Tras desplegar, se revisarán mediante Railway MCP el estado y los logs del
servicio web y del worker. La entrega Push real se comprobará si existe al menos
un dispositivo suscrito. Si no existe, la única acción manual pendiente será
habilitar los avisos desde un dispositivo compatible.
