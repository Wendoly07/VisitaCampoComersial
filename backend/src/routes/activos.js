import { Router } from 'express';
import { q } from '../db.js';
import { T } from '../db.js';

const router = Router();

// Activos para los selectores de "Activo Sale" (del agente) y "Activo Entra" (en bodega)
// ?prefijo=PFX&agenteId=1&tipo=sale|entra
router.get('/', async (req, res) => {
  const { prefijo = '', agenteId, tipo = 'entra' } = req.query;
  const filas = tipo === 'sale'
    ? await q(
      `SELECT Id, Prefijo, Codigo, Familia, Marca, Serie FROM ${T.Activos}
       WHERE AgenteId=@agente AND (@prefijo='' OR Prefijo=@prefijo) ORDER BY Codigo`,
      { agente: Number(agenteId) || 0, prefijo }
    )
    : await q(
      `SELECT Id, Prefijo, Codigo, Familia, Marca, Serie FROM ${T.Activos}
       WHERE AgenteId IS NULL AND Estado='En Bodega' AND (@prefijo='' OR Prefijo=@prefijo) ORDER BY Codigo`,
      { prefijo }
    );
  res.json(filas);
});

export default router;
