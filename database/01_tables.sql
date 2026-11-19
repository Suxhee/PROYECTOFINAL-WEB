-------------CREACIÓN BASE DE DATOS ORIGENESSV------------------

create database OrigenesSV;

-----------------------------------------------------------
----- 1. TABLAS INDEPENDIENTES

CREATE TABLE sucursal
(
  id_sucursal INT GENERATED ALWAYS AS IDENTITY,
  nombres VARCHAR(50) NOT NULL,
  direccion VARCHAR(200),
  departamento VARCHAR(20) NOT NULL,
  telefono VARCHAR(20),
  correo VARCHAR(100) NOT NULL,
  estado VARCHAR(15) NOT NULL,
  CONSTRAINT  pk_sucursal PRIMARY KEY(id_sucursal),
  CONSTRAINT  uq_sucursal_correo UNIQUE (correo),
  CONSTRAINT ck_sucursal_correo CHECK (correo LIKE '%@%.%'),
  CONSTRAINT ck_sucursal_estado CHECK (estado IN ('ACTIVA','INACTIVA'))
);

CREATE TABLE provedor
(
  id_proveedor INT GENERATED ALWAYS AS IDENTITY,
  compañia VARCHAR(50) NOT NULL,
  nombre_contacto VARCHAR(50) NOT NULL,
  correo VARCHAR(50) NOT NULL,
  numero_telefonico VARCHAR(20),
  Direccion VARCHAR(100),
  activo BOOLEAN NOT NULL CONSTRAINT df_proveedor_activo DEFAULT TRUE,
  CONSTRAINT pk_provedor PRIMARY KEY (id_proveedor),
  CONSTRAINT ck_proveedor_correo CHECK (correo LIKE '%@%.%')
);

CREATE TABLE insumo
(
  id_insumo INT GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR(100) NOT NULL,
  marca VARCHAR(50),
  cant_unidad NUMERIC(10,2) NOT NULL, 
  unidad_medida VARCHAR(10) NOT NULL, -- gramos(g), litroS(l), etc..
  precio_unitario NUMERIC(10,2) NOT NULL,
  tipo_insumo VARCHAR(20) NOT NULL,
  activo BOOLEAN NOT NULL CONSTRAINT df_insumo_activo DEFAULT TRUE,
  CONSTRAINT pk_insumo PRIMARY KEY (id_insumo),
  CONSTRAINT ck_insumo_cant_unidad CHECK (cant_unidad >= 0),
  CONSTRAINT ck_insumo_precio_unitario CHECK (precio_unitario >= 0),
  CONSTRAINT ck_insumo_tipo CHECK(tipo_insumo in ('INSUMO','REVENTA'))
);

CREATE TABLE producto
(
  id_producto INT GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(200),
  tipo_producto VARCHAR(15) NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  disponible BOOLEAN NOT NULL CONSTRAINT df_producto_disponible DEFAULT TRUE,
  CONSTRAINT pk_producto PRIMARY KEY (id_producto),
  CONSTRAINT ck_producto_tipo_p CHECK (tipo_producto IN ('ELABORADO','REVENTA')),
  CONSTRAINT ck_producto_precio CHECK (precio >= 0)
);

CREATE TABLE cargo_empleado
(
  id_cargo INT GENERATED ALWAYS AS IDENTITY,
  nombre_cargo VARCHAR(20) NOT NULL,
  descripcion VARCHAR(200),
  CONSTRAINT pk_cargo_empleado PRIMARY KEY (id_cargo),
  CONSTRAINT uq_cargo_nombre UNIQUE (nombre_cargo)
);

CREATE TABLE periodo_pago
(
  id_periodo INT GENERATED ALWAYS AS IDENTITY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  fecha_pago DATE NOT NULL,
  estado VARCHAR(20) NOT NULL,
  CONSTRAINT pk_periodo_pago PRIMARY KEY (id_periodo),
  CONSTRAINT ck_periodo_fechas CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT ck_periodo_pago_fecha CHECK (fecha_pago >= fecha_fin),
  CONSTRAINT ck_periodo_estado CHECK (estado IN ('PENDIENTE', 'PAGADO', 'CANCELADO'))
);

