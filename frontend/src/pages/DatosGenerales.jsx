import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { Titulo, Tarjeta, Campo, Entrada, Boton, MensajeError, Badge } from '../components/UI.jsx';
import InfoAgente from '../components/InfoAgente.jsx';
import Cargando from '../components/Cargando.jsx';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useUbicacion } from '../hooks/useUbicacion.js';
import { useToast } from '../context/ToastContext.jsx';
import { fmtFechaHora, isoFecha } from '../utils/formato.js';
import { primerPaso } from '../utils/visitas.js';

export default function DatosGenerales() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const ubic = useUbicacion();
  const { data: v, error, cargando, setData } = useApi(`/visitas/${id}`);
  const [reprogramar, setReprogramar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState(isoFecha(new Date()));
  const [ocupado, setOcupado] = useState('');
  const [err, setErr] = useState(null);

  async function iniciar() {
    setErr(null); setOcupado('iniciar');
    try {
      const r = await api(`/visitas/${id}/iniciar`, { method: 'POST', body: { latitud: ubic.lat, longitud: ubic.lon } });
      navigate(`/visitas/${id}/paso/${primerPaso(r.tipoVisita)}`, { replace: true });
    } catch (e) { setErr(e); } finally { setOcupado(''); }
  }

  async function guardarReprogramacion() {
    setErr(null); setOcupado('reprogramar');
    try {
      setData(await api(`/visitas/${id}/reprogramar`, { method: 'POST', body: { fechaPlanificada: nuevaFecha } }));
      setReprogramar(false);
      toast('Visita reprogramada');
    } catch (e) { setErr(e); } finally { setOcupado(''); }
  }

  const abierta = v && ['Programada', 'Sin Programar'].includes(v.estado);

  return (
    <Layout atras>
      <Titulo titulo="Datos Generales">{v && <Badge estado={v.estado} />}</Titulo>
      <MensajeError error={error || err} />
      {cargando && !v && <Cargando />}
      {v && (
        <>
          <Tarjeta>
            <Campo label="Tipo de Visita"><Entrada icono="lista" readOnly value={v.tipoVisita} /></Campo>
            <Campo label="Fecha de planificación">
              {reprogramar
                ? <Entrada icono="calendario" type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} />
                : <Entrada icono="calendario" readOnly value={v.fechaPlanificada ? v.fechaPlanificada.slice(0, 10).split('-').reverse().join('/') : 'Sin programar'} />}
            </Campo>
            {v.fechaInicio && <Campo label="Inicio"><Entrada readOnly value={fmtFechaHora(v.fechaInicio)} /></Campo>}
            {v.fechaFin && <Campo label="Fin"><Entrada readOnly value={fmtFechaHora(v.fechaFin)} /></Campo>}
          </Tarjeta>
          <Tarjeta>
            <h4 className="borde-verde">Información General del Agente</h4>
            <InfoAgente agente={v.agente} />
          </Tarjeta>
          {v.estado === 'Cerrada' && v.observaciones && (
            <Tarjeta><div className="campo-label fuerte">Observaciones</div><p>{v.observaciones}</p></Tarjeta>
          )}
          {abierta && (
            <div className="acciones">
              {reprogramar
                ? <Boton variante="secundario" cargando={ocupado === 'reprogramar'} onClick={guardarReprogramacion}>Guardar nueva fecha</Boton>
                : <Boton variante="secundario" onClick={() => setReprogramar(true)}>Reprogramar Visita</Boton>}
              <Boton cargando={ocupado === 'iniciar'} onClick={iniciar}>Iniciar</Boton>
            </div>
          )}
          {v.estado === 'En Proceso' && (
            <div className="acciones"><Boton onClick={() => navigate(`/visitas/${id}/paso/${primerPaso(v.tipoVisita)}`)}>Continuar visita</Boton></div>
          )}
        </>
      )}
    </Layout>
  );
}
