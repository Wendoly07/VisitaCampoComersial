import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { q1, T } from '../db.js';
import { config } from '../config.js';
import { firmarToken, requiereAuth } from '../middleware/auth.js';

const router = Router();

const publico = u => ({ id: u.id, nombre: u.nombre, correo: u.correo, usuario: u.usuario, rol: u.rol, zona: u.zona, telefono: u.telefono });
const sesion = u => ({ token: firmarToken(u), usuario: publico(u) });

// Configuración pública para el frontend (si el inicio con Microsoft está habilitado)
router.get('/config', (req, res) => {
  res.json({ microsoft: config.ms.enabled ? { clientId: config.ms.clientId, tenantId: config.ms.tenantId } : null });
});

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body || {};
  if (!usuario || !password) return res.status(400).json({ error: 'Ingrese su usuario y contraseña' });
  const u = await q1(
    `SELECT TOP 1 * FROM ${T.Usuarios} WHERE (Correo=@u OR Usuario=@u) AND Activo=1`,
    { u: String(usuario).trim().toLowerCase() }
  );
  if (!u || !u.passwordHash || !(await bcrypt.compare(String(password), u.passwordHash))) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  res.json(sesion(u));
});

// Inicio de sesión con Microsoft Entra ID: el frontend envía el id_token obtenido con MSAL
let jwks = null;
router.post('/microsoft', async (req, res) => {
  if (!config.ms.enabled) return res.status(400).json({ error: 'El inicio con Microsoft no está habilitado' });
  const { idToken } = req.body || {};
  if (!idToken) return res.status(400).json({ error: 'Token de Microsoft requerido' });
  jwks ||= createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${config.ms.tenantId}/discovery/v2.0/keys`));
  let payload;
  try {
    ({ payload } = await jwtVerify(idToken, jwks, {
      audience: config.ms.clientId,
      issuer: `https://login.microsoftonline.com/${config.ms.tenantId}/v2.0`
    }));
  } catch {
    return res.status(401).json({ error: 'No se pudo validar la cuenta de Microsoft' });
  }
  const correo = String(payload.preferred_username || payload.email || '').toLowerCase();
  let u = await q1(`SELECT TOP 1 * FROM ${T.Usuarios} WHERE Correo=@c`, { c: correo });
  if (!u && config.ms.autoCrear) {
    u = await q1(
      `INSERT INTO ${T.Usuarios} (Nombre, Correo, Rol) OUTPUT inserted.* VALUES (@n, @c, 'visitador')`,
      { n: payload.name || correo, c: correo }
    );
  }
  if (!u || !u.activo) return res.status(403).json({ error: 'Su cuenta no tiene acceso a VisitaPro. Contacte al administrador.' });
  res.json(sesion(u));
});

router.get('/me', requiereAuth, async (req, res) => {
  const u = await q1(`SELECT * FROM ${T.Usuarios} WHERE Id=@id AND Activo=1`, { id: req.usuario.id });
  if (!u) return res.status(401).json({ error: 'Usuario no encontrado' });
  res.json(publico(u));
});

router.post('/cambiar-password', requiereAuth, async (req, res) => {
  const { actual, nueva } = req.body || {};
  if (!nueva || String(nueva).length < 8) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
  const u = await q1(`SELECT * FROM ${T.Usuarios} WHERE Id=@id`, { id: req.usuario.id });
  if (u.passwordHash && !(await bcrypt.compare(String(actual || ''), u.passwordHash))) {
    return res.status(400).json({ error: 'La contraseña actual no es correcta' });
  }
  await q1(`UPDATE ${T.Usuarios} SET PasswordHash=@h WHERE Id=@id`, { h: await bcrypt.hash(String(nueva), 10), id: u.id });
  res.json({ ok: true });
});

export default router;
