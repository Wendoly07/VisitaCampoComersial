import { useState } from 'react';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Titulo, Tarjeta, MensajeError } from '../components/UI.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';
import { nombreMes } from '../utils/formato.js';

const ICONOS = { 'Hotline': 'soporte', 'Mantenimiento Preventivo': 'herramienta', 'Instalación': 'instalar', 'Retiro': 'retiro', 'Otros Soportes': 'objetivo' };
const NOMBRES = { 'Mantenimiento Preventivo': 'Mantenimientos Prev.', 'Instalación': 'Instalaciones', 'Retiro': 'Retiros' };
const BARRAS = { 'Mantenimiento Preventivo': 'Preventivos', 'Instalación': 'Instalaciones', 'Retiro': 'Retiros' };

export default function ReporteMensual() {
  const hoy = new Date();
  const [periodo, setPeriodo] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 });
  const { data, error, cargando } = useApi(`/reportes/mensual?anio=${periodo.anio}&mes=${periodo.mes}`);
  const mover = d => setPeriodo(p => {
    const f = new Date(p.anio, p.mes - 1 + d, 1);
    return { anio: f.getFullYear(), mes: f.getMonth() + 1 };
  });
  const t = data?.totales || {};
  const maxHoras = Math.max(1, ...(data?.categorias || []).map(c => c.horas));
  const kpis = data ? [
    ...data.categorias.map(c => [NOMBRES[c.categoria] || c.categoria, c.total, ICONOS[c.categoria], c.categoria === 'Retiro' ? 'naranja' : 'verde']),
    ['Trabajos Abiertos', t.abiertos, 'carpeta', 'naranja'],
    ['Trabajos Cerrados', t.cerrados, 'checkCirculo', 'verde'],
    ['Sin Planificar', t.sinPlanificar, 'alerta', 'rojo'],
    ['Planificados', t.planificados, 'visitas', 'azul']
  ] : [];
  const p = data?.productividad || {};

  return (
    <Layout atras nav={false}>
      <div className="titulo-pagina">
        <div>
          <h1>Reporte Mensual</h1>
          <div className="selector-mes">
            <button className="icon-btn sin-borde" onClick={() => mover(-1)} aria-label="Mes anterior"><Icono nombre="izquierda" size={16} /></button>
            <span>{nombreMes(periodo.mes)} {periodo.anio}</span>
            <button className="icon-btn sin-borde" onClick={() => mover(1)} aria-label="Mes siguiente"><Icono nombre="derecha" size={16} /></button>
          </div>
        </div>
      </div>
      <h3 className="seccion sin-margen">Visualizar en tiempo real</h3>
      <p className="sub">Desglose general y métricas operativas</p>
      <MensajeError error={error} />
      {cargando && !data && <Cargando />}
      <div className="grid-2 kpis">
        {kpis.map(([n, v, ic, color]) => (
          <div key={n} className="kpi">
            <div className="kpi-cab"><span className={`kpi-icono ${color}`}><Icono nombre={ic} size={16} /></span><strong>{v ?? 0}</strong></div>
            <span>{n}</span>
          </div>
        ))}
      </div>
      {data && (
        <>
          <Tarjeta>
            <h4>Tiempo Invertido por Categoría</h4>
            {data.categorias.map(c => (
              <div className="barra-fila" key={c.categoria}>
                <span><Icono nombre={ICONOS[c.categoria]} size={14} /> {BARRAS[c.categoria] || c.categoria}</span>
                <div className="barra"><i style={{ width: `${(c.horas / maxHoras) * 100}%` }} /></div>
                <b>{c.horas}h</b>
              </div>
            ))}
            <div className="fila-sb total"><span>Total</span><b className="verde">{data.horasTotales}h</b></div>
          </Tarjeta>
          <h3 className="seccion sin-margen">Indicadores de Productividad</h3>
          <p className="sub">Rendimiento del equipo y cobertura</p>
          <Tarjeta className="lista-indicadores">
            <div className="fila-sb"><span><Icono nombre="agentes" size={16} /> Agentes Asignados</span><b>{p.agentesAsignados}</b></div>
            <div className="fila-sb"><span><Icono nombre="checkCirculo" size={16} /> Agentes Visitados</span><b>{p.agentesVisitados}</b></div>
            <div>
              <div className="fila-sb"><span><Icono nombre="objetivo" size={16} /> Cobertura</span><b className="verde">{p.cobertura}%</b></div>
              <div className="barra"><i style={{ width: `${Math.min(100, p.cobertura)}%` }} /></div>
            </div>
            <div className="fila-sb"><span><Icono nombre="herramienta" size={16} /> Trabajos Ejecutados</span><b>{p.trabajosEjecutados}</b></div>
            <div>
              <span><Icono nombre="grafico" size={16} /> Distribución de Agentes</span>
              <div className="fila-sb distribucion"><small><b>{p.propios}</b> Propios</small><small>|</small><small><b>{p.apoyoOtrasZonas}</b> Apoyo a Otras Zonas</small></div>
            </div>
          </Tarjeta>
        </>
      )}
    </Layout>
  );
}
