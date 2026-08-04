# Notificaciones con contexto de paciente y cumplimiento confiable

## Objetivo

Identificar claramente a la persona cuidada en cada notificación Push, utilizar
títulos específicos según el tipo de cuidado y garantizar que los avisos de
incumplimiento se generen y cancelen correctamente.

## Contenido

- Los recordatorios de medicación usan el título `Momento de la medicación en
  Cuida`.
- Los avisos de medicación pendiente usan el título `Medicamento sin administrar
  en Cuida`.
- Las tareas y los eventos usan como título el texto guardado por el usuario.
- Todas las descripciones comienzan con `Para <paciente>:`.
- Si el círculo todavía no tiene paciente, se utiliza el nombre del círculo como
  contexto de respaldo.
- Los avisos de incumplimiento explican que pasó una hora y el cuidado continúa
  pendiente.

La atribución visual `from Cuida` pertenece a Android o al navegador y no puede
ocultarse desde la API de notificaciones. El service worker declara `es-AR` como
idioma del contenido, sin prometer que el sistema traduzca su interfaz.

## Arquitectura

- Mantener el worker, Web Push, Prisma y el service worker actuales.
- Centralizar la construcción de títulos y descripciones en el servicio de
  notificaciones.
- Obtener el paciente junto con las membresías ya consultadas y construir un
  mapa por círculo, evitando una consulta por notificación.
- Pasar el nombre de la persona cuidada explícitamente al generador puro.
- Persistir el mismo contenido que reciben la notificación Push y el centro de
  avisos interno.
- No agregar dependencias ni modificar el esquema de la base de datos.

## Cumplimiento y cancelación

- Mantener el aviso previo según la anticipación configurada.
- Mantener un aviso de incumplimiento exactamente una hora después para
  medicamentos, tareas y eventos no completados.
- Cancelar el aviso pendiente cuando se administra la toma, se completa la tarea
  o se marca el evento como realizado.
- Ejecutar el cumplimiento, la cancelación y el registro de actividad dentro de
  una misma transacción para evitar estados parciales.
- Conservar la deduplicación por usuario, tipo, fuente, fecha, hora y clase de
  notificación.

## Entrega

- El worker continúa materializando y enviando en ciclos de treinta segundos.
- El service worker muestra el título y el cuerpo recibidos, con sonido,
  vibración, icono, insignia, etiqueta y navegación existentes.
- La atribución del navegador o sistema operativo permanece fuera del control
  de la aplicación.

## Verificación

- Probar títulos y descripciones para recordatorio e incumplimiento de
  medicamento, tarea y evento.
- Probar el contexto del paciente y el respaldo con nombre del círculo.
- Probar la anticipación configurada y la programación de incumplimiento una
  hora después.
- Revisar que las tres acciones de cumplimiento cancelen avisos pendientes de
  forma atómica.
- Ejecutar la suite completa y el build de producción.
- Revisar logs y métricas agregadas del worker sin leer contenido médico.
- Cerrar cualquier servidor o puerto temporal utilizado durante la prueba.

