
use OrigenesSV;
GO

-----------------------------------------------------------
-- 1. PROCEDIMIENTOS DE SEGURIDAD (esquema seguridad)

-- Procedimiento Auxiliar
-- valida que el usuario exista, este activo (usuario y empleado), tenga uno de los roles permitidos 
-- y si pertenece a la sucursal de la operacion (ADMIN opera en cualquiera).
-- @roles_permitidos NULL = cualquier rol. Devuelve el empleado y el rol.

CREATE OR ALTER PROCEDURE seguridad.sp_asegurar_permiso
  @id_usuario INT,
  @roles_permitidos VARCHAR(200) = NULL,
  @id_sucursal INT = NULL,
  @id_empleado INT = NULL OUTPUT,
  @rol VARCHAR(20) = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @activo BIT, @sucursal_usuario INT;

  SET @id_empleado = NULL;
  SET @rol = NULL;

  SELECT @rol = u.rol,
         @id_empleado = u.id_empleado,
         @sucursal_usuario = u.id_sucursal,
         @activo = CASE WHEN u.activo = 1 AND e.activo = 1 THEN 1 ELSE 0 END
  FROM seguridad.usuario AS u
  JOIN rrhh.empleado AS e ON e.id_empleado = u.id_empleado
  WHERE u.id_usuario = @id_usuario;

  IF @rol IS NULL
    THROW 51001, 'El usuario no existe.', 1;
  IF @activo = 0
    THROW 51002, 'El usuario o empleado estan inactivos.', 1;
  IF @roles_permitidos IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM STRING_SPLIT(@roles_permitidos, ',') WHERE LTRIM(RTRIM(value)) = @rol)
    THROW 51003, 'El rol del usuario no tiene permiso para esta operacion.', 1;
  IF @id_sucursal IS NOT NULL AND @rol <> 'ADMIN' AND @sucursal_usuario <> @id_sucursal
    THROW 51004, 'El usuario no pertenece a la sucursal de esta operacion.', 1;
END
GO

-- Crear un usuario. 
-- ADMIN sin solicitante (arranque del sistema). Despues solo un ADMIN crea usuarios.
CREATE OR ALTER PROCEDURE seguridad.sp_crear_usuario
  @id_usuario_solicitante INT = NULL,
  @correo VARCHAR(150),
  @password_hash VARCHAR(255),
  @rol VARCHAR(20),
  @id_sucursal INT,
  @id_empleado INT,
  @id_usuario INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM seguridad.usuario)
    BEGIN
      IF @rol <> 'ADMIN'
        THROW 51010, 'El primer usuario del sistema debe tener rol ADMIN.', 1;
    END
    ELSE
    BEGIN
      IF @id_usuario_solicitante IS NULL
        THROW 51011, 'Se requiere un usuario ADMIN que cree la cuenta.', 1;
      EXEC seguridad.sp_asegurar_permiso @id_usuario = @id_usuario_solicitante, @roles_permitidos = 'ADMIN';
    END

    IF @rol IS NULL OR @rol NOT IN ('ADMIN', 'GERENTE', 'CAJERO', 'BODEGA', 'COMPRAS', 'RRHH')
      THROW 51012, 'Rol invalido.', 1;
    IF @correo IS NULL OR @correo NOT LIKE '%@%.%'
      THROW 51013, 'El correo no tiene un formato valido.', 1;
    IF @password_hash IS NULL OR LEN(@password_hash) < 20
      THROW 51014, 'Debe enviarse el hash de la contraseña (no la contraseña en texto).', 1;
    IF NOT EXISTS (SELECT 1 FROM rrhh.empleado WHERE id_empleado = @id_empleado AND activo = 1)
      THROW 51015, 'El empleado no existe o esta inactivo.', 1;
    IF NOT EXISTS (SELECT 1 FROM catalogo.sucursal WHERE id_sucursal = @id_sucursal AND activa = 1)
      THROW 51016, 'La sucursal no existe o esta inactiva.', 1;
    IF EXISTS (SELECT 1 FROM seguridad.usuario WHERE correo = @correo)
      THROW 51017, 'Ya existe un usuario con ese correo.', 1;
    IF EXISTS (SELECT 1 FROM seguridad.usuario WHERE id_empleado = @id_empleado)
      THROW 51018, 'El empleado ya tiene un usuario.', 1;

    INSERT INTO seguridad.usuario (correo, password_hash, rol, id_sucursal, id_empleado)
    VALUES (@correo, @password_hash, @rol, @id_sucursal, @id_empleado);

    SET @id_usuario = SCOPE_IDENTITY();
    SELECT @id_usuario AS id_usuario;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

--LOGIN

-- Paso 1 del login: la aplicacion pide la credencial, compara el hash ella misma
-- y, si coincide llama a sp_crear_sesion. Dar EXECUTE solo a la cuenta de la aplicacion.
CREATE OR ALTER PROCEDURE seguridad.sp_obtener_credencial
  @correo VARCHAR(150)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT u.id_usuario, u.password_hash, u.rol, u.id_sucursal, u.id_empleado
  FROM seguridad.usuario AS u
  JOIN rrhh.empleado AS e ON e.id_empleado = u.id_empleado
  WHERE u.correo = @correo AND u.activo = 1 AND e.activo = 1;
END
GO

-- Paso 2 del login: registra la sesion (se guarda el hash SHA-256 del token, 64 caracteres hex)
CREATE OR ALTER PROCEDURE seguridad.sp_crear_sesion
  @id_usuario INT,
  @token_hash VARCHAR(64),
  @minutos INT = 480,
  @id_sesion INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    IF @token_hash IS NULL OR LEN(@token_hash) <> 64
      THROW 51020, 'El token_hash debe tener 64 caracteres.', 1;
    IF @minutos IS NULL OR @minutos < 1 OR @minutos > 10080
      THROW 51021, 'La duracion de la sesion debe estar entre 1 minuto y 7 dias.', 1;

    EXEC seguridad.sp_asegurar_permiso @id_usuario = @id_usuario;

    BEGIN TRAN;
    DELETE FROM seguridad.sesion WHERE id_usuario = @id_usuario AND expira <= SYSDATETIME();

    INSERT INTO seguridad.sesion (token_hash, expira, id_usuario)
    VALUES (@token_hash, DATEADD(MINUTE, @minutos, SYSDATETIME()), @id_usuario);

    SET @id_sesion = SCOPE_IDENTITY();
    COMMIT TRANSACTION;

    SELECT @id_sesion AS id_sesion, DATEADD(MINUTE, @minutos, SYSDATETIME()) AS expira;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Valida un token en cada solicitud: devuelve el usuario si la sesion sigue vigente
-- (0 filas = sesion invalida o vencida)
CREATE OR ALTER PROCEDURE seguridad.sp_validar_sesion
  @token_hash VARCHAR(64)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT u.id_usuario, u.rol, u.id_sucursal, u.id_empleado, s.expira
  FROM seguridad.sesion AS s
  JOIN seguridad.usuario AS u ON u.id_usuario = s.id_usuario
  JOIN rrhh.empleado AS e ON e.id_empleado = u.id_empleado
  WHERE s.token_hash = @token_hash
    AND s.expira > SYSDATETIME()
    AND u.activo = 1
    AND e.activo = 1;
END
GO

CREATE OR ALTER PROCEDURE seguridad.sp_cerrar_sesion
  @token_hash VARCHAR(64)
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM seguridad.sesion WHERE token_hash = @token_hash;
  SELECT @@ROWCOUNT AS sesiones_cerradas;
END
GO

-- Para correr periodicamente 
CREATE OR ALTER PROCEDURE seguridad.sp_limpiar_sesiones_expiradas
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM seguridad.sesion WHERE expira <= SYSDATETIME();
  SELECT @@ROWCOUNT AS sesiones_eliminadas;
END
GO

-- Cambia el hash de contrasena (el propio usuario o un ADMIN) y cierra todas sus sesiones
CREATE OR ALTER PROCEDURE seguridad.sp_cambiar_password
  @id_usuario_solicitante INT,
  @id_usuario INT,
  @nuevo_password_hash VARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @id_empleado INT, @rol VARCHAR(20);

  BEGIN TRY
    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario_solicitante, @id_empleado = @id_empleado OUTPUT, @rol = @rol OUTPUT;

    IF @id_usuario_solicitante <> @id_usuario AND @rol <> 'ADMIN'
      THROW 51030, 'Solo el propio usuario o un ADMIN puede cambiar la contrasena.', 1;
    IF @nuevo_password_hash IS NULL OR LEN(@nuevo_password_hash) < 20
      THROW 51031, 'Debe enviarse el hash de la contrasena (no la contrasena en texto).', 1;
    IF NOT EXISTS (SELECT 1 FROM seguridad.usuario WHERE id_usuario = @id_usuario)
      THROW 51032, 'El usuario no existe.', 1;

    BEGIN TRAN;
    UPDATE seguridad.usuario SET password_hash = @nuevo_password_hash WHERE id_usuario = @id_usuario;
    DELETE FROM seguridad.sesion WHERE id_usuario = @id_usuario;
    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Desactiva un usuario (solo ADMIN) y cierra sus sesiones
