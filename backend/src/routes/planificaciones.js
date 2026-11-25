import { Router } from 'express';
import { q, q1, T } from '../db.js';
import { ahoraLocal, fechaValida } from '../lib/fechas.js';
import { esSupervisor } from '../middleware/auth.js';
import { subidaFotos } from '../lib/subida.js';
import { guardarFotos, listarAdjuntos } from '../lib/adjuntos.js';

const router = Router();

// Mis planificaciones de branding. ?q=
router.get('/', async (req, res) => {
  const texto = String(req.query.q || '').trim();
  res.json(await q(
    `SELECT TOP 200 p.Id, p.Titulo, p.TipoVisita, p.Estado, p.Prioridad, p.FechaCreacion,
            a.Id AS AgenteId, a.Codigo AS AgenteCodigo, a.Nombre AS AgenteNombre
     FROM ${T.Planificaciones} p JOIN ${T.Agentes} a ON a.Id=p.AgenteId
     WHERE (@todos=1 OR p.UsuarioId=@uid)
       AND (@texto='' OR a.Nombre LIKE @like OR a.Codigo LIKE @like OR p.Titulo LIKE @like)
     ORDER BY p.FechaCreacion DESC`,
    { uid: req.usuario.id, todos: esSupervisor(req.usuario) ? 1 : 0, texto, like: `%${texto}%` }
  ));
});

router.get('/:id', async (req, res) => {
  const p = await q1(
    `SELECT p.*, a.Codigo AS AgenteCodigo, a.Nombre AS AgenteNombre FROM ${T.Planificaciones} p
     JOIN ${T.Agentes} a ON a.Id=p.AgenteId WHERE p.Id=@id`, { id: Number(req.params.id) }
  );
  if (!p) return res.status(404).json({ error: 'Planificación no encontrada' });
  res.json({ ...p, fotos: await listarAdjuntos('planificacion', p.id) });
});

// Nueva planificación (multipart: campos + fotos[]; mínimo 1 foto)
router.post('/', subidaFotos.array('fotos', 10), async (req, res) => {
  const b = req.body || {};
  if (!b.agenteId || !b.tipoVisita || !b.materiales || !b.comentario) {
    return res.status(400).json({ error: 'Complete los campos obligatorios (*)' });
  }
  if (!req.files?.length) return res.status(400).json({ error: 'Suba al menos una fotografía' });
  const agente = await q1(`SELECT Codigo FROM ${T.Agentes} WHERE Id=@id`, { id: Number(b.agenteId) });
  if (!agente) return res.status(404).json({ error: 'Agente no encontrado' });
  const ahora = ahoraLocal();
  const prefijo = { Mantenimiento: 'MANT', 'Instalación': 'INST', Hotline: 'HOT' }[b.tipoVisita] || 'PLAN';
  const p = await q1(
    `INSERT INTO ${T.Planificaciones} (AgenteId, UsuarioId, Titulo, TipoVisita, MaterialSugerido, Materiales, Prioridad, Comentario, FechaVisita, FechaCreacion)
     OUTPUT inserted.Id VALUES (@ag, @uid, @titulo, @tipo, @mat, @materiales, @prio, @com, @fv, @ahora)`,
    {
      ag: Number(b.agenteId), uid: req.usuario.id,
      titulo: `${prefijo}-BRANDING-${agente.codigo}-${ahora.slice(0, 10).replaceAll('-', '')}`,
      tipo: b.tipoVisita, mat: b.materialSugerido || null, materiales: b.materiales,
      prio: b.prioridad || 'Baja', com: b.comentario, fv: fechaValida(b.fechaVisita)?.slice(0, 10) ?? null, ahora
    }
  );
  await guardarFotos('planificacion', p.id, req.files);
  res.status(201).json({ id: p.id });
});

router.patch('/:id/estado', async (req, res) => {
  if (!esSupervisor(req.usuario)) return res.status(403).json({ error: 'No tiene permiso para cambiar el estado' });
  if (!['Pendiente', 'En Proceso', 'Completada'].includes(req.body?.estado)) return res.status(400).json({ error: 'Estado no válido' });
  await q(`UPDATE ${T.Planificaciones} SET Estado=@e WHERE Id=@id`, { e: req.body.estado, id: Number(req.params.id) });
  res.json({ ok: true });
});

export default router;
