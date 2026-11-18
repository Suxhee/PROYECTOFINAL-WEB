export function notFoundHandler(_req, res) {
  return res.status(404).json({ message: 'Recurso no encontrado.' });
}

export function errorHandler(error, _req, res, _next) {
  console.error('Unhandled request error:', error);
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
  return res.status(status).json({ message: status === 500 ? 'Error interno del servidor.' : error.message });
}
