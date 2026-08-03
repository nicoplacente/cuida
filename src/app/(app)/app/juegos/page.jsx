import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Badge, Card, LinkButton } from "@/components/ui";

const games = [
  {
    name: "Memoria Cuida",
    description:
      "Encontrá las cartas iguales y entrená la memoria con niveles que avanzan de manera gradual.",
    href: "/app/juegos/memoria",
    image: "/games/memory-game-cover.png",
    imageAlt: "Cartas de memoria con símbolos de cuidado sobre una mesa clara",
    category: "Memoria",
  },
  {
    name: "Sopa de letras Cuida",
    description:
      "Encontrá palabras sobre bienestar y cuidado en tableros que aumentan su dificultad de a poco.",
    href: "/app/juegos/sopa-de-letras",
    image: "/games/word-search-cover.png",
    imageAlt: "Sopa de letras con la palabra Cuida resaltada en turquesa",
    category: "Palabras",
  },
  {
    name: "Crucigrama Cuida",
    description:
      "Resolvé pistas y completá palabras que se cruzan en niveles breves y progresivos.",
    href: "/app/juegos/crucigrama",
    image: "/games/crossword-cover.png",
    imageAlt: "Crucigrama con las palabras Cuida y Vida sobre una mesa clara",
    category: "Ingenio",
  },
  {
    name: "Palabras por categoría",
    description:
      "Ordená palabras en el grupo correcto y avanzá por desafíos cada vez más variados.",
    href: "/app/juegos/clasificar-palabras",
    image: "/games/category-sorting-cover.png",
    imageAlt: "Fichas con palabras ordenadas en categorías sobre una mesa clara",
    category: "Clasificación",
  },
];

export default function GamesPage() {
  return (
    <div>
      <PageHeader eyebrow="Bienestar" title="Juegos">
        Actividades simples para compartir, despejarse y estimular la mente con calma.
      </PageHeader>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <Card className="flex h-full flex-col overflow-hidden" key={game.href}>
            <div className="relative aspect-[3/2] overflow-hidden bg-[color:var(--care-teal-soft)]">
              <Image
                alt={game.imageAlt}
                className="object-cover transition duration-300 hover:scale-[1.02] motion-reduce:transition-none"
                fill
                loading="eager"
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
                src={game.image}
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <Badge tone="teal">{game.category}</Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em]">
                {game.name}
              </h2>
              <p className="mt-3 flex-1 text-[color:var(--care-ink-soft)]">
                {game.description}
              </p>
              <LinkButton
                aria-label={`Jugar a ${game.name}`}
                className="mt-6 w-full"
                href={game.href}
              >
                Jugar
              </LinkButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