CREATE OR ALTER PROCEDURE seguridad.sp_desactivar_usuario
  @id_usuario_solicitante INT,
  @id_usuario INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    EXEC seguridad.sp_asegurar_permiso @id_usuario = @id_usuario_solicitante, @roles_permitidos = 'ADMIN';

    IF @id_usuario_solicitante = @id_usuario
      THROW 51040, 'Un ADMIN no puede desactivar su propia cuenta.', 1;
    IF NOT EXISTS (SELECT 1 FROM seguridad.usuario WHERE id_usuario = @id_usuario)
      THROW 51041, 'El usuario no existe.', 1;

    BEGIN TRAN;
    UPDATE seguridad.usuario SET activo = 0 WHERE id_usuario = @id_usuario;
    DELETE FROM seguridad.sesion WHERE id_usuario = @id_usuario;
    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-----------------------------------------------------------
--- 2. PROCEDIMIENTOS DE CAJA (esquema caja)

-- Abre un turno de caja para el empleado del usuario
CREATE OR ALTER PROCEDURE caja.sp_abrir_turno
  @id_usuario INT,
  @id_caja INT,
  @monto_inicial NUMERIC(14,2),
  @id_turno INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @id_sucursal INT, @habilitada BIT, @id_empleado INT, @rol VARCHAR(20);

  BEGIN TRY
    SELECT @id_sucursal = id_sucursal, @habilitada = abierta
    FROM caja.caja WHERE id_caja = @id_caja;

    IF @id_sucursal IS NULL
      THROW 52001, 'La caja no existe.', 1;
    IF @habilitada = 0
      THROW 52002, 'La caja esta deshabilitada.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,CAJERO',
      @id_sucursal = @id_sucursal, @id_empleado = @id_empleado OUTPUT, @rol = @rol OUTPUT;

    IF @monto_inicial IS NULL OR @monto_inicial < 0
      THROW 52003, 'El monto inicial no puede ser negativo.', 1;
    IF EXISTS (SELECT 1 FROM caja.turno_caja WHERE id_caja = @id_caja AND fecha_cierre IS NULL)
      THROW 52004, 'La caja ya tiene un turno abierto.', 1;
    IF EXISTS (SELECT 1 FROM caja.turno_caja WHERE id_empleado = @id_empleado AND fecha_cierre IS NULL)
      THROW 52005, 'El empleado ya tiene un turno abierto.', 1;

    BEGIN TRAN;
    INSERT INTO caja.turno_caja (id_empleado, id_caja, monto_inicial)
    VALUES (@id_empleado, @id_caja, @monto_inicial);

    SET @id_turno = SCOPE_IDENTITY();
    COMMIT TRANSACTION;

    SELECT @id_turno AS id_turno;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Cierra el turno: calcula el efectivo esperado (monto inicial + pagos en efectivo),
-- guarda el monto contado y devuelve la diferencia. Un cajero solo cierra su turno.

CREATE OR ALTER PROCEDURE caja.sp_cerrar_turno
  @id_usuario INT,
  @id_turno INT,
  @monto_cierre NUMERIC(14,2),
  @cierre_json NVARCHAR(2000) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @empleado_turno INT, @monto_inicial NUMERIC(14,2), @fecha_cierre DATETIME2(0), @id_sucursal INT;
  DECLARE @id_empleado INT, @rol VARCHAR(20), @efectivo NUMERIC(14,2);

  BEGIN TRY
    IF @monto_cierre IS NULL OR @monto_cierre < 0
      THROW 52010, 'El monto de cierre no puede ser negativo.', 1;
    IF @cierre_json IS NOT NULL AND ISJSON(@cierre_json) = 0
      THROW 52011, 'cierre_json no es un JSON valido.', 1;

    BEGIN TRAN;

    SELECT @empleado_turno = t.id_empleado, @monto_inicial = t.monto_inicial,
           @fecha_cierre = t.fecha_cierre, @id_sucursal = c.id_sucursal
    FROM caja.turno_caja AS t WITH (UPDLOCK, HOLDLOCK)
    JOIN caja.caja AS c ON c.id_caja = t.id_caja
    WHERE t.id_turno = @id_turno;

    IF @id_sucursal IS NULL
      THROW 52012, 'El turno no existe.', 1;
    IF @fecha_cierre IS NOT NULL
      THROW 52013, 'El turno ya esta cerrado.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,CAJERO',
      @id_sucursal = @id_sucursal, @id_empleado = @id_empleado OUTPUT, @rol = @rol OUTPUT;

    IF @rol = 'CAJERO' AND @id_empleado <> @empleado_turno
      THROW 52014, 'Un cajero solo puede cerrar su propio turno.', 1;

    SELECT @efectivo = COALESCE(SUM(monto_total), 0)
    FROM caja.pago_caja
    WHERE id_turno = @id_turno AND metodo_pago = 'EFECTIVO';

    UPDATE caja.turno_caja
    SET fecha_cierre = SYSDATETIME(),
        monto_esperado = @monto_inicial + @efectivo,
        monto_cierre = @monto_cierre,
        cierre_json = @cierre_json
    WHERE id_turno = @id_turno;

    COMMIT TRANSACTION;

    SELECT t.id_turno, t.monto_inicial, t.monto_esperado, t.monto_cierre, t.diferencia,
           (SELECT COALESCE(SUM(monto_total), 0) FROM caja.pago_caja WHERE id_turno = t.id_turno AND metodo_pago = 'EFECTIVO') AS total_efectivo,
           (SELECT COALESCE(SUM(monto_total), 0) FROM caja.pago_caja WHERE id_turno = t.id_turno AND metodo_pago = 'TARJETA') AS total_tarjeta,
           (SELECT COALESCE(SUM(monto_total), 0) FROM caja.pago_caja WHERE id_turno = t.id_turno AND metodo_pago = 'DIGITAL') AS total_digital
    FROM caja.turno_caja AS t
    WHERE t.id_turno = @id_turno;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Conteo intermedio de caja (sin cerrar el turno). Devuelve el efectivo esperado en ese momento.
CREATE OR ALTER PROCEDURE caja.sp_registrar_cuadre_parcial
  @id_usuario INT,
  @id_turno INT,
  @detalle_json NVARCHAR(3000),
  @nota NVARCHAR(300) = NULL,
  @id_cuadre INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @empleado_turno INT, @monto_inicial NUMERIC(14,2), @fecha_cierre DATETIME2(0), @id_sucursal INT;
  DECLARE @id_empleado INT, @rol VARCHAR(20), @efectivo NUMERIC(14,2);

  BEGIN TRY
    IF @detalle_json IS NULL OR ISJSON(@detalle_json) = 0
      THROW 52020, 'detalle_json es obligatorio y debe ser un JSON valido.', 1;

    SELECT @empleado_turno = t.id_empleado, @monto_inicial = t.monto_inicial,
           @fecha_cierre = t.fecha_cierre, @id_sucursal = c.id_sucursal
    FROM caja.turno_caja AS t
    JOIN caja.caja AS c ON c.id_caja = t.id_caja
    WHERE t.id_turno = @id_turno;

    IF @id_sucursal IS NULL
      THROW 52021, 'El turno no existe.', 1;
    IF @fecha_cierre IS NOT NULL
      THROW 52022, 'El turno ya esta cerrado.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,CAJERO',
      @id_sucursal = @id_sucursal, @id_empleado = @id_empleado OUTPUT, @rol = @rol OUTPUT;

    IF @rol = 'CAJERO' AND @id_empleado <> @empleado_turno
      THROW 52023, 'Un cajero solo puede registrar cuadres de su propio turno.', 1;

    INSERT INTO caja.cuadre_parcial (fecha, detalle_json, nota, id_turno, usuario_id)
    VALUES (SYSDATETIME(), @detalle_json, @nota, @id_turno, @id_usuario);

    SET @id_cuadre = SCOPE_IDENTITY();

    SELECT @efectivo = COALESCE(SUM(monto_total), 0)
    FROM caja.pago_caja
    WHERE id_turno = @id_turno AND metodo_pago = 'EFECTIVO';

    SELECT @id_cuadre AS id_cuadre, @monto_inicial + @efectivo AS efectivo_esperado;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Registra un pago de una factura de pedido dentro de un turno abierto.