CREATE TABLE configuracion_deduccion 
(
  id_configuracion INT GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR(50) NOT NULL,
  porcentaje NUMERIC(5,2) NOT NULL,
  limite_base NUMERIC(12,2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_config_deduccion PRIMARY KEY (id_configuracion),
  CONSTRAINT ck_deduccion_porcentaje CHECK (porcentaje BETWEEN 0 AND 100),
  CONSTRAINT ck_deduccion_limite CHECK (limite_base >= 0),
  CONSTRAINT ck_deduccion_fechas CHECK (fecha_fin >= fecha_inicio)
);

-----------------------------------------------------------
----- 2. TABLAS DE PRIMER NIVEL DE DEPENDENCIA

CREATE TABLE caja
(
  id_caja INT GENERATED ALWAYS AS IDENTITY,
  abierta BOOLEAN NOT NULL CONSTRAINT df_caja_abierta DEFAULT true,
  id_sucursal INT NOT NULL,
  CONSTRAINT pk_caja PRIMARY KEY (id_caja),
  CONSTRAINT fk_caja_sucursal 
  FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
  ON UPDATE CASCADE
  ON DELETE NO action
);

CREATE TABLE compra_inventario
(
  id_compra_inventario INT GENERATED ALWAYS AS IDENTITY,
  fecha_compra DATE NOT NULL,
  estado VARCHAR(15) NOT NULL CONSTRAINT df_compra_inv_estado DEFAULT 'PENDIENTE',
  subtotal DECIMAL(14,2) NOT NULL,
  iva DECIMAL(14,2) NOT NULL,
  total DECIMAL(14,2) NOT NULL,
  id_sucursal INT NOT NULL,
  id_proveedor INT NOT NULL,
  CONSTRAINT pk_compra_inventario PRIMARY KEY (id_compra_inventario),
  CONSTRAINT fk_compra_inv_sucursal 
  FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT fk_compra_inv_proveedor 
  FOREIGN KEY (id_proveedor) REFERENCES provedor(id_proveedor)
  ON UPDATE CASCADE
  ON DELETE NO action,
  CONSTRAINT ck_compra_inv_estado CHECK (estado IN ('PENDIENTE','REGISTRADA')),
  CONSTRAINT ck_compra_inv_subtotal CHECK (subtotal >= 0),
  CONSTRAINT ck_compra_inv_total CHECK (total >= 0)
);

CREATE TABLE sucursal_insumo
(
  id_sucursal_insumo INT GENERATED ALWAYS AS IDENTITY,
  stock_actual NUMERIC(14,3) not NULL,
  stock_minimo NUMERIC(14,3) not NULL,
  id_sucursal INT NOT NULL,
  id_insumo INT NOT NULL,
  CONSTRAINT pk_sucursal_insumo PRIMARY KEY (id_sucursal_insumo),
  CONSTRAINT fk_sucursal_insumo_sucursal
  FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT fk_sucursal_insumo_insumo
  FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT uq_sucursal_insumo UNIQUE (id_sucursal, id_insumo), --Permite que no existan dos registros del mismo insumo en la misma sucursal
  CONSTRAINT ck_sucursal_insumo_stock CHECK (stock_actual >= 0),
  CONSTRAINT ck_sucursal_insumo_minimo CHECK (stock_minimo >= 0)
);

CREATE TABLE receta
(
  id_receta INT GENERATED ALWAYS AS IDENTITY,
  receta_disponible BOOLEAN NOT NULL CONSTRAINT df_receta_disponible DEFAULT TRUE,
  id_producto INT NOT NULL,
  CONSTRAINT pk_receta PRIMARY KEY (id_receta),
  CONSTRAINT fk_receta_producto 
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
  ON UPDATE CASCADE
  ON DELETE NO ACTION
);

CREATE TABLE empleado
(
  id_empleado INT GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR(150) NOT NULL,
  dui VARCHAR(20) NOT NULL, -- u
  correo CHAR(100) NOT NUlL,
  telefono VARCHAR(20),
  fecha_ingreso DATE,
  fecha_nacimiento DATE,
  activo BOOLEAN NOT NULL CONSTRAINT df_empleado_activo DEFAULT TRUE,
  id_cargo INT NOT NULL,
  CONSTRAINT pk_empleado PRIMARY KEY (id_empleado),
  CONSTRAINT fk_empleado_cargo 
  FOREIGN KEY (id_cargo) REFERENCES cargo_empleado(id_cargo)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT uq_empleado_dui UNIQUE (dui),
  CONSTRAINT ck_empleado_correo CHECK (correo LIKE '%@%.%')
);

CREATE TABLE planilla 
(
  id_planilla INT GENERATED ALWAYS AS IDENTITY,
  fecha_generacion DATE NOT NULL,
  total_bruto NUMERIC(12,2) NOT NULL,
  total_neto NUMERIC(12,2) NOT NULL,
  total_deducciones NUMERIC(12,2) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  id_periodo INT NOT NULL,
  CONSTRAINT pk_planilla PRIMARY KEY (id_planilla),
  CONSTRAINT uq_planilla_periodo
  UNIQUE (id_periodo),
  CONSTRAINT fk_planilla_periodo
  FOREIGN KEY (id_periodo) REFERENCES periodo_pago(id_periodo)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT ck_planilla_bruto
  CHECK (total_bruto >= 0),
  CONSTRAINT ck_planilla_neto
  CHECK (total_neto >= 0),
  CONSTRAINT ck_planilla_deducciones
  CHECK (total_deducciones >= 0),
  CONSTRAINT ck_planilla_estado
  CHECK (estado IN ('BORRADOR', 'GENERADA', 'PAGADA', 'ANULADA'))
);

-----------------------------------------------------------
----- 3. TABLAS DE SEGUNDO NIVEL DE DEPENDENCIA -----------

CREATE TABLE asignacion_sucursal 
(
  id_asignacion INT GENERATED ALWAYS AS IDENTITY,
  fecha_asignacion DATE NOT NULL,
  fecha_fin DATE,
  estado BOOLEAN NOT NULL CONSTRAINT df_asignacion_suc_activa DEFAULT TRUE,
  id_sucursal INT NOT NULL,
  id_empleado INT NOT NULL,
  CONSTRAINT pk_asignacion_sucursal PRIMARY KEY (id_asignacion),
  CONSTRAINT fk_asignacion_sucursal
  FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT fk_asignacion_empleado
  FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT ck_asignacion_fechas
  CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_asignacion)
);

