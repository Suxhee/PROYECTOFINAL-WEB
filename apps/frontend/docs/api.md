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
