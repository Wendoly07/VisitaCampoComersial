import { useEffect, useRef, useState } from 'react';

/** Fotos seleccionadas en el dispositivo que se envían junto con un formulario */
export function useFotosLocales() {
  const [lista, setLista] = useState([]);
  const ref = useRef(lista);
  ref.current = lista;
  useEffect(() => () => ref.current.forEach(f => URL.revokeObjectURL(f.url)), []);
  return {
    lista,
    agregar: async files => setLista(l => [...l, ...files.map(file => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }))]),
    quitar: async foto => { URL.revokeObjectURL(foto.url); setLista(l => l.filter(x => x.id !== foto.id)); }
  };
}