CREATE TABLE turno_caja
(
  id_turno INT GENERATED ALWAYS AS IDENTITY,
  id_empleado INT NOT NULL,
  id_caja INT NOT NULL,
  fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP,
  monto_inicial NUMERIC(14,2) NOT NULL,
  monto_esperado NUMERIC(14,2),              
  monto_cierre NUMERIC(14,2),              
  diferencia NUMERIC(14,2) GENERATED ALWAYS AS (monto_cierre - monto_esperado) STORED,
  CONSTRAINT pk_turno_caja PRIMARY KEY (id_turno),
  CONSTRAINT fk_turno_empleado 
  FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT fk_turno_caja 
  FOREIGN KEY (id_caja) REFERENCES caja(id_caja)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT ck_turno_monto_inicial CHECK (monto_inicial >= 0),
  CONSTRAINT ck_turno_monto_cierre CHECK (monto_cierre IS NULL OR monto_cierre >= 0),
  CONSTRAINT ck_turno_fechas CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_inicio)
);

CREATE TABLE factura_compra
(
  id_factura INT GENERATED ALWAYS AS IDENTITY,
  total DECIMAL(14,2) NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_limite DATE,
  pagada BOOLEAN NOT NULL CONSTRAINT df_factura_pagada DEFAULT TRUE,
  id_compra_inventario INT NOT NULL,
  CONSTRAINT pk_factura_compra PRIMARY KEY (id_factura),
  CONSTRAINT fk_fac_compra_compra_inv 
  FOREIGN KEY (id_compra_inventario) REFERENCES compra_inventario(id_compra_inventario)
  ON UPDATE CASCADE
  ON DELETE NO action,
  CONSTRAINT ck_fac_compra_total CHECK (total >= 0)
);

