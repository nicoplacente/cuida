# Donaciones para sostener Cuida

## Objetivo

Incorporar una invitación opcional a colaborar con los costos de infraestructura de Cuida, sin integrar la API de Mercado Pago ni interrumpir la experiencia principal de la landing.

## Experiencia

- Agregar un enlace “Donar” en la navegación de escritorio y móvil.
- Llevar primero a la sección `#donaciones` para explicar el propósito de la colaboración.
- Ubicar la sección al final de la landing, después del contenido principal.
- Abrir el enlace oficial de Mercado Pago en una pestaña nueva para que cada persona elija el monto.
- Comunicar con claridad que Cuida seguirá siendo gratuita y que colaborar no es obligatorio.

## Contenido

La sección utilizará el siguiente mensaje:

> Si Cuida te ayuda, podés ayudarnos a mantenerla disponible.

> Cuida seguirá siendo gratuita. Si querés colaborar, tu aporte nos ayuda a cubrir los servidores que hoy sostenemos nosotros. No es obligatorio: cualquier ayuda, del monto que elijas, suma.

La llamada a la acción será “Donar por Mercado Pago”.

## Configuración y seguridad

- Configurar la URL mediante `NEXT_PUBLIC_MERCADO_PAGO_DONATION_URL`.
- Aceptar únicamente URLs HTTPS oficiales de Mercado Pago.
- Ocultar el enlace de navegación y la sección completa cuando la variable falte o sea inválida.
- Aplicar `target="_blank"` y `rel="noopener noreferrer"` al enlace externo.

## Arquitectura

- Centralizar la lectura y validación de la URL en una utilidad compartida.
- Mantener la landing como Server Component.
- Pasar al menú móvil únicamente si las donaciones están disponibles, sin agregar estado global ni dependencias.
- Reutilizar `Shell`, `Card`, `SectionTitle` y `LinkButton` para conservar el sistema visual actual.

## Verificación

- Ejecutar el build de producción.
- Comprobar el estado sin variable configurada.
- Comprobar el enlace, la navegación y el diseño responsive con una URL válida de prueba.
- Revisar accesibilidad del enlace y ausencia de errores de hidratación.
