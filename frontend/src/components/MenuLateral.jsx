import { Link } from 'react-router-dom';
import Icono, { Logo } from './Icono.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MenuLateral({ onCerrar }) {
  const { usuario, cerrarSesion } = useAuth();
  const items = [
    ['/jornada', 'reloj', 'Inicio de Labores'],
    ['/visitas/nueva', 'mas', 'Registrar Visita'],
    ['/visitas', 'visitas', 'Mis Visitas'],
    ['/reportes/mensual', 'grafico', 'Reporte Mensual'],
    ['/retiros', 'retiro', 'Retiro de Agentes'],
    ['/planificaciones', 'estrella', 'Mis Planificaciones']
  ];
  return (
    <div className="drawer-fondo" onClick={onCerrar}>
      <aside className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-cab">
          <div className="marca"><Logo size={30} /><span>Visita<b>Pro</b></span></div>
          <button className="icon-btn" onClick={onCerrar} aria-label="Cerrar"><Icono nombre="cerrar" /></button>
        </div>
        <div className="drawer-usuario">
          <strong>{usuario?.nombre}</strong>
          <small>{usuario?.correo}</small>
        </div>
        <nav>
          {items.map(([to, ic, t]) => (
            <Link key={to} to={to} onClick={onCerrar}><Icono nombre={ic} /> {t}</Link>
          ))}
          <button onClick={cerrarSesion}><Icono nombre="salir" /> Cerrar sesión</button>
        </nav>
      </aside>
    </div>
  );
}
