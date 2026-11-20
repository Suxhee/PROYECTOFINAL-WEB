-------------CREACIÓN BASE DE DATOS ORIGENESSV (SQL Server)------------------

CREATE DATABASE OrigenesSV;
GO

USE OrigenesSV;
GO

-----------------------------------------------------------
----- 1. TABLAS INDEPENDIENTES

CREATE TABLE sucursal
(
  id_sucursal INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  direccion VARCHAR(200) NULL,
  departamento VARCHAR(20) NOT NULL,t
  telefono VARCHAR(20) NULL,
  correo VARCHAR(100) NOT NULL,
  activa BIT NOT NULL CONSTRAINT df_sucursal_activa DEFAULT 1,
  CONSTRAINT pk_sucursal PRIMARY KEY (id_sucursal),
  CONSTRAINT uq_sucursal_nombre UNIQUE (nombre),
  CONSTRAINT uq_sucursal_correo UNIQUE (correo),
  CONSTRAINT ck_sucursal_correo CHECK (correo LIKE '%@%.%')
);
GO

CREATE TABLE proveedor
(
  id_proveedor INT IDENTITY(1,1) NOT NULL,
  compañia VARCHAR(50) NOT NULL,
  nombre_contacto VARCHAR(50) NOT NULL,
  correo VARCHAR(50) NOT NULL,
  numero_telefonico VARCHAR(20) NULL,
  direccion VARCHAR(100) NULL,
  activo BIT NOT NULL CONSTRAINT df_proveedor_activo DEFAULT 1,
  CONSTRAINT pk_provedor PRIMARY KEY (id_proveedor),
  CONSTRAINT uq_proveedor_correo UNIQUE (correo),
  CONSTRAINT ck_proveedor_correo CHECK (correo LIKE '%@%.%')
);
GO

CREATE TABLE insumo
(
  id_insumo INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  marca VARCHAR(50) NULL,
  cant_unidad NUMERIC(10,2) NOT NULL,
  unidad_medida VARCHAR(10) NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  tipo_insumo VARCHAR(20) NOT NULL,
  activo BIT NOT NULL CONSTRAINT df_insumo_activo DEFAULT 1,
  CONSTRAINT pk_insumo PRIMARY KEY (id_insumo),
  CONSTRAINT ck_insumo_cant_unidad CHECK (cant_unidad > 0),
  CONSTRAINT ck_insumo_unidad_medida
    CHECK (unidad_medida IN ('g', 'kg', 'ml', 'l', 'oz', 'lb', 'unidad')),
  CONSTRAINT ck_insumo_precio_unitario CHECK (precio_unitario >= 0),
  CONSTRAINT ck_insumo_tipo CHECK (tipo_insumo IN ('INSUMO', 'REVENTA'))
);
GO

CREATE TABLE producto
(
  id_producto INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(200) NULL,
  tipo_producto VARCHAR(15) NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  disponible BIT NOT NULL CONSTRAINT df_producto_disponible DEFAULT 1,
  CONSTRAINT pk_producto PRIMARY KEY (id_producto),
  CONSTRAINT uq_producto_nombre UNIQUE (nombre),
  CONSTRAINT ck_producto_tipo_p CHECK (tipo_producto IN ('ELABORADO', 'REVENTA')),
  CONSTRAINT ck_producto_precio CHECK (precio >= 0)
);
GO

CREATE TABLE cargo_empleado
(
  id_cargo INT IDENTITY(1,1) NOT NULL,
  nombre_cargo VARCHAR(20) NOT NULL,
  descripcion VARCHAR(200) NULL,
  CONSTRAINT pk_cargo_empleado PRIMARY KEY (id_cargo),
  CONSTRAINT uq_cargo_nombre UNIQUE (nombre_cargo)
);
GO

