# Documents and Invitations Design

## Objetivo

Corregir la subida de documentos PDF para que no rompa la interfaz y agregar un flujo real de invitaciones para que una persona cree la cuenta inicial y luego invite a otros miembros de la familia al mismo circulo de cuidado.

## Documentos

- Validar tipo y tamaño de archivo en servidor.
- Aceptar PDF, imagenes y documentos de oficina comunes.
- Guardar archivos en `public/uploads/documents`.
- Crear el registro en Prisma despues de guardar el archivo.
- Si Prisma falla, borrar el archivo para evitar archivos huerfanos.
- Redirigir con mensajes de error o exito legibles.
- Subir el limite de Server Actions a 10 MB para archivos PDF.

## Invitaciones

- Solo miembros `ADMIN` pueden invitar.
- La seccion `/app/equipo` muestra miembros activos e invitaciones pendientes.
- Un admin crea una invitacion con email, nombre opcional y rol.
- La invitacion genera un token local.
- La persona invitada abre `/invitacion/[token]`, crea su cuenta si no existe y queda vinculada al circulo.
- Si el email ya tiene usuario, el token vincula ese usuario al circulo sin reemplazar su contrasena.

## Seguridad

- Las invitaciones expiran.
- Los tokens son aleatorios y unicos.
- El rol se restringe a `CAREGIVER` u `OBSERVER` desde UI y servidor.
- Las acciones verifican membresia admin antes de crear invitaciones.
