import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';

/** Carga datos del API. Si ruta es null no hace nada. */
export function useApi(ruta) {
  const [estado, setEstado] = useState({ data: null, error: null, cargando: Boolean(ruta) });
  const [n, setN] = useState(0);
  const recargar = useCallback(() => setN(x => x + 1), []);

  useEffect(() => {
    if (!ruta) return;
    let vigente = true;
    setEstado(s => ({ ...s, cargando: true, error: null }));
    api(ruta)
      .then(data => vigente && setEstado({ data, error: null, cargando: false }))
      .catch(error => vigente && setEstado(s => ({ ...s, error, cargando: false })));
    return () => { vigente = false; };
  }, [ruta, n]);

  return { ...estado, recargar, setData: data => setEstado(s => ({ ...s, data })) };
}
