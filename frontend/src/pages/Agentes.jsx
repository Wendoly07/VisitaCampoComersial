import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Titulo, Tarjeta, Avatar, Buscador, Segmentado, MensajeError, Vacio } from '../components/UI.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';

export default function Agentes() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('todos');
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  useEffect(() => { const t = setTimeout(() => setBusqueda(texto), 300); return () => clearTimeout(t); }, [texto]);
  const { data, error, cargando } = useApi(`/agentes?q=${encodeURIComponent(busqueda)}&mis=${filtro === 'mis' ? 1 : 0}`);

  return (
    <Layout menu>
      <Titulo titulo="Agentes" subtitulo="Directorio de personal de visitas de campo" />
      <Segmentado opciones={[['todos', 'Todos los agentes'], ['mis', 'Mis agentes']]} valor={filtro} onChange={setFiltro} />
      <Buscador value={texto} onChange={setTexto} />
      <MensajeError error={error} />
      {cargando && !data && <Cargando />}
      {data && !data.length && <Vacio texto="No se encontraron agentes" icono="agentes" />}
      {data?.map(a => (
        <Tarjeta key={a.id} className="agente-item" onClick={() => navigate(`/agentes/${a.id}`)}>
          <div className="agente-cab">
            <Avatar nombre={a.nombre} />
            <div><strong>{a.nombre}</strong><small>Código: {a.codigo}</small></div>
          </div>
          <div className="grid-2 mini-datos">
            <div><span>DEPARTAMENTO</span>{a.departamento || '—'}</div>
            <div><span>MUNICIPIO</span>{a.municipio || '—'}</div>
          </div>
          <div className="mini-datos"><span>DIRECCIÓN</span></div>
          <div className="direccion"><Icono nombre="ubicacion" size={14} />{a.direccion || '—'}</div>
        </Tarjeta>
      ))}
    </Layout>
  );
}
