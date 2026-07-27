# Diseño: recuperación por email, copia de invitaciones y documentos en R2

## Objetivo

Completar el flujo de recuperación de contraseña con Resend, mejorar el feedback
al copiar invitaciones y hacer observable y confiable la subida de documentos
privados a Cloudflare R2.

## Recuperación de contraseña

- Conservar el flujo seguro existente con tokens aleatorios, hash SHA-256,
  vencimiento de 30 minutos, uso único e invalidación de sesiones.
- Enviar el correo mediante la API HTTP de Resend sin agregar dependencias.
- Configurar el remitente como
  `Cuida <no-reply@contacto.cuida.codeluxe.tech>`.
- Mantener la clave de Resend únicamente en variables privadas no versionadas.
- Crear un correo simple, adaptable y coherente con la identidad visual de Cuida,
  acompañado por una alternativa de texto plano.
- Mantener una respuesta pública uniforme para no revelar si un email está
  registrado, registrando los fallos técnicos solo en el servidor.

## Copia de invitaciones

- Crear iconos reutilizables de copiar y confirmar dentro de la carpeta de
  iconos existente.
- Mostrar el icono de copiar en el estado inicial.
- Después de una copia exitosa, mostrar un check y el texto `Copiado` durante
  dos segundos.
- Restaurar el estado original automáticamente y limpiar el temporizador al
  desmontar el componente.
- Mantener feedback mediante Toast y etiquetas accesibles.

## Documentos privados en R2

- Mantener el bucket privado y el acceso autenticado mediante la ruta interna de
  Next.js.
- Conservar la validación de tipo, extensión y tamaño antes de enviar el objeto.
- Mejorar el cliente HTTP firmado para capturar el código, mensaje e
  identificador de solicitud que devuelve R2 sin filtrar credenciales.
- Clasificar los fallos de configuración, autenticación, permisos, bucket y red
  en mensajes seguros y útiles para el usuario.
- Registrar el diagnóstico completo en el servidor para poder resolver
  diferencias entre entornos.
- Confirmar la subida con feedback visible y actualizar la biblioteca sin
  depender de una recarga manual.

## Alternativas descartadas

- No incorporar `@aws-sdk/client-s3` porque la integración actual puede
  robustecerse sin aumentar el bundle de dependencias del servidor.
- No usar cargas directas con URLs prefirmadas porque requieren CORS y nuevas
  rutas sin aportar valor para el límite actual de 8 MB.

## Verificación

- Validar la configuración de Resend y R2 sin imprimir secretos.
- Ejecutar Prisma Client y el build de producción.
- Probar estados de copia, éxito y error.
- Comprobar envío, vencimiento y uso único del enlace de recuperación.
- Comprobar subida y apertura de PDF, PNG y otros formatos admitidos.
- Cerrar cualquier servidor o proceso iniciado durante las pruebas.
