import { useParams, Navigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Cargando from '../components/Cargando.jsx';
import { MensajeError, Tarjeta } from '../components/UI.jsx';
import { useApi } from '../hooks/useApi.js';
import PasoSoporte from './pasos/PasoSoporte.jsx';
import PasoEquipo from './pasos/PasoEquipo.jsx';
import PasoCierre from './pasos/PasoCierre.jsx';
import PasoPreventivo from './pasos/PasoPreventivo.jsx';
import PasoComercial from './pasos/PasoComercial.jsx';

const PASOS = {
  hotline: [PasoSoporte, { titulo: 'Hotline' }],
  otros: [PasoSoporte, { titulo: 'Otros Soportes' }],
  equipo: [PasoEquipo, { modo: 'equipo' }],
  instalacion: [PasoEquipo, { modo: 'instalacion' }],
  retiro: [PasoEquipo, { modo: 'retiro' }],
  cierre: [PasoCierre, {}],
  preventivo: [PasoPreventivo, {}],
  comercial: [PasoComercial, {}]
};

/** Carga la visita y muestra el formulario del paso indicado en la URL */
export default function VisitaPaso() {
  const { id, paso } = useParams();
  const { data: visita, error, cargando, setData } = useApi(`/visitas/${id}`);
  const def = PASOS[paso];
  if (!def) return <Navigate to={`/visitas/${id}`} replace />;
  if (visita && visita.estado !== 'En Proceso') return <Navigate to={`/visitas/${id}`} replace />;
  const [Comp, props] = def;
  return (
    <Layout atras={`/visitas`} nav={false}>
      <MensajeError error={error} />
      {cargando && !visita && <Cargando />}
      {visita && <Comp key={paso} visita={visita} setVisita={setData} paso={paso} {...props} />}
      {!visita && !cargando && !error && <Tarjeta>Visita no encontrada</Tarjeta>}
    </Layout>
  );
}
