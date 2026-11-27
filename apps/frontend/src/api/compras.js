import { get, post, put } from './client.js';
import { mockProveedores } from '../mocks/proveedores.js';
import { compras as mockCompras } from '../mocks/compras.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let proveedores = mockProveedores.map((proveedor) => ({
  ...proveedor,
}));

let registrosCompras = mockCompras.map((compra) => ({
  ...compra,
  detalles: compra.detalles.map((detalle) => ({ ...detalle })),
}));

const esperar = () =>
  new Promise((resolve) => setTimeout(resolve, 300));

// Servicios de compras
// Listar compras
export const listarCompras = async () => {
  if (USE_MOCK) {
    await esperar();

    return registrosCompras.map((compra) => ({
      ...compra,
      detalles: compra.detalles.map((detalle) => ({ ...detalle })),
    }));
  }

  return get('/purchases');
};

// Registrar compra
export const crearCompra = async (compra) => {
  if (USE_MOCK) {
    await esperar();

    const proveedor = proveedores.find(
      (item) => item.id === Number(compra.proveedorId) && item.activo
    );

    if (!proveedor) {
      throw new Error('El proveedor no existe o está inactivo.');
    }

    const numeroFactura = compra.numeroFactura.trim();

    const facturaDuplicada = registrosCompras.some(
      (item) =>
        item.proveedorId === proveedor.id &&
        item.numeroFactura.toUpperCase() === numeroFactura.toUpperCase()
    );

    if (facturaDuplicada) {
      throw new Error(
        'El número de factura ya está registrado para este proveedor.'
      );
    }

    const detalles = compra.detalles.map((detalle) => ({
      insumoId: Number(detalle.insumoId),
      cantidadPaquete: Number(detalle.cantidadPaquete),
      unidadesPaquete: Number(detalle.unidadesPaquete),
      costoPaquete: Number(detalle.costoPaquete),
      subtotal:
        Math.round(
          Number(detalle.cantidadPaquete) *
          Number(detalle.costoPaquete) * 100
        ) / 100,
    }));

    const subtotal =
      Math.round(
        detalles.reduce(
          (acumulado, detalle) => acumulado + detalle.subtotal,
          0
        ) * 100
      ) / 100;

    const iva = Math.round(subtotal * 0.13 * 100) / 100;

    const total = Math.round((subtotal + iva) * 100) / 100;

    const nuevaCompra = {
      id: Math.max(
        0,
        ...registrosCompras.map((item) => item.id)
      ) + 1,
      proveedorId: proveedor.id,
      proveedor: proveedor.compania,
      sucursalId: Number(compra.sucursalId),
      numeroFactura,
      fecha: compra.fecha,
      condicionPago: compra.condicionPago,
      fechaLimite:
        compra.condicionPago === 'CREDITO'
          ? compra.fechaLimite
          : null,
      estado: 'REGISTRADA',
      subtotal,
      iva,
      total,
      pagada: compra.condicionPago === 'CONTADO',
      detalles,
    };

    registrosCompras = [...registrosCompras, nuevaCompra];

    return {
      ...nuevaCompra,
      detalles: nuevaCompra.detalles.map(
        (detalle) => ({ ...detalle })
      ),
    };
  }

  return post('/purchases', compra);
};

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