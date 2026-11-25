import { useState } from 'react';
import { Titulo, Tarjeta, Campo, Seleccion, Interruptor, Boton, MensajeError } from '../../components/UI.jsx';
import Icono from '../../components/Icono.jsx';
import { useCatalogos } from '../../hooks/useCatalogos.js';
import { useAccionesVisita } from './comun.js';
import { isoFecha } from '../../utils/formato.js';

/** Hotline / Otros Soportes: caso, problema, solución, estado, fecha y hora */
export default function PasoSoporte({ visita, setVisita, paso, titulo }) {
  const { lista } = useCatalogos();
  const previo = visita.detalle?.soporte || {};
  const ahora = new Date();
  const [d, setD] = useState({
    caso: previo.caso || (paso === 'otros' ? 'Otros' : ''),
    problema: previo.problema || '',
    solucion: previo.solucion || '',
    cerrado: previo.cerrado ?? true,
    fecha: previo.fecha || (visita.fechaInicio || isoFecha(ahora)).slice(0, 10),
    hora: previo.hora || String(ahora.getHours()).padStart(2, '0'),
    minuto: previo.minuto || String(ahora.getMinutes()).padStart(2, '0')
  });
  const { siguiente, ocupado, error, setError } = useAccionesVisita(visita, setVisita, paso);
  const c = (k, v) => setD(x => ({ ...x, [k]: v }));

  function continuar() {
    if (!d.caso || !d.problema || !d.solucion) return setError(new Error('Complete caso, problema y solución'));
    siguiente({ detalle: { soporte: d }, razon: d.caso, subRazon: d.problema });
  }

  const problemas = lista('Problema', d.caso);
  return (
    <>
      <Titulo titulo={titulo} subtitulo="Asistencia de soporte en campo y registro de problemas." />
      <Tarjeta className="grid-2">
        <Campo label="Caso de Soporte"><Seleccion opciones={lista('CasoSoporte')} value={d.caso} onChange={v => setD(x => ({ ...x, caso: v, problema: '' }))} /></Campo>
        <Campo label="Problema"><Seleccion opciones={problemas.length ? problemas : lista('Problema')} value={d.problema} onChange={v => c('problema', v)} /></Campo>
        <Campo label="Solución"><Seleccion opciones={lista('Solucion')} value={d.solucion} onChange={v => c('solucion', v)} /></Campo>
        <Campo label="Estado"><Interruptor etiqueta={d.cerrado ? 'Cerrado' : 'Abierto'} checked={d.cerrado} onChange={v => c('cerrado', v)} /></Campo>
        <Campo label="Fecha Inicio">
          <div className="entrada"><Icono nombre="calendario" size={16} /><input type="date" value={d.fecha} onChange={e => c('fecha', e.target.value)} /></div>
        </Campo>
        <Campo label="Hora">
          <div className="hora-doble">
            <input className="entrada-mini" inputMode="numeric" maxLength={2} value={d.hora} onChange={e => c('hora', e.target.value.replace(/\D/g, ''))} />
            <span>:</span>
            <input className="entrada-mini" inputMode="numeric" maxLength={2} value={d.minuto} onChange={e => c('minuto', e.target.value.replace(/\D/g, ''))} />
          </div>
        </Campo>
      </Tarjeta>
      <MensajeError error={error} />
      <div className="acciones-fondo"><Boton cargando={ocupado === 'siguiente'} onClick={continuar}>Siguiente</Boton></div>
    </>
  );
}
