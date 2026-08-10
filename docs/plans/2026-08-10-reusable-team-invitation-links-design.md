# Enlaces reutilizables de invitación al equipo

## Objetivo

Simplificar las invitaciones del equipo para que una persona administradora genere un enlace temporal seleccionando únicamente el rol. El enlace puede ser utilizado por varias cuentas y vence 60 minutos después de su creación, aunque nadie lo haya usado.

## Generación y administración

- Solo integrantes con rol `ADMIN` pueden generar enlaces.
- El formulario solicita únicamente el rol `CAREGIVER` u `OBSERVER`.
- Cada enlace conserva el círculo, el rol, la persona que lo creó y la fecha de vencimiento.
- Los enlaces permanecen disponibles para compartir hasta que vencen o un administrador los cancela.
- La lista de invitaciones identifica cada acceso por su rol, creador y vencimiento, sin nombre ni email de destinatario.
- Los mensajes para copiar o compartir por WhatsApp no incluyen datos personales de una persona destinataria.

## Aceptación

- El enlace puede incorporar a múltiples cuentas mientras permanezca vigente.
- Una persona con sesión iniciada confirma que desea sumarse con su cuenta actual.
- Una persona sin sesión puede iniciar sesión o crear una cuenta desde la página de invitación.
- El registro desde una invitación solicita nombre, email y contraseña; no crea un nuevo círculo ni una persona cuidada.
- Cada cuenta puede tener una sola membresía por círculo.
- Si la cuenta ya pertenece al círculo, la aceptación es idempotente y no modifica su rol actual.
- Una membresía nueva recibe el rol incluido en el enlace.
- El círculo invitado queda activo al completar la incorporación.

## Datos y compatibilidad

- `CareInvitation` deja de almacenar `name`, `email` y `acceptedAt` porque el enlace no pertenece a una persona y no se consume con el primer uso.
- La migración elimina invitaciones antiguas ya aceptadas.
- Los enlaces antiguos pendientes se limitan a un máximo de 60 minutos desde su creación.
- Los nuevos enlaces calculan `expiresAt` como la hora de creación más 60 minutos.

## Seguridad y errores

- El servidor valida el formato del token, su existencia y el vencimiento tanto al mostrar como al aceptar la invitación.
- El rol se toma exclusivamente de la invitación persistida.
- La generación y revocación vuelven a comprobar permisos de administración.
- El alta de membresía es transaccional e idempotente ante intentos concurrentes.
- Los enlaces vencidos, cancelados o inválidos muestran un estado claro y no permiten autenticar ni crear membresías desde ese contexto.

## Interfaz

- La sección conserva el sistema visual existente de Cuida y reemplaza el formulario dirigido a una persona por un control de rol y una acción principal.
- La página pública funciona como una credencial temporal: muestra el círculo, la persona cuidada, el rol y la vigencia antes de pedir acceso o registro.
- Los estados de creación, copia, autenticación, registro, aceptación, vencimiento y error ofrecen feedback visible y accesible.

## Verificación

- Probar la generación sin nombre ni email y el vencimiento a los 60 minutos.
- Probar que varias cuentas distintas acepten el mismo enlace.
- Probar que una cuenta existente y una cuenta nueva puedan incorporarse.
- Probar que una cuenta ya miembro no cambie de rol.
- Probar enlaces inválidos, vencidos y cancelados.
- Actualizar las pruebas del mensaje de WhatsApp y ejecutar pruebas y build de producción.
