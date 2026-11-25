/* =====================================================================
   VisitaPro - Esquema de base de datos (Azure SQL)
   Las fechas se guardan en HORA LOCAL del país (Honduras, UTC-6, sin
   horario de verano). Si se usa en otro país, ajuste el desfase de los
   valores por defecto (DATEADD(HOUR,-6,SYSUTCDATETIME())).
   Si usa otro esquema distinto de dbo, reemplace "dbo." en este archivo
   y configure DB_SCHEMA en el backend.
   ===================================================================== */

CREATE TABLE dbo.Usuarios (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Nombre          NVARCHAR(150) NOT NULL,
    Correo          NVARCHAR(150) NOT NULL,
    Usuario         NVARCHAR(60)  NULL,
    PasswordHash    NVARCHAR(200) NULL,          -- NULL si solo entra con Microsoft
    Rol             NVARCHAR(20)  NOT NULL CONSTRAINT DF_Usuarios_Rol DEFAULT ('visitador'), -- visitador | supervisor | admin
    Zona            NVARCHAR(100) NULL,
    Telefono        NVARCHAR(30)  NULL,
    Activo          BIT NOT NULL CONSTRAINT DF_Usuarios_Activo DEFAULT (1),
    FechaCreacion   DATETIME2(0) NOT NULL CONSTRAINT DF_Usuarios_Fecha DEFAULT (DATEADD(HOUR,-6,SYSUTCDATETIME())),
    CONSTRAINT UQ_Usuarios_Correo UNIQUE (Correo)
);
CREATE UNIQUE INDEX UX_Usuarios_Usuario ON dbo.Usuarios(Usuario) WHERE Usuario IS NOT NULL;
GO

/* Agentes / comisionistas (puntos de venta que se visitan) */
CREATE TABLE dbo.Agentes (
    Id                      INT IDENTITY(1,1) PRIMARY KEY,
    Codigo                  NVARCHAR(20)  NOT NULL,
    Nombre                  NVARCHAR(150) NOT NULL,
    Departamento            NVARCHAR(100) NULL,
    Municipio               NVARCHAR(100) NULL,
    Direccion               NVARCHAR(250) NULL,
    Zona                    NVARCHAR(100) NULL,
    SubZona                 NVARCHAR(100) NULL,
    Localidad               NVARCHAR(50)  NULL,
    Categoria               NVARCHAR(50)  NULL,
    GerenteVentas           NVARCHAR(150) NULL,
    Asesor                  NVARCHAR(150) NULL,
    PMRealizadoPor          NVARCHAR(150) NULL,
    UltimoPM                DATETIME2(0)  NULL,
    UltimaVisitaComercial   DATETIME2(0)  NULL,
    Latitud                 DECIMAL(10,7) NULL,
    Longitud                DECIMAL(10,7) NULL,
    UsuarioAsignadoId       INT NULL REFERENCES dbo.Usuarios(Id),
    Activo                  BIT NOT NULL CONSTRAINT DF_Agentes_Activo DEFAULT (1),
    CONSTRAINT UQ_Agentes_Codigo UNIQUE (Codigo)
);
CREATE INDEX IX_Agentes_Usuario ON dbo.Agentes(UsuarioAsignadoId);
GO

/* Inventario de activos (terminales, impresoras, etc.) */
CREATE TABLE dbo.Activos (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Prefijo     NVARCHAR(10)  NOT NULL,          -- PFX, LTE, ...
    Codigo      NVARCHAR(40)  NOT NULL,          -- ACT-2845, LTE-5
    Familia     NVARCHAR(60)  NULL,              -- TERMINALES, IMPRESORAS...
    Marca       NVARCHAR(60)  NULL,
    Serie       NVARCHAR(60)  NULL,
    Estado      NVARCHAR(30)  NOT NULL CONSTRAINT DF_Activos_Estado DEFAULT ('En Bodega'), -- Disponible (en el agente) | En Bodega | Dañado
    AgenteId    INT NULL REFERENCES dbo.Agentes(Id),   -- NULL = en bodega
    CONSTRAINT UQ_Activos_Codigo UNIQUE (Codigo)
);
CREATE INDEX IX_Activos_Agente ON dbo.Activos(AgenteId);
GO

