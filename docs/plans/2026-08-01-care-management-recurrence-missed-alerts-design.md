# Gestión integral de cuidados, recurrencias y avisos de incumplimiento

## Objetivo

Completar la gestión de la información del círculo de cuidado con edición y
eliminación consistentes, datos de nacimiento del paciente, medicamentos con
recurrencias reales y notificaciones cuando una acción prevista siga pendiente
una hora después de su fecha y horario.

## Alcance

- Permitir editar y eliminar tareas, medicamentos, eventos, documentos y
  registros del historial diario.
- Permitir editar los datos del paciente asociado.
- Reemplazar la edad manual de los nuevos pacientes por una fecha de nacimiento
  y calcular la edad al mostrarla.
- Admitir medicamentos con uno o varios horarios diarios exactos.
- Admitir medicamentos cada una cantidad libre de horas.
- Definir para cada medicamento una fecha de inicio y una fecha de fin opcional,
  o indicar que el tratamiento no tiene límite.
- Mantener un recordatorio previo obligatorio por cada ocurrencia y agregar un
  aviso de incumplimiento una hora después.
- Incorporar a los eventos el estado realizado, con autor y fecha de registro.

## Arquitectura y datos

Se mantiene la arquitectura existente con Next.js App Router, Server
Components, Server Actions, Prisma, PostgreSQL, Web Push y el worker persistente.

`Patient` incorporará `birthDate`. Los nuevos círculos exigirán este dato. Los
pacientes existentes conservarán temporalmente la edad almacenada como respaldo
hasta que se cargue su fecha real mediante la edición del paciente. La edad se
calculará en cada lectura comparando la fecha actual con el mes y día de
nacimiento.

`Medication` tendrá una modalidad estructurada: horarios diarios o intervalo.
También almacenará fecha de inicio, fecha de fin opcional, cantidad diaria
declarada, intervalo positivo en horas y hora inicial según corresponda. Los
horarios diarios se almacenarán como registros relacionados, ordenados y sin
duplicados. `MedicationAdministration` continuará identificando de forma única
cada ocurrencia mediante `medicationId` y `scheduledFor`.

`CalendarEvent` incorporará estado realizado, fecha de realización y usuario
que lo marcó. `CareTask` mantendrá su modelo actual de finalización.

`Notification` distinguirá recordatorios previos y avisos de incumplimiento. La
clave de ocurrencia incluirá el tipo de aviso para permitir ambos sin duplicar
entregas.

La actividad del círculo incorporará los tipos necesarios para registrar
ediciones, eliminaciones y finalizaciones. Al eliminar un documento se eliminará
también su objeto protegido en R2.

## Interfaz

El dashboard mostrará una acción `Editar datos del paciente` dentro de la
tarjeta existente. El modal permitirá cambiar nombre, fecha de nacimiento,
condición médica y notas importantes. La edad mostrada siempre será calculada
cuando exista una fecha de nacimiento exacta.

El formulario de medicamentos permitirá elegir el período del tratamiento y la
modalidad de recurrencia:

- En `Horarios diarios`, la persona indicará cuántas veces se administra por día
  y completará esa misma cantidad de horarios exactos.
- En `Cada X horas`, indicará un intervalo entero positivo y la hora de la
  primera toma en la fecha inicial.
- En ambas modalidades elegirá fecha inicial y fecha final, o marcará `Sin fecha
  límite`.
- Todo medicamento tendrá un recordatorio previo obligatorio de 15, 30 o 60
  minutos y un aviso de incumplimiento fijo una hora después.

Cada toma prevista se mostrará y registrará de forma independiente. Tareas y
eventos mostrarán estados pendientes, realizados o vencidos. Los eventos tendrán
una acción explícita para marcarlos como realizados.

Todas las eliminaciones exigirán una confirmación accesible. Los documentos
permitirán editar título y notas; para reemplazar un archivo será necesario
eliminarlo y subir uno nuevo. Los registros del historial permitirán modificar
tipo, detalle y fecha y hora.

La implementación reutilizará tarjetas, modales, formularios, mensajes y tokens
visuales existentes, sin agregar dependencias.

## Flujo de notificaciones

El worker calculará solo las ocurrencias cercanas, sin materializar tratamientos
infinitos. Para horarios diarios combinará cada fecha activa con sus horarios.
Para intervalos calculará las ocurrencias desde la fecha y hora inicial mediante
la diferencia temporal y el intervalo configurado.

Por cada ocurrencia se podrá crear:

1. Un recordatorio previo según la anticipación configurada.
2. Un aviso de incumplimiento programado una hora después.

Marcar una toma, tarea o evento dentro de la hora de tolerancia cancelará el
aviso pendiente. Los recordatorios de tareas asignadas se dirigirán a la persona
responsable. Si una tarea vence, el aviso llegará a administradores y cuidadores
del círculo. Medicamentos y eventos notificarán a administradores y cuidadores.

Las claves de ocurrencia incluirán categoría, origen, fecha, hora, tipo de aviso
y anticipación cuando corresponda. Esto mantendrá la entrega idempotente aun
cuando el worker se ejecute cada treinta segundos.

## Validación, permisos y errores

El servidor validará que:

- la fecha final no sea anterior a la inicial;
- la cantidad diaria coincida con la cantidad de horarios;
- los horarios diarios sean válidos y no estén repetidos;
- el intervalo sea un entero positivo;
- la anticipación pertenezca a las opciones permitidas;
- cada elemento pertenezca al círculo activo.

Los observadores tendrán acceso de lectura. Administradores y cuidadores podrán
crear, editar, completar y eliminar. Los errores conservarán el formato de
resultado y los mensajes visibles existentes.

Si falla la eliminación del archivo remoto de un documento, la acción informará
el error y conservará el registro para evitar una referencia eliminada con un
archivo huérfano. Las actualizaciones de datos relacionados y actividad se
realizarán transaccionalmente cuando Prisma lo permita.

## Compatibilidad

Las migraciones preservarán los medicamentos y pacientes existentes. Los
medicamentos actuales se convertirán a la modalidad de un horario diario con su
horario, frecuencia y recordatorio existentes. Los pacientes sin fecha de
nacimiento seguirán mostrando su edad histórica hasta que un cuidador cargue la
fecha exacta.

## Verificación

Se agregarán pruebas para:

- edad antes, durante y después del cumpleaños;
- uno y varios horarios diarios;
- intervalos que cruzan días y madrugadas;
- fechas iniciales, finales y tratamientos sin límite;
- deduplicación de recordatorios y avisos de incumplimiento;
- cancelación del aviso al registrar una acción dentro de la tolerancia;
- estados pendientes, realizados y vencidos;
- autorización por rol y pertenencia al círculo;
- edición y eliminación de cada tipo de registro;
- eliminación coordinada de documentos y objetos de R2.

Finalmente se ejecutarán todas las pruebas automatizadas y el build de
producción. La revisión preservará los cambios locales no relacionados y no
dejará procesos ni puertos abiertos.
