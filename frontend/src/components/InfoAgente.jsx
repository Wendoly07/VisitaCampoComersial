import { fmtFechaHora } from '../utils/formato.js';

const Campo = ({ label, valor, ancho }) => (
  <div className={`campo-ro ${ancho ? 'ancho' : ''}`}>
    <span>{label}</span>
    <div className="valor">{valor ?? '—'}</div>
  </div>
);

/** Información General del Agente / Comisionista (solo lectura) */
export default function InfoAgente({ agente: a, compacto = false }) {
  if (!a) return null;
  return (
    <div className={`grid-2 info-agente ${compacto ? 'compacto' : ''}`}>
      <Campo label="Código" valor={a.codigo} />
      <Campo label="Agente" valor={a.nombre} />
      <Campo label="Zona" valor={a.zona} />
      <Campo label="Sub Zona" valor={a.subZona} />
      <Campo label="Localidad" valor={a.localidad} />
      <Campo label="Categoría" valor={a.categoria} />
      <Campo label="Dirección" valor={a.direccion} ancho />
      <Campo label="Gerente de Ventas" valor={a.gerenteVentas} ancho />
      <Campo label="Asesor" valor={a.asesor} ancho />
      <Campo label="PM Realizado por" valor={a.pmRealizadoPor} ancho />
      <Campo label="Último PM" valor={a.ultimoPM ? fmtFechaHora(a.ultimoPM) : '—'} ancho />
      <Campo label="Última visita comercial" valor={a.ultimaVisitaComercial ? fmtFechaHora(a.ultimaVisitaComercial) : '—'} ancho />
      <Campo label="Ubicación Latitude" valor={a.latitud} />
      <Campo label="Ubicación Longitude" valor={a.longitud} />
    </div>
  );
}
