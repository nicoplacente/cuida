# Catálogo de juegos y juego de memoria

## Objetivo

Incorporar una sección de juegos dentro del área privada de Cuida y ofrecer un primer juego de memoria simple, accesible y progresivo.

## Navegación

- Agregar `Juegos` a la navegación lateral y móvil.
- Crear el catálogo en `/app/juegos`.
- Abrir el juego de memoria en `/app/juegos/memoria` mediante una pestaña nueva.

## Catálogo

- Mostrar una grilla responsive de una, dos o tres columnas, sin superar tres columnas.
- Cada juego tendrá imagen, nombre, descripción y un botón `Jugar`.
- Mantener los componentes, colores, bordes, sombras y espaciados existentes en Cuida.

## Juego de memoria

- Usar un componente cliente aislado para el estado interactivo.
- Comenzar con dos pares y agregar un par por nivel para que la dificultad avance lentamente.
- Mostrar nivel, movimientos y pares encontrados.
- Bloquear temporalmente nuevas selecciones mientras se comparan dos cartas.
- Permitir reiniciar el nivel y reiniciar todo el progreso.
- Guardar el nivel alcanzado en `localStorage`, sin persistencia en base de datos.
- Usar `public/cuida-icon-192.png` en el dorso de todas las cartas.
- Garantizar interacción con teclado, etiquetas accesibles y adaptación a pantallas pequeñas.

## Arquitectura

- Mantener el catálogo como Server Component.
- Separar la lógica pura del mazo y la progresión en una utilidad testeable.
- Mantener la interfaz interactiva del juego en un componente dentro del dominio `games`.
- No agregar dependencias nuevas.

## Verificación

- Probar la generación del mazo y la progresión de niveles con `node:test`.
- Ejecutar la suite existente y el build de producción.
- Revisar que el catálogo y el juego sean navegables y responsive.
