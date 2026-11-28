import test from 'node:test';
import assert from 'node:assert/strict';
import { seleccionarApi, usarMock } from '../src/api/mode.js';
import { listarEmpleadosMock, crearEmpleadoMock, actualizarEmpleadoMock, generarPlanillaMock, listarPlanillasMock, obtenerPlanillaMock, rentaQuincenalMock, calcularDetalleMock } from '../src/mocks/empleados.js';
test('selección explícita y sin fallback real', async () => {
  assert.equal(usarMock({VITE_USE_MOCK:'true'}), true);
  assert.equal(usarMock({VITE_USE_MOCK:'false'}), false);
  const real = async () => { throw new Error('HTTP 501'); };
  assert.equal(await seleccionarApi(real, () => 42, true)(), 42);
  await assert.rejects(seleccionarApi(real, () => 42, false)(), /501/);
});
test('empleados: altas, DUI duplicado, edición y baja lógica', () => {
  const datos = {nombre:'Empleado de prueba',dui:'12345678-9',cargo:'cajero',salarioMensual:600,fechaIngreso:'2025-01-01'};
  const e = crearEmpleadoMock(datos);
  assert.throws(() => crearEmpleadoMock(datos), /DUI/);
  assert.equal(actualizarEmpleadoMock(e.id,{salarioMensual:700}).salarioMensual,700);
  assert.equal(actualizarEmpleadoMock(e.id,{activo:false}).activo,false);
  assert.equal(listarEmpleadosMock().find(x=>x.id===e.id).activo,false);
});
test('tabla de renta, deducciones y planilla histórica inmutable', () => {
  assert.equal(rentaQuincenalMock(275),0);
  assert.equal(rentaQuincenalMock(300),11.33);
  assert.equal(rentaQuincenalMock(500),40.48);
  assert.equal(rentaQuincenalMock(1100),168.57);
  const detalle = calcularDetalleMock({id:1,nombre:'Prueba',salarioMensual:600});
  assert.deepEqual([detalle.salarioQuincenal,detalle.isss,detalle.afp,detalle.renta,detalle.liquidoPagar],[300,9,21.75,0,269.25]);
  const p = generarPlanillaMock({anio:2025,mes:7,quincena:1});
  assert.equal(p.empleados.length,3);
  assert.equal(listarPlanillasMock()[0].id,p.id);
  assert.throws(() => generarPlanillaMock({anio:2025,mes:7,quincena:1}), /Ya existe/);
  actualizarEmpleadoMock(1,{salarioMensual:900});
  assert.equal(obtenerPlanillaMock(p.id).empleados[0].salarioQuincenal,300);
  assert.throws(() => obtenerPlanillaMock('inexistente'), /no encontrada/);
});
