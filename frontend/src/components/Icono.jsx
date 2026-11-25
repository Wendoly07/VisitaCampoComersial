// Íconos SVG (estilo trazo, 24x24)
const P = {
  inicio: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>,
  agentes: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M17.5 14.5c2.2.3 3.6 1.9 4 4.5" /></>,
  visitas: <><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /><path d="m9 15 2 2 4-4" /></>,
  perfil: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  atras: <><path d="M19 12H5M11 18l-6-6 6-6" /></>,
  buscar: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  calendario: <><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>,
  ubicacion: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  ojo: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  ojoNo: <><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  correo: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  candado: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></>,
  derecha: <><path d="m9 6 6 6-6 6" /></>,
  izquierda: <><path d="m15 6-6 6 6 6" /></>,
  abajo: <><path d="m6 9 6 6 6-6" /></>,
  lista: <><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></>,
  caja: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5M12 13v8" /></>,
  historial: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  mas: <><path d="M12 5v14M5 12h14" /></>,
  basura: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  lapiz: <><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="m14 6 4 4" /></>,
  camara: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><path d="m5 12 5 5 9-10" /></>,
  checkCirculo: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  alerta: <><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17h.01" /></>,
  progreso: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></>,
  soporte: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></>,
  herramienta: <><path d="M14.7 6.3a4 4 0 0 0 5 5L22 14l-8 8-2.3-2.3a4 4 0 0 0-5-5L2 10l8-8z" /></>,
  instalar: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 21h16" /></>,
  retiro: <><path d="M12 21V9M7 14l5-5 5 5" /><path d="M4 3h16" /></>,
  carpeta: <><path d="M3 6h7l2 2h9v11H3z" /></>,
  documento: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></>,
  grafico: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  objetivo: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  salir: <><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></>,
  filtro: <><path d="M3 5h18l-7 8v6l-4 2v-8z" /></>,
  cerrar: <><path d="M6 6l12 12M18 6 6 18" /></>,
  firma: <><path d="M4 20h16" /><path d="M14 4l4 4-9 9H5v-4z" /></>,
  estrella: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" /></>,
  sync: <><path d="M20 12a8 8 0 0 0-14-5.3L4 9M4 12a8 8 0 0 0 14 5.3L20 15" /><path d="M4 4v5h5M20 20v-5h-5" /></>,
  gps: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" /></>,
  escudo: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></>
};

export default function Icono({ nombre, size = 20, className = '', stroke = 2 }) {
  return (
    <svg className={`icono ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[nombre] || P.documento}
    </svg>
  );
}

// Logo de VisitaPro (pin dentro de escudo)
export function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#0d9488" />
      <path d="M32 14c-7.2 0-13 5.6-13 12.6C19 36 32 50 32 50s13-14 13-23.4C45 19.6 39.2 14 32 14z" fill="#fff" />
      <circle cx="32" cy="27" r="5" fill="#0d9488" />
    </svg>
  );
}
