import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteDocumentAction,
  deleteFolderAction,
} from "@/features/documents/actions";
import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, inputClassName } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { formatShortDate } from "@/utils/dates";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { DocumentEditButton } from "@/features/documents/document-edit-button";
import { DocumentLibraryActions } from "@/features/documents/document-library-actions";
import { FolderEditButton } from "@/features/documents/folder-edit-button";
import { DocumentIcon } from "@/components/icons/document-icon";
import { FolderIcon } from "@/components/icons/folder-icon";
import {
  getFolderNameKey,
  getFolderPath,
  getFolderPathLabel,
  matchesDocumentSearch,
} from "@/features/documents/folders";

const systemFolderOrder = new Map([["MEDICAL_HISTORY", 0]]);

function getFolderHref(folderId) {
  return folderId
    ? `/app/documentos?folder=${encodeURIComponent(folderId)}`
    : "/app/documentos";
}

function compareFolders(left, right) {
  const leftOrder = systemFolderOrder.get(left.systemKey) ?? 2;
  const rightOrder = systemFolderOrder.get(right.systemKey) ?? 2;

  if (leftOrder !== rightOrder) return leftOrder - rightOrder;
  return left.name.localeCompare(right.name, "es", { sensitivity: "base" });
}

function getFolderSummary(folder) {
  const parts = [];
  const childCount = folder._count.children;
  const documentCount = folder._count.documents;

  if (childCount) {
    parts.push(`${childCount} ${childCount === 1 ? "subcarpeta" : "subcarpetas"}`);
  }
  if (documentCount) {
    parts.push(`${documentCount} ${documentCount === 1 ? "documento" : "documentos"}`);
  }

  return parts.join(" · ") || "Carpeta vacía";
}

function Breadcrumbs({ currentFolder, foldersById, isSearch }) {
  const path = currentFolder ? getFolderPath(foldersById, currentFolder.id) : [];

  return (
    <nav aria-label="Ruta de documentos" className="flex flex-wrap items-center gap-2 text-sm">
      <Link
        className="font-semibold text-[color:var(--care-ink-soft)] hover:text-[color:var(--care-ink)]"
        href="/app/documentos"
      >
        Documentos
      </Link>
      {path.map((folder) => (
        <span className="contents" key={folder.id}>
          <span aria-hidden="true" className="text-[color:var(--care-muted)]">/</span>
          {folder.id === currentFolder?.id && !isSearch ? (
            <span aria-current="page" className="font-semibold text-[color:var(--care-ink)]">
              {folder.name}
            </span>
          ) : (
            <Link
              className="font-semibold text-[color:var(--care-ink-soft)] hover:text-[color:var(--care-ink)]"
              href={getFolderHref(folder.id)}
            >
              {folder.name}
            </Link>
          )}
        </span>
      ))}
      {isSearch ? (
        <>
          <span aria-hidden="true" className="text-[color:var(--care-muted)]">/</span>
          <span aria-current="page" className="font-semibold text-[color:var(--care-ink)]">
            Resultados
          </span>
        </>
      ) : null}
    </nav>
  );
}

