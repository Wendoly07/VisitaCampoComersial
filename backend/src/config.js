import 'dotenv/config';

const env = process.env;

function configBaseDatos() {
  if (env.DB_CONNECTION_STRING) return env.DB_CONNECTION_STRING;
  return {
    server: env.DB_SERVER,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    port: Number(env.DB_PORT || 1433),
    options: { encrypt: true, trustServerCertificate: env.DB_TRUST_CERT === 'true' },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  };
}

export const config = {
  port: Number(env.PORT || 4000),
  tz: env.TZ_PAIS || 'America/Tegucigalpa',
  corsOrigins: (env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean),
  db: configBaseDatos(),
  dbSchema: env.DB_SCHEMA || 'dbo',
  jwtSecret: env.JWT_SECRET || 'dev-secret-cambiar',
  jwtExpires: env.JWT_EXPIRES || '12h',
  ms: {
    tenantId: env.MS_TENANT_ID || '',
    clientId: env.MS_CLIENT_ID || '',
    autoCrear: env.MS_AUTO_CREAR_USUARIO === 'true',
    get enabled() { return Boolean(this.tenantId && this.clientId); }
  },
  blob: {
    connectionString: env.AZURE_STORAGE_CONNECTION_STRING || '',
    container: env.AZURE_STORAGE_CONTAINER || 'visitapro',
    sasMinutos: Number(env.BLOB_SAS_MINUTOS || 120)
  },
  frontendDist: env.FRONTEND_DIST || ''
};

if (!env.JWT_SECRET) console.warn('[aviso] JWT_SECRET no está configurado; usando clave de desarrollo.');
