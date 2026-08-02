# Mantener sesión iniciada y rotación de refresh tokens

## Objetivo

Permitir que una persona elija mantener su sesión iniciada durante 90 días y
reemplazar la credencial de sesión actual por un esquema con access token corto
y refresh token rotativo, sin agregar dependencias ni invalidar
innecesariamente las sesiones existentes.

## Comportamiento

- El login incluye la opción desmarcada `Mantener mi sesión iniciada durante 90 días`.
- La ayuda visible indica `Usalo solo en un dispositivo personal.`.
- Con la opción marcada, el refresh token vence 90 días después del login.
- Sin marcarla, el refresh token se guarda como cookie de sesión y desaparece
  al cerrar el navegador.
- La sesión de navegador tiene una vigencia renovable de 24 horas en el
  servidor mientras el navegador continúe abierto.
- El access token vence después de 15 minutos.
- Cada renovación reemplaza el refresh token anterior.

## Arquitectura

La autenticación mantiene el modelo `Session` como fuente de revocación en
PostgreSQL. El navegador recibe dos cookies HTTP-only:

- `cuida_access`: credencial firmada con HMAC SHA-256 mediante
  `SESSION_SECRET`. Incluye únicamente los identificadores y vencimientos
  necesarios para resolver la sesión.
- `cuida_session`: credencial aleatoria de renovación. Prisma almacena solo su
  hash SHA-256.

El access token se valida localmente y la sesión correspondiente se consulta en
la base antes de entregar información del usuario. El refresh token se valida
contra su hash y se rota desde un Route Handler, donde Next.js permite modificar
cookies.

El modelo conserva temporalmente el hash del token anterior y su vencimiento.
Esa tolerancia dura 30 segundos para absorber renovaciones simultáneas de varias
pestañas. Fuera de esa ventana, reutilizar un token anterior invalida la
renovación.

No se incorporan librerías de autenticación o JWT. Las firmas, comparaciones y
tokens usan el módulo `crypto` de Node.js y las primitivas ya presentes.

## Flujo de datos

1. `loginAction` valida email y contraseña y normaliza el checkbox con los
   helpers existentes de formularios.
2. `createSession` crea la fila revocable, firma un access token y establece
   ambas cookies con la persistencia elegida.
3. El área privada valida el access token y carga únicamente los datos de
   usuario requeridos.
4. Un componente cliente pequeño solicita una renovación al entrar al área
   privada, al volver a una pestaña visible y antes de que venza el access token.
5. El Route Handler valida la sesión y el refresh token, rota el secreto de
   forma atómica y devuelve cookies nuevas.
6. El logout elimina la fila y ambas cookies. El restablecimiento de contraseña
   continúa eliminando todas las sesiones del usuario.
7. La cookie del círculo de cuidado activo replica la persistencia de la sesión.

## Compatibilidad

Las filas y cookies existentes se reconocen como sesiones heredadas. En la
primera renovación válida se emiten el access token y el refresh token con el
nuevo formato, manteniendo el vencimiento anterior. Los nuevos campos de Prisma
son opcionales o tienen valores compatibles para que la migración no fuerce un
cierre de sesión general.

## Interfaz

El control aparece entre la contraseña y el botón de ingreso. Usa un checkbox
nativo accesible, una etiqueta asociada, foco visible y los tokens existentes de
Cuida. Se preservan la paleta azul tinta, turquesa, blanco, celeste nube y verde
suave; la profundidad continúa basada en bordes y sombras discretas.

La opción está desmarcada por defecto para priorizar privacidad en dispositivos
compartidos. El texto evita el ambiguo `Recordarme` y comunica la duración
exacta.

Cuando la sesión vence o la renovación falla, se limpian ambas cookies y el
login muestra el aviso accesible `Tu sesión venció. Volvé a ingresar.`. Ningún
error expone tokens, hashes ni datos internos.

## Seguridad

- Cookies HTTP-only, `SameSite=Lax`, `Secure` en producción y `Path=/`.
- Refresh tokens aleatorios de alta entropía y persistidos únicamente como hash.
- Access tokens firmados con HMAC SHA-256 y comparación de tiempo constante.
- Rotación atómica con tolerancia acotada para concurrencia.
- Vencimiento absoluto de 90 días para sesiones persistentes.
- Revocación inmediata mediante la fila `Session`.
- Validación del `returnTo` si la renovación necesita redirección.
- Limpieza de sesiones vencidas durante operaciones normales de autenticación.

## Verificación

Se agregan pruebas con `node:test` para:

- creación, firma, validación, manipulación y vencimiento del access token;
- persistencia de 90 días y cookies de sesión;
- rotación del refresh token y actualización atómica;
- tolerancia de 30 segundos para concurrencia;
- rechazo de tokens vencidos o reutilizados;
- migración de sesiones heredadas;
- lectura segura del checkbox.

La entrega se valida con las pruebas existentes, Prisma Generate y el build de
producción. Las pruebas no dejan servidores ni puertos abiertos.
