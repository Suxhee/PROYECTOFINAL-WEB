# Caja y RRHH

Caja: apertura con fondo inicial, movimientos y cierre con saldo esperado,
saldo contado y diferencia. RRHH: empleado asociado a sucursal, planilla por
período y boleta de pago. Los cálculos de nómina requieren revisión legal y
contable antes de producción.

## RRHH — implementación frontend

Gestión de empleados, baja lógica, planilla quincenal, boletas imprimibles e historial.
Para probar en modo demostración, copiar `apps/frontend/.env.example` a `apps/frontend/.env`, mantener `VITE_USE_MOCK=true` e iniciar `npm run dev --workspace=origenes-sv-frontend`. Abrir `/rrhh`. Los datos son ficticios y se reinician al recargar. No introducir datos reales.

## Simulación de planilla

Salario mensual / 2, ISSS 3% (tope ilustrativo de $500 por quincena), AFP 7.25%,
y renta sobre salario después de cotizaciones, usando los tramos quincenales del
Decreto Ejecutivo 10, de 30/04/2025:
https://www.transparenciafiscal.gob.sv/downloads/pdf/700-DGII-DC-2025-01.pdf

La simulación es para probar la interfaz. No contempla deducciones especiales,
recálculos de junio/diciembre, topes AFP, horas extra, vacaciones, bajas históricas,
prorrateos, ni cambios de ley. No acredita cumplimiento fiscal. Se marca la
planilla y boleta como simuladas. El backend debe entregar resultados definitivos.

## Pruebas de RRHH

`npm test --workspace=origenes-sv-frontend`. Ver manual de RRHH y propuesta de contrato en `docs/api.md`. El backend real sigue pendiente.
