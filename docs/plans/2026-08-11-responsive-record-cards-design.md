# Tarjetas responsive para registros de cuidado

## Objetivo

Evitar que los textos largos desplacen o desorganicen las acciones de Tareas, Calendario e Historial. Aprovechar todo el ancho disponible para títulos, descripciones, ubicaciones, notas y fechas en esas secciones y en Medicamentos, sin truncar contenido.

## Patrón visual

Cada tarjeta tendrá tres zonas independientes:

1. Un encabezado estable con indicadores breves y acciones.
2. Un cuerpo de contenido a ancho completo.
3. Una sección inferior opcional para información secundaria, como las tomas del día.

Las acciones permanecerán en la parte superior y se acomodarán entre sí cuando el ancho sea reducido. El contenido largo no participará de esa misma fila, por lo que no podrá empujar las acciones hacia abajo ni quedar limitado a una columna angosta.

## Componente compartido

Se creará un componente visual pequeño para reutilizar la estructura de tarjeta. Recibirá nodos para el encabezado, las acciones, el cuerpo y, cuando corresponda, el contenido inferior. No contendrá lógica de negocio ni estado y podrá utilizarse desde Server Components.

El componente aplicará:

- ancho mínimo cero en las zonas flexibles;
- ajuste de palabras largas;
- acciones agrupadas y alineadas al inicio o al final según el espacio disponible;
- separación visual consistente entre encabezado, cuerpo y contenido inferior;
- crecimiento vertical natural, sin límites de líneas.

## Aplicación por sección

### Tareas

El encabezado mostrará fecha, horario, recordatorio y estado junto con las acciones. El cuerpo mostrará título, descripción y responsable usando todo el ancho.

### Calendario

El encabezado mostrará fecha, horario, recordatorio y estado junto con las acciones. El cuerpo mostrará título, ubicación y notas a ancho completo.

### Historial

El encabezado mostrará fecha, horario, tipo y autor junto con las acciones. El contenido del registro ocupará todo el ancho inferior.

### Medicamentos

El encabezado conservará estado, frecuencia, recordatorio y acciones. El cuerpo mostrará nombre, vigencia e indicaciones a ancho completo. La sección `Tomas de hoy` permanecerá debajo, separada por un borde.

## Responsive y accesibilidad

En pantallas amplias, indicadores y acciones compartirán el encabezado con una alineación clara. En pantallas angostas, ambos grupos podrán envolver líneas sin superponerse. Los botones conservarán sus tamaños táctiles, estados de foco y etiquetas actuales.

Todo el contenido se mostrará completo. Los textos usarán envoltura de palabras para evitar desbordes horizontales, incluidas cadenas extensas sin espacios.

## Verificación

- Revisar las cuatro secciones con contenido breve y extenso.
- Verificar anchos móviles equivalentes a las capturas y un ancho de escritorio.
- Confirmar que las acciones permanezcan arriba y que el cuerpo utilice todo el ancho.
- Ejecutar las pruebas existentes y el build de producción.
- Preservar los cambios locales previos en Calendario e Historial.
