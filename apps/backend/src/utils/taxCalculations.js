export const IVA = 0.13;

export function calculateIva(subtotal) {
  const value = Number(subtotal);
  if (!Number.isFinite(value) || value < 0) throw new RangeError('El subtotal debe ser un número no negativo.');
  return Number((value * IVA).toFixed(2));
}

export function calculateTotals(subtotal) {
  const base = Number(subtotal);
  const iva = calculateIva(base);
  return { subtotal: Number(base.toFixed(2)), iva, total: Number((base + iva).toFixed(2)) };
}