CREATE TABLE periodo_pago
(
  id_periodo INT IDENTITY(1,1) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  fecha_pago DATE NOT NULL,
  estado VARCHAR(20) NOT NULL,
  CONSTRAINT pk_periodo_pago PRIMARY KEY (id_periodo),
  CONSTRAINT uq_periodo_fechas UNIQUE (fecha_inicio, fecha_fin),
  CONSTRAINT ck_periodo_fechas CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT ck_periodo_pago_fecha CHECK (fecha_pago >= fecha_fin),
  CONSTRAINT ck_periodo_estado CHECK (estado IN ('PENDIENTE', 'PAGADO', 'CANCELADO'))
);
GO

CREATE TABLE configuracion_deduccion
(
  id_configuracion INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  porcentaje NUMERIC(5,2) NOT NULL,
  limite_base NUMERIC(12,2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  activo BIT NOT NULL CONSTRAINT df_config_deduccion_activo DEFAULT 1,
  CONSTRAINT pk_config_deduccion PRIMARY KEY (id_configuracion),
  CONSTRAINT uq_config_deduccion UNIQUE (nombre, fecha_inicio),
  CONSTRAINT ck_config_ded_porcentaje CHECK (porcentaje BETWEEN 0 AND 100),
  CONSTRAINT ck_config_ded_limite CHECK (limite_base >= 0),
  CONSTRAINT ck_config_ded_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);
GO

-----------------------------------------------------------
----- 2. TABLAS DE PRIMER NIVEL DE DEPENDENCIA

CREATE TABLE caja
(
  id_caja INT IDENTITY(1,1) NOT NULL,
  numero_caja INT NOT NULL,
  abierta BIT NOT NULL CONSTRAINT df_caja_abierta DEFAULT 1,
  id_sucursal INT NOT NULL,
  CONSTRAINT pk_caja PRIMARY KEY (id_caja),
  CONSTRAINT fk_caja_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  -- Permite que no existan dos numeros de caja iguales en la misma sucursal
  CONSTRAINT uq_caja_sucursal_numero UNIQUE (id_sucursal, numero_caja),
  CONSTRAINT ck_caja_numero CHECK (numero_caja > 0)
);
GO

CREATE TABLE compra_inventario
(
  id_compra_inventario INT IDENTITY(1,1) NOT NULL,
  fecha_compra DATE NOT NULL,
  estado VARCHAR(15) NOT NULL CONSTRAINT df_compra_inv_estado DEFAULT 'PENDIENTE',
  subtotal DECIMAL(14,2) NOT NULL,
  iva DECIMAL(14,2) NOT NULL,
  total AS (CAST(subtotal + iva AS DECIMAL(14,2))) PERSISTED,
  id_sucursal INT NOT NULL,
  id_proveedor INT NOT NULL,
  CONSTRAINT pk_compra_inventario PRIMARY KEY (id_compra_inventario),
  CONSTRAINT fk_compra_inv_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT fk_compra_inv_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT ck_compra_inv_estado CHECK (estado IN ('PENDIENTE', 'REGISTRADA')),
  CONSTRAINT ck_compra_inv_subtotal CHECK (subtotal >= 0),
  CONSTRAINT ck_compra_inv_iva CHECK (iva >= 0),
  CONSTRAINT ck_compra_inv_total CHECK (total >= 0)
);
GO

CREATE TABLE sucursal_insumo
(
  id_sucursal_insumo INT IDENTITY(1,1) NOT NULL,
  stock_actual NUMERIC(14,3) NOT NULL,
  stock_minimo NUMERIC(14,3) NOT NULL,
  id_sucursal INT NOT NULL,
  id_insumo INT NOT NULL,
  CONSTRAINT pk_sucursal_insumo PRIMARY KEY (id_sucursal_insumo),
  CONSTRAINT fk_sucursal_insumo_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT fk_sucursal_insumo_insumo
    FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  -- Permite que no existan dos registros del mismo insumo en la misma sucursal
  CONSTRAINT uq_sucursal_insumo UNIQUE (id_sucursal, id_insumo),
  CONSTRAINT ck_sucursal_insumo_stock CHECK (stock_actual >= 0),
  CONSTRAINT ck_sucursal_insumo_minimo CHECK (stock_minimo >= 0)
);
GO

CREATE TABLE receta
(
  id_receta INT IDENTITY(1,1) NOT NULL,
  receta_disponible BIT NOT NULL CONSTRAINT df_receta_disponible DEFAULT 1,
  id_producto INT NOT NULL,
  CONSTRAINT pk_receta PRIMARY KEY (id_receta),
  CONSTRAINT fk_receta_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
);
GO

CREATE TABLE empleado
(
  id_empleado INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  dui VARCHAR(20) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NULL,
  fecha_ingreso DATE NULL,
  fecha_nacimiento DATE NULL,
  activo BIT NOT NULL CONSTRAINT df_empleado_activo DEFAULT 1,
  id_cargo INT NOT NULL,
  CONSTRAINT pk_empleado PRIMARY KEY (id_empleado),
  CONSTRAINT fk_empleado_cargo
    FOREIGN KEY (id_cargo) REFERENCES cargo_empleado(id_cargo)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT uq_empleado_dui UNIQUE (dui),
  CONSTRAINT uq_empleado_correo UNIQUE (correo),
  -- Formato 00000000-0 (en SQL Server no hay regex, se usa LIKE con rangos)
  CONSTRAINT ck_empleado_dui
    CHECK (dui LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9]'),
  CONSTRAINT ck_empleado_correo CHECK (correo LIKE '%@%.%')
);
GO

CREATE TABLE planilla
(
  id_planilla INT IDENTITY(1,1) NOT NULL,
  fecha_generacion DATE NOT NULL,
  total_bruto NUMERIC(12,2) NOT NULL,
  total_deducciones NUMERIC(12,2) NOT NULL,
  total_neto NUMERIC(12,2) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  id_periodo INT NOT NULL,
  CONSTRAINT pk_planilla PRIMARY KEY (id_planilla),
  CONSTRAINT fk_planilla_periodo
    FOREIGN KEY (id_periodo) REFERENCES periodo_pago(id_periodo)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT ck_planilla_bruto CHECK (total_bruto >= 0),
  CONSTRAINT ck_planilla_neto CHECK (total_neto >= 0),
  CONSTRAINT ck_planilla_deducciones CHECK (total_deducciones >= 0),
  CONSTRAINT ck_planilla_estado
    CHECK (estado IN ('BORRADOR', 'GENERADA', 'PAGADA', 'ANULADA'))
);
GO

-----------------------------------------------------------
----- 3. TABLAS DE SEGUNDO NIVEL DE DEPENDENCIA -----------

CREATE TABLE asignacion_sucursal
(
  id_asignacion INT IDENTITY(1,1) NOT NULL,
  fecha_asignacion DATE NOT NULL,
  fecha_fin DATE NULL,
  estado BIT NOT NULL CONSTRAINT df_asignacion_suc_activa DEFAULT 1,
  id_sucursal INT NOT NULL,
  id_empleado INT NOT NULL,
  CONSTRAINT pk_asignacion_sucursal PRIMARY KEY (id_asignacion),
  CONSTRAINT fk_asignacion_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT fk_asignacion_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT ck_asignacion_fechas
    CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_asignacion)
);
GO

