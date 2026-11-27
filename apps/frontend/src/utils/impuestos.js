export const TASA_IVA = 0.13;
export function calcularTotales(subtotal, incluirIVA = true) {
  const base = Number(subtotal);
  if (!Number.isFinite(base) || base < 0) throw new RangeError('El subtotal debe ser un número no negativo.');
  const iva = incluirIVA ? Number((base * TASA_IVA).toFixed(2)) : 0;
  return { subtotal: Number(base.toFixed(2)), iva, total: Number((base + iva).toFixed(2)) };
}
