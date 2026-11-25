import { useState } from 'react';
import { Titulo, Tarjeta, Campo, AreaTexto, Entrada, Boton, MensajeError } from '../../components/UI.jsx';
import Firma from '../../components/Firma.jsx';
import Ubicacion from '../../components/Ubicacion.jsx';
import { useUbicacion } from '../../hooks/useUbicacion.js';
import { useAccionesVisita } from './comun.js';
import { isoFechaHora } from '../../utils/formato.js';

/** Observaciones y Firma (último paso de Hotline y Otros Soportes) */
export default function PasoCierre({ visita, setVisita, paso }) {
  const ubic = useUbicacion();
  const [obs, setObs] = useState(visita.observaciones || '');
  const [fin, setFin] = useState(isoFechaHora(new Date()));
  const acc = useAccionesVisita(visita, setVisita, paso);

  function finalizar() {
    if (!visita.firmaUrl) return acc.setError(new Error('Confirme la firma del responsable'));
    acc.finalizar(null, { observaciones: obs, latitud: ubic.lat, longitud: ubic.lon, fechaFin: fin });
  }

  return (
    <>
      <Titulo titulo="Observaciones y Firma" subtitulo="Finalice el reporte registrando los hallazgos finales y la firma digital del responsable." />
      <Tarjeta>
        <Campo label="Observaciones"><AreaTexto placeholder="Escriba los comentarios o hallazgos de la visita de campo..." value={obs} onChange={e => setObs(e.target.value)} /></Campo>
      </Tarjeta>
      <Tarjeta><Firma firmaUrl={visita.firmaUrl} onConfirmar={acc.guardarFirma} /></Tarjeta>
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
