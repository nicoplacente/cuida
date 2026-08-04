# SEO y metadatos de la landing

## Objetivo

Mejorar el posicionamiento y la presentación de Cuida en buscadores y redes
sociales, con la landing como página prioritaria. Las rutas privadas, de
autenticación y dinámicas sensibles no deben indexarse.

## Alcance de indexación

- Indexar la landing `/` como página principal del producto.
- Indexar `/terminos-y-condiciones` y `/politica-de-privacidad` con menor
  prioridad y metadatos propios.
- Excluir `/app`, autenticación, invitaciones, recuperación de contraseña y
  cualquier ruta dinámica que exponga identificadores o tokens.
- No agregar nuevas páginas de contenido ni dependencias.

## Metadatos

- Reutilizar `getAppUrl()` como fuente única del origen público.
- Configurar `metadataBase`, plantilla de títulos, descripción, nombre de la
  aplicación, categoría, autores, creador y editor en el layout raíz.
- Definir en la landing su título absoluto, descripción, URL canónica, Open
  Graph y Twitter Card.
- Mantener metadatos específicos y canónicas propias en las páginas legales.
- Aplicar `noindex` y `nofollow` mediante layouts compartidos para las rutas de
  autenticación y la aplicación privada.
- Generar una imagen social coherente con la identidad visual de Cuida mediante
  la convención nativa de Next.js, sin dependencias adicionales.

## Descubrimiento por buscadores

- Crear `robots.js` con acceso a las páginas públicas y exclusión explícita de
  las rutas privadas y sensibles.
- Crear `sitemap.js` con la landing y las dos páginas legales; la landing tendrá
  prioridad superior.
- Incluir la URL del sitemap y el host público en `robots.txt`.
- Incorporar datos estructurados JSON-LD de tipo `WebApplication` en la landing
  para describir el producto gratuito de organización del cuidado compartido.

## Arquitectura

- Mantener la landing y los layouts como Server Components.
- Centralizar constantes SEO reutilizables en un módulo compartido dentro de
  `src/utils`, apoyado en la utilidad de URL existente.
- Utilizar exclusivamente la Metadata API y las convenciones de archivos de
  Next.js 16.
- Evitar duplicar metadatos comunes y preservar los cambios locales actuales de
  landing, manifiesto y documentos legales.

## Seguridad y privacidad

- La exclusión mediante `robots.txt` reduce el rastreo, mientras que la directiva
  `noindex` en metadata evita que las rutas accesibles aparezcan en resultados.
- Los tokens, identificadores de documentos y datos de la aplicación no se
  incluirán en sitemaps, canónicas ni datos estructurados.
- El contenido privado continuará protegido por los controles de autenticación
  existentes; SEO no sustituye esos controles.

## Verificación

- Agregar pruebas unitarias para las constantes y salidas SEO deterministas.
- Ejecutar la suite completa de pruebas y el build de producción.
- Comprobar el HTML y las respuestas generadas para metadata, `robots.txt`,
  `sitemap.xml` e imagen social.
- Confirmar que no queden servidores o puertos temporales abiertos.
