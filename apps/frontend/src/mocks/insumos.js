
 // Datos iniciales de insumos para trabajar sin depender del backend.
 // Estos registros se utilizan cuando VITE_USE_MOCK está activado.
export const insumos = [
  {
    id: 1,
    branchId: 1, // Identificador de la sucursal a la que pertenece.
    name: 'Maíz',
    quantity: 25, // Existencia actual.
    minimumQuantity: 8, // Cantidad mínima antes de generar una alerta.
    unit: 'lb',
  },
  {
    id: 2,
    branchId: 1,
    name: 'Quesillo',
    quantity: 12,
    minimumQuantity: 5,
    unit: 'lb',
  },
  {
    id: 3,
    branchId: 1,
    name: 'Frijoles',
    quantity: 3,
    minimumQuantity: 5,
    unit: 'lb',
  },
];
