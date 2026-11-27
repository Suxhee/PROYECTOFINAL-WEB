# Pruebas funcionales del registro de compras

Fecha: 26 de noviembre de 2026.

Rama: feature/compras-proveedores.

Entorno: frontend con VITE_USE_MOCK=true.

## Validaciones del formulario

| Prueba | Resultado |
|---|---|
| Formulario vacío | Aprobada |
| Proveedor obligatorio | Aprobada |
| Número de factura obligatorio | Aprobada |
| Crédito sin fecha límite | Aprobada |
| Fecha límite incorrecta | Aprobada |
| Insumo obligatorio | Aprobada |
| Cantidad negativa | Aprobada |
| Cantidad decimal | Aprobada |
| Unidades iguales a cero | Aprobada |
| Costo negativo | Aprobada |
| Costo con tres decimales | Aprobada |
| Formulario válido | Aprobada |

Resultado: 12 de 12 pruebas aprobadas.

## Pruebas funcionales

| Prueba | Resultado |
|---|---|
| Registrar compra al contado | Aprobada |
| Rechazar factura duplicada | Aprobada |
| Visualizar compra en historial | Aprobada |
| Registrar compra al crédito | Aprobada |
| Registrar compra con varios insumos | Aprobada |
| Misma factura con otro proveedor | Aprobada |
| Persistencia al cambiar de pestaña | Aprobada |
| Reinicio de datos al recargar | Aprobada |
| Revisión de consola | Aprobada |
| Compilación del frontend | Aprobada |

Resultado: 10 de 10 pruebas aprobadas.

## Herramientas utilizadas

- Navegador web.
- Herramientas de desarrollo del navegador.
- Git Bash.
- Vite.
- npm run build.
- git status --short.
- git diff --check.

## Conclusión

El registro de compras funciona correctamente en el
entorno simulado para los escenarios evaluados.

Las pruebas fueron realizadas manualmente.

Quedan pendientes las pruebas de integración con el
backend, SQL Server y el módulo de inventario.