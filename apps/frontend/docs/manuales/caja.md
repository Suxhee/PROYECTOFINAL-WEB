# Manual: Caja

1. Entra a Caja. Verifica que el estado coincida con Navbar.
2. Selecciona un cajero activo y escribe el fondo inicial (por ejemplo $50).
3. Abre el turno. Comprueba que el resumen muestre $50 de efectivo esperado y $0 en los otros medios si no hay ventas.
4. Introduce los montos contados de efectivo, tarjeta y digital (en USD).
5. Si existe una diferencia en cualquier medio, escribe la observación; confirma el cierre.
6. Comprueba el estado cerrado y el resumen del último cierre.

Pruebas: monto negativo, ausencia de cajero, cierre con conteo faltante,
diferencias compensadas entre métodos (requieren observación igualmente),
error de resumen (no permite cerrar), y error de estado (no permite abrir).
Modo demo: los datos desaparecen al recargar. Caja ofrece un servicio para
recibir ventas simuladas, pendiente de ser consumido por POS.
Modo real: requiere el backend, la sucursal y las autorizaciones acordadas.


## Contrato de integración con POS (modo demo)

POS debe consultar `useCajaEstado` y utilizar el ID del turno vigente cuando
`abierta === true`, sin carga ni error. Debe dejar de usar su turno ficticio
independiente y bloquear el cobro cuando no exista un turno abierto.

Tras validar el pago y las existencias, antes de confirmar la venta simulada,
POS debe llamar una sola vez y esperar el resultado de este servicio:

```js
import { registrarVentaCajaSimulada } from '../../api/caja.js';

await registrarVentaCajaSimulada({
  turnoId: venta.cajaId,
  total: venta.total,
  metodoPago: venta.pago.metodoPago,
});
```

Los medios admitidos son `efectivo`, `tarjeta` y `digital`. Se usa el total
neto de la venta, no el monto entregado por el cliente antes del cambio.
Si el servicio rechaza el ingreso, POS no debe confirmar la venta ni aplicar
sus cambios de existencias. POS debe evitar confirmaciones duplicadas; este
mock no ofrece idempotencia ni persistencia.

Prueba manual conjunta (cuando POS consuma el servicio): abrir con $50, vender
$10 en efectivo, $20 en tarjeta y $5 en digital. Volver a Caja: se esperan
$60, $20 y $5 respectivamente. Cerrar y comprobar que POS no permita otro cobro.

En modo real no se debe llamar este servicio simulado. El backend de ventas
es responsable de validar el turno y actualizar ventas, existencias e ingresos
de caja de manera transaccional, sin una segunda petición de ingreso desde POS.
