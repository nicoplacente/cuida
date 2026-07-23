import "server-only";

import { createHash, createHmac } from "crypto";

const r2Region = "auto";
const r2Service = "s3";
const emptyBodyHash = createHash("sha256").update("").digest("hex");

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta configurar ${name}.`);
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

  if (body) {
    headers["content-length"] = String(body.length ?? body.byteLength ?? 0);
  }

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
  const response = await fetch(url, {
    body,
    headers,
    method,
  });

  if (!response.ok) {
    throw new Error(`R2 respondió con estado ${response.status}.`);
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
