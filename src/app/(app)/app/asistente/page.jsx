import { Badge, Card } from "@/components/ui";
import { PageHeader } from "@/components/page-header";

const futureCapabilities = [
  "Detectar patrones en sueño, ánimo, síntomas y medicación.",
  "Resumir la evolución diaria para familiares y profesionales.",
  "Generar reportes médicos claros antes de una consulta.",
  "Encontrar cambios importantes que podrían pasar desapercibidos.",
];

export default function AssistantPage() {
  return (
    <div>
      <PageHeader eyebrow="Asistente Cuida" title="Preparado para inteligencia asistiva responsable.">
        Este módulo queda reservado para futuras versiones. La prioridad será
        ayudar al equipo cuidador sin reemplazar criterio médico ni humano.
      </PageHeader>

      <Card className="p-6">
        <Badge tone="teal">Próximamente</Badge>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {futureCapabilities.map((capability) => (
            <div
              key={capability}
              className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-5"
            >
              <p className="font-semibold">{capability}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
