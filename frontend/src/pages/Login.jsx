import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icono, { Logo } from '../components/Icono.jsx';
import { Boton, MensajeError } from '../components/UI.jsx';

export default function Login() {
  const { usuario, iniciarSesion, iniciarConMicrosoft } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  if (usuario) return <Navigate to={loc.state?.desde || '/'} replace />;

  async function enviar(e) {
    e.preventDefault();
    setError(null); setCargando(true);
    try { await iniciarSesion(form.usuario, form.password); navigate(loc.state?.desde || '/', { replace: true }); }
    catch (er) { setError(er); }
    finally { setCargando(false); }
  }

  async function microsoft() {
    setError(null);
    try { await iniciarConMicrosoft(); navigate('/', { replace: true }); }
    catch (er) { if (er?.errorCode !== 'user_cancelled') setError(er); }
  }

  return (
    <div className="login">
      <div className="login-logo">
        <span className="logo-grande"><Logo size={56} /></span>
        <h2>Visita<b>Pro</b></h2>
        <small>GESTIÓN DE VISITAS</small>
      </div>
      <form onSubmit={enviar} className="login-form">
        <h1>Bienvenido</h1>
        <p className="sub">Ingresa tus credenciales para sincronizar tus visitas de campo.</p>
        <label className="campo">
          <span className="campo-label">Correo electrónico o Usuario</span>
          <div className="entrada"><Icono nombre="correo" size={18} />
            <input autoComplete="username" placeholder="ejemplo@visitapro.com" value={form.usuario}
              onChange={e => setForm({ ...form, usuario: e.target.value })} required /></div>
        </label>
        <label className="campo">
          <span className="campo-label">Contraseña</span>
          <div className="entrada"><Icono nombre="candado" size={18} />
            <input type={ver ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <button type="button" className="icon-btn sin-borde" onClick={() => setVer(!ver)} aria-label="Mostrar contraseña">
              <Icono nombre={ver ? 'ojoNo' : 'ojo'} size={18} /></button>
          </div>
        </label>
        <MensajeError error={error} />
        <Boton type="submit" variante="secundario" cargando={cargando}>Iniciar Sesión</Boton>
        <div className="separador"><span>o</span></div>
        <button type="button" className="btn btn-primario btn-ms" onClick={microsoft}>
          <span className="ms-logo"><i /><i /><i /><i /></span> Iniciar sesión con Microsoft
        </button>
      </form>
      <footer className="login-pie"><Icono nombre="escudo" size={14} /> Soporte Técnico • v2.4.1</footer>
    </div>
  );
}