-- El trigger caja.tr_pago_caja_saldo marca la factura como pagada cuando el saldo llega a 0.
CREATE OR ALTER PROCEDURE caja.sp_registrar_pago_caja
  @id_usuario INT,
  @id_turno INT,
  @id_factura_pedido INT,
  @metodo_pago VARCHAR(15),
  @monto NUMERIC(14,2),
  @id_pago INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @id_empleado INT, @rol VARCHAR(20);
  DECLARE @empleado_turno INT, @fecha_cierre DATETIME2(0), @sucursal_turno INT;
  DECLARE @id_pedido INT, @sucursal_pedido INT, @saldo DECIMAL(14,2);

  BEGIN TRY
    IF @metodo_pago IS NULL OR @metodo_pago NOT IN ('EFECTIVO', 'TARJETA', 'DIGITAL')
      THROW 52030, 'Metodo de pago invalido (EFECTIVO, TARJETA o DIGITAL).', 1;
    IF @monto IS NULL OR @monto <= 0
      THROW 52031, 'El monto debe ser mayor que cero.', 1;

    BEGIN TRAN;

    -- Bloqueo compartido del turno: evita pagar mientras se cierra
    SELECT @empleado_turno = t.id_empleado, @fecha_cierre = t.fecha_cierre, @sucursal_turno = c.id_sucursal
    FROM caja.turno_caja AS t WITH (HOLDLOCK)
    JOIN caja.caja AS c ON c.id_caja = t.id_caja
    WHERE t.id_turno = @id_turno;

    IF @sucursal_turno IS NULL
      THROW 52032, 'El turno no existe.', 1;
    IF @fecha_cierre IS NOT NULL
      THROW 52033, 'El turno esta cerrado.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,CAJERO',
      @id_sucursal = @sucursal_turno, @id_empleado = @id_empleado OUTPUT, @rol = @rol OUTPUT;

    IF @rol = 'CAJERO' AND @id_empleado <> @empleado_turno
      THROW 52034, 'Un cajero solo puede cobrar en su propio turno.', 1;

    -- Bloqueo de la factura: serializa pagos simultaneos
    SELECT @id_pedido = f.id_pedido
    FROM ventas.factura_pedido AS f WITH (UPDLOCK, HOLDLOCK)
    WHERE f.id_factura_pedido = @id_factura_pedido;

    IF @id_pedido IS NULL
      THROW 52035, 'La factura no existe.', 1;

    SELECT @sucursal_pedido = id_sucursal FROM ventas.pedido WHERE id_pedido = @id_pedido;
    IF @sucursal_pedido <> @sucursal_turno
      THROW 52036, 'La caja y el pedido pertenecen a sucursales distintas.', 1;

    SET @saldo = ventas.fn_saldo_factura_pedido(@id_factura_pedido);
    IF @monto > @saldo
      THROW 52037, 'El monto excede el saldo pendiente de la factura.', 1;

    INSERT INTO caja.pago_caja (metodo_pago, monto_total, id_turno, id_factura_pedido)
    VALUES (@metodo_pago, @monto, @id_turno, @id_factura_pedido);

    SET @id_pago = SCOPE_IDENTITY();
    COMMIT TRANSACTION;

    SELECT @id_pago AS id_pago, (@saldo - @monto) AS saldo_pendiente;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-----------------------------------------------------------
-- 3. PROCEDIMIENTOS DE VENTAS (esquema ventas)

-- Crea un pedido con sus detalles. 
--El precio se toma de producto.precio y el total lo mantiene el trigger ventas.tr_detalle_pedido_total.

CREATE TYPE ventas.tt_detalle_pedido AS TABLE
(
    id_producto INT NOT NULL,
    cantidad INT NOT NULL
);
GO

CREATE OR ALTER PROCEDURE ventas.sp_registrar_pedido
    @id_usuario INT,
    @id_sucursal INT,
    @tipo_pedido VARCHAR(15),
    @detalle ventas.tt_detalle_pedido READONLY,
    @id_pedido INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @id_empleado INT, @rol VARCHAR(20);

    BEGIN TRY
        EXEC seguridad.sp_asegurar_permiso
            @id_usuario = @id_usuario,
            @roles_permitidos = 'ADMIN,GERENTE,CAJERO',
            @id_sucursal = @id_sucursal,
            @id_empleado = @id_empleado OUTPUT,
            @rol = @rol OUTPUT;

        IF NOT EXISTS (
            SELECT 1
            FROM catalogo.sucursal
            WHERE id_sucursal = @id_sucursal
              AND activa = 1
        )
            THROW 53001, 'La sucursal no existe o esta inactiva.', 1;

        IF @tipo_pedido IS NULL
           OR @tipo_pedido NOT IN ('LOCAL', 'DOMICILIO', 'LLEVAR')
            THROW 53002, 'Tipo de pedido invalido.', 1;

        IF NOT EXISTS (SELECT 1 FROM @detalle)
            THROW 53003, 'El pedido debe tener al menos un producto.', 1;

        IF EXISTS (SELECT 1 FROM @detalle WHERE cantidad <= 0)
            THROW 53004, 'Las cantidades deben ser mayores que cero.', 1;

        IF EXISTS (
            SELECT 1
            FROM @detalle AS d
            LEFT JOIN catalogo.producto AS p
                ON p.id_producto = d.id_producto
            WHERE p.id_producto IS NULL
               OR p.disponible = 0
        )
            THROW 53005, 'Hay productos inexistentes o no disponibles.', 1;

        BEGIN TRAN;

        INSERT INTO ventas.pedido
            (tipo_pedido, total, id_empleado, id_sucursal)
        VALUES
            (@tipo_pedido, 0, @id_empleado, @id_sucursal);

        SET @id_pedido = CONVERT(INT, SCOPE_IDENTITY());

        INSERT INTO ventas.detalle_pedido
            (cantidad, precio_unitario, id_pedido, id_producto)
        SELECT
            SUM(d.cantidad),
            p.precio,
            @id_pedido,
            d.id_producto
        FROM @detalle AS d
        JOIN catalogo.producto AS p
            ON p.id_producto = d.id_producto
        GROUP BY d.id_producto, p.precio;

        UPDATE ventas.pedido
        SET total = (
            SELECT SUM(cantidad * precio_unitario)
            FROM ventas.detalle_pedido
            WHERE id_pedido = @id_pedido
        )
        WHERE id_pedido = @id_pedido;

        COMMIT TRANSACTION;

        SELECT id_pedido, estado, total
        FROM ventas.pedido
        WHERE id_pedido = @id_pedido;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END;
GO

-- Cancela un pedido pendiente que todavia no tiene factura
CREATE OR ALTER PROCEDURE ventas.sp_cancelar_pedido
  @id_usuario INT,
  @id_pedido INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @estado VARCHAR(15), @id_sucursal INT;

  BEGIN TRY
    BEGIN TRAN;

    SELECT @estado = estado, @id_sucursal = id_sucursal
    FROM ventas.pedido WITH (UPDLOCK, HOLDLOCK)
    WHERE id_pedido = @id_pedido;

    IF @estado IS NULL
      THROW 53010, 'El pedido no existe.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,CAJERO', @id_sucursal = @id_sucursal;

    IF @estado <> 'PENDIENTE'
      THROW 53011, 'Solo se pueden cancelar pedidos pendientes.', 1;
    IF EXISTS (SELECT 1 FROM ventas.factura_pedido WHERE id_pedido = @id_pedido)
      THROW 53012, 'El pedido ya tiene factura y no se puede cancelar.', 1;

    UPDATE ventas.pedido SET estado = 'CANCELADO' WHERE id_pedido = @id_pedido;
    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- GENERAR FACTURA DE UN PEDIDO
--Si se repite la misma @clave_idempotencia con la misma solicitud devuelve la factura ya creada (sin duplicar); con otra solicitud da error.

