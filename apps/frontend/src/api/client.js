// Cliente HTTP compartido: las páginas usan los servicios de api/ en lugar de llamar a fetch directamente.

// Ruta base de las peticiones; usa /api si no se configura otra.
const API_URL = import.meta.env?.VITE_API_URL || '/api';

// Centraliza métodos HTTP, encabezados y serialización del cuerpo.
async function request(path, { method = 'GET', body, headers = {}, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...options,
  });
  // Interpreta la respuesta como JSON o texto según su encabezado.
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  // Propaga el error HTTP para que la interfaz pueda mostrarlo.
  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }
  return data;
}

// Atajos para los métodos HTTP utilizados por los módulos.
export const get = (path, options) => request(path, options);
export const post = (path, body, options) => request(path, { ...options, method: 'POST', body });
export const put = (path, body, options) => request(path, { ...options, method: 'PUT', body });
export const del = (path, options) => request(path, { ...options, method: 'DELETE' });
export { request };