CREATE TABLE turno_caja
(
  id_turno INT IDENTITY(1,1) NOT NULL,
  id_empleado INT NOT NULL,
  id_caja INT NOT NULL,
  fecha_inicio DATETIME2(0) NOT NULL CONSTRAINT df_turno_fecha_inicio DEFAULT SYSDATETIME(),
  fecha_cierre DATETIME2(0) NULL,
  monto_inicial NUMERIC(14,2) NOT NULL,
  monto_esperado NUMERIC(14,2) NULL,
  monto_cierre NUMERIC(14,2) NULL,
  diferencia AS (CAST(monto_cierre - monto_esperado AS NUMERIC(14,2))) PERSISTED,
  CONSTRAINT pk_turno_caja PRIMARY KEY (id_turno),
  CONSTRAINT fk_turno_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT fk_turno_caja
    FOREIGN KEY (id_caja) REFERENCES caja(id_caja)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT ck_turno_monto_inicial CHECK (monto_inicial >= 0),
  CONSTRAINT ck_turno_monto_esperado CHECK (monto_esperado IS NULL OR monto_esperado >= 0),
  CONSTRAINT ck_turno_monto_cierre CHECK (monto_cierre IS NULL OR monto_cierre >= 0),
  CONSTRAINT ck_turno_fechas CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_inicio),
  -- Verificar que fecha de cierre y monto de cierre se llenan juntos
  CONSTRAINT ck_turno_cierre_completo CHECK (
    (fecha_cierre IS NULL AND monto_cierre IS NULL)
    OR (fecha_cierre IS NOT NULL AND monto_cierre IS NOT NULL)
  )
);
GO

