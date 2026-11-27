# Contrato inicial del API

Prefijo local: `/api`. Los recursos pueden requerir autenticación y contexto de
sucursal al incorporarse. Respuestas de error previstas: `{ "message": "..." }`.

| Método | Ruta | Uso |
|---|---|---|
| GET, POST | `/sales` | Consultar y registrar ventas |
| GET, POST, PUT, DELETE | `/inventory` | Gestionar insumos |
| GET, POST | `/purchases` | Consultar y registrar compras |
| GET | `/cash-register/status` | Estado de caja |
| POST | `/cash-register/open`, `/cash-register/close` | Apertura y cierre |
| GET, POST | `/payroll/employees` | Consultar y registrar empleados |

Este contrato es una guía de integración, no una API de producción completa.

## Gestión de proveedores

Actualmente, el módulo de proveedores funciona mediante
datos simulados (mocks), debido a que los endpoints del
backend están pendientes de implementación.

### Servicios disponibles en el frontend

| Servicio | Descripción |
|---|---|
| listarProveedores() | Obtiene los proveedores registrados. |
| crearProveedor(datos) | Registra un proveedor. |
| actualizarProveedor(id, datos) | Actualiza un proveedor existente. |

### Estructura provisional de un proveedor

- id: identificador único.
- compania: nombre de la compañía.
- nombreContacto: nombre del contacto.
- correo: correo electrónico.
- telefono: número telefónico.
- direccion: dirección del proveedor.
- activo: estado del proveedor.

### Validaciones

- Compañía obligatoria, máximo 50 caracteres.
- Contacto obligatorio, máximo 50 caracteres.
- Correo válido y único, máximo 50 caracteres.
- Teléfono opcional de ocho dígitos.
- Dirección opcional, máximo 100 caracteres.
- Estado activo por defecto.

### Consideraciones de integración

Los campos se definieron tomando como referencia la tabla
proveedor del script database/01_tables.sql de la rama
B/Sofia.

Los nombres de las propiedades JSON y los endpoints
deberán confirmarse con el equipo de backend.

Los datos simulados se almacenan en memoria y se
restablecen al recargar la aplicación.

## Registro de compras

### Servicios implementados

| Función | Método HTTP | Endpoint |
|---|---|---|
| listarCompras() | GET | /purchases |
| crearCompra(compra) | POST | /purchases |

Los servicios funcionan actualmente mediante datos simulados
cuando VITE_USE_MOCK=true.

Los endpoints reales están pendientes de integración con el backend.

### Datos requeridos para registrar una compra

- proveedorId: identificador del proveedor.
- sucursalId: identificador de la sucursal.
- numeroFactura: número de factura.
- fecha: fecha de compra.
- condicionPago: CONTADO o CREDITO.
- fechaLimite: fecha límite de pago o null.
- detalles: arreglo de insumos adquiridos.

Cada detalle contiene:

- insumoId.
- cantidadPaquete.
- unidadesPaquete.
- costoPaquete.

### Reglas de negocio

- El proveedor debe existir y estar activo.
- El número de factura es obligatorio.
- La fecha de compra es obligatoria.
- Una compra debe contener al menos un insumo.
- No se permiten insumos duplicados.
- Las cantidades deben ser enteros positivos.
- El costo debe ser positivo y tener máximo dos decimales.
- El número de factura no debe repetirse para un mismo proveedor.
- Las compras al crédito requieren una fecha límite de pago.
- La fecha límite no puede ser anterior a la fecha de compra.
- Las compras al contado se consideran pagadas.
- Las compras al crédito se consideran pendientes de pago.

### Cálculos monetarios

- Subtotal por detalle = cantidadPaquete * costoPaquete.
- Subtotal de compra = suma de subtotales.
- IVA = subtotal * 0.13.
- Total = subtotal + IVA.
- Saldo pendiente al contado = 0.
- Saldo pendiente al crédito = total.

Los importes se redondean a dos decimales.

### Manejo de errores

El formulario realiza validaciones antes de enviar los datos.

Las operaciones asíncronas utilizan async/await y
try/catch/finally para controlar los estados de carga,
éxito y error.

El botón de registro permanece deshabilitado mientras
se procesa la solicitud.

### Limitaciones actuales

- Los registros simulados se almacenan en memoria.
- Los registros nuevos se pierden al recargar la aplicación.
- Se utiliza provisionalmente sucursalId = 1.
- La integración con SQL Server está pendiente.
- La actualización automática del inventario está pendiente.
- Las reglas de numeración de facturas deben confirmarse.
- El contrato de la API está sujeto a cambios del backend.
- El servicio simulado no sustituye las validaciones del servidor.
- Se asume que los costos ingresados no incluyen IVA.
- No se gestionan abonos parciales en esta etapa.
- El resumen puede mostrar importes negativos durante
  la introducción de valores inválidos.

  ## Historial de compras y cuentas por pagar

### Historial de compras

El historial utiliza el servicio listarCompras(), asociado
al endpoint GET /purchases.

La información presentada incluye:

- Fecha de compra.
- Proveedor.
- Número de factura.
- Total de compra.
- Condición de pago.
- Estado de pago.

### Filtros disponibles

- Proveedor.
- Estado de pago: pagada o pendiente.

Ambos filtros pueden utilizarse simultáneamente.

### Cuentas por pagar

Las cuentas por pagar se obtienen mediante el filtrado
de las compras cuyo atributo pagada es false.

### Reglas de negocio

- Las compras al contado se consideran pagadas.
- Las compras al crédito se consideran pendientes.
- Las compras pagadas no forman parte de la deuda.
- El saldo pendiente corresponde al total de la factura
  mientras no existan abonos parciales.
- Una factura está vencida cuando su fecha límite es
  anterior a la fecha actual.
- Una factura que vence el día actual todavía se
  considera pendiente y no vencida.

### Indicadores

- Deuda total con proveedores.
- Cantidad de facturas pendientes.
- Cantidad de facturas vencidas.

### Cálculos

Saldo pendiente = Total de factura, si no está pagada.

Deuda total = Suma de los saldos pendientes.

Facturas pendientes = Cantidad de compras no pagadas.

Facturas vencidas = Cantidad de compras no pagadas
cuya fecha límite es anterior a la fecha actual.

### Limitaciones actuales

- Se utilizan datos simulados mediante mocks.
- Los registros nuevos se pierden al recargar la aplicación.
- No se gestionan abonos parciales.
- No se registran pagos a proveedores.
- La integración con el backend está pendiente.
- Las reglas de vencimiento deben confirmarse con el equipo.
