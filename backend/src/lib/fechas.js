import { config } from '../config.js';

/** Fecha y hora actual en la zona horaria del país, formato YYYY-MM-DDTHH:mm:ss */
export function ahoraLocal() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: config.tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).map(x => [x.type, x.value])
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}

export const hoyLocal = () => ahoraLocal().slice(0, 10);

/** Acepta 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm' o 'YYYY-MM-DDTHH:mm:ss'. Devuelve null si no es válida */
export function fechaValida(v) {
  if (!v) return null;
  const m = String(v).match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2})(:\d{2})?)?/);
  if (!m) return null;
  return m[2] ? `${m[1]}T${m[2]}${m[3] || ':00'}` : m[1];
}
