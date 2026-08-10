# Tipos de notas y acciones consistentes

## Objetivo

Mejorar la lectura de las últimas notas del dashboard y corregir la distribución de las acciones en calendario e historial sin modificar medicamentos.

## Diseño aprobado

- Mostrar en cada nota reciente del dashboard un tag con el tipo de registro.
- Centralizar las etiquetas de tipos de registro para que dashboard e historial utilicen los mismos textos.
- Reorganizar cada evento de calendario con la información a la izquierda y las acciones apiladas a la derecha, siguiendo el patrón existente de tareas.
- Mostrar el estado de los eventos realizados con el mismo tratamiento de badge utilizado por las tareas completadas.
- Reorganizar cada registro del historial con fecha, tipo, autor y contenido a la izquierda, y las acciones Editar y Eliminar apiladas a la derecha.
- Conservar la paleta, las superficies, los bordes, los estados interactivos y el espaciado existentes.
- No modificar la sección de medicamentos ni agregar dependencias.

## Verificación

- Confirmar que cada nota reciente muestre el tipo correcto.
- Confirmar que las acciones de calendario e historial mantengan una columna estable y legible en escritorio y se adapten al ajuste de línea en pantallas angostas.
- Confirmar que los estados pendiente, vencido y realizado conserven su semántica visual.
- Ejecutar las pruebas automatizadas y la compilación de producción.
