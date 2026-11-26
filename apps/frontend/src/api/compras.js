import { get, post, put } from './client.js';
import { mockProveedores } from '../mocks/proveedores.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let proveedores = mockProveedores.map((proveedor) => ({
  ...proveedor,
}));

const esperar = () =>
  new Promise((resolve) => setTimeout(resolve, 300));

// Servicios de compras
export const listarCompras = () => get('/purchases');

export const crearCompra = (compra) => post('/purchases', compra);

// Listar proveedores
export const listarProveedores = async () => {
  if (USE_MOCK) {
    await esperar();

    return proveedores.map((proveedor) => ({
      ...proveedor,
    }));
  }

  throw new Error('Servicio de proveedores pendiente de integración.');
};

// Registrar proveedor
export const crearProveedor = async (proveedor) => {
  if (USE_MOCK) {
    await esperar();

    const correo = proveedor.correo.trim().toLowerCase();

    const existeCorreo = proveedores.some(
      (item) => item.correo.toLowerCase() === correo
    );

    if (existeCorreo) {
      throw new Error('El correo ya está registrado.');
    }

    const nuevoProveedor = {
      ...proveedor,
      id: Math.max(0, ...proveedores.map((item) => item.id)) + 1,
      correo,
      activo: proveedor.activo ?? true,
    };

    proveedores = [...proveedores, nuevoProveedor];

    return { ...nuevoProveedor };
  }

  throw new Error('Servicio de proveedores pendiente de integración.');
};

// Actualizar proveedor
export const actualizarProveedor = async (id, proveedor) => {
  if (USE_MOCK) {
    await esperar();

    const existeProveedor = proveedores.some(
      (item) => item.id === id
    );

    if (!existeProveedor) {
      throw new Error('Proveedor no encontrado.');
    }

    const correo = proveedor.correo.trim().toLowerCase();

    const existeCorreo = proveedores.some(
      (item) =>
        item.id !== id &&
        item.correo.toLowerCase() === correo
    );

    if (existeCorreo) {
      throw new Error('El correo ya está registrado.');
    }

    proveedores = proveedores.map((item) =>
      item.id === id
        ? { ...item, ...proveedor, id, correo }
        : item
    );

    return {
      ...proveedores.find((item) => item.id === id),
    };
  }

  throw new Error('Servicio de proveedores pendiente de integración.');
};