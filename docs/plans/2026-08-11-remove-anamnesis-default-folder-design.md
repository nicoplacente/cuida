# Eliminación de la carpeta predeterminada Anamnesis

## Objetivo

Mantener `Historia clínica` como la única carpeta predeterminada de documentos. Eliminar de forma irreversible las carpetas `Anamnesis` existentes, sus subcarpetas, sus documentos y los archivos protegidos asociados. Los círculos nuevos no deben volver a crear `Anamnesis` automáticamente.

## Alcance

- Conservar `Historia clínica` con `systemKey: "MEDICAL_HISTORY"` y las protecciones actuales contra renombrado y eliminación.
- Retirar `Anamnesis` de la configuración de carpetas predeterminadas, los datos de demostración y el orden especial de la biblioteca.
- Limpiar todas las jerarquías cuya carpeta raíz tenga `systemKey: "ANAMNESIS"`.
- Eliminar primero los objetos protegidos de R2 y después los registros de base de datos para evitar archivos sensibles huérfanos.
- Hacer que la limpieza sea idempotente para poder ejecutarla de forma segura más de una vez.

## Arquitectura y flujo de datos

La configuración compartida de `src/features/documents/folders.js` seguirá siendo la fuente utilizada al crear círculos de cuidado. Contendrá únicamente `Historia clínica`.

Un script de mantenimiento consultará las carpetas raíz `ANAMNESIS`, reunirá sus descendientes, validará las claves de los documentos, eliminará los objetos de R2 y finalmente eliminará cada carpeta raíz. Las relaciones con eliminación en cascada retirarán las subcarpetas y los registros de documentos después de que sus archivos ya no existan en el almacenamiento.

El script devolverá un error antes de modificar la base si encuentra una clave de archivo que no pertenece al círculo de cuidado correspondiente. Así se mantiene el límite de seguridad existente en la biblioteca de documentos.

## Interfaz

La biblioteca no mostrará ni asignará un orden especial a `ANAMNESIS`. `Historia clínica` continuará apareciendo primero, con la identificación `Predeterminada` y sin acciones de renombrado o eliminación.

## Errores y seguridad

- La eliminación de contenido es irreversible y fue aprobada explícitamente.
- Si falla la eliminación de un objeto de R2, no se eliminará la carpeta de la base de datos.
- La limpieza podrá reanudarse: los objetos ya ausentes no impedirán completar la eliminación si el servicio de almacenamiento los trata como eliminaciones idempotentes.
- No se registrarán credenciales, rutas sensibles ni contenido médico.

## Verificación

- Probar que la configuración predeterminada contiene solamente `Historia clínica`.
- Probar la recopilación completa de carpetas descendientes usada por la limpieza.
- Ejecutar la suite de pruebas del proyecto.
- Ejecutar el build de producción.
- Ejecutar la limpieza con el entorno configurado y confirmar que no queden carpetas con `systemKey: "ANAMNESIS"`.
