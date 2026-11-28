import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calcularProyeccionStock,
  generarAlertasStock,
  calcularCantidadRecomendada,
  generarSugerenciasCompra,
  calcularCostoUnitario,
  buscarUltimaCompra,
  generarAlertasPrecio,
  calcularDiasParaVencimiento,
  obtenerProximosVencimientos,
} from '../src/utils/alertasCompras.js';

const insumo = {
  id: 1,
  nombre: 'Maíz',
  stock: 2,
  stockMinimo: 8,
  unidad: 'lb',
};

const detalle = {
  id: 1,
  insumoId: 1,
  cantidadPaquete: 1,
  unidadesPaquete: 4,
  costoPaquete: 8,
};

const compra = {
  id: 1,
  proveedorId: 1,
  sucursalId: 1,
  numeroFactura: 'FAC-001',
  fecha: '2026-11-20',
  estado: 'REGISTRADA',
  pagada: false,
  fechaLimite: '2026-12-04',
  detalles: [
    {
      insumoId: 1,
      cantidadPaquete: 5,
      unidadesPaquete: 10,
      costoPaquete: 8,
    },
  ],
};

test('Calcula correctamente el stock proyectado', () => {
  const resultado = calcularProyeccionStock(insumo, detalle);

  assert.equal(resultado.cantidadAdquirida, 4);
  assert.equal(resultado.stockProyectado, 6);
  assert.equal(resultado.umbralExceso, 24);
});

test('Detecta abastecimiento insuficiente', () => {
  const alertas = generarAlertasStock([insumo], [detalle]);

  assert.equal(alertas.length, 1);
  assert.equal(alertas[0].tipo, 'ABASTECIMIENTO_INSUFICIENTE');
});

test('Detecta exceso de inventario', () => {
  const alertas = generarAlertasStock(
    [insumo],
    [{ ...detalle, cantidadPaquete: 6 }]
  );

  assert.equal(alertas[0].tipo, 'EXCESO_STOCK');
});

test('No genera alerta al alcanzar exactamente el umbral', () => {
  const alertas = generarAlertasStock(
    [{ ...insumo, stock: 20 }],
    [detalle]
  );

  assert.equal(alertas.length, 0);
});

test('Rechaza cantidades negativas', () => {
  const resultado = calcularProyeccionStock(
    insumo,
    { ...detalle, cantidadPaquete: -1 }
  );

  assert.equal(resultado, null);
});

test('Rechaza cantidades por paquete iguales a cero', () => {
  const resultado = calcularProyeccionStock(
    insumo,
    { ...detalle, unidadesPaquete: 0 }
  );

  assert.equal(resultado, null);
});

test('Calcula los paquetes recomendados', () => {
  const resultado = calcularCantidadRecomendada(insumo, detalle);

  assert.equal(resultado.cantidadFaltante, 6);
  assert.equal(resultado.paquetesRecomendados, 2);
  assert.equal(resultado.cantidadRecomendada, 8);
});

test('No recomienda compras cuando el stock es suficiente', () => {
  const sugerencias = generarSugerenciasCompra(
    [{ ...insumo, stock: 10 }],
    [detalle]
  );

  assert.equal(sugerencias.length, 0);
});

test('Calcula correctamente el costo unitario', () => {
  assert.equal(
    calcularCostoUnitario({
      costoPaquete: 8,
      unidadesPaquete: 10,
    }),
    0.8
  );
});

test('Rechaza costos unitarios inválidos', () => {
  assert.equal(
    calcularCostoUnitario({
      costoPaquete: 8,
      unidadesPaquete: 0,
    }),
    null
  );
});

test('Encuentra una compra histórica comparable', () => {
  const resultado = buscarUltimaCompra(
    [compra], 1, 1, 1, '2026-11-27'
  );

  assert.equal(resultado.compra.numeroFactura, 'FAC-001');
});

test('Excluye compras de fechas posteriores', () => {
  const resultado = buscarUltimaCompra(
    [compra], 1, 1, 1, '2026-11-19'
  );

  assert.equal(resultado, null);
});

test('Detecta un incremento de precio del 25 por ciento', () => {
  const alertas = generarAlertasPrecio(
    [compra],
    [insumo],
    [{ ...detalle, unidadesPaquete: 10, costoPaquete: 10 }],
    1,
    1,
    '2026-11-27'
  );

  assert.equal(alertas.length, 1);
  assert.equal(alertas[0].tipo, 'INCREMENTO_PRECIO');
});

test('Detecta un incremento exactamente del 10 por ciento', () => {
  const alertas = generarAlertasPrecio(
    [compra],
    [insumo],
    [{ ...detalle, unidadesPaquete: 10, costoPaquete: 8.8 }],
    1,
    1,
    '2026-11-27'
  );

  assert.equal(alertas.length, 1);
});

test('No genera alerta por un incremento inferior al 10 por ciento', () => {
  const alertas = generarAlertasPrecio(
    [compra],
    [insumo],
    [{ ...detalle, unidadesPaquete: 10, costoPaquete: 8.4 }],
    1,
    1,
    '2026-11-27'
  );

  assert.equal(alertas.length, 0);
});

test('Calcula correctamente los días para el vencimiento', () => {
  assert.equal(
    calcularDiasParaVencimiento('2026-12-04', '2026-11-27'),
    7
  );
});

test('Detecta una factura que vence hoy', () => {
  assert.equal(
    calcularDiasParaVencimiento('2026-11-27', '2026-11-27'),
    0
  );
});

test('Rechaza fechas inexistentes', () => {
  assert.equal(
    calcularDiasParaVencimiento('2026-02-30', '2026-02-27'),
    null
  );
});

test('Incluye facturas que vencen dentro de siete días', () => {
  const resultado = obtenerProximosVencimientos(
    [compra],
    '2026-11-27'
  );

  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].diasRestantes, 7);
});

test('Excluye facturas pagadas', () => {
  const resultado = obtenerProximosVencimientos(
    [{ ...compra, pagada: true }],
    '2026-11-27'
  );

  assert.equal(resultado.length, 0);
});

test('Excluye facturas vencidas', () => {
  const resultado = obtenerProximosVencimientos(
    [{ ...compra, fechaLimite: '2026-11-26' }],
    '2026-11-27'
  );

  assert.equal(resultado.length, 0);
});

test('Excluye facturas que vencen después de siete días', () => {
  const resultado = obtenerProximosVencimientos(
    [{ ...compra, fechaLimite: '2026-12-05' }],
    '2026-11-27'
  );

  assert.equal(resultado.length, 0);
});