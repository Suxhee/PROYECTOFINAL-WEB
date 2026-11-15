const moneyFormatter = new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' });
const dateFormatter = new Intl.DateTimeFormat('es-SV');
export const formatearMoneda = (value) => moneyFormatter.format(Number(value) || 0);
export const formatearFecha = (value) => dateFormatter.format(new Date(value));
