import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { Titulo, Tarjeta, Campo, Entrada, Seleccion, AreaTexto, Boton, MensajeError } from '../components/UI.jsx';
import Fotos from '../components/Fotos.jsx';
import SelectorAgente from '../components/SelectorAgente.jsx';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useCatalogos } from '../hooks/useCatalogos.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { fmtLargo, isoFechaHora } from '../utils/formato.js';
import { useFotosLocales } from '../hooks/useFotosLocales.js';

/** Detalle de Retiro: solicitud de desafiliación de un agente */
export default function DetalleRetiro() {
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const agenteId = params.get('agente');
  const { data: agente } = useApi(agenteId ? `/agentes/${agenteId}` : null);
  const { lista } = useCatalogos();
  const [f, setF] = useState({ tipoSolicitud: 'Retiro Agente', razonRetiro: '', comentarios: '', estadoEquipo: '' });
  const fotos = useFotosLocales();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const c = (k, v) => setF(x => ({ ...x, [k]: v }));

  async function enviar() {
    setError(null);
    if (!f.razonRetiro) return setError(new Error('Seleccione la razón de retiro'));
    setEnviando(true);
    try {
      const form = new FormData();
      form.append('agenteId', agenteId);
      Object.entries(f).forEach(([k, v]) => form.append(k, v));
      fotos.lista.forEach(x => form.append('fotos', x.file));
      await api('/retiros', { method: 'POST', form });
      toast('Solicitud de retiro enviada');
      navigate('/retiros', { replace: true });
    } catch (e) { setError(e); } finally { setEnviando(false); }
  }

  return (
    <Layout atras>
      <Titulo titulo="Detalle de Retiro" />
      {!agenteId ? (
        <Tarjeta><div className="campo-label fuerte">Seleccione el agente</div><SelectorAgente onSeleccionar={a => setParams({ agente: a.id })} /></Tarjeta>
      ) : (
        <>
          <Tarjeta><Campo label="Tipo de Visita"><Entrada icono="lista" readOnly value="Retiros de Agentes" /></Campo></Tarjeta>
          <Tarjeta>
            <h4 className="verde">Datos Generales</h4>
            <Campo label="Tipo de Solicitud"><Seleccion opciones={lista('TipoSolicitudRetiro')} value={f.tipoSolicitud} onChange={v => c('tipoSolicitud', v)} /></Campo>
            <Campo label="Razón de Retiro"><Seleccion opciones={lista('RazonRetiro')} value={f.razonRetiro} onChange={v => c('razonRetiro', v)} /></Campo>
            <Campo label="Creado Por"><Entrada readOnly value={usuario?.nombre || ''} /></Campo>
            <Campo label="Fecha de Creación"><Entrada readOnly value={fmtLargo(isoFechaHora(new Date()))} /></Campo>
          </Tarjeta>
          <Tarjeta>
            <h4 className="borde-verde">Datos del Agente</h4>
            <div className="grid-2">
              <Campo label="Código de Agente"><Entrada readOnly value={agente?.codigo || ''} /></Campo>
              <Campo label="Nombre Agente"><Entrada readOnly value={agente?.nombre || ''} /></Campo>
            </div>
            <Campo label="Comentarios"><AreaTexto rows={2} placeholder="Escriba aquí..." value={f.comentarios} onChange={e => c('comentarios', e.target.value)} /></Campo>
            <Campo label="Estado del Equipo"><AreaTexto rows={3} placeholder="Escriba aquí..." value={f.estadoEquipo} onChange={e => c('estadoEquipo', e.target.value)} /></Campo>
          </Tarjeta>
          <h4 className="verde">Archivos adjuntos</h4>
          <Fotos fotos={fotos.lista} onAgregar={fotos.agregar} onQuitar={fotos.quitar} />
          <MensajeError error={error} />
          <div className="acciones-fondo"><Boton cargando={enviando} onClick={enviar}>Enviar</Boton></div>
        </>
      )}
    </Layout>
  );
}
