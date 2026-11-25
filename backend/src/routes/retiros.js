import { Router } from 'express';
import { q, q1, T } from '../db.js';
import { ahoraLocal } from '../lib/fechas.js';
import { esSupervisor } from '../middleware/auth.js';
import { subidaFotos } from '../lib/subida.js';
import { guardarFotos, listarAdjuntos } from '../lib/adjuntos.js';

const router = Router();
const ESTADOS = ['Autorización Comercial', 'Saldos Pendientes', 'Orden Cerrada'];

// Listado de solicitudes de retiro de agentes. ?q=
router.get('/', async (req, res) => {
  const texto = String(req.query.q || '').trim();
  res.json(await q(
    `SELECT TOP 200 r.Id, r.TipoSolicitud, r.RazonRetiro, r.Estado, r.FechaCreacion,
            a.Id AS AgenteId, a.Codigo AS AgenteCodigo, a.Nombre AS AgenteNombre, u.Nombre AS CreadoPor
     FROM ${T.RetirosAgente} r
     JOIN ${T.Agentes} a ON a.Id=r.AgenteId
     JOIN ${T.Usuarios} u ON u.Id=r.CreadoPorId
     WHERE (@texto='' OR a.Nombre LIKE @like OR a.Codigo LIKE @like)
     ORDER BY r.FechaCreacion DESC`,
    { texto, like: `%${texto}%` }
  ));
});

router.get('/:id', async (req, res) => {
  const r = await q1(
    `SELECT r.*, a.Codigo AS AgenteCodigo, a.Nombre AS AgenteNombre, u.Nombre AS CreadoPor
     FROM ${T.RetirosAgente} r JOIN ${T.Agentes} a ON a.Id=r.AgenteId JOIN ${T.Usuarios} u ON u.Id=r.CreadoPorId
     WHERE r.Id=@id`, { id: Number(req.params.id) }
  );
  if (!r) return res.status(404).json({ error: 'Solicitud no encontrada' });
  res.json({ ...r, fotos: await listarAdjuntos('retiro', r.id) });
});

// Crear solicitud (multipart: campos + fotos[])
router.post('/', subidaFotos.array('fotos', 10), async (req, res) => {
  const { agenteId, tipoSolicitud, razonRetiro, comentarios, estadoEquipo } = req.body || {};
  if (!agenteId || !tipoSolicitud || !razonRetiro) {
    return res.status(400).json({ error: 'Complete el tipo de solicitud y la razón de retiro' });
  }
  const r = await q1(
    `INSERT INTO ${T.RetirosAgente} (AgenteId, TipoSolicitud, RazonRetiro, Comentarios, EstadoEquipo, CreadoPorId, FechaCreacion)
     OUTPUT inserted.Id VALUES (@ag, @tipo, @razon, @com, @eq, @uid, @ahora)`,
    {
      ag: Number(agenteId), tipo: tipoSolicitud, razon: razonRetiro, com: comentarios || null,
      eq: estadoEquipo || null, uid: req.usuario.id, ahora: ahoraLocal()
    }
  );
  if (req.files?.length) await guardarFotos('retiro', r.id, req.files);
  res.status(201).json({ id: r.id });
});

// Cambio de estado (solo supervisores)
router.patch('/:id/estado', async (req, res) => {
  if (!esSupervisor(req.usuario)) return res.status(403).json({ error: 'No tiene permiso para cambiar el estado' });
  if (!ESTADOS.includes(req.body?.estado)) return res.status(400).json({ error: 'Estado no válido' });
  await q(`UPDATE ${T.RetirosAgente} SET Estado=@e WHERE Id=@id`, { e: req.body.estado, id: Number(req.params.id) });
  res.json({ ok: true });
});

export default router;
