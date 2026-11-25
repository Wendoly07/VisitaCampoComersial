import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function firmarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    config.jwtSecret,
    { expiresIn: config.jwtExpires }
  );
}

export function requiereAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sesión requerida' });
  try {
    const p = jwt.verify(token, config.jwtSecret);
    req.usuario = { id: Number(p.sub), nombre: p.nombre, correo: p.correo, rol: p.rol };
    next();
  } catch {
    res.status(401).json({ error: 'Sesión expirada. Inicie sesión de nuevo.' });
  }
}

export const esSupervisor = u => ['supervisor', 'admin'].includes(u?.rol);

export function requiereRol(...roles) {
  return (req, res, next) => roles.includes(req.usuario?.rol)
    ? next()
    : res.status(403).json({ error: 'No tiene permiso para esta acción' });
}
