export const IVA = 0.13;

export function calcularTotales(carrito = []) {

  // sumar los importes de los productos
  const totalCentavos = carrito.reduce(
    (acumulado, item) =>
      acumulado + Math.round(item.precio * 100) * item.cantidad,
    0
  );

  // calcular el subtotal sin iva
  const subtotalCentavos = Math.round(
    totalCentavos / (1 + IVA)
  );

  // obtener el iva incluido en el precio
  const ivaCentavos = totalCentavos - subtotalCentavos;

  // devolver los importes en dolares
  return {
    subtotal: subtotalCentavos / 100,
    iva: ivaCentavos / 100,
    total: totalCentavos / 100
  };
}