CREATE OR ALTER PROCEDURE ventas.sp_facturar_pedido
    @id_usuario INT,
    @id_pedido INT,
    @tipo_documento VARCHAR(3) = 'FCF',
    @cliente_json NVARCHAR(1000) = NULL,
    @clave_idempotencia VARCHAR(64) = NULL,
    @solicitud_hash VARCHAR(64) = NULL,
    @id_factura_pedido INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @id_existente INT,
            @hash_existente VARCHAR(64),
            @err INT,
            @estado VARCHAR(15),
            @id_sucursal INT,
            @total DECIMAL(14,2),
            @sub_total DECIMAL(14,2),
            @iva DECIMAL(14,2),
            @n INT,
            @correlativo VARCHAR(30);

    BEGIN TRY

        -- 1. Validar datos de entrada
        IF @tipo_documento IS NULL
           OR @tipo_documento NOT IN ('FCF', 'CCF')
            THROW 54005, 'Tipo de documento invalido (FCF o CCF).', 1;

        IF @cliente_json IS NOT NULL
           AND ISJSON(@cliente_json) = 0
            THROW 54006, 'cliente_json no es un JSON valido.', 1;

        IF @tipo_documento = 'CCF'
           AND @cliente_json IS NULL
            THROW 54007, 'El comprobante de credito fiscal requiere los datos del cliente.', 1;

        IF @clave_idempotencia IS NOT NULL
           AND @solicitud_hash IS NULL
            THROW 54009, 'Debe proporcionar el hash de la solicitud.', 1;

        -- 2. Obtener sucursal y validar pedido
        SELECT @id_sucursal = id_sucursal
        FROM ventas.pedido
        WHERE id_pedido = @id_pedido;

        IF @id_sucursal IS NULL
            THROW 54002, 'El pedido no existe.', 1;

        -- 3. Validar permisos antes de devolver una factura existente
        EXEC seguridad.sp_asegurar_permiso
            @id_usuario = @id_usuario,
            @roles_permitidos = 'ADMIN,GERENTE,CAJERO',
            @id_sucursal = @id_sucursal;

        BEGIN TRANSACTION;

        -- 4. Verificar idempotencia con bloqueo
        IF @clave_idempotencia IS NOT NULL
        BEGIN
            SELECT
                @id_existente = id_factura_pedido,
                @hash_existente = solicitud_hash
            FROM ventas.factura_pedido WITH (UPDLOCK, HOLDLOCK)
            WHERE clave_idempotencia = @clave_idempotencia;

            IF @id_existente IS NOT NULL
            BEGIN
                IF COALESCE(@hash_existente, '') <>
                   COALESCE(@solicitud_hash, '')
                    THROW 54001, 'La clave de idempotencia ya se uso con una solicitud distinta.', 1;

                SET @id_factura_pedido = @id_existente;

                COMMIT TRANSACTION;

                SELECT
                    f.id_factura_pedido,
                    f.correlativo,
                    f.sub_total,
                    f.iva,
                    f.total,
                    f.pagada
                FROM ventas.factura_pedido AS f
                WHERE f.id_factura_pedido = @id_existente;

                RETURN;
            END
        END

        -- 5. Bloquear y verificar el pedido
        SELECT
            @estado = estado,
            @total = total,
            @id_sucursal = id_sucursal
        FROM ventas.pedido WITH (UPDLOCK, HOLDLOCK)
        WHERE id_pedido = @id_pedido;

        IF @estado IS NULL
            THROW 54002, 'El pedido no existe.', 1;

        IF @estado = 'CANCELADO'
            THROW 54003, 'No se puede facturar un pedido cancelado.', 1;

        IF EXISTS (
            SELECT 1
            FROM ventas.factura_pedido
            WHERE id_pedido = @id_pedido
        )
            THROW 54004, 'El pedido ya tiene factura.', 1;

        IF @total IS NULL OR @total <= 0
            THROW 54008, 'El pedido no tiene productos o su total es cero.', 1;

        -- 6. Calcular subtotal e IVA
        SELECT
            @sub_total = d.sub_total,
            @iva = d.iva
        FROM ventas.fn_desglose_iva(@total) AS d;

        -- 7. Generar correlativo
        SET @n = NEXT VALUE FOR ventas.sq_correlativo_factura;

        SET @correlativo =
            @tipo_documento + '-' +
            RIGHT('0000000000' + CAST(@n AS VARCHAR(10)), 10);

        -- 8. Registrar factura
        INSERT INTO ventas.factura_pedido
        (
            fecha_emision,
            sub_total,
            iva,
            pagada,
            tipo_documento,
            correlativo,
            cliente_json,
            clave_idempotencia,
            solicitud_hash,
            id_pedido,
            usuario_id
        )
        VALUES
        (
            CAST(SYSDATETIME() AS DATE),
            @sub_total,
            @iva,
            0,
            @tipo_documento,
            @correlativo,
            @cliente_json,
            @clave_idempotencia,
            @solicitud_hash,
            @id_pedido,
            @id_usuario
        );

        SET @id_factura_pedido =
            CONVERT(INT, SCOPE_IDENTITY());

        COMMIT TRANSACTION;

        -- 9. Devolver factura registrada
        SELECT
            f.id_factura_pedido,
            f.correlativo,
            f.sub_total,
            f.iva,
            f.total,
            f.pagada
        FROM ventas.factura_pedido AS f
        WHERE f.id_factura_pedido = @id_factura_pedido;
    END TRY
    BEGIN CATCH

        SET @err = ERROR_NUMBER();

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        IF @err IN (2601, 2627)
           AND @clave_idempotencia IS NOT NULL
        BEGIN
            SELECT
                @id_existente = id_factura_pedido,
                @hash_existente = solicitud_hash
            FROM ventas.factura_pedido
            WHERE clave_idempotencia = @clave_idempotencia;

            IF @id_existente IS NOT NULL
            BEGIN
                IF COALESCE(@hash_existente, '') <>
                   COALESCE(@solicitud_hash, '')
                BEGIN
                    ;THROW 54001,
                    'La clave de idempotencia ya se uso con una solicitud distinta.',
                    1;
                END;

                SET @id_factura_pedido = @id_existente;

                SELECT
                    f.id_factura_pedido,
                    f.correlativo,
                    f.sub_total,
                    f.iva,
                    f.total,
                    f.pagada
                FROM ventas.factura_pedido AS f
                WHERE f.id_factura_pedido = @id_existente;

                RETURN;
            END
        END;

        THROW;

    END CATCH
END;
GO

-- Entrega el pedido: descuenta del stock los insumos de las recetas de los productos
-- ELABORADOS (cantidad_insumo * cantidad pedida) y registra los movimientos.
-- Los productos REVENTA no descuentan stock (el modelo no los vincula a un insumo).
CREATE OR ALTER PROCEDURE ventas.sp_entregar_pedido
  @id_usuario INT,
  @id_pedido INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @estado VARCHAR(15), @id_sucursal INT, @msg NVARCHAR(2000);
  DECLARE @referencia VARCHAR(60) = 'PEDIDO-' + CAST(@id_pedido AS VARCHAR(10));

  BEGIN TRY
    SELECT @id_sucursal = id_sucursal FROM ventas.pedido WHERE id_pedido = @id_pedido;
    IF @id_sucursal IS NULL
      THROW 55001, 'El pedido no existe.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,CAJERO', @id_sucursal = @id_sucursal;

    BEGIN TRAN;

    SELECT @estado = estado
    FROM ventas.pedido WITH (UPDLOCK, HOLDLOCK)
    WHERE id_pedido = @id_pedido;

    IF @estado <> 'PENDIENTE'
      THROW 55002, 'Solo se pueden entregar pedidos pendientes.', 1;
    IF NOT EXISTS (SELECT 1 FROM ventas.detalle_pedido WHERE id_pedido = @id_pedido)
      THROW 55003, 'El pedido no tiene productos.', 1;

    IF EXISTS (SELECT 1
               FROM ventas.detalle_pedido AS dp
               JOIN catalogo.producto AS p ON p.id_producto = dp.id_producto
               WHERE dp.id_pedido = @id_pedido
                 AND p.tipo_producto = 'ELABORADO'
                 AND NOT EXISTS (SELECT 1 FROM catalogo.receta AS r
                                 WHERE r.id_producto = p.id_producto AND r.receta_disponible = 1))
      THROW 55004, 'Hay productos elaborados sin receta disponible.', 1;

    -- Insumos requeridos por el pedido
    CREATE TABLE #requerido (id_insumo INT NOT NULL PRIMARY KEY, cantidad NUMERIC(14,3) NOT NULL);

    INSERT INTO #requerido (id_insumo, cantidad)
    SELECT dr.id_insumo, SUM(dr.cantidad_insumo * dp.cantidad)
    FROM ventas.detalle_pedido AS dp
    JOIN catalogo.producto AS p ON p.id_producto = dp.id_producto AND p.tipo_producto = 'ELABORADO'
    JOIN catalogo.receta AS r ON r.id_producto = p.id_producto AND r.receta_disponible = 1
    JOIN catalogo.detalle_receta AS dr ON dr.id_receta = r.id_receta
    WHERE dp.id_pedido = @id_pedido
    GROUP BY dr.id_insumo;

    -- Faltantes (se bloquean las filas de stock mientras se revisan)
    SELECT @msg = STRING_AGG(
             i.nombre + ' (requiere ' + CAST(rq.cantidad AS VARCHAR(30))
             + ', hay ' + CAST(COALESCE(si.stock_actual, 0) AS VARCHAR(30)) + ')', '; ')
    FROM #requerido AS rq
    JOIN catalogo.insumo AS i ON i.id_insumo = rq.id_insumo
    LEFT JOIN inventario.sucursal_insumo AS si WITH (UPDLOCK, HOLDLOCK)
           ON si.id_sucursal = @id_sucursal AND si.id_insumo = rq.id_insumo
    WHERE COALESCE(si.stock_actual, 0) < rq.cantidad;

    IF @msg IS NOT NULL
    BEGIN
      SET @msg = LEFT(N'Stock insuficiente: ' + @msg, 2000);
      THROW 55005, @msg, 1;
    END

    UPDATE si
    SET si.stock_actual = si.stock_actual - rq.cantidad
    FROM inventario.sucursal_insumo AS si
    JOIN #requerido AS rq ON rq.id_insumo = si.id_insumo
    WHERE si.id_sucursal = @id_sucursal;

    INSERT INTO inventario.movimiento (cantidad, motivo, referencia, fecha, id_sucursal, id_insumo, usuario_id)
    SELECT -rq.cantidad, 'VENTA', @referencia, SYSDATETIME(), @id_sucursal, rq.id_insumo, @id_usuario
    FROM #requerido AS rq;

    UPDATE ventas.pedido SET estado = 'ENTREGADO' WHERE id_pedido = @id_pedido;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-----------------------------------------------------------
-- 4. PROCEDIMIENTOS DE COMPRAS (esquema compras)
-----------------------------------------------------------

-- Registra una compra PENDIENTE con sus detalles. El subtotal se calcula del detalle;
-- si no se envia @iva se calcula con la tasa de ventas.fn_tasa_iva().
-- Una compra sin numero de factura requiere @justificacion.

CREATE TYPE compras.tt_detalle_compra AS TABLE
(
    id_insumo INT NOT NULL,
    cantidad_paquete DECIMAL(14,2) NOT NULL,
    unidades_paquete DECIMAL(14,2) NOT NULL,
    costo_paquete DECIMAL(14,2) NOT NULL
);
GO