/* Visitas de campo */
CREATE TABLE dbo.Visitas (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    AgenteId            INT NOT NULL REFERENCES dbo.Agentes(Id),
    UsuarioId           INT NOT NULL REFERENCES dbo.Usuarios(Id),
    TipoVisita          NVARCHAR(50)  NOT NULL,  -- Hotline | Otros Soportes | Mantenimiento Preventivo | Instalación | Retiro | Visita Comercial
    Estado              NVARCHAR(20)  NOT NULL,  -- Sin Programar | Programada | En Proceso | Cerrada | Cancelada
    Planificada         BIT NOT NULL CONSTRAINT DF_Visitas_Planificada DEFAULT (1),
    FechaPlanificada    DATE NULL,
    HoraPlanificada     TIME(0) NULL,
    FechaInicio         DATETIME2(0) NULL,
    FechaFin            DATETIME2(0) NULL,
    Razon               NVARCHAR(150) NULL,
    SubRazon            NVARCHAR(150) NULL,
    Observaciones       NVARCHAR(MAX) NULL,
    Detalle             NVARCHAR(MAX) NULL,      -- JSON con los datos propios del tipo (hotline, soporte, etc.)
    Latitud             DECIMAL(10,7) NULL,
    Longitud            DECIMAL(10,7) NULL,
    FirmaBlob           NVARCHAR(300) NULL,
    MotivoCancelacion   NVARCHAR(250) NULL,
    FechaSincronizacion DATETIME2(0) NULL,
    FechaCreacion       DATETIME2(0) NOT NULL CONSTRAINT DF_Visitas_Fecha DEFAULT (DATEADD(HOUR,-6,SYSUTCDATETIME())),
    FechaRef AS (COALESCE(CAST(FechaInicio AS DATE), FechaPlanificada, CAST(FechaCreacion AS DATE))),
    CONSTRAINT CK_Visitas_Detalle CHECK (Detalle IS NULL OR ISJSON(Detalle) = 1)
);
CREATE INDEX IX_Visitas_Usuario ON dbo.Visitas(UsuarioId, Estado);
CREATE INDEX IX_Visitas_Agente  ON dbo.Visitas(AgenteId);
GO

/* Movimientos de equipo realizados en una visita */
CREATE TABLE dbo.MovimientosEquipo (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    VisitaId        INT NOT NULL REFERENCES dbo.Visitas(Id) ON DELETE CASCADE,
    TipoMovimiento  NVARCHAR(30) NOT NULL,       -- Retirar Equipo | Agregar Equipo | Cambio | Instalar Equipo | Retiro Equipo
    PrefijoSale     NVARCHAR(10) NULL,
    ActivoSaleId    INT NULL REFERENCES dbo.Activos(Id),
    PrefijoEntra    NVARCHAR(10) NULL,
    ActivoEntraId   INT NULL REFERENCES dbo.Activos(Id),
    Aplicado        BIT NOT NULL CONSTRAINT DF_Mov_Aplicado DEFAULT (0),
    FechaCreacion   DATETIME2(0) NOT NULL CONSTRAINT DF_Mov_Fecha DEFAULT (DATEADD(HOUR,-6,SYSUTCDATETIME()))
);
GO

