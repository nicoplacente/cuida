# Contacto y mapa del patrocinador

## Objetivo

Actualizar la tarjeta de Farmacia Gómez en la página principal con su dirección
real, Google Maps y canales de contacto válidos, sin afectar la interfaz cuando
algún dato opcional no esté disponible.

## Diseño

- Mantener los datos dentro del objeto `sponsors` existente.
- Enlazar la ubicación y el mapa con Google Maps.
- Usar el número existente como destino de WhatsApp, sin enlaces `tel:`.
- Agregar email, Facebook e Instagram y omitir el sitio web ficticio.
- Representar cada contacto mediante un icono reutilizable y un enlace seguro.
- Renderizar condicionalmente imagen, descripción, ubicación, mapa y cada canal
  de contacto para evitar contenido vacío o errores de acceso.
- Mantener la landing como Server Component y no agregar dependencias.

## Verificación

- Ejecutar las pruebas automatizadas y el build de producción.
- Verificar que no queden enlaces ficticios, vacíos ni `tel:` en la tarjeta.
- Confirmar que los destinos externos se abran de forma segura.
