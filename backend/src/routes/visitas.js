import { Router } from 'express';
import { q, q1, T, transaccion } from '../db.js';
import { ahoraLocal, fechaValida } from '../lib/fechas.js';
import { esSupervisor } from '../middleware/auth.js';
import { subidaFotos } from '../lib/subida.js';
import { guardarFotos, eliminarAdjunto, listarAdjuntos } from '../lib/adjuntos.js';
import { subirArchivo, borrarArchivo, urlLectura } from '../lib/storage.js';

const router = Router();

export const TIPOS_VISITA = ['Hotline', 'Otros Soportes', 'Mantenimiento Preventivo', 'Instalación', 'Retiro', 'Visita Comercial'];
const ABIERTAS = ['Sin Programar', 'Programada', 'En Proceso'];

const err = (status, msg) => Object.assign(new Error(msg), { status });

/** Obtiene la visita validando que pertenezca al usuario (o que sea supervisor) */
async function obtenerVisita(id, usuario) {
  const v = await q1(`SELECT * FROM ${T.Visitas} WHERE Id=@id`, { id: Number(id) });
  if (!v) throw err(404, 'Visita no encontrada');
  if (v.usuarioId !== usuario.id && !esSupervisor(usuario)) throw err(403, 'Esta visita pertenece a otro usuario');
  return v;
}

function parseDetalle(texto) {
  try { return texto ? JSON.parse(texto) : {}; } catch { return {}; }
}

async function visitaCompleta(id) {
  const v = await q1(
    `SELECT v.*, u.Nombre AS Visitador FROM ${T.Visitas} v JOIN ${T.Usuarios} u ON u.Id=v.UsuarioId WHERE v.Id=@id`,
    { id: Number(id) }
  );
  const agente = await q1(`SELECT * FROM ${T.Agentes} WHERE Id=@id`, { id: v.agenteId });
  const movimientos = await q(
    `SELECT m.Id, m.TipoMovimiento, m.PrefijoSale, m.PrefijoEntra, m.Aplicado,
            s.Id AS ActivoSaleId, s.Codigo AS ActivoSale, e.Id AS ActivoEntraId, e.Codigo AS ActivoEntra
     FROM ${T.MovimientosEquipo} m
     LEFT JOIN ${T.Activos} s ON s.Id=m.ActivoSaleId
     LEFT JOIN ${T.Activos} e ON e.Id=m.ActivoEntraId
     WHERE m.VisitaId=@id ORDER BY m.Id`,
    { id: v.id }
  );
  const fotos = await listarAdjuntos('visita', v.id);
  const { firmaBlob, detalle, ...resto } = v;
  return { ...resto, detalle: parseDetalle(detalle), firmaUrl: urlLectura(firmaBlob), agente, movimientos, fotos };
}

// ---------- Listado (Mis Visitas) ----------
// ?desde=&hasta=&estado=&tipo=&ciudad=&codigo=&todos=1
router.get('/', async (req, res) => {
  const p = {
    uid: req.usuario.id,
    todos: req.query.todos === '1' && esSupervisor(req.usuario) ? 1 : 0,
    desde: fechaValida(req.query.desde),
    hasta: fechaValida(req.query.hasta),
    estado: String(req.query.estado || ''),
    tipo: String(req.query.tipo || ''),
    ciudad: String(req.query.ciudad || ''),
    codigo: String(req.query.codigo || '').trim()
  };
  const filas = await q(
    `SELECT TOP 500 v.Id, v.TipoVisita, v.Estado, v.Planificada, v.FechaPlanificada, v.HoraPlanificada, v.FechaInicio,
            v.FechaFin, v.FechaRef, v.FechaSincronizacion, a.Id AS AgenteId, a.Codigo AS AgenteCodigo,
            a.Nombre AS AgenteNombre, a.Direccion, a.Municipio
     FROM ${T.Visitas} v JOIN ${T.Agentes} a ON a.Id=v.AgenteId
     WHERE (@todos=1 OR v.UsuarioId=@uid)
       AND (@desde IS NULL OR v.FechaRef >= @desde)
       AND (@hasta IS NULL OR v.FechaRef <= @hasta)
       AND (@estado='' OR v.Estado=@estado)
       AND (@tipo='' OR v.TipoVisita=@tipo)
       AND (@ciudad='' OR a.Municipio=@ciudad)
       AND (@codigo='' OR a.Codigo LIKE '%' + @codigo + '%')
     ORDER BY v.FechaRef, v.HoraPlanificada, v.Id`,
    p
  );
  res.json(filas);
});

