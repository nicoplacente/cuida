import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const globalsCss = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);

test("compensa únicamente en iOS el ancho de los inputs temporales con padding", () => {
  assert.match(
    globalsCss,
    /@supports \(-webkit-touch-callout: none\) \{[\s\S]*?input\[type="date"\],[\s\S]*?input\[type="time"\],[\s\S]*?input\[type="datetime-local"\],[\s\S]*?input\[type="month"\],[\s\S]*?input\[type="week"\] \{[\s\S]*?width: calc\(100% - 2rem\);[\s\S]*?\n  \}\n\}/,
  );
});
