import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken, getToken, sincronizarCola } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then(u => { setUsuario(u); sincronizarCola(); })
      .catch(() => setToken(null))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    const salir = () => setUsuario(null);
    window.addEventListener('vp:logout', salir);
    return () => window.removeEventListener('vp:logout', salir);
  }, []);

  const iniciarSesion = useCallback(async (usuarioTxt, password) => {
    const r = await api('/auth/login', { method: 'POST', body: { usuario: usuarioTxt, password } });
    setToken(r.token);
    setUsuario(r.usuario);
    sincronizarCola();
  }, []);

  const iniciarConMicrosoft = useCallback(async () => {
    const cfg = await api('/auth/config');
    if (!cfg.microsoft) throw new Error('El inicio de sesión con Microsoft no está configurado');
    const { PublicClientApplication } = await import('@azure/msal-browser');
    const msal = new PublicClientApplication({
      auth: {
        clientId: cfg.microsoft.clientId,
        authority: `https://login.microsoftonline.com/${cfg.microsoft.tenantId}`,
        redirectUri: window.location.origin
      },
      cache: { cacheLocation: 'sessionStorage' }
    });
    await msal.initialize();
    const res = await msal.loginPopup({ scopes: ['openid', 'profile', 'email'], prompt: 'select_account' });
    const r = await api('/auth/microsoft', { method: 'POST', body: { idToken: res.idToken } });
    setToken(r.token);
    setUsuario(r.usuario);
  }, []);

  const cerrarSesion = useCallback(() => {
    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, iniciarConMicrosoft, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
