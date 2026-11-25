import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, apiSincronizable } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { siguientePaso } from '../../utils/visitas.js';

/** Acciones comunes de los pasos de una visita */
export function useAccionesVisita(visita, setVisita, paso) {
  const navigate = useNavigate();
  const toast = useToast();
  const [ocupado, setOcupado] = useState('');
  const [error, setError] = useState(null);

  async function ejecutar(nombre, fn) {
    setError(null); setOcupado(nombre);
    try { return await fn(); } catch (e) { setError(e); return null; } finally { setOcupado(''); }
  }

  const guardarDatos = datos => apiSincronizable(`/visitas/${visita.id}`, { method: 'PATCH', body: datos }, visita.id)
    .then(r => { if (!r.encolado) setVisita(r); return r; });

  return {
    ocupado, error, setError,
    /** Guarda y vuelve a Mis Visitas */
    guardar: datos => ejecutar('guardar', async () => {
      const r = await guardarDatos(datos);
      toast(r.encolado ? 'Sin conexión: se guardará al recuperar internet' : 'Avance guardado');
      navigate('/visitas');
    }),
    /** Guarda y pasa al siguiente formulario */
    siguiente: datos => ejecutar('siguiente', async () => {
      await guardarDatos(datos);
      navigate(`/visitas/${visita.id}/paso/${siguientePaso(visita.tipoVisita, paso)}`);
    }),
    /** Guarda los datos y cierra la visita */
    finalizar: (datos, cierre) => ejecutar('finalizar', async () => {
      if (datos) await guardarDatos(datos);
      const r = await apiSincronizable(`/visitas/${visita.id}/finalizar`, { method: 'POST', body: cierre }, visita.id);
      toast(r.encolado ? 'Visita finalizada. Pendiente de sincronizar.' : 'Visita finalizada correctamente');
      navigate('/visitas', { replace: true });
    }),
    subirFotos: async files => {
      const form = new FormData();
      files.forEach(f => form.append('fotos', f));
      const fotos = await api(`/visitas/${visita.id}/fotos`, { method: 'POST', form });
      setVisita({ ...visita, fotos });
    },
    quitarFoto: async foto => {
      const fotos = await api(`/visitas/${visita.id}/fotos/${foto.id}`, { method: 'DELETE' });
      setVisita({ ...visita, fotos });
    },
    guardarFirma: async dataUrl => {
      const r = await api(`/visitas/${visita.id}/firma`, { method: 'POST', body: { dataUrl } });
      setVisita({ ...visita, firmaUrl: r.firmaUrl });
    }
  };
}
