# Diseño: aviso por sesión, plan diario, memoria y badge de la PWA

## Objetivo

Reducir interrupciones al entrar al panel, compactar acciones administrativas,
mantener estable el tablero de Memoria Cuida, reunir toda la agenda cotidiana y
reflejar los avisos no leídos en el icono de la PWA sin modificar flujos ajenos.

## Aviso de instalación por sesión

El aviso de instalación y notificaciones conservará sus condiciones actuales:
solo aparecerá cuando la PWA no esté instalada y el dispositivo no tenga una
suscripción Push vigente. Después de mostrarse guardará una marca versionada en
`sessionStorage`, por lo que no volverá a interrumpir durante esa sesión de la
pestaña. Una sesión nueva podrá mostrarlo nuevamente si las dos condiciones
siguen pendientes. Si el almacenamiento no está disponible, el componente
mantendrá la protección actual por montaje.

## Acciones administrativas compactas

Los botones “Guardar rol”, “Eliminar miembro”, “Salir del grupo de cuidado” y
“Eliminar grupo de cuidado” mantendrán sus dimensiones táctiles en móvil. A
partir del breakpoint de escritorio usarán menor padding y tipografía, ancho
intrínseco y ausencia de estiramiento. El ajuste se aplicará solo a esos cuatro
controles mediante las extensiones de clases ya admitidas por los componentes
compartidos.

## Tablero de Memoria Cuida

Las cartas tendrán dimensiones fijas y menores dentro de cada breakpoint; su
tamaño no dependerá del nivel ni de la cantidad de pares. La grilla centrada
usará columnas automáticas con un máximo visual de cinco cartas por fila. El
nivel final tendrá veinte cartas distribuidas en cuatro filas compactas. El
icono, los símbolos, el foco, el giro y los estados encontrados se escalarán al
nuevo tamaño sin cambiar las reglas ni la progresión del juego.

## Plan del día unificado

El servicio del dashboard normalizará en una sola colección las tomas de
medicamentos, las tareas fechadas para el día vigente y los eventos del
calendario. Cada elemento expondrá tipo, horario o etiqueta “Todo el día”,
título, información secundaria y estado. Los elementos con horario se
ordenarán cronológicamente y las tareas sin horario permanecerán agrupadas como
actividades de todo el día.

La interfaz reutilizará la tarjeta existente y distinguirá cada tipo con texto
y badges, sin introducir colores o iconos nuevos. Se mostrarán tanto elementos
pendientes como completados, igual que ocurre actualmente con las tomas
administradas.

Un componente cliente recibirá el instante del próximo cambio de día calculado
con la zona horaria configurada. Al alcanzarlo refrescará los Server Components,
obteniendo automáticamente el plan de la fecha siguiente sin borrar ni mutar
datos. También verificará el cambio cuando la pestaña vuelva a estar visible.

## Badge de avisos no leídos

El badge representará el total de avisos no leídos del usuario en todos sus
círculos, no solo los del círculo activo. El layout sincronizará ese total desde
la interfaz mediante `navigator.setAppBadge(total)` y llamará
`navigator.clearAppBadge()` cuando llegue a cero.

Durante la entrega Push, el servidor calculará el total no leído por usuario y
lo incluirá en el payload. El service worker actualizará el badge al mismo
tiempo que muestra la notificación, utilizando `self.navigator` y detección de
capacidades. La falta de soporte o un rechazo del sistema operativo no
interrumpirá las notificaciones ni la aplicación.

Los cambios de lectura ya existentes invalidan el layout; esa actualización
volverá a sincronizar o limpiar el badge. La interfaz “Avisos” seguirá siendo la
fuente accesible equivalente al indicador del sistema operativo.

## Dirección visual

Se conservarán las superficies blancas y celestes, el azul tinta, el turquesa,
el ámbar y el verde semántico existentes. La densidad aumentará solo en las
acciones de escritorio y en el tablero de memoria. Los controles móviles
mantendrán sus áreas táctiles, el plan conservará jerarquía legible y ningún
componente incorporará dependencias nuevas.

## Verificación

Se agregarán pruebas para la marca por sesión, la normalización y orden del plan,
la estabilidad de las cartas y el badge del service worker. Se ejecutarán todas
las pruebas y el build de producción. También se revisarán en móvil y escritorio
el equipo, todos los niveles de Memoria Cuida y el Plan del día, cerrando al
final cualquier servidor temporal.
