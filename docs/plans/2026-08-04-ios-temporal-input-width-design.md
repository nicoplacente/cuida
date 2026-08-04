# Diseño: ancho de inputs temporales en iOS

## Problema

WebKit en iOS calcula incorrectamente el ancho de los inputs `date`, `time`,
`datetime-local`, `month` y `week` cuando combinan `width: 100%` con padding
horizontal. Como resultado, el control nativo sobresale de su contenedor en
formularios móviles.

## Solución

Mantener los selectores nativos y compensar únicamente en WebKit táctil el
padding horizontal de `2rem` que el motor agrega fuera del ancho esperado. La
regla se limitará a los cinco tipos temporales afectados mediante una condición
de capacidades específica de iOS.

No se modificarán componentes, formularios ni estilos de escritorio. Una
prueba de regresión protegerá la condición de plataforma, el alcance de los
selectores y la compensación aplicada.

## Verificación

Se ejecutarán la suite completa, el build de producción y una revisión de los
controles en el navegador disponible. La comprobación definitiva del defecto
de WebKit deberá realizarse en un dispositivo iOS, ya que Chromium no reproduce
el error del motor.
