const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(
  path,
  { method = 'GET', body, headers = {}, ...options } = {}
) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(body === undefined
        ? {}
        : { body: JSON.stringify(body) }),
      ...options,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new Error(
      'No se pudo establecer comunicación con el servidor.'
    );
  }

  const contentType = response.headers.get('content-type') || '';

  let data;

  try {
    data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
  } catch {
    throw new Error(
      `No se pudo interpretar la respuesta del servidor (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Error HTTP ${response.status}`
    );
  }

  return data;
}

export const get = (path, options) =>
  request(path, options);

export const post = (path, body, options) =>
  request(path, { ...options, method: 'POST', body });

export const put = (path, body, options) =>
  request(path, { ...options, method: 'PUT', body });

export const del = (path, options) =>
  request(path, { ...options, method: 'DELETE' });

export { request };