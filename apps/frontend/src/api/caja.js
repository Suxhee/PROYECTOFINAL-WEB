// Servicio de Caja: cada operación usa la API real o su simulación según mode.js.

import { get, post } from './client.js';
import { seleccionarApi } from './mode.js';
import { estadoCajaMock, abrirCajaMock, resumenCajaMock, cerrarCajaMock, registrarVentaCajaMock } from '../mocks/caja.js';
// Consulta si hay un turno abierto y el último cierre disponible.
export const obtenerEstadoCaja = seleccionarApi(() => get('/cash-register/status'), estadoCajaMock);
// Envía el cajero responsable y el monto inicial del turno.
export const abrirCaja = seleccionarApi(datos => post('/cash-register/open', datos), abrirCajaMock);
// Consulta los montos esperados por cada medio de pago.
export const obtenerResumenCaja = seleccionarApi(() => get('/cash-register/summary'), resumenCajaMock);
// Envía los conteos y la observación para registrar el cierre.
export const cerrarCaja = seleccionarApi(datos => post('/cash-register/close', datos), cerrarCajaMock);

// Punto de integración para POS durante la demostración. En modo real, el
// backend de ventas debe actualizar caja en la misma transacción de la venta.
export const registrarVentaCajaSimulada = seleccionarApi(
  async () => { throw new Error('El ingreso real debe registrarse mediante la API de ventas.'); },
  registrarVentaCajaMock
);
