# VisitaPro · Gestión de Visitas de Campo

Aplicación web móvil para el registro de visitas de campo, construida a partir del diseño de Figma.

| Carpeta | Tecnología | Despliegue en Azure |
|---|---|---|
| `frontend/` | React 19 + JavaScript (Vite), React Router | Azure Static Web Apps |
| `backend/` | Node.js 20 + Express 5 (API REST) | Azure App Service (Linux) |
| `backend/database/` | Scripts SQL | Azure SQL Database |
| Fotos y firmas | Azure Blob Storage (enlaces SAS temporales) | Storage Account |

---

## 1. Pantallas del diseño → archivos

| Pantalla (Figma) | Ruta | Archivo |
|---|---|---|
| Bienvenido / Login (usuario o Microsoft) | `/login` | `pages/Login.jsx` |
| Inicio (métricas + últimas visitas) | `/` | `pages/Inicio.jsx` |
| Agentes (Todos / Mis agentes) | `/agentes` | `pages/Agentes.jsx` |
| Información General del Comisionista | `/agentes/:id` | `pages/AgenteDetalle.jsx` |
| Inventario | `/agentes/:id/inventario` | `pages/Inventario.jsx` |
| Historial Consolidado | `/agentes/:id/historial` | `pages/Historial.jsx` |
| Reporte Mensual | `/reportes/mensual` | `pages/ReporteMensual.jsx` |
| Mis Visitas (Semana / Mes, filtros) | `/visitas` | `pages/MisVisitas.jsx` |
| Inicio de Labores | `/jornada` | `pages/InicioLabores.jsx` |
| Registro de Visita (todos los tipos) | `/visitas/nueva?agente=ID` | `pages/RegistroVisita.jsx` |
| Datos Generales (Reprogramar / Iniciar) | `/visitas/:id` | `pages/DatosGenerales.jsx` |
| Hotline / Otros Soportes | `/visitas/:id/paso/hotline` · `otros` | `pages/pasos/PasoSoporte.jsx` |
| Cambio de Equipo / Instalación / Retiro | `.../paso/equipo` · `instalacion` · `retiro` | `pages/pasos/PasoEquipo.jsx` |
| Observaciones y Firma | `.../paso/cierre` | `pages/pasos/PasoCierre.jsx` |
| Mantenimiento Preventivo | `.../paso/preventivo` | `pages/pasos/PasoPreventivo.jsx` |
| Visita Comercial | `.../paso/comercial` | `pages/pasos/PasoComercial.jsx` |
| Detalle de Retiro | `/retiros/nuevo?agente=ID` | `pages/DetalleRetiro.jsx` |
| Retiro de Agentes | `/retiros` | `pages/RetiroAgentes.jsx` |
| Nueva Planificación Branding | `/planificaciones/nueva?agente=ID` | `pages/NuevaPlanificacion.jsx` |
| Mis Planificaciones | `/planificaciones` | `pages/MisPlanificaciones.jsx` |
| Perfil | `/perfil` | `pages/Perfil.jsx` |

El botón ☰ de la barra superior abre el menú con Inicio de Labores, Registrar Visita, Reporte Mensual, Retiro de Agentes y Mis Planificaciones. El botón verde (+) de la ficha del agente abre el Registro de Visita.

### Flujo de una visita

```
Agente → (+) Registro de Visita → Guardar (queda Programada)  o  Iniciar
       → Datos Generales → Iniciar (En Proceso)
           Hotline ............ Hotline → Cambio de Equipo → Observaciones y Firma → Finalizar
           Otros Soportes ..... Otros Soportes → Cambio de Equipo → Observaciones y Firma → Finalizar
           Mant. Preventivo ... Observaciones + fotos (mín. 1) → Finalizar
           Instalación ........ Movimientos (Instalar Equipo) → Finalizar
           Retiro ............. Movimientos (Retiro Equipo) → Finalizar
           Visita Comercial ... Razón, sub razón, fotos, GPS, firma → Finalizar
       Retiros de Agentes → Detalle de Retiro → Enviar
       Planificación Branding → Nueva Planificación → Guardar
```

Al **finalizar**, el backend aplica los movimientos de equipo al inventario: el activo que sale regresa a bodega y el que entra queda asignado al agente. También actualiza el *Último PM* o la *Última visita comercial* del agente.

**Sin conexión:** si no hay internet al guardar o finalizar, la operación queda en cola en el teléfono y se envía sola al volver la conexión. En *Mis Visitas* aparece como "Pendiente de sincronizar". Las fotos y la firma necesitan conexión.

---

## 2. Ejecutar en local

Requisitos: Node.js 20 o superior y una base Azure SQL (o SQL Server local).

