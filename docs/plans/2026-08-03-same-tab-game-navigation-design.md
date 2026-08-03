# Navegación de juegos en la misma pestaña

## Objetivo

Abrir los cuatro juegos del catálogo dentro de la pestaña actual para conservar
la continuidad de navegación de Cuida.

## Alcance

- Modificar únicamente los botones `Jugar` de `/app/juegos`.
- Mantener las rutas internas actuales de cada juego.
- Eliminar `target="_blank"` y el `rel` asociado.
- Actualizar los nombres accesibles para quitar la referencia a una pestaña nueva.
- No modificar enlaces de donaciones, GitHub, WhatsApp o documentos.

## Implementación

Los botones continuarán utilizando el componente `LinkButton` existente. Al ser
rutas internas, la navegación se resolverá en la pestaña actual sin convertir la
página en Client Component ni agregar lógica imperativa con `router.push`.

## Verificación

- Agregar una prueba que compruebe que los botones de juego no usan `_blank`.
- Ejecutar la suite completa y el build de producción.
- Confirmar que los demás enlaces con `_blank` permanecen sin cambios.
