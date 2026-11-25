import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Titulo, Tarjeta, Badge, Segmentado, Campo, Seleccion, MensajeError, Vacio, FAB } from '../components/UI.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';
import { useCatalogos } from '../hooks/useCatalogos.js';
import { visitaPendiente } from '../api/client.js';
import { aFecha, fmtFecha, fmtHora, fmtDia, fmtFechaHora, isoFecha, inicioSemana, sumarDias, mesCorto } from '../utils/formato.js';
import { primerPaso } from '../utils/visitas.js';

const ESTADOS = ['Programada', 'Sin Programar', 'En Proceso', 'Cerrada', 'Cancelada'];

export default function MisVisitas() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { lista } = useCatalogos();
  const [modo, setModo] = useState(params.get('desde') ? 'rango' : 'semana');
  const [ref, setRef] = useState(new Date());
  const [f, setF] = useState({
    codigo: '', estado: params.get('estado') || '', tipo: '', ciudad: '',
    desde: params.get('desde') || '', hasta: params.get('hasta') || ''
  });
  const [, setTick] = useState(0);
  useEffect(() => {
    const r = () => setTick(x => x + 1);
    window.addEventListener('vp:cola', r);
    return () => window.removeEventListener('vp:cola', r);
  }, []);

  // Periodo según Semana / Mes o el rango manual
  const periodo = useMemo(() => {
    if (modo === 'semana') { const i = inicioSemana(ref); return [i, sumarDias(i, 6)]; }
    if (modo === 'mes') return [new Date(ref.getFullYear(), ref.getMonth(), 1), new Date(ref.getFullYear(), ref.getMonth() + 1, 0)];
    return [aFecha(f.desde), aFecha(f.hasta)];
  }, [modo, ref, f.desde, f.hasta]);

  const qs = new URLSearchParams({
    desde: periodo[0] ? isoFecha(periodo[0]) : '', hasta: periodo[1] ? isoFecha(periodo[1]) : '',
    estado: f.estado, tipo: f.tipo, ciudad: f.ciudad, codigo: f.codigo
  });
  const { data, error, cargando } = useApi(`/visitas?${qs}`);

  const grupos = useMemo(() => {
    const g = new Map();
    (data || []).forEach(v => { const k = isoFecha(aFecha(v.fechaRef)); g.set(k, [...(g.get(k) || []), v]); });
    return [...g.entries()];
  }, [data]);

  const mover = d => setRef(r => (modo === 'mes' ? new Date(r.getFullYear(), r.getMonth() + d, 1) : sumarDias(r, 7 * d)));
  const etiqueta = periodo[0] && periodo[1]
    ? `${periodo[0].getDate()} ${mesCorto(periodo[0].getMonth())} - ${periodo[1].getDate()} ${mesCorto(periodo[1].getMonth())} ${periodo[1].getFullYear()}`
    : 'Todas las fechas';
  const cambiar = (k, v) => setF(x => ({ ...x, [k]: v }));
  const cambiarFecha = (k, v) => { setModo('rango'); cambiar(k, v); };

  function abrir(v) {
    if (v.estado === 'En Proceso') navigate(`/visitas/${v.id}/paso/${primerPaso(v.tipoVisita)}`);
    else navigate(`/visitas/${v.id}`);
  }

  return (
    <Layout menu>
      <Titulo titulo="Mis Visitas" />
      <Segmentado opciones={[['semana', 'Semana'], ['mes', 'Mes']]} valor={modo} onChange={m => { setModo(m); setRef(new Date()); }} />
      <Tarjeta className="grid-2 filtros">
        <Campo label="Código de Agente">
          <div className="entrada"><input placeholder="Ej. AGT-001" value={f.codigo} onChange={e => cambiar('codigo', e.target.value)} /></div>
        </Campo>
        <Campo label="Estado"><Seleccion placeholder="Estado" opciones={ESTADOS} value={f.estado} onChange={v => cambiar('estado', v)} /></Campo>
        <Campo label="Tipo de Visita"><Seleccion placeholder="Tipo" opciones={lista('TipoVisita').filter(t => !['Retiros de Agentes', 'Planificacion Branding'].includes(t))} value={f.tipo} onChange={v => cambiar('tipo', v)} /></Campo>
        <Campo label="Ciudad"><Seleccion placeholder="Ciudad" opciones={lista('Municipio')} value={f.ciudad} onChange={v => cambiar('ciudad', v)} /></Campo>
        <Campo label="Fecha de Inicio"><div className="entrada"><input type="date" value={f.desde} onChange={e => cambiarFecha('desde', e.target.value)} /></div></Campo>
        <Campo label="Fecha Fin"><div className="entrada"><input type="date" value={f.hasta} onChange={e => cambiarFecha('hasta', e.target.value)} /></div></Campo>
      </Tarjeta>
      <div className="navegador-periodo">
        <button className="icon-btn" onClick={() => mover(-1)} disabled={modo === 'rango'} aria-label="Anterior"><Icono nombre="izquierda" size={16} /></button>
        <strong>{etiqueta}</strong>
        <button className="icon-btn" onClick={() => mover(1)} disabled={modo === 'rango'} aria-label="Siguiente"><Icono nombre="derecha" size={16} /></button>
      </div>
      <div className="total-verde">Total: {data?.length ?? 0} visitas</div>
      <MensajeError error={error} />
      {cargando && !data && <Cargando />}
      {data && !data.length && <Vacio texto="No hay visitas en este periodo" icono="visitas" />}
      {grupos.map(([dia, visitas]) => (
        <section key={dia}>
          <h3 className="seccion">{fmtDia(dia)}</h3>
          {visitas.map(v => {
            const pendiente = visitaPendiente(v.id) || (v.estado !== 'Cancelada' && !v.fechaSincronizacion);
            return (
              <Tarjeta key={v.id} className="visita-item" onClick={() => abrir(v)}>
                <div className="fila-sb">
                  <strong>{v.agenteNombre}</strong>
                  <span className="fila"><Badge estado={v.estado} /><Icono nombre="lapiz" size={16} className="gris" /></span>
                </div>
                <small className="gris">Fecha: {fmtFecha(v.fechaRef)} · Hora: {fmtHora(v.fechaInicio || v.horaPlanificada) || '—'} · {v.tipoVisita}</small>
                <div className="direccion"><Icono nombre="ubicacion" size={14} />{v.direccion}</div>
                {pendiente
                  ? <small className="sync pendiente">● Pendiente de sincronizar</small>
                  : <small className="sync ok">● Sincronizado · {fmtFechaHora(v.fechaSincronizacion)}</small>}
              </Tarjeta>
            );
          })}
        </section>
      ))}
      <FAB etiqueta="Registrar visita" onClick={() => navigate('/visitas/nueva')} />
    </Layout>
  );
}
