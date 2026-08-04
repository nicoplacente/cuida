# Footer público, documentos legales y configuración PWA

## Objetivo

Mejorar la navegación de la landing principal con un encabezado fijo, sumar un
footer completo exclusivo de esa página, configurar el manifiesto instalable
con los recursos entregados y publicar los términos y la política de privacidad
de Cuida.

## Navegación pública

- El encabezado de la landing permanece visible mediante `position: sticky`.
- Las secciones enlazadas compensan la altura del encabezado para conservar su
  título visible al navegar mediante anclas.
- El footer se renderiza únicamente en la landing principal.
- El footer reúne enlaces a inicio, solución, características, donaciones cuando
  estén habilitadas, acceso a la aplicación, ingreso, registro y reporte de
  errores.
- Los términos y la política de privacidad se enlazan únicamente desde el
  footer de la landing.
- Los enlaces externos a Codeluxe y GitHub se abren de forma segura en una nueva
  pestaña.

## Identidad visual

- Reutilizar los tokens, espaciados, contenedores y estilos existentes.
- Mostrar el logo de Cuida como identidad principal del producto.
- Mostrar el logo de Codeluxe junto con la atribución de creación y un enlace a
  `https://codeluxe.tech`.
- Mantener una composición responsive, accesible y legible en fondos claros y
  oscuros, sin agregar dependencias.

## Documentos legales

- Crear `/terminos-y-condiciones` y `/politica-de-privacidad` como páginas
  públicas de Next.js con metadata propia.
- Compartir una estructura visual para evitar duplicación y mantener consistencia
  entre ambos documentos.
- Identificar a Codeluxe como creador y responsable operativo de Cuida.
- Publicar `contacto@codeluxe.tech` como canal de consultas, privacidad,
  rectificación y eliminación de datos.
- Describir las funciones reales: cuentas, círculos de cuidado, medicamentos,
  tareas, calendario, historial, documentos, invitaciones, roles, notificaciones
  Push, sesiones y juegos.
- Aclarar que Cuida es una herramienta organizativa y no reemplaza asesoramiento,
  diagnóstico, tratamiento ni atención profesional o de emergencias.
- Explicar el tratamiento de datos personales y de salud, el acceso compartido
  dentro de los círculos, el almacenamiento de documentos, las comunicaciones
  operativas, la seguridad, la conservación y los derechos del usuario.

## Aplicación instalable

- Usar `src/app/manifest.json` como única fuente del manifiesto para evitar una
  ruta duplicada con `src/app/manifest.js`.
- Configurar nombre, descripción, identificador, idioma, alcance, URL inicial,
  modo de visualización y colores alineados con el sistema Cuida.
- Configurar `web-app-manifest-192x192.png` y
  `web-app-manifest-512x512.png` con propósito compatible normal y enmascarable.
- Mantener `/app` como destino al iniciar la aplicación instalada.

## Arquitectura

- Mantener la landing como Server Component.
- Extraer el footer y la estructura legal a componentes públicos reutilizables.
- Centralizar la navegación compartida del footer en datos estáticos cuando
  evite repetición.
- No incorporar lógica de negocio ni estado de cliente en los nuevos componentes.
- No modificar el shell privado ni mostrar el footer dentro de la aplicación.

## Verificación

- Ejecutar la suite completa de pruebas y el build de producción.
- Validar que exista una sola ruta de manifiesto y que ambos iconos tengan las
  dimensiones declaradas.
- Revisar landing y páginas legales en tamaños móvil y escritorio.
- Verificar navegación por teclado, foco visible, jerarquía de encabezados,
  textos alternativos y comportamiento de enlaces externos.
- Comprobar que el footer no aparezca en autenticación ni en la aplicación.
- Cerrar cualquier servidor o puerto temporal utilizado durante la revisión.
