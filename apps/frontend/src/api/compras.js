import { get, post } from './client.js';
export const listarCompras = () => get('/purchases');
export const crearCompra = (compra) => post('/purchases', compra);
