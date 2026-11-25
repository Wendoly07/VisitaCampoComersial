import { useState } from 'react';
import { Titulo, Tarjeta, Campo, AreaTexto, Entrada, Seleccion, Boton, MensajeError } from '../../components/UI.jsx';
import Fotos from '../../components/Fotos.jsx';
import Firma from '../../components/Firma.jsx';
import Ubicacion from '../../components/Ubicacion.jsx';
import { useCatalogos } from '../../hooks/useCatalogos.js';
import { useUbicacion } from '../../hooks/useUbicacion.js';
import { useAccionesVisita } from './comun.js';
import { fmtFechaHora, isoFechaHora } from '../../utils/formato.js';

/** Visita Comercial: razón, sub razón, observaciones, fotos, GPS y firma */
export default function PasoComercial({ visita, setVisita, paso }) {
  const { lista } = useCatalogos();
  const ubic = useUbicacion();
  const [razon, setRazon] = useState(visita.razon || '');
  const [subRazon, setSubRazon] = useState(visita.subRazon || '');
  const [obs, setObs] = useState(visita.observaciones || '');
  const acc = useAccionesVisita(visita, setVisita, paso);
  const datos = () => ({ razon, subRazon, observaciones: obs, latitud: ubic.lat, longitud: ubic.lon });

  function finalizar() {
    if (!razon) return acc.setError(new Error('Seleccione la razón de la visita'));
    if (!visita.firmaUrl) return acc.setError(new Error('Confirme la firma electrónica'));
    acc.finalizar(datos(), { observaciones: obs, latitud: ubic.lat, longitud: ubic.lon, fechaFin: isoFechaHora(new Date()) });
  }

  return (
    <>
      <Titulo titulo="Visita Comercial" subtitulo="Complete el siguiente formulario para registrar la visita." />
      <Tarjeta>
        <Campo label="Fecha de inicio"><Entrada icono="calendario" readOnly value={fmtFechaHora(visita.fechaInicio)} /></Campo>
        <Campo label="Razón"><Seleccion opciones={lista('Razon')} value={razon} onChange={v => { setRazon(v); setSubRazon(''); }} /></Campo>
        <Campo label="Sub razón"><Seleccion opciones={lista('SubRazon', razon)} value={subRazon} onChange={setSubRazon} disabled={!razon} /></Campo>
        <Campo label="Observaciones"><AreaTexto placeholder="Escribe aquí los comentarios o acuerdos alcanzados durante la visita..." value={obs} onChange={e => setObs(e.target.value)} /></Campo>
        <Fotos fotos={visita.fotos} onAgregar={acc.subirFotos} onQuitar={acc.quitarFoto} />
        <Ubicacion ubicacion={ubic} estilo="linea" />
        <div className="firma-borde"><Firma firmaUrl={visita.firmaUrl} onConfirmar={acc.guardarFirma} /></div>
      </Tarjeta>
      <MensajeError error={acc.error} />
      <div className="acciones">
        <Boton variante="secundario" cargando={acc.ocupado === 'guardar'} onClick={() => acc.guardar(datos())}>Guardar</Boton>
        <Boton cargando={acc.ocupado === 'finalizar'} onClick={finalizar}>Finalizar Visita</Boton>
      </div>
    </>
  );
}