CREATE TABLE factura_compra
(
  id_factura INT IDENTITY(1,1) NOT NULL,
  total DECIMAL(14,2) NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_limite DATE NULL,
  pagada BIT NOT NULL CONSTRAINT df_factura_pagada DEFAULT 1,
  id_compra_inventario INT NOT NULL,
  CONSTRAINT pk_factura_compra PRIMARY KEY (id_factura),
  CONSTRAINT fk_fac_compra_compra_inv
    FOREIGN KEY (id_compra_inventario) REFERENCES compra_inventario(id_compra_inventario)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  -- Una compra genera una factura
  CONSTRAINT uq_fac_compra_compra_inv UNIQUE (id_compra_inventario),
  CONSTRAINT ck_fac_compra_total CHECK (total >= 0),
  CONSTRAINT ck_fac_compra_fechas CHECK (fecha_limite IS NULL OR fecha_limite >= fecha_emision)
);
GO

CREATE TABLE detalle_compra
(
  id_detalle_compra INT IDENTITY(1,1) NOT NULL,
  cantidad_paquete INT NOT NULL, -- EJ: 40 Bolsas de pan
  costo_paquete NUMERIC(10,2) NOT NULL,
  unidades_paquete INT NOT NULL, -- EJ: Bolsa de pan = 24 panes
  subtotal AS (CAST(cantidad_paquete * costo_paquete AS DECIMAL(14,2))) PERSISTED,
  id_compra_inventario INT NOT NULL,
  id_insumo INT NOT NULL,
  CONSTRAINT pk_detalle_compra PRIMARY KEY (id_detalle_compra),
  CONSTRAINT fk_det_compra_compra
    FOREIGN KEY (id_compra_inventario) REFERENCES compra_inventario(id_compra_inventario)
    ON UPDATE NO ACTION
    ON DELETE CASCADE,
  CONSTRAINT fk_det_compra_insumo
    FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  -- Evita que el mismo insumo aparezca dos veces dentro de la misma compra.
  CONSTRAINT uq_det_compra_insumo UNIQUE (id_compra_inventario, id_insumo),
  CONSTRAINT ck_det_compra_cant_paquete CHECK (cantidad_paquete >= 0),
  CONSTRAINT ck_det_compra_unidades CHECK (unidades_paquete > 0),
  CONSTRAINT ck_det_compra_costo CHECK (costo_paquete >= 0)
);
GO

