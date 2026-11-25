import { useEffect, useState } from 'react';
import { Titulo, Tarjeta, Campo, Seleccion, Boton, MensajeError, Badge } from '../../components/UI.jsx';
import Icono from '../../components/Icono.jsx';
import { api } from '../../api/client.js';
import { useCatalogos } from '../../hooks/useCatalogos.js';
import { useUbicacion } from '../../hooks/useUbicacion.js';
import { useAccionesVisita } from './comun.js';
import { isoFechaHora } from '../../utils/formato.js';

const MODOS = {
  equipo: { titulo: 'Cambio de Equipo', opciones: ['Ninguno', 'Retirar Equipo', 'Agregar Equipo', 'Cambio'] },
  instalacion: { titulo: 'Instalación', opciones: ['Instalar Equipo'] },
  retiro: { titulo: 'Retiro', opciones: ['Retiro Equipo'] }
};
const USA_SALE = ['Retirar Equipo', 'Retiro Equipo', 'Cambio'];
const USA_ENTRA = ['Agregar Equipo', 'Instalar Equipo', 'Cambio'];

/** Cambio de equipo / Instalación / Retiro: registra movimientos de activos */
export default function PasoEquipo({ visita, setVisita, paso, modo }) {
  const cfg = MODOS[modo];
  const { lista } = useCatalogos();
  const ubic = useUbicacion(modo !== 'equipo');
  const [tipo, setTipo] = useState(cfg.opciones.length === 1 ? cfg.opciones[0] : 'Ninguno');
  const [m, setM] = useState({ prefijoSale: '', activoSaleId: '', prefijoEntra: '', activoEntraId: '' });
  const [sale, setSale] = useState([]);
  const [entra, setEntra] = useState([]);
  const [guardandoMov, setGuardandoMov] = useState(false);
  const acc = useAccionesVisita(visita, setVisita, paso);
  const usaSale = USA_SALE.includes(tipo);
  const usaEntra = USA_ENTRA.includes(tipo);

  useEffect(() => {
    if (!usaSale) return setSale([]);
    api(`/activos?tipo=sale&agenteId=${visita.agenteId}&prefijo=${encodeURIComponent(m.prefijoSale)}`).then(setSale).catch(() => setSale([]));
  }, [usaSale, m.prefijoSale, visita.agenteId, visita.movimientos]);
  useEffect(() => {
    if (!usaEntra) return setEntra([]);
    api(`/activos?tipo=entra&prefijo=${encodeURIComponent(m.prefijoEntra)}`).then(setEntra).catch(() => setEntra([]));
  }, [usaEntra, m.prefijoEntra, visita.movimientos]);

  const c = (k, v) => setM(x => ({ ...x, [k]: v }));
  const usados = new Set(visita.movimientos.flatMap(x => [x.activoSaleId, x.activoEntraId]).filter(Boolean));

  async function guardarMovimiento() {
    acc.setError(null);
    if (tipo === 'Ninguno') return acc.setError(new Error('Seleccione el cambio de equipo a realizar'));
    setGuardandoMov(true);
    try {
      const movimientos = await api(`/visitas/${visita.id}/movimientos`, {
        method: 'POST',
        body: { tipoMovimiento: tipo, ...m, activoSaleId: Number(m.activoSaleId) || null, activoEntraId: Number(m.activoEntraId) || null }
      });
      setVisita({ ...visita, movimientos });
      setM({ prefijoSale: '', activoSaleId: '', prefijoEntra: '', activoEntraId: '' });
    } catch (e) { acc.setError(e); } finally { setGuardandoMov(false); }
  }

  async function quitar(mov) {
    try {
      const movimientos = await api(`/visitas/${visita.id}/movimientos/${mov.id}`, { method: 'DELETE' });
      setVisita({ ...visita, movimientos });
    } catch (e) { acc.setError(e); }
  }

  function finalizar() {
    if (!visita.movimientos.length) return acc.setError(new Error('Guarde al menos un movimiento de equipo'));
    acc.finalizar(null, { latitud: ubic.lat, longitud: ubic.lon, fechaFin: isoFechaHora(new Date()) });
  }

  const opcionesActivo = arr => arr.filter(a => !usados.has(a.id)).map(a => ({ value: String(a.id), label: `${a.codigo} · ${a.marca || ''}` }));

  return (
    <>
      <Titulo titulo={cfg.titulo} subtitulo="Gestione y documente los movimientos de activos durante la visita." />
      <Tarjeta>
        <div className="campo-label verde fuerte">Cambio de equipo a realizar:</div>
        <div className="radios">
          {cfg.opciones.map(o => (
            <label key={o} className={`radio ${tipo === o ? 'activo' : ''}`}>
              <input type="radio" name="tipo" checked={tipo === o} onChange={() => setTipo(o)} /> <span>{o}</span>
            </label>
          ))}
        </div>
        <div className="grid-2">
          <Campo label="Prefijo"><Seleccion placeholder="PFX" opciones={lista('Prefijo')} value={m.prefijoSale} onChange={v => c('prefijoSale', v)} disabled={!usaSale} /></Campo>
          <Campo label="Activo Sale"><Seleccion opciones={opcionesActivo(sale)} value={m.activoSaleId} onChange={v => c('activoSaleId', v)} disabled={!usaSale} /></Campo>
          <Campo label="Prefijo"><Seleccion placeholder="PFX" opciones={lista('Prefijo')} value={m.prefijoEntra} onChange={v => c('prefijoEntra', v)} disabled={!usaEntra} /></Campo>
          <Campo label="Activo Entra"><Seleccion opciones={opcionesActivo(entra)} value={m.activoEntraId} onChange={v => c('activoEntraId', v)} disabled={!usaEntra} /></Campo>
        </div>
        <Boton variante="secundario" className="btn-chico" cargando={guardandoMov} onClick={guardarMovimiento} disabled={tipo === 'Ninguno'}>Guardar Movimiento</Boton>
      </Tarjeta>

      <h3 className="seccion">Movimientos Guardados</h3>
      {!visita.movimientos.length && <p className="gris centro">Aún no hay movimientos.</p>}
      {visita.movimientos.map(mv => (
        <Tarjeta key={mv.id} className="movimiento">
          <div>
            <div className="fila"><Badge estado={USA_ENTRA.includes(mv.tipoMovimiento) && !mv.activoSale ? 'Cerrada' : 'Cancelada'}>{mv.tipoMovimiento}</Badge>
              <small className="gris">{mv.prefijoSale || mv.prefijoEntra}</small></div>
            {mv.activoSale && <div><b>Sale:</b> {mv.activoSale}</div>}
            {mv.activoEntra && <div><b>Entra:</b> {mv.activoEntra}</div>}
          </div>
          <button className="btn-borrar" onClick={() => quitar(mv)} aria-label="Eliminar movimiento"><Icono nombre="basura" size={16} /></button>
        </Tarjeta>
      ))}
      <MensajeError error={acc.error} />
      <div className="acciones">
        {modo === 'equipo' ? (
          <Boton cargando={acc.ocupado === 'siguiente'} onClick={() => acc.siguiente({ detalle: { equipoRevisado: true } })}>Siguiente</Boton>
        ) : (
          <>
            <Boton variante="secundario" cargando={acc.ocupado === 'guardar'} onClick={() => acc.guardar({ latitud: ubic.lat, longitud: ubic.lon })}>Guardar</Boton>
            <Boton cargando={acc.ocupado === 'finalizar'} onClick={finalizar}>Finalizar Visita</Boton>
          </>
        )}
      </div>
    </>
  );
}
