const safeErrorNames = new Set([
  "AbortError",
  "Error",
  "PrismaClientInitializationError",
  "PrismaClientKnownRequestError",
  "PrismaClientRustPanicError",
  "PrismaClientUnknownRequestError",
  "PrismaClientValidationError",
  "R2ConfigurationError",
  "R2RequestError",
  "RangeError",
  "SafeServerError",
  "TimeoutError",
  "TypeError",
]);

const safeContextPattern = /^[a-zA-Z][a-zA-Z0-9:._-]{0,79}$/;
const safeExplicitCodePattern = /^[A-Z][A-Z0-9_]{1,63}$/;
const safePrismaCodePattern = /^P\d{4}$/;
const safeSystemCodePattern = /^E[A-Z0-9_]{2,31}$/;

function getSafeContext(context) {
  return typeof context === "string" && safeContextPattern.test(context)
    ? context
    : "serverError";
}

function getSafeErrorName(error) {
  return safeErrorNames.has(error?.name) ? error.name : "UnknownError";
}

function getSafeErrorCode(errorCode) {
  if (typeof errorCode !== "string") return null;

  return safePrismaCodePattern.test(errorCode) || safeSystemCodePattern.test(errorCode)
    ? errorCode
    : null;
}

function getSafeExplicitCode(code) {
  return typeof code === "string" && safeExplicitCodePattern.test(code)
    ? code
    : null;
}

function getSafeStatus(status) {
  const numericStatus = Number(status);
  return Number.isInteger(numericStatus) && numericStatus >= 100 && numericStatus <= 599
    ? numericStatus
    : null;
}

export function getSafeErrorMetadata(error, { code, status } = {}) {
  const metadata = {
    type: getSafeErrorName(error),
  };
  const safeCode = getSafeExplicitCode(code) || getSafeErrorCode(error?.code);
  const safeStatus = getSafeStatus(status ?? error?.status ?? error?.statusCode);

  if (safeCode) metadata.code = safeCode;
  if (safeStatus) metadata.status = safeStatus;

  return metadata;
}

export function logServerError(context, error, metadata) {
  console.error(
    `[${getSafeContext(context)}]`,
    getSafeErrorMetadata(error, metadata),
  );
}

export class SafeServerError extends Error {
  constructor(code = "SERVER_OPERATION_FAILED") {
    super("Ocurrió un error interno del servidor.");
    this.name = "SafeServerError";
    this.code = getSafeExplicitCode(code) || "SERVER_OPERATION_FAILED";
    this.stack = undefined;
  }
}

export function createSafeServerError(error, fallbackCode = "SERVER_OPERATION_FAILED") {
  if (error instanceof SafeServerError) return error;

  const code = getSafeErrorCode(error?.code) || getSafeExplicitCode(fallbackCode);
  return new SafeServerError(code || "SERVER_OPERATION_FAILED");
}
