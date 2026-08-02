import { deleteDocumentAction, uploadDocumentAction } from "@/features/documents/actions";
import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { PageHeader } from "@/components/page-header";
import { formatShortDate } from "@/utils/dates";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { DocumentEditButton } from "@/features/documents/document-edit-button";

export default async function DocumentsPage() {
  const { careCircle, canManage } = await requireCareContext();

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
        Guardá documentos médicos protegidos para que solo el grupo familiar
        pueda acceder a ellos.
      </PageHeader>

      <div className={`grid gap-6 ${canManage ? "xl:grid-cols-[1fr_360px]" : ""}`}>
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
                    <div className="flex flex-wrap gap-2">
                    <a
                      href={`/app/documentos/${document.id}/archivo`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[color:var(--care-ink)]"
                    >
                      Abrir
                    </a>
                    {canManage ? (
                      <>
                        <DocumentEditButton
                          document={{
                            id: document.id,
                            title: document.title,
                            notes: document.notes,
                          }}
                        />
                        <ConfirmDeleteButton
                          action={deleteDocumentAction}
                          description={`Se eliminarán ${document.title} y su archivo protegido. Esta acción no se puede deshacer.`}
                          fields={{ documentId: document.id }}
                          title={`Eliminar ${document.title}`}
                        />
                      </>
                    ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No hay documentos cargados." />
            )}
          </div>
        </Card>

        {canManage ? (
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Subir documento</h2>
          <ToastForm
            action={uploadDocumentAction}
            className="grid gap-4"
            refreshOnSuccess
            resetOnSuccess
            showStatus
          >
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
            <SubmitButton pendingLabel="Subiendo…">Subir documento</SubmitButton>
          </ToastForm>
        </Card>
        ) : null}
      </div>
    </div>
  );
}
