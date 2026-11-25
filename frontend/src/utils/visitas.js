// Flujo de pantallas por tipo de visita (según el diseño)
export const FLUJOS = {
  'Hotline': ['hotline', 'equipo', 'cierre'],
  'Otros Soportes': ['otros', 'equipo', 'cierre'],
  'Mantenimiento Preventivo': ['preventivo'],
  'Instalación': ['instalacion'],
  'Retiro': ['retiro'],
  'Visita Comercial': ['comercial']
};

// Tipos que no crean una visita sino otra solicitud
export const TIPOS_ESPECIALES = ['Retiros de Agentes', 'Planificacion Branding'];

export function siguientePaso(tipo, pasoActual) {
  const f = FLUJOS[tipo] || [];
  const i = f.indexOf(pasoActual);
  return i >= 0 && i < f.length - 1 ? f[i + 1] : null;
}

export const primerPaso = tipo => (FLUJOS[tipo] || [])[0];

// Clase de color del estado
const COLORES = {
  'Programada': 'azul', 'Sin Programar': 'naranja', 'En Proceso': 'amarillo', 'Cerrada': 'verde', 'Cancelada': 'rojo',
  'Completada': 'verde', 'Pendiente': 'amarillo',
  'Autorización Comercial': 'amarillo', 'Saldos Pendientes': 'rojo', 'Orden Cerrada': 'verde',
  'Disponible': 'azul', 'En Bodega': 'gris'
};
export const colorEstado = e => COLORES[e] || 'gris';

// En el historial se muestran como Completada / Pendiente / Cancelada
export const estadoHistorial = e => (e === 'Cerrada' ? 'Completada' : e === 'Cancelada' ? 'Cancelada' : 'Pendiente');
