# Integración del módulo de Compras y Proveedores

## Estado actual

Fecha de revisión: 26/11/2026.

El frontend cuenta con las funcionalidades de proveedores,
registro de compras, historial y cuentas por pagar.

Actualmente funciona mediante datos simulados.

## Endpoints requeridos

Las siguientes rutas constituyen una propuesta de integración
que deberá confirmarse con el equipo del backend.

| Método | Ruta | Función |
|---|---|---|
| GET | /api/providers | Listar proveedores |
| POST | /api/providers | Registrar proveedor |
| PUT | /api/providers/:id | Actualizar proveedor |
| GET | /api/purchases | Listar compras |
| POST | /api/purchases | Registrar compra |

## Estado del backend

- GET /api/purchases devuelve HTTP 501.
- POST /api/purchases no está implementado.
- No existen rutas de proveedores en app.js.
- El modelo Purchase es una estructura inicial.
- Los modelos de proveedores, detalles, facturas y pagos
  todavía no están registrados.

## Requisitos de integración

- Confirmar los nombres definitivos de los endpoints.
- Acordar las estructuras JSON de solicitudes y respuestas.
- Adaptar los modelos a los esquemas de SQL Server.
- Validar proveedores activos.
- Validar facturas duplicadas.
- Calcular subtotal, IVA y total en el servidor.
- Registrar compras y detalles mediante transacciones.
- Actualizar las existencias de inventario.
- Gestionar el estado de pago de las facturas.
- Confirmar el mecanismo de autenticación.
- Confirmar la identificación de la sucursal activa.

## Reglas pendientes de confirmación

- Numeración de facturas de proveedores.
- Condición de pago al contado o al crédito.
- Aplicación del IVA del 13%.
- Cálculo de saldos considerando abonos parciales.
- Identificación de facturas vencidas.

## Referencias del repositorio

- Frontend de compras: commit 94aedc4.
- Rama develop: commit 8b69a11.
- Rama B/Sofia: commit 169658b.

## Conclusión

La integración real está bloqueada por la disponibilidad
de los servicios del backend.

Se mantendrá el modo simulado activo hasta disponer
de endpoints funcionales y contratos de datos confirmados.