CREATE TABLE pedido
(
  id_pedido INT IDENTITY(1,1) NOT NULL,
  tipo_pedido VARCHAR(15) NOT NULL,
  estado VARCHAR(15) NOT NULL CONSTRAINT df_pedido_estado DEFAULT 'PENDIENTE',
  fecha DATETIME2(0) NOT NULL CONSTRAINT df_pedido_fecha DEFAULT SYSDATETIME(),
  total NUMERIC(10,2) NOT NULL,
  id_empleado INT NOT NULL,
  id_sucursal INT NOT NULL,
  CONSTRAINT pk_pedido PRIMARY KEY (id_pedido),
  CONSTRAINT fk_pedido_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT fk_pedido_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT ck_pedido_tipo CHECK (tipo_pedido IN ('LOCAL', 'DOMICILIO', 'LLEVAR')),
  CONSTRAINT ck_pedido_estado CHECK (estado IN ('PENDIENTE', 'ENTREGADO', 'CANCELADO')),
  CONSTRAINT ck_pedido_total CHECK (total >= 0)
);
GO

CREATE TABLE detalle_receta
(
  id_detalle INT IDENTITY(1,1) NOT NULL,
  cantidad_insumo NUMERIC(10,2) NOT NULL,
  id_receta INT NOT NULL,
  id_insumo INT NOT NULL,
  CONSTRAINT pk_detalle_receta PRIMARY KEY (id_detalle),
  CONSTRAINT fk_det_receta_receta
    FOREIGN KEY (id_receta) REFERENCES receta(id_receta)
    ON UPDATE NO ACTION
    ON DELETE CASCADE,
  CONSTRAINT fk_det_receta_insumo
    FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  -- Evita que el mismo insumo aparezca dos veces dentro de la misma receta.
  CONSTRAINT uq_det_receta_insumo UNIQUE (id_receta, id_insumo),
  CONSTRAINT ck_detalle_receta_cantidad CHECK (cantidad_insumo >= 0)
);
GO

CREATE TABLE detalle_planilla
(
  id_detalle_planilla INT IDENTITY(1,1) NOT NULL,
  salario_bruto NUMERIC(12,2) NOT NULL,
  salario_neto NUMERIC(12,2) NOT NULL,
  total_deducciones NUMERIC(12,2) NOT NULL,
  id_planilla INT NOT NULL,
  id_empleado INT NOT NULL,
  CONSTRAINT pk_detalle_planilla PRIMARY KEY (id_detalle_planilla),
  CONSTRAINT fk_detalle_planilla_planilla
    FOREIGN KEY (id_planilla) REFERENCES planilla(id_planilla)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT fk_detalle_planilla_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  -- Evita que el mismo empleado aparezca dos veces en una planilla
  CONSTRAINT uq_planilla_empleado UNIQUE (id_planilla, id_empleado),
  CONSTRAINT ck_detalle_salario_bruto CHECK (salario_bruto >= 0),
  CONSTRAINT ck_detalle_salario_neto CHECK (salario_neto >= 0),
  CONSTRAINT ck_detalle_deducciones CHECK (total_deducciones >= 0)
);
GO

-----------------------------------------------------------
----- 4. TABLAS DE TERCER NIVEL DE DEPENDENCIA -----------

