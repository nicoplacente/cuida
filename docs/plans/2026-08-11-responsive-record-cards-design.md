# Tarjetas responsive para registros de cuidado

## Objetivo

Evitar que los textos largos desplacen o desorganicen las acciones de Tareas, Calendario e Historial. Aprovechar todo el ancho disponible para títulos, descripciones, ubicaciones, notas y fechas en esas secciones y en Medicamentos, sin truncar contenido.

## Patrón visual

Cada tarjeta tendrá cuatro zonas independientes:

1. Una primera fila estable con todos los metadatos e indicadores breves.
2. Una segunda fila con todas las acciones alineadas al inicio.
3. Un cuerpo de contenido a ancho completo.
4. Una sección inferior opcional para información secundaria, como las tomas del día.

Las acciones permanecerán en una fila propia, antes del contenido, y se acomodarán entre sí cuando el ancho sea reducido. El contenido largo no participará de esa fila, por lo que no podrá empujar las acciones ni quedar limitado a una columna angosta.

## Componente compartido

Se creará un componente visual pequeño para reutilizar la estructura de tarjeta. Recibirá nodos para los metadatos, las acciones, el cuerpo y, cuando corresponda, el contenido inferior. No contendrá lógica de negocio ni estado y podrá utilizarse desde Server Components.

El componente aplicará:

- ancho mínimo cero en las zonas flexibles;
- ajuste de palabras largas;
- acciones agrupadas y siempre alineadas al inicio de su propia fila;
- botones de acción compactos únicamente en anchos móviles;
- separación visual consistente entre encabezado, cuerpo y contenido inferior;
- crecimiento vertical natural, sin límites de líneas.

## Aplicación por sección

### Tareas

La primera fila mostrará fecha, horario, recordatorio y estado. En móvil, fecha y horario quedarán a la izquierda, el estado a la derecha y el recordatorio ocupará una línea secundaria. La segunda contendrá las acciones y, si corresponde, la etiqueta `Completada por…`. En móvil, la acción principal ocupará todo el ancho y `Editar` y `Eliminar` compartirán una fila con el mismo ancho. El cuerpo mostrará título, descripción y responsable usando todo el ancho.

### Calendario

La primera fila mostrará fecha, horario, recordatorio y estado. En móvil, fecha y horario quedarán a la izquierda, el estado a la derecha y el recordatorio ocupará una línea secundaria. La segunda contendrá las acciones y, si corresponde, la etiqueta `Realizado por…`. En móvil, la acción principal ocupará todo el ancho y `Editar` y `Eliminar` compartirán una fila con el mismo ancho. El cuerpo mostrará título, ubicación y notas a ancho completo.

### Historial

La primera fila mostrará fecha, horario, tipo y autor. En móvil, fecha y horario quedarán a la izquierda, el tipo a la derecha y el autor ocupará una línea secundaria. La segunda contendrá las acciones; en móvil, `Editar` y `Eliminar` tendrán el mismo ancho. El contenido del registro ocupará todo el ancho inferior.

### Medicamentos

La primera fila conservará estado, frecuencia y recordatorio. En móvil, estado y frecuencia compartirán la línea principal y el recordatorio ocupará una línea secundaria. La segunda contendrá las acciones; en móvil, `Desactivar` o `Activar` ocupará todo el ancho superior y `Editar` y `Eliminar` compartirán una fila inferior con el mismo ancho. Esta jerarquía evitará que la etiqueta más larga desborde su contenedor. El cuerpo mostrará nombre, vigencia e indicaciones a ancho completo. La sección `Tomas de hoy` permanecerá debajo, separada por un borde.

## Responsive y accesibilidad

En pantallas amplias, los metadatos ocuparán la primera fila y las acciones comenzarán desde el borde izquierdo de la segunda, conservando exactamente la distribución existente. En pantallas angostas, cada grupo de metadatos utilizará dos líneas deliberadas en lugar de depender del ajuste automático. Las acciones usarán una grilla con anchos uniformes; las acciones principales largas podrán abarcar todas sus columnas. Los botones reducirán moderadamente su tipografía y padding solo en móvil, conservarán una altura táctil mínima coherente, sus estados de foco y sus etiquetas actuales.

Los cambios responsive se aplicarán mediante variantes móviles y `sm:` sobre el componente compartido y sus zonas, sin duplicar tarjetas ni condicionar la lógica de negocio por tamaño de pantalla.

Todo el contenido se mostrará completo. Los textos usarán envoltura de palabras para evitar desbordes horizontales, incluidas cadenas extensas sin espacios.

## Verificación

- Revisar las cuatro secciones con contenido breve y extenso.
- Verificar anchos móviles equivalentes a las capturas y un ancho de escritorio.
- Confirmar que los metadatos mantengan la jerarquía de dos líneas y que los botones móviles tengan anchos uniformes.
- Confirmar que `Desactivar` y `Activar` no desborden en Medicamentos a ningún ancho móvil compatible.
- Confirmar que las acciones permanezcan arriba y que el cuerpo utilice todo el ancho.
- Ejecutar las pruebas existentes y el build de producción.
- Preservar los cambios locales previos en Calendario e Historial.
