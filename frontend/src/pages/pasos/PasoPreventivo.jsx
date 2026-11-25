import { useState } from 'react';
import { Titulo, Tarjeta, Campo, AreaTexto, Entrada, Boton, MensajeError } from '../../components/UI.jsx';
import Fotos from '../../components/Fotos.jsx';
import Ubicacion from '../../components/Ubicacion.jsx';
import { useUbicacion } from '../../hooks/useUbicacion.js';
import { useAccionesVisita } from './comun.js';
import { isoFechaHora } from '../../utils/formato.js';

/** Mantenimiento Preventivo: observaciones + evidencia fotográfica */
export default function PasoPreventivo({ visita, setVisita, paso }) {
  const ubic = useUbicacion();
  const [obs, setObs] = useState(visita.observaciones || '');
  const [fin, setFin] = useState(isoFechaHora(new Date()));
  const acc = useAccionesVisita(visita, setVisita, paso);

  function finalizar() {
    if (!visita.fotos.length) return acc.setError(new Error('Agregue al menos una foto de evidencia'));
    acc.finalizar(null, { observaciones: obs, latitud: ubic.lat, longitud: ubic.lon, fechaFin: fin });
  }

  return (
    <>
      <Titulo titulo="Mantenimiento Preventivo" subtitulo="Registro de observaciones y evidencia fotográfica." />
      <Tarjeta>
        <Campo label="Observaciones"><AreaTexto placeholder="Escriba sus observaciones aquí..." value={obs} onChange={e => setObs(e.target.value)} /></Campo>
      </Tarjeta>
      <Tarjeta>
        <Fotos titulo="Evidencia Fotográfica" minimo={1} fotos={visita.fotos} onAgregar={acc.subirFotos} onQuitar={acc.quitarFoto} />
      </Tarjeta>
      <Tarjeta><Ubicacion ubicacion={ubic} /></Tarjeta>
      <Tarjeta>
        <Campo label="Fecha y Hora Fin"><Entrada icono="calendario" type="datetime-local" value={fin} onChange={e => setFin(e.target.value)} /></Campo>
      </Tarjeta>
      <MensajeError error={acc.error} />
      <div className="acciones">
        <Boton variante="secundario" cargando={acc.ocupado === 'guardar'} onClick={() => acc.guardar({ observaciones: obs, latitud: ubic.lat, longitud: ubic.lon })}>Guardar</Boton>
        <Boton cargando={acc.ocupado === 'finalizar'} onClick={finalizar}>Finalizar Visita</Boton>
      </div>
    </>
  );
}
