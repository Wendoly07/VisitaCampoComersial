import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const mostrar = useCallback((mensaje, tipo = 'ok') => {
    setToast({ mensaje, tipo, id: Date.now() });
    setTimeout(() => setToast(t => (t && Date.now() - t.id >= 2900 ? null : t)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      {toast && <div className={`toast toast-${toast.tipo}`} role="status">{toast.mensaje}</div>}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
