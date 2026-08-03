import { MemoryGame } from "@/features/games/memory-game";
import { PageHeader } from "@/components/page-header";
import { Card, SecondaryLink } from "@/components/ui";

export default function MemoryGamePage() {
  return (
    <div>
      <PageHeader eyebrow="Juegos" title="Memoria Cuida">
        Da vuelta dos cartas por vez y encontrá todos los pares. Cada nivel agrega
        solamente un par nuevo para que el desafío crezca de a poco.
      </PageHeader>

      <div className="mb-4">
        <SecondaryLink className="min-h-10 px-4 py-2 text-sm" href="/app/juegos">
          Volver a Juegos
        </SecondaryLink>
      </div>

      <Card className="p-4 sm:p-6">
        <MemoryGame />
      </Card>
    </div>
  );
}
