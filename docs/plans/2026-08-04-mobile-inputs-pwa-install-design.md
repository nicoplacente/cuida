# Diseño: inputs móviles e instalación de Cuida

## Objetivo

Evitar que cualquier control de formulario desborde su contenedor en pantallas
móviles y ofrecer desde el encabezado una acción clara para instalar Cuida como
aplicación web.

## Formularios responsive

El estilo compartido de los controles admitirá encogerse dentro de grids,
tarjetas y modales mediante límites de ancho explícitos. Los contenedores
reutilizables de campos y el área principal también permitirán que sus hijos se
contraigan, cubriendo inputs de texto, fecha, hora, fecha y hora, número,
archivo, selects y textareas sin ajustes duplicados por formulario.

## Instalación PWA

Un componente cliente reutilizable se ubicará en el encabezado de escritorio y
en el menú móvil. Capturará el evento `beforeinstallprompt` cuando el navegador
lo ofrezca y abrirá el instalador nativo tras una acción explícita del usuario.

Si el instalador nativo no está disponible, la misma acción mostrará un diálogo
accesible con instrucciones adaptadas para iOS, Android o escritorio. En los
dispositivos que presenten la opción, la guía indicará activar “Abrir como
aplicación”. El botón no se mostrará cuando Cuida ya se ejecute en modo
independiente o después de una instalación confirmada.

La solución reutilizará el manifest y el service worker actuales, respetará los
tokens visuales existentes y no incorporará dependencias nuevas.

## Accesibilidad y estados

El botón tendrá estados de foco, disponibilidad e instalación. El diálogo de
ayuda tendrá título accesible, cierre por botón, tecla Escape y clic en el fondo,
bloqueo temporal del scroll y restauración del foco al cerrar.

## Verificación

Se ejecutarán las pruebas existentes y el build de producción. También se
revisarán en viewport móvil los formularios de registro, círculos,
medicamentos, tareas, calendario e historial, incluyendo sus modales, y se
comprobarán los estados del botón de instalación que el navegador permita
simular.
