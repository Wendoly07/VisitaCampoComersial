import { useEffect, useState, useCallback } from 'react';

/** Obtiene la ubicación GPS del dispositivo */
export function useUbicacion(automatico = true) {
  const [u, setU] = useState({ lat: null, lon: null, error: null, cargando: false });

  const obtener = useCallback(() => new Promise(resolve => {
    if (!navigator.geolocation) {
      setU(s => ({ ...s, error: 'El dispositivo no tiene GPS' }));
      return resolve(null);
    }
    setU(s => ({ ...s, cargando: true }));
    navigator.geolocation.getCurrentPosition(
      p => {
        const r = { lat: +p.coords.latitude.toFixed(7), lon: +p.coords.longitude.toFixed(7) };
        setU({ ...r, error: null, cargando: false });
        resolve(r);
      },
      e => {
        setU(s => ({ ...s, error: e.code === 1 ? 'Permiso de ubicación denegado' : 'No se pudo obtener la ubicación', cargando: false }));
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }), []);

  useEffect(() => { if (automatico) obtener(); }, [automatico, obtener]);
  return { ...u, obtener };
}
