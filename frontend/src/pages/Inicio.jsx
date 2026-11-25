import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Titulo, Tarjeta, Badge, RangoFechas, MensajeError, Vacio } from '../components/UI.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';
import { fmtFecha, isoFecha, sumarDias } from '../utils/formato.js';

export default function Inicio() {
  const navigate = useNavigate();
  const hoy = new Date();
  const [desde, setDesde] = useState(isoFecha(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
  const [hasta, setHasta] = useState(isoFecha(sumarDias(hoy, 0)));
  const { data, error, cargando } = useApi(`/dashboard?desde=${desde}&hasta=${hasta}`);
  const c = data?.conteos || {};

  const tarjetas = [
    ['Programadas', c.programadas, 'visitas', 'verde', 'Programada'],
    ['Sin Programar', c.sinProgramar, 'alerta', 'naranja', 'Sin Programar'],
    ['En Proceso', c.enProceso, 'progreso', 'naranja', 'En Proceso'],
    ['Cerradas', c.cerradas, 'checkCirculo', 'verde', 'Cerrada']
  ];

  return (
    <Layout menu>
      <Titulo titulo="Inicio" subtitulo="Resumen de visitas y métricas en tiempo real" />
      <RangoFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
      <MensajeError error={error} />
      <div className="grid-2 kpis">
        {tarjetas.map(([t, n, ic, color, estado]) => (
          <button key={t} className="kpi" onClick={() => navigate(`/visitas?estado=${encodeURIComponent(estado)}&desde=${desde}&hasta=${hasta}`)}>
            <div className="kpi-cab"><span className={`kpi-icono ${color}`}><Icono nombre={ic} size={16} /></span><strong>{cargando ? '…' : n ?? 0}</strong></div>
            <span>{t}</span>
          </button>
        ))}
      </div>
      <h3 className="seccion">Últimas Visitas</h3>
      {cargando && !data ? <Cargando /> : null}
      {data && !data.ultimas.length && <Vacio texto="No hay visitas en este periodo" />}
      {data?.ultimas.map(v => (
        <Tarjeta key={v.id} className="visita-item" onClick={() => navigate(`/visitas/${v.id}`)}>
          <div className="fila-sb"><strong>{v.agenteNombre}</strong><Badge estado={v.estado} /></div>
          <small className="gris">Fecha: {fmtFecha(v.fechaRef)}</small>
          <div className="direccion"><Icono nombre="ubicacion" size={14} />{[v.direccion, v.municipio].filter(Boolean).join(', ')}</div>
        </Tarjeta>
      ))}
    </Layout>
  );
}
