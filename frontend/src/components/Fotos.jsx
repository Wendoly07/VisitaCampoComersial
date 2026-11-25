import { useRef, useState } from 'react';
import Icono from './Icono.jsx';
import { urlArchivo } from '../api/client.js';

const MAX = 10;
const MAX_MB = 10;

/**
 * Galería de fotos con botón "Capturar Foto".
 * - fotos: [{id, url}] ya guardadas en el servidor, o [{id, url, file}] locales
 * - onAgregar(files[]) / onQuitar(foto)
 */
export default function Fotos({ fotos = [], onAgregar, onQuitar, titulo = 'Foto de la visita', minimo = 0, estilo = 'galeria' }) {
  const ref = useRef(null);
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  async function elegir(e) {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    setError('');
    if (!files.length) return;
    if (fotos.length + files.length > MAX) return setError(`Máximo ${MAX} fotos`);
    if (files.some(f => f.size > MAX_MB * 1024 * 1024)) return setError(`Cada foto debe pesar máximo ${MAX_MB} MB`);
    setSubiendo(true);
    try { await onAgregar(files); } catch (er) { setError(er.message); } finally { setSubiendo(false); }
  }

  const input = <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple hidden onChange={elegir} />;

  if (estilo === 'subir') {
    return (
      <div className="fotos">
        {input}
        {fotos.length > 0 && <Miniaturas fotos={fotos} onQuitar={onQuitar} onMas={() => ref.current.click()} />}
        {fotos.length === 0 && (
          <button type="button" className="zona-subida" onClick={() => ref.current.click()}>
            <span className="circulo"><Icono nombre="camara" /></span>
            <strong>{subiendo ? 'Subiendo...' : 'Toque para subir foto'}</strong>
            <small>Formatos soportados: JPG, PNG. Máx. 10MB</small>
          </button>
        )}
        {error && <small className="texto-error">{error}</small>}
      </div>
    );
  }

  return (
    <div className="fotos">
      {input}
      {titulo && <div className="campo-label">{titulo}{minimo > 0 && <small className="minimo"> (Mínimo {minimo} imagen requerida)</small>}</div>}
      <Miniaturas fotos={fotos} onQuitar={onQuitar} onMas={() => ref.current.click()} />
      <div className="fotos-pie"><span>{fotos.length}/{MAX} fotos</span><span>Máx. {MAX_MB}MB por foto</span></div>
      <button type="button" className="btn btn-secundario btn-chico" onClick={() => ref.current.click()} disabled={subiendo || fotos.length >= MAX}>
        <Icono nombre="camara" size={18} /> {subiendo ? 'Subiendo...' : 'Capturar Foto'}
      </button>
      {error && <small className="texto-error">{error}</small>}
    </div>
  );
}

function Miniaturas({ fotos, onQuitar, onMas }) {
  return (
    <div className="miniaturas">
      {fotos.map(f => (
        <div className="miniatura" key={f.id}>
          <img src={f.file ? f.url : urlArchivo(f.url)} alt="Foto" />
          {onQuitar && <button type="button" onClick={() => onQuitar(f)} aria-label="Quitar foto"><Icono nombre="cerrar" size={12} stroke={3} /></button>}
        </div>
      ))}
      {fotos.length < MAX && (
        <button type="button" className="miniatura agregar" onClick={onMas}><Icono nombre="mas" /><small>Agregar</small></button>
      )}
    </div>
  );
}