CREATE TABLE pago_proveedor
(
  id_pago INT IDENTITY(1,1) NOT NULL,
  fecha_pago DATE NOT NULL,
  monto DECIMAL(14,2) NOT NULL,
  metodo_pago VARCHAR(15) NOT NULL,
  id_factura INT NOT NULL,
  CONSTRAINT pk_pago_proveedor PRIMARY KEY (id_pago),
  CONSTRAINT fk_pago_proveedor_factura_c
    FOREIGN KEY (id_factura) REFERENCES factura_compra(id_factura)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT ck_pago_proveedor_monto CHECK (monto >= 0),
  CONSTRAINT ck_pago_prov_metodo_pago
    CHECK (metodo_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE'))
);
GO

CREATE TABLE detalle_pedido
(
  id_detalle INT IDENTITY(1,1) NOT NULL,
  cantidad INT NOT NULL, -- cantidad de productos
  precio_unitario NUMERIC(10,2) NOT NULL,
  sub_total AS (CAST(cantidad * precio_unitario AS DECIMAL(14,2))) PERSISTED,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  CONSTRAINT pk_detalle_pedido PRIMARY KEY (id_detalle),
  CONSTRAINT fk_det_pedido_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
    ON UPDATE NO ACTION
    ON DELETE CASCADE,
  CONSTRAINT fk_det_pedido_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT ck_det_pedido_precio_u CHECK (precio_unitario >= 0)
);
GO

CREATE TABLE factura_pedido
(
  id_factura_pedido INT IDENTITY(1,1) NOT NULL,
  fecha_emision DATE NOT NULL,
  sub_total DECIMAL(14,2) NOT NULL,
  iva DECIMAL(14,2) NOT NULL,
  total AS (CAST(sub_total + iva AS DECIMAL(14,2))) PERSISTED NOT NULL,
  pagada BIT NOT NULL CONSTRAINT df_fac_pedido_pagada DEFAULT 0,
  id_pedido INT NOT NULL,
  CONSTRAINT pk_factura_pedido PRIMARY KEY (id_factura_pedido),
  CONSTRAINT fk_fac_pedido_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT uq_factura_pedido UNIQUE (id_pedido),
  CONSTRAINT ck_fac_pedido_subtotal CHECK (sub_total >= 0),
  CONSTRAINT ck_fac_pedido_iva CHECK (iva >= 0),
  CONSTRAINT ck_fac_pedido_total CHECK (total >= 0)
);
GO

CREATE TABLE detalle_deduccion
(
  id_deduccion INT IDENTITY(1,1) NOT NULL,
  concepto VARCHAR(200) NOT NULL,
  base_calculo NUMERIC(12,2) NOT NULL,
  porcentaje NUMERIC(5,2) NOT NULL,
  monto_deduccion NUMERIC(12,2) NOT NULL,
  id_configuracion INT NOT NULL,
  id_detalle_planilla INT NOT NULL,
  CONSTRAINT pk_detalle_deduccion PRIMARY KEY (id_deduccion),
  CONSTRAINT fk_deduccion_configuracion
    FOREIGN KEY (id_configuracion) REFERENCES configuracion_deduccion(id_configuracion)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT fk_deduccion_detalle_planilla
    FOREIGN KEY (id_detalle_planilla) REFERENCES detalle_planilla(id_detalle_planilla)
    ON UPDATE NO ACTION
    ON DELETE CASCADE,
  -- Evita que a un empleado se le aplique la misma deducción dos veces en su línea de planilla
  CONSTRAINT uq_det_deduccion UNIQUE (id_detalle_planilla, id_configuracion),
  CONSTRAINT ck_det_ded_base CHECK (base_calculo >= 0),
  CONSTRAINT ck_det_ded_porcentaje CHECK (porcentaje BETWEEN 0 AND 100),
  CONSTRAINT ck_det_ded_monto CHECK (monto_deduccion >= 0)
);
GO

-----------------------------------------------------------
------ 5. TABLA DE CUARTO NIVEL DE DEPENDENCIA -----------

CREATE TABLE pago_caja
(
  id_pago INT IDENTITY(1,1) NOT NULL,
  fecha_pago DATETIME2(0) NOT NULL CONSTRAINT df_pago_caja_fecha DEFAULT SYSDATETIME(),
  metodo_pago VARCHAR(15) NOT NULL,
  monto_total NUMERIC(14,2) NOT NULL,
  id_turno INT NOT NULL,
  id_factura_pedido INT NOT NULL,
  CONSTRAINT pk_pago_caja PRIMARY KEY (id_pago),
  CONSTRAINT fk_pago_caja_turno
    FOREIGN KEY (id_turno) REFERENCES turno_caja(id_turno)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT fk_pago_caja_factura
    FOREIGN KEY (id_factura_pedido) REFERENCES factura_pedido(id_factura_pedido)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT ck_pago_caja_metodo_pago CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA')),
  CONSTRAINT ck_pago_caja_monto CHECK (monto_total > 0)
);
GO
