# Diseño: acceso progresivo desde invitaciones

## Objetivo

Evitar que la aceptación de una invitación muestre simultáneamente los
formularios de inicio de sesión y registro. La pantalla priorizará el acceso de
personas con cuenta existente y permitirá cambiar explícitamente al registro.

## Flujo

Cuando la persona no tenga una sesión activa, se mostrará únicamente el
formulario para iniciar sesión. Debajo habrá una acción secundaria con el texto
“¿No tenés cuenta? Crear una cuenta”. Al activarla, el formulario será
reemplazado por el registro y la acción pasará a ser “¿Ya tenés cuenta? Iniciar
sesión”.

El cambio de modo no conservará valores ni errores del formulario anterior.
Cada formulario mantendrá su Server Action, validaciones, estado pendiente y
mensajes actuales. El resumen del círculo, la persona cuidada, el rol y el
vencimiento permanecerán visibles en ambos modos.

Las personas que ya tengan una sesión activa conservarán el flujo actual de
confirmación directa. Los estados de invitación inexistente, cancelada o vencida
tampoco cambiarán.

## Arquitectura

La página continuará como Server Component y resolverá la invitación y la
sesión en el servidor. Un componente cliente pequeño recibirá el token y las dos
Server Actions; su única responsabilidad será controlar qué formulario está
visible. Los formularios tendrán identidades separadas para reiniciar por
completo campos, errores y estado al cambiar.

## Dirección visual y accesibilidad

Se conservarán el azul tinta, turquesa, celeste, blanco y ámbar de Cuida, junto
con sus bordes y sombras suaves. La tarjeta reducirá su ancho máximo para
reforzar el foco de una única tarea. La acción para cambiar de modo tendrá
estados hover y focus, se podrá activar con teclado y moverá el foco al título
del nuevo formulario.

## Verificación

Se agregará una prueba estructural que confirme el modo inicial, las dos
acciones de cambio y el reinicio por modo. Se ejecutarán todas las pruebas y el
build de producción. Finalmente se revisará una invitación válida en mobile y
desktop, comprobando que nunca aparezcan ambos formularios a la vez.
