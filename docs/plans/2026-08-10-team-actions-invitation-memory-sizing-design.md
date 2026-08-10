# Diseño: acciones de equipo, enlaces y tamaño de Memoria Cuida

## Objetivo

Corregir la jerarquía y ubicación de las acciones administrativas de Equipo,
restablecer la generación y presentación de enlaces de invitación y aumentar
ligeramente el tamaño de las cartas de Memoria Cuida sin provocar desbordes en
pantallas móviles.

## Acciones administrativas

Los controles de cada miembro se organizarán como una fila responsive estable.
El selector conservará espacio flexible, mientras que las acciones usarán
etiquetas breves y ancho intrínseco en escritorio. En móvil se apilarán y
mantendrán un área táctil accesible. Las acciones destructivas seguirán
requiriendo el modal de confirmación existente, con sus textos completos.

La sección Gestión del grupo mantendrá el texto explicativo como contenido
principal. Sus acciones quedarán agrupadas y alineadas al extremo derecho en
escritorio, con dimensiones compactas y sin saltos de línea innecesarios. En
móvil ocuparán el ancho disponible para facilitar la interacción.

## Enlaces de invitación

El formulario conservará la Server Action y el modal de compartir existentes.
La acción validará permisos y rol, creará el enlace reutilizable y devolverá el
resultado al estado del formulario. El cliente mostrará inmediatamente el modal
con la URL creada. Los errores de base de datos o de configuración continuarán
sanitizados, pero se verificará la compatibilidad entre el esquema Prisma, la
migración y la acción para eliminar la causa del fallo actual.

## Memoria Cuida

Las cartas aumentarán un escalón de tamaño en móvil y otro desde pantallas
medianas. La grilla seguirá centrada, con columnas automáticas y separación
compacta, para que el nivel máximo permanezca visible sin scroll horizontal. El
icono, los símbolos, radios, foco, giro y estados de coincidencia se escalarán
proporcionalmente sin modificar las reglas ni la progresión del juego.

## Dirección visual y accesibilidad

Se conservarán el azul tinta, turquesa, celeste y rojo semántico de Cuida, las
superficies claras con bordes suaves y la tipografía actual. La profundidad
seguirá basada en bordes y sombras sutiles; no se incorporarán dependencias ni
estilos inline. Todos los controles mantendrán estados hover, focus, disabled y
pending, además de etiquetas accesibles.

## Verificación

Se actualizarán las pruebas estructurales del juego y se agregarán pruebas para
la presentación del resultado de invitación si el patrón actual lo permite. Se
ejecutarán todas las pruebas y el build de producción. Finalmente se revisarán
Equipo y Memoria Cuida en viewports móvil y escritorio, cerrando cualquier
servidor temporal utilizado.
