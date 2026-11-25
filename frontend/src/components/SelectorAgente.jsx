import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Buscador } from './UI.jsx';

/** Búsqueda y selección de agente cuando el formulario no viene desde la ficha del agente */
export default function SelectorAgente({ onSeleccionar }) {
  const [texto, setTexto] = useState('');
  const [lista, setLista] = useState([]);
  useEffect(() => {
    const t = setTimeout(() => {
      api(`/agentes?q=${encodeURIComponent(texto)}`).then(setLista).catch(() => setLista([]));
    }, 250);
    return () => clearTimeout(t);
  }, [texto]);
  return (
    <div className="selector-agente">
      <Buscador value={texto} onChange={setTexto} placeholder="Buscar agente por nombre o código..." />
      <ul>
        {lista.slice(0, 8).map(a => (
          <li key={a.id}><button type="button" onClick={() => onSeleccionar(a)}><strong>{a.nombre}</strong><small>Código: {a.codigo}</small></button></li>
        ))}
      </ul>
    </div>
  );
}
