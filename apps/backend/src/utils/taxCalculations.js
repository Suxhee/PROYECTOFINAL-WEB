export const IVA_RATE = 0.13;

export function calculateIva(subtotal) {
  const value = Number(subtotal);
  if (!Number.isFinite(value) || value < 0) throw new RangeError('Subtotal must be a non-negative number.');
  return Number((value * IVA_RATE).toFixed(2));
}

export function calculateTotals(subtotal) {
  const base = Number(subtotal);
  const iva = calculateIva(base);
  return { subtotal: Number(base.toFixed(2)), iva, total: Number((base + iva).toFixed(2)) };
}
