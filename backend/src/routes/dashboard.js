import { Router } from 'express';
import { q, q1, T } from '../db.js';
import { fechaValida } from '../lib/fechas.js';
import { esSupervisor } from '../middleware/auth.js';

const router = Router();

// Pantalla de Inicio: contadores por estado y últimas visitas. ?desde=&hasta=
router.get('/', async (req, res) => {
  const p = {
    uid: req.usuario.id,
    todos: esSupervisor(req.usuario) && req.query.todos === '1' ? 1 : 0,
    desde: fechaValida(req.query.desde),
    hasta: fechaValida(req.query.hasta)
  };
  const filtro = `(@todos=1 OR v.UsuarioId=@uid)
    AND (@desde IS NULL OR v.FechaRef >= @desde) AND (@hasta IS NULL OR v.FechaRef <= @hasta)`;
  const conteos = await q1(
    `SELECT SUM(CASE WHEN Estado='Programada' THEN 1 ELSE 0 END) AS Programadas,
            SUM(CASE WHEN Estado='Sin Programar' THEN 1 ELSE 0 END) AS SinProgramar,
            SUM(CASE WHEN Estado='En Proceso' THEN 1 ELSE 0 END) AS EnProceso,
            SUM(CASE WHEN Estado='Cerrada' THEN 1 ELSE 0 END) AS Cerradas
     FROM ${T.Visitas} v WHERE ${filtro}`, p
  );
  const ultimas = await q(
    `SELECT TOP 5 v.Id, v.TipoVisita, v.Estado, v.FechaRef, a.Nombre AS AgenteNombre, a.Direccion, a.Municipio
     FROM ${T.Visitas} v JOIN ${T.Agentes} a ON a.Id=v.AgenteId
     WHERE ${filtro} ORDER BY v.FechaRef DESC, v.Id DESC`, p
  );
  for (const k of Object.keys(conteos)) conteos[k] ||= 0;
  res.json({ conteos, ultimas });
});

export default router;
