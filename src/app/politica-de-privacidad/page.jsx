import { LegalList, LegalPage, LegalSection } from "@/components/legal-page";
import { createPublicMetadata } from "@/utils/seo";

export const metadata = createPublicMetadata({
  title: "Política de privacidad",
  description:
    "Cómo Cuida y Codeluxe recopilan, utilizan y protegen los datos personales relacionados con el cuidado compartido.",
  path: "/politica-de-privacidad",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Protección de datos"
      title="Política de privacidad"
      description="Esta política describe qué información trata Cuida, para qué la utiliza y qué decisiones podés tomar sobre tus datos."
      updatedAt="4 de agosto de 2026"
    >
      <LegalSection title="1. Responsable y contacto">
        <p>
          Codeluxe, creadora y responsable operativa de Cuida, administra el tratamiento
          de los datos personales necesario para prestar y proteger el servicio.
        </p>
        <p>
          Podés realizar consultas o ejercer derechos sobre tus datos escribiendo a
          contacto@codeluxe.tech. Para ayudarnos a identificar la información correcta,
          podremos solicitarte una verificación razonable de identidad.
        </p>
      </LegalSection>

      <LegalSection title="2. Información que tratamos">
        <p>Según cómo utilices Cuida, podemos tratar las siguientes categorías:</p>
        <LegalList>
          <li>Datos de cuenta, como nombre, correo electrónico y credenciales protegidas.</li>
          <li>
            Datos de la persona cuidada, como nombre, edad, fecha de nacimiento, imagen,
            condición médica y notas importantes.
          </li>
          <li>
            Información de cuidado, como medicamentos, dosis, horarios, administraciones,
            tareas, eventos, síntomas, incidentes, notas e historial de actividad.
          </li>
          <li>
            Datos de colaboración, como círculos, roles, invitaciones, personas asignadas y
            acciones realizadas por integrantes del equipo.
          </li>
          <li>
            Documentos y metadatos asociados, incluidos nombre de archivo, tipo, tamaño,
            ubicación dentro de carpetas y notas.
          </li>
          <li>
            Datos técnicos y de seguridad, como sesiones, identificadores, fechas de acceso,
            registros de errores y datos necesarios para prevenir abuso.
          </li>
          <li>
            Datos de notificaciones, como suscripciones Push del dispositivo, avisos
            programados, enviados o leídos y preferencias compatibles.
          </li>
        </LegalList>
        <p>
          La información de salud es un dato sensible. Cuida solo la trata cuando una
          persona usuaria decide incorporarla para organizar el cuidado y declara contar
          con autorización suficiente para hacerlo.
        </p>
      </LegalSection>

      <LegalSection title="3. Cómo obtenemos los datos">
        <p>
          Recibimos información directamente cuando creás una cuenta, completás
          formularios, cargás archivos, configurás recordatorios o interactuás con un
          círculo. También recibimos datos cuando otra persona te invita o registra una
          actividad vinculada con el cuidado compartido.
        </p>
        <p>
          El navegador y el dispositivo proporcionan la información técnica estrictamente
          necesaria para mantener la sesión, entregar notificaciones autorizadas y proteger
          el servicio.
        </p>
      </LegalSection>

      <LegalSection title="4. Para qué utilizamos la información">
        <LegalList>
          <li>Crear y autenticar cuentas y mantener sesiones seguras.</li>
          <li>Mostrar y sincronizar la información dentro de cada círculo autorizado.</li>
          <li>Programar tareas, eventos, tomas, recordatorios y avisos de incumplimiento.</li>
          <li>Almacenar y entregar documentos a integrantes con acceso permitido.</li>
          <li>Gestionar invitaciones, roles, recuperación de contraseña y comunicaciones operativas.</li>
          <li>Prevenir fraude, abuso, accesos no autorizados y fallas de seguridad.</li>
          <li>Diagnosticar errores y mejorar la confiabilidad y accesibilidad de Cuida.</li>
          <li>Cumplir obligaciones legales y responder solicitudes válidas de autoridades.</li>
        </LegalList>
        <p>
          No vendemos datos personales, no utilizamos información de salud para publicidad
          y no elaboramos perfiles comerciales a partir de la actividad de cuidado.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceso dentro de los círculos">
        <p>
          La información de un círculo se comparte con sus integrantes según el rol
          asignado. Las personas administradoras controlan invitaciones y permisos; por eso,
          deben revisar periódicamente quién conserva acceso.
        </p>
        <p>
          Cuando registrás una acción, tu nombre puede quedar asociado a ella para que el
          equipo sepa quién administró una medicación, completó una tarea, subió un
          documento o agregó una nota.
        </p>
      </LegalSection>

      <LegalSection title="6. Proveedores y transferencias">
        <p>
          Para operar Cuida podemos utilizar proveedores de alojamiento, bases de datos,
          almacenamiento de objetos, correo electrónico y entrega de notificaciones. Esos
          proveedores reciben únicamente la información necesaria para prestar su servicio
          y actúan sujetos a obligaciones de seguridad y confidencialidad.
        </p>
        <p>
          Algunos proveedores pueden procesar información fuera de Argentina. Cuando
          corresponda, procuramos utilizar mecanismos razonables para mantener un nivel de
          protección compatible con la normativa aplicable.
        </p>
        <p>
          También podremos comunicar información si una norma u orden válida lo exige, o
          si resulta necesario para proteger derechos, seguridad e integridad de las
          personas usuarias o del servicio.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies, sesiones y notificaciones">
        <p>
          Cuida utiliza cookies técnicas y tokens de sesión para autenticarte, recordar tu
          círculo activo y proteger el acceso. No se utilizan con fines de publicidad.
        </p>
        <p>
          Las notificaciones Push requieren tu autorización y generan una suscripción
          asociada al navegador o dispositivo. Podés desactivarlas desde Cuida o desde la
          configuración del sistema. El service worker permite instalar la aplicación y
          recibir avisos aun cuando no esté abierta.
        </p>
      </LegalSection>

      <LegalSection title="8. Conservación y eliminación">
        <p>
          Conservamos los datos mientras la cuenta o el círculo permanezcan activos y por
          el tiempo necesario para prestar el servicio, proteger su seguridad y cumplir
          obligaciones legales. Los tokens temporales y las sesiones vencen conforme a sus
          propios plazos de seguridad.
        </p>
        <p>
          Al eliminar un círculo desde la aplicación se eliminan sus datos relacionados,
          incluidos paciente, integrantes, invitaciones, medicamentos, tareas, eventos,
          historial y documentos. Algunas copias técnicas pueden permanecer durante un
          período limitado hasta completar procesos de respaldo, prevención de fraude o
          cumplimiento legal.
        </p>
        <p>
          Para solicitar el cierre de una cuenta o la supresión de información que no
          puedas gestionar desde Cuida, escribí a contacto@codeluxe.tech.
        </p>
      </LegalSection>

      <LegalSection title="9. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas orientadas a proteger la información,
          incluidas contraseñas cifradas mediante hash, sesiones protegidas, controles por
          rol, validación de entradas y acceso autenticado a documentos.
        </p>
        <p>
          Ningún sistema es completamente infalible. Utilizá una contraseña única, protegé
          tus dispositivos y notificanos si detectás actividad sospechosa o una posible
          exposición de información.
        </p>
      </LegalSection>

      <LegalSection title="10. Tus derechos">
        <p>
          Conforme a la Ley 25.326 de Protección de los Datos Personales y demás normativa
          aplicable, podés solicitar información, acceso, actualización, rectificación,
          confidencialidad o supresión de tus datos, según corresponda.
        </p>
        <p>
          Enviá tu solicitud a contacto@codeluxe.tech. Responderemos dentro de los plazos
          previstos por la normativa y podremos conservar determinada información cuando
          exista una obligación legal o una razón de seguridad legítima.
        </p>
        <p>
          Si considerás que tu solicitud no fue atendida adecuadamente, podés consultar o
          presentar un reclamo ante la{" "}
          <a
            href="https://www.argentina.gob.ar/aaip/datospersonales/derechos"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[color:var(--care-ink)] underline decoration-[color:var(--care-teal)] underline-offset-4"
          >
            Agencia de Acceso a la Información Pública
          </a>
          , autoridad argentina en materia de protección de datos.
        </p>
      </LegalSection>

      <LegalSection title="11. Personas menores o representadas">
        <p>
          Cuida está dirigida a personas adultas que organizan cuidados. Si los datos
          corresponden a una persona menor de edad o que requiere representación, quien los
          cargue debe ser su representante legal o contar con autorización suficiente y
          actuar siempre en su interés.
        </p>
      </LegalSection>

      <LegalSection title="12. Cambios en esta política">
        <p>
          Podemos actualizar esta política para reflejar mejoras del servicio, nuevos
          tratamientos o cambios normativos. Publicaremos la versión vigente con su fecha
          de actualización y comunicaremos los cambios relevantes por medios razonables
          cuando corresponda.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
