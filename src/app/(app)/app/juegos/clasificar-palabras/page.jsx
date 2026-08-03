import { PageHeader } from "@/components/page-header";
import { Card, SecondaryLink } from "@/components/ui";
import { CategorySortingGame } from "@/features/games/category-sorting-game";

export default function CategorySortingPage() {
  return (
    <div>
      <PageHeader eyebrow="Juegos" title="Palabras por categoría">
        Ordená cada palabra en el grupo que le corresponde. Podés arrastrarla o
        elegirla y después tocar su categoría.
      </PageHeader>

      <div className="mb-4">
        <SecondaryLink className="min-h-10 px-4 py-2 text-sm" href="/app/juegos">
          Volver a Juegos
        </SecondaryLink>
      </div>

      <Card className="p-4 sm:p-6">
        <CategorySortingGame />
      </Card>
    </div>
  );
}
