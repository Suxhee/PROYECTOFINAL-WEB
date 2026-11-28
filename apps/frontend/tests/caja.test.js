import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoCajaMock, abrirCajaMock, resumenCajaMock, cerrarCajaMock, registrarVentaCajaMock } from '../src/mocks/caja.js';

import { registrarVentaCajaSimulada } from '../src/api/caja.js';

test('apertura, validación de cajero, cierre y cuadre por medio', () => {
  assert.equal(estadoCajaMock().abierta,false);
  assert.throws(() => abrirCajaMock({cajeroId:2,montoInicial:50}), /inválido/);
  assert.throws(() => abrirCajaMock({cajeroId:1,montoInicial:-1}), /inválido/);
  const { caja } = abrirCajaMock({cajeroId:1,montoInicial:50});
  assert.equal(estadoCajaMock().abierta,true);
  assert.throws(() => abrirCajaMock({cajeroId:1,montoInicial:50}), /abierto/);
  assert.deepEqual(resumenCajaMock(), {efectivoEsperado:50,tarjetaEsperada:0,digitalEsperado:0});
  const cierre = {turnoId:caja.id,efectivoContado:49,tarjetaContada:1,digitalContado:0};
  assert.throws(() => cerrarCajaMock(cierre), /Explica/);
  assert.throws(() => cerrarCajaMock({...cierre,turnoId:99,observacion:'Prueba'}), /cambió/);
  const resultado = cerrarCajaMock({...cierre,observacion:'Prueba de diferencias'});
  assert.equal(resultado.diferenciaEfectivo,-1);
  assert.equal(resultado.diferenciaTarjeta,1);
  assert.equal(resultado.diferenciaTotal,0);
  assert.equal(estadoCajaMock().abierta,false);
  assert.throws(resumenCajaMock,/No hay/);
});

// Simula lo que enviará POS al confirmar una venta en el turno vigente.
test('ingresos POS simulados: validación de turno y cuadre por medio', () => {
  assert.throws(() => registrarVentaCajaMock({turnoId:1,total:10,metodoPago:'efectivo'}), /No hay/);
  const { caja } = abrirCajaMock({cajeroId:1,montoInicial:50});
  const registrar = (total, metodoPago, turnoId = caja.id) => registrarVentaCajaMock({turnoId,total,metodoPago});
  assert.throws(() => registrar(10,'efectivo',caja.id + 1), /cambió/);
  assert.throws(() => registrar(-1,'efectivo'), /inválido/);
  assert.throws(() => registrar(0.001,'efectivo'), /inválido/);
  assert.throws(() => registrar(NaN,'efectivo'), /inválido/);
  assert.throws(() => registrar(10,'otro'), /inválido/);
  assert.deepEqual(resumenCajaMock(), {efectivoEsperado:50,tarjetaEsperada:0,digitalEsperado:0});
  registrar(10.10,'efectivo');
  registrar(0.20,'efectivo');
  registrar(20,'tarjeta');
  const resumen = registrar(5,'digital');
  assert.deepEqual(resumen, {efectivoEsperado:60.30,tarjetaEsperada:20,digitalEsperado:5});
  resumen.efectivoEsperado = 0;
  assert.equal(resumenCajaMock().efectivoEsperado,60.30);
  const cierre = cerrarCajaMock({turnoId:caja.id,efectivoContado:60.30,tarjetaContada:20,digitalContado:5});
  assert.equal(cierre.diferenciaTotal,0);
  assert.throws(() => registrar(10,'efectivo'), /No hay/);
});

test('el servicio de ingreso simulado no se ejecuta en modo real', async () => {
  // Node no define VITE_USE_MOCK: el modo predeterminado es real.
  await assert.rejects(registrarVentaCajaSimulada({turnoId:1,total:10,metodoPago:'efectivo'}), /API de ventas/);
});
