import assert from "node:assert/strict";
import test from "node:test";
import {
  SafeServerError,
  createSafeServerError,
  getSafeErrorMetadata,
  logServerError,
} from "./safe-logger.js";

test("conserva únicamente metadatos de error permitidos", () => {
  const error = new Error("DATABASE_URL=postgres://usuario:secreto@interno:5432/cuida");
  error.name = "PrismaClientKnownRequestError";
  error.code = "P1001";
  error.status = 503;
  error.cause = new Error("R2_SECRET_ACCESS_KEY=secreto");
  error.stack = "Error: secreto\n at C:\\ruta\\privada.js:10:2";

  assert.deepEqual(getSafeErrorMetadata(error), {
    type: "PrismaClientKnownRequestError",
    code: "P1001",
    status: 503,
  });
});

test("descarta nombres, códigos y estados no confiables", () => {
  const error = {
    name: "DATABASE_URL",
    code: "postgres://usuario:secreto@interno",
    status: 700,
  };

  assert.deepEqual(getSafeErrorMetadata(error), {
    type: "UnknownError",
  });
});

test("el logger nunca imprime mensajes, stacks, causas ni contextos inseguros", () => {
  const originalConsoleError = console.error;
  const calls = [];
  const error = new Error("SESSION_SECRET=valor-super-secreto");
  error.cause = new Error("https://interno.example/credenciales");
  error.stack = "Error: secreto\n at C:\\servidor\\archivo.js:1:1";

  console.error = (...args) => calls.push(args);

  try {
    logServerError("contexto con espacios DATABASE_URL", error, {
      code: "AUTH_OPERATION_FAILED",
    });
  } finally {
    console.error = originalConsoleError;
  }

  assert.deepEqual(calls, [[
    "[serverError]",
    { type: "Error", code: "AUTH_OPERATION_FAILED" },
  ]]);

  const serializedCalls = JSON.stringify(calls);
  assert.equal(serializedCalls.includes("valor-super-secreto"), false);
  assert.equal(serializedCalls.includes("interno.example"), false);
  assert.equal(serializedCalls.includes("servidor"), false);
  assert.equal(serializedCalls.includes("DATABASE_URL"), false);
});

test("crea errores propagables sin causa ni stack técnico", () => {
  const originalError = new Error("Can't reach database server at interno:5432");
  originalError.name = "PrismaClientInitializationError";
  originalError.code = "P1001";
  originalError.cause = new Error("DATABASE_URL=secreto");

  const safeError = createSafeServerError(originalError, "DATABASE_OPERATION_FAILED");

  assert.equal(safeError instanceof SafeServerError, true);
  assert.equal(safeError.message, "Ocurrió un error interno del servidor.");
  assert.equal(safeError.code, "P1001");
  assert.equal(safeError.stack, undefined);
  assert.equal(safeError.cause, undefined);
});
