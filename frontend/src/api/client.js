// Cliente HTTP del API de VisitaPro
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const CLAVE_TOKEN = 'vp_token';
const CLAVE_COLA = 'vp_cola_sync';
let token = localStorage.getItem(CLAVE_TOKEN);

export class ApiError extends Error {
  constructor(mensaje, status) { super(mensaje); this.status = status; }
}

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem(CLAVE_TOKEN, t);
  else localStorage.removeItem(CLAVE_TOKEN);
}
export const getToken = () => token;

export async function api(ruta, { method = 'GET', body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  let res;
  try {
    res = await fetch(`${API_URL}/api${ruta}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('Sin conexión con el servidor', 0);
  }
  if (res.status === 401 && token && !ruta.startsWith('/auth/login')) {
    setToken(null);
    window.dispatchEvent(new Event('vp:logout'));
  }
  const data = (res.headers.get('content-type') || '').includes('json') ? await res.json() : null;
  if (!res.ok) throw new ApiError(data?.error || `Error ${res.status}`, res.status);
  return data;
}

// URL absoluta de archivos (fotos locales en desarrollo o SAS de Azure Blob)
export const urlArchivo = u => (!u ? '' : /^https?:/.test(u) ? u : `${API_URL}${u}`);

/* ---------- Cola de sincronización (sin conexión) ----------
   Las operaciones JSON de las visitas (guardar pasos, finalizar) se
   encolan si no hay internet y se envían al recuperar la conexión. */
export const leerCola = () => JSON.parse(localStorage.getItem(CLAVE_COLA) || '[]');
const guardarCola = c => {
  localStorage.setItem(CLAVE_COLA, JSON.stringify(c));
  window.dispatchEvent(new Event('vp:cola'));
};

export async function apiSincronizable(ruta, opciones, visitaId) {
  try {
    return await api(ruta, opciones);
  } catch (e) {
    if (e.status !== 0) throw e;
    guardarCola([...leerCola(), { ruta, opciones, visitaId, fecha: Date.now() }]);
    return { encolado: true };
  }
}

let sincronizando = false;
export async function sincronizarCola() {
  if (sincronizando || !navigator.onLine || !token) return;
  sincronizando = true;
  try {
    let cola = leerCola();
    while (cola.length) {
      const [op, ...resto] = cola;
      try {
        await api(op.ruta, op.opciones);
      } catch (e) {
        if (e.status === 0) break;              // sigue sin conexión
        console.warn('Operación descartada:', op.ruta, e.message); // error de negocio: se descarta
      }
      cola = resto;
      guardarCola(cola);
    }
  } finally {
    sincronizando = false;
  }
}

export const visitaPendiente = id => leerCola().some(op => String(op.visitaId) === String(id));

window.addEventListener('online', sincronizarCola);
