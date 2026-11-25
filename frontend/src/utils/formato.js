// Utilidades de fechas. Las fechas del API vienen en hora local, sin zona: 'YYYY-MM-DDTHH:mm:ss'
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_C = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const p2 = n => String(n).padStart(2, '0');

export function aFecha(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
}

/** 2026-08-11 -> 11/08/2026 */
export const fmtFecha = v => { const d = aFecha(v); return d ? `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}` : '—'; };

/** Hora 12h: 09:30 AM. Acepta fecha completa o '1970-01-01T09:30:00' (columnas TIME) */
export function fmtHora(v) {
  const d = aFecha(v);
  if (!d) return '';
  const h = d.getHours();
  return `${p2(h % 12 || 12)}:${p2(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
}

export const fmtFechaHora = v => (aFecha(v) ? `${fmtFecha(v)} ${fmtHora(v)}` : '—');

/** 13 Ago 2026 · 10:30 AM */
export const fmtCorto = v => { const d = aFecha(v); return d ? `${p2(d.getDate())} ${MESES_C[d.getMonth()]} ${d.getFullYear()}` : '—'; };

/** 18 de agosto de 2026 3:35 PM */
export function fmtLargo(v) {
  const d = aFecha(v);
  if (!d) return '—';
  return `${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()} de ${d.getFullYear()} ${fmtHora(v).replace(/^0/, '')}`;
}

/** Lunes 11 de Agosto */
export const fmtDia = v => { const d = aFecha(v); return d ? `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}` : ''; };

export const nombreMes = m => MESES[m - 1];
export const mesCorto = m => MESES_C[m];

/** Date -> 'YYYY-MM-DD' (local) */
export const isoFecha = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
/** Date -> 'YYYY-MM-DDTHH:mm' (local, para input datetime-local) */
export const isoFechaHora = d => `${isoFecha(d)}T${p2(d.getHours())}:${p2(d.getMinutes())}`;

export const iniciales = nombre => (nombre || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();

export function inicioSemana(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dia = (x.getDay() + 6) % 7; // lunes = 0
  x.setDate(x.getDate() - dia);
  return x;
}
export const sumarDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
