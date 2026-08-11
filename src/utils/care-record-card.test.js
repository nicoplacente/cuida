import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const pagePaths = [
  "../app/(app)/app/tareas/page.jsx",
  "../app/(app)/app/calendario/page.jsx",
  "../app/(app)/app/historial/page.jsx",
  "../app/(app)/app/medicamentos/page.jsx",
];

test("las tarjetas separan acciones y contenido de ancho completo", () => {
  const component = readSource("../components/care-record-card.jsx");

  assert.match(component, /grid-cols-\[minmax\(0,1fr\)_auto\]/);
  assert.match(component, /sm:flex sm:flex-wrap sm:justify-start/);
  assert.match(component, /min-w-0 break-words/);
  assert.match(component, /border-t border-\[color:var\(--care-cloud\)\]/);
  assert.doesNotMatch(component, /items-start justify-between|ml-auto|justify-end/);
  assert.doesNotMatch(component, /line-clamp|truncate/);
});

test("las secciones de cuidado reutilizan la tarjeta responsive", () => {
  for (const path of pagePaths) {
    const source = readSource(path);

    assert.match(source, /from "@\/components\/care-record-card";/);
    assert.match(source, /<CareRecordCard/);
    assert.doesNotMatch(source, /line-clamp|truncate/);
  }
});

test("los textos descriptivos conservan saltos de línea y contenido completo", () => {
  for (const path of pagePaths) {
    assert.match(readSource(path), /whitespace-pre-wrap/);
  }
});

test("las acciones primarias se compactan solo en móvil", () => {
  const component = readSource("../components/care-record-card.jsx");

  assert.match(
    component,
    /!min-h-10 w-full !px-4 !py-2 !text-sm sm:!min-h-12 sm:w-auto sm:!px-6 sm:!py-3 sm:!text-base/,
  );
  assert.match(readSource(pagePaths[0]), /careRecordPrimaryActionClassName/);
  assert.match(readSource(pagePaths[1]), /careRecordPrimaryActionClassName/);
});

test("los metadatos móviles usan posiciones deliberadas y restauran el flujo en desktop", () => {
  const component = readSource("../components/care-record-card.jsx");

  assert.match(component, /below: "col-span-2 row-start-2 justify-self-start"/);
  assert.match(component, /leading: "col-start-1 row-start-1 justify-self-start"/);
  assert.match(component, /trailing: "col-start-2 row-start-1 justify-self-end"/);
  assert.match(component, /sm:contents/);

  for (const path of pagePaths) {
    const source = readSource(path);

    assert.match(source, /CareRecordMetaItem/);
    assert.match(source, /position="leading"/);
    assert.match(source, /position="trailing"/);
    assert.match(source, /position="below"/);
  }
});

test("las acciones móviles usan columnas uniformes sin cambiar el layout desktop", () => {
  const component = readSource("../components/care-record-card.jsx");

  assert.match(component, /grid max-w-full grid-cols-2/);
  assert.match(component, /\[&>button\]:w-full/);
  assert.match(component, /sm:\[&>button\]:w-auto/);

  for (const path of pagePaths) {
    assert.match(readSource(path), /CareRecordAction/);
  }

  assert.match(readSource(pagePaths[0]), /<CareRecordAction primary>/);
  assert.match(readSource(pagePaths[1]), /<CareRecordAction primary>/);
  assert.match(
    readSource(pagePaths[3]),
    /<CareRecordAction primary>\s*<ToastForm action=\{toggleMedicationAction\}>/,
  );
});
