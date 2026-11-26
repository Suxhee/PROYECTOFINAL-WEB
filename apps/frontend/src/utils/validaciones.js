export const esCorreoValido = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));

export const esDuiValido = (value) =>
  /^\d{8}-\d$/.test(String(value));

export const esNitValido = (value) =>
  /^\d{4}-\d{6}-\d{3}-\d$/.test(String(value));

export const esNumeroValido = (value) =>
  (typeof value === 'number' || typeof value === 'string') &&
  String(value).trim() !== '' &&
  Number.isFinite(Number(value));

export const esCampoRequerido = (value) =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== '';

export const esTelefonoValido = (value) =>
  /^\d{8}$/.test(String(value).trim());

export const esNumeroPositivo = (value) =>
  esNumeroValido(value) && Number(value) > 0;