import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Tarjeta, MensajeError, FAB } from '../components/UI.jsx';
import InfoAgente from '../components/InfoAgente.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';

export default function AgenteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: a, error, cargando } = useApi(`/agentes/${id}`);
  return (
    <Layout atras nav={false}>
      <h2 className="subtitulo-verde">Información General del Comisionista</h2>
      <MensajeError error={error} />
      {cargando && <Cargando />}
      {a && (
        <>
          <Tarjeta><InfoAgente agente={a} /></Tarjeta>
          <button className="enlace-tarjeta" onClick={() => navigate(`/agentes/${id}/inventario`)}>
            <Icono nombre="caja" size={18} /> Ver Inventario <Icono nombre="derecha" size={18} className="fin" />
          </button>
          <button className="enlace-tarjeta" onClick={() => navigate(`/agentes/${id}/historial`)}>
            <Icono nombre="historial" size={18} /> Ver Historial de Visitas <Icono nombre="derecha" size={18} className="fin" />
          </button>
          <FAB etiqueta="Registrar visita" onClick={() => navigate(`/visitas/nueva?agente=${id}`)} />
        </>
      )}
    </Layout>
  );
}
