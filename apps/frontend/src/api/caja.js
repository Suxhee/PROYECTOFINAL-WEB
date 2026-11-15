import { get, post } from './client.js';
export const obtenerEstadoCaja = () => get('/cash-register/status');
export const abrirCaja = (datos) => post('/cash-register/open', datos);
export const cerrarCaja = (datos) => post('/cash-register/close', datos);
