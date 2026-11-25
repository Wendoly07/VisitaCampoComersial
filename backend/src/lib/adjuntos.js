import { q, T } from '../db.js';
import { subirArchivo, borrarArchivo, urlLectura } from './storage.js';
import { ahoraLocal } from './fechas.js';

export const MAX_FOTOS = 10;

export async function listarAdjuntos(entidad, entidadId) {
  const filas = await q(
    `SELECT Id, Tipo, BlobName, FechaCreacion FROM ${T.Adjuntos}
     WHERE Entidad=@entidad AND EntidadId=@id ORDER BY Id`,
    { entidad, id: Number(entidadId) }
  );
  return filas.map(f => ({ id: f.id, tipo: f.tipo, url: urlLectura(f.blobName), fechaCreacion: f.fechaCreacion }));
}

export async function guardarFotos(entidad, entidadId, archivos, tipo = 'foto') {
  const [{ total }] = await q(
    `SELECT COUNT(*) AS Total FROM ${T.Adjuntos} WHERE Entidad=@entidad AND EntidadId=@id AND Tipo='foto'`,
    { entidad, id: Number(entidadId) }
  );
  if (tipo === 'foto' && total + archivos.length > MAX_FOTOS) {
    throw Object.assign(new Error(`Máximo ${MAX_FOTOS} fotos por registro.`), { status: 400 });
  }
  for (const a of archivos) {
    const blobName = await subirArchivo(a.buffer, a.mimetype, `${entidad}/${entidadId}`);
    await q(
      `INSERT INTO ${T.Adjuntos} (Entidad, EntidadId, Tipo, BlobName, FechaCreacion)
       VALUES (@entidad, @id, @tipo, @blobName, @fecha)`,
      { entidad, id: Number(entidadId), tipo, blobName, fecha: ahoraLocal() }
    );
  }
  return listarAdjuntos(entidad, entidadId);
}

export async function eliminarAdjunto(entidad, entidadId, adjuntoId) {
  const filas = await q(
    `DELETE FROM ${T.Adjuntos} OUTPUT deleted.BlobName
     WHERE Id=@aid AND Entidad=@entidad AND EntidadId=@id`,
    { aid: Number(adjuntoId), entidad, id: Number(entidadId) }
  );
  for (const f of filas) await borrarArchivo(f.blobName);
  return filas.length > 0;
}
