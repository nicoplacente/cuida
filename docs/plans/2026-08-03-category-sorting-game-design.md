# Diseño: juego de palabras por categoría

## Objetivo

Agregar al catálogo de Juegos una actividad de clasificación semántica, tranquila y accesible. La persona debe ubicar cada palabra en su categoría correcta mediante arrastre o mediante una secuencia de selección y destino.

## Experiencia principal

La pantalla mostrará las categorías en tarjetas y, debajo, un banco de palabras sin clasificar. Cada palabra podrá resolverse de dos maneras:

1. Arrastrarla hasta una categoría.
2. Seleccionarla y luego pulsar la categoría elegida.

La segunda opción será también el flujo de teclado. La palabra seleccionada y la categoría que está recibiendo un arrastre tendrán estados visuales claros.

Cuando la respuesta sea correcta, la ficha se incorporará a la tarjeta de su categoría con una transición suave y se actualizará el progreso. Cuando sea incorrecta, la ficha permanecerá en el banco, se deseleccionará y aparecerá un mensaje amable. No habrá puntos, cronómetro ni penalizaciones.

## Progresión

El recorrido tendrá ocho niveles determinísticos y guardará el último nivel alcanzado en `localStorage`.

| Nivel | Categorías | Palabras | Enfoque |
| --- | ---: | ---: | --- |
| 1 | 3 | 8 | Frutas, animales y colores |
| 2 | 3 | 9 | Objetos cotidianos muy diferentes |
| 3 | 3 | 10 | Naturaleza, alimentos y acciones |
| 4 | 4 | 12 | Primera ampliación de categorías |
| 5 | 4 | 14 | Vocabulario cotidiano más variado |
| 6 | 4 | 16 | Categorías con mayor cercanía temática |
| 7 | 5 | 17 | Más destinos visibles y palabras relacionadas |
| 8 | 5 | 18 | Distinciones semánticas más finas |

La cantidad de categorías y palabras nunca disminuirá. Las palabras serán únicas dentro de cada nivel y tendrán una única respuesta válida.

## Interfaz

- Encabezado con nivel, título, progreso y acción para reiniciar.
- Grilla adaptable de tarjetas de categorías, de una a cinco columnas según el espacio disponible.
- Cada tarjeta mostrará su nombre y las palabras ya clasificadas.
- Banco inferior de fichas grandes, legibles y con áreas táctiles cómodas.
- Mensajes de estado anunciados mediante una región `aria-live`.
- Panel de nivel completado, avance al siguiente nivel y reinicio del recorrido.
- Diseño mobile-first con los colores, bordes, sombras y componentes existentes de Cuida.

## Arquitectura

- `src/utils/category-sorting.js`: niveles, validación, acceso seguro y utilidades puras.
- `src/features/games/category-sorting-game.jsx`: estado e interacción del juego.
- `src/app/(app)/app/juegos/clasificar-palabras/page.jsx`: página interna del juego.
- `src/utils/category-sorting.test.js`: pruebas de progresión, unicidad y validación.
- `public/games/category-sorting-cover.png`: portada del catálogo.
- `src/app/(app)/app/juegos/page.jsx`: cuarta ficha del catálogo, manteniendo un máximo de tres columnas.

La capa visual recibirá los niveles ya normalizados. El estado conservará las palabras clasificadas, la selección activa, el destino señalado durante un arrastre, el mensaje y el estado del nivel.

## Manejo de errores

- Una clasificación incorrecta devuelve feedback inmediato y no modifica el progreso.
- Un arrastre cancelado conserva la palabra en el banco.
- Si `localStorage` no está disponible, el juego continúa desde el nivel actual.
- Los números de nivel fuera de rango se limitan a valores seguros.
- Los datos de niveles se validan para detectar categorías inexistentes, palabras duplicadas o niveles vacíos.

## Verificación

- Pruebas unitarias para los ocho niveles y la progresión.
- Pruebas de clasificación correcta e incorrecta.
- Verificación de palabras únicas y referencias válidas a categorías.
- Compilación de producción de Next.js.
- Revisión interactiva del flujo por clic, arrastre, teclado, avance de nivel y presentación adaptable.
