import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Titulo, Tarjeta, Avatar, Badge, Buscador, MensajeError, Vacio, FAB } from '../components/UI.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';
import { fmtLargo } from '../utils/formato.js';

const COLOR = { 'Pendiente': 'Pendiente', 'Completada': 'Completada', 'En Proceso': 'Programada' };

export default function MisPlanificaciones() {
  const navigate = useNavigate();
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { const t = setTimeout(() => setQ(texto), 300); return () => clearTimeout(t); }, [texto]);
  const { data, error, cargando } = useApi(`/planificaciones?q=${encodeURIComponent(q)}`);
  return (
    <Layout atras>
      <Titulo titulo="Mis Planificaciones"><span className="icono-titulo"><Icono nombre="estrella" size={18} /></span></Titulo>
      <Buscador value={texto} onChange={setTexto} placeholder="Buscar agente" />
      <MensajeError error={error} />
      {cargando && !data && <Cargando />}
      {data && !data.length && <Vacio texto="No hay planificaciones" icono="estrella" />}
      {data?.map(p => (
        <Tarjeta key={p.id} className="agente-item">
          <div className="agente-cab"><Avatar nombre={p.agenteNombre} /><div><strong>{p.agenteNombre}</strong><small>Código: {p.agenteCodigo}</small></div></div>
          <div className="mini-datos"><span>TITULO</span><div className="truncar">{p.titulo}</div></div>
          <div className="mini-datos"><span>ESTADO DE LA PLANIFICACIÓN</span><Badge estado={COLOR[p.estado]}>{p.estado}</Badge></div>
          <div className="mini-datos"><span>TIPO DE VISITA</span>{p.tipoVisita}</div>
          <div className="mini-datos"><span>CREADA</span><div className="fila"><Icono nombre="reloj" size={16} /> {fmtLargo(p.fechaCreacion).replace(/ \d+:\d+ [AP]M$/, '')}</div></div>
        </Tarjeta>
      ))}
      <FAB etiqueta="Nueva planificación" onClick={() => navigate('/planificaciones/nueva')} />
    </Layout>
  );
}