// ---------- Crear (Registro de Visita) ----------
// body: { agenteId, tipoVisita, fechaPlanificada, horaPlanificada, iniciar }
router.post('/', async (req, res) => {
  const { agenteId, tipoVisita, fechaPlanificada, horaPlanificada, iniciar } = req.body || {};
  if (!agenteId) throw err(400, 'Seleccione el agente');
  if (!TIPOS_VISITA.includes(tipoVisita)) throw err(400, 'Seleccione un tipo de visita válido');
  const agente = await q1(`SELECT Id FROM ${T.Agentes} WHERE Id=@id AND Activo=1`, { id: Number(agenteId) });
  if (!agente) throw err(404, 'Agente no encontrado');
  const fecha = fechaValida(fechaPlanificada);
  const hora = /^\d{2}:\d{2}/.test(horaPlanificada || '') ? horaPlanificada.slice(0, 5) : null;
  const v = await q1(
    `INSERT INTO ${T.Visitas} (AgenteId, UsuarioId, TipoVisita, Estado, Planificada, FechaPlanificada, HoraPlanificada, FechaCreacion)
     OUTPUT inserted.Id
     VALUES (@agenteId, @uid, @tipo, @estado, @planificada, @fecha, @hora, @ahora)`,
    {
      agenteId: Number(agenteId), uid: req.usuario.id, tipo: tipoVisita,
      estado: fecha ? 'Programada' : 'Sin Programar',
      planificada: iniciar ? 0 : 1, fecha: fecha?.slice(0, 10) ?? null, hora, ahora: ahoraLocal()
    }
  );
  res.status(201).json(await visitaCompleta(v.id));
});

router.get('/:id', async (req, res) => {
  await obtenerVisita(req.params.id, req.usuario);
  res.json(await visitaCompleta(req.params.id));
});

// ---------- Actualizar datos parciales (cada paso del formulario) ----------
router.patch('/:id', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  if (['Cerrada', 'Cancelada'].includes(v.estado)) throw err(400, 'La visita ya fue cerrada');
  const b = req.body || {};
  const detalle = b.detalle && typeof b.detalle === 'object'
    ? JSON.stringify({ ...parseDetalle(v.detalle), ...b.detalle })
    : v.detalle;
  await q(
    `UPDATE ${T.Visitas} SET
        Razon=@razon, SubRazon=@subRazon, Observaciones=@obs, Detalle=@detalle,
        Latitud=@lat, Longitud=@lon
     WHERE Id=@id`,
    {
      id: v.id,
      razon: b.razon !== undefined ? b.razon : v.razon,
      subRazon: b.subRazon !== undefined ? b.subRazon : v.subRazon,
      obs: b.observaciones !== undefined ? b.observaciones : v.observaciones,
      detalle,
      lat: b.latitud !== undefined ? Number(b.latitud) || null : v.latitud,
      lon: b.longitud !== undefined ? Number(b.longitud) || null : v.longitud
    }
  );
  res.json(await visitaCompleta(v.id));
});

router.post('/:id/iniciar', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  if (v.estado === 'En Proceso') return res.json(await visitaCompleta(v.id));
  if (!['Programada', 'Sin Programar'].includes(v.estado)) throw err(400, `No se puede iniciar una visita ${v.estado.toLowerCase()}`);
  const { latitud, longitud } = req.body || {};
  await q(
    `UPDATE ${T.Visitas} SET Estado='En Proceso', FechaInicio=@ahora, Latitud=COALESCE(@lat, Latitud), Longitud=COALESCE(@lon, Longitud) WHERE Id=@id`,
    { id: v.id, ahora: ahoraLocal(), lat: Number(latitud) || null, lon: Number(longitud) || null }
  );
  res.json(await visitaCompleta(v.id));
});

