import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { Titulo, Tarjeta, Campo, Entrada, Seleccion, Boton, MensajeError } from '../components/UI.jsx';
import SelectorAgente from '../components/SelectorAgente.jsx';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useCatalogos } from '../hooks/useCatalogos.js';
import { useToast } from '../context/ToastContext.jsx';
import { isoFecha } from '../utils/formato.js';

export default function RegistroVisita() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const agenteId = params.get('agente');
  const { data: agente } = useApi(agenteId ? `/agentes/${agenteId}` : null);
  const { lista } = useCatalogos();
  const [tipo, setTipo] = useState(params.get('tipo') || '');
  const [fecha, setFecha] = useState(isoFecha(new Date()));
  const [hora, setHora] = useState('');
  const [guardando, setGuardando] = useState('');
  const [error, setError] = useState(null);

  const esRetiro = tipo === 'Retiros de Agentes';
  const esBranding = tipo === 'Planificacion Branding';

  async function crear(iniciar) {
    setError(null);
    if (!tipo) return setError(new Error('Seleccione el tipo de visita'));
    if (esRetiro) return navigate(`/retiros/nuevo?agente=${agenteId}`);
    if (esBranding) return navigate(`/planificaciones/nueva?agente=${agenteId}&fecha=${fecha}`);
    setGuardando(iniciar ? 'iniciar' : 'guardar');
    try {
      const v = await api('/visitas', {
        method: 'POST',
        body: { agenteId: Number(agenteId), tipoVisita: tipo, fechaPlanificada: fecha, horaPlanificada: hora, iniciar }
      });
      if (iniciar) navigate(`/visitas/${v.id}`, { replace: true });
      else { toast('Visita programada'); navigate('/visitas', { replace: true }); }
    } catch (e) { setError(e); } finally { setGuardando(''); }
  }

  return (
    <Layout atras nav={false}>
      <Titulo titulo="Registro de Visita" subtitulo="Complete el siguiente formulario para registrar una visita de campo." />
      {!agenteId ? (
        <Tarjeta>
          <div className="campo-label fuerte">Seleccione el agente</div>
          <SelectorAgente onSeleccionar={a => setParams({ agente: a.id })} />
        </Tarjeta>
      ) : (
        <>
          <p className="agente-linea"><b>Agente:</b> {agente?.nombre || '...'}
            <button className="link" onClick={() => setParams({})}>Cambiar</button></p>
          <Tarjeta>
            <Campo label="Tipo de Visita"><Seleccion icono="lista" opciones={lista('TipoVisita')} value={tipo} onChange={setTipo} /></Campo>
            {!esRetiro && (
              <div className="grid-2">
                <Campo label="Fecha de Visita"><Entrada icono="calendario" type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></Campo>
                {!esBranding && <Campo label="Hora (opcional)"><Entrada icono="reloj" type="time" value={hora} onChange={e => setHora(e.target.value)} /></Campo>}
              </div>
            )}
          </Tarjeta>
          <MensajeError error={error} />
          <div className="acciones">
            {esRetiro ? (
              <Boton onClick={() => crear(true)}>Siguiente</Boton>
            ) : (
              <>
                <Boton variante="secundario" cargando={guardando === 'guardar'} onClick={() => crear(false)}>Guardar</Boton>
                {!esBranding && <Boton cargando={guardando === 'iniciar'} onClick={() => crear(true)}>Iniciar</Boton>}
              </>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
