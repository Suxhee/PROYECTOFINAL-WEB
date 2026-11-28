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
Modo demo: los datos desaparecen al recargar y no hay ventas POS conectadas.
Modo real: requiere el backend, la sucursal y las autorizaciones acordadas.
