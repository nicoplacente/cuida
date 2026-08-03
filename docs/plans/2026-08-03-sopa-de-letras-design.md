# Sopa de letras Cuida

## Objetivo

Agregar al catálogo un juego de sopa de letras sereno, accesible y progresivo, coherente con el juego de memoria existente.

## Navegación y catálogo

- Agregar una tarjeta `Sopa de letras Cuida` en `/app/juegos`.
- Incluir imagen propia, nombre, descripción y botón `Jugar`.
- Abrir `/app/juegos/sopa-de-letras` en una pestaña nueva.
- Mantener un máximo de tres columnas en el catálogo.

## Mecánica

- Crear ocho niveles diseñados y validados previamente.
- Comenzar con una cuadrícula pequeña y tres palabras.
- Aumentar gradualmente el tamaño, la cantidad de palabras y las direcciones permitidas.
- Utilizar vocabulario relacionado con bienestar, vínculos, hogar y cuidado.
- Permitir seleccionar palabras arrastrando con mouse o dedo, eligiendo inicio y fin, y mediante teclado.
- Resaltar la selección activa, las palabras encontradas y el progreso.
- No utilizar límite de tiempo.
- Permitir reiniciar el nivel y reiniciar todo el progreso.
- Guardar el nivel alcanzado en `localStorage` con una clave versionada.

## Arquitectura

- Mantener el catálogo y la página como Server Components.
- Aislar la interacción en un Client Component dentro del dominio `games`.
- Separar la validación de líneas y niveles en una utilidad pura y testeable.
- Reutilizar los componentes, tokens y patrones existentes.
- No agregar dependencias.

## Accesibilidad

- Usar botones para cada letra con nombres accesibles.
- Mantener selección y navegación completa mediante teclado.
- Proporcionar mensajes de estado para palabras encontradas, selecciones inválidas y finalización.
- Garantizar objetivos táctiles adecuados y diseño responsive.

## Verificación

- Probar niveles, coordenadas, direcciones y validación de selecciones con `node:test`.
- Ejecutar la suite completa y el build de producción.
- Completar al menos un nivel mediante una prueba interactiva en navegador.
- Revisar el diseño en escritorio y móvil.
