import { get, post, put, del } from './client.js';
export const listarInsumos = () => get('/inventory');
export const crearInsumo = (insumo) => post('/inventory', insumo);
export const actualizarInsumo = (id, insumo) => put(`/inventory/${id}`, insumo);
export const eliminarInsumo = (id) => del(`/inventory/${id}`);
