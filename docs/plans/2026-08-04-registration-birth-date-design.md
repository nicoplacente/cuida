# Fecha de nacimiento en el registro inicial

## Objetivo

Reemplazar la carga manual de la edad por la fecha de nacimiento de la persona
cuidada en el formulario de registro inicial, manteniendo el mismo comportamiento
que ya utilizan la creación de círculos adicionales y la edición del paciente.

## Interfaz

El formulario conservará su estructura y sistema visual actuales. El campo
`Edad` se reemplazará por un campo de fecha obligatorio con la etiqueta `Fecha de
nacimiento`, reutilizando las clases y el componente `Field` existentes.

## Validación y datos

La Server Action interpretará el valor con `parseDateInput` y calculará la edad
con `calculateAge`. Se rechazarán fechas inexistentes o futuras. Al crear el
paciente se guardarán tanto `birthDate` como la edad calculada, porque `age` sigue
siendo obligatorio en el modelo de Prisma y funciona como respaldo para registros
heredados.

No se requiere una migración ni una dependencia nueva.

## Errores

Una fecha ausente, inválida o futura devolverá un mensaje específico y no creará
la cuenta. Las validaciones existentes para los datos del usuario y el resto del
paciente se mantendrán sin cambios.

## Verificación

Se ejecutarán las pruebas automatizadas existentes y el build de producción. La
verificación cubrirá la interpretación de fechas, el cálculo de edad y la
compilación del formulario y la Server Action actualizados.
