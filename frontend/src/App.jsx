import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Inicio from './pages/Inicio.jsx';
import Agentes from './pages/Agentes.jsx';
import AgenteDetalle from './pages/AgenteDetalle.jsx';
import Inventario from './pages/Inventario.jsx';
import Historial from './pages/Historial.jsx';
import ReporteMensual from './pages/ReporteMensual.jsx';
import MisVisitas from './pages/MisVisitas.jsx';
import InicioLabores from './pages/InicioLabores.jsx';
import RegistroVisita from './pages/RegistroVisita.jsx';
import DatosGenerales from './pages/DatosGenerales.jsx';
import VisitaPaso from './pages/VisitaPaso.jsx';
import DetalleRetiro from './pages/DetalleRetiro.jsx';
import RetiroAgentes from './pages/RetiroAgentes.jsx';
import NuevaPlanificacion from './pages/NuevaPlanificacion.jsx';
import MisPlanificaciones from './pages/MisPlanificaciones.jsx';
import Perfil from './pages/Perfil.jsx';
import Cargando from './components/Cargando.jsx';

function Protegida({ children }) {
  const { usuario, cargando } = useAuth();
  const loc = useLocation();
  if (cargando) return <Cargando pantalla />;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: loc.pathname }} />;
  return children;
}

const rutas = [
  ['/', Inicio],
  ['/agentes', Agentes],
  ['/agentes/:id', AgenteDetalle],
  ['/agentes/:id/inventario', Inventario],
  ['/agentes/:id/historial', Historial],
  ['/reportes/mensual', ReporteMensual],
  ['/visitas', MisVisitas],
  ['/visitas/nueva', RegistroVisita],
  ['/visitas/:id', DatosGenerales],
  ['/visitas/:id/paso/:paso', VisitaPaso],
  ['/jornada', InicioLabores],
  ['/retiros', RetiroAgentes],
  ['/retiros/nuevo', DetalleRetiro],
  ['/planificaciones', MisPlanificaciones],
  ['/planificaciones/nueva', NuevaPlanificacion],
  
];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {rutas.map(([path, Comp]) => (
        <Route key={path} path={path} element={<Protegida><Comp /></Protegida>} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
