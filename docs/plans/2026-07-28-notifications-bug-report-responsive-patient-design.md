# Notificaciones, reporte de errores y paciente responsive

## Objetivo

Verificar y reforzar las notificaciones Push y los recordatorios, agregar un
acceso para reportar errores al final de la landing y adaptar la tarjeta de la
persona cuidada según el tamaño de pantalla.

## Notificaciones y recordatorios

Se conserva la arquitectura existente con Next.js, PostgreSQL, Web Push y el
worker persistente de Railway. El service worker solicitará notificaciones
audibles mediante `silent: false` y podrá acompañarlas con vibración en
dispositivos compatibles. El sonido efectivo seguirá sujeto a los permisos,
volumen y modos de concentración del sistema operativo.

La revisión cubrirá:

- generación de recordatorios para medicamentos, tareas y eventos;
- anticipaciones de 15, 30 y 60 minutos, incluida la transición al día anterior;
- ausencia de notificaciones cuando se selecciona “Sin recordatorio”;
- deduplicación, cancelación y reclamo temporal de entregas;
- suscripciones expiradas y respuestas Push transitorias;
- contenido y opciones enviadas al service worker.

Se agregarán pruebas deterministas para los comportamientos que no dependan de
un proveedor Push o dispositivo físico.

## Landing

La última sección de la landing invitará a reportar errores encontrados. El
enlace abrirá el formulario de incidencias del repositorio oficial en una nueva
pestaña y utilizará las protecciones correspondientes para enlaces externos.

La sección reutilizará `Shell`, `Card`, `SectionTitle` y `LinkButton`, junto con
la paleta y el espaciado existentes.

## Dashboard

La tarjeta de la persona cuidada tendrá dos niveles responsive:

- Desktop: logo de Cuida, “Paciente asociado”, nombre, edad, enfermedad y notas.
- Mobile: únicamente “Paciente asociado”, nombre y enfermedad.

El logo será siempre el de Cuida y no dependerá de `patient.photo`.

## Verificación

Se ejecutarán las pruebas automatizadas y el build de producción. También se
realizará una revisión visual de la landing y el dashboard en tamaños mobile y
desktop, manteniendo intactos los cambios no relacionados del usuario.
