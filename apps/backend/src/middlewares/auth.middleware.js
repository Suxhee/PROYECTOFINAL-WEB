export function requireAuthentication(_req, res) {
  return res.status(501).json({ message: 'Autenticación no está habilitada; este endpoint no está disponible.' });
}
