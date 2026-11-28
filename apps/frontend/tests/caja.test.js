import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoCajaMock, abrirCajaMock, resumenCajaMock, cerrarCajaMock } from '../src/mocks/caja.js';

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