router.post('/:id/reprogramar', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  if (!['Programada', 'Sin Programar'].includes(v.estado)) throw err(400, 'Solo se pueden reprogramar visitas que no han iniciado');
  const fecha = fechaValida(req.body?.fechaPlanificada);
  if (!fecha) throw err(400, 'Indique la nueva fecha');
  const hora = /^\d{2}:\d{2}/.test(req.body?.horaPlanificada || '') ? req.body.horaPlanificada.slice(0, 5) : null;
  await q(
    `UPDATE ${T.Visitas} SET FechaPlanificada=@fecha, HoraPlanificada=COALESCE(@hora, HoraPlanificada), Estado='Programada' WHERE Id=@id`,
    { id: v.id, fecha: fecha.slice(0, 10), hora }
  );
  res.json(await visitaCompleta(v.id));
});

router.post('/:id/cancelar', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  if (!ABIERTAS.includes(v.estado)) throw err(400, 'La visita ya fue cerrada');
  await q(`UPDATE ${T.Visitas} SET Estado='Cancelada', MotivoCancelacion=@m WHERE Id=@id`,
    { id: v.id, m: String(req.body?.motivo || '').slice(0, 250) || null });
  res.json(await visitaCompleta(v.id));
});

// ---------- Fotos ----------
router.post('/:id/fotos', subidaFotos.array('fotos', 10), async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  if (!req.files?.length) throw err(400, 'Adjunte al menos una foto');
  res.status(201).json(await guardarFotos('visita', v.id, req.files));
});

router.delete('/:id/fotos/:fotoId', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  await eliminarAdjunto('visita', v.id, req.params.fotoId);
  res.json(await listarAdjuntos('visita', v.id));
});

// ---------- Firma electrónica (imagen PNG en base64) ----------
router.post('/:id/firma', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  const m = String(req.body?.dataUrl || '').match(/^data:image\/png;base64,(.+)$/);
  if (!m) throw err(400, 'Firma no válida');
  const buffer = Buffer.from(m[1], 'base64');
  if (buffer.length > 2 * 1024 * 1024) throw err(400, 'La firma es demasiado grande');
  const blob = await subirArchivo(buffer, 'image/png', `visita/${v.id}/firma`);
  if (v.firmaBlob) await borrarArchivo(v.firmaBlob);
  await q(`UPDATE ${T.Visitas} SET FirmaBlob=@b WHERE Id=@id`, { id: v.id, b: blob });
  res.json({ firmaUrl: urlLectura(blob) });
});

// ---------- Movimientos de equipo ----------
const REQUIERE = {
  'Retirar Equipo': ['sale'], 'Retiro Equipo': ['sale'],
  'Agregar Equipo': ['entra'], 'Instalar Equipo': ['entra'],
  'Cambio': ['sale', 'entra']
};

router.post('/:id/movimientos', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  if (v.estado !== 'En Proceso') throw err(400, 'Inicie la visita antes de registrar movimientos');
  const { tipoMovimiento, prefijoSale, activoSaleId, prefijoEntra, activoEntraId } = req.body || {};
  const req_ = REQUIERE[tipoMovimiento];
  if (!req_) throw err(400, 'Seleccione el cambio de equipo a realizar');
  let sale = null; let entra = null;
  if (req_.includes('sale')) {
    sale = await q1(`SELECT * FROM ${T.Activos} WHERE Id=@id`, { id: Number(activoSaleId) || 0 });
    if (!sale || sale.agenteId !== v.agenteId) throw err(400, 'Seleccione el activo que sale (debe pertenecer al agente)');
  }
  if (req_.includes('entra')) {
    entra = await q1(`SELECT * FROM ${T.Activos} WHERE Id=@id`, { id: Number(activoEntraId) || 0 });
    if (!entra || entra.agenteId !== null || entra.estado !== 'En Bodega') throw err(400, 'Seleccione un activo disponible en bodega para instalar');
  }
  const repetido = await q1(
    `SELECT TOP 1 Id FROM ${T.MovimientosEquipo} WHERE VisitaId=@v AND (ActivoSaleId IN (@s, @e) OR ActivoEntraId IN (@s, @e))`,
    { v: v.id, s: sale?.id ?? -1, e: entra?.id ?? -1 }
  );
  if (repetido) throw err(400, 'Ese activo ya tiene un movimiento en esta visita');
  await q(
    `INSERT INTO ${T.MovimientosEquipo} (VisitaId, TipoMovimiento, PrefijoSale, ActivoSaleId, PrefijoEntra, ActivoEntraId, FechaCreacion)
     VALUES (@v, @tipo, @ps, @s, @pe, @e, @ahora)`,
    {
      v: v.id, tipo: tipoMovimiento, ps: sale ? (prefijoSale || sale.prefijo) : null, s: sale?.id ?? null,
      pe: entra ? (prefijoEntra || entra.prefijo) : null, e: entra?.id ?? null, ahora: ahoraLocal()
    }
  );
  res.status(201).json((await visitaCompleta(v.id)).movimientos);
});