CREATE TABLE detalle_compra
(
  id_compra INT GENERATED ALWAYS AS IDENTITY,
  cantidad_paquete INT NOT NULL,--EJ: 40 Bolsas de pan
  costo_paquete NUMERIC(10,2) NOT NULL,
  unidades_paquete INT NOT NULL, --EJ: Bolsa de pan = 24 panes
  subtotal  DECIMAL(14,2) 
  GENERATED ALWAYS AS (cantidad_paquete * costo_paquete) STORED,
  id_compra_inventario INT NOT NULL,
  id_insumo INT NOT NULL,
  CONSTRAINT pk_detalle_compra PRIMARY KEY (id_compra),
  CONSTRAINT fk_det_compra_compra 
  FOREIGN KEY (id_compra_inventario) REFERENCES compra_inventario(id_compra_inventario)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT fk_det_compra_insumo 
  FOREIGN KEY (id_insumo) REFERENCES INSUMO(id_insumo)
  ON UPDATE CASCADE
  ON DELETE NO action,
  CONSTRAINT ck_det_compra_cant_paquete CHECK (cantidad_paquete >= 0),
  CONSTRAINT ck_det_compra_unidades CHECK (unidades_paquete > 0),
  CONSTRAINT ck_det_compra_costo CHECK (costo_paquete >= 0)
);

CREATE TABLE pedido
(
  id_pedido INT GENERATED ALWAYS AS IDENTITY,
  tipo_pedido VARCHAR(15) NOT NULL,
  estado VARCHAR(15) NOT NULL,
  fecha DATE NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  id_empleado INT NOT NULL,
  id_sucursal INT NOT NULL,
  CONSTRAINT pk_pedido PRIMARY KEY (id_pedido),
  CONSTRAINT fk_pedido_empleado 
  FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
  ON UPDATE CASCADE
  ON DELETE SET NULL,
  CONSTRAINT fk_pedido_sucursal 
  FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT ck_pedido_tipo CHECK (estado IN ('LOCAL', 'DOMICILIO', 'LLEVAR')),
  CONSTRAINT ck_pedido_estado CHECK (estado IN ('PENDIENTE', 'ENTREGADO', 'CANCELADO')),
  CONSTRAINT ck_pedido_total CHECK (total >= 0)
);

CREATE TABLE detalle_receta
(
  id_detalle INT GENERATED ALWAYS AS IDENTITY,
  cantidad_insumo NUMERIC(10,2) NOT NULL,
  id_receta INT NOT NULL,
  id_insumo INT NOT NULL,
  CONSTRAINT pk_detalle_receta PRIMARY KEY (id_detalle),
  CONSTRAINT fk_det_receta_receta 
  FOREIGN KEY (id_receta) REFERENCES receta(id_receta)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT fk_det_receta_insumo
  FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT ck_detalle_receta_cantidad CHECK (cantidad_insumo >= 0)
);

CREATE TABLE detalle_planilla 
(
 id_detalle_planilla INT GENERATED ALWAYS AS IDENTITY,
 salario_bruto NUMERIC(12,2) NOT NULL,
 salario_neto NUMERIC(12,2) NOT NULL,
 total_deducciones NUMERIC(12,2) NOT NULL,
 id_planilla INT NOT NULL,
 id_empleado INT NOT NULL,
 CONSTRAINT pk_detalle_planilla PRIMARY KEY (id_detalle_planilla),
 CONSTRAINT fk_detalle_planilla_planilla
 FOREIGN KEY (id_planilla) REFERENCES planilla(id_planilla)
 ON UPDATE CASCADE
 ON DELETE NO ACTION,
 CONSTRAINT fk_detalle_planilla_empleado
 FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
 ON UPDATE CASCADE
 ON DELETE NO ACTION,
 CONSTRAINT uq_planilla_empleado
 UNIQUE (id_planilla, id_empleado),
 CONSTRAINT ck_detalle_salario_bruto
 CHECK (salario_bruto >= 0),
 CONSTRAINT ck_detalle_salario_neto
 CHECK (salario_neto >= 0),
 CONSTRAINT ck_detalle_deducciones
 CHECK (total_deducciones >= 0)
);

-----------------------------------------------------------
----- 3. TABLAS DE TERCER NIVEL DE DEPENDENCIA -----------

