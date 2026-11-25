/* =====================================================================
   VisitaPro - Datos iniciales (catálogos + datos de ejemplo del diseño)
   Los usuarios se crean SIN contraseña. Asigne la clave desde la
   carpeta backend con:
     npm run crear-usuario -- admin@visitapro.com "Administrador VisitaPro" "SuClave123!" admin admin
   ===================================================================== */

-- Catálogos
INSERT INTO dbo.Catalogos (Grupo, Valor, Padre, Orden) VALUES
 ('TipoVisita','Hotline',NULL,1),
 ('TipoVisita','Otros Soportes',NULL,2),
 ('TipoVisita','Mantenimiento Preventivo',NULL,3),
 ('TipoVisita','Instalación',NULL,4),
 ('TipoVisita','Retiro',NULL,5),
 ('TipoVisita','Visita Comercial',NULL,6),
 ('TipoVisita','Retiros de Agentes',NULL,7),
 ('TipoVisita','Planificacion Branding',NULL,8),
 ('CasoSoporte','Abrazo',NULL,1),
 ('CasoSoporte','Otros',NULL,2),
 ('CasoSoporte','Terminal',NULL,3),
 ('CasoSoporte','Impresora',NULL,4),
 ('CasoSoporte','Conectividad',NULL,5),
 ('Problema','Abrazo/Problema de servicio','Abrazo',1),
 ('Problema','Restablecimiento de servicio','Otros',1),
 ('Problema','Terminal no enciende','Terminal',1),
 ('Problema','Pantalla dañada','Terminal',2),
 ('Problema','Impresora sin papel / atasco','Impresora',1),
 ('Problema','Sin señal / sin internet','Conectividad',1),
 ('Solucion','Resolución de caso',NULL,1),
 ('Solucion','Restablecimiento realizado',NULL,2),
 ('Solucion','Cambio de equipo',NULL,3),
 ('Solucion','Configuración de equipo',NULL,4),
 ('Solucion','Escalado a soporte técnico',NULL,5),
 ('Razon','Reunión de Seguimiento',NULL,1),
 ('Razon','Soporte técnico',NULL,2),
 ('Razon','Revisión de inventario',NULL,3),
 ('Razon','Capacitación',NULL,4),
 ('SubRazon','Presentación de Propuesta Comercial','Reunión de Seguimiento',1),
 ('SubRazon','Renovación de contrato','Reunión de Seguimiento',2),
 ('SubRazon','Revisión de metas de venta','Reunión de Seguimiento',3),
 ('SubRazon','Revisión de equipo','Soporte técnico',1),
 ('SubRazon','Conteo de material','Revisión de inventario',1),
 ('SubRazon','Uso de terminal','Capacitación',1),
 ('TipoSolicitudRetiro','Retiro Agente',NULL,1),
 ('TipoSolicitudRetiro','Suspensión temporal',NULL,2),
 ('RazonRetiro','Bajo Desempeño',NULL,1),
 ('RazonRetiro','No le interesa vender',NULL,2),
 ('RazonRetiro','Cierre de negocio',NULL,3),
 ('RazonRetiro','Incumplimiento de pagos',NULL,4),
 ('TipoVisitaBranding','Mantenimiento',NULL,1),
 ('TipoVisitaBranding','Instalación',NULL,2),
 ('TipoVisitaBranding','Hotline',NULL,3),
 ('MaterialSugerido','Rótulo',NULL,1),
 ('MaterialSugerido','Banner',NULL,2),
 ('MaterialSugerido','Habladores',NULL,3),
 ('MaterialSugerido','Pintura de fachada',NULL,4),
 ('Prioridad','Baja',NULL,1),
 ('Prioridad','Media',NULL,2),
 ('Prioridad','Alta',NULL,3),
 ('Departamento','Francisco Morazan',NULL,1),
 ('Departamento','Cortés',NULL,2),
 ('Departamento','Atlántida',NULL,3),
 ('Municipio','Tegucigalpa','Francisco Morazan',1),
 ('Municipio','Valle de Ángeles','Francisco Morazan',2),
 ('Municipio','San Pedro Sula','Cortés',1),
 ('Municipio','Choloma','Cortés',2),
 ('Municipio','La Ceiba','Atlántida',1);

