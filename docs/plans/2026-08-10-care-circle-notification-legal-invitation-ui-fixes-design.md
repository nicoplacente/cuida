# Diseño: edición del círculo, guía de avisos y correcciones de acceso y UI

## Objetivo

Permitir que las personas cuidadoras mantengan actualizado el nombre del
círculo, orientar la instalación y activación de avisos al entrar al panel,
reflejar correctamente la licencia no comercial y corregir tres problemas de
presentación o navegación sin alterar los flujos existentes.

## Edición del paciente y del círculo

El modal existente de edición del paciente incorporará un campo obligatorio
para el nombre del círculo de cuidado. La acción de servidor validará los datos
y actualizará el paciente y el círculo dentro de una única transacción, de modo
que no puedan quedar valores parcialmente guardados. La actividad registrada y
la invalidación del panel conservarán el patrón actual.

## Guía de instalación y avisos

La página exacta `/app` montará un componente cliente que se ejecutará en cada
entrada. Una vez disponible el estado de instalación, comprobará que Cuida no
se esté ejecutando como aplicación instalada y que el navegador no tenga una
suscripción Push activa con la clave vigente.

Solo cuando falten simultáneamente ambas condiciones se mostrará un `alert()`
nativo. El mensaje explicará brevemente cómo instalar Cuida según iOS, Android
o escritorio y luego indicará abrir “Avisos” y elegir “Activar avisos en este
dispositivo”. Una protección por montaje evitará alertas duplicados causados por
efectos repetidos en desarrollo, sin persistir una preferencia que impida
mostrarlo en una entrada posterior.

La detección y las instrucciones se extraerán a utilidades reutilizables para no
duplicar la lógica del botón de instalación y del control de avisos.

## Licencia y condiciones de uso

Los términos y condiciones incorporarán una sección específica sobre el código
fuente y el uso no comercial. El texto identificará la licencia PolyForm
Noncommercial 1.0.0 publicada en GitHub, aclarará que los usos comerciales
requieren autorización expresa y remitirá a la licencia como fuente aplicable.
También se actualizará la fecha del documento.

## Registro, invitaciones y selector de roles

El registro conservará su formulario y diseño, pero limitará su ancho mediante
un contenedor local sin modificar el componente global `Card`.

Los tokens de invitación inválidos, inexistentes o eliminados dejarán de invocar
la página 404. La misma ruta mostrará una tarjeta de estado coherente con la
interfaz de autenticación, el mensaje “La invitación ha caducado o fue
eliminada” y un enlace para iniciar sesión. Las invitaciones vencidas o ya
utilizadas mantendrán sus estados específicos.

El formulario para cambiar el rol reservará un ancho flexible y un espacio
interior adecuado para el texto y el indicador nativo del `select`, tanto en
móvil como en escritorio. No se incorporará una dependencia ni un selector
personalizado para este ajuste puntual.

## Dirección visual y accesibilidad

La solución conservará el lenguaje de Cuida: superficies blancas y celestes,
azul tinta, turquesa para acciones y ámbar para advertencias, con tarjetas
redondeadas y jerarquía tipográfica existente. Los formularios mantendrán sus
labels asociados, estados de foco, tamaños táctiles y comportamiento responsive.

## Verificación

Se agregarán pruebas unitarias para las utilidades de detección y texto cuando
corresponda. Se ejecutarán todas las pruebas y el build de producción. Además,
se revisarán visualmente el registro, el estado de invitación inválida, el modal
de paciente y el selector de roles en viewports móvil y escritorio, cerrando al
final cualquier servidor de prueba.
