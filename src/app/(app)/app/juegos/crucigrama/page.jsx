import { PageHeader } from "@/components/page-header";
import { Card, SecondaryLink } from "@/components/ui";
import { CrosswordGame } from "@/features/games/crossword-game";

export default function CrosswordPage() {
  return (
    <div>
      <PageHeader eyebrow="Juegos" title="Crucigrama Cuida">
        Leé cada pista y escribí las respuestas en el tablero. Las palabras se
        cruzan y comparten algunas letras.
      </PageHeader>

      <div className="mb-4">
        <SecondaryLink className="min-h-10 px-4 py-2 text-sm" href="/app/juegos">
          Volver a Juegos
        </SecondaryLink>
      </div>

      <Card className="p-4 sm:p-6">
        <CrosswordGame />
      </Card>
    </div>
  );
}
