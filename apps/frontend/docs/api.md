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

## RRHH — propuesta de contrato para revisión del equipo

El backend de este ZIP solo implementa GET `/payroll/employees`, que responde 501. Las demás rutas y campos son propuestas pendientes de aprobación. `api/mode.js` selecciona el transporte sin fallback ante errores HTTP.

| Método | Ruta | Solicitud / respuesta esperada |
|---|---|---|
| GET | `/payroll/employees` | Array de empleados |
| POST | `/payroll/employees` | `{ nombre, dui, cargo, salarioMensual, fechaIngreso, activo }` → empleado con id |
| PUT | `/payroll/employees/:id` | Cambios de empleado; `{ activo:false }` para baja lógica (acordar si se usa PATCH) |
| POST | `/payroll/periods` | `{ anio, mes, quincena }` → planilla completa |
| GET | `/payroll/periods/:id` | Planilla completa |

Planilla completa: `{ id, periodo, fechaGeneracion, totalLiquido, empleados: [{ id, nombre, salarioQuincenal, isss, afp, renta, liquidoPagar }] }`.
El backend actual usa `branchId`, `fullName`, `active` en su modelo Employee;
acordar serialización y campos restantes antes de implementar el contrato. No se
ha inventado una sucursal por defecto. Quedan pendientes contexto de sucursal,
autenticación, autorización de RRHH, persistencia, transacciones, validación de
turnos y cálculo definitivo.