CREATE OR ALTER PROCEDURE compras.sp_registrar_compra
    @id_usuario INT,
    @id_sucursal INT,
    @id_proveedor INT,
    @detalle compras.tt_detalle_compra READONLY,
    @fecha_compra DATE = NULL,
    @numero_factura VARCHAR(50) = NULL,
    @credito BIT = 0,
    @justificacion NVARCHAR(500) = NULL,
    @iva DECIMAL(14,2) = NULL,
    @id_compra_inventario INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @subtotal DECIMAL(14,2);

    BEGIN TRY

        -- 1. Validar permisos
        EXEC seguridad.sp_asegurar_permiso
            @id_usuario = @id_usuario,
            @roles_permitidos = 'ADMIN,GERENTE,COMPRAS',
            @id_sucursal = @id_sucursal;

        -- 2. Validar sucursal
        IF NOT EXISTS (
            SELECT 1
            FROM catalogo.sucursal
            WHERE id_sucursal = @id_sucursal
              AND activa = 1
        )
            THROW 56001, 'La sucursal no existe o esta inactiva.', 1;

        -- 3. Validar proveedor
        IF NOT EXISTS (
            SELECT 1
            FROM compras.proveedor
            WHERE id_proveedor = @id_proveedor
              AND activo = 1
        )
            THROW 56002, 'El proveedor no existe o esta inactivo.', 1;

        -- 4. Validar detalle
        IF NOT EXISTS (SELECT 1 FROM @detalle)
            THROW 56003, 'La compra debe tener al menos un insumo.', 1;

        IF EXISTS (
            SELECT 1
            FROM @detalle
            WHERE cantidad_paquete <= 0
               OR unidades_paquete <= 0
               OR costo_paquete < 0
        )
            THROW 56004, 'Cantidades y unidades deben ser mayores que cero y el costo no puede ser negativo.', 1;

        IF EXISTS (
            SELECT id_insumo
            FROM @detalle
            GROUP BY id_insumo
            HAVING COUNT(*) > 1
        )
            THROW 56005, 'Un insumo aparece mas de una vez en la compra; agrupa las lineas.', 1;

        -- 5. Validar insumos
        IF EXISTS (
            SELECT 1
            FROM @detalle AS d
            LEFT JOIN catalogo.insumo AS i
                ON i.id_insumo = d.id_insumo
            WHERE i.id_insumo IS NULL
               OR i.activo = 0
        )
            THROW 56006, 'Hay insumos inexistentes o inactivos en la compra.', 1;

        -- 6. Validar factura y justificación
        IF @numero_factura IS NULL
           AND (
               @justificacion IS NULL
               OR LTRIM(RTRIM(@justificacion)) = ''
           )
            THROW 56007, 'Una compra sin numero de factura requiere una justificacion.', 1;

        -- 7. Validar IVA
        IF @iva IS NOT NULL AND @iva < 0
            THROW 56009, 'El IVA no puede ser negativo.', 1;

        -- 8. Calcular subtotal
        SELECT
            @subtotal = CAST(
                SUM(
                    CAST(cantidad_paquete AS DECIMAL(14,2))
                    * CAST(costo_paquete AS DECIMAL(14,2))
                ) AS DECIMAL(14,2)
            )
        FROM @detalle;

        BEGIN TRANSACTION;

        -- 9. Evitar duplicidad de número de factura
        IF @numero_factura IS NOT NULL
           AND EXISTS (
               SELECT 1
               FROM compras.compra_inventario WITH (UPDLOCK, HOLDLOCK)
               WHERE id_proveedor = @id_proveedor
                 AND numero_factura = @numero_factura
           )
            THROW 56008, 'Ya existe una compra de ese proveedor con ese numero de factura.', 1;

        -- 10. Registrar encabezado de compra
        INSERT INTO compras.compra_inventario
        (
            fecha_compra,
            subtotal,
            iva,
            numero_factura,
            credito,
            justificacion,
            id_sucursal,
            id_proveedor
        )
        VALUES
        (
            COALESCE(@fecha_compra, CAST(SYSDATETIME() AS DATE)),
            @subtotal,
            COALESCE(
                @iva,
                CAST(ROUND(@subtotal * ventas.fn_tasa_iva(), 2) AS DECIMAL(14,2))
            ),
            @numero_factura,
            @credito,
            @justificacion,
            @id_sucursal,
            @id_proveedor
        );

        SET @id_compra_inventario =
            CONVERT(INT, SCOPE_IDENTITY());

        -- 11. Registrar detalle
        INSERT INTO compras.detalle_compra
        (
            cantidad_paquete,
            costo_paquete,
            unidades_paquete,
            id_compra_inventario,
            id_insumo
        )
        SELECT
            cantidad_paquete,
            costo_paquete,
            unidades_paquete,
            @id_compra_inventario,
            id_insumo
        FROM @detalle;

        COMMIT TRANSACTION;

        -- 12. Devolver compra registrada
        SELECT
            c.id_compra_inventario,
            c.estado,
            c.subtotal,
            c.iva,
            c.total
        FROM compras.compra_inventario AS c
        WHERE c.id_compra_inventario = @id_compra_inventario;

    END TRY
    BEGIN CATCH

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;

    END CATCH
END;
GO

-- Registra la factura de una compra (total = total de la compra, sin pagar).
-- Si la compra es a credito, la fecha limite es obligatoria.
CREATE OR ALTER PROCEDURE compras.sp_registrar_factura_compra
  @id_usuario INT,
  @id_compra_inventario INT,
  @fecha_emision DATE = NULL,
  @fecha_limite DATE = NULL,
  @id_factura INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @total DECIMAL(14,2), @credito BIT, @id_sucursal INT;

  BEGIN TRY
    SELECT @total = total, @credito = credito, @id_sucursal = id_sucursal
    FROM compras.compra_inventario
    WHERE id_compra_inventario = @id_compra_inventario;

    IF @id_sucursal IS NULL
      THROW 56010, 'La compra no existe.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,COMPRAS', @id_sucursal = @id_sucursal;

    IF EXISTS (SELECT 1 FROM compras.factura_compra WHERE id_compra_inventario = @id_compra_inventario)
      THROW 56011, 'La compra ya tiene factura.', 1;

    SET @fecha_emision = COALESCE(@fecha_emision, CAST(SYSDATETIME() AS DATE));

    IF @credito = 1 AND @fecha_limite IS NULL
      THROW 56012, 'Una compra a credito requiere fecha limite de pago.', 1;
    IF @fecha_limite IS NOT NULL AND @fecha_limite < @fecha_emision
      THROW 56013, 'La fecha limite no puede ser anterior a la emision.', 1;

    INSERT INTO compras.factura_compra (total, fecha_emision, fecha_limite, pagada, id_compra_inventario)
    VALUES (@total, @fecha_emision, COALESCE(@fecha_limite, @fecha_emision), 0, @id_compra_inventario);

    SET @id_factura = SCOPE_IDENTITY();
    SELECT @id_factura AS id_factura, @total AS total;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Recibe la compra: la pasa a REGISTRADA, suma el stock en la sucursal (en unidad base)
-- y registra un movimiento de entrada por cada insumo.
CREATE OR ALTER PROCEDURE compras.sp_recibir_compra
  @id_usuario INT,
  @id_compra_inventario INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @estado VARCHAR(15), @id_sucursal INT;
  DECLARE @referencia VARCHAR(60) = 'COMPRA-' + CAST(@id_compra_inventario AS VARCHAR(10));

  BEGIN TRY
    SELECT @id_sucursal = id_sucursal
    FROM compras.compra_inventario
    WHERE id_compra_inventario = @id_compra_inventario;

    IF @id_sucursal IS NULL
      THROW 56020, 'La compra no existe.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,BODEGA,COMPRAS', @id_sucursal = @id_sucursal;

    BEGIN TRAN;

    SELECT @estado = estado
    FROM compras.compra_inventario WITH (UPDLOCK, HOLDLOCK)
    WHERE id_compra_inventario = @id_compra_inventario;

    IF @estado <> 'PENDIENTE'
      THROW 56021, 'La compra ya fue registrada.', 1;
    IF NOT EXISTS (SELECT 1 FROM compras.detalle_compra WHERE id_compra_inventario = @id_compra_inventario)
      THROW 56022, 'La compra no tiene detalles.', 1;

    CREATE TABLE #entrada (id_insumo INT NOT NULL PRIMARY KEY, cantidad NUMERIC(14,3) NOT NULL);

    INSERT INTO #entrada (id_insumo, cantidad)
    SELECT dc.id_insumo,
           SUM(catalogo.fn_unidades_a_base(dc.id_insumo, CAST(dc.cantidad_paquete AS NUMERIC(14,3)) * dc.unidades_paquete))
    FROM compras.detalle_compra AS dc
    WHERE dc.id_compra_inventario = @id_compra_inventario
    GROUP BY dc.id_insumo;

    UPDATE si
    SET si.stock_actual = si.stock_actual + e.cantidad
    FROM inventario.sucursal_insumo AS si
    JOIN #entrada AS e ON e.id_insumo = si.id_insumo
    WHERE si.id_sucursal = @id_sucursal;

    -- Insumos que aun no tenian registro en la sucursal (stock minimo en 0)
    INSERT INTO inventario.sucursal_insumo (stock_actual, stock_minimo, id_sucursal, id_insumo)
    SELECT e.cantidad, 0, @id_sucursal, e.id_insumo
    FROM #entrada AS e
    WHERE NOT EXISTS (SELECT 1 FROM inventario.sucursal_insumo AS si
                      WHERE si.id_sucursal = @id_sucursal AND si.id_insumo = e.id_insumo);

    INSERT INTO inventario.movimiento (cantidad, motivo, referencia, fecha, id_sucursal, id_insumo, usuario_id)
    SELECT e.cantidad, 'COMPRA', @referencia, SYSDATETIME(), @id_sucursal, e.id_insumo, @id_usuario
    FROM #entrada AS e;

    UPDATE compras.compra_inventario
    SET estado = 'REGISTRADA'
    WHERE id_compra_inventario = @id_compra_inventario;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Paga (total o parcialmente) una factura de compra. El trigger compras.tr_pago_proveedor_saldo
