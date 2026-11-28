// Punto común para seleccionar el transporte. No hay fallback en modo real.
// Lee VITE_USE_MOCK del .env; solo el texto "true" activa los datos simulados.
export const usarMock = (env = import.meta.env) => env?.VITE_USE_MOCK === 'true';
// Devuelve una función, no ejecuta una petición al importar el módulo.
export function seleccionarApi(real, simulado, modo = usarMock()) {
  // El mock se envuelve en una función asíncrona para mantener el mismo uso con await.
  return modo ? async (...args) => simulado(...args) : real;
}

// Permite a las páginas mostrar una advertencia cuando trabajan con mocks.
export const modoDemostracion = usarMock();
