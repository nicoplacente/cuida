# Biblioteca jerárquica de documentos

## Objetivo

Permitir que cada círculo de cuidado organice sus documentos privados en carpetas y subcarpetas sin alterar el flujo de acceso protegido existente. La experiencia debe facilitar crear, renombrar, eliminar, explorar, mover y buscar contenido tanto en dispositivos móviles como de escritorio.

## Alcance funcional

- Crear carpetas personalizadas en la raíz o dentro de cualquier otra carpeta.
- Navegar mediante una biblioteca con migas de pan.
- Subir documentos directamente en la carpeta activa.
- Renombrar y eliminar carpetas personalizadas.
- Eliminar en cascada una carpeta personalizada, todas sus subcarpetas y todos sus documentos después de una confirmación explícita.
- Editar los datos de un documento y moverlo a otra carpeta del mismo círculo.
- Buscar globalmente carpetas y documentos dentro del círculo activo, mostrando la ruta de cada resultado.
- Mantener los documentos existentes sin carpeta en la raíz.

## Carpetas predeterminadas

Cada círculo tendrá dos carpetas raíz creadas por el sistema:

- `Historia clínica`
- `Anamnesis`

Estas carpetas siempre estarán visibles y podrán contener cualquier jerarquía de subcarpetas y documentos. Su contenido puede editarse o eliminarse y las carpetas pueden permanecer vacías. Las carpetas predeterminadas no pueden renombrarse, moverse ni eliminarse.

La protección se representará con una clave interna persistida, no mediante una comparación con el nombre visible. Una migración creará ambas carpetas para los círculos existentes y la creación de nuevos círculos las incluirá en la misma operación de datos.

## Modelo de datos

Se agregará un modelo `DocumentFolder` perteneciente a `CareCircle`, con una relación opcional hacia otra carpeta del mismo modelo como padre. `Document` recibirá una relación opcional con `DocumentFolder`.

La relación jerárquica permitirá profundidad flexible. La eliminación de una carpeta se configurará en cascada para sus descendientes y documentos, pero la operación de aplicación eliminará primero los archivos privados correspondientes de R2.

Los nombres serán obligatorios, se normalizarán y tendrán una longitud máxima. No se admitirán nombres duplicados dentro de una misma ubicación del círculo. Las carpetas predeterminadas tendrán claves únicas por círculo.

## Arquitectura y permisos

La página seguirá siendo un Server Component para cargar el contexto, la carpeta activa, sus descendientes directos y los documentos. Las interacciones que necesiten estado local se aislarán en componentes cliente pequeños y reutilizables.

Todas las consultas y acciones se limitarán por `careCircleId`. Los identificadores enviados por el navegador se volverán a validar en el servidor:

- Cualquier miembro del círculo puede navegar, buscar y abrir documentos.
- Solo administradores y cuidadores pueden crear, renombrar, mover o eliminar carpetas y documentos.
- Ninguna carpeta o documento puede asociarse con una carpeta de otro círculo.
- No se confía en el cliente para proteger carpetas predeterminadas.

La ruta actual de archivos continuará verificando sesión y membresía antes de leer el objeto desde el bucket privado.

## Experiencia de uso

La página conservará su encabezado y el concepto visual de biblioteca. La barra superior contendrá búsqueda global y, para quienes puedan administrar, las acciones `Nueva carpeta` y `Subir documento`.

La navegación mostrará migas de pan desde `Documentos` hasta la ubicación activa. Dentro de cada ubicación aparecerán primero las subcarpetas y luego los documentos. Las carpetas `Historia clínica` y `Anamnesis` tendrán una identificación discreta de `Carpeta predeterminada` y no mostrarán acciones de renombrado o eliminación.

Los documentos conservarán las acciones `Abrir`, `Editar` y `Eliminar`. La edición permitirá cambiar título, notas y ubicación. Los observadores verán una versión de solo lectura.

En móvil se utilizará una sola columna, objetivos táctiles amplios y acciones compactas. En escritorio se utilizará una grilla adaptable. Los estados vacío, sin resultados, pendiente y error tendrán mensajes claros y accesibles.

## Búsqueda

La búsqueda será global dentro del círculo activo y contemplará:

- Nombre de carpeta.
- Título del documento.
- Nombre original del archivo.
- Notas del documento.

Cada resultado mostrará su tipo y ruta completa. Abrir una carpeta llevará a su ubicación y abrir un documento conservará la descarga protegida actual.

## Eliminación y errores

Antes de eliminar una carpeta personalizada se mostrará una confirmación que advierta que también se eliminarán todas sus subcarpetas y documentos.

El servidor resolverá el árbol completo dentro del círculo activo. Primero eliminará los objetos privados de R2 y solo cuando esa etapa finalice eliminará la carpeta raíz en una transacción de base de datos, confiando en las relaciones en cascada para sus descendientes. Las eliminaciones de objetos serán reintentables; un error se mostrará de forma segura y se registrará sin exponer claves, rutas ni datos sensibles.

## Verificación

Se cubrirán mediante pruebas automatizadas:

- Construcción del árbol y rutas de navegación.
- Normalización y validación de nombres.
- Búsqueda limitada al círculo activo.
- Protección de las carpetas predeterminadas.
- Validación de pertenencia al mover contenido.
- Resolución recursiva para eliminación.

La validación final incluirá generación del cliente Prisma, ejecución de pruebas, compilación de producción y revisión visual responsive del flujo principal. No se agregarán dependencias nuevas.