-- marca la factura como pagada cuando el saldo llega a 0.
CREATE OR ALTER PROCEDURE compras.sp_registrar_pago_proveedor
  @id_usuario INT,
  @id_factura INT,
  @monto DECIMAL(14,2),
  @metodo_pago VARCHAR(15),
  @fecha_pago DATE = NULL,
  @id_pago INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @id_compra INT, @id_sucursal INT, @saldo DECIMAL(14,2);

  BEGIN TRY
    IF @metodo_pago IS NULL OR @metodo_pago NOT IN ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE')
      THROW 56030, 'Metodo de pago invalido (EFECTIVO, TRANSFERENCIA, TARJETA o CHEQUE).', 1;
    IF @monto IS NULL OR @monto <= 0
      THROW 56031, 'El monto debe ser mayor que cero.', 1;

    BEGIN TRAN;

    SELECT @id_compra = f.id_compra_inventario
    FROM compras.factura_compra AS f WITH (UPDLOCK, HOLDLOCK)
    WHERE f.id_factura = @id_factura;

    IF @id_compra IS NULL
      THROW 56032, 'La factura no existe.', 1;

    SELECT @id_sucursal = id_sucursal FROM compras.compra_inventario WHERE id_compra_inventario = @id_compra;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,COMPRAS', @id_sucursal = @id_sucursal;

    SET @saldo = compras.fn_saldo_factura_compra(@id_factura);
    IF @monto > @saldo
      THROW 56033, 'El monto excede el saldo pendiente de la factura.', 1;

    INSERT INTO compras.pago_proveedor (fecha_pago, monto, metodo_pago, id_factura)
    VALUES (COALESCE(@fecha_pago, CAST(SYSDATETIME() AS DATE)), @monto, @metodo_pago, @id_factura);

    SET @id_pago = SCOPE_IDENTITY();
    COMMIT TRANSACTION;

    SELECT @id_pago AS id_pago, (@saldo - @monto) AS saldo_pendiente;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-----------------------------------------------------------
-- 5. PROCEDIMIENTOS DE INVENTARIO (esquema inventario)


-- Crea o actualiza el registro de un insumo en una sucursal (stock minimo).
-- El stock inicial es 0; las entradas se hacen con compras o ajustes.
CREATE OR ALTER PROCEDURE inventario.sp_configurar_insumo_sucursal
  @id_usuario INT,
  @id_sucursal INT,
  @id_insumo INT,
  @stock_minimo NUMERIC(14,3)
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,BODEGA', @id_sucursal = @id_sucursal;

    IF @stock_minimo IS NULL OR @stock_minimo < 0
      THROW 57001, 'El stock minimo no puede ser negativo.', 1;
    IF NOT EXISTS (SELECT 1 FROM catalogo.sucursal WHERE id_sucursal = @id_sucursal AND activa = 1)
      THROW 57002, 'La sucursal no existe o esta inactiva.', 1;
    IF NOT EXISTS (SELECT 1 FROM catalogo.insumo WHERE id_insumo = @id_insumo AND activo = 1)
      THROW 57003, 'El insumo no existe o esta inactivo.', 1;

    BEGIN TRAN;

    UPDATE inventario.sucursal_insumo WITH (UPDLOCK, HOLDLOCK)
    SET stock_minimo = @stock_minimo
    WHERE id_sucursal = @id_sucursal AND id_insumo = @id_insumo;

    IF @@ROWCOUNT = 0
      INSERT INTO inventario.sucursal_insumo (stock_actual, stock_minimo, id_sucursal, id_insumo)
      VALUES (0, @stock_minimo, @id_sucursal, @id_insumo);

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Registra una merma: descuenta el stock, guarda la merma y deja el movimiento de salida.
CREATE OR ALTER PROCEDURE inventario.sp_registrar_merma
  @id_usuario INT,
  @id_sucursal INT,
  @id_insumo INT,
  @cantidad NUMERIC(14,3),
  @motivo VARCHAR(30),
  @nota NVARCHAR(300) = NULL,
  @id_merma INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @stock NUMERIC(14,3), @referencia VARCHAR(60);

  BEGIN TRY
    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,BODEGA', @id_sucursal = @id_sucursal;

    IF @cantidad IS NULL OR @cantidad <= 0
      THROW 57010, 'La cantidad debe ser mayor que cero.', 1;
    IF @motivo IS NULL OR @motivo NOT IN ('VENCIMIENTO', 'DERRAME', 'PREPARACION', 'DANADO', 'DIFERENCIA')
      THROW 57011, 'Motivo invalido (VENCIMIENTO, DERRAME, PREPARACION, DANADO o DIFERENCIA).', 1;

    BEGIN TRAN;

    SELECT @stock = si.stock_actual
    FROM inventario.sucursal_insumo AS si WITH (UPDLOCK, HOLDLOCK)
    WHERE si.id_sucursal = @id_sucursal AND si.id_insumo = @id_insumo;

    IF @stock IS NULL
      THROW 57012, 'El insumo no tiene registro de stock en la sucursal.', 1;
    IF @cantidad > @stock
      THROW 57013, 'La merma excede el stock disponible.', 1;

    UPDATE inventario.sucursal_insumo
    SET stock_actual = stock_actual - @cantidad
    WHERE id_sucursal = @id_sucursal AND id_insumo = @id_insumo;

    INSERT INTO inventario.merma (cantidad, motivo, nota, fecha, id_sucursal, id_insumo, usuario_id)
    VALUES (@cantidad, @motivo, @nota, SYSDATETIME(), @id_sucursal, @id_insumo, @id_usuario);

    SET @id_merma = SCOPE_IDENTITY();
    SET @referencia = 'MERMA-' + CAST(@id_merma AS VARCHAR(10));

    INSERT INTO inventario.movimiento (cantidad, motivo, referencia, fecha, id_sucursal, id_insumo, usuario_id)
    VALUES (-@cantidad, 'MERMA', @referencia, SYSDATETIME(), @id_sucursal, @id_insumo, @id_usuario);

    COMMIT TRANSACTION;
    SELECT @id_merma AS id_merma;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Ajuste por conteo fisico: deja el stock en @cantidad_real.
--  * Si falta stock se registra como merma por DIFERENCIA (y su movimiento).
--  * Si sobra stock se registra un movimiento de entrada por AJUSTE.
CREATE OR ALTER PROCEDURE inventario.sp_ajustar_stock
  @id_usuario INT,
  @id_sucursal INT,
  @id_insumo INT,
  @cantidad_real NUMERIC(14,3),
  @nota NVARCHAR(300)
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @stock NUMERIC(14,3), @diferencia NUMERIC(14,3), @id_merma INT;
  DECLARE @referencia VARCHAR(60);

  BEGIN TRY
    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE,BODEGA', @id_sucursal = @id_sucursal;

    IF @cantidad_real IS NULL OR @cantidad_real < 0
      THROW 57020, 'La cantidad contada no puede ser negativa.', 1;
    IF @nota IS NULL OR LEN(LTRIM(RTRIM(@nota))) = 0
      THROW 57021, 'El ajuste requiere una nota.', 1;

    BEGIN TRAN;

    SELECT @stock = si.stock_actual
    FROM inventario.sucursal_insumo AS si WITH (UPDLOCK, HOLDLOCK)
    WHERE si.id_sucursal = @id_sucursal AND si.id_insumo = @id_insumo;

    IF @stock IS NULL
      THROW 57022, 'El insumo no tiene registro de stock en la sucursal.', 1;

    SET @diferencia = @cantidad_real - @stock;

    IF @diferencia = 0
    BEGIN
      COMMIT TRANSACTION;
      SELECT @stock AS stock_actual, CAST(0 AS NUMERIC(14,3)) AS diferencia;
      RETURN;
    END

    UPDATE inventario.sucursal_insumo
    SET stock_actual = @cantidad_real
    WHERE id_sucursal = @id_sucursal AND id_insumo = @id_insumo;

    IF @diferencia < 0
    BEGIN
      INSERT INTO inventario.merma (cantidad, motivo, nota, fecha, id_sucursal, id_insumo, usuario_id)
      VALUES (-@diferencia, 'DIFERENCIA', @nota, SYSDATETIME(), @id_sucursal, @id_insumo, @id_usuario);

      SET @id_merma = SCOPE_IDENTITY();
      SET @referencia = 'MERMA-' + CAST(@id_merma AS VARCHAR(10));

      INSERT INTO inventario.movimiento (cantidad, motivo, referencia, fecha, id_sucursal, id_insumo, usuario_id)
      VALUES (@diferencia, 'MERMA', @referencia, SYSDATETIME(), @id_sucursal, @id_insumo, @id_usuario);
    END
    ELSE
    BEGIN
      SET @referencia = LEFT('AJUSTE: ' + CAST(@nota AS VARCHAR(300)), 60);

      INSERT INTO inventario.movimiento (cantidad, motivo, referencia, fecha, id_sucursal, id_insumo, usuario_id)
      VALUES (@diferencia, 'AJUSTE', @referencia, SYSDATETIME(), @id_sucursal, @id_insumo, @id_usuario);
    END

    COMMIT TRANSACTION;
    SELECT @cantidad_real AS stock_actual, @diferencia AS diferencia;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-----------------------------------------------------------
-- 6. PROCEDIMIENTOS DE NOMINA (esquema nomina)