CREATE TABLE pago_proveedor
(
  id_pago INT GENERATED ALWAYS AS IDENTITY,
  fecha_pago DATE NOT NULL,
  monto  DECIMAL(14,2) NOT NULL,
  metodo_pago VARCHAR(15) NOT NULL,
  id_factura INT NOT NULL,
  CONSTRAINT pk_pago_proveedor PRIMARY KEY (id_pago),
  CONSTRAINT fk_pago_proveedor_factura_c 
  FOREIGN KEY (id_factura) REFERENCES factura_compra(id_factura)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT ck_pago_proveedor_monto CHECK (monto >= 0),
  CONSTRAINT ck_pago_prov_metodo_pago CHECK (metodo_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE'))
);

CREATE TABLE detalle_pedido
(
  id_detalle INT GENERATED ALWAYS AS IDENTITY,
  cantidad INT NOT NULL, --cantidad de productos
  precio_unitario NUMERIC(10,2) NOT NULL,
  sub_total DECIMAL(14,2) 
  GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  CONSTRAINT pk_detalle_pedido PRIMARY KEY (id_detalle),
  CONSTRAINT fk_det_pedido_pedido
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT fk_det_pedido_producto
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
  ON UPDATE CASCADE
  ON DELETE NO action,
  CONSTRAINT ck_det_pedido_precio_u CHECK (precio_unitario >= 0)
);

CREATE TABLE factura_pedido
(
  id_factura_pedido INT GENERATED ALWAYS AS IDENTITY,
  fecha_emision DATE NOT NULL,
  sub_total DECIMAL(14,2) NOT NULL,
  iva DECIMAL(14,2) NOT NULL,
  total DECIMAL(14,2)
  GENERATED ALWAYS AS (sub_total + iva) STORED,
  pagada BOOLEAN NOT NULL CONSTRAINT df_fac_pedido_pagada DEFAULT true,
  id_pedido INT NOT NULL,
  CONSTRAINT pk_factura_pedido PRIMARY KEY (id_factura_pedido),
  CONSTRAINT fk_fac_pedido_pedido
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
  ON UPDATE CASCADE
  ON DELETE NO action,
  CONSTRAINT uq_factura_pedido UNIQUE (id_pedido),
  CONSTRAINT ck_fac_pedido_subtotal CHECK (sub_total >= 0),
  CONSTRAINT ck_fac_pedido_iva CHECK (iva >= 0),
  CONSTRAINT ck_fac_pedido_total CHECK (total >= 0),
  CONSTRAINT ck_fac_pedido_calculo CHECK (total = sub_total + iva)
);

CREATE TABLE detalle_deduccion
(
  id_deduccion INT GENERATED ALWAYS AS IDENTITY,
  concepto VARCHAR(200) NOT NULL,
  base_calculo NUMERIC(12,2) NOT NULL,
  porcentaje NUMERIC(5,2) NOT NULL,
  monto_deduccion NUMERIC(12,2) NOT NULL,
  id_configuracion INT NOT NULL,
  id_detalle_planilla INT NOT NULL,
  CONSTRAINT pk_detalle_deduccion PRIMARY KEY (id_deduccion),
  CONSTRAINT fk_deduccion_configuracion
  FOREIGN KEY (id_configuracion)
  REFERENCES configuracion_deduccion(id_configuracion)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT fk_deduccion_detalle_planilla
  FOREIGN KEY (id_detalle_planilla) REFERENCES detalle_planilla(id_detalle_planilla)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT ck_deduccion_base
  CHECK (base_calculo >= 0),
  CONSTRAINT ck_deduccion_porcentaje
  CHECK (porcentaje BETWEEN 0 AND 100),
  CONSTRAINT ck_deduccion_monto
  CHECK (monto_deduccion >= 0)
);

-----------------------------------------------------------
------- 4. TABLA DERIVADA DE CAJA -------------

CREATE TABLE pago_caja
(
  id_pago INT GENERATED ALWAYS AS IDENTITY,
  fecha_pago TIMESTAMP NOT NULL,
  metodo_pago VARCHAR(15) NOT NULL,
  monto_total NUMERIC(14,2) NOT NULL,
  id_turno INT NOT NULL,
  id_factura_pedido INT NOT NULL,
  CONSTRAINT pk_pago_caja PRIMARY KEY (id_pago),
  CONSTRAINT fk_pago_caja_turno
  FOREIGN KEY (id_turno) REFERENCES turno_caja(id_turno)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT fk_pago_caja_factura
  FOREIGN KEY (id_factura_pedido) REFERENCES factura_pedido(id_factura_pedido)
  ON UPDATE CASCADE
  ON DELETE NO ACTION,
  CONSTRAINT ck_pago_caja_metodo_pago
  CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA')),
  CONSTRAINT ck_pago_caja_monto CHECK (monto_total > 0)
);