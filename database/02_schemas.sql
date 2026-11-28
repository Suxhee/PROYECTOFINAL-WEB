
------------- ESQUEMAS DE LA BASE DE DATOS ------------------

USE OrigenesSV;
GO

-----------------------------------------------------------
----- 1. CREAR ESQUEMAS

CREATE SCHEMA catalogo AUTHORIZATION dbo; 
GO

CREATE SCHEMA inventario AUTHORIZATION dbo;
GO

CREATE SCHEMA compras AUTHORIZATION dbo;
GO

CREATE SCHEMA ventas AUTHORIZATION dbo;
GO

CREATE SCHEMA caja AUTHORIZATION dbo;
GO

CREATE SCHEMA rrhh AUTHORIZATION dbo;
GO

CREATE SCHEMA nomina AUTHORIZATION dbo;
GO

CREATE SCHEMA seguridad AUTHORIZATION dbo;
GO

CREATE SCHEMA reportes AUTHORIZATION dbo;
GO

-----------------------------------------------------------
----- 2. MOVER LAS TABLAS A LOS ESQUEMAS

-- Catalogo
ALTER SCHEMA catalogo TRANSFER dbo.sucursal;
ALTER SCHEMA catalogo TRANSFER dbo.producto;
ALTER SCHEMA catalogo TRANSFER dbo.insumo;
ALTER SCHEMA catalogo TRANSFER dbo.receta;
ALTER SCHEMA catalogo TRANSFER dbo.detalle_receta;

-- Inventario
ALTER SCHEMA inventario TRANSFER dbo.sucursal_insumo;
ALTER SCHEMA inventario TRANSFER dbo.merma;
ALTER SCHEMA inventario TRANSFER dbo.movimiento;

-- Compras
ALTER SCHEMA compras TRANSFER dbo.proveedor;
ALTER SCHEMA compras TRANSFER dbo.compra_inventario;
ALTER SCHEMA compras TRANSFER dbo.detalle_compra;
ALTER SCHEMA compras TRANSFER dbo.factura_compra;
ALTER SCHEMA compras TRANSFER dbo.pago_proveedor;

--Ventas
ALTER SCHEMA ventas TRANSFER dbo.pedido;
ALTER SCHEMA ventas TRANSFER dbo.detalle_pedido;
ALTER SCHEMA ventas TRANSFER dbo.factura_pedido;

--Caja
ALTER SCHEMA caja TRANSFER dbo.caja;
ALTER SCHEMA caja TRANSFER dbo.turno_caja;
ALTER SCHEMA caja TRANSFER dbo.pago_caja;
ALTER SCHEMA caja TRANSFER dbo.cuadre_parcial;

--rrhh
ALTER SCHEMA rrhh TRANSFER dbo.empleado;
ALTER SCHEMA rrhh TRANSFER dbo.asignacion_sucursal;
ALTER SCHEMA rrhh TRANSFER dbo.cargo_empleado;

--Nomina
ALTER SCHEMA nomina TRANSFER dbo.planilla;
ALTER SCHEMA nomina TRANSFER dbo.detalle_planilla;
ALTER SCHEMA nomina TRANSFER dbo.detalle_deduccion;
ALTER SCHEMA nomina TRANSFER dbo.configuracion_deduccion;
ALTER SCHEMA nomina TRANSFER dbo.periodo_pago;

--Seguridad
ALTER SCHEMA seguridad TRANSFER dbo.usuario;
ALTER SCHEMA seguridad TRANSFER dbo.sesion;

--consultar esquemas existentes
SELECT
    s.name AS esquema,
    t.name AS tabla
FROM sys.tables AS t
INNER JOIN sys.schemas AS s
    ON t.schema_id = s.schema_id
ORDER BY s.name, t.name;
GO