# Pruebas funcionales: Historial de compras y cuentas por pagar

## Información general

- Proyecto: ERP/POS Restaurante Orígenes SV.
- Módulo: Compras y Proveedores.
- Fecha: 26/11/2026.
- Rama: feature/compras-proveedores.
- Entorno: Desarrollo local.
- Fuente de datos: Mocks.
- Tipo de pruebas: Manuales.

## Objetivo

Verificar el funcionamiento del historial de compras,
los filtros, el cálculo de cuentas por pagar y la
identificación de facturas vencidas.

## Resultados

| ID | Prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-01 | Columnas del historial | Información completa | Aprobada |
| CP-02 | Filtro por proveedor | Compras del proveedor seleccionado | Aprobada |
| CP-03 | Filtro por estado | Compras pagadas o pendientes | Aprobada |
| CP-04 | Filtros combinados | Coincidencias de ambos filtros | Aprobada |
| CP-05 | Cuentas pendientes | Exclusión de compras pagadas | Aprobada |
| CP-06 | Saldo pendiente | Total de factura pendiente | Aprobada |
| CP-07 | Deuda total | Suma correcta de saldos | Aprobada |
| CP-08 | Facturas vencidas | Identificación mediante fecha límite | Aprobada |
| CP-09 | Vencimiento actual | Factura todavía pendiente | Aprobada |
| CP-10 | Compra al contado | Deuda sin modificaciones | Aprobada |
| CP-11 | Diseño responsivo | Adaptación a diferentes pantallas | Aprobada |
| CP-12 | Consola del navegador | Sin errores de ejecución | Aprobada |
| CP-13 | Compilación | Generación correcta de dist | Aprobada |

## Escenarios de prueba

### Estado inicial

- Deuda total: $113.00.
- Facturas pendientes: 1.
- Facturas vencidas: 0.

### Registro de factura vencida FAC-V001

- Total de factura: $45.20.
- Deuda total: $158.20.
- Facturas pendientes: 2.
- Facturas vencidas: 1.

### Registro de factura FAC-V002 con vencimiento actual

- Total de factura: $45.20.
- Deuda total: $203.40.
- Facturas pendientes: 3.
- Facturas vencidas: 1.

### Registro de compra al contado FAC-C001

- Total de factura: $113.00.
- Deuda total: $203.40.
- Facturas pendientes: 3.
- Facturas vencidas: 1.

## Resumen de resultados

- Pruebas realizadas: 13.
- Pruebas aprobadas: 13.
- Pruebas fallidas al finalizar: 0.
- Porcentaje de aprobación: 100%.

## Verificaciones adicionales

- Compilación mediante npm run build.
- Revisión de archivos mediante git status --short.
- Verificación de cambios mediante git diff --check.

## Limitaciones

- Las pruebas utilizan datos simulados.
- Los registros no persisten al recargar la aplicación.
- No se gestionan abonos parciales ni pagos a proveedores.
- La integración con el backend y SQL Server está pendiente.
- Las reglas de vencimiento deben confirmarse con el equipo.

## Conclusión

El historial de compras y las cuentas por pagar cumplen
las funcionalidades evaluadas en el entorno simulado.
El módulo queda preparado para continuar con la
integración de los servicios reales del backend.