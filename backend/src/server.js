import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config.js';
import { getPool } from './db.js';
import { requiereAuth } from './middleware/auth.js';
import { iniciarAlmacenamiento, CARPETA_UPLOADS } from './lib/storage.js';
import auth from './routes/auth.js';
import catalogos from './routes/catalogos.js';
import agentes from './routes/agentes.js';
import activos from './routes/activos.js';
import visitas from './routes/visitas.js';
import dashboard from './routes/dashboard.js';
import reportes from './routes/reportes.js';
import jornadas from './routes/jornadas.js';
import retiros from './routes/retiros.js';
import planificaciones from './routes/planificaciones.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Las fechas se guardan en hora local: se envían al frontend SIN la "Z" de UTC
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
app.set('json replacer', (k, v) => (typeof v === 'string' && ISO_UTC.test(v) ? v.slice(0, 19) : v));

app.use(cors({ origin: config.corsOrigins, credentials: false }));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', async (req, res) => {
  try {
    await (await getPool()).request().query('SELECT 1 AS ok');
    res.json({ ok: true, db: 'ok' });
  } catch (e) {
    res.status(503).json({ ok: false, db: 'error', detalle: e.message });
  }
});

// Archivos locales (solo cuando no hay Azure Blob configurado)
if (!config.blob.connectionString) app.use('/uploads', express.static(CARPETA_UPLOADS));

app.use('/api/auth', auth);
app.use('/api/catalogos', requiereAuth, catalogos);
app.use('/api/agentes', requiereAuth, agentes);
app.use('/api/activos', requiereAuth, activos);
app.use('/api/visitas', requiereAuth, visitas);
app.use('/api/dashboard', requiereAuth, dashboard);
app.use('/api/reportes', requiereAuth, reportes);
app.use('/api/jornadas', requiereAuth, jornadas);
app.use('/api/retiros', requiereAuth, retiros);
app.use('/api/planificaciones', requiereAuth, planificaciones);

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Opcional: servir el frontend compilado desde el mismo App Service (FRONTEND_DIST=../frontend/dist)
if (config.frontendDist && fs.existsSync(config.frontendDist)) {
  const dist = path.resolve(config.frontendDist);
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Manejo de errores
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Cada foto debe pesar máximo 10 MB' });
  if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: 'Máximo 10 fotos por envío' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Error interno del servidor' : err.message });
});

await iniciarAlmacenamiento().catch(e => console.error('[almacenamiento]', e.message));
app.listen(config.port, () => console.log(`VisitaPro API escuchando en el puerto ${config.port}`));