-- Crea un periodo de pago (el trigger nomina.tr_periodo_pago_traslape evita traslapes)
CREATE OR ALTER PROCEDURE nomina.sp_crear_periodo_pago
  @id_usuario INT,
  @fecha_inicio DATE,
  @fecha_fin DATE,
  @fecha_pago DATE,
  @id_periodo INT = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    EXEC seguridad.sp_asegurar_permiso @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,RRHH';

    IF @fecha_inicio IS NULL OR @fecha_fin IS NULL OR @fecha_pago IS NULL
      THROW 58001, 'Las tres fechas son obligatorias.', 1;
    IF @fecha_fin < @fecha_inicio
      THROW 58002, 'La fecha fin no puede ser anterior al inicio.', 1;
    IF @fecha_pago < @fecha_fin
      THROW 58003, 'La fecha de pago no puede ser anterior al fin del periodo.', 1;

    INSERT INTO nomina.periodo_pago (fecha_inicio, fecha_fin, fecha_pago, estado)
    VALUES (@fecha_inicio, @fecha_fin, @fecha_pago, 'PENDIENTE');

    SET @id_periodo = SCOPE_IDENTITY();
    SELECT @id_periodo AS id_periodo;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-- Genera la planilla de un periodo.
--  * @sucursal_id NULL = planilla general (todos los empleados activos con salario);
--    con valor = solo los empleados con asignacion activa en esa sucursal.
--  * Un periodo tiene una planilla general o planillas por sucursal, no ambas.
--  * Cada fila vigente de nomina.configuracion_deduccion se aplica como
--    base * porcentaje / 100. limite_base es un TOPE de la base (0 = sin tope).
--  * Se reconocen por nombre: 'ISSS', 'AFP' y 'RENTA'. La renta se calcula sobre
--    base_gravada = salario - ISSS - AFP. Cualquier otra deduccion se calcula sobre el bruto.
--  * La renta real usa tramos progresivos; con un solo porcentaje es una aproximacion.
--    Valida el calculo con la normativa vigente antes de usarlo en pagos reales.
--  * salario_bruto = empleado.salario_mensual (se asume un periodo mensual).

