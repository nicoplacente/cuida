# Crucigrama Cuida

## Objetivo

Agregar al catálogo un mini crucigrama tradicional, sereno, accesible y progresivo, coherente con los demás juegos de Cuida.

## Navegación y catálogo

- Agregar una tarjeta `Crucigrama Cuida` en `/app/juegos`.
- Incluir portada propia, nombre, descripción y botón `Jugar`.
- Abrir `/app/juegos/crucigrama` en una pestaña nueva.
- Mantener un máximo de tres columnas en el catálogo.

## Mecánica

- Crear ocho niveles diseñados y validados previamente.
- Comenzar con tableros pequeños y tres palabras.
- Aumentar gradualmente dimensiones, cantidad de palabras y cruces.
- Utilizar vocabulario sobre bienestar, hogar, vínculos y cuidado.
- Escribir directamente letra por letra dentro de las casillas.
- Seleccionar una palabra tocando una casilla o su pista.
- Navegar con flechas, avanzar automáticamente al escribir y retroceder con Backspace.
- Compartir las letras de las intersecciones.
- Mostrar pistas horizontales y verticales numeradas.
- Incluir una acción `Comprobar respuestas` sin cronómetro ni penalizaciones.
- Permitir reiniciar el nivel y reiniciar todo el progreso.
- Guardar el nivel alcanzado en `localStorage` con una clave versionada.

## Arquitectura

- Mantener el catálogo y la página como Server Components.
- Aislar la interacción en un Client Component dentro del dominio `games`.
- Separar niveles, cruces, validación y navegación en una utilidad pura y testeable.
- Reutilizar componentes, tokens y patrones existentes.
- No agregar dependencias.

## Accesibilidad

- Etiquetar cada casilla con su fila, columna, número de pista y dirección activa.
- Permitir navegación completa mediante teclado.
- Mantener objetivos táctiles adecuados en móvil.
- Anunciar palabras seleccionadas, comprobaciones y finalización mediante estados accesibles.
- No depender únicamente del color para comunicar errores o aciertos.

## Verificación

- Probar palabras, cruces, numeración y validación con `node:test`.
- Ejecutar la suite completa y el build de producción.
- Completar al menos un nivel mediante una prueba interactiva.
- Revisar la interfaz en escritorio y móvil.
