import { Router } from 'express';
import { q, q1, T } from '../db.js';
import { fechaValida } from '../lib/fechas.js';

const router = Router();

// Lista de agentes. ?q=texto  ?mis=1 (solo asignados al usuario)
router.get('/', async (req, res) => {
  const { q: texto = '', mis } = req.query;
  const filas = await q(
    `SELECT TOP 200 Id, Codigo, Nombre, Departamento, Municipio, Direccion, Zona, SubZona, UsuarioAsignadoId
     FROM ${T.Agentes}
     WHERE Activo=1
       AND (@texto='' OR Nombre LIKE @like OR Codigo LIKE @like)
       AND (@mis=0 OR UsuarioAsignadoId=@uid)
     ORDER BY Nombre`,
    { texto: String(texto).trim(), like: `%${String(texto).trim()}%`, mis: mis === '1' ? 1 : 0, uid: req.usuario.id }
  );
  res.json(filas);
});

router.get('/:id', async (req, res) => {
  const a = await q1(`SELECT * FROM ${T.Agentes} WHERE Id=@id`, { id: Number(req.params.id) });
  if (!a) return res.status(404).json({ error: 'Agente no encontrado' });
  res.json(a);
});

// Inventario del agente. ?familia=&marca=
router.get('/:id/inventario', async (req, res) => {
  const { familia = '', marca = '' } = req.query;
  const filas = await q(
    `SELECT Id, Prefijo, Codigo AS Activo, Familia, Marca, Serie, Estado
     FROM ${T.Activos}
     WHERE AgenteId=@id AND (@familia='' OR Familia=@familia) AND (@marca='' OR Marca=@marca)
     ORDER BY Codigo`,
    { id: Number(req.params.id), familia, marca }
  );
  res.json(filas);
});

// Historial consolidado de visitas del agente. ?desde=&hasta=&estado=
router.get('/:id/historial', async (req, res) => {
  const id = Number(req.params.id);
  const desde = fechaValida(req.query.desde);
  const hasta = fechaValida(req.query.hasta);
  const estado = String(req.query.estado || '');

  const resumen = await q1(
    `SELECT COUNT(*) AS Total,
            SUM(CASE WHEN Estado='Cerrada' THEN 1 ELSE 0 END) AS Completadas,
            SUM(CASE WHEN Estado IN ('Programada','En Proceso','Sin Programar') THEN 1 ELSE 0 END) AS Pendientes,
            SUM(CASE WHEN Estado='Cancelada' THEN 1 ELSE 0 END) AS Canceladas
     FROM ${T.Visitas} WHERE AgenteId=@id`,
    { id }
  );

  const visitas = await q(
    `SELECT v.Id, v.TipoVisita, v.Estado, v.FechaRef, v.FechaInicio, v.FechaPlanificada, v.HoraPlanificada,
            v.Razon, v.Observaciones, u.Nombre AS Visitador
     FROM ${T.Visitas} v JOIN ${T.Usuarios} u ON u.Id=v.UsuarioId
     WHERE v.AgenteId=@id
       AND (@desde IS NULL OR v.FechaRef >= @desde)
       AND (@hasta IS NULL OR v.FechaRef <= @hasta)
       AND (@estado='' OR v.Estado=@estado)
     ORDER BY v.FechaRef DESC, v.Id DESC`,
    { id, desde, hasta, estado }
  );
  res.json({ resumen, visitas });
});

export default router;
