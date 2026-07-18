# Navegación responsive, dashboard y recordatorios PWA

## Objetivo

Mejorar la composición del dashboard y simplificar la navegación móvil de Cuida.
Agregar recordatorios confiables para medicamentos, tareas y eventos, disponibles
tanto en el navegador como en la aplicación instalada.

## Dashboard

- Mantener las columnas alineadas al inicio.
- Mover "Últimas notas" debajo de "Plan del día" y darle el mismo ancho.
- Mantener "Actividad reciente" en la columna lateral.
- En escritorio, hacer que "Actividad reciente" termine alineada con el borde
  inferior de "Últimas notas" mediante el alto compartido de la grilla.
- Permitir desplazamiento interno de la lista de actividad cuando su contenido
  supere el espacio disponible.
- En pantallas menores a `xl`, apilar las tarjetas con altura natural y sin
  regiones de desplazamiento forzadas.

## Navegación responsive

### Landing

- Conservar la navegación horizontal de escritorio.
- Incorporar un menú móvil accesible con Solución, Características, Ingresar y
  Comenzar gratis.
- Mantener visible únicamente la marca y el disparador del menú en el header
  compacto.

### Aplicación

- Reemplazar la barra inferior móvil por un menú integrado en el header.
- Incluir la navegación completa de la aplicación, el círculo activo, el cambio
  de círculo, la identidad del usuario, la creación de un círculo y el cierre de
  sesión.
- Mantener la barra lateral en escritorio.
- Usar un panel desplegable con foco y controles nativos accesibles, sin agregar
  una librería de iconos.

## PWA y permisos

- Incorporar un Web App Manifest con identidad, colores, iconos y modo
  `standalone`.
- Registrar un service worker propio para recibir Web Push y abrir la ruta
  asociada al pulsar una notificación.
- Solicitar permiso únicamente como consecuencia de una acción explícita del
  usuario.
- Mostrar instrucciones específicas en iOS cuando la web todavía no esté
  instalada en la pantalla de inicio.
- Tratar Push API como mejora progresiva y comunicar claramente los estados no
  compatible, bloqueado, activado y desactivado.

## Modelo de datos

- Guardar una suscripción Push por usuario y dispositivo, con endpoint y claves
  cifradas por el protocolo Web Push.
- Convertir las notificaciones en registros dirigidos a un usuario, con tipo,
  origen, destino, fecha programada, fecha de envío y fecha de lectura.
- Agregar fecha programada a las tareas; una tarea con hora pero sin fecha no
  genera un recordatorio remoto.
- Evitar duplicados con una clave única por usuario, origen y ocurrencia.
- Mantener los endpoints de suscripción autenticados y validar todos los datos
  recibidos.

## Reglas de recordatorios

- Medicamentos activos: aviso diario al horario registrado para todos los
  cuidadores del círculo.
- Eventos: aviso en su fecha y hora para todos los cuidadores del círculo.
- Tareas asignadas: aviso al responsable.
- Tareas sin responsable: aviso a todos los cuidadores.
- Observadores no reciben recordatorios operativos.
- Completar una tarea, administrar un medicamento o desactivar un medicamento
  invalida los avisos que ya no correspondan.

## Entrega y procesamiento

- Ejecutar un worker persistente en Railway con el mismo repositorio y la misma
  base PostgreSQL que la aplicación.
- Consultar trabajo pendiente en intervalos breves y reclamar cada lote de forma
  idempotente antes de enviar.
- Usar Web Push con claves VAPID y eliminar suscripciones expiradas cuando el
  proveedor devuelva un estado definitivo.
- Registrar intentos y errores sin exponer endpoints, claves ni datos sensibles.
- Permitir que el proceso se recupere después de reinicios consultando nuevamente
  las notificaciones vencidas no enviadas.

## Centro de notificaciones

- Agregar un control de notificaciones al header privado con contador no leído.
- Mostrar el próximo cuidado y el historial reciente del usuario.
- Cada aviso enlaza a Medicamentos, Tareas o Calendario según corresponda.
- Permitir marcar avisos como leídos y activar o desactivar Push para el
  dispositivo actual.

## Restricciones conocidas

- El navegador y el sistema operativo deciden si reproducen sonido. Cuida
  enviará notificaciones visibles y no silenciosas, pero no puede ignorar el modo
  silencio, Concentración ni la configuración del dispositivo.
- En iOS y iPadOS, Web Push requiere que la aplicación esté instalada en la
  pantalla de inicio y que el permiso se solicite mediante interacción directa.
- La aplicación y el worker deben usar HTTPS en producción y compartir las
  variables de entorno necesarias.

## Verificación

- Compilar la aplicación de producción y validar el schema de Prisma.
- Probar los headers y menús con teclado en anchos móviles y de escritorio.
- Confirmar la alineación inferior entre actividad reciente y últimas notas en
  escritorio, y el apilado natural en tamaños menores.
- Verificar manifest, registro del service worker, estados de permiso y flujo de
  suscripción.
- Probar el worker con notificaciones vencidas, duplicadas, canceladas y con
  suscripciones expiradas.
- Confirmar que cada regla de destinatarios respeta el círculo y el rol.
