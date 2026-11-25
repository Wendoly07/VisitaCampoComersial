import { Router } from 'express';
import { q, q1, T } from '../db.js';
import { hoyLocal } from '../lib/fechas.js';
import { esSupervisor } from '../middleware/auth.js';

const router = Router();

const CATEGORIAS = ['Hotline', 'Mantenimiento Preventivo', 'Instalación', 'Retiro', 'Otros Soportes'];

// Reporte mensual. ?anio=2026&mes=8
router.get('/mensual', async (req, res) => {
  const hoy = hoyLocal();
  const anio = Number(req.query.anio) || Number(hoy.slice(0, 4));
  const mes = Number(req.query.mes) || Number(hoy.slice(5, 7));
  const desde = `${anio}-${String(mes).padStart(2, '0')}-01`;
  const p = { uid: req.usuario.id, todos: esSupervisor(req.usuario) ? 1 : 0, desde };
  const filtro = `(@todos=1 OR v.UsuarioId=@uid) AND v.FechaRef >= @desde AND v.FechaRef < DATEADD(MONTH, 1, CAST(@desde AS DATE))`;

  const porTipo = await q(
    `SELECT v.TipoVisita, COUNT(*) AS Total,
            SUM(CASE WHEN v.Estado='Cerrada' THEN DATEDIFF(MINUTE, v.FechaInicio, v.FechaFin) ELSE 0 END) AS Minutos
     FROM ${T.Visitas} v WHERE ${filtro} AND v.Estado<>'Cancelada' GROUP BY v.TipoVisita`, p
  );
  const g = await q1(
    `SELECT SUM(CASE WHEN Estado IN ('Sin Programar','Programada','En Proceso') THEN 1 ELSE 0 END) AS Abiertos,
            SUM(CASE WHEN Estado='Cerrada' THEN 1 ELSE 0 END) AS Cerrados,
            SUM(CASE WHEN Planificada=0 AND Estado<>'Cancelada' THEN 1 ELSE 0 END) AS SinPlanificar,
            SUM(CASE WHEN Planificada=1 AND Estado<>'Cancelada' THEN 1 ELSE 0 END) AS Planificados
     FROM ${T.Visitas} v WHERE ${filtro}`, p
  );
  const asignados = await q1(
    `SELECT COUNT(*) AS N FROM ${T.Agentes} WHERE Activo=1 AND (@todos=1 OR UsuarioAsignadoId=@uid)`, p
  );
  const visitados = await q1(
    `SELECT COUNT(DISTINCT CASE WHEN (@todos=1 OR a.UsuarioAsignadoId=@uid) THEN a.Id END) AS Propios,
            COUNT(DISTINCT CASE WHEN NOT (@todos=1 OR a.UsuarioAsignadoId=@uid) OR a.UsuarioAsignadoId IS NULL THEN a.Id END) AS Apoyo
     FROM ${T.Visitas} v JOIN ${T.Agentes} a ON a.Id=v.AgenteId
     WHERE ${filtro} AND v.Estado='Cerrada'`, p
  );

  const mapa = Object.fromEntries(porTipo.map(r => [r.tipoVisita, r]));
  const categorias = CATEGORIAS.map(c => ({
    categoria: c,
    total: mapa[c]?.total || 0,
    horas: Math.round(((mapa[c]?.minutos || 0) / 60) * 10) / 10
  }));
  const nAsignados = asignados.n || 0;
  const nVisitados = visitados.propios || 0;
  res.json({
    anio, mes,
    totales: {
      abiertos: g.abiertos || 0, cerrados: g.cerrados || 0,
      planificados: g.planificados || 0, sinPlanificar: g.sinPlanificar || 0
    },
    categorias,
    horasTotales: Math.round(categorias.reduce((s, c) => s + c.horas, 0) * 10) / 10,
    productividad: {
      agentesAsignados: nAsignados,
      agentesVisitados: nVisitados,
      cobertura: nAsignados ? Math.round((nVisitados / nAsignados) * 1000) / 10 : 0,
      trabajosEjecutados: g.cerrados || 0,
      propios: nVisitados,
      apoyoOtrasZonas: visitados.apoyo || 0
    }
  });
});

export default router;
