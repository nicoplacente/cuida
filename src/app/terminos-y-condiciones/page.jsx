import { LegalList, LegalPage, LegalSection } from "@/components/legal-page";
import { createPublicMetadata } from "@/utils/seo";

export const metadata = createPublicMetadata({
  title: "Términos y condiciones",
  description:
    "Condiciones de uso de Cuida, la plataforma de cuidado compartido creada por Codeluxe.",
  path: "/terminos-y-condiciones",
});

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="Condiciones de uso"
      title="Términos y condiciones"
      description="Estas condiciones explican cómo podés utilizar Cuida y cuáles son las responsabilidades de quienes participan en un círculo de cuidado."
      updatedAt="4 de agosto de 2026"
    >
      <LegalSection title="1. Alcance y aceptación">
        <p>
          Cuida es una plataforma gratuita y de código abierto creada y operada por
          Codeluxe para ayudar a familias y cuidadores a organizar cuidados compartidos.
          Al acceder, crear una cuenta o utilizar el servicio, aceptás estas condiciones.
        </p>
        <p>
          Si utilizás Cuida en representación de otra persona, declarás que contás con la
          autorización necesaria para organizar su cuidado y tratar la información que
          cargues en la plataforma.
        </p>
      </LegalSection>

      <LegalSection title="2. Funcionalidades de Cuida">
        <p>Según la configuración disponible, Cuida permite:</p>
        <LegalList>
          <li>Crear cuentas y uno o más círculos de cuidado.</li>
          <li>Invitar familiares o cuidadores y asignarles roles y permisos.</li>
          <li>Organizar medicamentos, tomas, tareas, turnos y eventos.</li>
          <li>Registrar notas, síntomas, incidentes y otras actividades cotidianas.</li>
          <li>Guardar documentos y archivos relacionados con el cuidado.</li>
          <li>Recibir avisos internos y notificaciones Push configurables.</li>
          <li>Acceder a juegos y herramientas de bienestar disponibles en la aplicación.</li>
        </LegalList>
        <p>
          Algunas funciones pueden depender del dispositivo, navegador, permisos,
          conexión a internet o servicios externos de infraestructura.
        </p>
      </LegalSection>

      <LegalSection title="3. Cuida no reemplaza la atención profesional">
        <p>
          Cuida es una herramienta de organización. No brinda diagnóstico, indicaciones
          médicas, tratamientos ni servicios de emergencia, y no sustituye el criterio de
          profesionales de la salud ni de cuidadores calificados.
        </p>
        <p>
          La información, los recordatorios y las alertas pueden sufrir demoras o fallas.
          No deben utilizarse como único mecanismo para administrar medicación, controlar
          una urgencia o tomar decisiones clínicas. Ante una emergencia, comunicate de
          inmediato con el servicio de emergencias correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="4. Cuenta y seguridad">
        <p>
          Debés proporcionar información veraz, mantenerla actualizada y proteger tus
          credenciales. Sos responsable de la actividad realizada desde tu cuenta, salvo
          que nos informes oportunamente sobre un acceso no autorizado.
        </p>
        <p>
          No compartas contraseñas ni mantengas sesiones abiertas en dispositivos de uso
          público. Si sospechás que otra persona accedió a tu cuenta, cambiá tu contraseña
          y escribinos a contacto@codeluxe.tech.
        </p>
      </LegalSection>

      <LegalSection title="5. Círculos, roles e invitaciones">
        <p>
          Cada círculo funciona como un espacio colaborativo. Quienes administran el
          círculo deciden a quién invitan, qué rol asignan y cuándo revocan un acceso. Las
          personas integrantes podrán ver o modificar información de acuerdo con su rol.
        </p>
        <p>
          Antes de invitar a alguien, verificá que su participación sea adecuada. Cada
          integrante debe tratar la información compartida con confidencialidad y
          utilizarla únicamente para colaborar con el cuidado.
        </p>
      </LegalSection>

      <LegalSection title="6. Contenido y documentos">
        <p>
          Conservás los derechos y responsabilidades sobre los textos, imágenes, archivos
          y demás contenido que cargues. Nos autorizás a almacenarlos, procesarlos y
          mostrarlos únicamente en la medida necesaria para operar y proteger Cuida.
        </p>
        <p>
          Solo podés cargar contenido lícito, pertinente y respecto del cual tengas
          autorización. No subas información de terceras personas si no contás con una
          base válida para compartirla con el círculo.
        </p>
      </LegalSection>

      <LegalSection title="7. Uso permitido">
        <p>No está permitido:</p>
        <LegalList>
          <li>Usar Cuida con fines ilícitos, abusivos, fraudulentos o discriminatorios.</li>
          <li>Intentar acceder a cuentas, círculos, archivos o sistemas sin autorización.</li>
          <li>Interferir con el servicio, introducir código malicioso o eludir medidas de seguridad.</li>
          <li>Utilizar información del cuidado para hostigar, perjudicar o explotar a una persona.</li>
          <li>Revender el acceso al servicio alojado o presentarlo como propio sin autorización.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="8. Disponibilidad y cambios">
        <p>
          Procuramos mantener Cuida disponible y segura, pero no garantizamos un
          funcionamiento ininterrumpido ni libre de errores. Podemos corregir, agregar,
          limitar o discontinuar funciones para mejorar el servicio, responder a riesgos
          de seguridad o cumplir obligaciones legales.
        </p>
        <p>
          El carácter abierto del código fuente no implica que la instancia alojada de
          Cuida deba conservar indefinidamente todas sus funciones o condiciones.
        </p>
      </LegalSection>

      <LegalSection title="9. Servicios de terceros">
        <p>
          Cuida utiliza proveedores de infraestructura para alojamiento, base de datos,
          almacenamiento de archivos, envío de correos y notificaciones. La disponibilidad
          de esas prestaciones también puede depender de sus condiciones y funcionamiento.
        </p>
        <p>
          Los enlaces externos, como GitHub, Mercado Pago o el sitio de Codeluxe, se rigen
          por las políticas de sus respectivos responsables. Una donación es voluntaria y
          no habilita funciones adicionales ni modifica estas condiciones.
        </p>
      </LegalSection>

      <LegalSection title="10. Suspensión y finalización">
        <p>
          Podemos restringir o suspender accesos cuando sea razonablemente necesario para
          prevenir abusos, proteger a otras personas, investigar incidentes o cumplir la
          ley. Cuando resulte posible, procuraremos informar la medida y ofrecer un canal
          de revisión.
        </p>
        <p>
          Quienes administran un círculo pueden eliminarlo desde la aplicación. Para
          solicitar el cierre de una cuenta o asistencia con la eliminación de datos,
          escribí a contacto@codeluxe.tech.
        </p>
      </LegalSection>

      <LegalSection title="11. Responsabilidad">
        <p>
          Cada usuario es responsable de verificar la información y de las decisiones que
          tome a partir de ella. En la máxima medida permitida por la legislación aplicable,
          Codeluxe no será responsable por daños derivados de decisiones médicas, fallas de
          conectividad, notificaciones no recibidas, información incorrecta cargada por
          usuarios o accesos concedidos por administradores del círculo.
        </p>
        <p>
          Nada en estas condiciones limita derechos irrenunciables reconocidos por la
          normativa de defensa del consumidor o por otras normas aplicables.
        </p>
      </LegalSection>

      <LegalSection title="12. Legislación y modificaciones">
        <p>
          Estas condiciones se interpretan conforme a las leyes de la República Argentina.
          Si realizamos cambios relevantes, actualizaremos la fecha de vigencia y
          comunicaremos las modificaciones por medios razonables cuando corresponda.
        </p>
        <p>
          Para consultas o reclamos, contactanos en contacto@codeluxe.tech. Procuraremos
          resolver cualquier diferencia de forma directa y de buena fe.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
