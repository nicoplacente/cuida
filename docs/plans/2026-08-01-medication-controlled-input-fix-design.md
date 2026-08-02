# Corrección de estado controlado en el formulario de medicamentos

## Problema

Al cambiar la modalidad entre horarios diarios e intervalo, React reutiliza el
primer `input` de ambas ramas condicionales. El campo de cantidad diaria utiliza
`value` y es controlado, mientras que el campo de intervalo utiliza
`defaultValue` y es no controlado. La reutilización cambia el tipo de control del
mismo nodo y genera una advertencia en desarrollo.

## Solución

Asignar una clave estable y diferente al contenedor raíz de cada modalidad. De
esta forma React desmontará los campos de la modalidad anterior y montará nodos
nuevos para la modalidad seleccionada, sin mezclar sus estados internos.

No se agregarán estados, dependencias ni cambios de datos. La corrección se
limitará a `MedicationFormFields` y conservará el comportamiento actual de los
campos dinámicos.

## Verificación

Se ejecutarán las pruebas automatizadas, el build de producción y
`git diff --check`. También se revisará que cada rama tenga una identidad propia
y que ningún puerto temporal quede abierto.
