# Finalización de juegos y gestión del grupo de cuidado

## Objetivo

Simplificar la continuidad entre niveles de los juegos, corregir el flujo de
compartir invitaciones por WhatsApp y permitir una administración segura del
grupo de cuidado y sus miembros.

## Alcance

- Mostrar la finalización de los cuatro juegos en un modal posicionado sobre el
  juego.
- Compartir invitaciones mediante WhatsApp sin elegir previamente un número.
- Mantener la opción existente para copiar el enlace.
- Permitir cambiar roles, eliminar miembros y cancelar invitaciones pendientes.
- Permitir que cualquier miembro salga del grupo de cuidado.
- Permitir que un administrador elimine el grupo completo.
- Proteger la continuidad administrativa del grupo.
- No agregar dependencias.

## Juegos

Se creará un componente compartido `GameCompletionModal`. Cada juego utilizará
un contenedor relativo y mostrará el modal con posicionamiento absoluto sobre su
contenido, evitando que el usuario tenga que desplazarse hasta el final de la
página.

Al completar un nivel intermedio, el modal ofrecerá:

- Reiniciar el nivel actual.
- Jugar el nivel siguiente.

Al completar el último nivel, ofrecerá:

- Reiniciar el nivel actual.
- Volver al nivel 1.

El componente conservará los títulos y descripciones particulares de sopa de
letras, memoria, crucigrama y clasificación de palabras. El fondo bloqueará la
interacción con el juego, el diálogo tendrá semántica accesible y el foco de
teclado permanecerá dentro del modal.

## Compartir por WhatsApp

El mensaje seguirá incluyendo el nombre de la persona invitada y su enlace
personal. La acción intentará abrir WhatsApp mediante un enlace profundo sin
destinatario, para que la aplicación muestre la lista de contactos. Cuando la
aplicación no esté disponible, se utilizará WhatsApp Web como alternativa.

La apertura ocurrirá como consecuencia directa del clic del usuario para evitar
bloqueos del navegador. El botón para copiar el enlace no cambiará.

## Gestión de miembros e invitaciones

La página de equipo mostrará controles según el rol del usuario actual. Todas
las acciones volverán a validar en el servidor la sesión, la pertenencia al
grupo y los permisos de administrador.

Los administradores podrán:

- Cambiar el rol de otros miembros entre administrador, cuidador y observador.
- Eliminar otros miembros del grupo.
- Cancelar invitaciones pendientes.
- Eliminar el grupo de cuidado.

Un administrador no podrá modificar su propio rol ni eliminarse desde los
controles administrativos. Para abandonar el grupo deberá utilizar la acción
general de salida.

## Salir del grupo

Todos los miembros podrán seleccionar `Salir del grupo de cuidado` después de
una confirmación explícita. El último administrador no podrá salir hasta haber
asignado el rol de administrador a otro miembro.

Después de salir, la aplicación seleccionará otro grupo disponible para el
usuario. Si no pertenece a ninguno, lo dirigirá al flujo de creación de un
nuevo grupo.

## Eliminar el grupo

La eliminación estará disponible únicamente para administradores y requerirá
una confirmación que detalle que la operación es permanente. Antes de eliminar
el registro del grupo, se validarán y eliminarán sus documentos del
almacenamiento externo. Si esa limpieza falla, el grupo permanecerá en la base
de datos y se mostrará un error.

Al eliminar el grupo, las relaciones configuradas con borrado en cascada
eliminarán paciente, miembros, invitaciones, medicamentos, tareas, eventos,
historial, documentos, carpetas, actividades y notificaciones. La desaparición
de las membresías hará que todos los usuarios pierdan acceso inmediatamente.

Después de la eliminación, el administrador será enviado a otro grupo disponible
o al flujo de creación cuando no tenga ninguno.

## Interfaz

La implementación reutilizará las tarjetas, botones, campos, confirmaciones y
notificaciones actuales. Mantendrá la paleta existente de azul tinta, turquesa,
azul nube y blanco; el verde se reservará para WhatsApp y el rojo para acciones
destructivas.

Las acciones tendrán estados de foco, carga, éxito y error. Las confirmaciones
destructivas nombrarán el miembro, la invitación o el grupo afectado.

## Verificación

- Probar las reglas de permisos y la protección del último administrador.
- Probar los cambios de rol y la selección del siguiente grupo activo.
- Probar la construcción del enlace de WhatsApp.
- Verificar el modal compartido en los cuatro juegos.
- Ejecutar la suite completa de pruebas.
- Ejecutar el build de producción.