router.delete('/:id/movimientos/:movId', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  await q(`DELETE FROM ${T.MovimientosEquipo} WHERE Id=@m AND VisitaId=@v AND Aplicado=0`, { m: Number(req.params.movId), v: v.id });
  res.json((await visitaCompleta(v.id)).movimientos);
});

// ---------- Finalizar visita ----------
// body: { observaciones, latitud, longitud, fechaFin }
router.post('/:id/finalizar', async (req, res) => {
  const v = await obtenerVisita(req.params.id, req.usuario);
  if (v.estado !== 'En Proceso') throw err(400, 'Solo se pueden finalizar visitas en proceso');
  const b = req.body || {};
  if (v.tipoVisita === 'Mantenimiento Preventivo') {
    const [{ n }] = await q(`SELECT COUNT(*) AS N FROM ${T.Adjuntos} WHERE Entidad='visita' AND EntidadId=@id AND Tipo='foto'`, { id: v.id });
    if (!n) throw err(400, 'Agregue al menos una foto de evidencia');
  }
  const fechaFin = fechaValida(b.fechaFin) || ahoraLocal();
  const ahora = ahoraLocal();
  const usuario = await q1(`SELECT Nombre FROM ${T.Usuarios} WHERE Id=@id`, { id: req.usuario.id });

  await transaccion(async tx => {
    // Aplicar movimientos de equipo al inventario
    const movs = await q(`SELECT * FROM ${T.MovimientosEquipo} WHERE VisitaId=@id AND Aplicado=0`, { id: v.id }, tx);
    for (const m of movs) {
      if (m.activoSaleId) {
        await q(`UPDATE ${T.Activos} SET AgenteId=NULL, Estado='En Bodega' WHERE Id=@a AND AgenteId=@ag`,
          { a: m.activoSaleId, ag: v.agenteId }, tx);
      }
      if (m.activoEntraId) {
        const r = await q(`UPDATE ${T.Activos} SET AgenteId=@ag, Estado='Disponible' OUTPUT inserted.Id
                           WHERE Id=@a AND AgenteId IS NULL`, { a: m.activoEntraId, ag: v.agenteId }, tx);
        if (!r.length) throw err(409, 'Uno de los activos a instalar ya no está disponible en bodega');
      }
      await q(`UPDATE ${T.MovimientosEquipo} SET Aplicado=1 WHERE Id=@m`, { m: m.id }, tx);
    }
    await q(
      `UPDATE ${T.Visitas} SET Estado='Cerrada', FechaFin=@fin, Observaciones=COALESCE(@obs, Observaciones),
         Latitud=COALESCE(@lat, Latitud), Longitud=COALESCE(@lon, Longitud), FechaSincronizacion=@ahora
       WHERE Id=@id`,
      {
        id: v.id, fin: fechaFin, ahora, obs: b.observaciones ?? null,
        lat: Number(b.latitud) || null, lon: Number(b.longitud) || null
      }, tx
    );
    if (v.tipoVisita === 'Mantenimiento Preventivo') {
      await q(`UPDATE ${T.Agentes} SET UltimoPM=@fin, PMRealizadoPor=@n WHERE Id=@ag`,
        { fin: fechaFin, n: usuario?.nombre ?? null, ag: v.agenteId }, tx);
    }
    if (v.tipoVisita === 'Visita Comercial') {
      await q(`UPDATE ${T.Agentes} SET UltimaVisitaComercial=@fin WHERE Id=@ag`, { fin: fechaFin, ag: v.agenteId }, tx);
    }
  });
  res.json(await visitaCompleta(v.id));
});

export default router;
