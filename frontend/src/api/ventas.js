import { get, post } from './client.js';
export const listarVentas = () => get('/sales');
export const crearVenta = (venta) => post('/sales', venta);
