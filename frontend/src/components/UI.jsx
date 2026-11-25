import Icono from './Icono.jsx';
import { colorEstado } from '../utils/visitas.js';
import { iniciales } from '../utils/formato.js';

export function Titulo({ titulo, subtitulo, children }) {
  return (
    <div className="titulo-pagina">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}

export const Tarjeta = ({ className = '', children, ...p }) => <div className={`tarjeta ${className}`} {...p}>{children}</div>;

export function Badge({ estado, children }) {
  return <span className={`badge badge-${colorEstado(estado)}`}>{children || estado}</span>;
}

export const Avatar = ({ nombre }) => <span className="avatar">{iniciales(nombre)}</span>;

export function Campo({ label, requerido, children, ayuda, className = '' }) {
  return (
    <label className={`campo ${className}`}>
      {label && <span className="campo-label">{requerido && <i className="req">* </i>}{label}</span>}
      {children}
      {ayuda && <small className="ayuda">{ayuda}</small>}
    </label>
  );
}

export function Entrada({ icono, ...p }) {
  return (
    <div className={`entrada ${p.readOnly ? 'solo-lectura' : ''}`}>
      {icono && <Icono nombre={icono} size={18} />}
      <input {...p} />
    </div>
  );
}

export function Seleccion({ opciones = [], placeholder = 'Seleccione', icono, value, onChange, disabled, ...p }) {
  return (
    <div className={`entrada seleccion ${disabled ? 'deshabilitada' : ''}`}>
      {icono && <Icono nombre={icono} size={18} />}
      <select value={value ?? ''} onChange={e => onChange?.(e.target.value)} disabled={disabled} {...p}>
        <option value="">{placeholder}</option>
        {opciones.map(o => (typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
      <Icono nombre="abajo" size={16} className="flecha" />
    </div>
  );
}

export const AreaTexto = p => <textarea className="area" rows={4} {...p} />;

export function Boton({ variante = 'primario', cargando, children, className = '', ...p }) {
  return (
    <button {...p} className={`btn btn-${variante} ${className}`} disabled={cargando || p.disabled}>
      {cargando ? <span className="spinner" /> : children}
    </button>
  );
}

export function Buscador({ value, onChange, placeholder = 'Buscar agente...' }) {
  return (
    <div className="entrada buscador">
      <Icono nombre="buscar" size={18} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type="search" />
    </div>
  );
}

export function Segmentado({ opciones, valor, onChange }) {
  return (
    <div className="segmentado">
      {opciones.map(([v, t]) => (
        <button key={v} type="button" className={valor === v ? 'activo' : ''} onClick={() => onChange(v)}>{t}</button>
      ))}
    </div>
  );
}

export function Interruptor({ checked, onChange, etiqueta }) {
  return (
    <button type="button" className={`interruptor-campo`} onClick={() => onChange(!checked)}>
      <span>{etiqueta}</span>
      <span className={`switch ${checked ? 'on' : ''}`}><span /></span>
    </button>
  );
}

export function Vacio({ texto = 'No hay registros', icono = 'documento' }) {
  return <div className="vacio"><Icono nombre={icono} size={32} /><p>{texto}</p></div>;
}

export function MensajeError({ error }) {
  if (!error) return null;
  return <div className="alerta-error"><Icono nombre="alerta" size={18} /> {error.message || String(error)}</div>;
}

export function RangoFechas({ desde, hasta, onDesde, onHasta }) {
  return (
    <div className="rango">
      <label className="entrada mini"><Icono nombre="calendario" size={16} /><span>Desde:</span>
        <input type="date" value={desde} onChange={e => onDesde(e.target.value)} /></label>
      <label className="entrada mini"><Icono nombre="calendario" size={16} /><span>Hasta:</span>
        <input type="date" value={hasta} onChange={e => onHasta(e.target.value)} /></label>
    </div>
  );
}

export function FAB({ onClick, icono = 'mas', etiqueta }) {
  return <button className="fab" onClick={onClick} aria-label={etiqueta}><Icono nombre={icono} size={24} stroke={2.4} /></button>;
}

export function Dato({ label, valor, ancho }) {
  return (
    <div className={`dato ${ancho ? 'ancho' : ''}`}>
      <span>{label}</span>
      <strong>{valor ?? '—'}</strong>
    </div>
  );
}
