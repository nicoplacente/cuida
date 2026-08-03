# Sanitización integral de errores del servidor

## Objetivo

Evitar que errores internos, valores o nombres de variables de entorno, rutas,
URLs, stacks, causas y respuestas de proveedores aparezcan en toasts, URLs,
respuestas HTTP o consolas. La observabilidad se conserva mediante metadatos
controlados y seguros en todos los entornos, incluido desarrollo.

## Arquitectura

- Mantener Next.js App Router, Server Actions, Prisma y las dependencias actuales.
- Crear una utilidad central de registro que acepte un contexto controlado y
  extraiga únicamente el tipo de error, un código seguro y un estado numérico.
- No registrar mensajes, stacks, causas, objetos completos, URLs, identificadores
  de proveedor ni datos recibidos del usuario.
- Separar los resultados serializables de las Server Actions de la lógica de
  registro exclusiva del servidor.
- Desactivar el registro automático de Prisma y sanitizar sus excepciones en el
  límite de acceso a datos antes de propagarlas a Next.js.

## Flujo de errores

1. Los errores esperados continúan devolviendo mensajes de validación explícitos.
2. Las excepciones inesperadas se registran mediante la utilidad segura.
3. Las Server Actions devuelven el mensaje genérico existente.
4. Los Route Handlers conservan respuestas JSON controladas y sin detalles.
5. Los servicios externos registran únicamente códigos y estados permitidos.
6. Los errores de configuración usan códigos genéricos y no enumeran variables.
7. Los errores de Prisma se reemplazan por una excepción interna genérica, sin
   stack ni causa, antes de que puedan alcanzar el registro de Next.js.

## URLs sensibles

- Mantener los tokens de invitación y recuperación únicamente en las rutas que
  los necesitan funcionalmente.
- Aplicar `Cache-Control: no-store` y `Referrer-Policy: no-referrer` tanto a las
  invitaciones como al restablecimiento de contraseña.
- Conservar `reason=session-expired` como único estado técnico permitido en la
  URL, sin aceptar ni reflejar mensajes arbitrarios.

## Verificación

- Agregar pruebas unitarias para el logger seguro y los resultados públicos.
- Inyectar errores falsos con secretos, URLs, stacks y causas para comprobar que
  ninguno aparece en la salida registrada.
- Verificar que los errores de configuración no enumeren variables faltantes.
- Ejecutar la suite completa y el build de producción.
- Auditar bundles, respuestas, URLs y consola del navegador.
- Cerrar cualquier servidor temporal y eliminar sus logs al finalizar.
