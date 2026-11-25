import sql from 'mssql';
import { config } from './config.js';

let poolPromise = null;

export function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config.db).connect().catch(err => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

// Nombres de tablas con el esquema configurado
const s = config.dbSchema;
export const T = Object.fromEntries(
  ['Usuarios', 'Agentes', 'Activos', 'Visitas', 'MovimientosEquipo', 'Adjuntos',
    'JornadasLaborales', 'RetirosAgente', 'Planificaciones', 'Catalogos']
    .map(n => [n, `[${s}].[${n}]`])
);

// PascalCase de la base de datos -> camelCase para el API (PMRealizadoPor -> pmRealizadoPor)
const aCamel = k => k.replace(/^[A-Z]+(?=[A-Z][a-z]|$)|^[A-Z]/, m => m.toLowerCase());
export const camel = row => (row ? Object.fromEntries(Object.entries(row).map(([k, v]) => [aCamel(k), v])) : row);

function prepararRequest(req, params) {
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) req.input(k, null);
    else if (v === null) req.input(k, sql.NVarChar, null);
    else req.input(k, v);
  }
  return req;
}

/** Ejecuta una consulta y devuelve las filas en camelCase */
export async function q(texto, params = {}, tx = null) {
  const req = tx ? new sql.Request(tx) : (await getPool()).request();
  const r = await prepararRequest(req, params).query(texto);
  return (r.recordset || []).map(camel);
}

/** Devuelve solo la primera fila */
export async function q1(texto, params = {}, tx = null) {
  return (await q(texto, params, tx))[0] || null;
}

/** Ejecuta una función dentro de una transacción */
export async function transaccion(fn) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const res = await fn(tx);
    await tx.commit();
    return res;
  } catch (e) {
    try { await tx.rollback(); } catch { /* ignorar */ }
    throw e;
  }
}

export { sql };
