const moneyFormatter = new Intl.NumberFormat('es-SV', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat('es-SV', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export const formatearMoneda = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '—';
  }

  const amount = Number(value);

  return Number.isFinite(amount)
    ? moneyFormatter.format(amount)
    : '—';
};

export const formatearFecha = (value) => {
  if (!value) return '—';

  const date = typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : dateFormatter.format(date);
};