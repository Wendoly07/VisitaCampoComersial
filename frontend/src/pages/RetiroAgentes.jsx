import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Titulo, Tarjeta, Avatar, Badge, Buscador, MensajeError, Vacio, FAB } from '../components/UI.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';
import { fmtLargo } from '../utils/formato.js';

export default function RetiroAgentes() {
  const navigate = useNavigate();
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { const t = setTimeout(() => setQ(texto), 300); return () => clearTimeout(t); }, [texto]);
  const { data, error, cargando } = useApi(`/retiros?q=${encodeURIComponent(q)}`);
  return (
    <Layout atras>
      <Titulo titulo="Retiro de Agentes" subtitulo="Listado y estado de solicitudes de desafiliación" />
      <Buscador value={texto} onChange={setTexto} />
      <MensajeError error={error} />
      {cargando && !data && <Cargando />}
      {data && !data.length && <Vacio texto="No hay solicitudes de retiro" icono="retiro" />}
      {data?.map(r => (
        <Tarjeta key={r.id} className="agente-item">
          <div className="agente-cab"><Avatar nombre={r.agenteNombre} /><div><strong>{r.agenteNombre}</strong><small>Código: {r.agenteCodigo}</small></div></div>
          <div className="mini-datos"><span>RAZÓN DE RETIRO</span>{r.razonRetiro}</div>
          <div className="mini-datos"><span>ESTADO DE LA SOLICITUD</span><Badge estado={r.estado} /></div>
          <div className="mini-datos"><span>CREADA:</span><div className="fila"><Icono nombre="reloj" size={16} /> {fmtLargo(r.fechaCreacion)}</div></div>
        </Tarjeta>
      ))}
      <FAB etiqueta="Nueva solicitud" onClick={() => navigate('/retiros/nuevo')} />
    </Layout>
  );
}
