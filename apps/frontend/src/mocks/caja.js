// Simulación de Caja en memoria. No registra ventas reales ni guarda datos en la base de datos.

import { empleadosMock } from './empleados.js';
// Estado del turno y montos esperados por cada medio de pago.
export const cajaEstadoMock = { abierta: false, caja: null };
export const cajaResumenMock = { efectivoEsperado: 0, tarjetaEsperada: 0, digitalEsperado: 0 };
let siguienteId = 1;
let ultimoCierre = null;
// Devuelve copias para evitar cambios accidentales desde la interfaz.
const copia = (obj) => structuredClone(obj);
// Trabaja con centavos enteros para comparar montos sin errores de redondeo.
const centavos = (n) => Math.round(n * 100);
const montoValido = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && Number.isSafeInteger(centavos(n));
export const estadoCajaMock = () => copia({ ...cajaEstadoMock, ultimoCierre });
// Solo permite abrir un turno con un cajero activo y un monto válido.
export function abrirCajaMock({ cajeroId, montoInicial }) {
  if (cajaEstadoMock.abierta) throw new Error('Ya existe un turno abierto.');
  const cajero = empleadosMock.find(e => e.id === Number(cajeroId) && e.activo && e.cargo === 'cajero');
  if (!cajero || !montoValido(montoInicial)) throw new Error('Cajero o monto inicial inválido.');
  cajaEstadoMock.abierta = true;
  cajaEstadoMock.caja = { id: siguienteId++, estado: 'abierta', cajeroId: cajero.id, cajeroNombre: cajero.nombre, montoInicial: centavos(montoInicial)/100, fechaApertura: new Date().toISOString() };
  // Al abrir, el efectivo esperado corresponde al fondo inicial; no hay pagos registrados.
  Object.assign(cajaResumenMock, { efectivoEsperado: cajaEstadoMock.caja.montoInicial, tarjetaEsperada: 0, digitalEsperado: 0 });
  return estadoCajaMock();
}
// Devuelve el resumen únicamente cuando existe un turno abierto.
export function resumenCajaMock() {
  if (!cajaEstadoMock.abierta) throw new Error('No hay turno abierto.');
  return copia(cajaResumenMock);
}
// Acumula una venta simulada ya validada por POS en el turno vigente.
export function registrarVentaCajaMock({ turnoId, total, metodoPago } = {}) {
  if (!cajaEstadoMock.abierta) throw new Error('No hay turno abierto.');
  if (turnoId !== cajaEstadoMock.caja.id) throw new Error('El turno cambió; actualiza el estado.');
  const campos = {
    efectivo: 'efectivoEsperado',
    tarjeta: 'tarjetaEsperada',
    digital: 'digitalEsperado',
  };
  if (!Object.hasOwn(campos, metodoPago)) throw new Error('Método de pago inválido.');
  if (!montoValido(total) || centavos(total) <= 0) throw new Error('Total de venta inválido.');
  const campo = campos[metodoPago];
  // Se suma el total de la venta, no el efectivo recibido antes del cambio.
  const acumulado = centavos(cajaResumenMock[campo]) + centavos(total);
  if (!Number.isSafeInteger(acumulado)) throw new Error('Monto acumulado fuera de rango.');
  cajaResumenMock[campo] = acumulado / 100;
  return resumenCajaMock();
}
// Valida que el cierre corresponda al turno actual.
export function cerrarCajaMock({ turnoId, efectivoContado, tarjetaContada, digitalContado, observacion = '' }) {
  const esperado = resumenCajaMock();
  if (turnoId !== cajaEstadoMock.caja.id) throw new Error('El turno cambió; actualiza el estado.');
  const conteos = [efectivoContado, tarjetaContada, digitalContado];
  if (!conteos.every(montoValido)) throw new Error('Los conteos deben ser montos no negativos.');
  // Compara los montos contados con los esperados por medio de pago.
  const diferencias = conteos.map((n,i) => (centavos(n) - centavos(Object.values(esperado)[i])) / 100);
  if (diferencias.some(n => n !== 0) && !observacion.trim()) throw new Error('Explica las diferencias antes del cierre.');
  // Conserva el resumen del último cierre antes de limpiar el turno activo.
  ultimoCierre = { ...cajaEstadoMock.caja, estado: 'cerrada', fechaCierre: new Date().toISOString(), ...esperado, efectivoContado, tarjetaContada, digitalContado, diferenciaEfectivo: diferencias[0], diferenciaTarjeta: diferencias[1], diferenciaDigital: diferencias[2], diferenciaTotal: diferencias.reduce((s,n) => s + centavos(n), 0)/100, observacion };
  cajaEstadoMock.abierta = false;
  cajaEstadoMock.caja = null;
  return copia(ultimoCierre);
}
