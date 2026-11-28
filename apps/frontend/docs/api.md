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
<<<<<<< Updated upstream

## Caja y RRHH — propuesta de contrato para revisión del equipo

Las rutas base documentadas arriba se mantienen. El ZIP solo expone GET
`/cash-register/status` y GET `/payroll/employees` (ambas responden 501).
Las demás rutas y los campos siguientes son propuestas, no endpoints confirmados.
La capa `src/api/mode.js` selecciona el transporte; `client.js` solo hace HTTP.
Con `VITE_USE_MOCK=false`, un error HTTP se muestra y nunca se sustituye por mocks.

| Método | Ruta | Solicitud / respuesta esperada |
|---|---|---|
| GET | `/cash-register/status` | `{ abierta, caja: { id, cajeroId, cajeroNombre, estado, montoInicial, fechaApertura } o null, ultimoCierre? }` |
| POST | `/cash-register/open` | `{ cajeroId, montoInicial }` → estado actualizado |
| GET | `/cash-register/summary` | `{ efectivoEsperado, tarjetaEsperada, digitalEsperado }`, efectivo incluye fondo inicial |
| POST | `/cash-register/close` | `{ turnoId, efectivoContado, tarjetaContada, digitalContado, observacion }` → cierre con diferencias calculadas por servidor |
| GET | `/payroll/employees` | Array de empleados |
| POST | `/payroll/employees` | `{ nombre, dui, cargo, salarioMensual, fechaIngreso, activo }` → empleado con id |
| PUT | `/payroll/employees/:id` | Cambios de empleado; `{ activo:false }` para baja lógica (acordar si se usa PATCH) |
| POST | `/payroll/periods` | `{ anio, mes, quincena }` → planilla completa |
| GET | `/payroll/periods` | Array de `{ id, periodo, fechaGeneracion, totalLiquido }` |
| GET | `/payroll/periods/:id` | Planilla completa |

Planilla completa: `{ id, periodo, fechaGeneracion, totalLiquido, empleados: [{ id, nombre, salarioQuincenal, isss, afp, renta, liquidoPagar }] }`.
El backend actual usa `branchId`, `fullName`, `active` en su modelo Employee;
acordar serialización y campos restantes antes de implementar el contrato. No se
ha inventado una sucursal por defecto. Quedan pendientes contexto de sucursal,
autenticación, autorización de RRHH, persistencia, transacciones, validación de
turnos y cálculo definitivo. El POS deberá volver a consultar el estado/resumen
tras una venta registrada por el backend. No se simula una venta real.
=======
>>>>>>> Stashed changes
