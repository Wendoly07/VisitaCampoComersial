import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

let cache = null;
let promesa = null;

/** Catálogos (listas desplegables), en caché durante la sesión */
export function useCatalogos() {
  const [cat, setCat] = useState(cache || {});
  useEffect(() => {
    if (cache) return;
    promesa ||= api('/catalogos').then(c => (cache = c)).catch(e => { promesa = null; throw e; });
    promesa.then(setCat).catch(() => {});
  }, []);
  const lista = (grupo, padre) => (cat[grupo] || []).filter(x => padre === undefined || x.padre === padre).map(x => x.valor);
  return { cat, lista };
}
