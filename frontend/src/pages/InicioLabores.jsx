import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { Titulo, Tarjeta, Campo, Entrada, Seleccion, Boton, MensajeError } from '../components/UI.jsx';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useCatalogos } from '../hooks/useCatalogos.js';
import { useUbicacion } from '../hooks/useUbicacion.js';
import { useToast } from '../context/ToastContext.jsx';
import { isoFechaHora, fmtFechaHora } from '../utils/formato.js';

export default function InicioLabores() {
  const navigate = useNavigate();
  const toast = useToast();
  const { lista } = useCatalogos();
  const ubic = useUbicacion();
  const { data: hoy } = useApi('/jornadas/hoy');
  const [fecha, setFecha] = useState(isoFechaHora(new Date()));
  const [dep, setDep] = useState('Francisco Morazan');
  const [mun, setMun] = useState('Tegucigalpa');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { const t = setInterval(() => setFecha(isoFechaHora(new Date())), 30000); return () => clearInterval(t); }, []);

  async function registrar() {
    setError(null); setGuardando(true);
    try {
      await api('/jornadas', { method: 'POST', body: { fechaInicio: fecha, departamento: dep, municipio: mun, latitud: ubic.lat, longitud: ubic.lon } });
      toast('Inicio de labores registrado');
      navigate('/');
    } catch (e) { setError(e); } finally { setGuardando(false); }
  }

  return (
    <Layout atras nav={false}>
      <Titulo titulo="Inicio de Labores" subtitulo="Registre el inicio de su jornada laboral." />
      {hoy && <div className="aviso-verde">Ya registró su inicio de labores hoy: {fmtFechaHora(hoy.fechaInicio)}</div>}
      <Tarjeta>
        <Campo label="Fecha y Hora de Inicio"><Entrada icono="calendario" type="datetime-local" value={fecha} readOnly /></Campo>
      </Tarjeta>
      <Tarjeta className="grid-2">
        <Campo label="Departamento"><Seleccion opciones={lista('Departamento')} value={dep} onChange={v => { setDep(v); setMun(''); }} /></Campo>
        <Campo label="Municipio"><Seleccion opciones={lista('Municipio', dep)} value={mun} onChange={setMun} /></Campo>
      </Tarjeta>
      <MensajeError error={error} />
      <div className="acciones-fondo">
        <Boton cargando={guardando} onClick={registrar} disabled={!dep || !mun || Boolean(hoy)}>Registrar Inicio</Boton>
      </div>
    </Layout>
  );
}