/* Fotos y firmas (en Azure Blob Storage) de visitas, retiros y planificaciones */
CREATE TABLE dbo.Adjuntos (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Entidad         NVARCHAR(20)  NOT NULL,      -- visita | retiro | planificacion
    EntidadId       INT NOT NULL,
    Tipo            NVARCHAR(20)  NOT NULL CONSTRAINT DF_Adj_Tipo DEFAULT ('foto'),
    BlobName        NVARCHAR(300) NOT NULL,
    FechaCreacion   DATETIME2(0)  NOT NULL
);
CREATE INDEX IX_Adjuntos_Entidad ON dbo.Adjuntos(Entidad, EntidadId);
GO

/* Inicio de labores (jornada) */
CREATE TABLE dbo.JornadasLaborales (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId       INT NOT NULL REFERENCES dbo.Usuarios(Id),
    FechaInicio     DATETIME2(0) NOT NULL,
    Departamento    NVARCHAR(100) NULL,
    Municipio       NVARCHAR(100) NULL,
    Latitud         DECIMAL(10,7) NULL,
    Longitud        DECIMAL(10,7) NULL
);
CREATE INDEX IX_Jornadas_Usuario ON dbo.JornadasLaborales(UsuarioId, FechaInicio);
GO

/* Solicitudes de retiro (desafiliación) de agentes */
CREATE TABLE dbo.RetirosAgente (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    AgenteId        INT NOT NULL REFERENCES dbo.Agentes(Id),
    TipoSolicitud   NVARCHAR(60)  NOT NULL,
    RazonRetiro     NVARCHAR(150) NOT NULL,
    Comentarios     NVARCHAR(MAX) NULL,
    EstadoEquipo    NVARCHAR(MAX) NULL,
    Estado          NVARCHAR(40)  NOT NULL CONSTRAINT DF_Ret_Estado DEFAULT ('Autorización Comercial'), -- Autorización Comercial | Saldos Pendientes | Orden Cerrada
    CreadoPorId     INT NOT NULL REFERENCES dbo.Usuarios(Id),
    FechaCreacion   DATETIME2(0) NOT NULL CONSTRAINT DF_Ret_Fecha DEFAULT (DATEADD(HOUR,-6,SYSUTCDATETIME()))
);
GO

/* Planificaciones de branding (Trade MKT) */
CREATE TABLE dbo.Planificaciones (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    AgenteId            INT NOT NULL REFERENCES dbo.Agentes(Id),
    UsuarioId           INT NOT NULL REFERENCES dbo.Usuarios(Id),
    Titulo              NVARCHAR(100) NOT NULL,
    TipoVisita          NVARCHAR(60)  NOT NULL,
    MaterialSugerido    NVARCHAR(100) NULL,
    Materiales          NVARCHAR(MAX) NOT NULL,
    Prioridad           NVARCHAR(20)  NOT NULL CONSTRAINT DF_Plan_Prioridad DEFAULT ('Baja'),
    Comentario          NVARCHAR(MAX) NOT NULL,
    FechaVisita         DATE NULL,
    Estado              NVARCHAR(20)  NOT NULL CONSTRAINT DF_Plan_Estado DEFAULT ('Pendiente'), -- Pendiente | En Proceso | Completada
    FechaCreacion       DATETIME2(0)  NOT NULL CONSTRAINT DF_Plan_Fecha DEFAULT (DATEADD(HOUR,-6,SYSUTCDATETIME()))
);
GO

/* Catálogos (listas desplegables) */
CREATE TABLE dbo.Catalogos (
    Id      INT IDENTITY(1,1) PRIMARY KEY,
    Grupo   NVARCHAR(40)  NOT NULL,
    Valor   NVARCHAR(150) NOT NULL,
    Padre   NVARCHAR(150) NULL,      -- para listas dependientes (sub razón -> razón, municipio -> departamento)
    Orden   INT NOT NULL CONSTRAINT DF_Cat_Orden DEFAULT (0),
    Activo  BIT NOT NULL CONSTRAINT DF_Cat_Activo DEFAULT (1)
);
CREATE INDEX IX_Catalogos_Grupo ON dbo.Catalogos(Grupo, Orden);
GO