CREATE OR ALTER PROCEDURE nomina.sp_generar_planilla
    @id_usuario INT,
    @id_periodo INT,
    @sucursal_id INT = NULL,
    @id_planilla INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @estado_periodo VARCHAR(20),
        @fecha_inicio DATE,
        @fecha_fin DATE,
        @regla_version VARCHAR(60);

    BEGIN TRY

        -- 1. Validar permisos
        EXEC seguridad.sp_asegurar_permiso
            @id_usuario = @id_usuario,
            @roles_permitidos = 'ADMIN,RRHH',
            @id_sucursal = @sucursal_id;

        -- 2. Obtener informacion del periodo
        SELECT
            @estado_periodo = estado,
            @fecha_inicio = fecha_inicio,
            @fecha_fin = fecha_fin
        FROM nomina.periodo_pago
        WHERE id_periodo = @id_periodo;

        IF @estado_periodo IS NULL
            THROW 58010, 'El periodo no existe.', 1;

        IF @estado_periodo <> 'PENDIENTE'
            THROW 58011, 'Solo se puede generar planilla de periodos PENDIENTES.', 1;

        IF @sucursal_id IS NOT NULL
           AND NOT EXISTS (
               SELECT 1
               FROM catalogo.sucursal
               WHERE id_sucursal = @sucursal_id
                 AND activa = 1
           )
            THROW 58012, 'La sucursal no existe o esta inactiva.', 1;

        -- 3. Validar que no exista otra planilla
        IF @sucursal_id IS NULL
           AND EXISTS (
               SELECT 1
               FROM nomina.planilla
               WHERE id_periodo = @id_periodo
                 AND estado <> 'ANULADA'
           )
            THROW 58013, 'El periodo ya tiene planilla; la planilla general no puede coexistir con otras.', 1;

        IF @sucursal_id IS NOT NULL
           AND EXISTS (
               SELECT 1
               FROM nomina.planilla
               WHERE id_periodo = @id_periodo
                 AND estado <> 'ANULADA'
                 AND (sucursal_id IS NULL OR sucursal_id = @sucursal_id)
           )
            THROW 58014, 'El periodo ya tiene planilla general o planilla para esa sucursal.', 1;

        -- 4. Obtener empleados incluidos
        CREATE TABLE #empleado
        (
            id_empleado INT NOT NULL PRIMARY KEY,
            nombre VARCHAR(150) NOT NULL,
            salario DECIMAL(12,2) NOT NULL
        );

        INSERT INTO #empleado
            (id_empleado, nombre, salario)
        SELECT
            e.id_empleado,
            e.nombre,
            e.salario_mensual
        FROM rrhh.empleado AS e
        WHERE e.activo = 1
          AND e.salario_mensual IS NOT NULL
          AND (
              e.fecha_ingreso IS NULL
              OR e.fecha_ingreso <= @fecha_fin
          )
          AND (
              @sucursal_id IS NULL
              OR EXISTS (
                  SELECT 1
                  FROM rrhh.asignacion_sucursal AS a
                  WHERE a.id_empleado = e.id_empleado
                    AND a.id_sucursal = @sucursal_id
                    AND a.activa = 1
                    AND a.fecha_asignacion <= @fecha_fin
                    AND (
                        a.fecha_fin IS NULL
                        OR a.fecha_fin >= @fecha_inicio
                    )
              )
          );

        IF NOT EXISTS (SELECT 1 FROM #empleado)
            THROW 58015, 'No hay empleados activos con salario para incluir en la planilla.', 1;

        -- 5. Obtener configuraciones de deducciones vigentes
        CREATE TABLE #config
        (
            id_configuracion INT NOT NULL PRIMARY KEY,
            nombre VARCHAR(50) NOT NULL,
            porcentaje NUMERIC(5,2) NOT NULL,
            limite_base NUMERIC(12,2) NOT NULL,
            tipo VARCHAR(10) NOT NULL
        );

        INSERT INTO #config
            (id_configuracion, nombre, porcentaje, limite_base, tipo)
        SELECT
            c.id_configuracion,
            c.nombre,
            c.porcentaje,
            c.limite_base,
            CASE
                WHEN UPPER(c.nombre) LIKE 'RENTA%' THEN 'RENTA'
                WHEN UPPER(c.nombre) LIKE 'ISSS%' THEN 'ISSS'
                WHEN UPPER(c.nombre) LIKE 'AFP%' THEN 'AFP'
                ELSE 'OTRA'
            END
        FROM nomina.configuracion_deduccion AS c
        WHERE c.activo = 1
          AND c.fecha_inicio <= @fecha_fin
          AND (
              c.fecha_fin IS NULL
              OR c.fecha_fin >= @fecha_inicio
          );

        IF NOT EXISTS (SELECT 1 FROM #config)
            THROW 58016, 'No hay deducciones vigentes configuradas para el periodo.', 1;

        IF EXISTS (
            SELECT tipo
            FROM #config
            WHERE tipo <> 'OTRA'
            GROUP BY tipo
            HAVING COUNT(*) > 1
        )
            THROW 58017, 'Hay mas de una configuracion vigente de ISSS, AFP o RENTA; se descontaria doble.', 1;

        -- 6. Guardar version de las reglas aplicadas
        SELECT
            @regla_version = LEFT(
                'CFG:' +
                STRING_AGG(
                    CAST(id_configuracion AS VARCHAR(10)),
                    ','
                ) WITHIN GROUP (ORDER BY id_configuracion),
                60
            )
        FROM #config;

        BEGIN TRANSACTION;

        -- 7. Crear encabezado de planilla
        INSERT INTO nomina.planilla
        (
            fecha_generacion,
            total_bruto,
            total_deducciones,
            total_neto,
            estado,
            id_periodo,
            sucursal_id
        )
        VALUES
        (
            CAST(SYSDATETIME() AS DATE),
            0,
            0,
            0,
            'GENERADA',
            @id_periodo,
            @sucursal_id
        );

        SET @id_planilla = CONVERT(INT, SCOPE_IDENTITY());

        -- 8. Crear detalle por empleado
        INSERT INTO nomina.detalle_planilla
        (
            salario_bruto,
            salario_neto,
            total_deducciones,
            nombre_snapshot,
            regla_version,
            id_planilla,
            id_empleado
        )
        SELECT
            e.salario,
            e.salario,
            0,
            e.nombre,
            @regla_version,
            @id_planilla,
            e.id_empleado
        FROM #empleado AS e;

        -- 9. Calcular ISSS, AFP y otras deducciones
        INSERT INTO nomina.detalle_deduccion
        (
            concepto,
            base_calculo,
            porcentaje,
            monto_deduccion,
            id_configuracion,
            id_detalle_planilla
        )
        SELECT
            c.nombre,
            b.base,
            c.porcentaje,
            ROUND(b.base * c.porcentaje / 100, 2),
            c.id_configuracion,
            dp.id_detalle_planilla
        FROM nomina.detalle_planilla AS dp
        CROSS JOIN #config AS c
        CROSS APPLY (
            SELECT
                CASE
                    WHEN c.limite_base > 0
                         AND dp.salario_bruto > c.limite_base
                    THEN c.limite_base
                    ELSE dp.salario_bruto
                END AS base
        ) AS b
        WHERE dp.id_planilla = @id_planilla
          AND c.tipo <> 'RENTA';

        -- 10. Calcular ISSS, AFP y base gravada
        UPDATE dp
        SET
            dp.isss = COALESCE(x.isss, 0),
            dp.afp = COALESCE(x.afp, 0),
            dp.base_gravada =
                dp.salario_bruto
                - COALESCE(x.isss, 0)
                - COALESCE(x.afp, 0)
        FROM nomina.detalle_planilla AS dp
        OUTER APPLY (
            SELECT
                SUM(
                    CASE
                        WHEN c.tipo = 'ISSS'
                        THEN dd.monto_deduccion
                    END
                ) AS isss,
                SUM(
                    CASE
                        WHEN c.tipo = 'AFP'
                        THEN dd.monto_deduccion
                    END
                ) AS afp
            FROM nomina.detalle_deduccion AS dd
            JOIN #config AS c
                ON c.id_configuracion = dd.id_configuracion
            WHERE dd.id_detalle_planilla = dp.id_detalle_planilla
        ) AS x
        WHERE dp.id_planilla = @id_planilla;

        -- 11. Calcular renta sobre la base gravada
        INSERT INTO nomina.detalle_deduccion
        (
            concepto,
            base_calculo,
            porcentaje,
            monto_deduccion,
            id_configuracion,
            id_detalle_planilla
        )
        SELECT
            c.nombre,
            b.base,
            c.porcentaje,
            ROUND(b.base * c.porcentaje / 100, 2),
            c.id_configuracion,
            dp.id_detalle_planilla
        FROM nomina.detalle_planilla AS dp
        CROSS JOIN #config AS c
        CROSS APPLY (
            SELECT
                CASE
                    WHEN c.limite_base > 0
                         AND dp.base_gravada > c.limite_base
                    THEN c.limite_base
                    ELSE dp.base_gravada
                END AS base
        ) AS b
        WHERE dp.id_planilla = @id_planilla
          AND c.tipo = 'RENTA'
          AND dp.base_gravada > 0;

        -- 12. Calcular renta, deducciones y salario neto
        UPDATE dp
        SET
            dp.renta = COALESCE(t.renta, 0),
            dp.total_deducciones = COALESCE(t.total, 0),
            dp.salario_neto =
                dp.salario_bruto - COALESCE(t.total, 0)
        FROM nomina.detalle_planilla AS dp
        OUTER APPLY (
            SELECT
                SUM(dd.monto_deduccion) AS total,
                SUM(
                    CASE
                        WHEN c.tipo = 'RENTA'
                        THEN dd.monto_deduccion
                    END
                ) AS renta
            FROM nomina.detalle_deduccion AS dd
            JOIN #config AS c
                ON c.id_configuracion = dd.id_configuracion
            WHERE dd.id_detalle_planilla = dp.id_detalle_planilla
        ) AS t
        WHERE dp.id_planilla = @id_planilla;

        -- 13. Actualizar totales de planilla
        UPDATE p
        SET
            p.total_bruto = s.bruto,
            p.total_deducciones = s.deducciones,
            p.total_neto = s.neto
        FROM nomina.planilla AS p
        CROSS APPLY (
            SELECT
                SUM(salario_bruto) AS bruto,
                SUM(total_deducciones) AS deducciones,
                SUM(salario_neto) AS neto
            FROM nomina.detalle_planilla
            WHERE id_planilla = p.id_planilla
        ) AS s
        WHERE p.id_planilla = @id_planilla;

        COMMIT TRANSACTION;

        -- 14. Devolver resultado de planilla
        SELECT
            p.id_planilla,
            p.estado,
            p.total_bruto,
            p.total_deducciones,
            p.total_neto,
            (
                SELECT COUNT(*)
                FROM nomina.detalle_planilla
                WHERE id_planilla = p.id_planilla
            ) AS empleados
        FROM nomina.planilla AS p
        WHERE p.id_planilla = @id_planilla;

    END TRY
    BEGIN CATCH

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END;
GO

-- Anula una planilla que aun no se pago (permite generarla de nuevo)
CREATE OR ALTER PROCEDURE nomina.sp_anular_planilla
  @id_usuario INT,
  @id_planilla INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @estado VARCHAR(20), @sucursal_id INT;

  BEGIN TRY
    BEGIN TRAN;

    SELECT @estado = estado, @sucursal_id = sucursal_id
    FROM nomina.planilla WITH (UPDLOCK, HOLDLOCK)
    WHERE id_planilla = @id_planilla;

    IF @estado IS NULL
      THROW 58030, 'La planilla no existe.', 1;

    EXEC seguridad.sp_asegurar_permiso
      @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,RRHH', @id_sucursal = @sucursal_id;

    IF @estado NOT IN ('BORRADOR', 'GENERADA')
      THROW 58031, 'Solo se pueden anular planillas en BORRADOR o GENERADA.', 1;

    UPDATE nomina.planilla SET estado = 'ANULADA' WHERE id_planilla = @id_planilla;
    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

-----------------------------------------------------------
-- 7. REPORTES (esquema reportes)

-- Ventas (pedidos ENTREGADOS) por sucursal y tipo de pedido. Un usuario que no es ADMIN
-- ve solo su sucursal.
CREATE OR ALTER PROCEDURE reportes.sp_ventas_por_sucursal
  @id_usuario INT,
  @desde DATE,
  @hasta DATE,
  @id_sucursal INT = NULL
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @rol VARCHAR(20), @id_empleado INT;

  EXEC seguridad.sp_asegurar_permiso
    @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE',
    @id_empleado = @id_empleado OUTPUT, @rol = @rol OUTPUT;

  IF @rol <> 'ADMIN'
    SELECT @id_sucursal = id_sucursal FROM seguridad.usuario WHERE id_usuario = @id_usuario;

  SELECT s.id_sucursal, s.nombre AS sucursal, p.tipo_pedido,
         COUNT(*) AS pedidos, SUM(p.total) AS total_vendido
  FROM ventas.pedido AS p
  JOIN catalogo.sucursal AS s ON s.id_sucursal = p.id_sucursal
  WHERE p.estado = 'ENTREGADO'
    AND p.fecha >= @desde AND p.fecha < DATEADD(DAY, 1, @hasta)
    AND (@id_sucursal IS NULL OR p.id_sucursal = @id_sucursal)
  GROUP BY s.id_sucursal, s.nombre, p.tipo_pedido
  ORDER BY s.nombre, p.tipo_pedido;
END
GO

-- Productos mas vendidos en un rango de fechas
CREATE OR ALTER PROCEDURE reportes.sp_productos_mas_vendidos
  @id_usuario INT,
  @desde DATE,
  @hasta DATE,
  @id_sucursal INT = NULL,
  @top INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @rol VARCHAR(20), @id_empleado INT;

  EXEC seguridad.sp_asegurar_permiso
    @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE',
    @id_empleado = @id_empleado OUTPUT, @rol = @rol OUTPUT;

  IF @rol <> 'ADMIN'
    SELECT @id_sucursal = id_sucursal FROM seguridad.usuario WHERE id_usuario = @id_usuario;

  SELECT TOP (@top) pr.id_producto, pr.nombre AS producto,
         SUM(dp.cantidad) AS unidades_vendidas, SUM(dp.sub_total) AS total_vendido
  FROM ventas.detalle_pedido AS dp
  JOIN ventas.pedido AS p ON p.id_pedido = dp.id_pedido
  JOIN catalogo.producto AS pr ON pr.id_producto = dp.id_producto
  WHERE p.estado = 'ENTREGADO'
    AND p.fecha >= @desde AND p.fecha < DATEADD(DAY, 1, @hasta)
    AND (@id_sucursal IS NULL OR p.id_sucursal = @id_sucursal)
  GROUP BY pr.id_producto, pr.nombre
  ORDER BY SUM(dp.cantidad) DESC;
END
GO

-- Resumen de un turno: ventas por metodo de pago, cuadres parciales y diferencia de cierre
CREATE OR ALTER PROCEDURE reportes.sp_resumen_turno
  @id_usuario INT,
  @id_turno INT
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @id_sucursal INT, @id_empleado INT, @rol VARCHAR(20);

  SELECT @id_sucursal = c.id_sucursal
  FROM caja.turno_caja AS t
  JOIN caja.caja AS c ON c.id_caja = t.id_caja
  WHERE t.id_turno = @id_turno;

  IF @id_sucursal IS NULL
    THROW 59001, 'El turno no existe.', 1;

  EXEC seguridad.sp_asegurar_permiso
    @id_usuario = @id_usuario, @roles_permitidos = 'ADMIN,GERENTE',
    @id_sucursal = @id_sucursal, @id_empleado = @id_empleado OUTPUT, @rol = @rol OUTPUT;

  SELECT t.id_turno, e.nombre AS cajero, c.numero_caja, t.fecha_inicio, t.fecha_cierre,
         t.monto_inicial, t.monto_esperado, t.monto_cierre, t.diferencia,
         COALESCE(SUM(CASE WHEN pc.metodo_pago = 'EFECTIVO' THEN pc.monto_total END), 0) AS total_efectivo,
         COALESCE(SUM(CASE WHEN pc.metodo_pago = 'TARJETA'  THEN pc.monto_total END), 0) AS total_tarjeta,
         COALESCE(SUM(CASE WHEN pc.metodo_pago = 'DIGITAL'  THEN pc.monto_total END), 0) AS total_digital,
         (SELECT COUNT(*) FROM caja.cuadre_parcial WHERE id_turno = t.id_turno) AS cuadres_parciales
  FROM caja.turno_caja AS t
  JOIN caja.caja AS c ON c.id_caja = t.id_caja
  JOIN rrhh.empleado AS e ON e.id_empleado = t.id_empleado
  LEFT JOIN caja.pago_caja AS pc ON pc.id_turno = t.id_turno
  WHERE t.id_turno = @id_turno
  GROUP BY t.id_turno, e.nombre, c.numero_caja, t.fecha_inicio, t.fecha_cierre,
           t.monto_inicial, t.monto_esperado, t.monto_cierre, t.diferencia;
END
GO