-- Usuarios de ejemplo (asignar clave con npm run crear-usuario)
INSERT INTO dbo.Usuarios (Nombre, Correo, Usuario, PasswordHash, Rol, Zona) VALUES
 ('Administrador VisitaPro','admin@visitapro.com','admin',NULL,'admin','Tegucigalpa'),
 ('Andrés Albry Cortés Orellana','andres.cortes@visitapro.com','acortes',NULL,'visitador','Tegucigalpa'),
 ('Olman Martínez','olman.martinez@visitapro.com','omartinez',NULL,'visitador','Tegucigalpa');

DECLARE @admin INT = (SELECT Id FROM dbo.Usuarios WHERE Usuario='admin');
DECLARE @andres INT = (SELECT Id FROM dbo.Usuarios WHERE Usuario='acortes');
DECLARE @olman INT = (SELECT Id FROM dbo.Usuarios WHERE Usuario='omartinez');

INSERT INTO dbo.Agentes (Codigo, Nombre, Departamento, Municipio, Direccion, Zona, SubZona, Localidad, Categoria,
  GerenteVentas, Asesor, PMRealizadoPor, UltimoPM, UltimaVisitaComercial, Latitud, Longitud, UsuarioAsignadoId) VALUES
 ('107','Tienda Asia','Francisco Morazan','Tegucigalpa','Colonia Suyapa, Calle Principal','Tegucigalpa','Suyapa','LOCAL','Level 4',
  'Gary Javier Torres Mackay','Andrés Albry Cortés Orellana','Olman Martínez','2026-08-13T00:00:00','2026-08-10T15:30:00',14.088236,-87.1915777,@admin),
 ('109','Pollos Del Rancho','Francisco Morazan','Tegucigalpa','Colonia Alameda, 2da Avenida, Casa 12','Tegucigalpa','Alameda','LOCAL','Level 3',
  'Gary Javier Torres Mackay','Andrés Albry Cortés Orellana','Olman Martínez','2026-07-20T00:00:00','2026-08-01T10:00:00',14.0912,-87.1990,@admin),
 ('105','Mercadito La Canada','Francisco Morazan','Tegucigalpa','Colonia Palmira, Calle 3','Tegucigalpa','Palmira','LOCAL','Level 2',
  'Gary Javier Torres Mackay','Andrés Albry Cortés Orellana','Olman Martínez',NULL,NULL,14.0960,-87.1950,@admin),
 ('112','La Bodegita Suyapa','Francisco Morazan','Tegucigalpa','Sur Oriente, Tegucigalpa','Tegucigalpa','Suyapa','LOCAL','Level 1',
  'Gary Javier Torres Mackay','Andrés Albry Cortés Orellana',NULL,NULL,NULL,14.0790,-87.1720,@andres),
 ('24567','Pulperia Olviser','Francisco Morazan','Tegucigalpa','Barrio Abajo, Tegucigalpa','Tegucigalpa','Centro','LOCAL','Level 2',
  'Gary Javier Torres Mackay','Andrés Albry Cortés Orellana',NULL,NULL,NULL,14.1010,-87.2050,@admin),
 ('23337','Punto Caruvas','Francisco Morazan','Tegucigalpa','Colonia Kennedy, Tegucigalpa','Tegucigalpa','Kennedy','LOCAL','Level 1',
  'Gary Javier Torres Mackay','Andrés Albry Cortés Orellana',NULL,NULL,NULL,14.0650,-87.1800,@olman);

DECLARE @asia INT = (SELECT Id FROM dbo.Agentes WHERE Codigo='107');
DECLARE @pollos INT = (SELECT Id FROM dbo.Agentes WHERE Codigo='109');
DECLARE @canada INT = (SELECT Id FROM dbo.Agentes WHERE Codigo='105');
DECLARE @bodegita INT = (SELECT Id FROM dbo.Agentes WHERE Codigo='112');
DECLARE @olviser INT = (SELECT Id FROM dbo.Agentes WHERE Codigo='24567');
DECLARE @caruvas INT = (SELECT Id FROM dbo.Agentes WHERE Codigo='23337');

