import { useEffect, useRef, useState } from 'react';
import Icono from './Icono.jsx';
import { urlArchivo } from '../api/client.js';

/** Panel de firma electrónica. onConfirmar(dataUrlPng) */
export default function Firma({ firmaUrl, onConfirmar }) {
  const canvas = useRef(null);
  const dibujando = useRef(false);
  const [vacio, setVacio] = useState(true);
  const [confirmada, setConfirmada] = useState(Boolean(firmaUrl));
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = r.width * dpr; c.height = r.height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0f172a';
  }, [confirmada]);

  const pos = e => {
    const r = canvas.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const inicio = e => {
    e.preventDefault();
    canvas.current.setPointerCapture(e.pointerId);
    dibujando.current = true;
    const ctx = canvas.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(...pos(e));
  };
  const mover = e => {
    if (!dibujando.current) return;
    const ctx = canvas.current.getContext('2d');
    ctx.lineTo(...pos(e)); ctx.stroke();
    setVacio(false);
  };
  const fin = () => { dibujando.current = false; };

  const limpiar = () => {
    if (confirmada) { setConfirmada(false); setVacio(true); return; }
    const c = canvas.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setVacio(true);
  };
  const confirmar = async () => {
    if (vacio) return;
    setGuardando(true);
    try { await onConfirmar(canvas.current.toDataURL('image/png')); setConfirmada(true); }
    finally { setGuardando(false); }
  };

  return (
    <div className="firma">
      <div className="campo-label">Firma Electrónica</div>
      <div className="firma-area">
        {confirmada && firmaUrl
          ? <img src={urlArchivo(firmaUrl)} alt="Firma" />
          : (
            <>
              <canvas ref={canvas} onPointerDown={inicio} onPointerMove={mover} onPointerUp={fin} onPointerLeave={fin} />
              {vacio && <div className="firma-guia"><Icono nombre="firma" /><span>Firmar aquí</span></div>}
            </>
          )}
      </div>
      <div className="grid-2">
        <button type="button" className="btn btn-secundario btn-chico gris" onClick={limpiar}>Limpiar</button>
        <button type="button" className="btn btn-primario btn-chico" onClick={confirmar} disabled={vacio || confirmada || guardando}>
          {confirmada ? 'Confirmada' : guardando ? 'Guardando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}
