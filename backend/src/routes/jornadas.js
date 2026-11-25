import { Router } from 'express';
import { q, q1, T } from '../db.js';
import { ahoraLocal, hoyLocal, fechaValida } from '../lib/fechas.js';

const router = Router();

// Jornada de hoy del usuario (si ya registró inicio de labores)
router.get('/hoy', async (req, res) => {
  const j = await q1(
    `SELECT TOP 1 * FROM ${T.JornadasLaborales}
     WHERE UsuarioId=@uid AND CAST(FechaInicio AS DATE)=@hoy ORDER BY FechaInicio`,
    { uid: req.usuario.id, hoy: hoyLocal() }
  );
  res.json(j);
});

router.post('/', async (req, res) => {
  const { fechaInicio, departamento, municipio, latitud, longitud } = req.body || {};
  if (!departamento || !municipio) return res.status(400).json({ error: 'Seleccione departamento y municipio' });
  const hoy = hoyLocal();
  const existe = await q1(
    `SELECT TOP 1 Id FROM ${T.JornadasLaborales} WHERE UsuarioId=@uid AND CAST(FechaInicio AS DATE)=@hoy`,
    { uid: req.usuario.id, hoy }
  );
  if (existe) return res.status(400).json({ error: 'Ya registró el inicio de labores de hoy' });
  const j = await q1(
    `INSERT INTO ${T.JornadasLaborales} (UsuarioId, FechaInicio, Departamento, Municipio, Latitud, Longitud)
     OUTPUT inserted.* VALUES (@uid, @fecha, @dep, @mun, @lat, @lon)`,
    {
      uid: req.usuario.id, fecha: fechaValida(fechaInicio) || ahoraLocal(), dep: departamento, mun: municipio,
      lat: Number(latitud) || null, lon: Number(longitud) || null
    }
  );
  res.status(201).json(j);
});

router.get('/', async (req, res) => {
  res.json(await q(
    `SELECT TOP 60 * FROM ${T.JornadasLaborales} WHERE UsuarioId=@uid ORDER BY FechaInicio DESC`,
    { uid: req.usuario.id }
  ));
});

export default router;