INSERT INTO dbo.Activos (Prefijo, Codigo, Familia, Marca, Serie, Estado, AgenteId) VALUES
 ('LTE','LTE-5','TERMINALES','TOUCH DYNAMIC','Test001','Disponible',@asia),
 ('PFX','ACT-2845','TERMINALES','TOUCH DYNAMIC','TD-2845','Disponible',@asia),
 ('PFX','ACT-9012','TERMINALES','TOUCH DYNAMIC','TD-9012','En Bodega',NULL),
 ('PFX','ACT-9013','IMPRESORAS','EPSON','EP-9013','En Bodega',NULL),
 ('PFX','ACT-9014','TERMINALES','SUNMI','SM-9014','En Bodega',NULL),
 ('LTE','LTE-8','TERMINALES','TOUCH DYNAMIC','Test008','En Bodega',NULL);

INSERT INTO dbo.Visitas (AgenteId, UsuarioId, TipoVisita, Estado, Planificada, FechaPlanificada, HoraPlanificada, FechaInicio, FechaFin, Razon, Observaciones, FechaSincronizacion) VALUES
 (@asia,@admin,'Visita Comercial','Cerrada',1,'2026-08-13','10:30','2026-08-13T10:30:00','2026-08-13T11:20:00','Seguimiento y propuesta','Se presentó oferta de renovación y se acordó seguimiento para la próxima semana.','2026-08-13T11:21:00'),
 (@asia,@olman,'Hotline','En Proceso',1,'2026-08-12','16:15','2026-08-12T16:15:00',NULL,'Soporte técnico','Se revisó equipo y se solicitó repuesto; se programó visita técnica para confirmar entrega.',NULL),
 (@asia,@admin,'Visita Comercial','Cerrada',1,'2026-08-11','09:00','2026-08-11T09:00:00','2026-08-11T10:00:00','Propuesta comercial','Se presentó portafolio actualizado y se confirmó interés en ampliar cobertura.','2026-08-11T10:01:00'),
 (@asia,@andres,'Otros Soportes','Cancelada',1,'2026-08-10','14:30',NULL,NULL,'Revisión de inventario','Cancelada por cierre temporal del punto de venta.',NULL),
 (@asia,@olman,'Mantenimiento Preventivo','Cerrada',1,'2026-08-09','11:15','2026-08-09T11:15:00','2026-08-09T12:30:00','Mantenimiento preventivo','Se realizó revisión de equipos y se entregó material de apoyo.','2026-08-09T12:31:00'),
 (@asia,@admin,'Hotline','Programada',1,'2026-08-11','09:30',NULL,NULL,NULL,NULL,NULL),
 (@pollos,@admin,'Instalación','En Proceso',1,'2026-08-11','14:15','2026-08-11T14:15:00',NULL,NULL,NULL,NULL),
 (@canada,@admin,'Retiro','Cerrada',1,'2026-08-12','11:00','2026-08-12T11:00:00','2026-08-12T12:10:00',NULL,NULL,'2026-08-12T12:15:00'),
 (@bodegita,@admin,'Otros Soportes','Sin Programar',0,'2026-08-12','16:30',NULL,NULL,NULL,NULL,NULL);

INSERT INTO dbo.RetirosAgente (AgenteId, TipoSolicitud, RazonRetiro, Estado, CreadoPorId, FechaCreacion) VALUES
 (@asia,'Retiro Agente','Bajo Desempeño Comercial','Autorización Comercial',@admin,'2026-08-18T15:35:00'),
 (@olviser,'Retiro Agente','No le interesa vender','Saldos Pendientes',@admin,'2026-08-18T13:00:00'),
 (@caruvas,'Retiro Agente','Cierre de negocio','Orden Cerrada',@admin,'2026-08-18T09:45:00');

INSERT INTO dbo.Planificaciones (AgenteId, UsuarioId, Titulo, TipoVisita, Materiales, Comentario, Estado, FechaCreacion) VALUES
 (@asia,@admin,'AUT-PLANING BD-107','Mantenimiento','Rótulo exterior','Renovar rótulo dañado','Pendiente','2026-08-19T08:00:00'),
 (@olviser,@admin,'MANT-PREV-2026-08','Hotline','Habladores','Material de temporada','Completada','2026-08-17T08:00:00'),
 (@caruvas,@admin,'INST-EQUIPO-NVO','Instalación','Banner y rótulo','Nuevo punto de venta','En Proceso','2026-08-15T08:00:00');
GO
