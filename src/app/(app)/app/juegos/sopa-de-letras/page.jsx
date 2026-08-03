import { PageHeader } from "@/components/page-header";
import { Card, SecondaryLink } from "@/components/ui";
import { WordSearchGame } from "@/features/games/word-search-game";

export default function WordSearchPage() {
  return (
    <div>
      <PageHeader eyebrow="Juegos" title="Sopa de letras Cuida">
        Encontrá palabras relacionadas con el bienestar y el cuidado. Podés
        arrastrar sobre las letras o elegir primero el inicio y después el final.
      </PageHeader>

      <div className="mb-4">
        <SecondaryLink className="min-h-10 px-4 py-2 text-sm" href="/app/juegos">
          Volver a Juegos
        </SecondaryLink>
      </div>

      <Card className="p-4 sm:p-6">
        <WordSearchGame />
      </Card>
    </div>
  );
}
