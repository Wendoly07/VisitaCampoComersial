import Icono from './Icono.jsx';

/** Bloque de latitud/longitud (automático por GPS) */
export default function Ubicacion({ ubicacion, estilo = 'campos' }) {
  const { lat, lon, error, cargando, obtener } = ubicacion;
  if (estilo === 'linea') {
    return (
      <div>
        <div className="campo-label">Coordenadas de ubicación (Automático)</div>
        <div className="gps-linea">
          <Icono nombre="ubicacion" size={18} />
          <span>{lat != null ? `Lat: ${lat} • Lon: ${lon}` : cargando ? 'Obteniendo ubicación...' : (error || 'Sin ubicación')}</span>
          {lat != null ? <span className="pill-ok">GPS OK</span> : <button type="button" className="link" onClick={obtener}>Reintentar</button>}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="campo-label fuerte">Ubicación</div>
      <div className="grid-2">
        <label className="campo"><span className="campo-label">Latitud</span>
          <div className="entrada solo-lectura"><input readOnly value={lat ?? ''} placeholder={cargando ? 'Obteniendo...' : '—'} /></div></label>
        <label className="campo"><span className="campo-label">Longitud</span>
          <div className="entrada solo-lectura"><input readOnly value={lon ?? ''} placeholder={cargando ? 'Obteniendo...' : '—'} /></div></label>
      </div>
      {error && <small className="texto-error">{error}. <button type="button" className="link" onClick={obtener}>Reintentar</button></small>}
    </div>
  );
}
