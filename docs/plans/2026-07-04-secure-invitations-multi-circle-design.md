# Secure Invitations and Multi-Circle Accounts Design

## Objetivo

Permitir que una misma cuenta de usuario participe en varios circulos de cuidado con roles diferentes, usando una sola identidad y una sola contrasena por email.

## Cuenta Unica

- El email identifica una unica cuenta.
- Si una invitacion usa un email existente, la persona debe confirmar con la contrasena actual.
- Si una invitacion usa un email nuevo, la persona crea su cuenta.
- Aceptar una invitacion agrega una membresia nueva a la cuenta existente o recien creada.

## Circulo Activo

- La app guarda el circulo activo en una cookie HTTP-only.
- El dashboard lee siempre el circulo activo.
- Si la cookie no existe o apunta a un circulo no permitido, se usa el primer circulo disponible.
- Al aceptar una invitacion, el circulo invitado queda activo automaticamente.
- La cabecera permite cambiar de circulo cuando el usuario tiene mas de una membresia.

## Enlaces de Invitacion

- Los enlaces se muestran como URL absoluta.
- En desarrollo usan `http://localhost:3000`.
- En produccion usan `NEXT_PUBLIC_APP_URL` o `https://cuida.codeluxe.tech`.
- Cada enlace tiene boton de copiar al portapapeles.

## Limpieza de Demo

- El login no precarga credenciales de prueba.
- La landing no muestra acceso a demo.
