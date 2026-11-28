# Caja y RRHH

## Alcance de esta rama

Se mantienen las páginas, rutas y organización existentes. Caja consulta estado,
abre turno con cajero activo y fondo inicial, muestra cuadre por efectivo,
tarjeta y digital (Bitcoin/Chivo Wallet), exige observación si hay diferencias
y muestra el último cierre. Navbar y Caja consumen el mismo estado mediante
`useCajaEstado`. RRHH gestiona empleados, baja lógica, planilla quincenal,
boletas imprimibles e historial.

## Modo de demostración

Desde la raíz, ejecutar `npm install`, copiar `apps/frontend/.env.example` a
`apps/frontend/.env` y mantener `VITE_USE_MOCK=true`. Iniciar solo el frontend:
`npm run dev --workspace=origenes-sv-frontend`. Abrir `/caja` o `/rrhh`.
Los datos son ficticios, en memoria y se reinician al recargar la pestaña.
El historial se conserva al cambiar de pantalla, no entre sesiones.
No introducir datos reales de empleados. El mock de caja parte del fondo inicial;
no registra ventas POS ni simula transacciones de pagos digitales.

`api/mode.js` contiene el mecanismo común propuesto para revisión de Brandon;
solo se adoptó en las API de Caja y RRHH. No hay fallback ante errores HTTP.

## Simulación de planilla

Salario mensual / 2, ISSS 3% (tope ilustrativo de $500 por quincena), AFP 7.25%,
y renta sobre salario después de cotizaciones, usando los tramos quincenales del
Decreto Ejecutivo 10, de 30/04/2025:
https://www.transparenciafiscal.gob.sv/downloads/pdf/700-DGII-DC-2025-01.pdf

La simulación es para probar la interfaz. No contempla deducciones especiales,
recálculos de junio/diciembre, topes AFP, horas extra, vacaciones, bajas históricas,
prorrateos, ni cambios de ley. No acredita cumplimiento fiscal. Se marca la
planilla y boleta como simuladas. El backend debe entregar resultados definitivos.

## Pruebas

`npm test --workspace=origenes-sv-frontend` ejecuta pruebas Node sin dependencias
externas de lógica de mocks y selección de transporte. Casos: turno duplicado,
cajero incorrecto, conteo y observaciones, DUI duplicado, edición, baja lógica,
tramos de renta, historial y planilla duplicada. Revisar manuales para pruebas UI.

## Pendientes de integración

- Aprobar contrato en docs/api.md con Brandon y backend; rutas actuales responden 501.
- Implementar y probar backend real, persistencia, control de sucursal y permisos.
- Coordinar con Michelle la actualización de totales de caja al registrar ventas.
- Validar nómina con contabilidad, y probar el flujo completo con VITE_USE_MOCK=false.
- No se modificaron los módulos de compras, inventario ni POS. Se conserva el POS del develop nuevo, que mantiene su propio estado simulado de caja; todavía no está conectado al turno de este módulo.
