// existencias simuladas de los insumos
export const insumosPOS = [
  { id: 1, nombre: 'Cafe', unidad: 'g', stock: 180 },
  { id: 2, nombre: 'Leche', unidad: 'ml', stock: 1000 },
  { id: 3, nombre: 'Vasos', unidad: 'unidad', stock: 20 },
  { id: 4, nombre: 'Tapaderas', unidad: 'unidad', stock: 20 },
  { id: 5, nombre: 'Etiquetas', unidad: 'unidad', stock: 20 },
  { id: 6, nombre: 'Agua', unidad: 'ml', stock: 3000 }
];

// recetas simuladas de los productos
export const recetasPOS = [
  // latte grande
  { productoId: 1, insumoId: 1, cantidad: 18 },
  { productoId: 1, insumoId: 2, cantidad: 250 },
  { productoId: 1, insumoId: 3, cantidad: 1 },
  { productoId: 1, insumoId: 4, cantidad: 1 },
  { productoId: 1, insumoId: 5, cantidad: 1 },

  // cappuccino
  { productoId: 2, insumoId: 1, cantidad: 18 },
  { productoId: 2, insumoId: 2, cantidad: 150 },
  { productoId: 2, insumoId: 3, cantidad: 1 },
  { productoId: 2, insumoId: 4, cantidad: 1 },
  { productoId: 2, insumoId: 5, cantidad: 1 },

  // americano
  { productoId: 3, insumoId: 1, cantidad: 18 },
  { productoId: 3, insumoId: 6, cantidad: 200 },
  { productoId: 3, insumoId: 3, cantidad: 1 },
  { productoId: 3, insumoId: 4, cantidad: 1 },
  { productoId: 3, insumoId: 5, cantidad: 1 },

  // espresso
  { productoId: 4, insumoId: 1, cantidad: 18 },
  { productoId: 4, insumoId: 6, cantidad: 30 },
  { productoId: 4, insumoId: 3, cantidad: 1 },
  { productoId: 4, insumoId: 4, cantidad: 1 },
  { productoId: 4, insumoId: 5, cantidad: 1 }
];

// existencias de productos empacados
export const empacadosPOS = [
  { productoId: 16, stock: 10 }
];

// estado simulado de la caja
export const cajaPOS = {
  id: 1,
  estado: 'abierta'
};