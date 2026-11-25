import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { Titulo, Tarjeta, Campo, Entrada, Seleccion, AreaTexto, Boton, MensajeError } from '../components/UI.jsx';
import Fotos from '../components/Fotos.jsx';
import SelectorAgente from '../components/SelectorAgente.jsx';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useCatalogos } from '../hooks/useCatalogos.js';
import { useFotosLocales } from '../hooks/useFotosLocales.js';
import { useToast } from '../context/ToastContext.jsx';

/** Nueva Planificación Branding (Trade MKT) */
export default function NuevaPlanificacion() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const agenteId = params.get('agente');
  const { data: agente } = useApi(agenteId ? `/agentes/${agenteId}` : null);
  const { lista } = useCatalogos();
  const fotos = useFotosLocales();
  const [f, setF] = useState({ tipoVisita: '', materialSugerido: '', materiales: '', prioridad: 'Baja', comentario: '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const c = (k, v) => setF(x => ({ ...x, [k]: v }));

  async function guardar() {
    setError(null);
    if (!f.tipoVisita || !f.materiales.trim() || !f.comentario.trim()) return setError(new Error('Complete los campos obligatorios (*)'));
    if (!fotos.lista.length) return setError(new Error('Suba al menos una fotografía'));
    setGuardando(true);
    try {
      const form = new FormData();
      form.append('agenteId', agenteId);
      if (params.get('fecha')) form.append('fechaVisita', params.get('fecha'));
      Object.entries(f).forEach(([k, v]) => form.append(k, v));
      fotos.lista.forEach(x => form.append('fotos', x.file));
      await api('/planificaciones', { method: 'POST', form });
      toast('Planificación enviada a Trade MKT');
      navigate('/planificaciones', { replace: true });
    } catch (e) { setError(e); } finally { setGuardando(false); }
  }

  return (
    <Layout atras>
      <Titulo titulo="Nueva Planificación Branding"
        subtitulo="Antes de enviar tu solicitud, el equipo de Trade MKT revisará cuidadosamente todos los detalles antes de asignar recursos para tu planificación de branding." />
      {!agenteId ? (
        <Tarjeta><div className="campo-label fuerte">Seleccione el agente</div><SelectorAgente onSeleccionar={a => setParams({ agente: a.id })} /></Tarjeta>
      ) : (
        <Tarjeta>
          <Campo label="Nombre del agente" requerido><Entrada readOnly value={agente?.nombre || ''} /></Campo>
          <Campo label="Código del agente"><Entrada readOnly value={agente?.codigo || ''} /></Campo>
          <Campo label="Tipo de visita" requerido><Seleccion placeholder="Seleccione:" opciones={lista('TipoVisitaBranding')} value={f.tipoVisita} onChange={v => c('tipoVisita', v)} /></Campo>
          <Campo label="Material sugerido"><Seleccion placeholder="Seleccione:" opciones={lista('MaterialSugerido')} value={f.materialSugerido} onChange={v => c('materialSugerido', v)} /></Campo>
          <Campo label="Materiales" requerido><AreaTexto rows={3} placeholder="Escriba aquí..." value={f.materiales} onChange={e => c('materiales', e.target.value)} /></Campo>
          <div className="campo-label"><i className="req">* </i>Subir Fotografía</div>
          <Fotos estilo="subir" titulo="" fotos={fotos.lista} onAgregar={fotos.agregar} onQuitar={fotos.quitar} />
          <Campo label="Prioridad"><Seleccion opciones={lista('Prioridad')} value={f.prioridad} onChange={v => c('prioridad', v)} /></Campo>
          <Campo label="Comentario" requerido><AreaTexto rows={4} placeholder="Escriba aquí..." value={f.comentario} onChange={e => c('comentario', e.target.value)} /></Campo>
        </Tarjeta>
      )}
      <MensajeError error={error} />
      {agenteId && <div className="acciones-fondo"><Boton cargando={guardando} onClick={guardar}>Guardar</Boton></div>}
    </Layout>
  );
}
