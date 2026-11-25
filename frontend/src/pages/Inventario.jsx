import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icono from '../components/Icono.jsx';
import { Titulo, Tarjeta, Campo, Seleccion, MensajeError, Badge } from '../components/UI.jsx';
import Cargando from '../components/Cargando.jsx';
import { useApi } from '../hooks/useApi.js';
import { useCatalogos } from '../hooks/useCatalogos.js';

export default function Inventario() {
  const { id } = useParams();
  const { lista } = useCatalogos();
  const [familia, setFamilia] = useState('');
  const [marca, setMarca] = useState('');
  const { data, error, cargando } = useApi(`/agentes/${id}/inventario?familia=${encodeURIComponent(familia)}&marca=${encodeURIComponent(marca)}`);
  const n = data?.length ?? 0;
  return (
    <Layout atras nav={false}>
      <Titulo titulo="Inventario" subtitulo="Consulta y gestión de activos asignados." />
      <div className="aviso-verde"><Icono nombre="checkCirculo" size={16} /> Mostrando {n} {n === 1 ? 'activo' : 'activos'} en inventario de campo.</div>
      <Tarjeta className="grid-2">
        <Campo label="Familia"><Seleccion placeholder="Todas" opciones={lista('Familia')} value={familia} onChange={setFamilia} /></Campo>
        <Campo label="Marca"><Seleccion placeholder="Todas" opciones={lista('Marca')} value={marca} onChange={setMarca} /></Campo>
      </Tarjeta>
      <MensajeError error={error} />
      {cargando && !data && <Cargando />}
      <Tarjeta className="sin-padding">
        <div className="tabla-scroll">
          <table className="tabla">
            <thead><tr><th>Activo</th><th>Familia</th><th>Marca</th><th>Serie</th></tr></thead>
            <tbody>
              {data?.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.activo}</strong><br /><Badge estado={r.estado} /></td>
                  <td>{r.familia}</td><td>{r.marca}</td><td>{r.serie}</td>
                </tr>
              ))}
              {data && !data.length && <tr><td colSpan={4} className="centro gris">Sin activos asignados</td></tr>}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </Layout>
  );
}
