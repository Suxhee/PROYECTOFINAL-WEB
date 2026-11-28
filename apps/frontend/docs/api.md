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
