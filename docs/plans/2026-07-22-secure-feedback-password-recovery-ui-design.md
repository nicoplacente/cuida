# Diseño: feedback seguro, recuperación de contraseña y navegación móvil

## Objetivo

Mejorar la experiencia de autenticación, invitaciones, navegación y notificaciones sin exponer errores internos ni mensajes de estado en la URL.

## Arquitectura

- Mantener Next.js App Router, Server Actions, Prisma y los patrones actuales del proyecto.
- Incorporar `sonner` como única dependencia nueva para un sistema global y accesible de Toast.
- Normalizar el resultado público de las acciones mediante estados `success` y `error` con mensajes controlados.
- Registrar detalles técnicos exclusivamente en el servidor y devolver mensajes genéricos ante fallos inesperados.
- Eliminar los parámetros `error`, `success` y tokens temporales de invitación de las redirecciones.

## Recuperación de contraseña

- Añadir un modelo Prisma para tokens de recuperación asociados al usuario.
- Generar tokens aleatorios de 32 bytes y almacenar únicamente su hash SHA-256.
- Hacerlos de un solo uso, con vencimiento de 30 minutos y limitación temporal de solicitudes.
- Responder siempre con el mismo mensaje, exista o no una cuenta para el email indicado.
- Enviar el enlace mediante la API HTTP de Resend sin agregar un SDK.
- Validar la nueva contraseña en el servidor e invalidar todas las sesiones del usuario después del cambio.
- Documentar `RESEND_API_KEY` y `RESEND_FROM_EMAIL`.

## Formularios y feedback

- Crear wrappers reutilizables para conectar Server Actions con `sonner`.
- Auditar todas las acciones mutables para capturar errores inesperados y evitar detalles sensibles.
- Mostrar éxito, validaciones y fallos mediante Toast, nunca mediante la URL.
- Mantener redirecciones únicamente para cambios reales de pantalla o sesión.

## Interfaz

- Reemplazar “Tu nombre” por “Nombre completo”.
- Crear un campo de contraseña reutilizable con controles accesibles para mostrar y ocultar el valor.
- Centralizar los iconos propios en componentes independientes, dado que el proyecto no posee una librería de iconos.
- Sustituir “Menú” y “Salir” por iconos con nombres accesibles.
- Convertir el menú móvil de la landing en un panel de altura completa.
- Ajustar el centro de notificaciones al ancho disponible del viewport móvil.
- Mostrar las invitaciones nuevas en un modal con acción directa de WhatsApp y copia manual como alternativa.

## Sistema visual

- Conservar la paleta existente de azul profundo, turquesa, blanco y celeste suave.
- Mantener la profundidad mediante bordes discretos y sombras suaves ya utilizadas por la aplicación.
- Respetar la escala actual de espaciado, radios y tipografía Geist.
- Implementar estados hover, focus, disabled y loading, además de navegación por teclado y etiquetas ARIA.

## Verificación

- Generar y validar Prisma Client y la migración.
- Ejecutar el build de producción.
- Revisar que no queden parámetros de error o éxito en URLs.
- Probar recuperación, uso único, vencimiento e invalidación de sesiones.
- Verificar visualmente menús, modal y notificaciones en tamaños móviles y de escritorio.
- Cerrar cualquier servidor de prueba al terminar.
