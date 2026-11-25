import { Router } from 'express';
import { q, T } from '../db.js';

const router = Router();

// Devuelve todos los catálogos agrupados: { TipoVisita: [{valor, padre}], ... }
router.get('/', async (req, res) => {
  const filas = await q(`SELECT Grupo, Valor, Padre FROM ${T.Catalogos} WHERE Activo=1 ORDER BY Grupo, Orden, Valor`);
  const out = {};
  for (const f of filas) (out[f.grupo] ||= []).push({ valor: f.valor, padre: f.padre });
  // Filtros de inventario a partir de los activos existentes
  const fam = await q(`SELECT DISTINCT Familia FROM ${T.Activos} WHERE Familia IS NOT NULL`);
  const mar = await q(`SELECT DISTINCT Marca FROM ${T.Activos} WHERE Marca IS NOT NULL`);
  const pre = await q(`SELECT DISTINCT Prefijo FROM ${T.Activos}`);
  out.Familia = fam.map(f => ({ valor: f.familia }));
  out.Marca = mar.map(f => ({ valor: f.marca }));
  out.Prefijo = pre.map(f => ({ valor: f.prefijo }));
  res.json(out);
});

export default router;
