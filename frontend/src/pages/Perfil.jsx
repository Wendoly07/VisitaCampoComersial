import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Titulo, Tarjeta, Avatar, Campo, Entrada, Boton, MensajeError } from '../components/UI.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, leerCola, sincronizarCola } from '../api/client.js';

export default function Perfil() {
  const { usuario, cerrarSesion } = useAuth();
  const toast = useToast();
  const [clave, setClave] = useState({ actual: '', nueva: '' });
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState(null);
  const [pendientes, setPendientes] = useState(leerCola().length);

  async function cambiarClave() {
    setError(null);
    try {
      await api('/auth/cambiar-password', { method: 'POST', body: clave });
      toast('Contraseña actualizada');
      setClave({ actual: '', nueva: '' }); setVerClave(false);
    } catch (e) { setError(e); }
  }

  async function sincronizar() {
    await sincronizarCola();
    setPendientes(leerCola().length);
    toast(leerCola().length ? 'Aún hay operaciones pendientes' : 'Todo sincronizado');
  }

  const enlaces = [
    ['/jornada', 'reloj', 'Inicio de Labores'],
    ['/reportes/mensual', 'grafico', 'Reporte Mensual'],
    ['/retiros', 'retiro', 'Retiro de Agentes'],
    ['/planificaciones', 'estrella', 'Mis Planificaciones']
  ];

  return (
    <Layout menu>
      <Titulo titulo="Perfil" />
      <Tarjeta className="perfil-cab">
        <Avatar nombre={usuario?.nombre} />
        <div><strong>{usuario?.nombre}</strong><small>{usuario?.correo}</small><small className="chip-verde">{usuario?.rol}</small></div>
      </Tarjeta>
      <Tarjeta className="sin-padding">
        {enlaces.map(([to, ic, t]) => (
          <Link key={to} to={to} className="fila-enlace"><Icono nombre={ic} size={18} /> {t}<Icono nombre="derecha" size={16} className="fin" /></Link>
        ))}
        <button className="fila-enlace" onClick={sincronizar}><Icono nombre="sync" size={18} /> Sincronizar ({pendientes} pendientes)<Icono nombre="derecha" size={16} className="fin" /></button>
        <button className="fila-enlace" onClick={() => setVerClave(!verClave)}><Icono nombre="candado" size={18} /> Cambiar contraseña<Icono nombre="abajo" size={16} className="fin" /></button>
      </Tarjeta>
      {verClave && (
        <Tarjeta>
          <Campo label="Contraseña actual"><Entrada type="password" value={clave.actual} onChange={e => setClave({ ...clave, actual: e.target.value })} /></Campo>
          <Campo label="Nueva contraseña"><Entrada type="password" value={clave.nueva} onChange={e => setClave({ ...clave, nueva: e.target.value })} /></Campo>
          <MensajeError error={error} />
          <Boton onClick={cambiarClave}>Guardar contraseña</Boton>
        </Tarjeta>
      )}
      <Boton variante="peligro" onClick={cerrarSesion}><Icono nombre="salir" size={18} /> Cerrar sesión</Boton>
    </Layout>
  );
}