```bash
# 1) Base de datos: ejecutar en orden (Azure Data Studio / SSMS)
#    backend/database/01_esquema.sql
#    backend/database/02_datos_iniciales.sql

# 2) Backend
cd backend
cp .env.example .env        # completar los datos de conexión
npm install
npm run crear-usuario -- admin@visitapro.com "Administrador VisitaPro" "SuClave123!" admin admin
npm run dev                 # http://localhost:4000/api/health

# 3) Frontend (otra terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

En desarrollo, Vite redirige `/api` al backend. Si `AZURE_STORAGE_CONNECTION_STRING` está vacío, las fotos se guardan en `backend/uploads`.

Los usuarios de ejemplo del script SQL se crean **sin contraseña**. Asigne la clave con `npm run crear-usuario` (el mismo comando crea usuarios nuevos o actualiza la clave de los existentes).

---

## 3. Despliegue en Azure

### 3.1 Azure SQL Database
1. Cree el servidor y la base `visitapro`.
2. En **Redes**, active *Permitir que los servicios de Azure accedan a este servidor*.
3. Ejecute `01_esquema.sql` y luego `02_datos_iniciales.sql`. Si en producción usa otro esquema distinto de `dbo`, reemplace `dbo.` en los scripts y configure `DB_SCHEMA`.

### 3.2 Storage Account (fotos y firmas)
1. Cree una cuenta de almacenamiento (StorageV2).
2. El contenedor `visitapro` se crea solo al arrancar el backend; puede dejarse **privado**. El API entrega enlaces SAS temporales.
3. Copie la **cadena de conexión** (Claves de acceso).

### 3.3 Backend → App Service (Linux)
1. Cree un App Service **Linux, Node 20 LTS** (por ejemplo `visitapro-api`). Active **Always On**.
2. En **Configuración → Variables de entorno**, agregue:

| Variable | Ejemplo |
|---|---|
| `DB_SERVER` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | datos de Azure SQL (o `DB_CONNECTION_STRING`) |
| `DB_SCHEMA` | `dbo` |
| `JWT_SECRET` | texto largo y aleatorio |
| `TZ_PAIS` | `America/Tegucigalpa` |
| `CORS_ORIGINS` | `https://<su-static-web-app>.azurestaticapps.net` |
| `AZURE_STORAGE_CONNECTION_STRING` | cadena de la Storage Account |
| `AZURE_STORAGE_CONTAINER` | `visitapro` |
| `MS_TENANT_ID` / `MS_CLIENT_ID` | (opcional) inicio con Microsoft |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

3. **Comando de inicio:** `npm start`
4. **Comprobación de estado:** `/api/health`
5. Para publicar, elija una opción:
   - **GitHub Actions:** use `.github/workflows/backend.yml`. Necesita el secreto `AZURE_WEBAPP_PUBLISH_PROFILE` y la variable `AZURE_WEBAPP_NAME`.
   - **Azure CLI:** desde `backend/`, ejecute `az webapp up --name visitapro-api --runtime "NODE:20-lts" --os-type Linux`.
   - **VS Code:** use la extensión Azure App Service y elija *Deploy to Web App* sobre la carpeta `backend`.

### 3.4 Frontend → Azure Static Web Apps
1. Cree una Static Web App:
   - Origen: GitHub.
   - Ubicación de la app: `frontend`.
   - Ubicación de salida: `dist`.
   - API: dejar vacío.
2. Defina la variable `VITE_API_URL=https://visitapro-api.azurewebsites.net`. Se usa al compilar.
3. Para publicar con GitHub Actions, use `.github/workflows/frontend.yml`. Necesita el secreto `AZURE_STATIC_WEB_APPS_API_TOKEN` y la variable `VITE_API_URL`.
4. El archivo `public/staticwebapp.config.json` ya redirige las rutas de React a `index.html`.

> **Alternativa en un solo App Service:** compile el frontend (`npm run build`) y defina `FRONTEND_DIST=../frontend/dist` en el backend. En ese caso, `VITE_API_URL` queda vacío.

### 3.5 Inicio de sesión con Microsoft (opcional)
1. En Microsoft Entra ID, vaya a **Registros de aplicaciones** → **Nuevo registro**.
2. En **Plataforma**, elija **Aplicación de página única (SPA)**.
3. Como URI de redirección, ponga la URL del frontend (y `http://localhost:5173` para desarrollo).
4. Copie el *Id. de directorio (tenant)* y el *Id. de aplicación (cliente)* en `MS_TENANT_ID` y `MS_CLIENT_ID` del backend.
5. Cree al usuario en la tabla `Usuarios` con el mismo correo. También puede activar `MS_AUTO_CREAR_USUARIO=true` para que se cree solo.

---

## 4. API (resumen)

Todas las rutas, excepto `/api/auth/login`, `/api/auth/microsoft`, `/api/auth/config` y `/api/health`, requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/auth/login` · `/api/auth/microsoft` | Iniciar sesión |
| GET | `/api/dashboard?desde&hasta` | Pantalla de Inicio |
| GET | `/api/agentes?q&mis=1` · `/api/agentes/:id` | Directorio y ficha del agente |
| GET | `/api/agentes/:id/inventario` · `/historial` | Inventario e historial |
| GET/POST | `/api/visitas` | Mis visitas / registrar visita |
| GET/PATCH | `/api/visitas/:id` | Detalle / guardar avance |
| POST | `/api/visitas/:id/iniciar` · `/reprogramar` · `/cancelar` · `/finalizar` | Cambios de estado |
| POST/DELETE | `/api/visitas/:id/fotos` · `/movimientos` · POST `/firma` | Evidencias y equipo |
| GET | `/api/activos?tipo=sale\|entra&prefijo&agenteId` | Selectores de activos |
| GET | `/api/reportes/mensual?anio&mes` | Reporte mensual |
| GET/POST | `/api/jornadas` · `/api/jornadas/hoy` | Inicio de labores |
| GET/POST | `/api/retiros` · `/api/planificaciones` | Retiros y branding |
| GET | `/api/catalogos` | Listas desplegables (tabla `Catalogos`) |

**Roles:** `visitador` ve solo sus visitas. `supervisor` y `admin` ven todo el reporte y pueden cambiar el estado de retiros y planificaciones.

**Fechas:** se guardan en la hora local del país (`TZ_PAIS`) y se envían al frontend sin zona horaria.

**Catálogos:** las listas (tipos de visita, razones, problemas, materiales, departamentos, etc.) están en la tabla `Catalogos`. Se pueden editar sin tocar el código.
#   V i s i t a C a m p o C o m e r s i a l  
 