function FolderCard({ canManage, folder, foldersById, showPath }) {
  const pathLabel = getFolderPathLabel(foldersById, folder.parentId);

  return (
    <article
      className={`rounded-2xl border p-4 transition hover:border-[color:var(--care-teal)] ${
        folder.systemKey
          ? "border-[color:var(--care-teal)] bg-[color:var(--care-teal-soft)]"
          : "border-[color:var(--care-cloud)] bg-[#f8fbfd]"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          aria-label={`Abrir carpeta ${folder.name}`}
          className="group flex min-w-0 flex-1 items-center gap-4 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          href={getFolderHref(folder.id)}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[color:var(--care-teal)] shadow-[0_8px_24px_rgba(11,31,58,0.06)]">
            <FolderIcon />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-lg font-semibold group-hover:text-[color:var(--care-teal)]">
                {folder.name}
              </span>
              {folder.systemKey ? <Badge tone="teal">Predeterminada</Badge> : null}
            </span>
            <span className="mt-1 block text-sm text-[color:var(--care-muted)]">
              {getFolderSummary(folder)}
            </span>
            {showPath ? (
              <span className="mt-1 block truncate text-xs font-semibold text-[color:var(--care-ink-soft)]">
                {pathLabel}
              </span>
            ) : null}
          </span>
        </Link>

        {canManage && !folder.systemKey ? (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <FolderEditButton folder={{ id: folder.id, name: folder.name }} />
            <ConfirmDeleteButton
              action={deleteFolderAction}
              description={`¿Estás seguro de eliminar ${folder.name}? Se eliminarán también todas sus subcarpetas y los documentos que contengan. Esta acción no se puede deshacer.`}
              fields={{ folderId: folder.id }}
              title={`Eliminar ${folder.name}`}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DocumentCard({ canManage, document, folderOptions, foldersById, showPath }) {
  return (
    <article className="rounded-2xl border border-[color:var(--care-cloud)] bg-white p-4 transition hover:border-[color:var(--care-teal)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--care-canvas)] text-[color:var(--care-ink-soft)]">
            <DocumentIcon />
          </span>
          <div className="min-w-0">
            <Badge>{formatShortDate(document.createdAt)}</Badge>
            <h3 className="mt-2 break-words text-lg font-semibold">{document.title}</h3>
            <p className="mt-1 truncate text-sm text-[color:var(--care-muted)]">
              {document.fileName} · Subido por {document.uploadedBy.name}
            </p>
            {showPath ? (
              <p className="mt-2 text-xs font-semibold text-[color:var(--care-teal)]">
                {getFolderPathLabel(foldersById, document.folderId)}
              </p>
            ) : null}
            {document.notes ? (
              <p className="mt-2 text-sm text-[color:var(--care-ink-soft)]">
                {document.notes}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <a
            href={`/app/documentos/${document.id}/archivo`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[color:var(--care-cloud)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Abrir
          </a>
          {canManage ? (
            <>
              <DocumentEditButton
                document={{
                  folderId: document.folderId,
                  id: document.id,
                  notes: document.notes,
                  title: document.title,
                }}
                folderOptions={folderOptions}
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
  );
}

export default async function DocumentsPage({ searchParams }) {
  const { careCircle, canManage } = await requireCareContext();

  if (!careCircle) {
    return <EmptyState title="No hay círculo activo." />;
  }

  const params = searchParams ? await searchParams : {};
  const requestedFolderId = typeof params.folder === "string" ? params.folder : "";
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const folders = await prisma.documentFolder.findMany({
    where: { careCircleId: careCircle.id },
    select: {
      id: true,
      name: true,
      parentId: true,
      systemKey: true,
      _count: { select: { children: true, documents: true } },
    },
  });
  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));
  const currentFolder = requestedFolderId ? foldersById.get(requestedFolderId) : null;

  if (requestedFolderId && !currentFolder) notFound();

  const documentRecords = await prisma.document.findMany({
    where: {
      careCircleId: careCircle.id,
      ...(query ? {} : { folderId: currentFolder?.id || null }),
    },
    select: {
      id: true,
      folderId: true,
      title: true,
      fileName: true,
      notes: true,
      createdAt: true,
      uploadedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const documents = query
    ? documentRecords.filter((document) => matchesDocumentSearch(document, query))
    : documentRecords;
  const searchKey = getFolderNameKey(query);
  const visibleFolders = (query
    ? folders.filter((folder) => getFolderNameKey(folder.name).includes(searchKey))
    : folders.filter((folder) => folder.parentId === (currentFolder?.id || null)))
    .sort(compareFolders);
  const folderOptions = folders
    .map((folder) => ({
      id: folder.id,
      label: getFolderPathLabel(foldersById, folder.id).replace("Documentos / ", ""),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "es", { sensitivity: "base" }));
  const currentLocationName = currentFolder?.name || "Documentos";
  const hasResults = visibleFolders.length > 0 || documents.length > 0;

  return (
    <div>
      <PageHeader eyebrow="Documentos" title="La información importante, ordenada y protegida.">
        Organizá documentos personales y médicos en carpetas para que el círculo de cuidado pueda encontrarlos rápidamente.
      </PageHeader>

      <div className="grid gap-5">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <form action="/app/documentos" className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row" method="get" role="search">
              <label className="sr-only" htmlFor="document-search">Buscar documentos y carpetas</label>
              <input
                className={`${inputClassName} flex-1`}
                defaultValue={query}
                id="document-search"
                maxLength={100}
                name="q"
                placeholder="Buscar por carpeta, título, archivo o notas…"
                type="search"
              />
              <button
                className="min-h-12 rounded-full border border-[color:var(--care-cloud)] bg-white px-5 py-3 text-sm font-semibold transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                type="submit"
              >
                Buscar
              </button>
              {query ? (
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-[color:var(--care-ink-soft)] hover:text-[color:var(--care-ink)]"
                  href="/app/documentos"
                >
                  Limpiar
                </Link>
              ) : null}
            </form>
            {canManage && !query ? (
              <DocumentLibraryActions
                currentFolderId={currentFolder?.id || ""}
                currentFolderName={currentLocationName}
              />
            ) : null}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <Breadcrumbs currentFolder={currentFolder} foldersById={foldersById} isSearch={Boolean(query)} />

          <div className="mt-5 flex flex-col gap-2 border-b border-[color:var(--care-cloud)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--care-teal)]">
                {query ? "Búsqueda global" : currentFolder ? "Contenido de la carpeta" : "Biblioteca"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em]">
                {query ? `Resultados para “${query}”` : currentLocationName}
              </h2>
            </div>
            <p className="text-sm text-[color:var(--care-muted)]">
              {visibleFolders.length} {visibleFolders.length === 1 ? "carpeta" : "carpetas"} · {documents.length} {documents.length === 1 ? "documento" : "documentos"}
            </p>
          </div>

          {hasResults ? (
            <div className="mt-6 grid gap-7">
              {visibleFolders.length ? (
                <section aria-labelledby="folders-heading">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--care-muted)]" id="folders-heading">
                    Carpetas
                  </h3>
                  <div className="grid gap-3">
                    {visibleFolders.map((folder) => (
                      <FolderCard
                        canManage={canManage}
                        folder={folder}
                        foldersById={foldersById}
                        key={folder.id}
                        showPath={Boolean(query)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {documents.length ? (
                <section aria-labelledby="documents-heading">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--care-muted)]" id="documents-heading">
                    Documentos
                  </h3>
                  <div className="grid gap-3">
                    {documents.map((document) => (
                      <DocumentCard
                        canManage={canManage}
                        document={document}
                        folderOptions={folderOptions}
                        foldersById={foldersById}
                        key={document.id}
                        showPath={Boolean(query)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState title={query ? "No encontramos coincidencias." : "Esta ubicación está vacía."}>
                {query
                  ? "Probá con otro nombre, título o palabra de las notas."
                  : canManage
                    ? "Creá una subcarpeta o subí un documento para empezar."
                    : "Todavía no se agregaron carpetas ni documentos aquí."}
              </EmptyState>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
