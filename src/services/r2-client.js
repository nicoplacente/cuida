import { createHash, createHmac } from "crypto";
import { logServerError } from "../utils/safe-logger.js";

const r2Region = "auto";
const r2Service = "s3";
const emptyBodyHash = createHash("sha256").update("").digest("hex");
const requestTimeout = 20_000;

class R2ConfigurationError extends Error {
  constructor() {
    super("El almacenamiento no está configurado.");
    this.name = "R2ConfigurationError";
    this.stack = undefined;
  }
}

class R2RequestError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = "R2RequestError";
    this.code = code || null;
    this.status = status || null;
    this.stack = undefined;
  }
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new R2ConfigurationError();
  }

  return value;
}

function getR2Config() {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");

  return {
    accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
    accountId,
    bucketName: getRequiredEnv("R2_BUCKET_NAME"),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
  };
}

function hmac(key, value, encoding) {
  return createHmac("sha256", key).update(value).digest(encoding);
}

function getSignatureKey(secretAccessKey, dateStamp) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, r2Region);
  const serviceKey = hmac(regionKey, r2Service);

  return hmac(serviceKey, "aws4_request");
}

function getAmzDates(date = new Date()) {
  const isoDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");

  return {
    amzDate: isoDate,
    dateStamp: isoDate.slice(0, 8),
  };
}

function encodeObjectKey(key) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function hashPayload(payload) {
  if (!payload) {
    return emptyBodyHash;
  }

  return createHash("sha256").update(payload).digest("hex");
}

function buildSignedRequest({ body, contentType, key, method }) {
  const config = getR2Config();
  const { amzDate, dateStamp } = getAmzDates();
  const payloadHash = hashPayload(body);
  const canonicalUri = `/${config.bucketName}/${encodeObjectKey(key)}`;
  const host = new URL(config.endpoint).host;
  const headers = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (contentType) {
    headers["content-type"] = contentType;
  }

  const headerNames = Object.keys(headers).sort();
  const canonicalHeaders = headerNames
    .map((name) => `${name}:${headers[name]}`)
    .join("\n");
  const signedHeaders = headerNames.join(";");
  const credentialScope = `${dateStamp}/${r2Region}/${r2Service}/aws4_request`;
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");
  const signature = hmac(
    getSignatureKey(config.secretAccessKey, dateStamp),
    stringToSign,
    "hex",
  );

  headers.authorization = [
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  return {
    headers,
    url: `${config.endpoint}${canonicalUri}`,
  };
}

async function requestR2Object({ body, contentType, key, method }) {
  const { headers, url } = buildSignedRequest({ body, contentType, key, method });
  let response;

  try {
    response = await fetch(url, {
      body,
      headers,
      method,
      signal: AbortSignal.timeout(requestTimeout),
    });
  } catch (error) {
    const code =
      error.name === "TimeoutError" || error.name === "AbortError"
        ? "RequestTimeout"
        : error.cause?.code || "NetworkError";

    logServerError(`R2:${method}`, error, {
      code: code === "RequestTimeout" ? "R2_REQUEST_TIMEOUT" : "R2_NETWORK_ERROR",
    });
    throw new R2RequestError("No se pudo conectar con R2.", {
      code,
    });
  }

  if (!response.ok) {
    const responseBody = await response.text().catch(() => "");
    const code = responseBody.match(/<Code>([^<]+)<\/Code>/)?.[1] || null;
    logServerError(`R2:${method}`, { name: "R2RequestError" }, {
      code: "R2_REQUEST_REJECTED",
      status: response.status,
    });
    throw new R2RequestError(`R2 respondió con estado ${response.status}.`, {
      code,
      status: response.status,
    });
  }

  return response;
}

export async function uploadR2Object({ body, contentType, key }) {
  await requestR2Object({
    body,
    contentType: contentType || "application/octet-stream",
    key,
    method: "PUT",
  });
}

export async function getR2Object(key) {
  return requestR2Object({
    key,
    method: "GET",
  });
}

export async function deleteR2Object(key) {
  await requestR2Object({
    key,
    method: "DELETE",
  });
}

export function getR2UploadErrorMessage(error) {
  if (error instanceof R2ConfigurationError) {
    return "El almacenamiento de documentos no está configurado. Avisale al administrador.";
  }

  if (!(error instanceof R2RequestError)) {
    return null;
  }

  if (
    error.status === 401 ||
    error.status === 403 ||
    ["AccessDenied", "InvalidAccessKeyId", "SignatureDoesNotMatch"].includes(error.code)
  ) {
    return "El almacenamiento rechazó la subida. Avisale al administrador para revisar el acceso.";
  }

  if (error.code === "NoSuchBucket") {
    return "El espacio de documentos no está disponible. Avisale al administrador.";
  }

  if (["NetworkError", "RequestTimeout"].includes(error.code)) {
    return "No pudimos conectar con el almacenamiento. Intentá nuevamente.";
  }

  return "No pudimos guardar el archivo en el almacenamiento. Intentá nuevamente.";
}

export function getR2DeletionErrorMessage(error) {
  if (error instanceof R2ConfigurationError) {
    return "El almacenamiento de documentos no está configurado. Avisale al administrador.";
  }

  if (!(error instanceof R2RequestError)) return null;

  if (
    error.status === 401 ||
    error.status === 403 ||
    ["AccessDenied", "InvalidAccessKeyId", "SignatureDoesNotMatch"].includes(error.code)
  ) {
    return "El almacenamiento rechazó la eliminación. Avisale al administrador para revisar el acceso.";
  }

  if (["NetworkError", "RequestTimeout"].includes(error.code)) {
    return "No pudimos conectar con el almacenamiento. Intentá nuevamente.";
  }

  return "No pudimos eliminar el archivo del almacenamiento. Intentá nuevamente.";
}
