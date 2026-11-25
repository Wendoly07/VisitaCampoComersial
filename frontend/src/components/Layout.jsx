import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icono, { Logo } from './Icono.jsx';
import MenuLateral from './MenuLateral.jsx';

/**
 * Estructura de pantalla móvil:
 *  - atras: muestra flecha de regreso (logo centrado)
 *  - menu: muestra botón ☰
 *  - nav: muestra barra inferior
 */
export default function Layout({ children, atras = false, menu = false, nav = true, accion = null }) {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="app">
      <header className={`topbar ${atras ? 'centrado' : ''}`}>
        {atras ? (
          <button className="icon-btn" onClick={() => (typeof atras === 'string' ? navigate(atras) : navigate(-1))} aria-label="Regresar">
            <Icono nombre="atras" />
          </button>
        ) : null}
        <div className="marca"><Logo size={26} /><span>Visita<b>Pro</b></span></div>
        <div className="topbar-der">
          {accion}
          {menu && (
            <button className="icon-btn" onClick={() => setAbierto(true)} aria-label="Menú"><Icono nombre="menu" /></button>
          )}
          {atras && !menu && !accion && <span className="icon-btn fantasma" />}
        </div>
      </header>
      <main className={`contenido ${nav ? 'con-nav' : ''}`}>{children}</main>
      {nav && <BarraInferior />}
      {abierto && <MenuLateral onCerrar={() => setAbierto(false)} />}
    </div>
  );
}

function BarraInferior() {
  const items = [
    ['/', 'inicio', 'Inicio'],
    ['/agentes', 'agentes', 'Agentes'],
    ['/visitas', 'visitas', 'Visitas'],
    ['/perfil', 'perfil', 'Perfil']
  ];
  return (
    <nav className="bottom-nav">
      {items.map(([to, icono, texto]) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'activo' : '')}>
          <Icono nombre={icono} size={20} />
          <span>{texto}</span>
        </NavLink>
      ))}
    </nav>
  );
}
