# Alertas preventivas del módulo de compras

## 1. Objetivo

Incorporar reglas de negocio preventivas que permitan apoyar
la toma de decisiones durante el abastecimiento y la gestión
de obligaciones financieras del restaurante Orígenes SV.

## 2. Arquitectura

La lógica de negocio se encuentra separada de los componentes
de React para facilitar su mantenimiento, reutilización y
verificación mediante pruebas unitarias.

Archivos involucrados:

- src/utils/alertasCompras.js
- src/pages/compras/FacturaCompra.jsx
- src/pages/compras/CuentasPorPagar.jsx
- tests/alertas-compras.test.js

## 3. Reglas preventivas implementadas

### RP01. Posible exceso de inventario

Se genera una advertencia cuando las existencias proyectadas
superan tres veces el stock mínimo del insumo.

Cantidad adquirida = paquetes × unidades por paquete.

Stock proyectado = stock actual + cantidad adquirida.

Umbral preventivo = stock mínimo × 3.

La advertencia no impide registrar la compra.

### RP02. Abastecimiento insuficiente

Se genera una advertencia cuando las existencias proyectadas
continúan por debajo del stock mínimo después de la compra.

### RP03. Cantidad recomendada de compra

Se calcula la cantidad faltante para alcanzar el stock mínimo.

Cantidad faltante = max(0, stock mínimo - stock actual).

Paquetes recomendados = ceil(cantidad faltante / unidades
por paquete).

La recomendación se presenta como información de apoyo.

### RP04. Posibles compras duplicadas

Pendiente de implementación.

Requiere consultar órdenes de compra pendientes de recepción.

No se consideran las facturas pendientes de pago como órdenes
pendientes de recepción, debido a que representan conceptos
diferentes.

### RP05. Incremento de precios

Se compara el costo unitario actual con el costo unitario
de la última compra registrada comparable.

Costo unitario = costo por paquete / unidades por paquete.

Incremento porcentual = ((precio actual - precio anterior)
 / precio anterior) × 100.

Se genera una advertencia cuando el incremento es igual
o superior al 10 %.

Criterios de comparación:

- Mismo proveedor.
- Mismo insumo.
- Misma sucursal.
- Compra registrada.
- Fecha anterior o igual a la nueva compra.
- Costos unitarios antes del IVA.

Cuando no existe historial comparable, no se genera alerta.

El historial local se actualiza después de registrar una compra.

### RP06. Próximos vencimientos

Se identifican las facturas pendientes de pago cuya fecha
límite se encuentra entre el día actual y los próximos
siete días naturales.

Clasificación:

- Rojo: factura que vence hoy.
- Amarillo: factura que vence entre uno y siete días.

Las facturas vencidas mantienen su clasificación existente
en la tabla de cuentas por pagar.

Las alertas se ordenan según su urgencia.

## 4. Configuración

Los parámetros se centralizan en CONFIG_ALERTAS_COMPRAS:

- Factor de exceso de inventario: 3.
- Porcentaje de incremento de precio: 10 %.
- Días de anticipación de vencimiento: 7.

Estos valores son propuestas iniciales de diseño y pueden
ajustarse según las necesidades del restaurante.

## 5. Tecnologías y conceptos aplicados

- JavaScript ES Modules.
- React.
- Reactstrap.
- useState.
- useEffect.
- Programación asíncrona.
- Manejo de excepciones.
- Funciones reutilizables.
- Manipulación de arreglos.
- Operador spread.
- Renderizado condicional.
- Pruebas unitarias con node:test.
- Aserciones con node:assert/strict.

## 6. Pruebas realizadas

### Pruebas manuales

- Proyección de existencias.
- Detección de exceso de inventario.
- Detección de abastecimiento insuficiente.
- Recomendaciones de cantidades.
- Validación de cantidades inválidas.
- Comparación de precios unitarios.
- Comparación de compras históricas.
- Actualización del historial local.
- Detección de próximos vencimientos.
- Ordenamiento de alertas.
- Diseño responsivo.
- Regresión de funcionalidades anteriores.

Resultados satisfactorios según las comprobaciones manuales
realizadas por el desarrollador.

### Pruebas automatizadas

Archivo: tests/alertas-compras.test.js

Comando de ejecución:

    node --test tests/alertas-compras.test.js

Resultado reportado:

- Total: 22.
- Aprobadas: 22.
- Fallidas: 0.

### Compilación

Comando:

    npm run build

Resultado reportado: compilación satisfactoria.

## 7. Limitaciones actuales

- El módulo utiliza datos simulados.
- Las existencias no se actualizan realmente al registrar compras.
- La persistencia depende de la futura integración con el backend.
- La sucursal utilizada es provisionalmente la número 1.
- Las unidades por paquete deben corresponder a la unidad
  de medida del insumo.
- El umbral de exceso no representa una capacidad máxima
  real de almacenamiento.
- No se consideran predicciones de demanda futura.
- No se han implementado abonos parciales.
- No existe actualización automática de vencimientos al
  cambiar de día.
- No se envían notificaciones externas.
- La detección de órdenes pendientes de recepción continúa
  bloqueada por la disponibilidad del backend.

## 8. Valor agregado

Las funcionalidades preventivas permiten transformar el
módulo de compras en una herramienta de apoyo a la toma
de decisiones, proporcionando información sobre posibles
excesos de inventario, necesidades de abastecimiento,
incrementos de costos y obligaciones financieras próximas.

Las alertas se basan en reglas de negocio deterministas
y no utilizan modelos de inteligencia artificial.