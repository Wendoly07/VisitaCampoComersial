import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { Titulo, Tarjeta, Badge, RangoFechas, MensajeError, Vacio, Seleccion } from '../components/UI.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';
import { fmtCorto, fmtHora, isoFecha } from '../utils/formato.js';
import { estadoHistorial } from '../utils/visitas.js';

export default function Historial() {
  const { id } = useParams();
  const hoy = new Date();
  const [desde, setDesde] = useState(isoFecha(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
  const [hasta, setHasta] = useState(isoFecha(hoy));
  const [estado, setEstado] = useState('');
  const [verFiltro, setVerFiltro] = useState(false);
  const { data: agente } = useApi(`/agentes/${id}`);
  const { data, error, cargando } = useApi(`/agentes/${id}/historial?desde=${desde}&hasta=${hasta}&estado=${encodeURIComponent(estado)}`);
  const r = data?.resumen || {};
  const exito = r.total ? Math.round((r.completadas / r.total) * 100) : 0;

  return (
    <Layout atras nav={false}>
      <Titulo titulo="Historial Consolidado" subtitulo="Historial de visitas realizadas al agente" />
      {agente && (
        <Tarjeta className="cab-agente">
          <strong>{agente.nombre}</strong>
          <div><span className="chip-verde">Codigo: {agente.codigo}</span> <small className="gris">Agente visitado</small></div>
        </Tarjeta>
      )}
      <div className="grid-2 resumen">
        <Tarjeta><small>Total de visitas recibidas</small><div className="fila-sb"><b className="num">{r.total ?? 0}</b><small>Acumulado</small></div></Tarjeta>
        <Tarjeta><small>Completadas</small><div className="fila-sb"><b className="num verde">{r.completadas ?? 0}</b><small>{exito}% éxito</small></div></Tarjeta>
        <Tarjeta><small>Pendientes</small><div className="fila-sb"><b className="num azul">{r.pendientes ?? 0}</b><small>En seguimiento</small></div></Tarjeta>
        <Tarjeta><small>Canceladas</small><div className="fila-sb"><b className="num rojo">{r.canceladas ?? 0}</b><small>No realizadas</small></div></Tarjeta>
      </div>
      <RangoFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
      <div className="fila-sb seccion">
        <h3>Visitas del Periodo</h3>
        <button className="link" onClick={() => setVerFiltro(!verFiltro)}>Filtrar ({data?.visitas.length ?? 0})</button>
      </div>
      {verFiltro && (
        <Seleccion placeholder="Todos los estados" value={estado} onChange={setEstado}
          opciones={['Cerrada', 'Programada', 'En Proceso', 'Sin Programar', 'Cancelada']} />
      )}
      <MensajeError error={error} />
      {cargando && !data && <Cargando />}
      {data && !data.visitas.length && <Vacio texto="Sin visitas en el periodo" />}
      {data?.visitas.map(v => {
        const e = estadoHistorial(v.estado);
        return (
          <Tarjeta key={v.id} className="historial-item">
            <div className="fila-sb"><strong>{fmtCorto(v.fechaRef)} · {fmtHora(v.fechaInicio || v.horaPlanificada)}</strong><Badge estado={e} /></div>
            <small className="gris">Visitador: {v.visitador}</small>
            <hr />
            <p><b>Razón:</b> {v.razon || v.tipoVisita}</p>
            {v.observaciones && <p className="gris">Observaciones: {v.observaciones}</p>}
          </Tarjeta>
        );
      })}
    </Layout>
  );
}
