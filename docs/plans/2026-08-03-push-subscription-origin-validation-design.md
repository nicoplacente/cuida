# Corrección del alta de notificaciones Push en producción

## Objetivo

Permitir que la aplicación instalada y los navegadores compatibles registren
sus suscripciones Push en producción, manteniendo la protección contra
solicitudes de orígenes externos.

## Causa confirmada

El endpoint `POST /api/push/subscriptions` compara el encabezado `Origin` con
el origen de `request.url`. Detrás de Cloudflare y Railway, `request.url`
representa la URL interna del proxy y no `https://cuida.codeluxe.tech`. Por
eso, una solicitud legítima del sitio publicado se rechaza con estado 403
antes de validar la sesión o guardar la suscripción.

## Arquitectura

- Mantener el Route Handler, Prisma, Web Push y el service worker actuales.
- Centralizar la validación de origen en una utilidad pura y reutilizable.
- Tomar el origen público permitido de `NEXT_PUBLIC_APP_URL`, normalizado con
  la API `URL`, en lugar de inferirlo desde la URL interna de la solicitud.
- Rechazar de forma cerrada las solicitudes sin `Origin`, con un origen
  diferente o con una configuración pública inválida.
- No confiar en encabezados reenviados ni eliminar la protección de origen.
- No agregar dependencias.

## Flujo de activación

1. El navegador solicita permiso para mostrar notificaciones.
2. El service worker crea o recupera la suscripción Push del dispositivo.
3. El cliente envía la suscripción al Route Handler con las credenciales de la
   sesión y el encabezado `Origin` generado por el navegador.
4. El servidor valida el origen contra `NEXT_PUBLIC_APP_URL`.
5. El servidor valida la sesión y los campos de la suscripción.
6. Prisma crea o actualiza la suscripción asociada al usuario.
7. El cliente confirma que los avisos quedaron activados.

## Manejo de errores

- Conservar respuestas genéricas y seguras desde el servidor.
- Diferenciar en el cliente los fallos de soporte, permisos y persistencia para
  evitar atribuir todos los errores al dispositivo.
- Mantener el estado desactivado si el servidor no confirma el guardado.
- No mostrar detalles internos, nombres de variables ni respuestas sin filtrar.

## Verificación

- Probar la normalización y aceptación del origen público configurado.
- Probar el rechazo de orígenes externos, ausentes y configuraciones inválidas.
- Probar que el Route Handler mantiene la validación antes del acceso a datos.
- Ejecutar la suite completa y el build de producción.
- Verificar después del despliegue que el endpoint ya no responde 403 a una
  solicitud legítima y que el alta funciona en escritorio y en la PWA móvil.

