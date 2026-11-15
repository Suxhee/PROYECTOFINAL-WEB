export const esCorreoValido = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
export const esDuiValido = (value) => /^\d{8}-\d$/.test(String(value));
export const esNitValido = (value) => /^\d{4}-\d{6}-\d{3}-\d$/.test(String(value));
export const esNumeroValido = (value) => value !== '' && Number.isFinite(Number(value));
