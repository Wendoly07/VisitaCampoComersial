import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions
} from '@azure/storage-blob';
import { config } from '../config.js';

const CARPETA_LOCAL = path.resolve('uploads');
let contenedor = null;
let credencial = null;

function cliente() {
  if (!config.blob.connectionString) return null;
  if (!contenedor) {
    const svc = BlobServiceClient.fromConnectionString(config.blob.connectionString);
    contenedor = svc.getContainerClient(config.blob.container);
    const partes = Object.fromEntries(config.blob.connectionString.split(';').filter(Boolean).map(x => {
      const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1)];
    }));
    if (partes.AccountName && partes.AccountKey) {
      credencial = new StorageSharedKeyCredential(partes.AccountName, partes.AccountKey);
    }
  }
  return contenedor;
}

export async function iniciarAlmacenamiento() {
  const c = cliente();
  if (c) await c.createIfNotExists();
  else await fs.mkdir(CARPETA_LOCAL, { recursive: true });
}

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/heic': '.heic' };

/** Sube un archivo y devuelve el nombre del blob */
export async function subirArchivo(buffer, mime, carpeta) {
  const nombre = `${carpeta}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${EXT[mime] || ''}`;
  const c = cliente();
  if (c) {
    await c.getBlockBlobClient(nombre).uploadData(buffer, { blobHTTPHeaders: { blobContentType: mime } });
  } else {
    const destino = path.join(CARPETA_LOCAL, nombre);
    await fs.mkdir(path.dirname(destino), { recursive: true });
    await fs.writeFile(destino, buffer);
  }
  return nombre;
}

export async function borrarArchivo(nombre) {
  const c = cliente();
  try {
    if (c) await c.deleteBlob(nombre, { deleteSnapshots: 'include' });
    else await fs.unlink(path.join(CARPETA_LOCAL, nombre));
  } catch { /* si ya no existe, se ignora */ }
}

/** URL de lectura (con SAS temporal si el contenedor es privado) */
export function urlLectura(nombre) {
  if (!nombre) return null;
  const c = cliente();
  if (!c) return `/uploads/${nombre}`;
  const blob = c.getBlobClient(nombre);
  if (!credencial) return blob.url;
  const sas = generateBlobSASQueryParameters({
    containerName: config.blob.container,
    blobName: nombre,
    permissions: BlobSASPermissions.parse('r'),
    startsOn: new Date(Date.now() - 5 * 60000),
    expiresOn: new Date(Date.now() + config.blob.sasMinutos * 60000)
  }, credencial).toString();
  return `${blob.url}?${sas}`;
}

export const CARPETA_UPLOADS = CARPETA_LOCAL;
