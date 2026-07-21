import { uploadDocumentAction } from "@/features/documents/actions";
import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, PrimaryButton, inputClassName } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { formatShortDate } from "@/utils/dates";

export default async function DocumentsPage({ searchParams }) {
  const { careCircle } = await requireCareContext();
  const params = await searchParams;

  if (!careCircle) {
    return <EmptyState title="No hay círculo activo." />;
  }

  const documents = await prisma.document.findMany({
    where: { careCircleId: careCircle.id },
    include: {
      uploadedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader eyebrow="Documentos" title="Recetas, estudios y archivos importantes a mano.">
        Guarda documentos médicos protegidos para que solo el grupo familiar
        pueda acceder a ellos.
      </PageHeader>

      {params?.error ? (
        <p className="mb-5 rounded-2xl bg-[#fff4de] p-4 text-sm font-semibold text-[color:var(--care-warning)]">
          {params.error}
        </p>
      ) : null}

      {params?.success ? (
        <p className="mb-5 rounded-2xl bg-[#e6f7ef] p-4 text-sm font-semibold text-[color:var(--care-success)]">
          {params.success}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Biblioteca</h2>
          <div className="grid gap-4">
            {documents.length ? (
              documents.map((document) => (
                <article
                  key={document.id}
                  className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Badge>{formatShortDate(document.createdAt)}</Badge>
                      <h3 className="mt-3 text-xl font-semibold">{document.title}</h3>
                      <p className="mt-1 text-sm text-[color:var(--care-muted)]">
                        Subido por {document.uploadedBy.name}
                      </p>
                      {document.notes ? (
                        <p className="mt-2 text-sm text-[color:var(--care-ink-soft)]">
                          {document.notes}
                        </p>
                      ) : null}
                    </div>
                    <a
                      href={`/app/documentos/${document.id}/archivo`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[color:var(--care-ink)]"
                    >
                      Abrir
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No hay documentos cargados." />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Subir documento</h2>
          <form action={uploadDocumentAction} className="grid gap-4">
            <Field label="Título">
              <input className={inputClassName} name="title" required />
            </Field>
            <Field label="Archivo">
              <input
                className={inputClassName}
                type="file"
                name="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                aria-describedby="document-file-help"
                required
              />
              <span id="document-file-help" className="text-sm font-normal text-[color:var(--care-muted)]">
                PDF, imágenes o documentos Word. Tamaño máximo: 8 MB.
              </span>
            </Field>
            <Field label="Notas">
              <textarea className={inputClassName} name="notes" rows={4} />
            </Field>
            <PrimaryButton type="submit">Subir documento</PrimaryButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
